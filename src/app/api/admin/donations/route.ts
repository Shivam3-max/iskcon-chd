// Donations: list / CSV export, status changes, and recording offline gifts.
// Marking a campaign gift "paid" adds it to the campaign's raised total and donor count.
import { revalidatePath } from "next/cache";
import { requireApi } from "@/lib/admin/auth";
import type { Campaign, Donation } from "@/lib/content";
import { ReadOnlyError, readContent, writeContent } from "@/lib/store";

const read = () => readContent<Donation[]>("donations", []);

function applyToCampaign(target: string, amount: number, sign: 1 | -1, by: string) {
  const campaigns = readContent<Campaign[]>("campaigns", []);
  const c = campaigns.find((x) => x.slug === target);
  if (!c) return;
  c.raised = Math.max(0, c.raised + sign * amount);
  c.donors = Math.max(0, c.donors + sign);
  writeContent("campaigns", campaigns, { user: by, action: sign > 0 ? "campaign-credit" : "campaign-debit", target: `campaigns/${target}`, summary: `₹${amount}` });
}

export async function GET(req: Request) {
  const u = await requireApi();
  if (u instanceof Response) return u;
  const list = read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (new URL(req.url).searchParams.get("format") !== "csv") return Response.json({ data: list });
  const cols: (keyof Donation)[] = ["id", "createdAt", "status", "method", "amount", "targetTitle", "name", "email", "phone", "wants80G", "pan", "address", "dedication", "note"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...list.map((d) => cols.map((c) => esc(d[c])).join(","))].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="donations-${new Date().toISOString().slice(0, 10)}.csv"` } });
}

export async function PATCH(req: Request) {
  try {
    return await _PATCH(req);
  } catch (e) {
    if (e instanceof ReadOnlyError) return Response.json({ error: e.message }, { status: 503 });
    throw e;
  }
}

async function _PATCH(req: Request) {
  const u = await requireApi();
  if (u instanceof Response) return u;
  const { id, status } = await req.json().catch(() => ({}));
  if (!["pending", "paid", "failed", "refunded"].includes(status)) return Response.json({ error: "Unknown status." }, { status: 400 });
  const list = read();
  const d = list.find((x) => x.id === id);
  if (!d) return Response.json({ error: "Donation not found." }, { status: 404 });
  const was = d.status;
  d.status = status;
  writeContent("donations", list, { user: u.email, action: "donation-status", target: `donations/${id}`, summary: `${was} → ${status}` });
  if (was !== "paid" && status === "paid") applyToCampaign(d.target, d.amount, 1, u.email);
  if (was === "paid" && status !== "paid") applyToCampaign(d.target, d.amount, -1, u.email);
  revalidatePath("/", "layout");
  return Response.json({ ok: true });
}

/** Record a gift received at the temple (cash, cheque, UPI, bank transfer). */
export async function POST(req: Request) {
  try {
    return await _POST(req);
  } catch (e) {
    if (e instanceof ReadOnlyError) return Response.json({ error: e.message }, { status: 503 });
    throw e;
  }
}

async function _POST(req: Request) {
  const u = await requireApi();
  if (u instanceof Response) return u;
  const b = await req.json().catch(() => ({}));
  const amount = Math.round(Number(b.amount));
  if (!amount || amount < 1) return Response.json({ error: "Enter the amount." }, { status: 400 });
  if (!String(b.name ?? "").trim()) return Response.json({ error: "Enter the donor's name." }, { status: 400 });
  const d: Donation = {
    id: `ISK-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date(b.date ? `${b.date}T12:00:00+05:30` : Date.now()).toISOString(),
    target: String(b.target ?? "general"),
    targetTitle: String(b.targetTitle ?? "General donation"),
    amount,
    name: String(b.name).trim(),
    email: String(b.email ?? ""),
    phone: String(b.phone ?? ""),
    pan: b.pan ? String(b.pan).toUpperCase() : undefined,
    address: b.address ? String(b.address) : undefined,
    wants80G: Boolean(b.pan),
    status: "paid",
    method: ["cash", "cheque", "upi", "bank"].includes(b.method) ? b.method : "cash",
    note: b.note ? String(b.note).slice(0, 300) : undefined,
  };
  writeContent("donations", [...read(), d], { user: u.email, action: "record-offline-donation", target: `donations/${d.id}`, summary: `₹${amount} · ${d.name}` });
  applyToCampaign(d.target, amount, 1, u.email);
  revalidatePath("/", "layout");
  return Response.json({ data: d });
}
