import InvitationPage, { invitationMetadata } from "@/components/wedding/InvitationPage";
import type { InvitationSearchParams } from "@/data/invitations";
type Props = { searchParams: Promise<InvitationSearchParams> };
export const generateMetadata = ({ searchParams }: Props) => invitationMetadata("/UncleLEE", searchParams);
export default function Page({ searchParams }: Props) {
  return <InvitationPage path="/UncleLEE" searchParams={searchParams} />;
}
