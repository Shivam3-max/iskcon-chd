import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Glyph from "@/components/ui/Glyph";
import { MediaView } from "@/components/media/Media";
import DonateForm from "@/components/donate/DonateForm";
import { getSettings } from "@/lib/data";
import { Progress } from "@/components/ui/bits";
import { getCampaign } from "@/lib/content";
import { daysLeft, longDate } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await getCampaign((await params).slug);
  return c ? { title: c.title, description: c.summary } : {};
}

export default async function CampaignPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ amount?: string }> }) {
  const c = await getCampaign((await params).slug);
  if (!c) notFound();
  const amt = Number((await searchParams).amount) || undefined;

  return (
    <>
      <section className="band-saffron relative overflow-hidden pt-[108px]">
        <div className="kolam-bg pointer-events-none absolute inset-0 opacity-[.1]" />
        <div className="wrap relative grid items-center gap-10 py-14 md:grid-cols-[1fr_auto] md:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">{c.kicker}</p>
            <h1 className="mt-4 text-[clamp(2.4rem,4.6vw,4.2rem)] leading-[1.02] text-ink">{c.title}</h1>
            <p className="lede mt-5">{c.summary}</p>
            <div className="mt-8 max-w-lg">
              <Progress raised={c.raised} goal={c.goal} dark />
              <p className="mt-3 text-[0.85rem] text-ink-soft">
                {c.donors.toLocaleString("en-IN")} devotees have given ·{" "}
                {c.status === "closed" ? "Campaign completed" : `${daysLeft(c.end)} days left`}
              </p>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[380px] md:mx-0 md:w-[380px]">
            <MediaView m={{ type: "image", src: c.image ?? "", alt: c.title, label: c.title, tone: "night" }} className="img-shadow aspect-[4/5] rounded-t-[999px] rounded-b-[20px]" showLabel={false} />
            <span className="absolute -bottom-5 left-2 grid h-20 w-20 place-items-center rounded-full bg-paper shadow-lg md:-left-5"><Glyph value={c.illustration} className="h-14 w-14" /></span>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_440px]">
          <article className="order-2 lg:order-none">
            <p className="eyebrow">The story</p>
            <p className="mt-5 font-serif text-[1.15rem] leading-relaxed text-ink first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[3.4rem] md:text-[1.45rem] md:first-letter:text-[4.2rem] first-letter:leading-[.8] first-letter:text-maroon">
              {c.story}
            </p>
            {c.updates.length > 0 && (
              <div className="mt-14">
                <p className="eyebrow">Updates</p>
                <ol className="mt-5 space-y-5 border-l border-line pl-6">
                  {c.updates.map((u) => (
                    <li key={u.date} className="relative">
                      <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-gold" />
                      <p className="text-[0.75rem] uppercase tracking-[0.14em] text-ink-soft">{longDate(u.date, { day: "numeric", month: "long", year: "numeric" })}</p>
                      <p className="mt-1 text-ink">{u.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </article>
          <div className="order-1 lg:sticky lg:top-[130px] lg:order-none lg:h-max">
            {c.status === "closed" ? (
              <div className="rounded border border-line bg-paper p-8 text-center">
                <p className="font-serif text-2xl text-ink">This campaign is complete.</p>
                <p className="mt-2 text-ink-soft">Thank you to everyone who gave.</p>
              </div>
            ) : (
              <DonateForm officeEmail={getSettings().email} target={c.slug} targetTitle={c.title} tiers={c.tiers} initialAmount={amt} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
