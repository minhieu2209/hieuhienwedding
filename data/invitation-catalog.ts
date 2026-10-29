import { weddingData } from "./wedding";

export type Side = "groom" | "bride";
export type Locale = "vi" | "ko";
export type Variant = {
  id: string;
  path: string;
  host_side: Side;
  first_person: Side;
  event_id: string;
  recipient_mode: "group" | "individual" | "fixed";
  default_locale: Locale;
  supported_locales: Locale[];
  publication_status: "draft" | "published" | "paused";
};
export type WeddingEvent = {
  id: string;
  event_kind: "wedding" | "reception";
  starts_at: string;
  venue: string;
  address: string;
  map_url: string;
};

export const variants: Variant[] = [
  { id: "groom-ngv", path: "/groom/NGV", host_side: "groom", first_person: "groom", event_id: "groom-wedding", recipient_mode: "group", default_locale: "vi", supported_locales: ["vi"], publication_status: "draft" },
  { id: "groom-friends", path: "/groom/friends", host_side: "groom", first_person: "groom", event_id: "groom-wedding", recipient_mode: "individual", default_locale: "vi", supported_locales: ["vi"], publication_status: "draft" },
  { id: "groom-ufc97", path: "/groom/UFC97", host_side: "groom", first_person: "groom", event_id: "groom-wedding", recipient_mode: "group", default_locale: "vi", supported_locales: ["vi"], publication_status: "draft" },
  { id: "bride-partron", path: "/bride/Partron", host_side: "bride", first_person: "bride", event_id: "wedding-reception", recipient_mode: "group", default_locale: "vi", supported_locales: ["vi", "ko"], publication_status: "draft" },
  { id: "bride-friends", path: "/bride/friends", host_side: "bride", first_person: "bride", event_id: "bride-wedding", recipient_mode: "individual", default_locale: "vi", supported_locales: ["vi"], publication_status: "draft" },
  { id: "uncle-lee", path: "/UncleLEE", host_side: "bride", first_person: "bride", event_id: "groom-wedding", recipient_mode: "fixed", default_locale: "ko", supported_locales: ["ko"], publication_status: "draft" },
  { id: "bride-friends1", path: "/bride/friends1", host_side: "bride", first_person: "bride", event_id: "wedding-reception", recipient_mode: "individual", default_locale: "vi", supported_locales: ["vi"], publication_status: "draft" },
];

export const events: WeddingEvent[] = [
  ...weddingData.events.map((event, index) => ({
    id: index === 0 ? "groom-wedding" : "bride-wedding",
    event_kind: "wedding" as const,
    starts_at: event.dateTime,
    venue: event.venue,
    address: event.address,
    map_url: event.mapUrl,
  })),
  { id: "wedding-reception", event_kind: "reception", starts_at: "2026-12-04T17:30:00+07:00", venue: "Nhà hàng Tam Giao", address: "369D Đ. Nguyễn Tất Thành, Vĩnh Phúc, Phú Thọ", map_url: "https://www.google.com/maps/place/Nh%C3%A0+h%C3%A0ng+Tam+Giao+-+TT+H%E1%BB%99i+ngh%E1%BB%8B+Ti%E1%BB%87c+c%C6%B0%E1%BB%9Bi/@21.3204399,105.5947811,15z/data=!4m6!3m5!1s0x3134e52cd8df0291:0xcb1cabe0852ed8c7!8m2!3d21.3232503!4d105.6090778!16s%2Fg%2F11j4cw3m97?entry=ttu" },
];

export const aliases: Record<string, string> = {
  "/chu-re/cong-ty": "/groom/NGV",
  "/chu-re/ban-be": "/groom/friends",
  "/co-dau/ban-be": "/bride/friends",
};
export const canonicalPath = (path: string) => aliases[path] ?? path;
export const findVariant = (pathOrId: string) => variants.find((variant) => variant.path === canonicalPath(pathOrId) || variant.id === pathOrId);
