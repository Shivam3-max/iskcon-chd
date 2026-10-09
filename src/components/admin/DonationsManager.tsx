"use client";
import { useMemo, useState } from "react";
import type { Donation } from "@/lib/content";
import { api } from "./api";
import { Modal } from "./MediaPicker";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const STATUS: Record<string, string> = { paid: "bg-[#e3f1df] text-[#2f6a2a]", pending: "bg-[#fff1df] text-[#a4501a]", failed: "bg-[#fdecea] text-[#9b2c2c]", refunded: "bg-[#e8e4f3] text-[#4b3f80]" };

export function DonationsManager({ initial, targets, initialStatus }: { initial: Donation[]; targets: { slug: string; title: string }[]; initialStatus?: string }) {
  const [list, setList] = useState(initial);
  const [status, setStatus] = useState(initialStatus ?? "all");
  const [target, setTarget] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Donation | null>(null);
  const [offline, setOffline] = useState(false);
  const [err, setErr] = useState("");

  const shown = useMemo(
    () => list.filter((d) => (status === "all" || d.status === status) && (target === "all" || d.target === target) && (!q || `${d.name} ${d.email} ${d.phone} ${d.id} ${d.pan ?? ""}`.toLowerCase().includes(q.toLowerCase()))),
    [list, status, target, q],
  );
  const total = shown.filter((d) => d.status === "paid").reduce((s, d) => s + d.amount, 0);

  async function setDonationStatus(d: Donation, s: Donation["status"]) {
    setErr("");
    try {
      await api("/api/admin/donations", { method: "PATCH", json: { id: d.id, status: s } });
      setList((l) => l.map((x) => (x.id === d.id ? { ...x, status: s } : x)));
      setOpen((o) => (o && o.id === d.id ? { ...o, status: s } : o));
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  async function record(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const t = targets.find((x) => x.slug === f.target);
    try {
      const r = await api<{ data: Donation }>("/api/admin/donations", { method: "POST", json: { ...f, targetTitle: t?.title ?? "General donation" } });
      setList((l) => [r.data, ...l]);
      setOffline(false);
    } catch (e2) {
      setErr((e2 as Error).message);
    }
  }

  return (
    <div className="pb-16">
      <div className="a-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#f1e8da] p-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone, PAN, reference…" className="a-input max-w-xs" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="a-input w-auto">
            <option value="all">All statuses</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
          </select>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="a-input w-auto max-w-[220px]">
            <option value="all">All campaigns & sevas</option>
            {targets.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
          </select>
          <span className="flex-1 text-right text-[0.84rem] text-ink-soft">{shown.length} gifts · <strong className="text-ink">{inr(total)}</strong> received</span>
          <a href="/api/admin/donations?format=csv" className="a-btn">Export CSV</a>
          <button type="button" onClick={() => setOffline(true)} className="a-btn a-btn-primary">+ Record offline gift</button>
        </div>
        {err && <p className="mx-4 mt-4 rounded-xl bg-[#fdecea] px-4 py-3 text-sm text-[#9b2c2c]">{err}</p>}
        <div className="overflow-x-auto">
          <table className="a-table w-full">
            <thead><tr><th>Donor</th><th className="hidden md:table-cell">For</th><th>Amount</th><th className="hidden md:table-cell">80G</th><th>Status</th><th className="hidden md:table-cell">Date</th></tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-ink-soft">No donations match.</td></tr>}
              {shown.map((d) => (
                <tr key={d.id} className="cursor-pointer" onClick={() => setOpen(d)}>
                  <td><span className="font-medium text-ink">{d.name}</span><span className="block text-[0.74rem] text-ink-soft">{d.email || d.phone}</span></td>
                  <td className="hidden text-[0.86rem] text-ink-soft md:table-cell">{d.targetTitle}{d.method && d.method !== "online" ? <span className="a-pill ml-2 bg-[#f1ebe1] capitalize text-ink-soft">{d.method}</span> : null}</td>
                  <td className="font-serif text-lg text-ink">{inr(d.amount)}</td>
                  <td className="hidden text-[0.8rem] md:table-cell">{d.wants80G ? <span className="a-pill bg-[#e8e4f3] text-[#4b3f80]">80G</span> : <span className="text-ink-soft/50">—</span>}</td>
                  <td><span className={`a-pill capitalize ${STATUS[d.status]}`}>{d.status}</span></td>
                  <td className="hidden text-[0.8rem] text-ink-soft md:table-cell">{new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <Modal title={`${inr(open.amount)} · ${open.name}`} onClose={() => setOpen(null)}>
          <dl className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-2.5 text-[0.88rem]">
            {([
              ["Reference", open.id], ["For", open.targetTitle], ["Status", open.status], ["Method", open.method ?? "online"],
              ["Date", new Date(open.createdAt).toLocaleString("en-IN")], ["Email", open.email], ["Phone", open.phone],
              ["Dedication", open.dedication], ["80G receipt", open.wants80G ? "Requested" : "No"], ["PAN", open.pan], ["Address", open.address], ["Note", open.note],
            ] as [string, string | undefined][]).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="contents"><dt className="text-ink-soft">{k}</dt><dd className="text-ink">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-[#f1e8da] pt-5">
            {open.status !== "paid" && <button type="button" onClick={() => setDonationStatus(open, "paid")} className="a-btn a-btn-primary">Mark as received</button>}
            {open.status === "paid" && <button type="button" onClick={() => setDonationStatus(open, "refunded")} className="a-btn">Mark refunded</button>}
            {open.status === "pending" && <button type="button" onClick={() => setDonationStatus(open, "failed")} className="a-btn a-btn-danger">Mark failed</button>}
            {open.email && <a href={`mailto:${open.email}?subject=${encodeURIComponent("Thank you for your offering · ISKCON Chandigarh")}`} className="a-btn">Email donor</a>}
          </div>
          <p className="mt-3 text-[0.76rem] text-ink-soft">Marking a campaign gift as received adds it to that campaign&rsquo;s total on the website.</p>
        </Modal>
      )}

      {offline && (
        <Modal title="Record a gift received at the temple" onClose={() => setOffline(false)}>
          <form onSubmit={record} className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="a-label">Towards</span>
              <select name="target" className="a-input mt-1.5">{targets.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}</select>
            </label>
            <label><span className="a-label">Amount (₹)</span><input name="amount" type="number" min={1} required className="a-input mt-1.5" /></label>
            <label><span className="a-label">Method</span><select name="method" className="a-input mt-1.5"><option value="cash">Cash</option><option value="cheque">Cheque</option><option value="upi">UPI</option><option value="bank">Bank transfer</option></select></label>
            <label><span className="a-label">Donor name</span><input name="name" required className="a-input mt-1.5" /></label>
            <label><span className="a-label">Date received</span><input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="a-input mt-1.5" /></label>
            <label><span className="a-label">Phone</span><input name="phone" className="a-input mt-1.5" /></label>
            <label><span className="a-label">Email</span><input name="email" type="email" className="a-input mt-1.5" /></label>
            <label><span className="a-label">PAN (for 80G)</span><input name="pan" className="a-input mt-1.5 uppercase" /></label>
            <label><span className="a-label">Receipt / cheque no.</span><input name="note" className="a-input mt-1.5" /></label>
            <label className="sm:col-span-2"><span className="a-label">Address</span><input name="address" className="a-input mt-1.5" /></label>
            {err && <p className="sm:col-span-2 rounded-xl bg-[#fdecea] px-4 py-3 text-sm text-[#9b2c2c]">{err}</p>}
            <button className="a-btn a-btn-primary sm:col-span-2">Record gift</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
