"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import type { InvitationProps } from "@/data/invitations";

type Wish = {
  id: number;
  guest_name: string;
  message: string;
  created_at: string;
};

export default function Guestbook({ invitation }: InvitationProps) {
  const [wishes, setWishes] =
    useState<Wish[]>([]);

  const [name, setName] =
    useState(invitation.id === "chu-re/cong-ty" ? "" : invitation.recipientName);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingWishes, setLoadingWishes] =
    useState(true);

  useEffect(() => {
    async function loadWishes() {
      setLoadingWishes(true);

      const { data, error } =
        await supabase
          .from("wedding_wishes")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      setLoadingWishes(false);

      if (error) {
        console.error(
          "Load wishes:",
          error
        );

        return;
      }

      setWishes(data || []);
    }

    loadWishes();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !name.trim() ||
      !message.trim() ||
      loading
    ) {
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase
        .from("wedding_wishes")
        .insert({
          guest_name: name.trim(),
          message: message.trim(),
        })
        .select()
        .single();

    setLoading(false);

    if (error) {
      console.error(
        "Submit wish:",
        error
      );

      alert(
        "Có lỗi khi gửi lời chúc. Vui lòng thử lại."
      );

      return;
    }

    setWishes((current) => [
      data,
      ...current,
    ]);

    setName("");
    setMessage("");
  }

  function formatDate(
    value: string
  ) {
    return new Intl.DateTimeFormat(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(value));
  }

  return (
    <section className="relative overflow-hidden bg-[var(--wedding-cream)] px-5 py-24 md:px-6 md:py-32">

      {/* BACKGROUND DECORATION */}

      <div className="pointer-events-none absolute -left-40 top-16 h-96 w-96 rounded-full border border-[var(--wedding-primary-light)] opacity-40" />

      <div className="pointer-events-none absolute -right-40 bottom-16 h-96 w-96 rounded-full border border-[var(--wedding-primary-light)] opacity-40" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wedding-primary-light)] opacity-10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="text-center">

          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)] md:text-xs">
            Guestbook
          </p>

          <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">
            Những lời chúc yêu thương
          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">

            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />

            <span className="text-sm text-[var(--wedding-primary)]">
              ♡
            </span>

            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />

          </div>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[var(--wedding-text-muted)] md:text-base md:leading-8">
            Một vài lời nhắn nhỏ từ bạn
            sẽ trở thành những kỷ niệm thật
            đẹp mà {invitation.names} luôn muốn giữ lại.
          </p>

        </div>

        {/* CONTENT */}

        <div className="mt-16 grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">

          {/* FORM */}

          <div>
            <div className="sticky top-8 rounded-[34px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-bg)] p-6 shadow-[0_20px_60px_rgba(73,107,88,0.07)] md:p-8">

              <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--wedding-primary)]">
                Leave A Note
              </p>

              <h3 className="mt-4 font-wedding text-4xl text-[var(--wedding-primary-dark)]">
                Gửi lời chúc
              </h3>

              <p className="mt-4 text-sm leading-7 text-[var(--wedding-text-muted)]">
                Viết một vài dòng dành cho
                chúng mình nhé.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-8"
              >

                {/* NAME */}

                <div>
                  <label
                    htmlFor="wishName"
                    className="text-[10px] uppercase tracking-[0.28em] text-[var(--wedding-primary)]"
                  >
                    Tên của bạn
                  </label>

                  <input
                    id="wishName"
                    type="text"
                    required
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Nhập tên"
                    className="mt-3 w-full border-0 border-b border-[var(--wedding-primary-light)] bg-transparent px-0 py-3 text-[var(--wedding-text)] outline-none transition placeholder:text-[var(--wedding-text-muted)]/45 focus:border-[var(--wedding-primary)]"
                  />
                </div>

                {/* MESSAGE */}

                <div className="mt-8">

                  <label
                    htmlFor="wishMessage"
                    className="text-[10px] uppercase tracking-[0.28em] text-[var(--wedding-primary)]"
                  >
                    Lời chúc
                  </label>

                  <textarea
                    id="wishMessage"
                    required
                    rows={6}
                    value={message}
                    onChange={(event) =>
                      setMessage(
                        event.target.value
                      )
                    }
                    placeholder={`Viết lời chúc dành cho ${invitation.names}...`}
                    className="mt-3 w-full resize-none border-0 border-b border-[var(--wedding-primary-light)] bg-transparent px-0 py-3 leading-7 text-[var(--wedding-text)] outline-none transition placeholder:text-[var(--wedding-text-muted)]/45 focus:border-[var(--wedding-primary)]"
                  />

                </div>

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-9 flex w-full items-center justify-center gap-3 rounded-full bg-[var(--wedding-primary-dark)] px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-white transition duration-300 hover:bg-[var(--wedding-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {loading
                    ? "Đang gửi..."
                    : "Gửi lời chúc"}

                  {!loading && (
                    <span className="transition duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  )}

                </button>

              </form>

              <div className="mt-8 border-t border-[var(--wedding-primary-light)] pt-6 text-center">

                <p className="font-wedding text-2xl text-[var(--wedding-primary-dark)]">
                  H ♡ H
                </p>

                <p className="mt-2 text-[8px] uppercase tracking-[0.35em] text-[var(--wedding-text-muted)]">
                  {invitation.namesWithDot}
                </p>

              </div>

            </div>
          </div>

          {/* WISH WALL */}

          <div>

            <div className="mb-6 flex items-end justify-between gap-4">

              <div>

                <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--wedding-primary)]">
                  Wall Of Wishes
                </p>

                <h3 className="mt-3 font-wedding text-4xl text-[var(--wedding-primary-dark)]">
                  Lưu bút yêu thương
                </h3>

              </div>

              <p className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-[var(--wedding-text-muted)]">
                {wishes.length} lời chúc
              </p>

            </div>

            {/* LOADING */}

            {loadingWishes && (
              <div className="rounded-[28px] border border-[var(--wedding-primary-light)] bg-white/70 p-8 text-center">

                <p className="text-sm text-[var(--wedding-text-muted)]">
                  Đang tải những lời chúc...
                </p>

              </div>
            )}

            {/* EMPTY */}

            {!loadingWishes &&
              wishes.length === 0 && (
                <div className="rounded-[28px] border border-[var(--wedding-primary-light)] bg-white/70 p-8 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] text-[var(--wedding-primary)]">
                    ♡
                  </div>

                  <p className="mt-5 font-wedding text-2xl text-[var(--wedding-primary-dark)]">
                    Hãy là người đầu tiên
                  </p>

                  <p className="mt-2 text-sm leading-7 text-[var(--wedding-text-muted)]">
                    Gửi một lời chúc tới {invitation.names} nhé.
                  </p>

                </div>
              )}

            {/* WISHES */}

            {!loadingWishes &&
              wishes.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2">

                  {wishes.map(
                    (wish, index) => {
                      const rotations = [
                        "-rotate-[1deg]",
                        "rotate-[1.2deg]",
                        "rotate-[0.5deg]",
                        "-rotate-[0.7deg]",
                      ];

                      return (
                        <article
                          key={wish.id}
                          className={`relative rounded-[28px] border border-[var(--wedding-primary-light)] bg-white/85 p-6 shadow-[0_15px_40px_rgba(73,107,88,0.06)] transition duration-500 hover:-translate-y-1 hover:rotate-0 hover:shadow-[0_20px_50px_rgba(73,107,88,0.10)] ${
                            rotations[
                              index %
                                rotations.length
                            ]
                          }`}
                        >

                          {/* NOTE PIN */}

                          <div className="absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--wedding-primary)] opacity-50 shadow-sm" />

                          {/* QUOTE */}

                          <div className="mt-3 font-wedding text-4xl leading-none text-[var(--wedding-primary-light)]">
                            “
                          </div>

                          <p className="-mt-2 text-sm leading-7 text-[var(--wedding-text-muted)]">
                            {wish.message}
                          </p>

                          <div className="mt-7 border-t border-[var(--wedding-primary-light)] pt-5">

                            <div className="flex items-center justify-between gap-4">

                              <div>

                                <h4 className="font-wedding text-2xl text-[var(--wedding-primary-dark)]">
                                  {
                                    wish.guest_name
                                  }
                                </h4>

                                <p className="mt-1 text-[8px] uppercase tracking-[0.22em] text-[var(--wedding-text-muted)]">
                                  With Love
                                </p>

                              </div>

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] bg-[var(--wedding-bg)] text-sm text-[var(--wedding-primary)]">
                                ♡
                              </div>

                            </div>

                            <p className="mt-4 text-[9px] text-[var(--wedding-text-muted)]/60">
                              {formatDate(
                                wish.created_at
                              )}
                            </p>

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              )}

          </div>
        </div>

        {/* BOTTOM QUOTE */}

        <div className="mx-auto mt-24 max-w-3xl text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] bg-[var(--wedding-bg)]">
            <span className="text-lg text-[var(--wedding-primary)]">
              ♡
            </span>
          </div>

          <p className="mt-7 font-wedding text-3xl leading-relaxed text-[var(--wedding-primary-dark)] md:text-4xl">
            “Những lời chúc hôm nay sẽ là
            những kỷ niệm chúng mình muốn
            đọc lại thật nhiều năm về sau.”
          </p>

        </div>

      </div>
    </section>
  );
}
