import Link from "next/link";
import type { ReactNode } from "react";
import TempleHero from "@/components/home/TempleHero";
import DayArc from "@/components/home/DayArc";
import ComingUp, { type UpEvent } from "@/components/home/ComingUp";
import SundayCard from "@/components/home/SundayCard";
import Illustration from "@/components/illustrations/Illustration";
import Media, { MediaView } from "@/components/media/Media";
import Gallery from "@/components/media/Gallery";
import { Arrow, CampaignCard, Progress } from "@/components/ui/bits";
import Glyph from "@/components/ui/Glyph";
import Rich from "@/components/ui/Rich";
import Toran from "@/components/ui/Toran";
import { getCampaign, getCampaigns, getFeaturedCampaign, getSevas, type Campaign } from "@/lib/content";
import { getFestivals, getHome, getPrograms, getSettings } from "@/lib/data";
import { getSlot } from "@/lib/media";
import { addDays, buildCalendar, todayKey, upcoming } from "@/lib/vaishnava/engine";
import { daysLeft, inr, longDate } from "@/lib/format";
import { fmt12 } from "@/lib/schedule";

export const revalidate = 3600;

const KIND_ICON: Record<string, string> = { ekadashi: "tulasi", appearance: "lotus", disappearance: "diya", festival: "conch", observance: "chamara" };
const HERO_FRAMES = ["hero.frame.janmashtami", "hero.frame.harinama", "hero.frame.gaura", "hero.frame.govardhana", "hero.frame.darshan", "hero.frame.ratha", "hero.frame.kartika"];

type CTA = { label: string; href: string };
// Each homepage section's editable fields (see content/home.json and the admin "Homepage" editor).
/* eslint-disable @typescript-eslint/no-explicit-any */
type S = Record<string, any>;

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="reveal">
      <p className="eyebrow">{children}</p>
    </div>
  );
}
const has = (c?: CTA) => Boolean(c && c.label && c.href);

