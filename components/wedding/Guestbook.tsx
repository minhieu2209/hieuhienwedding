"use client";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { formatText, type InvitationProps } from "@/data/invitations";
import { formError, sendForm } from "@/lib/form-client";
type Wish = { id: string | number; guest_name: string; message: string; created_at: string };
export default function Guestbook({ invitation: i }: InvitationProps) {
  const c = i.copy;
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(i.wishesEnabled);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const submission = useRef<string | null>(null);
  useEffect(() => {
    if (!i.wishesEnabled) return;
    const controller = new AbortController();
    fetch(`/api/invitations/${i.id}/wishes`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (!controller.signal.aborted) { setWishes(data.wishes); setNext(data.next); setLoadError(false); }
    }).catch(() => { if (!controller.signal.aborted) setLoadError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [i.id, i.wishesEnabled, reload]);
  async function loadMore() {
    if (!next || loading) return;
    setLoading(true); setLoadError(false);
    try {
      const response = await fetch(`/api/invitations/${i.id}/wishes?cursor=${encodeURIComponent(next)}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setWishes((old) => [...old, ...data.wishes.filter((wish: Wish) => !old.some((item) => String(item.id) === String(wish.id)))]);
      setNext(data.next);
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || !i.formsEnabled) return;
    if (!name.trim()) { setError(c.labels.nameRequired); return; }
    if (!message.trim()) { setError(c.labels.messageRequired); return; }
    setSending(true); setError(""); setNotice("");
    submission.current ??= crypto.randomUUID();
    try {
      const data = await sendForm(`/api/invitations/${i.id}/wishes`, { guest_name: name, message, guest: i.guestToken, submission_id: submission.current, website: String(new FormData(event.currentTarget).get("website") ?? "") });
      setWishes((old) => [data.wish, ...old.filter((wish) => String(wish.id) !== String(data.wish.id))]);
      setName(""); setMessage(""); submission.current = null; setNotice(c.labels.wishSuccess);
    } catch (cause) { setError(formError(c, cause instanceof Error ? cause.message : undefined)); }
    finally { setSending(false); }
  }
  const unavailable = i.invalidGuest ? c.labels.invalidLink : i.wishesEnabled && i.recipientMode === "individual" ? c.labels.personalLinkRequired : c.labels.wishesUnavailable;
  const field = "mt-3 w-full border-0 border-b border-[var(--wedding-primary-light)] bg-transparent py-3 outline-none focus:border-[var(--wedding-primary)]";
  return <section className="bg-[var(--wedding-cream)] px-5 py-24 md:px-6 md:py-32">
    <div className="mx-auto max-w-6xl">
      <div className="text-center">
        <p className="text-xs tracking-[0.25em] text-[var(--wedding-primary)]">{i.names}</p>
        <h2 className="mt-5 font-wedding text-5xl text-[var(--wedding-primary-dark)] md:text-7xl">{c.labels.wishesTitle}</h2>
        <p className="mx-auto mt-7 max-w-2xl leading-8 text-[var(--wedding-text-muted)]">{c.wishesIntro}</p>
      </div>
      <div className="mt-16 grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="h-fit rounded-[34px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-bg)] p-6 shadow-lg md:p-8">
          <h3 className="font-wedding text-4xl text-[var(--wedding-primary-dark)]">{c.labels.submitWish}</h3>
          <form onSubmit={handleSubmit} noValidate className="relative mt-8">
            <label htmlFor="wishName" className="text-sm">{c.labels.name}</label>
            <input id="wishName" required maxLength={120} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder={c.labels.namePlaceholder} className={field} />
            <label htmlFor="wishMessage" className="mt-8 block text-sm">{c.labels.submitWish}</label>
            <textarea id="wishMessage" required rows={6} maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={c.labels.wishPlaceholder} className={field} />
            <div aria-hidden="true" className="absolute -left-[10000px]"><input name="website" tabIndex={-1} autoComplete="off" /></div>
            <button type="submit" disabled={sending || !i.formsEnabled} className="mt-8 w-full rounded-full bg-[var(--wedding-primary-dark)] px-6 py-4 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50">{sending ? c.labels.submitting : c.labels.submitWish}</button>
            {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
            {notice && <p role="status" className="mt-4 text-sm">{notice}</p>}
            {!i.formsEnabled && <p role="status" className="mt-4 text-sm leading-6 text-[var(--wedding-text-muted)]">{unavailable}</p>}
          </form>
          <p className="mt-8 text-center font-wedding text-2xl text-[var(--wedding-primary-dark)]">H ♡ H</p>
        </div>
        <div>
          <h3 className="font-wedding text-3xl text-[var(--wedding-primary-dark)]">{i.side === "bride" ? c.labels.guestbookBride : c.labels.guestbookGroom}</h3>
          <p className="mt-3 text-sm text-[var(--wedding-text-muted)]">{formatText(c.labels.wishesCount, { count: wishes.length })}</p>
          {loadError && <div role="alert" className="mt-6 rounded-2xl border p-6"><p>{c.labels.loadError}</p><button type="button" className="mt-3 underline" onClick={() => { setLoading(true); setReload((value) => value + 1); }}>{c.labels.retry}</button></div>}
          {!loading && !loadError && i.wishesEnabled && wishes.length === 0 && <p className="mt-6 rounded-2xl border border-[var(--wedding-primary-light)] p-8 text-center text-[var(--wedding-text-muted)]">{c.labels.emptyWishes}</p>}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {wishes.map((wish) => <article key={wish.id} className="rounded-[28px] border border-[var(--wedding-primary-light)] bg-white/85 p-6 shadow-sm">
              <p className="font-wedding text-4xl text-[var(--wedding-primary)]">“</p>
              <p className="whitespace-pre-wrap break-words text-sm leading-7">{wish.message}</p>
              <h4 className="mt-6 font-wedding text-2xl text-[var(--wedding-primary-dark)]">{wish.guest_name}</h4>
              <p className="mt-3 text-xs text-[var(--wedding-text-muted)]">{new Intl.DateTimeFormat(i.dateLocale, { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(wish.created_at))}</p>
            </article>)}
          </div>
          {loading && <p role="status" className="mt-6 text-sm">{c.labels.loadingWishes}</p>}
          {next && <button type="button" disabled={loading} onClick={loadMore} className="mt-8 rounded-full border border-[var(--wedding-primary)] px-6 py-3 disabled:opacity-50">{c.labels.loadMore}</button>}
        </div>
      </div>
    </div>
  </section>;
}
