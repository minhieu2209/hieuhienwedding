import InvitationPage, { invitationMetadata } from "@/components/wedding/InvitationPage";
import type { InvitationSearchParams } from "@/data/invitations";
type Props = { params: Promise<{ side: string; audience: string }>; searchParams: Promise<InvitationSearchParams> };
export async function generateMetadata({ params, searchParams }: Props) {
  const { side, audience } = await params;
  return invitationMetadata(`/${side}/${audience}`, searchParams);
}
export default async function Page({ params, searchParams }: Props) {
  const { side, audience } = await params;
  return <InvitationPage path={`/${side}/${audience}`} searchParams={searchParams} />;
}
