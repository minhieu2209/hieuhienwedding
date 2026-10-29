import Link from "next/link";
import { firstParam, type InvitationProps, type InvitationSearchParams } from "@/data/invitations";
export default function LanguageSwitcher({ invitation, query }: InvitationProps & { query: InvitationSearchParams }) {
  if (invitation.supportedLocales.length < 2) return null;
  return <nav aria-label={invitation.copy.labels.language} className="fixed right-4 top-4 z-[80] flex gap-1 rounded-full border border-white/50 bg-white/95 p-1 text-sm text-[#496b58] shadow-lg">
    {invitation.supportedLocales.map((locale) => {
      const params = new URLSearchParams();
      for (const key of ["guest", "khach"]) { const value = firstParam(query[key]); if (value) params.set(key, value); }
      params.set("lang", locale);
      return <Link key={locale} href={`${invitation.path}?${params}`} hrefLang={locale} lang={locale} aria-current={locale === invitation.locale ? "page" : undefined} className={`rounded-full px-4 py-2 ${locale === invitation.locale ? "bg-[#496b58] text-white" : "hover:bg-[#eaf3ed]"}`}>
        {locale === "vi" ? "Tiếng Việt" : "한국어"}
      </Link>;
    })}
  </nav>;
}
