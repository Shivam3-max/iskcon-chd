"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CalDay, CalEvent } from "@/lib/vaishnava/engine";
import { fmt12 } from "@/lib/schedule";

const KINDS = [
  { id: "all", label: "Everything" },
  { id: "ekadashi", label: "Ekadashi" },
  { id: "festival", label: "Festivals" },
  { id: "appearance", label: "Appearance days" },
  { id: "disappearance", label: "Disappearance days" },
] as const;

const KIND_STYLE: Record<string, string> = {
  ekadashi: "bg-[#e3eedd] text-[#2f5a2c] border-[#bcd3b2]",
  festival: "bg-[#f8e3c8] text-[#8a3f0c] border-[#efc89a]",
  appearance: "bg-[#f6dede] text-[#7a1e22] border-[#e6b9b9]",
  disappearance: "bg-[#e7e3f0] text-[#47386e] border-[#cbc3df]",
  observance: "bg-[#efe8da] text-[#5d4a42] border-[#ddd0b8]",
};

const DOT: Record<string, string> = { ekadashi: "bg-[#4f7a4a]", festival: "bg-[#d9772b]", appearance: "bg-[#7a1e22]", disappearance: "bg-[#6b5aa6]", observance: "bg-[#b88a2e]" };

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Moon({ tithi }: { tithi: number }) {
  // lit fraction of the moon for this tithi, drawn as a tiny phase glyph
  const phase = ((tithi + 0.5) / 30) * 2 * Math.PI;
  const lit = (1 - Math.cos(phase)) / 2;
  const waxing = tithi < 15;
  const rx = Math.abs(1 - 2 * lit) * 6;
  const sweep = lit > 0.5 ? 1 : 0;
  const d = waxing
    ? `M7 1 A6 6 0 0 1 7 13 A${rx} 6 0 0 ${sweep} 7 1`
    : `M7 1 A6 6 0 0 0 7 13 A${rx} 6 0 0 ${1 - sweep} 7 1`;
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <circle cx="7" cy="7" r="6" fill="#e9e0cf" stroke="#b9a582" strokeWidth=".6" />
      <path d={d} fill="#f6c868" />
    </svg>
  );
}

