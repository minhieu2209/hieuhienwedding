import type { InvitationProps } from "@/data/invitations";

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M12 21C12 21 18 15.8 18 10.5C18 6.91 15.31 4 12 4C8.69 4 6 6.91 6 10.5C6 15.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="10.5"
        r="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 7.5V12L15 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DecorativeFlower({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="80"
        cy="80"
        r="13"
        stroke="currentColor"
        strokeWidth="1"
      />

      <ellipse
        cx="80"
        cy="45"
        rx="14"
        ry="25"
        stroke="currentColor"
        strokeWidth="1"
      />

      <ellipse
        cx="80"
        cy="115"
        rx="14"
        ry="25"
        stroke="currentColor"
        strokeWidth="1"
      />

      <ellipse
        cx="45"
        cy="80"
        rx="25"
        ry="14"
        stroke="currentColor"
        strokeWidth="1"
      />

      <ellipse
        cx="115"
        cy="80"
        rx="25"
        ry="14"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function WeddingDetails({ invitation }: InvitationProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--wedding-cream)] px-5 py-24 md:px-6 md:py-32">
      {/* DECORATIVE BACKGROUND */}
      <DecorativeFlower className="pointer-events-none absolute -left-16 top-20 w-48 text-[var(--wedding-primary)] opacity-10 md:left-4 md:w-64" />

      <DecorativeFlower className="pointer-events-none absolute -right-16 bottom-20 w-48 rotate-12 text-[var(--wedding-primary)] opacity-10 md:right-4 md:w-64" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[850px] w-[850px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wedding-primary-light)] opacity-15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">

        {/* =========================
            FAMILY / ANNOUNCEMENT
        ========================== */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)] md:text-xs">
            {invitation.families.map((family) => family.title).join(" & ")}
          </p>

          <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">
            {invitation.copy.labels.familyAnnouncement}
          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
            <span className="text-sm text-[var(--wedding-primary)]">♡</span>
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[var(--wedding-text-muted)] md:text-base md:leading-8">
            {invitation.familyIntro}
          </p>
        </div>

        {/* FAMILY CARDS */}
        <div className="relative mt-16 grid gap-8 md:grid-cols-2 md:gap-12">

          {invitation.families.map((family) => (
            <article key={family.side} className="relative overflow-hidden rounded-[36px] border border-[var(--wedding-primary-light)] bg-white/80 p-8 text-center shadow-[0_18px_60px_rgba(73,107,88,0.06)] backdrop-blur-sm md:p-12">
              <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--wedding-primary)] to-transparent opacity-50" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--wedding-primary)]">{family.title}</p>
              <div className="mx-auto mt-6 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-[var(--wedding-primary-light)]" />
                <span className="text-[9px] text-[var(--wedding-primary)]">♡</span>
                <span className="h-px w-8 bg-[var(--wedding-primary-light)]" />
              </div>
              <div className="mt-8 space-y-4">
                <p className="text-base md:text-lg">
                  <span className="text-[var(--wedding-text-muted)]">{invitation.copy.labels.father}:</span>{" "}
                  <span className="font-wedding text-2xl font-normal text-[var(--wedding-primary-dark)] md:text-3xl">{family.father}</span>
                </p>
                <p className="text-base md:text-lg">
                  <span className="text-[var(--wedding-text-muted)]">{invitation.copy.labels.mother}:</span>{" "}
                  <span className="font-wedding text-2xl font-normal text-[var(--wedding-primary-dark)] md:text-3xl">{family.mother}</span>
                </p>
              </div>
              <div className="mx-auto my-8 h-px w-12 bg-[var(--wedding-primary-light)]" />
              <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--wedding-primary)]">{family.role}</p>
              <h3 className="mt-3 font-wedding text-4xl font-normal text-[var(--wedding-primary-dark)] md:text-5xl">{family.fullName}</h3>
              <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-2 border-t border-[var(--wedding-primary-light)] pt-6 text-sm leading-6 text-[var(--wedding-text-muted)]">
                <LocationIcon />
                <span className="whitespace-pre-line">{family.address}</span>
              </div>
            </article>
          ))}

          {/* CENTER HEART DESKTOP */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] shadow-[0_10px_30px_rgba(73,107,88,0.08)] md:flex">
            <span className="text-xl text-[var(--wedding-primary)]">
              ♡
            </span>
          </div>
        </div>

        {/* =========================
            EVENTS INTRO
        ========================== */}
        <div className="mt-28 text-center md:mt-36">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)] md:text-xs">
            {invitation.copy.labels.eventEyebrow}
          </p>

          <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">
            {invitation.copy.eventHeading}
          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
            <span className="text-sm text-[var(--wedding-primary)]">♡</span>
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[var(--wedding-text-muted)] md:text-base md:leading-8">
            {invitation.copy.eventIntro}
          </p>
        </div>

        {/* EVENTS */}
        <div className="mx-auto mt-16 grid max-w-2xl gap-8">
          {[invitation.event].map((event, index) => (
            <article
              key={`${event.type}-${event.side}`}
              className="group relative overflow-hidden rounded-[38px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-bg)] p-7 shadow-[0_20px_60px_rgba(73,107,88,0.07)] md:p-10"
            >
              {/* BIG NUMBER */}
              <div className="pointer-events-none absolute -right-3 -top-7 font-wedding text-[120px] leading-none text-[var(--wedding-primary-light)] opacity-60">
                0{index + 1}
              </div>

              {/* EVENT SIDE */}
              <p className="relative text-[10px] uppercase tracking-[0.35em] text-[var(--wedding-primary)]">
                {event.side}
              </p>

              <h3 className="relative mt-4 font-wedding text-4xl text-[var(--wedding-primary-dark)] md:text-5xl">
                {event.type}
              </h3>

              {/* DATE SEAL */}
              <div className="relative mt-8 flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 rotate-[-5deg] flex-col items-center justify-center rounded-full border border-[var(--wedding-primary)] bg-[var(--wedding-cream)]">
                  <span className="font-wedding text-2xl leading-none text-[var(--wedding-primary-dark)]">
                    {event.isoDate.slice(-2)}
                  </span>

                  <span className="mt-1 text-[8px] uppercase tracking-[0.15em] text-[var(--wedding-text-muted)]">
                    {invitation.event.type}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[var(--wedding-primary-dark)]">
                    <ClockIcon />

                    <span className="text-lg font-medium">
                      {event.time}
                    </span>
                  </div>

                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--wedding-text-muted)]">
                    {event.date}
                  </p>
                </div>
              </div>

              <div className="relative mt-8 border-t border-[var(--wedding-primary-light)] pt-7">
                <h4 className="font-wedding text-2xl text-[var(--wedding-text)]">
                  {event.venue}
                </h4>

                <div className="mt-4 flex items-start gap-3 text-[var(--wedding-text-muted)]">
                  <LocationIcon />

                  <p className="leading-7">
                    {event.address}
                  </p>
                </div>
              </div>

              <a
                href={event.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-8 inline-flex items-center gap-3 rounded-full border border-[var(--wedding-primary)] px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-[var(--wedding-primary-dark)] transition duration-300 hover:bg-[var(--wedding-primary-dark)] hover:text-white"
              >
                <LocationIcon />
                {invitation.copy.labels.map}
              </a>
            </article>
          ))}
        </div>

        {/* ENDING LINE */}
        <div className="mx-auto mt-20 max-w-xl text-center">
          <p className="font-wedding text-3xl leading-relaxed text-[var(--wedding-primary-dark)] md:text-4xl">
            {invitation.copy.closingQuote}
          </p>
        </div>
      </div>
    </section>
  );
}
