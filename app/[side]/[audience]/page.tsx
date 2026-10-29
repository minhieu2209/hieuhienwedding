import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WeddingInvitation from "@/components/wedding/WeddingInvitation";
import {
  getInvitation,
  isInvitationId,
  type InvitationSearchParams,
} from "@/data/invitations";

type Props = {
  params: Promise<{ side: string; audience: string }>;
  searchParams: Promise<InvitationSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { side, audience } = await params;
  const id = `${side}/${audience}`;
  if (!isInvitationId(id)) notFound();
  const invitation = getInvitation(id);

  return {
    title: `${invitation.names} | Thiệp mời cưới`,
    description: `${invitation.label} · ${invitation.event.time} · ${invitation.event.date} · ${invitation.event.venue}`,
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { side, audience } = await params;
  const id = `${side}/${audience}`;
  if (!isInvitationId(id)) notFound();
  const { khach } = await searchParams;

  return <WeddingInvitation invitation={getInvitation(id, khach)} />;
}
