import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Glyph from "@/components/ui/Glyph";
import Media from "@/components/media/Media";
import { Arrow, LotusRule } from "@/components/ui/bits";
import { getFestivals } from "@/lib/data";
import { upcoming } from "@/lib/vaishnava/engine";
import { daysLeft, longDate } from "@/lib/format";

export const revalidate = 3600;
export function generateStaticParams() {
  return getFestivals().map((f) => ({ slug: f.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFestivals().find((x) => x.slug === slug);
  return f ? { title: f.title, description: f.lede } : {};
}

export default async function FestivalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFestivals().find((x) => x.slug === slug);
  if (!f) notFound();
  const dates = upcoming(400).filter((e) => e.slug === slug).slice(0, slug === "ekadashi" ? 4 : 2);
  const others = getFestivals().filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="band-krishna relative overflow-hidden pt-[108px]">
        <div className="kolam-bg pointer-events-none absolute inset-0 opacity-[.08]" />
        <div className="wrap relative grid items-center gap-10 py-16 md:grid-cols-[1.2fr_.8fr] md:py-24">
          <div>
            <Link href="/festivals" className="text-[0.8rem] uppercase tracking-[0.18em] text-white/60 hover:text-[#f3cf7a]">← Festivals</Link>
            {f.sanskrit && <p className="deva mt-6 text-2xl text-[#f3cf7a]">{f.sanskrit}</p>}
            <h1 className="mt-2 text-[clamp(2.6rem,5vw,4.6rem)] leading-[1] text-white">{f.title}</h1>
            <p className="lede mt-6 max-w-xl">{f.lede}</p>
            {dates[0] && (
              <div className="mt-8 inline-flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-[12px] border border-white/20 px-5 py-3">
                <span className="text-[0.72rem] uppercase tracking-[0.16em] text-[#f3cf7a]">Next</span>
                <span className="font-serif text-xl text-white">{longDate(dates[0].date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="text-[0.85rem] text-white/60">in {daysLeft(dates[0].date)} days</span>
              </div>
            )}
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <Media slot={`festival.${f.slug}`} className="aspect-[4/5] rounded-t-[999px] rounded-b-[20px] ring-1 ring-[#f3cf7a]/40 ring-offset-8 ring-offset-[#161c48]" />
            <span className="absolute -bottom-6 -left-4 grid h-20 w-20 place-items-center rounded-full bg-paper shadow-lg"><Glyph value={f.figure} className="h-14 w-14" /></span>
          </div>
        </div>
      </section>

      <section className="grain py-16 md:py-24">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_360px]">
          <article>
            <p className="eyebrow">The story</p>
            <div className="mt-6 space-y-6 font-serif text-[1.4rem] leading-relaxed text-ink">
              {f.story.map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <LotusRule className="my-12 max-w-sm" />
            <p className="eyebrow">At Hare Krishna Dham</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {f.atTemple.map((a) => (
                <li key={a} className="flex gap-3 rounded border border-line bg-paper p-4 text-ink">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                  {a}
                </li>
              ))}
            </ul>
          </article>
          <aside className="h-max space-y-6 lg:sticky lg:top-[130px]">
            <div className="rounded border border-line bg-paper p-6">
              <p className="eyebrow">How to observe</p>
              <p className="mt-3 text-ink">{f.observe}</p>
            </div>
            {dates.length > 0 && (
              <div className="rounded border border-line bg-paper p-6">
                <p className="eyebrow">Coming dates</p>
                <ul className="mt-3 divide-y divide-line">
                  {dates.map((d) => (
                    <li key={d.date + d.title} className="py-2.5">
                      <Link href={`/calendar?d=${d.date}`} className="link font-serif text-lg text-ink">{longDate(d.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</Link>
                      <span className="block text-[0.82rem] text-ink-soft">{d.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link href="/donate" className="btn btn-primary w-full justify-center">Sponsor the festival</Link>
          </aside>
        </div>
      </section>

      <section className="border-t border-line py-16">
        <div className="wrap">
          <p className="eyebrow">More festivals</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {others.map((o) => (
              <Link key={o.slug} href={`/festivals/${o.slug}`} className="group flex items-center gap-5 rounded border border-line bg-paper p-5 hover:border-gold">
                <Glyph value={o.figure} className="h-20 w-20 shrink-0" />
                <span>
                  <span className="block font-serif text-xl text-ink group-hover:text-maroon">{o.title}</span>
                  <span className="mt-1 inline-flex items-center gap-2 text-sm text-maroon">Read <Arrow /></span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
