import Hero from "@/components/wedding/Hero";
import SaveTheDate from "@/components/wedding/SaveTheDate";
import Couple from "@/components/wedding/Couple";
import LoveStory from "@/components/wedding/LoveStory";
import WeddingDetails from "@/components/wedding/WeddingDetails";
import Timeline from "@/components/wedding/Timeline";
import Countdown from "@/components/wedding/Countdown";
import Gallery from "@/components/wedding/Gallery";
import RSVP from "@/components/wedding/RSVP";
import Guestbook from "@/components/wedding/Guestbook";
import Footer from "@/components/wedding/Footer";
import MusicPlayer from "@/components/wedding/MusicPlayer";

export default function Home() {
  return (
    <main>
      <Hero />
      <SaveTheDate />
      <Couple />
      <LoveStory />
      <WeddingDetails />
      <Timeline />
      <Countdown />
      <Gallery />
      <RSVP />
      <Guestbook />
      <Footer />

      <MusicPlayer />
    </main>
  );
}