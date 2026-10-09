import type { Metadata } from "next";
import Link from "next/link";
import Illustration from "@/components/illustrations/Illustration";
import Media from "@/components/media/Media";
import { Arrow, LotusRule, PageHeroFor } from "@/components/ui/bits";

export const metadata: Metadata = { title: "About the Temple", description: "Hare Krishna Dham, Sector 36-B, Chandigarh: home of Sri Sri Radha Madhava and a centre of ISKCON since 1978." };

const PILLARS = [
  { figure: "kirtan", title: "Chanting", text: "The holy names are sung at every aarti and chanted on beads every morning. Kirtan is the heart of the temple." },
  { figure: "books", title: "Study", text: "The Bhagavad-gita and Srimad-Bhagavatam are read every day, as Srila Prabhupada presented them, with classes for every level." },
  { figure: "prasadam", title: "Prasadam", text: "Food cooked with care and offered to Krishna is shared with every visitor, and with thousands more through Food for Life." },
  { figure: "kartal", title: "Service", text: "From cleaning the hall to stitching the Deities' dresses, every task becomes worship when it's done for Krishna." },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHeroFor id="about" />

      <section className="py-16 md:py-24">
        <div className="wrap grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative h-[560px] w-full max-w-lg justify-self-center">
            <Media slot="about.deities" className="img-shadow absolute left-0 top-0 h-[82%] w-[70%] rounded-t-[999px] rounded-b-[20px]" />
            <Media slot="about.exterior" className="img-shadow absolute bottom-0 right-0 h-[44%] w-[56%] rounded-[18px] border-[6px] border-paper" />
          </div>
          <div>
            <p className="eyebrow reveal">The presiding Deities</p>
            <h2 className="h2 reveal mt-4 text-ink">Sri Sri Radha Madhava</h2>
            <div className="reveal mt-6 space-y-5 text-[1.08rem] leading-relaxed text-ink-soft">
              <p>
                <strong className="font-semibold text-ink">Madhava</strong> is Krishna as the sweetest of all, the Lord of the goddess of fortune and the spring. Beside Him stands <strong className="font-semibold text-ink">Srimati Radharani</strong>, whose love for Krishna is the model for every devotee.
              </p>
              <p>
                The Deities were installed in the late 1970s and have been worshipped every day since: woken before dawn, bathed, dressed, offered meals and lamps, and laid to rest each night. Generations of Chandigarh families have grown up coming to Their darshan.
              </p>
            </div>
            <LotusRule className="reveal my-10 max-w-xs" />
            <blockquote className="reveal font-serif text-[1.45rem] italic leading-snug text-maroon">
              &ldquo;Engage your mind always in thinking of Me, become My devotee, offer obeisances to Me and worship Me.&rdquo;
              <footer className="mt-2 text-[0.9rem] not-italic text-ink-soft">Bhagavad-gita 18.65</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="band-saffron py-16 md:py-24">
        <div className="wrap">
          <p className="eyebrow reveal text-center">Life at the temple</p>
          <h2 className="h2 reveal mx-auto mt-4 max-w-2xl text-center text-ink">Four things you will find here every day</h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="reveal text-center" data-delay={i * 100}>
                <Illustration figure={p.figure} className="mx-auto h-36 w-36" />
                <h3 className="mt-4 font-serif text-2xl text-ink">{p.title}</h3>
                <p className="mt-2 text-ink-soft">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="wrap grid gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow reveal">ISKCON</p>
            <h2 className="h2 reveal mt-4 text-ink">A worldwide family, a living tradition</h2>
            <div className="reveal mt-6 space-y-5 text-[1.05rem] leading-relaxed text-ink-soft">
              <p>
                The International Society for Krishna Consciousness was founded in New York in 1966 by His Divine Grace A.C. Bhaktivedanta Swami Prabhupada. It belongs to the Brahma-Madhva-Gaudiya sampradaya, the line of teachers that comes down from Sri Chaitanya Mahaprabhu.
              </p>
              <p>
                Today there are temples, farm communities, schools and restaurants on every continent, all teaching the same simple process: chant the holy names, study the Gita, offer your food and work to Krishna, and serve others.
              </p>
            </div>
          </div>
          <div className="reveal grid content-start gap-4">
            {[
              ["Srila Prabhupada", "The Founder-Acharya and his books", "/srila-prabhupada"],
              ["Visit the temple", "Timings, directions, what to expect", "/visit"],
              ["Programs", "Classes, youth, kids, Food for Life", "/programs"],
            ].map(([t, d, h]) => (
              <Link key={h} href={h} className="group flex items-center justify-between rounded border border-line bg-paper p-6 hover:border-gold">
                <span>
                  <span className="block font-serif text-2xl text-ink group-hover:text-maroon">{t}</span>
                  <span className="text-ink-soft">{d}</span>
                </span>
                <span className="text-maroon"><Arrow /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
