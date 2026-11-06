"use client";

import { useEffect, useRef, useState } from "react";
import { formatText, type InvitationProps } from "@/data/invitations";
import { galleryImages as images } from "@/data/gallery";
import WeddingImage from "./WeddingImage";

export default function Gallery({ invitation: i }: InvitationProps) {
  const c = i.copy;
  const [{ page, direction, retained }, setAlbum] = useState({ page: 0, direction: "next", retained: [0, 1] });
  const [nearAlbum, setNearAlbum] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const isOpen = selected !== null;
  const touch = useRef<number | null>(null);
  const album = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  function turn(delta: number) {
    setAlbum(current => {
      const next = Math.max(0, Math.min(images.length - 1, current.page + delta));
      if (next === current.page) return current;
      return { page: next, direction: delta > 0 ? "next" : "previous", retained: [...new Set([...current.retained, next - 1, next, next + 1])].filter(index => index >= 0 && index < images.length) };
    });
  }
  useEffect(() => {
    if (!album.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setNearAlbum(true); observer.disconnect(); }
    }, { rootMargin: "400px" });
    observer.observe(album.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!sheet.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

const startAngle = direction === "next" ? 28 : -18;

const animation = sheet.current.animate([
  {
    transform: `rotateY(${startAngle}deg)`,
    opacity: 0.5
  },
  {
    transform: "rotateY(0deg)",
    opacity: 1
  },
], {
  duration: 600,
  easing: "ease"
});

return () => animation.cancel();
  }, [page, direction]);
  function openPhoto() {
    trigger.current = document.activeElement as HTMLButtonElement;
    setSelected(page);
  }
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelected(current => current === null ? null : (current + 1) % images.length);
      if (event.key === "ArrowLeft") setSelected(current => current === null ? null : (current + images.length - 1) % images.length);
      if (event.key === "Tab") {
        const buttons = [...(document.querySelector('[role="dialog"]')?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
        const first = buttons[0], last = buttons.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    window.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", keyboard);
      trigger.current?.focus({ preventScroll: true });
    };
    // Navigation within the lightbox must not reset focus or the scroll lock.
  }, [isOpen]);
  const photoAlt = (index: number) => formatText(c.labels.photoAlt, { coupleNames: i.names, number: index + 1 });
  return <>
    <section id="album" className="overflow-hidden bg-[var(--wedding-bg)] px-5 py-20 md:px-10 md:py-24">
      <div className="text-center">
        <p className="text-[15px] uppercase tracking-[0.3em] text-[var(--wedding-primary)]">{c.labels.galleryEyebrow}</p>
        <h2 className="mt-4 font-gallery text-5xl font-normal leading-relaxed text-[var(--wedding-primary-dark)] md:text-5xl">
          {c.labels.galleryTitle}
        </h2>
      </div>
      <div className="relative mx-auto mt-10 max-w-xl">
        <div ref={album} role="group" aria-label={c.labels.galleryEyebrow} tabIndex={0}
        className="album-book relative rounded-r-2xl bg-[#d6ddcf] p-3 pl-5 shadow-[0_20px_50px_rgba(41,54,46,0.16)] outline-offset-8 md:p-5 md:pl-8"
        onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); turn(1); } if (event.key === "ArrowLeft") { event.preventDefault(); turn(-1); } }}
        onTouchStart={event => { touch.current = event.changedTouches[0].clientX; }}
        onTouchEnd={event => { if (touch.current !== null) { const delta = touch.current - event.changedTouches[0].clientX; if (Math.abs(delta) > 45) turn(delta > 0 ? 1 : -1); } touch.current = null; }}>
        <div className="pointer-events-none absolute inset-y-0 left-1 w-3 bg-gradient-to-r from-[#74856d]/30 to-transparent" />
        <div ref={sheet} className="album-sheet relative bg-[#fffcf8] p-2 pb-4 shadow-md md:p-4">
          <button type="button" onClick={openPhoto} aria-label={formatText(c.labels.photoNumber, { number: page + 1 })} className="relative block aspect-[3/4] w-full bg-[#eeeee7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#496b58]">
            {retained.map(index => <WeddingImage key={index} src={images[index]} alt={photoAlt(index)} fill hidden={index !== page} loading={nearAlbum ? "eager" : "lazy"} sizes="(max-width: 640px) 85vw, 520px" className="object-contain" />)}
          </button>
          <p aria-live="polite" aria-atomic="true" className="mt-4 text-center font-wedding text-sm tracking-[0.2em] text-[var(--wedding-text-muted)]">{String(page + 1).padStart(2, "0")} / {images.length}</p>
        </div>
        </div>
        <button type="button" onClick={() => turn(-1)} disabled={page === 0} aria-label={c.labels.previousPhoto} className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)]/95 text-2xl text-[var(--wedding-primary-dark)] shadow-md transition hover:bg-[var(--wedding-surface)] disabled:opacity-25 md:-left-6 md:h-12 md:w-12">←</button>
        <button type="button" onClick={() => turn(1)} disabled={page === images.length - 1} aria-label={c.labels.nextPhoto} className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)]/95 text-2xl text-[var(--wedding-primary-dark)] shadow-md transition hover:bg-[var(--wedding-surface)] disabled:opacity-25 md:-right-6 md:h-12 md:w-12">→</button>
      </div>
    </section>
    {selected !== null && <div role="dialog" aria-modal="true" aria-label={c.labels.galleryTitle} className="site-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-[#101712]/95 p-4 backdrop-blur-md md:p-8">
      <button ref={closeButton} type="button" onClick={() => setSelected(null)} aria-label={c.labels.closePhoto} className="absolute right-5 top-5 z-20 h-11 w-11 rounded-full border border-white/20 bg-white/10 text-xl text-white">×</button>
      <p className="absolute left-5 top-7 text-xs tracking-widest text-white/70">{String(selected + 1).padStart(2, "0")} / {images.length}</p>
      <button type="button" onClick={() => setSelected((selected + images.length - 1) % images.length)} aria-label={c.labels.previousPhoto} className="absolute left-3 top-1/2 z-20 h-11 w-11 rounded-full bg-black/30 text-3xl text-white">‹</button>
      <div className="relative h-[78vh] w-full"><WeddingImage src={images[selected]} alt={photoAlt(selected)} fill quality={95} loading="eager" sizes="(max-width: 812px) 100vw, 812px" className="object-contain" /></div>
      <button type="button" onClick={() => setSelected((selected + 1) % images.length)} aria-label={c.labels.nextPhoto} className="absolute right-3 top-1/2 z-20 h-11 w-11 rounded-full bg-black/30 text-3xl text-white">›</button>
    </div>}
  </>;
}
