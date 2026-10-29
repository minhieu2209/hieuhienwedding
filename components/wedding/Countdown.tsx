"use client";

import { useEffect, useState } from "react";
import type { InvitationProps } from "@/data/invitations";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateTimeLeft(dateTime: string): TimeLeft {
  const weddingTime = new Date(
    dateTime
  ).getTime();

  const now = Date.now();

  const difference = Math.max(
    weddingTime - now,
    0
  );

  return {
    days: Math.floor(
      difference / (1000 * 60 * 60 * 24)
    ),

    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),

    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),

    seconds: Math.floor(
      (difference / 1000) % 60
    ),
  };
}

export default function Countdown({ invitation }: InvitationProps) {
  const [timeLeft, setTimeLeft] =
    useState<TimeLeft>({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    const updateTime = () => {
      setMounted(true);
      setTimeLeft(calculateTimeLeft(invitation.event.dateTime));
    };
    const initialUpdate = setTimeout(updateTime, 0);
    const timer = setInterval(updateTime, 1000);
    return () => {
      clearTimeout(initialUpdate);
      clearInterval(timer);
    };
  }, [invitation.event.dateTime]);

  const items = [
    {
      value: timeLeft.days,
      label: "Ngày",
    },
    {
      value: timeLeft.hours,
      label: "Giờ",
    },
    {
      value: timeLeft.minutes,
      label: "Phút",
    },
    {
      value: timeLeft.seconds,
      label: "Giây",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--wedding-primary-dark)] px-5 py-28 text-white md:px-6 md:py-36">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

      {/* DECORATIVE CIRCLES */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full border border-white/10" />

      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full border border-white/10" />

      <div className="pointer-events-none absolute -bottom-36 -right-36 h-96 w-96 rounded-full border border-white/10" />

      {/* TOP DECORATION */}
      <div className="pointer-events-none absolute left-1/2 top-10 h-16 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-white/25" />

      <div className="relative mx-auto max-w-6xl text-center">

        {/* EYEBROW */}
        <p className="text-[10px] uppercase tracking-[0.55em] text-white/55 md:text-xs">
          Until Forever
        </p>

        {/* TITLE */}
        <h2 className="mx-auto mt-5 max-w-3xl font-wedding text-5xl leading-tight md:text-7xl">
          Ngày chúng mình
          <span className="block text-[#dceae0]">
            về chung một nhà
          </span>
        </h2>

        {/* DECORATION */}
        <div className="mx-auto mt-8 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-white/25" />

          <span className="text-sm text-white/70">
            ♡
          </span>

          <span className="h-px w-10 bg-white/25" />
        </div>

        {/* DATE */}
        <p className="mt-7 text-xs uppercase tracking-[0.35em] text-white/60">
          {invitation.event.date}
        </p>

        {/* COUNTDOWN */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item.label}
              className="relative px-2 md:px-6"
            >
              {/* divider */}
              {index !== 0 && (
                <span className="absolute left-0 top-1/2 h-16 w-px -translate-y-1/2 bg-white/15 md:h-20" />
              )}

              <p className="font-wedding text-4xl leading-none tabular-nums text-white md:text-7xl">
                {mounted
                  ? String(item.value).padStart(
                      2,
                      "0"
                    )
                  : "--"}
              </p>

              <p className="mt-4 text-[8px] uppercase tracking-[0.2em] text-white/45 md:text-[10px] md:tracking-[0.35em]">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* MONOGRAM */}
        <div className="mx-auto mt-16 flex h-24 w-24 rotate-[-8deg] items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm">
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

        {/* QUOTE */}
        <p className="mx-auto mt-10 max-w-xl font-wedding text-2xl leading-relaxed text-white/85 md:text-3xl">
          “Mỗi giây trôi qua là một chút gần hơn
          tới ngày chúng mình gọi nhau là gia đình.”
        </p>

        {/* BOTTOM TEXT */}
        <p className="mt-8 text-[9px] uppercase tracking-[0.4em] text-white/35">
          {invitation.namesWithDot}
        </p>

      </div>

      {/* BOTTOM CURVE */}
      <div className="pointer-events-none absolute -bottom-1 left-0 w-full">
        <svg
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          className="block h-[60px] w-full md:h-[90px]"
        >
          <path
            d="M0,65 C250,20 470,90 720,62 C970,35 1190,15 1440,60 L1440,110 L0,110 Z"
            fill="#fffcf8"
          />
        </svg>
      </div>
    </section>
  );
}
