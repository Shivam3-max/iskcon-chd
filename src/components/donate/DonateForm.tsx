"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { inr } from "@/lib/format";

interface Props {
  officeEmail?: string;
  target: string;
  targetTitle: string;
  tiers: { amount: number; label: string }[];
  initialAmount?: number;
  allowMonthly?: boolean;
  askDate?: boolean;
}

export default function DonateForm({ officeEmail = "iskconchandigarh@gmail.com", target, targetTitle, tiers, initialAmount, allowMonthly = true, askDate }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(initialAmount ?? tiers[1]?.amount ?? tiers[0]?.amount ?? 1100);
  const [custom, setCustom] = useState(initialAmount && !tiers.some((t) => t.amount === initialAmount) ? String(initialAmount) : "");
  const [monthly, setMonthly] = useState(false);
  const [wants80G, setWants80G] = useState(false);
  const [dedicate, setDedicate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [handoff, setHandoff] = useState<{ mailto: string; amount: number; ref: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const f = new FormData(e.currentTarget);
    const value = custom ? Number(custom) : amount;
    if (!value || value < 51) return setErr("Please choose an amount of ₹51 or more.");
    setBusy(true);
    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target,
        targetTitle: targetTitle + (monthly ? " (monthly)" : ""),
        amount: value,
        name: f.get("name"),
        email: f.get("email"),
        phone: f.get("phone"),
        pan: wants80G ? f.get("pan") : undefined,
        address: wants80G ? f.get("address") : undefined,
        dedication: dedicate ? `${f.get("dedType")} ${f.get("dedName")}`.trim() : askDate ? `Seva date: ${f.get("sevaDate")}` : undefined,
        wants80G,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error ?? "Something went wrong. Please try again.");
    if (data.stored === false) {
      // no database or payment gateway yet: hand the details to the temple office by email (built here, never put in a URL we host)
      const lines = [
        `Offering: ${targetTitle}${monthly ? " (monthly)" : ""}`,
        `Amount: ₹${value}`,
        `Name: ${f.get("name")}`,
        `Phone: ${f.get("phone")}`,
        `Email: ${f.get("email")}`,
        dedicate ? `Dedication: ${f.get("dedType")} ${f.get("dedName")}` : "",
        askDate && f.get("sevaDate") ? `Seva date: ${f.get("sevaDate")}` : "",
        wants80G ? `80G receipt: yes · PAN ${f.get("pan")} · ${f.get("address")}` : "",
        `Reference: ${data.id}`,
        "",
        "Please share the UPI / bank details to complete this offering. Hare Krishna!",
      ].filter((l, i, a) => l || a[i - 1]);
      setHandoff({ ref: data.id, amount: value, mailto: `mailto:${officeEmail}?subject=${encodeURIComponent(`Offering: ${targetTitle} · ₹${value}`)}&body=${encodeURIComponent(lines.join("\n"))}` });
      return;
    }
    router.push(`/donate/thank-you?id=${data.id}`);
  }

  const value = custom ? Number(custom) || 0 : amount;

  if (handoff) {
    return (
      <div className="rounded border border-line bg-paper p-6 text-center shadow-[0_30px_60px_-40px_rgba(60,20,10,.45)] md:p-8">
        <p className="eyebrow">Hare Krishna</p>
        <p className="mt-3 font-serif text-2xl text-ink">Thank you for your offering of {inr(handoff.amount)}</p>
        <p className="mt-3 text-[0.95rem] text-ink-soft">
          Online payment isn&rsquo;t switched on yet. Press the button to send your details to the temple office from your email app. They&rsquo;ll reply with UPI or bank details to complete your offering.
        </p>
        <a href={handoff.mailto} className="btn btn-primary mt-6 w-full justify-center py-4 text-base">Send details to the temple</a>
        <p className="mt-4 text-[0.78rem] text-ink-soft">Reference {handoff.ref}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded border border-line bg-paper p-6 shadow-[0_30px_60px_-40px_rgba(60,20,10,.45)] md:p-8">
      <p className="eyebrow">Your offering</p>
      {allowMonthly && (
        <div className="mt-4 grid grid-cols-2 overflow-hidden rounded border border-line text-sm">
          {[false, true].map((m) => (
            <button type="button" key={String(m)} onClick={() => setMonthly(m)} className={`py-2.5 ${monthly === m ? "bg-maroon text-ivory" : "bg-paper text-ink-soft"}`}>
              {m ? "Every month" : "One time"}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {tiers.map((t) => (
          <button
            type="button"
            key={t.amount}
            onClick={() => { setAmount(t.amount); setCustom(""); }}
            className={`rounded border px-3 py-3 text-left transition-colors ${!custom && amount === t.amount ? "border-maroon bg-[#fbeeee]" : "border-line hover:border-gold"}`}
          >
            <span className="block font-serif text-xl text-ink">{inr(t.amount)}</span>
            <span className="block text-[0.76rem] leading-snug text-ink-soft">{t.label}</span>
          </button>
        ))}
      </div>
      <label className="mt-3 flex items-center gap-2 rounded border border-line bg-ivory px-3 focus-within:border-gold">
        <span className="text-ink-soft">₹</span>
        <input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} placeholder="Another amount" className="w-full bg-transparent py-3 outline-none" />
      </label>

      <div className="mt-6 grid gap-3">
        <input name="name" required placeholder="Full name" className="field" autoComplete="name" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="email" type="email" required placeholder="Email for the receipt" className="field" autoComplete="email" />
          <input name="phone" required placeholder="Mobile" className="field" autoComplete="tel" inputMode="tel" pattern="[0-9+\s-]{10,15}" />
        </div>
        {askDate && (
          <label className="text-sm text-ink-soft">
            Date you would like the seva offered
            <input name="sevaDate" type="date" className="field mt-1" />
          </label>
        )}
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-[0.92rem]">
        <input type="checkbox" checked={dedicate} onChange={(e) => setDedicate(e.target.checked)} className="mt-1 accent-maroon" />
        <span>Offer this in someone&rsquo;s name</span>
      </label>
      {dedicate && (
        <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
          <select name="dedType" className="field w-auto">
            <option>In honour of</option>
            <option>In loving memory of</option>
            <option>On the birthday of</option>
          </select>
          <input name="dedName" placeholder="Name" className="field" />
        </div>
      )}
      <label className="mt-3 flex cursor-pointer items-start gap-3 text-[0.92rem]">
        <input type="checkbox" checked={wants80G} onChange={(e) => setWants80G(e.target.checked)} className="mt-1 accent-maroon" />
        <span>I would like an 80G tax-exemption receipt</span>
      </label>
      {wants80G && (
        <div className="mt-3 grid gap-2">
          <input name="pan" required placeholder="PAN" className="field uppercase" pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]" title="10-character PAN, e.g. ABCDE1234F" />
          <textarea name="address" required placeholder="Postal address" rows={2} className="field" />
        </div>
      )}

      {err && <p className="mt-4 text-sm text-maroon">{err}</p>}
      <button disabled={busy} className="btn btn-primary mt-6 w-full justify-center py-4 text-base disabled:opacity-60">
        {busy ? "Preparing…" : `Offer ${value ? inr(value) : ""}${monthly ? " a month" : ""}`}
      </button>
      <p className="mt-3 text-center text-[0.78rem] text-ink-soft">
        {process.env.NEXT_PUBLIC_PAYMENTS_LIVE === "1"
          ? "Secure payment by UPI, card or net banking. A receipt is emailed to you."
          : "Online payment is being set up. After you submit, you can send your details to the temple office, who will share UPI or bank details to complete your offering."}
      </p>
    </form>
  );
}
