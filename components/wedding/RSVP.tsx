"use client";

import {
  FormEvent,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import type { InvitationProps } from "@/data/invitations";

export default function RSVP({ invitation }: InvitationProps) {
  const [submitted, setSubmitted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading || !supabase) return;

    setLoading(true);

    const formData = new FormData(
      event.currentTarget
    );

    const guestName = String(
      formData.get("guestName") || ""
    ).trim();

    const phone = String(
      formData.get("phone") || ""
    ).trim();

    const attendance = String(
      formData.get("attendance") || ""
    );

    const guestCount = Number(
      formData.get("guestCount") || 1
    );

    const message = String(
      formData.get("message") || ""
    ).trim();

    const { error } = await supabase
      .from("wedding_rsvp")
      .insert({
        guest_name: guestName,
        phone: phone || null,
        attendance,
        guest_count: guestCount,
        message: message || null,
      });

    setLoading(false);

    if (error) {
      console.error(
        "RSVP error:",
        error
      );

      alert(
        "Có lỗi khi gửi xác nhận. Vui lòng thử lại."
      );

      return;
    }

    setSubmitted(true);
  }

  /*
   * SUCCESS VIEW
   */
  if (submitted) {
    return (
      <section className="relative overflow-hidden bg-[var(--wedding-bg)] px-5 py-28 md:px-6 md:py-36">

        {/* background */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wedding-primary-light)] opacity-30 blur-3xl" />

        <div className="relative mx-auto max-w-2xl text-center">

          {/* ICON */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--wedding-primary)] bg-[var(--wedding-cream)] shadow-[0_15px_40px_rgba(73,107,88,0.10)]">

            <span className="text-2xl text-[var(--wedding-primary-dark)]">
              ♡
            </span>

          </div>

          <p className="mt-8 text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)]">
            Thank You
          </p>

          <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">
            Cảm ơn bạn
          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">

            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />

            <span className="text-sm text-[var(--wedding-primary)]">
              ♡
            </span>

            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />

          </div>

          <p className="mx-auto mt-8 max-w-lg text-sm leading-8 text-[var(--wedding-text-muted)] md:text-base">
            Chúng mình đã nhận được
            phản hồi của bạn. Cảm ơn bạn
            đã dành thời gian xác nhận
            tham dự ngày vui của {invitation.names}.
          </p>

          <p className="mt-8 font-wedding text-2xl text-[var(--wedding-primary-dark)]">
            Hẹn gặp bạn trong ngày đặc biệt nhé.
          </p>

          <button
            type="button"
            onClick={() =>
              setSubmitted(false)
            }
            className="mt-10 rounded-full border border-[var(--wedding-primary)] px-7 py-3 text-[10px] uppercase tracking-[0.25em] text-[var(--wedding-primary-dark)] transition duration-300 hover:bg-[var(--wedding-primary-dark)] hover:text-white"
          >
            Gửi phản hồi khác
          </button>

        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[var(--wedding-bg)] px-5 py-24 md:px-6 md:py-32">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute -left-36 top-20 h-80 w-80 rounded-full border border-[var(--wedding-primary-light)] opacity-50" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full border border-[var(--wedding-primary-light)] opacity-50" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--wedding-primary-light)] opacity-20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="text-center">

          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--wedding-primary)] md:text-xs">
            Kindly Reply
          </p>

          <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">
            Xác nhận tham dự
          </h2>

          <div className="mx-auto mt-7 flex items-center justify-center gap-3">

            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />

            <span className="text-sm text-[var(--wedding-primary)]">
              ♡
            </span>

            <span className="h-px w-9 bg-[var(--wedding-primary)] opacity-60" />

          </div>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-[var(--wedding-text-muted)] md:text-base md:leading-8">
            Sự hiện diện của bạn là
            niềm vui lớn đối với chúng mình.
            Hãy cho {invitation.names} biết bạn có thể tham dự nhé.
          </p>

        </div>

        {/* RSVP CARD */}
        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-[38px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] shadow-[0_28px_90px_rgba(73,107,88,0.10)] md:rounded-[46px]">

          <div className="grid md:grid-cols-[0.72fr_1.28fr]">

            {/* LEFT DECORATIVE PANEL */}
            <div className="relative flex min-h-[340px] flex-col items-center justify-center overflow-hidden bg-[var(--wedding-primary-dark)] px-8 py-12 text-center text-white md:min-h-[680px]">

              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border border-white/10" />

              <div className="pointer-events-none absolute -bottom-28 -right-28 h-72 w-72 rounded-full border border-white/10" />

              <p className="text-[9px] uppercase tracking-[0.45em] text-white/50">
                Répondez
                s&apos;il vous plaît
              </p>

              <div className="mt-9 flex h-24 w-24 rotate-[-8deg] items-center justify-center rounded-full border border-white/25 bg-white/5">

                <div className="text-center">

                  <p className="font-wedding text-xl font-light italic text-[#dceae0]/75">
                    H
                  </p>

                  <p className="my-1 text-sm text-[#dceae0]">
                    ♡
                  </p>

                  <p className="font-wedding text-xl font-light italic text-[#dceae0]/75">
                    H
                  </p>

                </div>

              </div>

              <h3 className="mt-10 font-wedding text-4xl leading-tight md:text-5xl">
                Will you join us?
              </h3>

              <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">
                Hãy dành một chút thời gian
                để xác nhận sự hiện diện
                của bạn trong ngày vui
                của chúng mình.
              </p>

              <div className="mt-9 h-px w-16 bg-white/25" />

              <p className="mt-8 text-[9px] uppercase tracking-[0.35em] text-white/40">
                {invitation.namesWithDot}
              </p>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-10 lg:p-12"
            >

              {/* NAME */}
              <div>
                <label
                  htmlFor="guestName"
                  className="text-[10px] uppercase tracking-[0.28em] text-[var(--wedding-primary)]"
                >
                  Họ và tên
                </label>

                <input
                  id="guestName"
                  name="guestName"
                  type="text"
                  required
                  defaultValue={invitation.id === "groom/friends" ? "" : invitation.recipientName}
                  placeholder="Tên của bạn"
                  className="mt-3 w-full border-0 border-b border-[var(--wedding-primary-light)] bg-transparent px-0 py-3 text-[var(--wedding-text)] outline-none transition placeholder:text-[var(--wedding-text-muted)]/45 focus:border-[var(--wedding-primary)]"
                />
              </div>

              {/* PHONE */}
              <div className="mt-8">

                <label
                  htmlFor="phone"
                  className="text-[10px] uppercase tracking-[0.28em] text-[var(--wedding-primary)]"
                >
                  Số điện thoại
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Số điện thoại"
                  className="mt-3 w-full border-0 border-b border-[var(--wedding-primary-light)] bg-transparent px-0 py-3 text-[var(--wedding-text)] outline-none transition placeholder:text-[var(--wedding-text-muted)]/45 focus:border-[var(--wedding-primary)]"
                />

              </div>

              {/* ATTENDANCE */}
              <fieldset className="mt-10">

                <legend className="text-[10px] uppercase tracking-[0.28em] text-[var(--wedding-primary)]">
                  Bạn có thể tham dự không?
                </legend>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <label className="cursor-pointer">

                    <input
                      type="radio"
                      name="attendance"
                      value="yes"
                      required
                      className="peer sr-only"
                    />

                    <div className="rounded-[20px] border border-[var(--wedding-primary-light)] px-4 py-5 text-center transition duration-300 peer-checked:border-[var(--wedding-primary)] peer-checked:bg-[var(--wedding-primary-light)]">

                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] text-[var(--wedding-primary-dark)] peer-checked:border-[var(--wedding-primary)]">
                        ♡
                      </div>

                      <p className="mt-3 text-sm font-medium text-[var(--wedding-text)]">
                        Mình sẽ tham dự
                      </p>

                      <p className="mt-1 text-xs text-[var(--wedding-text-muted)]">
                        Hẹn gặp hai bạn nhé
                      </p>

                    </div>

                  </label>

                  <label className="cursor-pointer">

                    <input
                      type="radio"
                      name="attendance"
                      value="no"
                      required
                      className="peer sr-only"
                    />

                    <div className="rounded-[20px] border border-[var(--wedding-primary-light)] px-4 py-5 text-center transition duration-300 peer-checked:border-[var(--wedding-primary)] peer-checked:bg-[var(--wedding-primary-light)]">

                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wedding-primary-light)] text-[var(--wedding-primary-dark)]">
                        ×
                      </div>

                      <p className="mt-3 text-sm font-medium text-[var(--wedding-text)]">
                        Tiếc quá, mình không thể
                      </p>

                      <p className="mt-1 text-xs text-[var(--wedding-text-muted)]">
                        Gửi lời chúc từ xa
                      </p>

                    </div>

                  </label>

                </div>

              </fieldset>

              {/* GUEST COUNT */}
              <div className="mt-9">

                <label
                  htmlFor="guestCount"
                  className="text-[10px] uppercase tracking-[0.28em] text-[var(--wedding-primary)]"
                >
                  Số người tham dự
                </label>

                <select
                  id="guestCount"
                  name="guestCount"
                  defaultValue="1"
                  className="mt-3 w-full border-0 border-b border-[var(--wedding-primary-light)] bg-transparent px-0 py-3 text-[var(--wedding-text)] outline-none focus:border-[var(--wedding-primary)]"
                >
                  <option value="1">
                    1 người
                  </option>

                  <option value="2">
                    2 người
                  </option>

                  <option value="3">
                    3 người
                  </option>

                  <option value="4">
                    4 người
                  </option>

                  <option value="5">
                    5 người
                  </option>
                </select>

              </div>

              {/* MESSAGE */}
              <div className="mt-9">

                <label
                  htmlFor="message"
                  className="text-[10px] uppercase tracking-[0.28em] text-[var(--wedding-primary)]"
                >
                  Lời nhắn
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Gửi một lời nhắn tới chúng mình..."
                  className="mt-3 w-full resize-none border-0 border-b border-[var(--wedding-primary-light)] bg-transparent px-0 py-3 leading-7 text-[var(--wedding-text)] outline-none transition placeholder:text-[var(--wedding-text-muted)]/45 focus:border-[var(--wedding-primary)]"
                />

              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading || !supabase}
                className="group mt-10 flex w-full items-center justify-center gap-3 rounded-full bg-[var(--wedding-primary-dark)] px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-white transition duration-300 hover:bg-[var(--wedding-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? "Đang gửi..."
                  : "Gửi xác nhận"}

                {!loading && (
                  <span className="transition duration-300 group-hover:translate-x-1">
                    →
                  </span>
                )}

              </button>

              {!supabase && (
                <p role="status" className="mt-5 text-center text-sm leading-6 text-[var(--wedding-text-muted)]">
                  Xác nhận trực tuyến hiện chưa khả dụng. Bạn vui lòng liên hệ trực tiếp với cô dâu hoặc chú rể nhé.
                </p>
              )}

              <p className="mt-5 text-center text-[10px] leading-5 text-[var(--wedding-text-muted)]/60">
                Thông tin phản hồi chỉ được {invitation.names} sử dụng
                để chuẩn bị cho ngày cưới.
              </p>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
