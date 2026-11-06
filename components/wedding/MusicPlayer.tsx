"use client";

import type { InvitationProps } from "@/data/invitations";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const tracks = [
  {
    title: "Một Đời x Người Tốt Nhất Cho Em",
    artist: "14 Casper",
    src: "/music/MotDoixNguoiTotNhatChoEm.mp3",
  },
  {
    title: "Hoa và Váy",
    artist: "Quốc Thiên",
    src: "/music/HoaVaVay.mp3",
  },
  // {
  //   title: "Một Đời",
  //   artist: "14 Casper,Bon Nghiêm,buitruonglinh",
  //   src: "/music/MotDoi.mp3",
  // },
  {
    title: "Lễ Đường",
    artist: "Kai Đinh",
    src: "/music/LeDuong.mp3",
  },
  // {
  //   title: "Beautiful In White",
  //   artist: "Shane Filan",
  //   src: "/music/BeautifulInWhite.mp3",
  // },
  // {
  //   title: "Váy cưới",
  //   artist: "Kai Đinh & Erik",
  //   src: "/music/VayCuoi.mp3",
  // },
];
function MarqueeText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const measureRef =
    useRef<HTMLSpanElement | null>(null);

  const [shouldScroll, setShouldScroll] =
    useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const textElement = measureRef.current;

    if (!container || !textElement) return;

    function checkOverflow() {
      const containerWidth =
        containerRef.current?.clientWidth ?? 0;

      const textWidth =
        measureRef.current?.offsetWidth ?? 0;

      setShouldScroll(
        textWidth > containerWidth
      );
    }

    // đo ngay
    checkOverflow();

    // đo lại sau khi browser render
    const frame =
      requestAnimationFrame(
        checkOverflow
      );

    // đo lại khi font load xong
    document.fonts?.ready.then(() => {
      checkOverflow();
    });

    // theo dõi cả container và text
    const observer =
      new ResizeObserver(() => {
        checkOverflow();
      });

    observer.observe(container);
    observer.observe(textElement);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden whitespace-nowrap ${className}`}
    >
      {/* Invisible text dùng để đo */}
      <span
        ref={measureRef}
        className="pointer-events-none invisible absolute inline-block whitespace-nowrap"
      >
        {text}
      </span>

      {shouldScroll ? (
        <div className="music-marquee">
          <span className="inline-block shrink-0">
            {text}
          </span>

          <span
            aria-hidden="true"
            className="inline-block shrink-0"
          >
            {text}
          </span>
        </div>
      ) : (
        <span className="block truncate">
          {text}
        </span>
      )}
    </div>
  );
}

export default function MusicPlayer({ invitation }: InvitationProps) {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const shouldPlay = useRef(true);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(true);

  const [playing, setPlaying] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [currentTrack, setCurrentTrack] =
    useState(0);

  // Try autoplay on arrival; browsers that require activation get a gesture fallback.
  // The intent ref stays false after an explicit pause, including across track changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let cancelled = false;
    let starting = false;
    const gestures = ["click", "touchend", "keydown"] as const;
    function removeGestures() {
      for (const gesture of gestures) document.removeEventListener(gesture, resumeOnInteraction);
    }
    function resumeOnInteraction(event: Event) {
      if (event.target instanceof Element && event.target.closest("[data-music-player]")) return;
      if (event instanceof KeyboardEvent && (event.metaKey || event.ctrlKey || event.altKey)) return;
      startPlayback();
    }
    function startPlayback() {
      if (cancelled || starting || !shouldPlay.current) return;
      starting = true;
      audio!.play().then(() => {
        if (cancelled || !shouldPlay.current) return;
        setShouldAutoPlay(true);
        removeGestures();
      }).catch((error: unknown) => {
        if (cancelled || !shouldPlay.current) return;
        if ((error as { name?: string })?.name === "NotAllowedError") {
          // Release native autoplay's pending load before waiting for a gesture.
          audio!.autoplay = false;
          audio!.preload = "metadata";
          audio!.load();
          setShouldAutoPlay(false);
          for (const gesture of gestures) document.addEventListener(gesture, resumeOnInteraction);
        }
      }).finally(() => { starting = false; });
    }

    audio.addEventListener("play", removeGestures);
    startPlayback();
    return () => { cancelled = true; removeGestures(); audio.removeEventListener("play", removeGestures); };
  }, [currentTrack]);

  async function toggleMusic() {
    const audio = audioRef.current;

    if (!audio) return;

    try {
      if (playing) {
        shouldPlay.current = false;
        setShouldAutoPlay(false);
        audio.pause();
        setPlaying(false);
      } else {
        shouldPlay.current = true;
        setShouldAutoPlay(true);
        await audio.play();
        setPlaying(true);
      }
    } catch (error) {
      console.error(
        "Music playback error:",
        error
      );
    }
  }

  function nextTrack() {
    setCurrentTrack((current) =>
      current === tracks.length - 1
        ? 0
        : current + 1
    );
  }

  function previousTrack() {
    setCurrentTrack((current) =>
      current === 0
        ? tracks.length - 1
        : current - 1
    );
  }

  function selectTrack(index: number) {
    shouldPlay.current = true;
    setShouldAutoPlay(true);
    if (index === currentTrack) {
      audioRef.current?.play().catch(() => setPlaying(false));
    } else {
      setCurrentTrack(index);
    }
  }

  return (
    <>
      {/* AUDIO */}

      <audio
        ref={audioRef}
        src={tracks[currentTrack].src}
        autoPlay={shouldAutoPlay}
        preload={shouldAutoPlay ? "auto" : "metadata"}
        onEnded={nextTrack}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => { shouldPlay.current = false; setShouldAutoPlay(false); setPlaying(false); }}
      />

      {/* =========================
          PLAYLIST PANEL
      ========================== */}

      <div
        data-music-player="panel"
        className={`fixed bottom-24 right-4 z-[89] w-[calc(100vw-32px)] max-w-[350px] origin-bottom-right transition-all duration-500 md:bottom-28 md:right-7 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain rounded-[30px] border border-white/50 bg-[var(--wedding-cream)]/95 shadow-[0_25px_80px_rgba(30,50,38,0.25)] backdrop-blur-xl">

          {/* PLAYER HEADER */}

          <div className="relative overflow-hidden bg-[var(--wedding-primary-dark)] px-6 pb-6 pt-6 text-white">

            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full border border-white/10" />

            <div className="relative">

              <div className="flex items-start justify-between gap-3">

                {/* <div className="min-w-0">
                  <p className="font-wedding text-xl leading-relaxed">
                    {invitation.copy.labels.musicHeading}
                  </p>
                </div> */}

                <button
                  type="button"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label={invitation.copy.labels.closePlaylist}
                >
                  ×
                </button>

              </div>

              {/* CURRENT SONG */}

              <div className="mt-7 flex items-center gap-4">

                <div
                  className="music-disc flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10"
                  style={{ animationPlayState: playing ? "running" : "paused" }}
                >
                  <span className="font-wedding text-base">
                     H ♡ H
                  </span>
                </div>

