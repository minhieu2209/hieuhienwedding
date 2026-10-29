import WeddingInvitation from "@/components/wedding/WeddingInvitation";
import { getInvitation, type InvitationSearchParams } from "@/data/invitations";

// Giữ đường dẫn cũ hoạt động như thiệp bạn của chú rể.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<InvitationSearchParams>;
}) {
  const { khach } = await searchParams;
  return <WeddingInvitation invitation={getInvitation("chu-re/ban-be", khach)} />;
}
