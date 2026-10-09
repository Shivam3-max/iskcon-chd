"use client";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import Glyph from "../ui/Glyph";

export interface UpEvent {
  date: string;
  title: string;
  kind: string;
  fast?: string;
  slug?: string;
  href?: string;
  figure: string;
}

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "festival", label: "Festivals" },
  { id: "ekadashi", label: "Ekadashi" },
  { id: "appearance", label: "Appearance days" },
  { id: "disappearance", label: "Disappearance days" },
];
const KIND_LABEL: Record<string, string> = {
  ekadashi: "Ekadashi", festival: "Festival", appearance: "Appearance day", disappearance: "Disappearance day", observance: "Observance",
};
const KIND_DOT: Record<string, string> = {
  ekadashi: "bg-tulasi", festival: "bg-saffron", appearance: "bg-maroon", disappearance: "bg-[#6b5aa6]", observance: "bg-gold",
};
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmt = (k: string, o: Intl.DateTimeFormatOptions) => new Date(`${k}T12:00:00Z`).toLocaleDateString("en-IN", { ...o, timeZone: "UTC" });

export default function ComingUp({ events, today, aside }: { events: UpEvent[]; today: string; aside?: ReactNode }) {
  const [filter, setFilter] = useState("all");
  const [ym, setYm] = useState(today.slice(0, 7));
  const [sel, setSel] = useState<string | null>(null);

  const list = useMemo(() => events.filter((e) => filter === "all" || e.kind === filter), [events, filter]);
  const byDay = useMemo(() => {
    const m = new Map<string, UpEvent[]>();
    list.forEach((e) => m.set(e.date, [...(m.get(e.date) ?? []), e]));
    return m;
  }, [list]);

  const shown = sel ? list.filter((e) => e.date >= sel).slice(0, 6) : list.slice(0, 6);
  const [y, mo] = ym.split("-").map(Number);
  const first = new Date(Date.UTC(y, mo - 1, 1)).getUTCDay();
  const len = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const minYm = today.slice(0, 7);
  const maxYm = events.length ? events[events.length - 1].date.slice(0, 7) : minYm;
  const shift = (d: number) => setYm(new Date(Date.UTC(y, mo - 1 + d, 1)).toISOString().slice(0, 7));
  const selEvents = sel ? byDay.get(sel) ?? [] : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
      {/* list */}
      <div className="min-w-0">
        <div className="scroll-x -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="Filter events">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => { setFilter(f.id); setSel(null); }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[0.84rem] font-medium transition-colors ${filter === f.id ? "bg-maroon text-white" : "bg-ivory text-ink-soft hover:text-maroon"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {sel && (
          <p className="mt-5 flex items-center gap-3 text-[0.86rem] text-ink-soft">
            Showing from {fmt(sel, { weekday: "long", day: "numeric", month: "long" })}
            <button onClick={() => setSel(null)} className="font-semibold text-maroon underline-offset-4 hover:underline">Show from today</button>
          </p>
        )}

        <ol className="mt-6 divide-y divide-line border-y border-line">
          {shown.length === 0 && <li className="py-10 text-center text-ink-soft">Nothing of this kind in the coming months.</li>}
          {shown.map((e) => (
            <li key={e.date + e.title}>
              <Link href={e.href || (e.slug ? `/festivals/${e.slug}` : `/calendar?d=${e.date}`)} className={`group grid grid-cols-[64px_1fr_auto] items-center gap-5 py-5 transition-colors ${sel === e.date ? "bg-[#fff6e6]" : ""}`}>
                <span className="rounded-[12px] bg-ivory py-2 text-center">
                  <span className="block font-serif text-[1.8rem] font-semibold leading-none text-maroon">{Number(e.date.slice(8))}</span>
                  <span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">{fmt(e.date, { month: "short" })}</span>
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-[1.08rem] font-medium leading-snug text-ink group-hover:text-maroon sm:text-[1.3rem]">{e.title}</span>
                  <span className="mt-1 flex items-center gap-2 text-[0.86rem] text-ink-soft">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOT[e.kind] ?? "bg-gold"}`} />
                    {[fmt(e.date, { weekday: "long" }), KIND_LABEL[e.kind], e.fast].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="hidden opacity-90 transition-transform group-hover:scale-110 sm:block"><Glyph value={e.figure} className="h-11 w-11" /></span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <Link href="/calendar" className="btn btn-primary">Open the full calendar</Link>
          <a href="/api/calendar.ics" className="link text-[0.9rem] font-semibold text-maroon">Subscribe on your phone</a>
        </div>
      </div>

      {/* month calendar + ekadashi */}
      <div className="space-y-6">
        <div className="rounded-[20px] border border-line bg-paper p-5 shadow-[0_24px_50px_-40px_rgba(80,35,10,.6)]">
          <div className="flex items-center justify-between">
            <button onClick={() => shift(-1)} disabled={ym <= minYm} className="grid h-9 w-9 place-items-center rounded-full text-lg hover:bg-ivory disabled:opacity-30" aria-label="Previous month">‹</button>
            <p className="font-serif text-[1.2rem] font-semibold text-ink">{MONTHS[mo - 1]} {y}</p>
            <button onClick={() => shift(1)} disabled={ym >= maxYm} className="grid h-9 w-9 place-items-center rounded-full text-lg hover:bg-ivory disabled:opacity-30" aria-label="Next month">›</button>
          </div>
          <div className="mt-3 grid grid-cols-7 text-center text-[0.62rem] font-semibold uppercase tracking-wider text-ink-soft">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-[0.86rem]">
            {Array.from({ length: first }).map((_, i) => <span key={`b${i}`} />)}
            {Array.from({ length: len }).map((_, i) => {
              const k = `${ym}-${String(i + 1).padStart(2, "0")}`;
              const evs = byDay.get(k);
              const past = k < today;
              return (
                <button
                  key={k}
                  onClick={() => setSel(k === sel ? null : k)}
                  disabled={past}
                  className={`relative mx-auto grid h-9 w-9 place-items-center rounded-full transition-colors disabled:text-ink-soft/35 ${sel === k ? "bg-maroon font-semibold text-white" : k === today ? "ring-1 ring-maroon font-semibold text-maroon" : evs ? "font-semibold text-ink hover:bg-ivory" : "text-ink-soft hover:bg-ivory"}`}
                  aria-label={`${fmt(k, { day: "numeric", month: "long" })}${evs ? `: ${evs.map((e) => e.title).join(", ")}` : ""}`}
                >
                  {i + 1}
                  {evs && (
                    <span className="absolute bottom-1 flex gap-0.5">
                      {evs.slice(0, 3).map((e, j) => <span key={j} className={`h-1 w-1 rounded-full ${sel === k ? "bg-white" : KIND_DOT[e.kind] ?? "bg-gold"}`} />)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t border-line pt-4">
            {sel ? (
              selEvents.length ? (
                <ul className="space-y-2">
                  {selEvents.map((e) => (
                    <li key={e.title}>
                      <Link href={e.href || (e.slug ? `/festivals/${e.slug}` : `/calendar?d=${e.date}`)} className="flex items-center gap-3 rounded-[12px] bg-ivory p-2.5 hover:bg-[#fbeedd]">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-paper"><Glyph value={e.figure} className="h-7 w-7" /></span>
                        <span className="min-w-0">
                          <span className="block truncate text-[0.88rem] font-semibold text-ink">{e.title}</span>
                          <span className="text-[0.74rem] text-ink-soft">{e.fast ?? KIND_LABEL[e.kind]}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.84rem] text-ink-soft">No special observance on {fmt(sel, { day: "numeric", month: "long" })}. The temple follows its daily schedule.</p>
              )
            ) : (
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-[0.74rem] text-ink-soft">
                {["festival", "ekadashi", "appearance", "disappearance"].map((k) => (
                  <span key={k} className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${KIND_DOT[k]}`} />{KIND_LABEL[k]}</span>
                ))}
              </p>
            )}
          </div>
        </div>
        {aside}
      </div>
    </div>
  );
}
