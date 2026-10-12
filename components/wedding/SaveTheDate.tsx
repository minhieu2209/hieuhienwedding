import { weddingData } from "@/data/wedding";

const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function LeafDecoration({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
      }}
      aria-hidden="true"
    >
      <path
        d="M12 164C52 146 79 119 102 86C123 56 145 38 198 15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <path
        d="M56 139C42 126 34 110 32 93"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M86 107C72 94 66 79 66 64"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M119 67C109 55 105 43 107 31"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M64 132C84 133 101 127 114 115"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M95 97C113 99 129 94 142 84"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path
        d="M128 58C146 61 162 57 175 48"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function SaveTheDate() {
  const [year, month, weddingDay] = weddingData.wedding.date
    .split("-")
    .map(Number);

  const firstDayOfMonth = new Date(
    Date.UTC(year, month - 1, 1)
  ).getUTCDay();

  const daysInMonth = new Date(
    Date.UTC(year, month, 0)
  ).getUTCDate();

  const monthLabel = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  const calendarCells = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <section
      id="save-the-date"
      className="relative overflow-hidden bg-[var(--wedding-bg)] px-5 py-24 md:px-6 md:py-32"
    >
      {/* DECORATIONS */}
      <LeafDecoration className="pointer-events-none absolute -left-14 top-10 w-52 text-[var(--wedding-primary)] opacity-15 md:left-0 md:w-72" />

      <LeafDecoration
        flip
        className="pointer-events-none absolute -right-14 bottom-8 w-52 text-[var(--wedding-primary)] opacity-15 md:right-0 md:w-72"
      />

      {/* SOFT BACKGROUND */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wedding-primary-light)] opacity-20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* SECTION INTRO */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)] md:text-xs">
            Our Special Day
          </p>

          <h2 className="mt-5 font-wedding text-5xl leading-none text-[var(--wedding-primary-dark)] md:text-7xl">
            Save The Date
          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
            <span className="text-sm text-[var(--wedding-primary)]">
              ♡
            </span>
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
          </div>

          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[var(--wedding-text-muted)] md:text-base md:leading-8">
            Chúng mình rất hạnh phúc khi được chia sẻ ngày đặc biệt này
            cùng gia đình, bạn bè và những người thân yêu.
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="mt-16 grid overflow-hidden rounded-[36px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] shadow-[0_25px_80px_rgba(73,107,88,0.10)] md:grid-cols-[0.9fr_1.1fr] md:rounded-[44px]">

          {/* LEFT SIDE */}
          <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden bg-[var(--wedding-primary-dark)] px-8 py-14 text-center text-white md:min-h-[620px] md:px-12">

            {/* decorative circle */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -left-14 -top-14 h-44 w-44 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full border border-white/10" />

            <p className="text-[10px] uppercase tracking-[0.45em] text-white/60">
              Wedding Day
            </p>

            <p className="mt-8 font-wedding text-[86px] leading-none md:text-[120px]">
              {String(weddingDay).padStart(2, "0")}
            </p>

            <p className="mt-3 font-wedding text-3xl capitalize text-[#dceae0] md:text-4xl">
              {monthLabel}
            </p>

            <div className="my-8 h-px w-16 bg-white/30" />

            <p className="text-sm uppercase tracking-[0.3em] text-white/75">
              {year}
            </p>

            <p className="mt-8 max-w-xs text-sm leading-7 text-white/70">
              Một ngày, một lời hẹn và một hành trình mới bắt đầu.
            </p>

            {/* seal */}
            <div className="mt-10 flex h-20 w-20 rotate-[-8deg] items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-[8px] uppercase tracking-[0.2em] text-white/60">
                  H
                </p>
                <p className="my-1 text-xs text-white/90">
                  ♡
                </p>
                <p className="text-[8px] uppercase tracking-[0.2em] text-white/60">
                  H
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - CALENDAR */}
          <div className="relative px-6 py-12 md:px-12 md:py-16">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--wedding-primary)]">
                Mark Your Calendar
              </p>

              <h3 className="mt-3 font-wedding text-3xl capitalize text-[var(--wedding-primary-dark)] md:text-4xl">
                {monthLabel} {year}
              </h3>
            </div>

            <div className="mx-auto mt-9 max-w-md">
              <div className="grid grid-cols-7 text-center">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="pb-5 text-[10px] font-medium uppercase tracking-wider text-[var(--wedding-text-muted)]"
                  >
                    {day}
                  </div>
                ))}

                {calendarCells.map((day, index) => {
                  const isWeddingDay = day === weddingDay;

                  return (
                    <div
                      key={index}
                      className="flex h-12 items-center justify-center md:h-14"
                    >
                      {day !== null && (
                        <div
                          className={
                            isWeddingDay
                              ? "relative flex h-11 w-11 items-center justify-center rounded-full bg-[var(--wedding-primary-dark)] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(73,107,88,0.24)] md:h-12 md:w-12"
                              : "flex h-11 w-11 items-center justify-center text-sm text-[var(--wedding-text)] md:h-12 md:w-12"
                          }
                        >
                          {day}

                          {isWeddingDay && (
                            <span className="absolute -right-2 -top-2 text-sm text-[var(--wedding-primary)]">
                              ♥
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DATE LINE */}
            <div className="mx-auto mt-10 max-w-sm border-t border-[var(--wedding-primary-light)] pt-8 text-center">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--wedding-text-muted)]">
                Minh Hiếu & Thu Hiền
              </p>

              <p className="mt-3 font-wedding text-2xl text-[var(--wedding-primary-dark)]">
                {weddingData.wedding.displayDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}