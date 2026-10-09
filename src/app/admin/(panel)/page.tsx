import Link from "next/link";
import { PageTitle } from "@/components/admin/Shell";
import Glyph from "@/components/ui/Glyph";
import { currentUser } from "@/lib/admin/auth";
import type { Campaign, Donation } from "@/lib/content";
import type { MediaItem } from "@/lib/media";
import { readAudit, readContent } from "@/lib/store";
import { upcoming } from "@/lib/vaishnava/engine";
import { longDate } from "@/lib/format";

export const metadata = { title: "Dashboard" };
const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const ago = (iso: string) => {
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return `${Math.round(m / 1440)} d ago`;
};

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  const user = await currentUser();
  const donations = readContent<Donation[]>("donations", []);
  const campaigns = readContent<Campaign[]>("campaigns", []);
  const enquiries = readContent<{ id: string; name: string; topic: string; status: string; createdAt: string; message: string }[]>("enquiries", []);
  const media = readContent<{ slots: Record<string, MediaItem>; gallery: MediaItem[] }>("media", { slots: {}, gallery: [] });
  const month = new Date().toISOString().slice(0, 7);
  const paid = donations.filter((d) => d.status === "paid");
  const thisMonth = paid.filter((d) => d.createdAt.startsWith(month));
  const pending = donations.filter((d) => d.status === "pending");
  const live = campaigns.filter((c) => c.status === "live");
  const newEnq = enquiries.filter((e) => e.status === "new");
  const slots = Object.entries(media.slots);
  const filled = slots.filter(([, m]) => m.src).length;
  const events = upcoming(45).filter((e) => e.kind !== "observance" || e.major).slice(0, 6);
  const audit = readAudit().filter((a) => a.action !== "upload").slice(0, 8);
  const heroVideo = Boolean(media.slots["home.hero.bg"]?.src);

  const stats = [
    { label: "Received this month", value: inr(thisMonth.reduce((s, d) => s + d.amount, 0)), note: `${thisMonth.length} gifts`, href: "/admin/donations" },
    { label: "Awaiting confirmation", value: String(pending.length), note: inr(pending.reduce((s, d) => s + d.amount, 0)), href: "/admin/donations?status=pending" },
    { label: "Live campaigns", value: String(live.length), note: `${inr(live.reduce((s, c) => s + c.raised, 0))} raised`, href: "/admin/campaigns" },
    { label: "New enquiries", value: String(newEnq.length), note: `${enquiries.length} in total`, href: "/admin/enquiries" },
  ];

  return (
    <>
      <PageTitle title={`Hare Krishna, ${user?.name.split(" ")[0] ?? ""}`} description="Here is what's happening on the temple website today." />
      {denied && <p className="mb-6 rounded-2xl bg-[#fdf0e1] px-4 py-3 text-[0.86rem] text-[#8a4a14]">That page needs a super admin.</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="a-card group p-5 transition-transform hover:-translate-y-0.5">
            <p className="text-[0.76rem] font-semibold text-ink-soft">{s.label}</p>
            <p className="mt-2 font-serif text-[2rem] leading-none text-ink">{s.value}</p>
            <p className="mt-2 text-[0.78rem] text-ink-soft">{s.note} <span className="float-right text-[#a4501a] opacity-0 transition-opacity group-hover:opacity-100">Open →</span></p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="a-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Campaigns</h2>
              <Link href="/admin/campaigns" className="a-btn">Manage</Link>
            </div>
            <div className="mt-4 divide-y divide-[#f1e8da]">
              {campaigns.length === 0 && <p className="py-6 text-ink-soft">No campaigns yet.</p>}
              {campaigns.slice(0, 5).map((c) => {
                const pct = Math.min(100, Math.round((c.raised / Math.max(1, c.goal)) * 100));
                return (
                  <Link key={c.slug} href="/admin/campaigns" className="flex items-center gap-4 py-3.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff6ea]"><Glyph value={c.illustration} className="h-8 w-8" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-ink">{c.title}</span>
                        {c.featured && <span className="a-pill bg-[#fff1df] text-[#a4501a]">Homepage</span>}
                        <span className={`a-pill capitalize ${c.status === "live" ? "bg-[#e3f1df] text-[#2f6a2a]" : "bg-[#f1ebe1] text-ink-soft"}`}>{c.status}</span>
                      </span>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#f1e8da]"><span className="block h-full rounded-full bg-[linear-gradient(90deg,#d9772b,#e2c27a)]" style={{ width: `${pct}%` }} /></span>
                    </span>
                    <span className="w-28 text-right text-[0.8rem] text-ink-soft">{inr(c.raised)}<br />{pct}% of {inr(c.goal)}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="a-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Latest donations</h2>
              <Link href="/admin/donations" className="a-btn">All donations</Link>
            </div>
            <table className="a-table mt-3 w-full">
              <tbody>
                {donations.length === 0 && <tr><td className="text-ink-soft">No donations yet.</td></tr>}
                {[...donations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6).map((d) => (
                  <tr key={d.id}>
                    <td className="font-medium text-ink">{d.name}<span className="block text-[0.74rem] font-normal text-ink-soft">{d.targetTitle}</span></td>
                    <td className="text-right font-serif text-lg text-ink">{inr(d.amount)}</td>
                    <td className="text-right"><span className={`a-pill ${d.status === "paid" ? "bg-[#e3f1df] text-[#2f6a2a]" : "bg-[#fff1df] text-[#a4501a]"}`}>{d.status}</span></td>
                    <td className="text-right text-[0.76rem] text-ink-soft">{ago(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="space-y-6">
          <section className="a-card p-6">
            <h2 className="font-serif text-xl text-ink">Get the website ready</h2>
            <ul className="mt-4 space-y-3 text-[0.86rem]">
              {[
                [heroVideo, "Upload the hero background video", "/admin/homepage"],
                [filled > slots.length / 2, `Fill photo & video spots (${filled}/${slots.length})`, "/admin/media"],
                [readContent<{ sample?: boolean }[]>("testimonials", []).every((t) => !t.sample), "Replace the sample visitor reviews", "/admin/testimonials"],
                [false, "Confirm the Sunday feast timings with the temple office", "/admin/sunday"],
                [false, "Check darshan timings", "/admin/schedule"],
              ].map(([done, label, href]) => (
                <li key={String(label)}>
                  <Link href={String(href)} className="flex items-center gap-3 hover:text-[#a4501a]">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem] ${done ? "bg-[#2f6a2a] text-white" : "border-2 border-[#e3d6c1]"}`}>{done ? "✓" : ""}</span>
                    <span className={done ? "text-ink-soft line-through" : "text-ink"}>{String(label)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="a-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Coming up</h2>
              <Link href="/admin/calendar-events" className="a-btn">Add event</Link>
            </div>
            <ul className="mt-3 divide-y divide-[#f1e8da]">
              {events.map((e) => (
                <li key={e.date + e.title} className="flex items-center gap-3 py-2.5">
                  <span className="w-14 shrink-0 text-center"><span className="block font-serif text-xl leading-none text-[#a4501a]">{Number(e.date.slice(8))}</span><span className="text-[0.62rem] font-semibold uppercase tracking-wider text-ink-soft">{longDate(e.date, { month: "short" })}</span></span>
                  <span className="min-w-0 text-[0.86rem] text-ink">{e.title}{e.custom && <span className="a-pill ml-2 bg-[#e8e4f3] text-[#4b3f80]">Added</span>}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="a-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl text-ink">Recent activity</h2>
              <Link href="/admin/activity" className="a-btn">All</Link>
            </div>
            <ul className="mt-3 space-y-2.5 text-[0.82rem]">
              {audit.length === 0 && <li className="text-ink-soft">Nothing yet.</li>}
              {audit.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d9772b]" />
                  <span className="text-ink">{a.user.split("@")[0]} <span className="text-ink-soft">{a.action.replace(/-/g, " ")}</span> {a.target}{a.summary ? <span className="text-ink-soft"> · {a.summary}</span> : null}<span className="block text-[0.72rem] text-ink-soft">{ago(a.at)}</span></span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
