import type { Metadata } from "next";
import Link from "next/link";
import Illustration from "@/components/illustrations/Illustration";
import { getDonation } from "@/lib/content";
import { inr } from "@/lib/format";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ThankYou({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const payments = process.env.NEXT_PUBLIC_PAYMENTS_LIVE === "1";
  const site = getSettings();
  const id = (await searchParams).id;
  const d = id ? await getDonation(id) : undefined;

  return (
    <section className="grain pb-24 pt-[150px]">
      <div className="wrap max-w-2xl text-center">
        <Illustration figure="gaura-nitai" className="mx-auto h-48 w-48" />
        <p className="eyebrow mt-6">Hare Krishna</p>
        <h1 className="mt-3 text-[clamp(2.4rem,4.6vw,3.6rem)] text-ink">Thank you{d ? `, ${d.name.split(" ")[0]}` : ""}.</h1>
        <p className="lede mx-auto mt-4 max-w-lg">
          May Sri Sri Radha Madhava bless you and your family.{" "}
          {payments ? "Your offering has been recorded." : "Online payment is still being set up, so the temple office will contact you to complete your offering."}
        </p>
        {d && (
          <dl className="mx-auto mt-10 max-w-md divide-y divide-line rounded border border-line bg-paper text-left">
            {[
              ["Reference", d.id],
              ["Offering", d.targetTitle],
              ["Amount", inr(d.amount)],
              ...(d.dedication ? [["Dedication", d.dedication]] : []),
              ["80G receipt", d.wants80G ? `Yes · PAN ending ${d.pan?.slice(-4)}` : "Not requested"],
              ["Status", d.status === "paid" ? "Received" : "Awaiting payment confirmation"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 px-5 py-3.5">
                <dt className="text-[0.8rem] uppercase tracking-[0.12em] text-ink-soft">{k}</dt>
                <dd className="text-right text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {!payments && (
          <p className="mx-auto mt-6 max-w-md rounded-[14px] bg-ivory px-5 py-4 text-[0.92rem] text-ink">
            Prefer not to wait? Call the temple office on <a href={site.phoneHref} className="font-semibold text-maroon">{site.phone}</a> or write to{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-maroon">{site.email}</a>.
          </p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/live" className="btn btn-primary">Watch the aarti</Link>
          <Link href="/" className="btn btn-ghost text-maroon">Back to the temple</Link>
        </div>
      </div>
    </section>
  );
}
