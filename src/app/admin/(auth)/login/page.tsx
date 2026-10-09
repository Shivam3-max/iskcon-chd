"use client";
import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/Logo";
import Illustration from "@/components/illustrations/Illustration";

export default function Login() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), password: f.get("password") }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error ?? "Couldn't sign in.");
    window.location.href = new URLSearchParams(location.search).get("next") || "/admin";
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[radial-gradient(70%_60%_at_40%_40%,#3a1a10,#160a06)] lg:block">
        <div className="mandala-wm absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo onDark className="h-[48px] self-start" />
          <div>
            <Illustration figure="gaura-nitai" tone="dark" className="h-56 w-56" />
            <p className="mt-6 font-serif text-4xl leading-tight">Seva from behind the scenes.</p>
            <p className="mt-3 max-w-md text-white/70">Update the temple website: festivals, campaigns, photos, timings and every word on every page.</p>
          </div>
          <p className="text-[0.8rem] text-white/50">Hare Krishna Dham · Sector 36-B, Chandigarh</p>
        </div>
      </div>
      <div className="grid place-items-center px-6 py-16">
        <form onSubmit={submit} className="w-full max-w-sm">
          <Logo className="h-[44px] lg:hidden" />
          <h1 className="mt-6 font-serif text-3xl text-ink lg:mt-0">Sign in</h1>
          <p className="mt-1 text-ink-soft">Temple website admin</p>
          <label className="mt-8 block"><span className="a-label">Email</span><input name="email" type="email" required autoComplete="username" className="a-input mt-1.5" /></label>
          <label className="mt-4 block"><span className="a-label">Password</span><input name="password" type="password" required autoComplete="current-password" className="a-input mt-1.5" /></label>
          {err && <p className="mt-4 rounded-xl bg-[#fdecea] px-4 py-3 text-sm text-[#9b2c2c]">{err}</p>}
          <button disabled={busy} className="a-btn a-btn-primary mt-6 w-full py-3 text-[0.92rem]">{busy ? "Signing in…" : "Sign in"}</button>
          <Link href="/" className="mt-6 block text-center text-[0.84rem] text-ink-soft hover:text-ink">← Back to the website</Link>
        </form>
      </div>
    </div>
  );
}
