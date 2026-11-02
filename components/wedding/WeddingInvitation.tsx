import type { InvitationProps } from "@/data/invitations";
import Hero from "./Hero";
import SaveTheDate from "./SaveTheDate";
import WeddingDetails from "./WeddingDetails";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import RSVP from "./RSVP";
import Guestbook from "./Guestbook";
import Footer from "./Footer";
import MusicPlayer from "./MusicPlayer";

export default function WeddingInvitation({ invitation }: InvitationProps) {
  return (
    <main lang={invitation.locale}>
      <MusicPlayer invitation={invitation} />
      <Hero invitation={invitation} />
      <SaveTheDate invitation={invitation} />
      <Countdown invitation={invitation} />
      <WeddingDetails invitation={invitation} />
      <Gallery invitation={invitation} />
      <RSVP key={`rsvp-${invitation.id}-${invitation.recipientName}`} invitation={invitation} />
      <Guestbook key={`wishes-${invitation.id}-${invitation.recipientName}`} invitation={invitation} />
      <Footer invitation={invitation} />
    </main>
  );
}
