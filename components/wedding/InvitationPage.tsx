import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { firstParam, type InvitationSearchParams } from "@/data/invitations";
import { resolveInvitation } from "@/lib/server/invitations";
import WeddingInvitation from "./WeddingInvitation";
import LanguageSwitcher from "./LanguageSwitcher";

const load = cache((path: string, guest?: string, lang?: string, khach?: string) => resolveInvitation(path, { guest, lang, khach }));
async function invitationFor(path: string, searchParams: Promise<InvitationSearchParams>) {
  const query = await searchParams;
  const invitation = await load(path, firstParam(query.guest), firstParam(query.lang), firstParam(query.khach));
  if (!invitation) notFound();
  return { invitation, query };
}
export async function invitationMetadata(path: string, searchParams: Promise<InvitationSearchParams>): Promise<Metadata> {
  const { invitation } = await invitationFor(path, searchParams);
  return {
    title: `${invitation.names} | ${invitation.label}`,
    description: `${invitation.event.time} · ${invitation.event.date} · ${invitation.event.venue}`,
    robots: invitation.recipientMode === "individual" ? { index: false, follow: false } : undefined,
  };
}
export default async function InvitationPage({ path, searchParams }: { path: string; searchParams: Promise<InvitationSearchParams> }) {
  const { invitation, query } = await invitationFor(path, searchParams);
  return <>
    <LanguageSwitcher invitation={invitation} query={query} />
    <WeddingInvitation invitation={invitation} />
  </>;
}