export default async function Home() {
  const home = getHome<S>();
  const settings = getSettings();
  const festivals = getFestivals();
  const programs = getPrograms();
  const tk = todayKey();
  const today = buildCalendar(tk, tk)[0];
  const next = upcoming(60);
  const nextEk = next.find((e) => e.kind === "ekadashi");
  const nextEkParana = nextEk ? buildCalendar(addDays(nextEk.date, 1), addDays(nextEk.date, 1))[0].events.find((e) => e.parana)?.parana : undefined;
  const iconFor = (slug?: string, kind?: string) => (festivals.find((f) => f.slug === slug)?.figure ?? KIND_ICON[kind ?? ""] ?? "lotus") as string;
  const sevas = await getSevas();
  const allCampaigns = await getCampaigns();

  const render: Record<string, (s: S) => ReactNode> = {
    hero: (s) => (
      <TempleHero
        welcome={s.welcome}
        title={s.title}
        subtitle={s.subtitle}
        medallions={(s.medallions ?? []).map((m: CTA & { icon: string }) => ({ label: m.label, href: m.href, icon: <Glyph value={m.icon} className="h-[68%] w-[68%]" /> }))}
        background={<MediaView m={getSlot("home.hero.bg")} className="absolute inset-0" showLabel={false} ambient />}
        reel={s.showReel === false ? [] : HERO_FRAMES.map((id) => ({ node: <MediaView m={getSlot(id)} className="absolute inset-0" showLabel={false} ambient />, label: getSlot(id).label }))}
        next={s.showNext !== false && nextEk ? { title: nextEk.title.split(" · ")[0], when: longDate(nextEk.date, { weekday: "short", day: "numeric", month: "short" }), href: "/calendar/ekadashi" } : undefined}
        today={`${today.tithiName} · ${today.masa} masa`}
      />
    ),

    welcome: (s) => (
      <section id="welcome" className="relative overflow-hidden bg-paper pb-24 pt-16 md:pb-32 md:pt-20">
        <div className="wrap grid items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <Eyebrow>{s.eyebrow}</Eyebrow>
            <h2 className="h2 reveal mt-5 text-ink"><Rich text={s.title} /></h2>
            {(s.paragraphs ?? []).map((p: string, i: number) => (
              <p key={i} className={`reveal max-w-xl text-[1.04rem] leading-relaxed text-ink-soft ${i ? "mt-4" : "mt-7"}`}>{p}</p>
            ))}
            <div className="reveal mt-10 flex flex-wrap items-center gap-6">
              {has(s.primaryCta) && <Link href={s.primaryCta.href} className="btn btn-primary">{s.primaryCta.label}</Link>}
              {has(s.secondaryCta) && <Link href={s.secondaryCta.href} className="link inline-flex items-center gap-2 font-semibold text-maroon">{s.secondaryCta.label} <Arrow /></Link>}
            </div>
          </div>
          <div className="relative h-[520px] md:h-[600px]">
            <Media slot="home.welcome.main" showLabel={false} className="reveal-img img-shadow absolute right-0 top-0 h-[78%] w-[66%] rounded-t-[999px] rounded-b-[18px]" />
            <Media slot="home.welcome.second" className="reveal-img img-shadow absolute bottom-0 left-0 h-[46%] w-[48%] rounded-[18px] border-[6px] border-paper" />
            <Media slot="home.welcome.third" className="reveal-img img-shadow absolute bottom-[6%] right-[8%] h-[30%] w-[34%] rounded-[18px] border-[6px] border-paper" />
            {s.icon && (
              <div className="absolute left-[4%] top-[6%] w-[30%]">
                <span className="grid aspect-square w-full place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff8ec,#f6e2bd)] shadow-[0_24px_50px_-28px_rgba(120,60,10,.6)] ring-1 ring-gold/30">
                  <Glyph value={s.icon} className="h-[82%] w-[82%]" draw />
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    ),

    darshan: (s) => (
      <section className="band-lotus mandala-wm relative pb-24 pt-28 md:pb-28 md:pt-32">
        <Toran />
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>{s.eyebrow}</Eyebrow>
              <h2 className="h2 reveal mt-4 text-ink"><Rich text={s.title} /></h2>
            </div>
            {has(s.cta) && <Link href={s.cta.href} className="btn btn-primary reveal self-start md:self-auto">{s.cta.label}</Link>}
          </div>
          <div className="scroll-x -mx-5 mt-12 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-5 md:px-0">
            {(s.aartis ?? []).map((a: { slot: string; label: string; time: string }, i: number) => (
              <figure key={a.slot + i} className="reveal w-[42vw] max-w-[220px] shrink-0 snap-start md:w-auto md:max-w-none" data-delay={i * 80}>
                <Media slot={a.slot} className="lift aspect-[3/4] rounded-t-[999px] rounded-b-[14px]" showLabel={false} />
                <figcaption className="mt-4 text-center">
                  <span className="block font-serif text-[1.1rem] leading-tight text-ink md:text-[1.45rem]">{a.label}</span>
                  <span className="text-[0.85rem] font-semibold tracking-wide text-maroon">{fmt12(a.time)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          {s.showDayArc !== false && (
            <div className="reveal scroll-x mt-16 hidden overflow-x-auto rounded-[20px] bg-paper/80 p-6 md:block md:p-8">
              <div className="min-w-[760px]"><DayArc /></div>
            </div>
          )}
        </div>
      </section>
    ),

    calendar: (s) => {
      const calEvents: UpEvent[] = upcoming(150)
        .filter((e) => e.kind !== "observance" || e.major)
        .map((e) => ({ date: e.date, title: e.title, kind: e.kind, fast: e.fast, slug: e.slug, href: e.href, figure: iconFor(e.slug, e.kind) }));
      return (
        <section className="bg-paper py-24 md:py-28">
          <div className="wrap">
            <Eyebrow>{s.eyebrow} · {today.masa} masa · Gaurabda {today.gaurabda}</Eyebrow>
            <h2 className="h2 reveal mt-4 text-ink"><Rich text={s.title} /></h2>
            <div className="mt-10">
              <ComingUp
                events={calEvents}
                today={tk}
                aside={
                  nextEk && (
                    <aside className="band-krishna relative overflow-hidden rounded-[20px] p-6">
                      <Illustration figure="tulasi" className="absolute -bottom-3 right-0 h-32 w-32 opacity-90" draw={false} />
                      <p className="eyebrow">Next Ekadashi · in {daysLeft(nextEk.date)} days</p>
                      <h3 className="mt-2 font-serif text-[1.7rem] leading-tight">{nextEk.title.split(" · ")[0]}</h3>
                      <p className="mt-1 text-[0.88rem] text-white/80">{longDate(nextEk.date, { weekday: "long", day: "numeric", month: "long" })}</p>
                      {nextEkParana && (
                        <p className="mt-3 max-w-[15rem] text-[0.82rem] text-white/70">
                          Break fast {longDate(addDays(nextEk.date, 1), { weekday: "short", day: "numeric", month: "short" })}, {fmt12(nextEkParana.from)} – {fmt12(nextEkParana.to)}
                        </p>
                      )}
                      <Link href="/calendar/ekadashi" className="btn btn-light relative mt-5 px-4 py-2 text-[0.82rem]">{s.ekadashiCta || "All Ekadashis"}</Link>
                    </aside>
                  )
                }
              />
            </div>
          </div>
        </section>
      );
    },

    sunday: () => (
      <section className="bg-paper pb-24 md:pb-28">
        <div className="wrap reveal"><SundayCard /></div>
      </section>
    ),

    scripture: (s) => (
      <section className="band-starry relative overflow-hidden py-24 md:py-28">
        <div className="wrap grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <blockquote className="reveal max-w-3xl border-l-2 border-[#a98bff] pl-7 md:pl-10">
            {s.sanskrit && <p className="deva text-[1.25rem] leading-relaxed text-[#e6d6ff]/80"><Rich text={s.sanskrit} /></p>}
            <p className="mt-5 font-serif text-[clamp(1.6rem,3vw,2.5rem)] italic leading-snug text-white">&ldquo;{s.quote}&rdquo;</p>
            <footer className="mt-5 text-[0.85rem] font-semibold tracking-wide text-[#f3cf7a]">{s.source}</footer>
          </blockquote>
          {s.icon && (
            <span className="hidden h-56 w-56 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff8ec,#f1dcb4)] shadow-[0_30px_80px_-20px_rgba(169,139,255,.55)] md:grid">
              <Glyph value={s.icon} className="h-40 w-40" draw />
            </span>
          )}
        </div>
      </section>
    ),

    campaign: async (s) => {
      const c: Campaign | undefined = (s.campaign ? await getCampaign(String(s.campaign)) : undefined) ?? (await getFeaturedCampaign());
      if (!c) return null;
      const image = c.image ? { type: "image" as const, src: c.image, alt: c.title, label: c.title, tone: "night" as const } : getSlot("home.campaign");
      return (
        <section className="band-saffron mandala-wm relative pb-24 pt-28 md:pb-28 md:pt-32">
          <Toran />
          <div className="wrap grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div className="reveal relative">
              <MediaView m={image} className="img-shadow aspect-[5/4] rounded-[22px]" />
              <div className="absolute -bottom-6 left-6 right-6 rounded-[16px] bg-paper p-5 shadow-[0_20px_50px_-25px_rgba(80,30,0,.5)] md:left-10 md:right-auto md:w-[360px]">
                <Progress raised={c.raised} goal={c.goal} />
                <p className="mt-2 text-[0.8rem] text-ink-soft">{c.donors.toLocaleString("en-IN")} {s.familiesLabel || "families"} · {daysLeft(c.end)} days to go</p>
              </div>
            </div>
            <div className="pt-6 lg:pt-0">
              <div className="flex items-center gap-3">
                <Glyph value={c.illustration} className="h-14 w-14" />
                <p className="eyebrow reveal">{s.eyebrow || "Campaign"} · {c.kicker}</p>
              </div>
              <h2 className="h2 reveal mt-4 text-ink">{c.title}</h2>
              <p className="lede reveal mt-5">{c.summary}</p>
              <div className="reveal mt-8 grid grid-cols-2 gap-2.5">
                {c.tiers.map((t) => (
                  <Link key={t.amount} href={`/donate/${c.slug}?amount=${t.amount}`} className="group rounded-[12px] bg-paper/80 px-4 py-3.5 transition-colors hover:bg-paper">
                    <span className="block font-serif text-2xl font-semibold text-maroon">{inr(t.amount)}</span>
                    <span className="block text-[0.8rem] text-ink-soft">{t.label}</span>
                  </Link>
                ))}
              </div>
              <Link href={`/donate/${c.slug}`} className="btn btn-primary reveal mt-8">{s.ctaLabel || "Join the campaign"}</Link>
            </div>
          </div>
        </section>
      );
    },

    moments: (s) => (
      <section className="bg-paper py-24 md:py-28">
        <div className="wrap">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>{s.eyebrow}</Eyebrow>
              <h2 className="h2 reveal mt-4 text-ink"><Rich text={s.title} /></h2>
            </div>
            {has(s.link) && <a href={s.link.href} target="_blank" rel="noreferrer" className="link reveal inline-flex items-center gap-2 font-semibold text-maroon">{s.link.label} <Arrow /></a>}
          </div>
          <Gallery />
        </div>
      </section>
    ),

    festivals: (s) => {
      const majors = upcoming(365).filter((e) => e.major && e.slug).filter((e, i, a) => a.findIndex((x) => x.slug === e.slug) === i).slice(0, s.count || 7);
      return (
        <section className="band-krishna mandala-wm overflow-hidden py-24 md:py-28">
          <div className="wrap flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>{s.eyebrow}</Eyebrow>
              <h2 className="h2 reveal mt-4"><Rich text={s.title} em="text-[#f3cf7a]" /></h2>
            </div>
            {has(s.cta) && <Link href={s.cta.href} className="btn btn-outline-light reveal self-start md:self-auto">{s.cta.label}</Link>}
          </div>
          <div className="scroll-x mt-12 flex snap-x gap-5 overflow-x-auto px-5 pb-4 md:px-[max(36px,calc((100vw-1240px)/2+36px))]">
            {majors.map((e) => (
              <Link key={e.date + e.title} href={`/festivals/${e.slug}`} className="group reveal relative block w-[64vw] max-w-[290px] shrink-0 snap-start overflow-hidden rounded-[20px] sm:w-[290px]">
                <Media slot={`festival.${e.slug}`} className="aspect-[3/4]" showLabel={false} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e1238] via-[#0e1238]/30 to-transparent" />
                <div className="absolute right-4 top-4 grid h-14 w-14 place-items-center rounded-full bg-paper/90">
                  <Glyph value={iconFor(e.slug)} className="h-10 w-10" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#f3cf7a]">{longDate(e.date, { weekday: "short", day: "numeric", month: "long" })}</p>
                  <h3 className="mt-1 font-serif text-[1.6rem] font-medium leading-tight text-white">{e.title.split(" · ")[0]}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      );
    },

    programs: (s) => (
      <section className="band-tulasi py-24 md:py-28">
        <div className="wrap">
          <div className="text-center">
            <Eyebrow>{s.eyebrow}</Eyebrow>
            <h2 className="h2 reveal mx-auto mt-4 max-w-2xl text-ink"><Rich text={s.title} /></h2>
          </div>
          {/* phones: a swipeable row; tablets and up: a grid */}
          <div className="scroll-x -mx-5 mt-10 flex snap-x gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {programs.slice(0, s.count || 6).map((p, i) => (
              <Link key={p.slug} href={`/programs/${p.slug}`} className="lift group reveal w-[78vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-paper sm:w-auto sm:max-w-none" data-delay={(i % 3) * 90}>
                <div className="relative">
                  <Media slot={`program.${p.slug}`} className="aspect-[4/3]" showLabel={false} />
                  <div className="absolute -bottom-7 right-5 grid h-16 w-16 place-items-center rounded-full bg-paper shadow-md">
                    <Glyph value={p.figure} className="h-12 w-12" />
                  </div>
                </div>
                <div className="p-6 pt-5">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-tulasi">{p.when}</p>
                  <h3 className="mt-2 font-serif text-[1.4rem] font-medium leading-tight text-ink group-hover:text-maroon sm:text-[1.7rem]">{p.title}</h3>
                  <p className="mt-2 text-[0.94rem] text-ink-soft">{p.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),

    film: (s) => (
      <section className="bg-paper py-24 md:py-28">
        <div className="wrap">
          <div className="reveal relative overflow-hidden rounded-[24px]">
            <Media slot="home.film" className="aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9]" showLabel={false} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-0 max-w-lg p-6 text-white md:p-12">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#f3cf7a]">{s.eyebrow}{getSlot("home.film").duration ? ` · ${getSlot("home.film").duration}` : ""}</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3.4rem)] font-medium leading-none"><Rich text={s.title} em="text-[#f3cf7a]" /></h2>
              {s.text && <p className="mt-3 hidden text-white/80 md:block">{s.text}</p>}
            </div>
          </div>
        </div>
      </section>
    ),

    prabhupada: (s) => (
      <section className="band-peacock mandala-wm py-24 md:py-28">
        <div className="wrap grid items-center gap-14 lg:grid-cols-[.8fr_1.2fr]">
          <Media slot="home.prabhupada" className="reveal aspect-[4/5] w-full max-w-[260px] justify-self-center rounded-t-[999px] rounded-b-[20px] ring-1 ring-[#f3cf7a]/40 ring-offset-8 ring-offset-[#0d4148] sm:max-w-sm" />
          <div>
            <Eyebrow>{s.eyebrow}</Eyebrow>
            <h2 className="h2 reveal mt-4"><Rich text={s.title} em="text-[#f3cf7a]" /></h2>
            {s.quote && <blockquote className="reveal mt-8 border-l-2 border-[#f3cf7a] pl-6 font-serif text-[clamp(1.5rem,2.4vw,2.1rem)] italic leading-snug text-white">&ldquo;{s.quote}&rdquo;</blockquote>}
            {s.text && <p className="lede reveal mt-6 max-w-2xl">{s.text}</p>}
            <div className="reveal mt-10 flex flex-wrap gap-3">
              {has(s.primaryCta) && <Link href={s.primaryCta.href} className="btn btn-light">{s.primaryCta.label}</Link>}
              {has(s.secondaryCta) && <Link href={s.secondaryCta.href} className="btn btn-outline-light">{s.secondaryCta.label}</Link>}
            </div>
          </div>
        </div>
      </section>
    ),

    serve: (s) => {
      const featured = allCampaigns.find((c) => c.featured);
      const campaigns = allCampaigns.filter((c) => c.status === "live" && c.slug !== featured?.slug).slice(0, s.campaignCount ?? 3);
      return (
        <section className="bg-paper py-24 md:py-28">
          <div className="wrap">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <Eyebrow>{s.eyebrow}</Eyebrow>
                <h2 className="h2 reveal mt-4 text-ink"><Rich text={s.title} /></h2>
                {s.text && <p className="lede reveal mt-4">{s.text}</p>}
              </div>
              {has(s.cta) && <Link href={s.cta.href} className="btn btn-primary reveal self-start md:self-auto">{s.cta.label}</Link>}
            </div>
            <div className="scroll-x -mx-5 mt-12 flex snap-x gap-4 overflow-x-auto px-5 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
              {campaigns.map((c) => <div key={c.slug} className="flex w-[80vw] max-w-[340px] shrink-0 snap-start md:w-auto md:max-w-none"><CampaignCard c={c} /></div>)}
            </div>
            <div className="scroll-x -mx-5 mt-8 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:px-0">
              {sevas.slice(0, s.sevaCount ?? 8).map((v) => (
                <Link key={v.slug} href={`/donate/seva/${v.slug}`} className="group flex min-w-[240px] snap-start items-center gap-4 rounded-[14px] bg-ivory p-4 transition-colors hover:bg-[#fbeedd]">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-paper"><Glyph value={v.illustration} className="h-10 w-10" /></span>
                  <span>
                    <span className="block font-serif text-[1.25rem] font-medium leading-tight text-ink group-hover:text-maroon">{v.title}</span>
                    <span className="text-[0.8rem] text-ink-soft">{v.amount ? `${inr(v.amount)} ${v.unit}` : v.unit}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      );
    },

    chant: (s) => (
      <section className="band-lotus py-20">
        <div className="wrap grid items-center gap-10 md:grid-cols-[auto_1fr_auto]">
          <Glyph value={s.icon} className="mx-auto h-36 w-36" draw />
          <div className="reveal text-center md:text-left">
            {s.mantra && <p className="deva text-[1.5rem] text-maroon">{s.mantra}</p>}
            <h2 className="mt-3 font-serif text-[clamp(1.9rem,3vw,2.7rem)] font-medium text-ink"><Rich text={s.title} /></h2>
            {s.text && <p className="mt-2 text-ink-soft">{s.text}</p>}
          </div>
          {has(s.cta) && <Link href={s.cta.href} className="btn btn-primary reveal justify-self-center">{s.cta.label}</Link>}
        </div>
      </section>
    ),

    visit: (s) => (
      <section className="bg-paper">
        <div className="grid lg:grid-cols-2">
          <div className="px-5 py-20 md:px-9 lg:pl-[max(36px,calc((100vw-1240px)/2+36px))] lg:pr-16">
            <Eyebrow>{s.eyebrow}</Eyebrow>
            <h2 className="h2 reveal mt-4 text-ink"><Rich text={s.title} /></h2>
            <p className="reveal mt-5 text-lg text-ink-soft">{settings.address.join(", ")}</p>
            <dl className="reveal mt-10 grid gap-6 sm:grid-cols-2">
              <div><dt className="eyebrow">Morning</dt><dd className="mt-2 text-ink"><Rich text={s.morning} /></dd></div>
              <div><dt className="eyebrow">Evening</dt><dd className="mt-2 text-ink"><Rich text={s.evening} /></dd></div>
              <div><dt className="eyebrow">Call</dt><dd className="mt-2"><a href={settings.phoneHref} className="link text-ink">{settings.phone}</a></dd></div>
              <div><dt className="eyebrow">Write</dt><dd className="mt-2"><a href={`mailto:${settings.email}`} className="link text-ink">{settings.email}</a></dd></div>
            </dl>
            <div className="reveal mt-10 flex flex-wrap gap-3">
              <a href={s.cta?.href || settings.maps} target="_blank" rel="noreferrer" className="btn btn-primary">{s.cta?.label || "Get directions"}</a>
              {has(s.secondaryCta) && <Link href={s.secondaryCta.href} className="btn btn-ghost text-maroon">{s.secondaryCta.label}</Link>}
            </div>
          </div>
          <div className="relative min-h-[420px] bg-ivory-deep">
            <iframe title="Map to ISKCON Chandigarh" src={settings.mapsEmbed} className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>
    ),
  };

  const blocks = await Promise.all(
    home.order
      .filter((id) => render[id] && home.sections[id]?.visible !== false)
      .map(async (id) => ({ id, node: await render[id](home.sections[id] ?? {}) })),
  );
  return <>{blocks.map((b) => <div key={b.id} data-section={b.id} className="contents">{b.node}</div>)}</>;
}
