import type { Metadata } from "next";
import Link from "next/link";
import Glyph from "@/components/ui/Glyph";
import { Arrow, PageHeroFor } from "@/components/ui/bits";
import { getPrograms } from "@/lib/data";

export const metadata: Metadata = { title: "Programs", description: "Food for Life, youth forum, Bhakti Yoga classes, kids' Sunday school, kirtan at home, counselling and seminars at ISKCON Chandigarh." };

export default function ProgramsPage() {
  return (
    <>
      <PageHeroFor id="programs" />
      <section className="py-16 md:py-24">
        <div className="wrap divide-y divide-line border-y border-line">
          {getPrograms().map((p) => (
            <Link key={p.slug} href={`/programs/${p.slug}`} className="group reveal grid items-center gap-6 py-10 md:grid-cols-[160px_1fr_auto] md:gap-10">
              <Glyph value={p.figure} className="h-36 w-36" draw />
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-saffron">{p.when}</p>
                <h2 className="mt-2 font-serif text-[clamp(1.8rem,3vw,2.5rem)] leading-tight text-ink group-hover:text-maroon">{p.title}</h2>
                <p className="mt-2 max-w-2xl text-[1.05rem] text-ink-soft">{p.intro}</p>
              </div>
              <span className="inline-flex items-center gap-2 font-semibold text-maroon">Explore <Arrow /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
