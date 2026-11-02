import type { InvitationProps } from "@/data/invitations";

export default function SaveTheDate({ invitation: i }: InvitationProps) {
  const [year, month, weddingDay] = i.event.isoDate.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, n) => n + 1)];
  const monthLabel = new Intl.DateTimeFormat(i.dateLocale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
  return <section id="save-the-date" className="bg-[var(--wedding-bg)] px-5 py-16 md:px-10 md:py-20">
    <h2 className="text-center font-wedding text-4xl text-[var(--wedding-primary-dark)] md:text-5xl">{i.copy.labels.calendarTitle}</h2>
    <div className="mx-auto mt-9 max-w-lg rounded-[32px] border border-[var(--wedding-primary-light)] bg-[var(--wedding-cream)] px-4 py-8 shadow-sm md:px-10">
      <h3 className="text-center font-wedding text-2xl capitalize text-[var(--wedding-primary-dark)]">{monthLabel}</h3>
      <div className="mt-7 grid grid-cols-7 text-center">
        {i.copy.weekdays.map(day => <div key={day} className="pb-4 text-xs text-[var(--wedding-text-muted)]">{day}</div>)}
        {cells.map((day, index) => <div key={index} className="flex h-11 min-w-0 items-center justify-center md:h-14">
          {day !== null && <div className={day === weddingDay ? "relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wedding-primary-dark)] text-sm text-white md:h-11 md:w-11" : "flex h-9 w-9 items-center justify-center text-sm md:h-11 md:w-11"}>
            {day}{day === weddingDay && <span className="absolute -right-1 -top-2 text-sm text-[var(--wedding-primary)]">♥</span>}
          </div>}
        </div>)}
      </div>
    </div>
  </section>;
}
