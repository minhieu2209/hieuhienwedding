"use client";

import Image from "next/image";
import type { InvitationProps } from "@/data/invitations";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const images = Array.from({ length: 6 }, (_, index) => ({
  src: `/images/gallery/gallery-${index + 1}.jpg`,
}));

const layoutClasses = [
  "col-span-2 row-span-2 md:col-span-7 md:row-span-4",
  "col-span-1 row-span-1 md:col-span-5 md:row-span-2",
  "col-span-1 row-span-1 md:col-span-5 md:row-span-2",
  "col-span-1 row-span-2 md:col-span-4 md:row-span-3",
  "col-span-1 row-span-2 md:col-span-4 md:row-span-3",
  "col-span-2 row-span-2 md:col-span-4 md:row-span-3",
];

const directions = [
  "left",
  "right",
  "up",
  "down",
];

export default function Gallery({ invitation }: InvitationProps) {
  const galleryRef =
    useRef<HTMLDivElement | null>(null);

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const isOpen = selectedIndex !== null;

  /*
   * Theo dõi khi từng ảnh đi vào viewport
   * để kích hoạt hiệu ứng reveal.
   */
  useEffect(() => {
    if (
      !galleryRef.current
    ) {
      return;
    }

    const elements =
      galleryRef.current.querySelectorAll<HTMLElement>(
        "[data-gallery-reveal]"
      );

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add(
              "gallery-is-visible"
            );

            observer.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -5% 0px",
        }
      );

    elements.forEach(
      (element) => {
        const direction =
          directions[Math.floor(Math.random() * directions.length)];

        element.classList.add(
          `gallery-reveal-${direction}`
        );

        observer.observe(element);
      }
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Lightbox controls
   */

  function openImage(index: number) {
    setSelectedIndex(index);
  }

  function closeImage() {
    setSelectedIndex(null);
  }

  function showPrevious() {
    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      return current === 0
        ? images.length - 1
        : current - 1;
    });
  }

  function showNext() {
    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      return current ===
        images.length - 1
        ? 0
        : current + 1;
    });
  }

  /*
   * Keyboard control + khóa scroll
   * khi lightbox đang mở.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        closeImage();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen]);

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--wedding-cream)] px-4 py-24 md:px-6 md:py-32">

        {/* BACKGROUND DECORATION */}

        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full border border-[var(--wedding-primary-light)] opacity-40" />

        <div className="pointer-events-none absolute -right-40 bottom-16 h-96 w-96 rounded-full border border-[var(--wedding-primary-light)] opacity-40" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wedding-primary-light)] opacity-10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="text-center">

            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)] md:text-xs">
              Our Memories
            </p>

            <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">
              Khoảnh khắc của chúng mình
            </h2>

            <div className="mx-auto mt-7 flex items-center justify-center gap-3">

              <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />

              <span className="text-sm text-[var(--wedding-primary)]">
                ♡
              </span>

              <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />

            </div>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[var(--wedding-text-muted)] md:text-base md:leading-8">
              Một vài khoảnh khắc chúng mình
              muốn lưu giữ trong hành trình
              đẹp nhất của hai người.
            </p>

          </div>

          {/* GALLERY GRID */}

          <div
            ref={galleryRef}
            className="mt-16 grid auto-rows-[145px] grid-cols-2 gap-3 md:auto-rows-[115px] md:grid-cols-12 md:gap-5"
          >

            {images.map(
              (image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() =>
                    openImage(index)
                  }
                  data-gallery-reveal
                  style={{
                    transitionDelay: `${
                      (index % 3) * 120
                    }ms`,
                  }}
                  className={`gallery-reveal group relative overflow-hidden rounded-[24px] text-left md:rounded-[32px] ${layoutClasses[index]}`}
                  aria-label={`Mở ảnh ${
                    index + 1
                  }`}
                >

                  <Image
                    src={image.src}
                    alt={`${invitation.names} - Ảnh cưới ${index + 1}`}
                    fill
                    sizes={
                      index === 0
                        ? "(max-width: 768px) 100vw, 60vw"
                        : "(max-width: 768px) 50vw, 35vw"
                    }
                    className="object-cover transition duration-1000 ease-out group-hover:scale-105"
                  />

                  {/* OVERLAY */}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60 transition duration-500 group-hover:opacity-80" />

                  {/* VIEW LABEL */}

                  <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:bottom-5 md:right-5">

                    <span className="text-[9px] uppercase tracking-[0.25em] text-white">
                      View
                    </span>

                  </div>

                </button>
              )
            )}

          </div>

          {/* QUOTE */}

          <div className="mx-auto mt-20 max-w-3xl text-center">

            <p className="font-wedding text-3xl leading-relaxed text-[var(--wedding-primary-dark)] md:text-4xl">
              “Có những khoảnh khắc chỉ
              kéo dài vài giây, nhưng sẽ ở
              lại trong ký ức suốt cả một
              đời.”
            </p>

            <p className="mt-7 text-[9px] uppercase tracking-[0.4em] text-[var(--wedding-primary)]">
              {invitation.namesWithDot}
            </p>

          </div>

        </div>
      </section>

      {/* =========================
          LIGHTBOX
      ========================== */}

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101712]/95 p-4 backdrop-blur-md md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Wedding gallery"
        >

          {/* CLOSE */}

          <button
            type="button"
            onClick={closeImage}
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl text-white transition hover:bg-white/20 md:right-8 md:top-8"
            aria-label="Đóng ảnh"
          >
            ×
          </button>

          {/* COUNTER */}

          <div className="absolute left-5 top-6 z-20 text-[10px] uppercase tracking-[0.3em] text-white/60 md:left-8 md:top-8">

            {String(
              selectedIndex + 1
            ).padStart(2, "0")}

            <span className="mx-2 text-white/30">
              /
            </span>

            {String(
              images.length
            ).padStart(2, "0")}

          </div>

          {/* PREVIOUS */}

          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20 md:left-8"
            aria-label="Ảnh trước"
          >
            ‹
          </button>

          {/* NEXT */}

          <button
            type="button"
            onClick={showNext}
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition hover:bg-white/20 md:right-8"
            aria-label="Ảnh tiếp theo"
          >
            ›
          </button>

          {/* IMAGE */}

          <div className="relative h-[78vh] w-[90vw] max-w-6xl">

            <Image
              src={
                images[selectedIndex]
                  .src
              }
              alt={
                `${invitation.names} - Ảnh cưới ${selectedIndex + 1}`
              }
              fill
              sizes="100vw"
              priority
              className="object-contain"
            />

          </div>

          {/* BOTTOM INFO */}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center md:bottom-7">

            <p className="font-wedding text-xl text-white md:text-2xl">
              {invitation.names}
            </p>

            <p className="mt-1 text-[8px] uppercase tracking-[0.35em] text-white/40">
              Our Memories
            </p>

          </div>

        </div>
      )}
    </>
  );
}
