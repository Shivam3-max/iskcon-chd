// Records a donation intent. Stage 2 (admin) connects the payment gateway here:
// create the gateway order, return its id, and mark the donation paid from the webhook.
import { NextResponse } from "next/server";
import { getCampaign, getSeva, recordDonation } from "@/lib/content";
import { READ_ONLY } from "@/lib/store";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const amount = Math.round(Number(b.amount));
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const phone = String(b.phone ?? "").trim();
  if (!amount || amount < 51 || amount > 10_000_000) return NextResponse.json({ error: "Please enter a valid amount." }, { status: 400 });
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || phone.replace(/\D/g, "").length < 10)
    return NextResponse.json({ error: "Please check your name, email and mobile number." }, { status: 400 });
  if (b.wants80G && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(String(b.pan ?? "")))
    return NextResponse.json({ error: "Please enter a valid PAN for the 80G receipt." }, { status: 400 });

  const target = String(b.target ?? "general");
  const known = (await getCampaign(target)) ?? (await getSeva(target));
  if (!known) return NextResponse.json({ error: "Unknown campaign or seva." }, { status: 400 });

  const d = await recordDonation({
    target,
    targetTitle: String(b.targetTitle ?? known.title).slice(0, 120),
    amount,
    name: name.slice(0, 120),
    email: email.slice(0, 160),
    phone: phone.slice(0, 20),
    pan: b.wants80G ? String(b.pan).toUpperCase() : undefined,
    address: b.wants80G ? String(b.address ?? "").slice(0, 400) : undefined,
    dedication: b.dedication ? String(b.dedication).slice(0, 160) : undefined,
    wants80G: Boolean(b.wants80G),
  });
  return NextResponse.json({ id: d.id, stored: !READ_ONLY });
}
