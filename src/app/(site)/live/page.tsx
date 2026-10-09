import type { Metadata } from "next";
import Link from "next/link";
import Illustration from "@/components/illustrations/Illustration";
import TempleStatus from "@/components/TempleStatus";
import { PageHeroFor } from "@/components/ui/bits";
import { fmt12 } from "@/lib/schedule";
import { getSchedule, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Live Darshan", description: "Watch the aarti and darshan of Sri Sri Radha Madhava live from ISKCON Chandigarh." };

export default function LivePage() {
  const SITE = getSettings();
  const SCHEDULE = getSchedule();
  return (
    <>
      <PageHeroFor id="live">
        <div className="mt-6 inline-block rounded border border-line bg-paper px-4 py-3 text-ink">
          <TempleStatus variant="chip" />
        </div>
      </PageHeroFor>
      <section className="py-16 md:py-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1.4fr_.6fr]">
          <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded border border-line bg-[radial-gradient(70%_70%_at_50%_45%,#fff5e2,#f2dcb4)] text-center">
            <div className="kolam-bg absolute inset-0 opacity-40" />
            <Illustration figure="diya" className="relative h-36 w-36" />
            <p className="relative mt-3 font-serif text-2xl text-ink">The stream plays here during aarti</p>
            <a href={SITE.social.youtube} target="_blank" rel="noreferrer" className="btn btn-primary relative mt-5">Open on YouTube</a>
          </div>
          <div className="rounded border border-line bg-paper p-7">
            <p className="eyebrow">Streamed aartis</p>
            <ul className="mt-4 divide-y divide-line">
              {SCHEDULE.filter((s) => s.aarti).map((s) => (
                <li key={s.start} className="flex justify-between py-3">
                  <span className="text-ink">{s.title}</span>
                  <span className="font-serif text-lg tabular-nums text-maroon">{fmt12(s.start)}</span>
                </li>
              ))}
            </ul>
            <Link href="/calendar" className="link mt-5 inline-block text-sm font-semibold text-maroon">Festival streams are listed in the calendar</Link>
          </div>
        </div>
      </section>
    </>
  );
}
