import type { Metadata } from "next";
import Link from "next/link";
import { MediaView } from "@/components/media/Media";
import { PageHeroFor } from "@/components/ui/bits";
import { getPosts } from "@/lib/data";
import { longDate } from "@/lib/format";
import type { Tone } from "@/lib/media";

export const metadata: Metadata = { title: "Journal", description: "Temple news, festival notes and practical spirituality from ISKCON Chandigarh." };

const TONES: Tone[] = ["night", "rose", "gold", "saffron", "dusk", "garden"];

export default function BlogPage() {
  const [lead, ...rest] = getPosts();
  return (
    <>
      <PageHeroFor id="blog" />
      <section className="py-16 md:py-24">
        <div className="wrap">
          <Link href={`/blog/${lead.slug}`} className="group grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <MediaView m={{ type: "image", src: lead.cover ?? "", alt: lead.title, label: lead.category, tone: TONES[0] }} className="aspect-[16/10] rounded-[22px]" />
            <div>
              <p className="eyebrow">{lead.category} · {longDate(lead.date, { day: "numeric", month: "long", year: "numeric" })}</p>
              <h2 className="mt-3 font-serif text-[clamp(2rem,3.4vw,3rem)] font-medium leading-tight text-ink group-hover:text-maroon">{lead.title}</h2>
              <p className="mt-4 text-lg text-ink-soft">{lead.excerpt}</p>
            </div>
          </Link>
          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group reveal">
                <MediaView m={{ type: "image", src: p.cover ?? "", alt: p.title, label: p.category, tone: TONES[(i + 1) % TONES.length] }} className="aspect-[4/3] rounded-[18px]" />
                <p className="eyebrow mt-5">{p.category} · {longDate(p.date, { day: "numeric", month: "short", year: "numeric" })}</p>
                <h3 className="mt-2 font-serif text-[1.7rem] font-medium leading-tight text-ink group-hover:text-maroon">{p.title}</h3>
                <p className="mt-2 text-ink-soft">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
