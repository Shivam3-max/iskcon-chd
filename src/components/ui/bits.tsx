import Link from "next/link";
import type { ReactNode } from "react";
import Glyph from "./Glyph";
import Rich from "./Rich";
import { getPageHeader } from "@/lib/data";
import { MediaView } from "../media/Media";
import { getSlot } from "@/lib/media";
import type { Tone } from "@/lib/media";
import type { Campaign } from "@/lib/content";
import { daysLeft, inr } from "@/lib/format";

export function SectionHead({
  eyebrow, title, lede, align = "left", dark, action,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className={`reveal flex flex-col gap-6 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        <p className={`eyebrow ${dark ? "on-dark" : ""}`}>{eyebrow}</p>
        <h2 className={`h2 mt-4 ${dark ? "text-ink" : "text-ink"}`}>{title}</h2>
        {lede && <p className="lede mt-4">{lede}</p>}
      </div>
      {action}
    </div>
  );
}

export function LotusRule({ className = "" }: { className?: string }) {
  return (
    <div className={`rule-lotus ${className}`} aria-hidden>
      <svg width="28" height="16" viewBox="0 0 28 16">
        <path d="M14 15 C10 11 10 5 14 1 C18 5 18 11 14 15 Z M14 15 C8 15 3 12 1 7 C6 7 11 10 14 15 Z M14 15 C20 15 25 12 27 7 C22 7 17 10 14 15 Z" fill="currentColor" opacity=".8" />
      </svg>
    </div>
  );
}

export function Progress({ raised, goal, dark }: { raised: number; goal: number; dark?: boolean }) {
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div>
      <div className={`h-[6px] overflow-hidden rounded-full bg-ivory-deep`}>
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#d9721f,#e2c27a)]" style={{ width: `${pct}%` }} />
      </div>
      <div className={`mt-2 flex justify-between text-[0.82rem] ${dark ? "text-ink-soft" : "text-ink-soft"}`}>
        <span>
          <strong className={dark ? "text-ink" : "text-ink"}>{inr(raised)}</strong> of {inr(goal)}
        </span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

const CAMPAIGN_TONE: Record<string, Tone> = { diya: "night", prasadam: "saffron", temple: "dusk", books: "marble", lotus: "rose", cow: "garden", tulasi: "garden", conch: "marble", kalash: "gold" };

export function CampaignCard({ c }: { c: Campaign }) {
  return (
    <Link href={`/donate/${c.slug}`} className="group reveal flex flex-col overflow-hidden rounded-[20px] border border-line bg-paper transition-shadow hover:shadow-[0_24px_50px_-30px_rgba(60,20,10,.5)]">
      <div className="relative">
        <MediaView m={{ type: "image", src: c.image ?? "", alt: c.title, label: c.title, tone: CAMPAIGN_TONE[c.illustration] ?? "gold" }} className="aspect-[16/10]" showLabel={false} />
        <span className="absolute -bottom-6 left-5 grid h-14 w-14 place-items-center rounded-full bg-paper shadow-md">
          <Glyph value={c.illustration} className="h-10 w-10" />
        </span>
        {c.status === "closed" && <span className="absolute right-3 top-3 rounded-sm bg-ink px-2 py-0.5 text-[0.7rem] uppercase tracking-wider text-ivory">Completed</span>}
      </div>
      <div className="flex flex-1 flex-col p-6 pt-9">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-saffron">{c.kicker}</p>
        <h3 className="h3 mt-2 text-ink group-hover:text-maroon">{c.title}</h3>
        <p className="mt-2 flex-1 text-[0.95rem] text-ink-soft">{c.summary}</p>
        <div className="mt-5">
          <Progress raised={c.raised} goal={c.goal} />
        </div>
        <p className="mt-3 text-[0.8rem] text-ink-soft">
          {c.donors.toLocaleString("en-IN")} devotees have given · {daysLeft(c.end)} days left
        </p>
      </div>
    </Link>
  );
}

export function PageHero({
  eyebrow, title, lede, figure, children, slot = "home.hero.bg", crumb,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  figure?: string;
  children?: ReactNode;
  /** media slot used as the cinematic background */
  slot?: string;
  crumb?: { label: string; href: string };
}) {
  return (
    <section className="page-hero relative isolate overflow-hidden bg-[#160a08] pt-[108px] text-white">
      <div className="absolute inset-0 -z-20">
        <MediaView m={getSlot(slot)} className="absolute inset-0" showLabel={false} ambient />
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,8,6,.88)_0%,rgba(18,8,6,.62)_45%,rgba(18,8,6,.25)_100%)]" />
      <div className="wrap relative grid items-center gap-8 pb-28 pt-12 md:grid-cols-[1fr_auto] md:pb-32 md:pt-16">
        <div className="max-w-3xl">
          <nav className="flex items-center gap-2 text-[0.74rem] uppercase tracking-[0.2em] text-white/55" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#f3cf7a]">Home</Link>
            <span>/</span>
            {crumb ? <><Link href={crumb.href} className="hover:text-[#f3cf7a]">{crumb.label}</Link><span>/</span></> : null}
            <span className="text-[#f3cf7a]">{eyebrow}</span>
          </nav>
          <h1 className="mt-5 text-[clamp(2.6rem,5vw,4.6rem)] leading-[1.02] text-white [text-shadow:0_4px_30px_rgba(0,0,0,.35)]">{title}</h1>
          {lede && <p className="mt-5 max-w-2xl text-[1.05rem] leading-relaxed text-white/80">{lede}</p>}
          {children}
        </div>
        {figure && (
          <span className="relative hidden h-52 w-52 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff8ec,#f1dcb4)] shadow-[0_30px_70px_-25px_rgba(240,140,50,.7)] ring-[6px] ring-[#e8913f]/35 md:grid">
            <Glyph value={figure} className="h-36 w-36" draw />
          </span>
        )}
      </div>
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-2px] h-[58px] w-full md:h-[82px]" aria-hidden>
        <path d="M0 50 C200 10 420 80 640 52 C860 24 1020 84 1240 58 C1340 46 1400 34 1440 38 L1440 90 L0 90 Z" fill="#fffdf8" />
      </svg>
    </section>
  );
}

export function Arrow() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden>
      <path d="M0 5 H14 M10 1 14 5 10 9" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/** Page header whose eyebrow, title, lede and icon are edited in the admin (content/pages.json). */
export function PageHeroFor({ id, slot, crumb, children }: { id: string; slot?: string; crumb?: { label: string; href: string }; children?: ReactNode }) {
  const h = getPageHeader(id);
  if (!h) return null;
  return (
    <PageHero slot={slot ?? `page.${id}`} crumb={crumb} eyebrow={h.eyebrow} title={<Rich text={h.title} />} lede={h.lede} figure={h.icon}>
      {children}
    </PageHero>
  );
}
