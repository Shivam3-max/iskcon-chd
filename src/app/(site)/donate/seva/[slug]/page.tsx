import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DonateForm from "@/components/donate/DonateForm";
import { getSettings } from "@/lib/data";
import { PageHero } from "@/components/ui/bits";
import { getSeva, getSevas } from "@/lib/content";
import { inr } from "@/lib/format";

export async function generateStaticParams() {
  return (await getSevas()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await getSeva((await params).slug);
  return s ? { title: s.title, description: s.detail } : {};
}

export default async function SevaPage({ params }: { params: Promise<{ slug: string }> }) {
  const s = await getSeva((await params).slug);
  if (!s) notFound();
  const base = s.amount || 1100;
  const tiers = s.amount
    ? [
        { amount: base, label: `One ${s.unit.replace("per ", "")}` },
        { amount: base * 3, label: `Three ${s.unit.replace("per ", "")}s` },
        { amount: base * 6, label: `Six ${s.unit.replace("per ", "")}s` },
        { amount: base * 12, label: `Twelve ${s.unit.replace("per ", "")}s` },
      ]
    : [
        { amount: 501, label: "A flower offering" },
        { amount: 1100, label: "A day's lamps" },
        { amount: 5100, label: "A day's worship" },
        { amount: 11000, label: "Temple patron" },
      ];

  return (
    <>
      <PageHero slot="page.donate" crumb={{ label: "Donate", href: "/donate" }} eyebrow={`Seva · ${s.amount ? `${inr(s.amount)} ${s.unit}` : "Any amount"}`} title={s.title} lede={s.detail} figure={s.illustration} />
      <section className="py-14 md:py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_440px]">
          <div className="order-2 space-y-6 text-[1.08rem] leading-relaxed text-ink-soft lg:order-none">
            <p className="font-serif text-[1.5rem] leading-snug text-ink">
              Sevas are offered in the name of the sponsor and their family during the day&rsquo;s worship, with prayers for their well-being.
            </p>
            <p>
              Choose the date you would like it offered. The pujari will say your name during the offering, and you are welcome to be present for the aarti that follows. If you cannot come, you can watch the aarti on our live darshan.
            </p>
            <p>Prasadam from the offering can be collected from the temple counter on that day.</p>
          </div>
          <div className="order-1 lg:sticky lg:top-[130px] lg:order-none lg:h-max">
            <DonateForm officeEmail={getSettings().email} target={s.slug} targetTitle={s.title} tiers={tiers} askDate={s.unit === "per day" || s.unit === "per puja" || s.unit === "per Sunday"} allowMonthly={s.unit === "per month" || s.slug === "general"} />
          </div>
        </div>
      </section>
    </>
  );
}
