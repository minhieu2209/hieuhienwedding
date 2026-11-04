import type { Copy } from "./invitations";
import type { Locale } from "./invitation-catalog";

export type InvitationVoice = { self: "chúng mình" | "chúng em" | "chúng cháu" };

export function invitationVoice(recipient: string, invitationId?: string): InvitationVoice {
  if (invitationId === "uncle-lee") return { self: "chúng cháu" };
  // Match complete words anywhere, including slash-separated group addresses.
  // Do not classify by invitation variant or by unrelated words in the prose.
  const friendly = /(^|[^\p{L}\p{N}_])(?:bạn|em)(?=$|[^\p{L}\p{N}_])/iu.test(recipient.normalize("NFC"));
  return { self: friendly ? "chúng mình" : "chúng em" };
}

const narrativeFields = [
  "invitation", "coupleHeading", "coupleIntro", "familyIntro", "galleryIntro",
  "rsvpIntro", "rsvpThanks", "wishesIntro", "footerThanks", "privacyNotice",
  "groomDescription", "brideDescription", "coupleQuote", "dayQuote", "eventIntro",
  "closingQuote", "countdownQuote", "countdownHeading", "timelineHeading",
] as const;
const pronouns = /(^|[^\p{L}\p{N}_])(chúng\s+(?:mình|em|tôi|cháu))(?![\p{L}\p{N}_])/giu;

function matchCase(source: string, replacement: string) {
  if (source === source.toLocaleUpperCase("vi-VN")) return replacement.toLocaleUpperCase("vi-VN");
  if (source[0] !== source[0].toLocaleLowerCase("vi-VN")) return replacement[0].toLocaleUpperCase("vi-VN") + replacement.slice(1);
  return replacement;
}

export function personalizeInvitationCopy(base: Copy, voice: InvitationVoice, locale: Locale): Copy {
  const copy = structuredClone(base);
  if (locale !== "vi") return copy;
  // Only adapt the couple's self-reference in authored invitation prose.
  // Preserve greetings, recipient addresses, names, labels and guestbook messages.
  for (const field of narrativeFields) {
    copy[field] = copy[field].replace(pronouns, (_match, prefix: string, source: string) => prefix + matchCase(source, voice.self));
  }
  return copy;
}
