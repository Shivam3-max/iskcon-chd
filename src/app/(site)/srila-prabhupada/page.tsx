import type { Metadata } from "next";
import Link from "next/link";
import Media from "@/components/media/Media";
import { LotusRule, PageHeroFor } from "@/components/ui/bits";

export const metadata: Metadata = { title: "Srila Prabhupada", description: "His Divine Grace A.C. Bhaktivedanta Swami Prabhupada (1896–1977), Founder-Acharya of the International Society for Krishna Consciousness." };

const LIFE = [
  ["1896", "Born Abhay Charan De in Calcutta on 1 September, the day after Janmashtami."],
  ["1922", "Meets his spiritual master, Srila Bhaktisiddhanta Sarasvati Thakura, who asks him to preach Krishna consciousness in English."],
  ["1933", "Formally initiated at Allahabad."],
  ["1944", "Starts Back to Godhead magazine, writing, editing and distributing it himself."],
  ["1959", "Accepts sannyasa and moves to Vrindavan to begin translating Srimad-Bhagavatam."],
  ["1965", "Sails to America on the cargo ship Jaladuta, aged 69, with forty rupees and a trunk of books."],
  ["1966", "Founds ISKCON in a small storefront at 26 Second Avenue, New York."],
  ["1977", "Departs in Vrindavan on 14 November, having founded over a hundred temples and published over seventy volumes."],
];

const BOOKS = ["Bhagavad-gita As It Is", "Srimad-Bhagavatam", "Sri Caitanya-caritamrta", "The Nectar of Devotion", "The Science of Self-Realization", "Krishna, the Supreme Personality of Godhead"];

export default function PrabhupadaPage() {
  return (
    <>
      <PageHeroFor id="prabhupada" />

      <section className="py-16 md:py-24">
        <div className="wrap grid gap-14 lg:grid-cols-[380px_1fr]">
          <div className="lg:sticky lg:top-[130px] lg:h-max">
            <Media slot="home.prabhupada" className="img-shadow aspect-[0.78] w-full rounded-t-[999px] rounded-b-[20px]" />
            <blockquote className="mt-8 font-serif text-[1.35rem] italic leading-snug text-maroon">
              &ldquo;Books are the basis, purity is the force, preaching is the essence, utility is the principle.&rdquo;
            </blockquote>
          </div>
          <div>
            <p className="eyebrow">A life in eight moments</p>
            <ol className="mt-8 border-l border-line">
              {LIFE.map(([y, t], i) => (
                <li key={y} className="reveal relative pb-10 pl-10" data-delay={i * 40}>
                  <span className="absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full border-2 border-paper bg-saffron" />
                  <p className="font-serif text-[2rem] leading-none text-maroon">{y}</p>
                  <p className="mt-2 max-w-xl text-[1.08rem] text-ink">{t}</p>
                </li>
              ))}
            </ol>
            <LotusRule className="my-8 max-w-xs" />
            <p className="eyebrow">His books</p>
            <p className="mt-4 max-w-2xl text-ink-soft">
              He translated and wrote commentaries on the essential Vaishnava scriptures. The Bhaktivedanta Book Trust has since printed them in more than eighty languages.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {BOOKS.map((b) => (
                <li key={b} className="rounded border border-line bg-paper px-5 py-4 font-serif text-xl text-ink">{b}</li>
              ))}
            </ul>
            <Link href="/donate/gita-daan-2026" className="btn btn-primary mt-8">Sponsor a Gita for someone</Link>
          </div>
        </div>
      </section>
    </>
  );
}
