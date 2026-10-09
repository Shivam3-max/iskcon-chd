import type { Metadata } from "next";
import Link from "next/link";
import Glyph from "@/components/ui/Glyph";
import { CampaignCard, PageHeroFor, SectionHead } from "@/components/ui/bits";
import { getCampaigns, getSevas } from "@/lib/content";
import { inr } from "@/lib/format";

export const metadata: Metadata = {
  title: "Donate · Sevas & Campaigns",
  description: "Sponsor the worship of Sri Sri Radha Madhava, Food for Life, Gita Daan and temple campaigns. 80G tax exemption available.",
};
export const revalidate = 60;

export default async function DonatePage() {
  const campaigns = await getCampaigns();
  const live = campaigns.filter((c) => c.status === "live");
  const closed = campaigns.filter((c) => c.status === "closed");
  const sevas = await getSevas();

  return (
    <>
      <PageHeroFor id="donate" />

      <section className="py-16 md:py-24">
        <div className="wrap">
          <SectionHead eyebrow="Open campaigns" title="Give towards something specific" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {live.map((c) => <CampaignCard key={c.slug} c={c} />)}
          </div>
        </div>
      </section>

      <section className="grain border-y border-line bg-ivory-deep/50 py-16 md:py-24">
        <div className="wrap">
          <SectionHead eyebrow="Daily sevas" title="Serve the Deities directly" lede="Sponsor a part of the daily worship on a date that means something to you: a birthday, an anniversary, or a remembrance." />
          <div className="mt-10 grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {sevas.map((s) => (
              <Link key={s.slug} href={`/donate/seva/${s.slug}`} className="group reveal flex flex-col bg-paper p-7 transition-colors hover:bg-ivory">
                <Glyph value={s.illustration} className="h-24 w-24" />
                <h3 className="mt-4 font-serif text-[1.45rem] leading-tight text-ink group-hover:text-maroon">{s.title}</h3>
                <p className="mt-2 flex-1 text-[0.92rem] text-ink-soft">{s.detail}</p>
                <p className="mt-5 text-[0.9rem] font-semibold text-maroon">{s.amount ? `${inr(s.amount)} ${s.unit}` : "Any amount"}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="wrap grid gap-10 md:grid-cols-3">
          {[
            ["80G tax exemption", "Donations to ISKCON are eligible for deduction under Section 80G of the Income Tax Act. Add your PAN when you give and the receipt will show it."],
            ["Receipts by email", "Every gift gets an acknowledgement and receipt by email. For sevas on a particular date, you will get a reminder so you can join the aarti, in person or online."],
            ["Questions", "For large gifts, in-kind offerings or a seva for a special date, call the temple office on +91 172 260 1590."],
          ].map(([t, d]) => (
            <div key={t} className="reveal border-t-2 border-gold pt-5">
              <h3 className="font-serif text-2xl text-ink">{t}</h3>
              <p className="mt-2 text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
        {closed.length > 0 && (
          <div className="wrap mt-20">
            <p className="eyebrow">Completed campaigns</p>
            <div className="mt-6 grid gap-6 md:grid-cols-3">{closed.map((c) => <CampaignCard key={c.slug} c={c} />)}</div>
          </div>
        )}
      </section>
    </>
  );
}
