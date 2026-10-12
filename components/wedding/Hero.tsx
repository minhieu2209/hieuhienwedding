import { weddingData } from "@/data/wedding";

function BotanicalBranch({
  className = "",
  mirror = false,
}: {
  className?: string;
  mirror?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 180 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        transform: mirror ? "scaleX(-1)" : undefined,
      }}
      aria-hidden="true"
    >
      <path
        d="M35 270C55 220 55 172 83 125C102 93 123 65 145 24"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <path
        d="M58 209C39 198 25 182 17 161"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      <path
        d="M75 162C57 150 46 133 41 113"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      <path
        d="M97 113C82 99 75 82 74 64"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      <path
        d="M111 88C129 82 143 70 153 55"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      <path
        d="M72 163C91 162 107 153 119 139"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      <path
        d="M53 210C72 211 88 204 102 191"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      <ellipse
        cx="20"
        cy="157"
        rx="7"
        ry="15"
        transform="rotate(-38 20 157)"
        stroke="currentColor"
        strokeWidth="1"
      />

      <ellipse
        cx="42"
        cy="112"
        rx="7"
        ry="15"
        transform="rotate(-28 42 112)"
        stroke="currentColor"
        strokeWidth="1"
      />

      <ellipse
        cx="75"
        cy="63"
        rx="7"
        ry="15"
        transform="rotate(-8 75 63)"
        stroke="currentColor"
        strokeWidth="1"
      />

      <ellipse
        cx="153"
        cy="53"
        rx="7"
        ry="15"
        transform="rotate(38 153 53)"
        stroke="currentColor"
        strokeWidth="1"
      />

      <ellipse
        cx="119"
        cy="138"
        rx="7"
        ry="15"
        transform="rotate(45 119 138)"
        stroke="currentColor"
        strokeWidth="1"
      />

      <ellipse
        cx="103"
        cy="190"
        rx="7"
        ry="15"
        transform="rotate(48 103 190)"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="premium-hero relative min-h-screen overflow-hidden bg-[#dfe9e2]">

      {/* BACKGROUND IMAGE */}
      <div
        className="premium-hero-image absolute inset-0 bg-cover bg-[center_30%]"
        style={{
          backgroundImage: "url('/images/hero/hero-cover.jpg')",
        }}
      />

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-black/25" />

      <div className="absolute inset-0 bg-[#55745f]/20" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#1f3026]/35 via-transparent to-[#1f3026]/60" />

      {/* PAPER GLOW */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_65%)]" />

      {/* DECORATIVE BOTANICALS */}
      <BotanicalBranch className="premium-branch-left pointer-events-none absolute -left-8 top-14 h-[300px] w-[190px] text-white/30 md:left-2 md:h-[390px]" />

      <BotanicalBranch
        mirror
        className="premium-branch-right pointer-events-none absolute -right-8 bottom-14 h-[300px] w-[190px] text-white/30 md:right-2 md:h-[390px]"
      />

      {/* OUTER FRAME */}
      <div className="pointer-events-none absolute inset-3 border border-white/25 md:inset-6" />

      {/* SMALL CORNERS */}
      <div className="pointer-events-none absolute left-6 top-6 h-12 w-12 border-l border-t border-white/55 md:left-10 md:top-10 md:h-16 md:w-16" />

      <div className="pointer-events-none absolute right-6 top-6 h-12 w-12 border-r border-t border-white/55 md:right-10 md:top-10 md:h-16 md:w-16" />

      <div className="pointer-events-none absolute bottom-6 left-6 h-12 w-12 border-b border-l border-white/55 md:bottom-10 md:left-10 md:h-16 md:w-16" />

      <div className="pointer-events-none absolute bottom-6 right-6 h-12 w-12 border-b border-r border-white/55 md:bottom-10 md:right-10 md:h-16 md:w-16" />

      {/* CONTENT */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pb-24 pt-20 text-center text-white">

        {/* MONOGRAM */}
        <div className="hero-fade hero-delay-1 mb-7 flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-white/5 backdrop-blur-sm">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/90">
            M · H
          </span>
        </div>

        {/* EYEBROW */}
        <p className="hero-fade hero-delay-1 text-[10px] uppercase tracking-[0.5em] text-white/75 md:text-xs">
          Wedding Invitation
        </p>

        {/* DIVIDER */}
        <div className="hero-fade hero-delay-2 mt-6 flex items-center gap-3">
          <span className="h-px w-8 bg-white/50" />

          <span className="text-xs text-white/80">♡</span>

          <span className="h-px w-8 bg-white/50" />
        </div>

        {/* NAMES */}
        <div className="hero-fade hero-delay-3 mt-7">
          <h1 className="font-wedding text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.92] tracking-tight drop-shadow-sm">
            <span className="block">
              {weddingData.groom.fullName}
            </span>

            <span className="my-3 block text-[0.52em] font-light italic text-[#dceae0]">
              &
            </span>

            <span className="block">
              {weddingData.bride.fullName}
            </span>
          </h1>
        </div>

        {/* SAVE THE DATE */}
        <div className="hero-fade hero-delay-4 mt-9">
          <p className="text-[10px] uppercase tracking-[0.45em] text-white/70 md:text-xs">
            Save The Date
          </p>

          <p className="mt-4 text-lg font-light tracking-[0.28em] text-white md:text-2xl">
            {weddingData.wedding.displayDate}
          </p>
        </div>

        {/* INVITATION TEXT */}
        <p className="hero-fade hero-delay-5 mx-auto mt-8 max-w-md text-sm leading-7 text-white/80 md:text-base">
          {weddingData.text.invitation}
        </p>

        {/* SCROLL */}
        <a
          href="#save-the-date"
          className="hero-fade hero-delay-5 absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-[8px] uppercase tracking-[0.4em] text-white/55">
            Discover
          </span>

          <span className="scroll-line block h-10 w-px bg-white/45" />
        </a>
      </div>

      {/* CURVED TRANSITION */}
      <div className="pointer-events-none absolute -bottom-1 left-0 w-full">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="block h-[70px] w-full md:h-[100px]"
        >
          <path
            d="M0,80 C260,125 500,20 760,55 C1020,90 1190,120 1440,65 L1440,120 L0,120 Z"
            fill="#f6faf7"
          />
        </svg>
      </div>
    </section>
  );
}