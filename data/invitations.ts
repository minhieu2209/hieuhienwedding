import { weddingData } from "./wedding";
import records from "./invitation-copy.json";
import { events, findVariant, type Locale, type Side, type Variant, type WeddingEvent } from "./invitation-catalog";

export type Copy = (typeof records)[number]["content"];
export type InvitationSearchParams = Record<string, string | string[] | undefined>;
export const firstParam = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;
export const chooseLocale = (variant: Variant, value?: string | string[]): Locale => {
  const candidate = firstParam(value);
  return variant.supported_locales.includes(candidate as Locale) ? candidate as Locale : variant.default_locale;
};
export function getCopy(id: string, locale: Locale): Copy {
  const record = records.find((item) => item.variant_id === id && item.locale === locale);
  if (!record) throw new Error("Unsupported invitation translation");
  return record.content;
}
export function formatText(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}
export const isInvitationId = (value: string) => Boolean(findVariant(`/${value}`));

export type Couple = {
  groom: typeof weddingData.groom & { family: typeof weddingData.family.groom };
  bride: typeof weddingData.bride & { family: typeof weddingData.family.bride };
};
export const defaultCouple: Couple = {
  groom: { ...weddingData.groom, family: weddingData.family.groom },
  bride: { ...weddingData.bride, family: weddingData.family.bride },
};

export function buildInvitation(variant: Variant, event: WeddingEvent, locale: Locale, options: {
  copy?: Copy; couple?: Couple; recipientName?: string; guestToken?: string;
  formsEnabled?: boolean; wishesEnabled?: boolean; invalidGuest?: boolean;
} = {}) {
  const copy = options.copy ?? getCopy(variant.id, locale);
  const couple = options.couple ?? defaultCouple;
  const sides: Side[] = variant.first_person === "groom" ? ["groom", "bride"] : ["bride", "groom"];
  const people = sides.map((side) => ({
    firstName: couple[side].firstName, fullName: couple[side].fullName, side,
    role: copy.labels[side], image: `/images/couple/${side}.jpg`,
    description: side === "groom" ? copy.groomDescription : copy.brideDescription,
  }));
  const names = people.map((person) => person.fullName).join(" & ");
  const date = new Date(event.starts_at);
  const dateLocale = locale === "ko" ? "ko-KR" : "vi-VN";
  const isoDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  const displayDate = locale === "ko"
    ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "long", day: "numeric" }).format(date)
    : isoDate.split("-").reverse().join(" · ");
  const recipientName = options.recipientName?.trim().replace(/\s+/g, " ").slice(0, 120) ?? "";
  return {
    id: variant.id, path: variant.path, side: variant.host_side, firstPerson: variant.first_person,
    locale, dateLocale, supportedLocales: variant.supported_locales,
    recipientMode: variant.recipient_mode, recipientName,
    recipient: recipientName || copy.defaultRecipient,
    salutation: copy.salutation, message: copy.invitation,
    label: copy.labels[event.event_kind === "reception" ? "receptionInvitation" : "weddingInvitation"],
    copy, people, names, namesWithDot: people.map((person) => person.fullName).join(" · "),
    families: sides.map((side, index) => ({ ...couple[side].family, ...people[index], title: copy.labels[side === "groom" ? "groomFamily" : "brideFamily"] })),
    event: { id: event.id, kind: event.event_kind, side: event.id === "groom-wedding" ? copy.labels.groomFamily : event.id === "bride-wedding" ? copy.labels.brideFamily : copy.eventHeading, type: copy.eventTitle, isoDate, dateTime: event.starts_at, date: displayDate, time: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", hour12: false }).format(date), venue: event.venue, address: event.address, mapUrl: event.map_url },
    timeline: [{ time: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", hour12: false }).format(date), title: copy.eventTitle, description: `${event.venue} · ${event.address}` }],
    formsEnabled: options.formsEnabled ?? false, wishesEnabled: options.wishesEnabled ?? false,
    guestToken: options.guestToken ?? "", invalidGuest: options.invalidGuest ?? false,
    familyIntro: formatText(copy.familyIntro, { coupleNames: names }),
  };
}
export function getInvitation(pathOrId: string, recipient?: string | string[], language?: string | string[]) {
  const variant = findVariant(pathOrId.startsWith("/") ? pathOrId : `/${pathOrId}`) ?? findVariant(pathOrId);
  if (!variant) throw new Error("Unknown invitation");
  return buildInvitation(variant, events.find((event) => event.id === variant.event_id)!, chooseLocale(variant, language), { recipientName: firstParam(recipient) });
}
export type Invitation = ReturnType<typeof buildInvitation>;
export type InvitationProps = { invitation: Invitation };
