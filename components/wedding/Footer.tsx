import type { InvitationProps } from "@/data/invitations";

export default function Footer({ invitation }: InvitationProps) {
  return (
    <footer className="relative overflow-hidden bg-[var(--wedding-primary-dark)] px-5 pb-10 pt-24 text-white md:px-6 md:pt-32">

      {/* DECORATION */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full border border-white/10" />

      <div className="pointer-events-none absolute -right-44 bottom-0 h-[420px] w-[420px] rounded-full border border-white/10" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">

        <p className="text-[9px] uppercase tracking-[0.55em] text-white/40">
          {invitation.copy.labels.thankYou}
        </p>

        <h2 className="mt-6 font-wedding text-5xl leading-tight md:text-7xl">
          {invitation.people[0].fullName}

          <span className="mx-4 inline-block font-light italic text-[#dceae0]">
            &
          </span>

          {invitation.people[1].fullName}
        </h2>

        <div className="mx-auto mt-8 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-white/20" />

          <span className="text-sm text-white/70">
            ♡
          </span>

          <span className="h-px w-10 bg-white/20" />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-white/65 md:text-base">
          {invitation.copy.footerThanks}
        </p>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/55">
          {invitation.copy.wishesIntro}
        </p>

        <div className="mx-auto mt-12 flex h-24 w-24 rotate-[-7deg] items-center justify-center rounded-full border border-white/20 bg-white/5">
          <div className="text-center">

            <p className="font-wedding text-xl font-light italic text-[#dceae0]/75">
              H
            </p>

            <p className="my-1 text-xs text-[#dceae0]">
              ♡
            </p>

            <p className="font-wedding text-xl font-light italic text-[#dceae0]/75">
              H
            </p>

          </div>
        </div>

        <p className="mt-10 text-[10px] uppercase tracking-[0.35em] text-white/50">
          {invitation.event.date}
        </p>

        <p className="mx-auto mt-8 max-w-2xl font-wedding text-2xl leading-relaxed text-white/85 md:text-3xl">
          {invitation.copy.closingQuote}
        </p>

        <div className="mt-20 border-t border-white/10 pt-7">
          <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
            {invitation.copy.labels.madeByGroom}
          </p>

          <p className="mt-2 text-[9px] text-white/30">
            minhieu2209
          </p>
        </div>

      </div>
    </footer>
  );
}
