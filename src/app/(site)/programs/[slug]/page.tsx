import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Glyph from "@/components/ui/Glyph";
import Media from "@/components/media/Media";
import { Arrow, PageHero } from "@/components/ui/bits";
import Toran from "@/components/ui/Toran";
import { getPrograms } from "@/lib/data";

export function generateStaticParams() {
  return getPrograms().map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPrograms().find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.intro } : {};
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPrograms().find((x) => x.slug === slug);
  if (!p) notFound();
  const external = p.cta.href.startsWith("http");
  const ext = external ? { target: "_blank", rel: "noreferrer" } : {};
  const others = getPrograms().filter((x) => x.slug !== slug).slice(0, 4);

  return (
    <>
      <PageHero slot={`program.${p.slug}`} crumb={{ label: "Programs", href: "/programs" }} eyebrow={p.title} title={p.title} lede={p.tagline} figure={p.figure}>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <a href={p.cta.href} {...ext} className="btn btn-primary">{p.cta.label} <Arrow /></a>
          <span className="rounded-full border border-white/25 px-4 py-2 text-[0.8rem] text-white/80">{p.when}</span>
        </div>
      </PageHero>

      <section className="py-16 md:py-24">
        <div className="wrap grid items-start gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <article>
            <p className="font-serif text-[clamp(1.6rem,2.4vw,2.1rem)] leading-snug text-ink">{p.intro}</p>
            <div className="mt-6 space-y-5 text-ink-soft">
              {p.body.map((b, i) => <p key={i}>{b}</p>)}
            </div>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {p.points.map((pt) => (
                <li key={pt} className="flex items-center gap-3 rounded-[14px] bg-ivory px-4 py-3.5 text-[0.95rem] text-ink">
                  <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0 text-tulasi"><path d="M8 15 C5 11 5 6 8 1 C11 6 11 11 8 15 Z" fill="currentColor" /></svg>
                  {pt}
                </li>
              ))}
            </ul>
          </article>
          {/* photo collage */}
          <div className="relative h-[520px]">
            <Media slot={`program.${p.slug}.2`} className="reveal-img img-shadow absolute right-0 top-0 h-[64%] w-[72%] rounded-[22px]" />
            <Media slot={`program.${p.slug}.3`} className="reveal-img img-shadow absolute bottom-0 left-0 h-[52%] w-[58%] rounded-[22px] border-[6px] border-paper" />
            <span className="absolute bottom-[8%] right-[6%] grid h-28 w-28 place-items-center rounded-full bg-paper shadow-[0_20px_40px_-20px_rgba(80,35,10,.5)] ring-1 ring-gold/30">
              <Glyph value={p.figure} className="h-20 w-20" draw />
            </span>
          </div>
        </div>
      </section>

      <section className="band-saffron mandala-wm relative py-20 text-center">
        <Toran />
        <div className="wrap max-w-3xl pt-6">
          <span className="kicker">Be part of it</span>
          <h2 className="h2 text-ink">{p.cta.label}</h2>
          <p className="lede mx-auto mt-4 max-w-xl">Every program at the temple runs on the service of volunteers and the support of well-wishers. There is a place for you.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={p.cta.href} {...ext} className="btn btn-primary">{p.cta.label} <Arrow /></a>
            <Link href="/contact?topic=volunteer" className="btn btn-ghost text-maroon">Volunteer with us</Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="wrap">
          <span className="kicker">Explore</span>
          <h2 className="font-serif text-3xl text-ink">Other programs</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <Link key={o.slug} href={`/programs/${o.slug}`} className="lift group overflow-hidden rounded-[18px] border border-line bg-paper">
                <Media slot={`program.${o.slug}`} className="aspect-[4/3]" showLabel={false} />
                <div className="flex items-center gap-3 p-5">
                  <span className="flex-1 font-serif text-xl text-ink group-hover:text-maroon">{o.title}</span>
                  <Glyph value={o.figure} className="h-12 w-12" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
