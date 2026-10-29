"use client";
import { type FormEvent, useRef, useState } from "react";
import { formatText, type InvitationProps } from "@/data/invitations";
import { formError, sendForm } from "@/lib/form-client";

const field = "mt-3 w-full border-0 border-b border-[var(--wedding-primary-light)] bg-transparent px-0 py-3 text-[var(--wedding-text)] outline-none focus:border-[var(--wedding-primary)]";
export default function RSVP({ invitation: i }: InvitationProps) {
  const c = i.copy;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState("");
  const [error, setError] = useState("");
  const submission = useRef<string | null>(null);
  const unavailable = i.invalidGuest ? c.labels.invalidLink : i.wishesEnabled && i.recipientMode === "individual" ? c.labels.personalLinkRequired : c.labels.rsvpUnavailable;
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !i.formsEnabled) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("guestName") ?? "").trim();
    if (!name) { setError(c.labels.nameRequired); return; }
    if (!attendance) { setError(c.labels.chooseAttendance); return; }
    setLoading(true); setError("");
    submission.current ??= crypto.randomUUID();
    try {
      await sendForm(`/api/invitations/${i.id}/rsvp`, {
        guest_name: name, phone: String(data.get("phone") ?? ""), attendance,
        guest_count: attendance === "no" ? 0 : Number(data.get("guestCount")),
        message: String(data.get("message") ?? ""), website: String(data.get("website") ?? ""),
        guest: i.guestToken, submission_id: submission.current,
      });
      setSubmitted(true);
    } catch (cause) { setError(formError(c, cause instanceof Error ? cause.message : undefined)); }
    finally { setLoading(false); }
  }
  if (submitted) return <section className="bg-[var(--wedding-bg)] px-5 py-28 text-center">
    <p className="text-3xl text-[var(--wedding-primary)]">♡</p>
    <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)]">{c.labels.thankYou}</h2>
    <p role="status" className="mx-auto mt-8 max-w-xl leading-8 text-[var(--wedding-text-muted)]">{c.rsvpThanks}</p>
    <p className="mt-6 font-wedding text-2xl">{i.names}</p>
    <button type="button" onClick={() => { setSubmitted(false); submission.current = null; }} className="mt-8 rounded-full border border-[var(--wedding-primary)] px-6 py-3">{c.labels.submitAnother}</button>
  </section>;
  return <section className="relative overflow-hidden bg-[var(--wedding-bg)] px-5 py-24 md:px-6 md:py-32">
    <div className="mx-auto max-w-6xl">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--wedding-primary)]">{c.labels.rsvpTitle}</p>
        <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">{c.labels.rsvpTitle}</h2>
        <p className="mx-auto mt-7 max-w-2xl leading-8 text-[var(--wedding-text-muted)]">{c.rsvpIntro}</p>
      </div>
      <div className="mx-auto mt-16 grid max-w-4xl overflow-hidden rounded-[38px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] shadow-[0_28px_90px_rgba(73,107,88,0.10)] md:grid-cols-[0.72fr_1.28fr]">
        <div className="flex flex-col items-center justify-center bg-[var(--wedding-primary-dark)] px-8 py-12 text-center text-white">
          <span className="flex h-24 w-24 rotate-[-8deg] items-center justify-center rounded-full border border-white/25 font-wedding text-2xl">H ♡ H</span>
          <h3 className="mt-10 font-wedding text-3xl">{i.names}</h3>
          <p className="mt-7 text-sm leading-7 text-white/75">{i.event.time} · {i.event.date}</p>
          <p className="mt-2 text-xs text-white/60">{c.labels.vietnamTime}</p>
          <p className="mt-4 text-sm leading-7 text-white/75">{i.event.venue}</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="p-6 md:p-10">
          <label htmlFor="guestName" className="text-sm text-[var(--wedding-primary-dark)]">{c.labels.name}</label>
          <input id="guestName" name="guestName" autoComplete="name" maxLength={120} required placeholder={c.labels.namePlaceholder} className={field} />
          <label htmlFor="phone" className="mt-8 block text-sm text-[var(--wedding-primary-dark)]">{c.labels.phone}</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} className={field} />
          <fieldset className="mt-9">
            <legend className="text-sm text-[var(--wedding-primary-dark)]">{c.labels.attendance}</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["yes", "no"] as const).map((value) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-[20px] border p-4 text-sm ${attendance === value ? "border-[var(--wedding-primary)] bg-[var(--wedding-primary-light)]" : "border-[var(--wedding-primary-light)]"}`}>
                <input type="radio" name="attendance" value={value} checked={attendance === value} onChange={() => setAttendance(value)} />
                {value === "yes" ? c.labels.attending : c.labels.notAttending}
              </label>)}
            </div>
          </fieldset>
          <label htmlFor="guestCount" className="mt-8 block text-sm text-[var(--wedding-primary-dark)]">{c.labels.guestCount}</label>
          <select id="guestCount" name="guestCount" defaultValue="1" disabled={attendance === "no"} className={field}>
            {[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{formatText(c.labels.peopleCount, { count })}</option>)}
          </select>
          <label htmlFor="message" className="mt-8 block text-sm text-[var(--wedding-primary-dark)]">{c.labels.message}</label>
          <textarea id="message" name="message" rows={4} maxLength={2000} className={field} />
          <div aria-hidden="true" className="absolute -left-[10000px]"><input name="website" tabIndex={-1} autoComplete="off" /></div>
          <button type="submit" disabled={loading || !i.formsEnabled} className="mt-9 w-full rounded-full bg-[var(--wedding-primary-dark)] px-6 py-4 text-sm text-white transition hover:bg-[var(--wedding-primary)] disabled:cursor-not-allowed disabled:opacity-50">{loading ? c.labels.submitting : c.labels.submitRsvp}</button>
          {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
          {!i.formsEnabled && <p role="status" className="mt-4 text-sm leading-6 text-[var(--wedding-text-muted)]">{unavailable}</p>}
          <p className="mt-5 text-center text-xs leading-6 text-[var(--wedding-text-muted)]">{c.privacyNotice}</p>
        </form>
      </div>
    </div>
  </section>;
}