export default function CalendarView({ days, today, initialSelected }: { days: CalDay[]; today: string; initialSelected?: string }) {
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sel, setSel] = useState<string>(initialSelected ?? (days.some((d) => d.date === today) ? today : days[0].date));

  const match = (e: CalEvent) => !e.parana && (kind === "all" || e.kind === kind);
  const selected = days.find((d) => d.date === sel) ?? days[0];
  const lead = new Date(`${days[0].date}T12:00:00Z`).getUTCDay();
  const listDays = useMemo(() => days.filter((d) => d.events.some(match)), [days, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
        <div className="scroll-x -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-[0.85rem] transition-colors ${kind === k.id ? "border-maroon bg-maroon text-ivory" : "border-line bg-paper text-ink-soft hover:border-gold"}`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 overflow-hidden rounded border border-line text-[0.85rem]">
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 ${view === v ? "bg-ink text-ivory" : "bg-paper text-ink-soft"}`}>
              {v === "grid" ? "Month" : "List"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {view === "grid" ? (
          <div>
            <div className="grid grid-cols-7 border-l border-t border-line text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
              {WEEK.map((w) => (
                <div key={w} className="border-b border-r border-line bg-ivory-deep/60 px-2 py-2">{w}</div>
              ))}
              {Array.from({ length: lead }).map((_, i) => (
                <div key={`b${i}`} className="border-b border-r border-line bg-ivory/40" />
              ))}
              {days.map((d) => {
                const evs = d.events.filter(match);
                const ek = d.events.some((e) => e.kind === "ekadashi");
                const isToday = d.date === today;
                return (
                  <button
                    key={d.date}
                    onClick={() => {
                      setSel(d.date);
                      // on phones the day's details sit below the grid: bring them into view
                      if (window.innerWidth < 1024) setTimeout(() => document.getElementById("day-detail")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                    }}
                    className={`group relative flex min-h-[64px] flex-col border-b border-r border-line p-1 sm:min-h-[92px] sm:p-1.5 text-left normal-case tracking-normal transition-colors md:min-h-[118px] md:p-2.5 ${sel === d.date ? "bg-[#fff6e3] ring-1 ring-inset ring-gold" : "bg-paper hover:bg-ivory"} ${ek && (kind === "all" || kind === "ekadashi") ? "bg-[linear-gradient(180deg,#f1f6ec,#fffdf8)]" : ""}`}
                  >
                    <span className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className={`font-serif text-[1.05rem] leading-none sm:text-[1.25rem] md:text-[1.5rem] ${isToday ? "grid h-7 w-7 place-items-center rounded-full bg-maroon text-ivory sm:h-8 sm:w-8" : "text-ink"}`}>
                        {Number(d.date.slice(8))}
                      </span>
                      <Moon tithi={d.tithi} />
                    </span>
                    <span className="mt-1 hidden text-[0.68rem] leading-tight text-ink-soft md:block">{d.tithiName}</span>
                    {/* phones: one coloured dot per observance; larger screens: labelled chips */}
                    <span className="mt-auto flex flex-wrap gap-0.5 pt-1 sm:hidden">
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.title} className={`h-1.5 w-1.5 rounded-full ${DOT[e.kind] ?? "bg-gold"}`} />
                      ))}
                    </span>
                    <span className="mt-1 hidden flex-col gap-1 sm:flex">
                      {evs.slice(0, 2).map((e) => (
                        <span key={e.title} className={`truncate rounded-sm border px-1 py-px text-[0.64rem] leading-tight md:text-[0.7rem] ${KIND_STYLE[e.kind]}`}>
                          {e.title.split(" · ")[0]}
                        </span>
                      ))}
                      {evs.length > 2 && <span className="text-[0.66rem] text-ink-soft">+{evs.length - 2} more</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8rem] text-ink-soft">
              {Object.entries({ ekadashi: "Ekadashi", festival: "Festival", appearance: "Appearance", disappearance: "Disappearance" }).map(([k, l]) => (
                <span key={k} className="inline-flex items-center gap-1.5"><span className={`h-3 w-3 rounded-sm border ${KIND_STYLE[k]}`} />{l}</span>
              ))}
              <span className="inline-flex items-center gap-1.5"><Moon tithi={10} /> Moon on that day</span>
            </p>
          </div>
        ) : (
          <ol className="divide-y divide-line border-y border-line">
            {listDays.length === 0 && <li className="py-10 text-center text-ink-soft">Nothing of this kind this month.</li>}
            {listDays.map((d) => (
              <li key={d.date}>
                <button onClick={() => setSel(d.date)} className={`grid w-full grid-cols-[70px_1fr] gap-5 py-5 text-left ${sel === d.date ? "bg-[#fff6e3]" : ""}`}>
                  <span className="text-center">
                    <span className="block font-serif text-3xl leading-none text-maroon">{Number(d.date.slice(8))}</span>
                    <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">{WEEK[d.weekday]}</span>
                  </span>
                  <span className="space-y-2">
                    {d.events.filter(match).map((e) => (
                      <span key={e.title} className="block">
                        <span className="font-serif text-xl text-ink">{e.title}</span>
                        <span className="block text-[0.85rem] text-ink-soft">{[e.fast, e.note].filter(Boolean).join(" · ") || d.tithiName}</span>
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}

        {/* day detail */}
        <aside id="day-detail" className="h-max scroll-mt-[120px] rounded border border-line bg-paper p-6 lg:sticky lg:top-[130px]">
          <p className="eyebrow">{selected.date === today ? "Today" : "Selected day"}</p>
          <h3 className="mt-2 font-serif text-[1.9rem] leading-tight text-ink">
            {new Date(`${selected.date}T12:00:00Z`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}
          </h3>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-4 text-[0.88rem]">
            <div><dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">Tithi</dt><dd className="text-ink">{selected.tithiName}</dd></div>
            <div><dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">Month</dt><dd className="text-ink">{selected.masa}</dd></div>
            <div><dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">Sunrise</dt><dd className="text-ink">{fmt12(selected.sunrise)}</dd></div>
            <div><dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">Sunset</dt><dd className="text-ink">{fmt12(selected.sunset)}</dd></div>
            <div><dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">Paksha</dt><dd className="text-ink">{selected.paksha}</dd></div>
            <div><dt className="text-[0.68rem] uppercase tracking-[0.14em] text-ink-soft">Gaurabda</dt><dd className="text-ink">{selected.gaurabda}</dd></div>
          </dl>
          {selected.events.length === 0 ? (
            <p className="mt-5 text-[0.92rem] text-ink-soft">No special observance. A good day for an extra round of japa.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {selected.events.map((e) => (
                <li key={e.title} className="border-l-2 border-gold pl-4">
                  <p className="font-serif text-[1.2rem] leading-snug text-ink">{e.title}</p>
                  {e.parana && <p className="text-[0.9rem] text-ink">Between {fmt12(e.parana.from)} and {fmt12(e.parana.to)}</p>}
                  {e.fast && <p className="text-[0.86rem] text-maroon">{e.fast}</p>}
                  {e.note && <p className="text-[0.86rem] text-ink-soft">{e.note}</p>}
                  {e.slug && <Link href={`/festivals/${e.slug}`} className="link mt-1 inline-block text-[0.85rem] font-semibold text-maroon">Read the story</Link>}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
