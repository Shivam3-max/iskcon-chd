import Link from "next/link";
import Logo from "./Logo";
import Illustration from "./illustrations/Illustration";
import { getSettings } from "@/lib/data";

const COLS = [
  {
    title: "Quick Links",
    links: [["Home", "/"], ["About the temple", "/about"], ["Srila Prabhupada", "/srila-prabhupada"], ["Plan your visit", "/visit"], ["Live darshan", "/live"], ["Journal", "/blog"]],
  },
  {
    title: "Seva & Donations",
    links: [["Food for Life", "/donate/annadaan-food-for-life"], ["Raj Bhoga Seva", "/donate/seva/raj-bhoga"], ["Go Seva", "/donate/seva/go-seva"], ["Gita Daan", "/donate/gita-daan-2026"], ["Nitya Seva", "/donate/seva/nitya-seva"], ["General donation", "/donate/seva/general"]],
  },
  {
    title: "Calendar & Programs",
    links: [["Vaishnava calendar", "/calendar"], ["Ekadashi dates", "/calendar/ekadashi"], ["Festivals", "/festivals"], ["Youth Forum", "/programs/youth"], ["Kids & summer camp", "/programs/kids"], ["Chant with us", "/japa"]],
  },
];

const MANTRA = "Hare Kṛṣṇa Hare Kṛṣṇa · Kṛṣṇa Kṛṣṇa Hare Hare · Hare Rāma Hare Rāma · Rāma Rāma Hare Hare · ";

export default function Footer() {
  const SITE = getSettings();
  return (
    <footer>
      {/* call to serve */}
      <section className="band-orange relative overflow-hidden py-20 text-center">
        <Illustration figure="lotus" className="pointer-events-none absolute -left-10 -top-8 h-56 w-56 opacity-20" draw={false} />
        <Illustration figure="lotus" className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 opacity-20" draw={false} />
        <div className="wrap relative">
          <h2 className="text-[clamp(2.3rem,4vw,3.4rem)] text-white">Serve Krishna Today</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            A meal offered, a Gita gifted, a lamp lit at the Lord&rsquo;s feet. Every act of devotion at Hare Krishna Dham begins with you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/donate/annadaan-food-for-life" className="btn btn-white rounded-full">Sponsor Prasadam →</Link>
            <Link href="/live" className="btn btn-maroon rounded-full">Watch Live Darshan →</Link>
          </div>
        </div>
      </section>

      {/* mantra strip */}
      <div className="overflow-hidden bg-[#1a0b06] py-3">
        <div className="marquee">
          {[0, 1].map((k) => (
            <span key={k} className="whitespace-nowrap px-2 font-serif text-[1.05rem] italic text-[#f0b765]/85" aria-hidden={k === 1}>
              {MANTRA.repeat(4)}
            </span>
          ))}
        </div>
      </div>

      <div className="relative bg-[linear-gradient(180deg,#120f2b_0%,#0d0b20_100%)] text-[#e6dcf2]">
        {/* temple skyline */}
        <svg viewBox="0 -16 600 136" className="mx-auto block h-[96px] w-[480px] max-w-full" aria-hidden>
          <defs>
            <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#5a7bd8" />
              <stop offset="1" stopColor="#2a3577" />
            </linearGradient>
          </defs>
          <path fill="url(#sky)" d="M150 120 V78 C150 64 160 56 170 54 C172 40 180 32 186 30 C192 32 200 40 202 54 C212 56 222 64 222 78 V120 Z M378 120 V78 C378 64 388 56 398 54 C400 40 408 32 414 30 C420 32 428 40 430 54 C440 56 450 64 450 78 V120 Z M236 120 V70 C236 52 252 40 268 36 C272 16 290 4 300 0 C310 4 328 16 332 36 C348 40 364 52 364 70 V120 Z" />
          <path d="M300 0 V-14" stroke="#f0b765" strokeWidth="2" />
          <path d="M300 -14 L314 -10 L300 -6 Z" fill="#f0b765" />
          <path d="M0 119 H600" stroke="#2a3577" strokeWidth="2" />
        </svg>

        <div className="wrap grid gap-12 py-14 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <Illustration figure="gaura-nitai" className="h-24 w-24" draw={false} />
              <Logo onDark className="h-[42px]" />
            </div>
            <p className="mt-6 max-w-xs text-[0.88rem] leading-relaxed text-[#bdb3d4]">{SITE.address.join(", ")}</p>
            <p className="mt-3 text-[0.88rem] text-[#bdb3d4]">
              <a href={SITE.phoneHref} className="hover:text-[#f0b765]">{SITE.phone}</a>
              <br />
              <a href={`mailto:${SITE.email}`} className="hover:text-[#f0b765]">{SITE.email}</a>
            </p>
            <div className="mt-6 flex gap-2">
              {Object.entries(SITE.social).map(([k, v]) => (
                <a key={k} href={v} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-[0.66rem] font-semibold text-[#e6dcf2] hover:border-[#f0b765] hover:text-[#f0b765]" aria-label={k}>
                  {k === "youtube" ? "YT" : k === "instagram" ? "IG" : k === "facebook" ? "FB" : "X"}
                </a>
              ))}
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#f0b765]">{c.title}</p>
              <ul className="mt-5 space-y-2.5 text-[0.9rem]">
                {c.links.map(([l, h]) => (
                  <li key={h}><Link href={h} className="text-[#d9cfe8] transition-colors hover:text-[#f0b765]">· {l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10">
          <div className="wrap flex flex-col gap-2 py-6 text-[0.78rem] text-[#9d93b8] md:flex-row md:justify-between">
            <p>International Society for Krishna Consciousness · Founder-Acharya: His Divine Grace A.C. Bhaktivedanta Swami Prabhupada</p>
            <p>© {new Date().getFullYear()} ISKCON Chandigarh · 80G tax benefit available</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
