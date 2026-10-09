import type { Metadata } from "next";
import Link from "next/link";
import Glyph from "@/components/ui/Glyph";
import Media from "@/components/media/Media";
import { PageHeroFor } from "@/components/ui/bits";
import { getFestivals } from "@/lib/data";
import { upcoming } from "@/lib/vaishnava/engine";
import { longDate } from "@/lib/format";

export const metadata: Metadata = { title: "Festivals", description: "The stories behind the festivals celebrated at ISKCON Chandigarh, and their next dates." };
export const revalidate = 3600;

export default function FestivalsPage() {
  const ahead = upcoming(400);
  const nextDate = (slug: string) => ahead.find((e) => e.slug === slug)?.date;

  return (
    <>
      <PageHeroFor id="festivals" />
      <section className="py-16 md:py-24">
        <div className="wrap grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {getFestivals().map((f, i) => {
            const d = nextDate(f.slug);
            return (
              <Link key={f.slug} href={`/festivals/${f.slug}`} className="group reveal" data-delay={(i % 3) * 90}>
                <div className="relative">
                  <Media slot={`festival.${f.slug}`} className="aspect-[4/5] rounded-t-[999px] rounded-b-[20px]" showLabel={false} />
                  <span className="absolute -bottom-6 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-paper shadow-md">
                    <Glyph value={f.figure} className="h-10 w-10" />
                  </span>
                </div>
                {d && <p className="mt-9 text-center text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-saffron">Next: {longDate(d, { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</p>}
                <h2 className="mt-1 text-center font-serif text-[1.8rem] font-medium leading-tight text-ink group-hover:text-maroon">{f.title}</h2>
                {f.sanskrit && <p className="deva text-center text-[1.05rem] text-gold">{f.sanskrit}</p>}
                <p className="mt-2 text-center text-ink-soft">{f.lede}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
