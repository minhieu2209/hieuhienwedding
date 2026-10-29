import "server-only";
import { databaseContext } from "./invitations";
import { InvitationError } from "./database";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const attempts = new Map<string, { count: number; until: number }>();
export function apiError(error: unknown) {
  const known = error instanceof InvitationError ? error : new InvitationError("unavailable");
  return Response.json({ error: known.code }, { status: known.status, headers: { "Cache-Control": "no-store", ...(known.status === 429 ? { "Retry-After": "600" } : {}) } });
}
async function body(request: Request): Promise<Record<string, unknown>> {
  const origin = request.headers.get("origin");
  if (origin) {
    // Next may use an internal hostname for request.url behind a reverse proxy.
    // The incoming Host header identifies the public same-origin destination.
    const host = request.headers.get("host") ?? new URL(request.url).host;
    try {
      const parsed = new URL(origin);
      if (parsed.host.toLowerCase() !== host.toLowerCase() || !["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch { throw new InvitationError("forbidden", 403); }
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new InvitationError("invalid_form", 400);
  const reader = request.body?.getReader();
  if (!reader) throw new InvitationError("invalid_form", 400);
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) { await reader.cancel(); throw new InvitationError("invalid_form", 413); }
    chunks.push(value);
  }
  const data = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(data));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch { throw new InvitationError("invalid_form", 400); }
}
function text(value: unknown, max: number, required = true) {
  if (value === undefined || value === null) { if (!required) return ""; throw new InvitationError("invalid_form", 400); }
  if (typeof value !== "string") throw new InvitationError("invalid_form", 400);
  const clean = value.trim();
  if ((required && clean.length === 0) || clean.length > max) throw new InvitationError("invalid_form", 400);
  return clean;
}
function rateLimit(request: Request, variantId: string, action: string) {
  const now = Date.now();
  for (const [key, item] of attempts) if (item.until <= now) attempts.delete(key);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 100) || "unknown";
  const key = `${variantId}:${action}:${ip}`;
  const entry = attempts.get(key) ?? { count: 0, until: now + 600_000 };
  if (entry.count >= 120 || attempts.size >= 10_000) throw new InvitationError("limited", 429);
  entry.count++; attempts.set(key, entry);
}

export async function submit(request: Request, variantId: string, action: "rsvp" | "wishes") {
  const input = await body(request);
  if (input.website) throw new InvitationError("invalid_form", 400);
  const submissionId = text(input.submission_id, 36);
  if (!uuid.test(submissionId)) throw new InvitationError("invalid_form", 400);
  const context = await databaseContext(variantId, { guest: text(input.guest, 100, false) });
  if (!context.published) throw new InvitationError("not_found", 404);
  if (!context.invitation.formsEnabled) throw new InvitationError("invalid_guest", 403);
  rateLimit(request, variantId, action);
  const { db, variant, guestId } = context;
  const metadata = { invitation_variant_id: variant.id, event_id: variant.event_id, host_side: variant.host_side, guest_id: guestId, submission_id: submissionId };
  const guestName = text(input.guest_name, 120);
  if (action === "rsvp") {
    if (input.attendance !== "yes" && input.attendance !== "no") throw new InvitationError("invalid_form", 400);
    const count = input.attendance === "no" ? 0 : input.guest_count;
    if (typeof count !== "number" || !Number.isInteger(count) || (input.attendance === "yes" && (count < 1 || count > 5))) throw new InvitationError("invalid_form", 400);
    const payload = { ...metadata, guest_name: guestName, phone: text(input.phone, 30, false) || null, attendance: input.attendance, guest_count: count, message: text(input.message, 2000, false) || null };
    // A personal token permits updating only that guest's response for this event.
    const result = guestId
      ? await db.from("wedding_rsvp").upsert(payload, { onConflict: "guest_id,event_id" })
      : await db.from("wedding_rsvp").insert(payload);
    if (result.error) {
      if (result.error.code !== "23505") throw new InvitationError("unavailable");
      const previous = await db.from("wedding_rsvp").select("id").eq("submission_id", submissionId).eq("invitation_variant_id", variant.id).maybeSingle();
      if (previous.error || !previous.data) throw new InvitationError("conflict", 409);
    }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  }
  const payload = { ...metadata, guest_name: guestName, message: text(input.message, 2000) };
  const fields = "id,guest_name,message,created_at";
  const result = await db.from("wedding_wishes").insert(payload).select(fields).single();
  if (!result.error) return Response.json({ wish: result.data }, { status: 201, headers: { "Cache-Control": "no-store" } });
  if (result.error.code !== "23505") throw new InvitationError("unavailable");
  const previous = await db.from("wedding_wishes").select(fields).eq("submission_id", submissionId).eq("invitation_variant_id", variant.id).maybeSingle();
  if (previous.error || !previous.data) throw new InvitationError("conflict", 409);
  return Response.json({ wish: previous.data }, { headers: { "Cache-Control": "no-store" } });
}

export async function listWishes(request: Request, variantId: string) {
  const context = await databaseContext(variantId);
  if (!context.published) throw new InvitationError("not_found", 404);
  const url = new URL(request.url);
  let query = context.db.from("wedding_wishes").select("id,guest_name,message,created_at").eq("host_side", context.variant.host_side).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(21);
  const encoded = url.searchParams.get("cursor");
  if (encoded) {
    if (encoded.length > 200) throw new InvitationError("invalid_form", 400);
    let cursor: { time: string; id: string };
    try {
      cursor = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
      if (typeof cursor.time !== "string" || !Number.isFinite(Date.parse(cursor.time)) || !/^\d{1,20}$/.test(String(cursor.id))) throw new Error();
    } catch { throw new InvitationError("invalid_form", 400); }
    query = query.or(`created_at.lt.${new Date(cursor.time).toISOString()},and(created_at.eq.${new Date(cursor.time).toISOString()},id.lt.${cursor.id})`);
  }
  const result = await query;
  if (result.error) throw new InvitationError("unavailable");
  const data = result.data.slice(0, 20);
  const last = data.at(-1);
  const next = result.data.length > 20 && last ? Buffer.from(JSON.stringify({ time: last.created_at, id: String(last.id) })).toString("base64url") : null;
  return Response.json({ wishes: data, next }, { headers: { "Cache-Control": "no-store" } });
}
