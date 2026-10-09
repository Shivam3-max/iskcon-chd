import type { Metadata } from "next";
import Link from "next/link";
import CalendarView from "@/components/calendar/CalendarView";
import { PageHeroFor } from "@/components/ui/bits";
import { monthCalendar, todayKey } from "@/lib/vaishnava/engine";

export const metadata: Metadata = {
  title: "Vaishnava Calendar for Chandigarh",
  description: "Ekadashi fasts with parana times, festivals, appearance and disappearance days, computed for sunrise at Chandigarh.",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string; d?: string }> }) {
  const sp = await searchParams;
  const today = todayKey();
  const focus = sp.d ?? sp.m ?? today;
  const [y, m] = focus.split("-").map(Number);
  const year = y >= 1900 && y <= 2100 ? y : Number(today.slice(0, 4));
  const month = m >= 1 && m <= 12 ? m : Number(today.slice(5, 7));
  const days = monthCalendar(year, month);
  const prev = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, "0")}`;
  const next = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
  const masas = Array.from(new Set(days.map((d) => d.masa)));

  return (
    <>
      <PageHeroFor id="calendar">
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="/api/calendar.ics" className="btn btn-primary">Subscribe on your phone</a>
          <Link href="/calendar/ekadashi" className="btn btn-ghost text-maroon">Ekadashi list</Link>
        </div>
      </PageHeroFor>

      <section className="py-14 md:py-20">
        <div className="wrap">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">{masas.map((n) => `${n} masa`).join(" → ")} · Gaurabda {days[days.length - 1].gaurabda}</p>
              <h2 className="mt-2 font-serif text-[clamp(2.2rem,4vw,3.4rem)] leading-none text-ink">
                {MONTHS[month - 1]} <span className="text-ink-soft/60">{year}</span>
              </h2>
            </div>
            <nav className="flex items-center gap-2">
              <Link href={`/calendar?m=${prev}`} className="btn btn-ghost px-4 text-maroon" aria-label="Previous month">←</Link>
              <Link href="/calendar" className="btn btn-ghost px-4 text-maroon">Today</Link>
              <Link href={`/calendar?m=${next}`} className="btn btn-ghost px-4 text-maroon" aria-label="Next month">→</Link>
            </nav>
          </div>
          <CalendarView key={`${year}-${month}`} days={days} today={today} initialSelected={sp.d} />
          <p className="mt-10 max-w-3xl text-[0.85rem] leading-relaxed text-ink-soft">
            How it&rsquo;s calculated: each day takes the tithi in force at sunrise in Chandigarh (30.73° N, 76.78° E). Lunar months run new moon to new moon and are named by the sun&rsquo;s sidereal sign (Lahiri ayanamsa); a month with no solar ingress is Purushottama (Adhika). Ekadashi is moved to Dvadashi when Dashami is present at arunodaya, 96 minutes before sunrise, and Mahadvadashis are detected. Local temple announcements take precedence.
          </p>
        </div>
      </section>
    </>
  );
}
