import Image from "next/image";
import { weddingData } from "@/data/wedding";

export default function LoveStory() {
  return (
    <section className="relative overflow-hidden bg-[var(--wedding-bg)] px-5 py-24 md:px-6 md:py-32">
      {/* soft background */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wedding-primary-light)] opacity-20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* TITLE */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)] md:text-xs">
            Our Love Story
          </p>

          <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">
            Chuyện chúng mình
          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
            <span className="text-sm text-[var(--wedding-primary)]">♡</span>
            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[var(--wedding-text-muted)] md:text-base md:leading-8">
            Mỗi câu chuyện tình yêu đều bắt đầu bằng một khoảnh khắc rất riêng.
            Và đây là những dấu mốc đáng nhớ trong hành trình của chúng mình.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="relative mt-20">
          {/* CENTER LINE DESKTOP */}
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[var(--wedding-primary-light)] md:block" />

          <div className="space-y-24 md:space-y-32">
            {weddingData.loveStory.map((story, index) => {
              const reverse = index % 2 !== 0;

              return (
                <article
                  key={story.title}
                  className="relative grid items-center gap-10 md:grid-cols-2 md:gap-20"
                >
                  {/* MILESTONE DOT */}
                  <div className="absolute left-1/2 top-1/2 z-20 hidden h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] shadow-[0_10px_30px_rgba(73,107,88,0.10)] md:flex">
                    <span className="font-wedding text-lg text-[var(--wedding-primary-dark)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* IMAGE */}
                  <div className={reverse ? "md:order-2" : ""}>
                    <div className="group relative mx-auto max-w-md">
                      <div
                        className={
                          reverse
                            ? "pointer-events-none absolute -right-4 -top-4 h-full w-full rounded-[32px] border border-[var(--wedding-primary-light)] md:-right-6 md:-top-6"
                            : "pointer-events-none absolute -left-4 -top-4 h-full w-full rounded-[32px] border border-[var(--wedding-primary-light)] md:-left-6 md:-top-6"
                        }
                      />

                      <div className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
                        <Image
                          src={story.image}
                          alt={story.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition duration-1000 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div
                    className={
                      reverse
                        ? "text-center md:order-1 md:text-right"
                        : "text-center md:text-left"
                    }
                  >
                    <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--wedding-primary)]">
                      Chapter {String(index + 1).padStart(2, "0")}
                    </p>

                    <h3 className="mt-4 font-wedding text-4xl leading-tight text-[var(--wedding-primary-dark)] md:text-5xl">
                      {story.title}
                    </h3>

                    <div
                      className={
                        reverse
                          ? "mx-auto mt-6 h-px w-12 bg-[var(--wedding-primary)] md:ml-auto md:mr-0"
                          : "mx-auto mt-6 h-px w-12 bg-[var(--wedding-primary)] md:ml-0"
                      }
                    />

                    <p className="mt-7 text-sm leading-8 text-[var(--wedding-text-muted)] md:text-base">
                      {story.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* ENDING QUOTE */}
        <div className="mx-auto mt-28 max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)]">
            <span className="text-lg text-[var(--wedding-primary)]">♡</span>
          </div>

          <p className="font-wedding text-3xl leading-relaxed text-[var(--wedding-primary-dark)] md:text-4xl">
            “Và rồi, từ những điều rất bình thường,
            chúng mình đã cùng nhau tạo nên một câu chuyện thật đặc biệt.”
          </p>
        </div>
      </div>
    </section>
  );
}