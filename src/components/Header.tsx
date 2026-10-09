"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import TempleStatus from "./TempleStatus";
import { NAV } from "@/lib/site";
import { useSite } from "./SiteProvider";

export default function Header({ today }: { today: string }) {
  const path = usePathname();
  const site = useSite();
  const overHero = path === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  // close menus when the route changes (state reset during render, not in an effect)
  const [prevPath, setPrevPath] = useState(path);
  if (path !== prevPath) {
    setPrevPath(path);
    setOpen(false);
    setMenu(null);
  }

  // over the dark hero the bar is clear with light type; everywhere else it is ivory
  const light = overHero && !scrolled && !open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {site.announcement?.enabled && site.announcement.text && (
        <a href={site.announcement.href || "#"} className="block bg-[linear-gradient(90deg,#c8601e,#e8913f)] px-4 py-1.5 text-center text-[0.8rem] font-semibold text-white hover:brightness-105">
          {site.announcement.text}
        </a>
      )}
      <div className={`border-b text-[0.78rem] transition-colors duration-500 ${light ? "border-white/10 bg-black/25 text-white/75" : "border-line bg-ivory-deep/90 text-ink-soft"}`}>
        <div className="wrap flex h-9 items-center justify-between gap-4">
          <TempleStatus />
          <div className="hidden items-center gap-5 lg:flex">
            <span className="opacity-80">{today}</span>
            <Link href="/live" className="link">Live darshan</Link>
            <a href={site.phoneHref} className="link">{site.phone}</a>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-500 ${light ? "bg-gradient-to-b from-black/35 to-transparent" : "border-b border-line bg-paper/95 shadow-[0_8px_30px_-20px_rgba(60,20,10,.35)] backdrop-blur"}`}>
        <div className="wrap flex h-[72px] items-center justify-between gap-6">
          <Link href="/" aria-label="ISKCON Chandigarh home">
            <Logo onDark={light} className="h-[46px]" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setMenu(null)}>
            {NAV.map((item) => {
              const active = path === item.href || path.startsWith(item.href + "/");
              return (
                <div key={item.label} className="relative" onMouseEnter={() => setMenu(item.children ? item.label : null)}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 rounded px-3 py-2 text-[0.93rem] font-medium transition-colors ${light ? "text-white/90 hover:text-[#f3cf7a]" : "text-ink hover:text-maroon"} ${active ? (light ? "text-[#f3cf7a]" : "text-maroon") : ""}`}
                  >
                    {item.label}
                    {item.children && <svg width="10" height="10" viewBox="0 0 10 10" className="opacity-60"><path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>}
                  </Link>
                  {item.children && menu === item.label && (
                    <div className="absolute left-1/2 top-full w-[340px] -translate-x-1/2 pt-3">
                      <div className="overflow-hidden rounded border border-line bg-paper p-2 shadow-[0_24px_60px_-24px_rgba(60,20,10,.45)]">
                        {item.children.map((c) => (
                          <Link key={c.href} href={c.href} className="group block rounded px-4 py-3 transition-colors hover:bg-ivory">
                            <span className="block font-serif text-[1.12rem] text-ink group-hover:text-maroon">{c.label}</span>
                            <span className="block text-[0.8rem] text-ink-soft">{c.note}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/donate" className={`btn hidden sm:inline-flex ${light ? "btn-light" : "btn-primary"}`}>Donate</Link>
            <button className={`grid h-11 w-11 place-items-center rounded lg:hidden ${light ? "text-white" : "text-ink"}`} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
              <svg width="22" height="22" viewBox="0 0 22 22">
                {open ? <path d="M5 5 17 17 M17 5 5 17" stroke="currentColor" strokeWidth="1.6" /> : <path d="M3 7 H19 M3 15 H19" stroke="currentColor" strokeWidth="1.6" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100svh-108px)] overflow-y-auto border-b border-line bg-ivory lg:hidden">
          <div className="wrap py-6">
            {NAV.map((item) => (
              <div key={item.label} className="border-b border-line py-3">
                <Link href={item.href} className="font-serif text-2xl text-ink">{item.label}</Link>
                {item.children && (
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {item.children.map((c) => <Link key={c.href} href={c.href} className="text-[0.92rem] text-ink-soft">{c.label}</Link>)}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-6 flex gap-3">
              <Link href="/donate" className="btn btn-primary">Donate</Link>
              <Link href="/visit" className="btn btn-ghost text-maroon">Plan a visit</Link>
            </div>
            <p className="mt-6 text-sm text-ink-soft">{today}</p>
          </div>
        </div>
      )}
    </header>
  );
}
