import Image from "next/image";
import type { InvitationProps } from "@/data/invitations";

export default function WeddingDetails({ invitation: i }: InvitationProps) {
  const c = i.copy;
  return <section id="invitation" className="relative overflow-hidden bg-[var(--wedding-cream)] px-5 py-20 md:px-10 md:py-24">
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--wedding-primary)]">{i.salutation}</p>
      <h2 className="font-invitation mx-auto mt-5 max-w-2xl break-words text-2xl leading-relaxed text-[var(--wedding-primary-dark)] md:text-3xl">{i.recipient}</h2>
      <p className="font-invitation mt-4 text-base leading-7 text-[var(--wedding-text-muted)] md:text-lg">{i.recipientWelcome}</p>
      <div aria-hidden="true" className="my-8 text-[var(--wedding-primary)]">──── ♡ ────</div>
    </div>
   <div className="grid grid-cols-2 gap-4 md:gap-8">
  {i.families.map(family => <article key={family.side} className="min-w-0 text-center">
    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--wedding-primary)] md:text-xs">{family.title}</p>
    <div className="mt-4 grid min-h-24 content-start gap-3 text-sm leading-6 md:text-base">
      <p><span className="text-[var(--wedding-text-muted)]">{c.labels.father}: </span><span className="font-wedding text-lg text-[var(--wedding-text-muted)] md:text-xl">{family.father}</span></p>
      <p><span className="text-[var(--wedding-text-muted)]">{c.labels.mother}: </span><span className="font-wedding text-lg text-[var(--wedding-text-muted)] md:text-xl">{family.mother}</span></p>
    </div>
    <div className="relative mt-5 aspect-[3/4] overflow-hidden rounded-t-[120px] rounded-b-2xl border border-[var(--wedding-primary-light)]">
      <Image src={family.image} alt={family.fullName} fill sizes="(max-width: 812px) 45vw, 350px" className="object-cover" />
    </div>
    <p className="mt-5 text-[10px] uppercase tracking-[0.15em] text-[var(--wedding-text-muted)]">{family.role}</p>
    <h3 className="mt-2 font-wedding text-xl text-[var(--wedding-primary-dark)] md:text-3xl">{family.fullName}</h3>
  </article>)}
</div>
    <div className="mx-auto mt-14 max-w-xl rounded-[32px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-bg)] px-5 py-10 text-center md:px-10">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--wedding-primary)]">{c.labels.eventEyebrow}</p>
      <h2 className="mt-4 font-wedding text-3xl uppercase text-[var(--wedding-primary-dark)] md:text-4xl">
  {i.event.type}
</h2>
      <p className="mt-6 text-xl font-medium tabular-nums text-[var(--wedding-primary-dark)]">{i.event.time}</p>
      <p className="mt-6 text-xl font-medium tabular-nums text-[var(--wedding-primary-dark)]">{i.event.date}</p>
      <div className="mx-auto my-6 h-px w-12 bg-[var(--wedding-primary-light)]" />
      <p className="font-wedding text-xl text-[var(--wedding-primary-dark)]">{i.event.venue}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--wedding-text-muted)]">{i.event.address}</p>
      <a href={i.event.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-3 rounded-full bg-[var(--wedding-primary-dark)] px-6 py-3 text-sm text-white transition hover:bg-[var(--wedding-primary)]">{c.labels.map}<span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}
