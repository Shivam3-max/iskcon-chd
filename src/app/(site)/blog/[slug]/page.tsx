import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Glyph from "@/components/ui/Glyph";
import { MediaView } from "@/components/media/Media";
import { LotusRule } from "@/components/ui/bits";
import { getPosts } from "@/lib/data";
import { longDate } from "@/lib/format";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPosts().find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPosts().find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <article className="pb-24 pt-[140px]">
      <div className="wrap max-w-3xl text-center">
        <Link href="/blog" className="text-[0.8rem] uppercase tracking-[0.18em] text-ink-soft hover:text-maroon">← Journal</Link>
        <p className="eyebrow mt-8">{p.category} · {longDate(p.date, { day: "numeric", month: "long", year: "numeric" })}</p>
        <h1 className="mt-4 text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] text-ink">{p.title}</h1>
        <p className="lede mx-auto mt-5 max-w-xl">{p.excerpt}</p>
      </div>
      <div className="wrap mt-12 max-w-5xl">
        <MediaView m={{ type: "image", src: p.cover ?? "", alt: p.title, label: "Cover photograph", tone: "night" }} className="aspect-[21/10] rounded-[24px]" />
      </div>
      <div className="wrap mt-14 max-w-2xl space-y-6 text-[1.12rem] leading-[1.85] text-ink-soft">
        {p.body.map((b, i) => (
          <p key={i} className={i === 0 ? "font-serif text-[1.5rem] leading-relaxed text-ink" : ""}>{b}</p>
        ))}
        <LotusRule className="pt-6" />
        <div className="flex items-center gap-4 pt-2">
          <Glyph value={p.figure} className="h-16 w-16" />
          <p className="text-[0.95rem]">Hare Krishna! Questions about this article? <Link href="/contact" className="link font-semibold text-maroon">Write to us</Link>.</p>
        </div>
      </div>
    </article>
  );
}
