import Image from "next/image";
import type { InvitationProps } from "@/data/invitations";

function MiniLeaf({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
      }}
      aria-hidden="true"
    >
      <path
        d="M10 108C42 92 59 71 75 49C91 27 110 15 148 8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      <path
        d="M47 82C37 72 31 61 30 50"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M72 53C61 44 57 34 58 24"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M85 42C100 44 113 40 124 32"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function Couple({ invitation }: InvitationProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--wedding-cream)] px-5 py-24 md:px-6 md:py-32">
      {/* BACKGROUND DETAILS */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wedding-primary-light)] opacity-20 blur-3xl" />

      <MiniLeaf className="pointer-events-none absolute -left-10 top-14 w-44 text-[var(--wedding-primary)] opacity-15 md:left-4 md:w-56" />

      <MiniLeaf
        flip
        className="pointer-events-none absolute -right-10 bottom-14 w-44 text-[var(--wedding-primary)] opacity-15 md:right-4 md:w-56"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* TITLE */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)] md:text-xs">
            {invitation.people.map((person) => person.role).join(" & ")}
          </p>

          <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">
            {invitation.copy.coupleHeading}
          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
            <span className="text-sm text-[var(--wedding-primary)]">♡</span>
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
          </div>
        </div>

        {/* COUPLE AREA */}
        <div className="relative mt-16 grid gap-16 md:grid-cols-2 md:gap-12 lg:gap-20">
          {invitation.people.map((person, index) => (
            <article key={person.side} className="group relative">
              <div className="relative mx-auto max-w-md">
                <div className={`pointer-events-none absolute -top-4 h-full w-full rounded-t-[190px] border border-[var(--wedding-primary-light)] md:-top-6 ${index === 0 ? "-left-4 md:-left-6" : "-right-4 md:-right-6"}`} />
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-[190px] rounded-b-[34px]">
                  <Image
                    src={person.image}
                    alt={person.fullName}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#213029]/65 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-0 right-0 px-6 text-center text-white">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/65">{person.role}</p>
                    <h3 className="mt-2 font-wedding text-4xl md:text-5xl">{person.fullName}</h3>
                  </div>
                </div>
                <div className="absolute -bottom-7 -right-2 flex h-20 w-20 rotate-[-10deg] items-center justify-center rounded-full border border-[var(--wedding-primary)] bg-[var(--wedding-cream)] shadow-[0_12px_30px_rgba(73,107,88,0.12)]">
                  <span className="font-wedding text-2xl text-[var(--wedding-primary-dark)]">{person.firstName[0]}</span>
                </div>
              </div>
              <div className="mx-auto mt-12 max-w-sm text-center">
                <p className="leading-8 text-[var(--wedding-text-muted)]">{person.description}</p>
              </div>
            </article>
          ))}

          {/* CENTER AMPERSAND */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] shadow-[0_15px_40px_rgba(73,107,88,0.08)]">
              <span className="font-wedding text-5xl italic text-[var(--wedding-primary)]">
                &
              </span>
            </div>
          </div>
        </div>

        {/* QUOTE */}
        <div className="mx-auto mt-24 max-w-2xl text-center">
          <p className="font-wedding text-3xl leading-relaxed text-[var(--wedding-primary-dark)] md:text-4xl">
            {invitation.copy.coupleQuote}
          </p>
        </div>
      </div>
    </section>
  );
}
