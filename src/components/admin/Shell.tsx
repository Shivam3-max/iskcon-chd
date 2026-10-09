"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import Logo from "../Logo";
import Glyph from "../ui/Glyph";

interface Item { href: string; label: string; icon: string; super?: boolean; badge?: number }

export default function Shell({ user, badges, readOnly, children }: { user: { name: string; email: string; role: string }; badges: Record<string, number>; readOnly?: boolean; children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const groups: { title: string; items: Item[] }[] = [
    { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: "temple" }] },
    { title: "Website", items: [
      { href: "/admin/homepage", label: "Homepage", icon: "gaura-nitai" },
      { href: "/admin/pages", label: "Page headers", icon: "chamara" },
      { href: "/admin/media", label: "Photos & videos", icon: "peacock" },
      { href: "/admin/festivals", label: "Festival stories", icon: "ratha" },
      { href: "/admin/programs", label: "Programs", icon: "kirtan" },
      { href: "/admin/posts", label: "Blog / Journal", icon: "books" },
      { href: "/admin/testimonials", label: "Visitor reviews", icon: "lotus" },
    ] },
    { title: "Giving", items: [
      { href: "/admin/campaigns", label: "Campaigns", icon: "diya" },
      { href: "/admin/sevas", label: "Sevas", icon: "kalash" },
      { href: "/admin/donations", label: "Donations", icon: "prasadam", badge: badges.pending },
    ] },
    { title: "Temple", items: [
      { href: "/admin/calendar-events", label: "Calendar events", icon: "tulasi" },
      { href: "/admin/schedule", label: "Darshan timings", icon: "conch" },
      { href: "/admin/sunday", label: "Sunday feast", icon: "prasadam" },
    ] },
    { title: "People", items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: "preacher", badge: badges.enquiries },
      { href: "/admin/users", label: "Admin users", icon: "children", super: true },
    ] },
    { title: "System", items: [
      { href: "/admin/settings", label: "Site settings", icon: "flute", super: true },
      { href: "/admin/activity", label: "Activity log", icon: "cow" },
    ] },
  ];

  const nav = (
    <nav className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-5 pb-6 pt-6"><Logo onDark className="h-[38px]" /></Link>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 pb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#b79d82]">{g.title}</p>
            {g.items.filter((i) => !i.super || user.role === "super").map((i) => {
              const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
              return (
                <Link key={i.href} href={i.href} data-active={active} onClick={() => setOpen(false)} className="a-nav-link">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#fff6ea]"><Glyph value={i.icon} className="h-5 w-5" /></span>
                  <span className="flex-1">{i.label}</span>
                  {i.badge ? <span className="rounded-full bg-[#e8913f] px-1.5 text-[0.68rem] font-bold text-white">{i.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-[0.84rem] font-semibold text-white">{user.name}</p>
        <p className="truncate text-[0.72rem] text-[#b79d82]">{user.email} · {user.role === "super" ? "Super admin" : "Editor"}</p>
        <button
          type="button"
          onClick={async () => { await fetch("/api/admin/auth", { method: "DELETE" }); window.location.href = "/admin/login"; }}
          className="mt-3 text-[0.78rem] font-semibold text-[#f0b765] hover:text-white"
        >
          Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:pl-[260px]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] bg-[linear-gradient(180deg,#24120c,#170a06)] lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <aside className="absolute inset-y-0 left-0 w-[270px] bg-[linear-gradient(180deg,#24120c,#170a06)]" onClick={(e) => e.stopPropagation()}>{nav}</aside>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#ece2d2] bg-[#f6f1e8]/90 px-4 backdrop-blur md:px-8">
        <button type="button" onClick={() => setOpen(true)} className="a-icon-btn !h-10 !w-10 text-lg lg:hidden" aria-label="Menu">☰</button>
        <Link href="/admin" className="lg:hidden"><Logo className="h-[30px]" /></Link>
        <span className="flex-1" />
        <a href="/" target="_blank" rel="noreferrer" className="a-btn">View website ↗</a>
      </header>
      {readOnly && (
        <div className="border-b border-[#f0d3ad] bg-[#fff4e4] px-4 py-2.5 text-[0.84rem] text-[#8a4a14] md:px-8">
          <strong>Preview mode.</strong> You can explore everything, but saving and uploads are switched off on this hosting until the database and file storage are connected.
        </div>
      )}
      <main className="px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[2rem] leading-tight text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
