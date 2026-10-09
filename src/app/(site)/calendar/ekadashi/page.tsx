import type { Metadata } from "next";
import Link from "next/link";
import { PageHeroFor } from "@/components/ui/bits";
import { addDays, buildCalendar, todayKey } from "@/lib/vaishnava/engine";
import { fmt12 } from "@/lib/schedule";
import { longDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Ekadashi Dates & Parana Times, Chandigarh",
  description: "Every Ekadashi for the next twelve months with fasting day and the window to break the fast, calculated for Chandigarh.",
};

export default function EkadashiPage() {
  const from = todayKey();
  const to = addDays(from, 370);
  const cal = buildCalendar(from, addDays(to, 2));
  const rows = cal.flatMap((d, i) =>
    d.events
      .filter((e) => e.kind === "ekadashi")
      .map((e) => ({ day: d, e, parana: cal[i + 1]?.events.find((x) => x.parana)?.parana, paranaDate: cal[i + 1]?.date })),
  ).filter((r) => r.day.date <= to);

  return (
    <>
      <PageHeroFor id="ekadashi" crumb={{ label: "Calendar", href: "/calendar" }} />
      <section className="py-14 md:py-20">
        <div className="wrap">
          <div className="overflow-x-auto rounded border border-line bg-paper">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-ivory-deep/60 text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fast on</th>
                  <th className="px-5 py-3 font-semibold">Ekadashi</th>
                  <th className="px-5 py-3 font-semibold">Month</th>
                  <th className="px-5 py-3 font-semibold">Break fast</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ day, e, parana, paranaDate }, i) => (
                  <tr key={day.date} className={i === 0 ? "bg-[#f3f7ee]" : ""}>
                    <td className="px-5 py-4">
                      <Link href={`/calendar?d=${day.date}`} className="link font-serif text-lg text-ink">{longDate(day.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</Link>
                      {i === 0 && <span className="ml-2 rounded-sm bg-tulasi px-1.5 py-0.5 text-[0.68rem] uppercase tracking-wider text-white">Next</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-serif text-lg text-maroon">{e.title.split(" · ")[0]}</span>
                      {e.title.includes("·") && <span className="block text-[0.82rem] text-saffron">{e.title.split(" · ")[1]}</span>}
                    </td>
                    <td className="px-5 py-4 text-[0.92rem] text-ink-soft">{day.masa} · {day.paksha}</td>
                    <td className="px-5 py-4 text-[0.92rem] text-ink">
                      {parana && paranaDate ? (
                        <>
                          {longDate(paranaDate, { weekday: "short", day: "numeric", month: "short" })}
                          <span className="block text-ink-soft">{fmt12(parana.from)} – {fmt12(parana.to)}</span>
                        </>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ["What to avoid", "All grains (rice, wheat, millets), beans and pulses, and anything made from them. Many devotees also avoid salt containing additives."],
              ["What to eat", "Fruit, milk products, nuts, potatoes and other vegetables, buckwheat, sabudana and rajgira. Some devotees keep a full fast, or take only water."],
              ["Breaking the fast", "Break the fast with a grain preparation offered to Krishna, inside the parana window. Missing it is said to cancel much of the benefit of the fast."],
            ].map(([t, d]) => (
              <div key={t} className="reveal border-t-2 border-gold pt-5">
                <h3 className="font-serif text-2xl text-ink">{t}</h3>
                <p className="mt-2 text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
