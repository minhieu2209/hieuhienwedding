import type { InvitationProps } from "@/data/invitations";
import Hero from "./Hero";
import SaveTheDate from "./SaveTheDate";
import Couple from "./Couple";
import WeddingDetails from "./WeddingDetails";
import Timeline from "./Timeline";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import RSVP from "./RSVP";
import Guestbook from "./Guestbook";
import Footer from "./Footer";
import MusicPlayer from "./MusicPlayer";

export default function WeddingInvitation({ invitation }: InvitationProps) {
  return (
    <main lang={invitation.locale}>
      <Hero invitation={invitation} />
      <SaveTheDate invitation={invitation} />
      <Couple invitation={invitation} />
      <WeddingDetails invitation={invitation} />
      <Timeline invitation={invitation} />
      <Countdown invitation={invitation} />
      <Gallery invitation={invitation} />
      <RSVP key={`rsvp-${invitation.id}-${invitation.recipientName}`} invitation={invitation} />
      <Guestbook key={`wishes-${invitation.id}-${invitation.recipientName}`} invitation={invitation} />
      <Footer invitation={invitation} />
      <MusicPlayer invitation={invitation} />
    </main>
  );
}
