import InvitationPage, { invitationMetadata } from "@/components/wedding/InvitationPage";
import type { InvitationSearchParams } from "@/data/invitations";
type Props = { searchParams: Promise<InvitationSearchParams> };
export const generateMetadata = ({ searchParams }: Props) => invitationMetadata("/groom/friends", searchParams);
export default function Home({ searchParams }: Props) {
  return <InvitationPage path="/groom/friends" searchParams={searchParams} />;
}
