import Link from "next/link";
import Illustration from "../illustrations/Illustration";
import Media from "../media/Media";
import { Arrow } from "../ui/bits";
import { getSunday } from "@/lib/sunday";
import { fmt12 } from "@/lib/schedule";
import { getSettings } from "@/lib/data";
import { longDate } from "@/lib/format";

/** "This Sunday at the temple": the weekly Love Feast, dated and checked against the calendar. */
export default function SundayCard() {
  const SITE = getSettings();
  const { info, date, isToday, day, festival } = getSunday();
  return (
    <div className="grid overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#fff5e6_0%,#fde5c8_100%)] ring-1 ring-[#f0d3ad] lg:grid-cols-[.95fr_1.05fr]">
      {/* imagery */}
      <div className="relative min-h-[340px] lg:min-h-full">
        <Media slot="home.sunday" className="absolute inset-0" showLabel={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute left-5 top-5 rounded-[18px] bg-paper/95 px-5 py-3 text-center shadow-[0_20px_40px_-20px_rgba(60,20,5,.6)] backdrop-blur">
          <span className="block text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-saffron">{isToday ? "Today" : "Sunday"}</span>
          <span className="block font-serif text-[2.6rem] font-semibold leading-none text-maroon">{Number(date.slice(8))}</span>
          <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">{longDate(date, { month: "short" })}</span>
        </div>
        <Media slot="home.sunday.kirtan" className="absolute bottom-5 right-5 aspect-[4/3] w-[42%] max-w-[220px] rounded-[16px] border-4 border-paper shadow-lg" showLabel={false} />
      </div>

      {/* details */}
      <div className="p-7 md:p-10 lg:p-12">
        <p className="eyebrow">{isToday ? "Today at the temple" : "This Sunday at the temple"}</p>
        <h2 className="h2 mt-3 text-ink">{info.title}</h2>
        <p className="mt-3 max-w-lg text-ink-soft">{info.tagline}</p>

        <div className="mt-5 flex flex-wrap gap-2 text-[0.8rem]">
          <span className="rounded-full bg-paper px-3 py-1 font-semibold text-maroon">{fmt12(info.start)} – {fmt12(info.end)}</span>
          <span className="rounded-full bg-paper px-3 py-1 text-ink-soft">{day.tithiName} · {day.masa} masa</span>
          {festival && (
            <Link href={festival.slug ? `/festivals/${festival.slug}` : `/calendar?d=${date}`} className="rounded-full bg-maroon px-3 py-1 font-semibold text-white">
              Also: {festival.title.split(" · ")[0]}
            </Link>
          )}
        </div>

        <ol className="relative mt-8 space-y-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-[#e6c79c]">
          {info.program.map((p) => (
            <li key={p.time} className="relative grid grid-cols-[18px_76px_1fr] items-baseline gap-2">
              <span className="relative top-[2px] h-[11px] w-[11px] rounded-full border-2 border-saffron bg-paper" />
              <span className="text-[0.9rem] font-semibold tabular-nums text-maroon">{fmt12(p.time)}</span>
              <span>
                <span className="block font-serif text-[1.2rem] font-semibold text-ink">{p.title}</span>
                <span className="block text-[0.88rem] text-ink-soft">{p.detail}</span>
              </span>
            </li>
          ))}
        </ol>

        {info.kids && (
          <p className="mt-6 flex items-center gap-3 rounded-[14px] bg-paper/80 px-4 py-3 text-[0.86rem] text-ink">
            <Illustration figure="children" className="h-10 w-10 shrink-0" draw={false} />
            {info.kids}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="/api/sunday.ics" className="btn btn-primary">Add every Sunday to my calendar</a>
          <a href={SITE.maps} target="_blank" rel="noreferrer" className="btn btn-ghost text-maroon">Directions</a>
          {info.sponsorSeva && (
            <Link href={`/donate/seva/${info.sponsorSeva}`} className="arrow-slide inline-flex items-center gap-2 text-[0.9rem] font-semibold text-maroon">
              Sponsor a Sunday feast <Arrow />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
