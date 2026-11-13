import type { Copy } from "./invitations";
import type { Locale } from "./invitation-catalog";

export type InvitationVoice = {
  self: "chúng mình" | "chúng em" | "Anh Chị" | "chúng cháu";
  addressee: string;
};

function containsWord(text: string, word: string) {
  return new RegExp(`(^|[^\\p{L}\\p{N}_])${word}(?=$|[^\\p{L}\\p{N}_])`, "iu").test(text);
}

export function invitationVoice(recipient: string, invitationId?: string, guestCode?: string): InvitationVoice {
  const name = recipient.normalize("NFC");
  if (invitationId === "bride-friends" && guestCode === "BF-0003") return { self: "chúng em", addressee: "Chị" };
  if (invitationId === "uncle-lee") return { self: "chúng cháu", addressee: "Bác" };
  if (invitationId === "groom-ngv" || invitationId === "bride-partron") return { self: "chúng em", addressee: "Anh/Chị/Em" };
  if (invitationId === "groom-ufc97") return { self: "chúng em", addressee: "Anh Em" };
  if (containsWord(name, "phù\\s+dâu")) return { self: "chúng em", addressee: "Chị" };
  if (containsWord(name, "1H20")) return { self: "chúng mình", addressee: "các gái iu" };
  const junior = containsWord(name, "em");
  // Mixed-age groups follow the first Anh/Chị/Em instead of any later "Em".
  // Without "Em", retain the existing friend and personal-name rules.
  const firstTitle = junior ? name.match(/(^|[^\p{L}\p{N}_])(anh|chị|em)(?=$|[^\p{L}\p{N}_])/iu)?.[2].toLocaleLowerCase("vi-VN") : undefined;
  const elder = firstTitle === "anh" ? "Anh" : firstTitle === "chị" ? "Chị" : undefined;
  const friend = containsWord(name, "bạn");
  const address = name.trim().match(/^(anh|chị)(?=$|[^\p{L}\p{N}_])/iu)?.[1].toLocaleLowerCase("vi-VN");
  const self = elder ? "chúng em" : junior ? "Anh Chị" : friend ? "chúng mình" : address ? "chúng em" : "chúng mình";
  if (containsWord(name, "CKLS")) return { self, addressee: "các bạn" };
  if (elder) return { self, addressee: elder };
  if (junior) return { self, addressee: "em" };
  if (friend) return { self, addressee: "bạn" };
  return { self, addressee: address === "anh" ? "Anh" : address === "chị" ? "Chị" : "bạn" };
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

function sentenceCase(replacement: string, precedingText: string) {
  const lower = replacement.toLocaleLowerCase("vi-VN");
  const startsSentence = /(?:^|[.!?…\r\n])[\s"'“”‘’«»]*$/u.test(precedingText);
  return startsSentence ? lower[0].toLocaleUpperCase("vi-VN") + lower.slice(1) : lower;
}

export function personalizeInvitationCopy(base: Copy, voice: InvitationVoice, locale: Locale): Copy {
  const copy = structuredClone(base);
  if (locale !== "vi") return copy;
  // Recipient names, event details, labels and guestbook messages stay untouched.
  for (const field of narrativeFields) {
    copy[field] = copy[field].replace(pronouns, (match, prefix: string, source: string, offset: number) => {
      const precedingText = copy[field].slice(0, offset) + prefix;
      if (/^chúng\s/iu.test(source)) return prefix + sentenceCase(voice.self, precedingText);
      return addressedFields.has(field) ? prefix + sentenceCase(voice.addressee, precedingText) : match;
    });
  }
  return copy;
}
