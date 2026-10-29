import "server-only";
import { createHash } from "node:crypto";
import { buildInvitation, chooseLocale, defaultCouple, firstParam, getCopy, getInvitation, type Copy, type Couple, type InvitationSearchParams } from "@/data/invitations";
import { findVariant, type Variant, type WeddingEvent } from "@/data/invitation-catalog";
import { getDatabase, InvitationError } from "./database";

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
function object(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function validCouple(value: unknown): value is Couple {
  if (!object(value)) return false;
  return ["groom", "bride"].every((key) => {
    const person = value[key];
    return object(person) && typeof person.firstName === "string" && typeof person.fullName === "string" && object(person.family) && ["father", "mother", "address", "title"].every((field) => typeof (person.family as Record<string, unknown>)[field] === "string");
  });
}
function validVariant(value: unknown, expectedId: string): value is Variant {
  if (!object(value)) return false;
  return value.id === expectedId && typeof value.path === "string" && ["groom", "bride"].includes(String(value.host_side)) && ["groom", "bride"].includes(String(value.first_person)) && typeof value.event_id === "string" && ["group", "individual", "fixed"].includes(String(value.recipient_mode)) && ["draft", "published", "paused"].includes(String(value.publication_status)) && Array.isArray(value.supported_locales) && value.supported_locales.length > 0 && value.supported_locales.every((locale) => ["vi", "ko"].includes(String(locale))) && value.supported_locales.includes(value.default_locale);
}
function validEvent(value: unknown): value is WeddingEvent {
  return object(value) && ["id", "venue", "address", "map_url", "starts_at"].every((key) => typeof value[key] === "string") && Number.isFinite(Date.parse(String(value.starts_at))) && ["wedding", "reception"].includes(String(value.event_kind)) && String(value.map_url).startsWith("https://");
}
function mergedCopy(base: Copy, value: unknown): Copy {
  if (!object(value) || !object(value.labels)) throw new InvitationError("configuration");
  const result = structuredClone(base);
  for (const key of Object.keys(result)) {
    if (key === "labels") continue;
    if (key === "weekdays") {
      if (!Array.isArray(value.weekdays) || value.weekdays.length !== 7 || !value.weekdays.every((day) => typeof day === "string")) throw new InvitationError("configuration");
      result.weekdays = value.weekdays as string[];
    } else {
      if (typeof value[key] !== "string") throw new InvitationError("configuration");
      Object.assign(result, { [key]: value[key] });
    }
  }
  for (const key of Object.keys(result.labels)) {
    const label = value.labels[key];
    if (typeof label !== "string") throw new InvitationError("configuration");
    Object.assign(result.labels, { [key]: label });
  }
  return result;
}

export async function databaseContext(pathOrId: string, query: InvitationSearchParams = {}) {
  const catalog = findVariant(pathOrId);
  if (!catalog) throw new InvitationError("not_found", 404);
  const db = getDatabase();
  if (!db) throw new InvitationError("unavailable");
  const profile = await db.from("wedding_invitation_variants").select("*").eq("id", catalog.id).maybeSingle();
  if (profile.error) throw new InvitationError("unavailable");
  if (!profile.data) throw new InvitationError("not_found", 404);
  if (!validVariant(profile.data, catalog.id)) throw new InvitationError("configuration");
  const variant = profile.data;
  const allowDraft = process.env.WEDDING_ALLOW_DRAFTS === "true";
  if (variant.publication_status === "paused" || (variant.publication_status !== "published" && !allowDraft)) throw new InvitationError("not_found", 404);
  const locale = chooseLocale(variant, query.lang);
  const [eventResult, copyResult, settingsResult, reviews] = await Promise.all([
    db.from("wedding_events").select("*").eq("id", variant.event_id).single(),
    db.from("wedding_invitation_contents").select("content,review_status").eq("invitation_variant_id", variant.id).eq("locale", locale).single(),
    db.from("wedding_settings").select("couple").eq("id", true).single(),
    db.from("wedding_invitation_contents").select("locale,review_status").eq("invitation_variant_id", variant.id),
  ]);
  if (eventResult.error || copyResult.error || settingsResult.error || reviews.error) throw new InvitationError("unavailable");
  if (!validEvent(eventResult.data) || !validCouple(settingsResult.data?.couple)) throw new InvitationError("configuration");
  const allApproved = variant.supported_locales.every((language) => reviews.data?.some((record: { locale: string; review_status: string }) => record.locale === language && record.review_status === "approved"));
  if ((!allApproved || copyResult.data.review_status !== "approved") && !allowDraft) throw new InvitationError("not_found", 404);
  const copy = mergedCopy(getCopy(variant.id, locale), copyResult.data.content);
  const rawToken = firstParam(query.guest) ?? "";
  let guestId: string | null = null;
  let recipientName = "";
  if (variant.recipient_mode === "individual" && tokenPattern.test(rawToken)) {
    const hash = createHash("sha256").update(rawToken).digest("hex");
    const guest = await db.from("wedding_guests").select("id,display_name").eq("invitation_variant_id", variant.id).eq("invite_token_hash", hash).eq("is_active", true).maybeSingle();
    if (guest.error) throw new InvitationError("unavailable");
    if (guest.data && typeof guest.data.id === "string" && typeof guest.data.display_name === "string") {
      guestId = guest.data.id;
      recipientName = guest.data.display_name;
    }
  }
  const published = variant.publication_status === "published" && allApproved;
  const formsEnabled = published && (variant.recipient_mode !== "individual" || Boolean(guestId));
  return {
    db, variant, guestId, published,
    invitation: buildInvitation(variant, eventResult.data, locale, {
      copy, couple: settingsResult.data.couple ?? defaultCouple, recipientName,
      guestToken: guestId ? rawToken : "", formsEnabled, wishesEnabled: published,
      invalidGuest: variant.recipient_mode === "individual" && Boolean(rawToken) && !guestId,
    }),
  };
}

export async function resolveInvitation(path: string, query: InvitationSearchParams = {}) {
  if (!findVariant(path)) return null;
  if (!getDatabase()) return getInvitation(path, firstParam(query.khach), query.lang);
  try { return (await databaseContext(path, query)).invitation; }
  catch (error) {
    if (error instanceof InvitationError && error.status === 404) return null;
    console.error("wedding_database_unavailable", error instanceof InvitationError ? error.code : "unexpected");
    // Preserve the right event and language if the database is unavailable.
    // Guest names are never guessed from an unverified URL parameter in DB mode.
    return getInvitation(path, undefined, query.lang);
  }
}