<div className="min-w-0 flex-1 overflow-hidden">
  <MarqueeText
    text={tracks[currentTrack].title}
    className="font-wedding text-2xl"
  />

  <p className="mt-1 truncate text-[9px] uppercase tracking-[0.25em] text-white/45">
    {tracks[currentTrack].artist}
  </p>
</div>

              </div>

              {/* CONTROLS */}

              <div className="mt-7 flex items-center justify-center gap-5">

                <button
                  type="button"
                  onClick={previousTrack}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:bg-white/10 hover:text-white"
                  aria-label={invitation.copy.labels.previousTrack}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                  >
                    <path
                      d="M8 6V18"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                    <path
                      d="M18 7L10 12L18 17V7Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={toggleMusic}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[var(--wedding-primary-dark)] shadow-lg transition hover:scale-105"
                  aria-label={
                    playing
                      ? invitation.copy.labels.pause
                      : invitation.copy.labels.play
                  }
                >
                  {playing ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                    >
                      <path
                        d="M9 7V17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <path
                        d="M15 7V17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5 translate-x-[1px]"
                    >
                      <path
                        d="M9 6L18 12L9 18V6Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={nextTrack}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:bg-white/10 hover:text-white"
                  aria-label={invitation.copy.labels.nextTrack}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                  >
                    <path
                      d="M16 6V18"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                    <path
                      d="M6 7L14 12L6 17V7Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

              </div>

            </div>
          </div>

          {/* SONG LIST */}

          <div className="max-h-[310px] overflow-y-auto p-3">

            {tracks.map(
              (track, index) => {
                const active =
                  currentTrack === index;

                return (
                  <button
                    key={track.src}
                    type="button"
                    onClick={() =>
                      selectTrack(index)
                    }
                    className={`group flex w-full items-center gap-4 rounded-[20px] px-4 py-3 text-left transition duration-300 ${
                      active
                        ? "bg-[var(--wedding-primary-light)]"
                        : "hover:bg-[var(--wedding-bg)]"
                    }`}
                  >

                    {/* NUMBER / PLAYING */}

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                        active
                          ? "border-[var(--wedding-primary)] bg-[var(--wedding-primary-dark)] text-white"
                          : "border-[var(--wedding-primary-light)] text-[var(--wedding-primary-dark)]"
                      }`}
                    >
                      {active &&
                      playing ? (
                        <div className="flex h-4 items-end gap-[2px]">
                          <span className="music-bar h-2 w-[2px] bg-current" />
                          <span className="music-bar music-bar-delay-1 h-4 w-[2px] bg-current" />
                          <span className="music-bar music-bar-delay-2 h-3 w-[2px] bg-current" />
                        </div>
                      ) : (
                        <span className="text-[9px]">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      )}
                    </div>

                    {/* INFO */}

<div className="min-w-0 flex-1 overflow-hidden">
  <MarqueeText
    text={track.title}
    className={`font-wedding text-xl ${
      active
        ? "text-[var(--wedding-primary-dark)]"
        : "text-[var(--wedding-text)]"
    }`}
  />

  <p className="mt-1 truncate text-[8px] uppercase tracking-[0.2em] text-[var(--wedding-text-muted)]">
    {track.artist}
  </p>
</div>

                    {active && (
                      <span className="text-xs text-[var(--wedding-primary)]">
                        ♡
                      </span>
                    )}

                  </button>
                );
              }
            )}

          </div>

          {/* BOTTOM */}

          <div className="border-t border-[var(--wedding-primary-light)] px-5 py-4 text-center">

            <p className="text-[8px] uppercase tracking-[0.35em] text-[var(--wedding-text-muted)]/60">
              {invitation.namesWithDot}
            </p>

          </div>

        </div>
      </div>

      {/* =========================
          FLOATING BUTTON
      ========================== */}

      <div data-music-player="controls" className="fixed bottom-5 right-5 z-[90] flex items-center gap-3 md:bottom-7 md:right-7">

        {/* PLAY / PAUSE QUICK BUTTON */}

        {open && (
          <button
            type="button"
            onClick={toggleMusic}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-[var(--wedding-cream)] text-[var(--wedding-primary-dark)] shadow-[0_10px_30px_rgba(30,50,38,0.15)] transition hover:scale-105"
            aria-label={
              playing
                ? invitation.copy.labels.pause
                : invitation.copy.labels.play
            }
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              {playing
                ? <path d="M9 7V17M15 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                : <path d="M9 6L18 12L9 18V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />}
            </svg>
          </button>
        )}

        {/* OPEN PLAYLIST */}

        <button
          type="button"
          onClick={() => {
            setOpen((current) => !current);
            if (shouldPlay.current && !playing) audioRef.current?.play().catch(() => {});
          }}
          className="group relative"
          aria-label={invitation.copy.labels.openPlaylist}
        >

          {playing && (
            <span className="music-ring absolute inset-0 rounded-full border border-[var(--wedding-primary)] opacity-50" />
          )}

          <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-[var(--wedding-primary-dark)] text-white shadow-[0_12px_35px_rgba(30,50,38,0.25)] transition duration-300 group-hover:scale-105">
            <span data-music-player="disc" className="music-disc flex items-center justify-center" style={{ animationPlayState: playing ? "running" : "paused" }}>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={`h-5 w-5 ${open ? "invisible" : ""}`}
                aria-hidden="true"
              >
                <path
                  d="M10 18V7.8L17 6V15.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="7.5"
                  cy="18"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />

                <circle
                  cx="14.5"
                  cy="15.5"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </span>
            {open && <span className="absolute inset-0 flex items-center justify-center text-xl">×</span>}

          </span>
        </button>

      </div>
    </>
  );
}
