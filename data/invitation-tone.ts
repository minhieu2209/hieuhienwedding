import type { Copy } from "./invitations";
import type { Locale } from "./invitation-catalog";

export type InvitationVoice = {
  self: "chúng mình" | "chúng em" | "Anh Chị" | "chúng cháu";
  addressee: string;
};

function containsWord(text: string, word: string) {
  return new RegExp(`(^|[^\\p{L}\\p{N}_])${word}(?=$|[^\\p{L}\\p{N}_])`, "iu").test(text);
}

export function invitationVoice(recipient: string, invitationId?: string): InvitationVoice {
  const name = recipient.normalize("NFC");
  if (invitationId === "uncle-lee") return { self: "chúng cháu", addressee: "Bác" };
  if (invitationId === "groom-ngv" || invitationId === "bride-partron") return { self: "chúng em", addressee: "Anh/Chị/Em" };
  if (invitationId === "groom-ufc97") return { self: "chúng em", addressee: "Anh Em" };
  const junior = containsWord(name, "em");
  // Mixed-age groups follow the first Anh/Chị/Em instead of any later "Em".
  // Without "Em", retain the existing friend and personal-name rules.
  const firstTitle = junior ? name.match(/(^|[^\p{L}\p{N}_])(anh|chị|em)(?=$|[^\p{L}\p{N}_])/iu)?.[2].toLocaleLowerCase("vi-VN") : undefined;
  const elder = firstTitle === "anh" ? "Anh" : firstTitle === "chị" ? "Chị" : undefined;
  const friend = containsWord(name, "bạn");
  const self = elder ? "chúng em" : junior ? "Anh Chị" : friend ? "chúng mình" : "chúng em";
  if (containsWord(name, "CKLS")) return { self, addressee: "các bạn" };
  if (elder) return { self, addressee: elder };
  if (junior) return { self, addressee: "em" };
  if (friend) return { self, addressee: "bạn" };
  const address = name.trim().match(/^(anh|chị)(?=$|[^\p{L}\p{N}_])/iu)?.[1].toLocaleLowerCase("vi-VN");
  return { self: "chúng em", addressee: address === "anh" ? "Anh" : address === "chị" ? "Chị" : "Anh/Chị" };
}

const narrativeFields = [
  "invitation", "coupleHeading", "coupleIntro", "familyIntro", "galleryIntro",
  "rsvpIntro", "rsvpThanks", "wishesIntro", "footerThanks", "privacyNotice",
  "groomDescription", "brideDescription", "coupleQuote", "dayQuote", "eventIntro",
  "closingQuote", "countdownQuote", "countdownHeading", "timelineHeading",
] as const;
// These paragraphs address the recipient. Descriptions and quotes may use
// 'bạn' as a noun, so only their self-reference is adapted.
const addressedFields = new Set<keyof Copy>([
  "invitation", "coupleIntro", "galleryIntro", "rsvpIntro", "rsvpThanks",
  "wishesIntro", "footerThanks", "eventIntro", "closingQuote", "countdownQuote",
  "privacyNotice",
]);
// A single pass protects 'em' inside 'chúng em' from becoming a recipient term.
const pronouns = /(^|[^\p{L}\p{N}_])(chúng\s+(?:mình|em|tôi|cháu)|anh\s*\/\s*chị\s*\/\s*em|anh\s*\/\s*em|anh\s*\/\s*chị|chị\s*\/\s*em|các\s+(?:bạn|em)|bạn|bác)(?![\p{L}\p{N}_])/giu;

function matchCase(source: string, replacement: string) {
  if (source === source.toLocaleUpperCase("vi-VN")) return replacement.toLocaleUpperCase("vi-VN");
  if (source[0] !== source[0].toLocaleLowerCase("vi-VN")) return replacement[0].toLocaleUpperCase("vi-VN") + replacement.slice(1);
  return replacement;
}

export function personalizeInvitationCopy(base: Copy, voice: InvitationVoice, locale: Locale): Copy {
  const copy = structuredClone(base);
  if (locale !== "vi") return copy;
  // Recipient names, event details, labels and guestbook messages stay untouched.
  for (const field of narrativeFields) {
    copy[field] = copy[field].replace(pronouns, (match, prefix: string, source: string) => {
      if (/^chúng\s/iu.test(source)) return prefix + matchCase(source, voice.self);
      return addressedFields.has(field) ? prefix + matchCase(source, voice.addressee) : match;
    });
  }
  return copy;
}
