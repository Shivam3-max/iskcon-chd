import type { Metadata } from "next";
import Link from "next/link";
import Illustration from "@/components/illustrations/Illustration";
import TempleStatus from "@/components/TempleStatus";
import { PageHeroFor } from "@/components/ui/bits";
import { fmt12 } from "@/lib/schedule";
import { getSchedule, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Plan Your Visit · Darshan & Aarti Timings", description: "Darshan and aarti timings, directions, and what to expect at ISKCON Chandigarh, Sector 36-B." };

const FAQ = [
  ["Is there an entry fee?", "No. The temple is open to everyone, free of charge."],
  ["What should I wear?", "Modest clothing. Shoulders and knees covered is ideal. There is no strict dress code, and traditional dress is always welcome."],
  ["Where do I leave my shoes?", "At the shoe counter by the entrance. It's looked after by volunteers during darshan hours."],
  ["Can I take photographs?", "Photographs of the Deities are generally allowed without flash. Please ask a temple devotee during aarti, and avoid selfies with your back to the altar."],
  ["Is prasadam available?", "Yes. Prasadam is distributed after the Raj Bhoga Aarti, and there is a full feast at the Sunday programme."],
  ["Which is the best time to come?", "The Sandhya Aarti at 7:00 pm has the liveliest kirtan. For a quiet darshan, come between 9 and 11 in the morning."],
  ["Can I come with children or elderly parents?", "Of course. The temple hall is on the ground level. Ask any volunteer if you need a chair."],
  ["Can I bring an offering?", "Flowers, fruit and sweets are welcome. Please hand them to the pujari or at the offering counter, and avoid onion and garlic."],
];

export default function VisitPage() {
  const SITE = getSettings();
  const SCHEDULE = getSchedule();
  return (
    <>
      <PageHeroFor id="visit">
        <div className="mt-6 inline-block rounded border border-line bg-paper px-4 py-3 text-ink">
          <TempleStatus variant="chip" />
        </div>
      </PageHeroFor>

      <section className="py-16 md:py-24">
        <div className="wrap grid gap-14 lg:grid-cols-[1.2fr_.8fr]">
          <div className="overflow-hidden rounded border border-line bg-paper">
            <table className="w-full text-left">
              <thead className="bg-ivory-deep/60 text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold">Programme</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Altar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {SCHEDULE.map((s) => (
                  <tr key={s.start} className={s.aarti ? "bg-[#fff8ea]" : ""}>
                    <td className="whitespace-nowrap px-5 py-4 align-top font-serif text-lg tabular-nums text-ink">{fmt12(s.start)} – {fmt12(s.end)}</td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-ink">{s.title}</span>
                      {s.aarti && <span className="ml-2 rounded-sm bg-saffron/15 px-1.5 py-0.5 text-[0.68rem] uppercase tracking-wider text-saffron">Aarti</span>}
                      <span className="block text-[0.88rem] text-ink-soft">{s.detail}</span>
                    </td>
                    <td className={`hidden px-5 py-4 text-[0.78rem] uppercase tracking-[0.12em] sm:table-cell ${s.open ? "text-tulasi" : "text-ink-soft/60"}`}>{s.open ? "Open" : "Closed"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-line px-5 py-3 text-[0.82rem] text-ink-soft">On festival days timings change. Check the calendar or call the temple office.</p>
          </div>

          <aside className="space-y-6">
            <div className="rounded border border-line bg-paper p-7">
              <p className="eyebrow">Address</p>
              <p className="mt-3 font-serif text-2xl leading-snug text-ink">{SITE.address[0]}<br />{SITE.address[1]}</p>
              <a href={SITE.maps} target="_blank" rel="noreferrer" className="btn btn-primary mt-6">Open in Google Maps</a>
            </div>
            <div className="rounded border border-line bg-paper p-7">
              <p className="eyebrow">Getting here</p>
              <ul className="mt-4 space-y-3 text-ink">
                <li><strong className="font-semibold">By bus:</strong> a short auto ride from ISBT Sector 43.</li>
                <li><strong className="font-semibold">By train:</strong> about 30 minutes by cab from Chandigarh Railway Station.</li>
                <li><strong className="font-semibold">By air:</strong> about 35 minutes from Chandigarh International Airport.</li>
                <li><strong className="font-semibold">Parking:</strong> on Dakshin Marg and inside the campus on regular days.</li>
              </ul>
            </div>
            <div className="rounded border border-line bg-paper p-7">
              <p className="eyebrow">Can&rsquo;t come today?</p>
              <p className="mt-3 text-ink-soft">Join the aarti on our live darshan.</p>
              <Link href="/live" className="btn btn-ghost mt-4 text-maroon">Live darshan</Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="band-lotus py-16 md:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <Illustration figure="kartal" className="h-48 w-48" />
            <p className="eyebrow mt-6">Good to know</p>
            <h2 className="h2 mt-3 text-ink">Your first visit</h2>
            <p className="mt-4 text-ink-soft">You don&rsquo;t need to know anything to walk in. Watch, listen, and join the kirtan if you feel like it.</p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-[1.35rem] text-ink">
                  {q}
                  <span className="text-2xl text-gold transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-ink-soft">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
