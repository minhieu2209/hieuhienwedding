import type { InvitationProps } from "@/data/invitations";

function TimelineIcon({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M5 19C6.5 14 8.5 10 12 6C15.5 10 17.5 14 19 19"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M8 19H16"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="5"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M12 20S5 15.8 5 10.2C5 7.3 7 5.5 9.3 5.5C10.7 5.5 11.6 6.3 12 7C12.4 6.3 13.3 5.5 14.7 5.5C17 5.5 19 7.3 19 10.2C19 15.8 12 20 12 20Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M7 4L10 10H5L7 4Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M17 4L14 10H19L17 4Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M10 10L12 20"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M14 10L12 20"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="7"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8 7L9.5 5H14.5L16 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Timeline({ invitation }: InvitationProps) {
  return (
    <section className="relative overflow-hidden bg-[var(--wedding-bg)] px-5 py-24 md:px-6 md:py-32">

      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wedding-primary-light)] opacity-20 blur-3xl" />

      <div className="pointer-events-none absolute -left-32 top-28 h-72 w-72 rounded-full border border-[var(--wedding-primary-light)] opacity-50" />

      <div className="pointer-events-none absolute -right-36 bottom-28 h-80 w-80 rounded-full border border-[var(--wedding-primary-light)] opacity-50" />

      <div className="relative mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)] md:text-xs">
            Wedding Timeline
          </p>

          <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">
            Hành trình ngày cưới
          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />

            <span className="text-sm text-[var(--wedding-primary)]">
              ♡
            </span>

            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[var(--wedding-text-muted)] md:text-base md:leading-8">
            Những khoảnh khắc chúng mình mong được sẻ chia cùng
            gia đình và những người thân yêu trong ngày đặc biệt.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative mt-20">

          {/* CENTER LINE - DESKTOP */}
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--wedding-primary)] to-transparent opacity-35 md:block" />

          {/* LEFT LINE - MOBILE */}
          <div className="pointer-events-none absolute bottom-0 left-[27px] top-0 w-px bg-gradient-to-b from-transparent via-[var(--wedding-primary)] to-transparent opacity-35 md:hidden" />

          <div className="space-y-14 md:space-y-20">
            {invitation.timeline.map((item, index) => {
              const reverse = index % 2 !== 0;

              return (
                <article
                  key={`${item.time}-${item.title}`}
                  className="relative"
                >
                  {/* DESKTOP */}
                  <div className="hidden grid-cols-[1fr_90px_1fr] items-center gap-8 md:grid">

                    {/* LEFT */}
                    <div
                      className={
                        reverse
                          ? ""
                          : "text-right"
                      }
                    >
                      {!reverse && (
                        <>
                          <p className="font-wedding text-5xl leading-none text-[var(--wedding-primary-dark)] lg:text-6xl">
                            {item.time}
                          </p>

                          <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-[var(--wedding-primary)]">
                            0{index + 1}
                          </p>
                        </>
                      )}

                      {reverse && (
                        <div className="rounded-[32px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] p-8 shadow-[0_18px_55px_rgba(73,107,88,0.06)]">
                          <h3 className="font-wedding text-4xl text-[var(--wedding-primary-dark)]">
                            {item.title}
                          </h3>

                          <p className="mt-4 leading-8 text-[var(--wedding-text-muted)]">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CENTER */}
                    <div className="relative z-10 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--wedding-primary)] bg-[var(--wedding-cream)] text-[var(--wedding-primary-dark)] shadow-[0_12px_32px_rgba(73,107,88,0.10)]">
                        <TimelineIcon index={index} />
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div>
                      {reverse && (
                        <>
                          <p className="font-wedding text-5xl leading-none text-[var(--wedding-primary-dark)] lg:text-6xl">
                            {item.time}
                          </p>

                          <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-[var(--wedding-primary)]">
                            0{index + 1}
                          </p>
                        </>
                      )}

                      {!reverse && (
                        <div className="rounded-[32px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] p-8 shadow-[0_18px_55px_rgba(73,107,88,0.06)]">
                          <h3 className="font-wedding text-4xl text-[var(--wedding-primary-dark)]">
                            {item.title}
                          </h3>

                          <p className="mt-4 leading-8 text-[var(--wedding-text-muted)]">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div className="relative grid grid-cols-[56px_1fr] gap-5 md:hidden">

                    {/* ICON */}
                    <div className="relative z-10 flex justify-center pt-1">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--wedding-primary)] bg-[var(--wedding-cream)] text-[var(--wedding-primary-dark)] shadow-[0_10px_25px_rgba(73,107,88,0.10)]">
                        <TimelineIcon index={index} />
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--wedding-primary)]">
                            Moment 0{index + 1}
                          </p>

                          <h3 className="mt-2 font-wedding text-3xl text-[var(--wedding-primary-dark)]">
                            {item.title}
                          </h3>
                        </div>

                        <p className="shrink-0 font-wedding text-3xl text-[var(--wedding-primary-dark)]">
                          {item.time}
                        </p>
                      </div>

                      <div className="mt-5 rounded-[26px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] p-5 shadow-[0_14px_40px_rgba(73,107,88,0.05)]">
                        <p className="text-sm leading-7 text-[var(--wedding-text-muted)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        </div>

        {/* END */}
        <div className="mx-auto mt-24 max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)]">
            <span className="text-lg text-[var(--wedding-primary)]">
              ♡
            </span>
          </div>

          <p className="font-wedding text-3xl leading-relaxed text-[var(--wedding-primary-dark)] md:text-4xl">
            “Một ngày thật đẹp sẽ càng ý nghĩa hơn
            khi có những người chúng mình yêu thương ở bên.”
          </p>
        </div>
      </div>
    </section>
  );
}
