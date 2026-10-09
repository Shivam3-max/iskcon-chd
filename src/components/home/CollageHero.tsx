"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TempleStatus from "../TempleStatus";

// Festival frames float around the temple's name, each running its own film.
// x/y/w are % of the hero; d is depth (parallax strength); shape gives each frame a temple form.
const LAYOUT = [
  { x: 3, y: 21, w: 15, ar: "3/4", d: 0.7, shape: "arch" },
  { x: 9, y: 64, w: 14, ar: "4/3", d: 1.1, shape: "soft" },
  { x: 21.5, y: 18, w: 10, ar: "1/1", d: 0.45, shape: "soft" },
  { x: 68, y: 18, w: 11, ar: "4/3", d: 0.5, shape: "soft" },
  { x: 82, y: 23, w: 15, ar: "3/4", d: 0.8, shape: "arch" },
  { x: 76, y: 65, w: 14, ar: "4/3", d: 1.2, shape: "soft" },
  { x: 25, y: 74, w: 11, ar: "16/9", d: 0.6, shape: "soft" },
] as const;

interface Props {
  frames: { node: ReactNode; label: string }[];
  today: { tithi: string; masa: string; nextEkadashi?: string };
}

export default function CollageHero({ frames, today }: Props) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const center = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = root.current!;
    const still = document.documentElement.hasAttribute("data-still");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);
    const els = gsap.utils.toArray<HTMLElement>("[data-frame]", sec);
    const ctx = gsap.context(() => {
      if (still || reduced) return;
      gsap.from(els, { opacity: 0, scale: 0.82, y: 40, duration: 1.4, ease: "expo.out", stagger: { each: 0.08, from: "center" }, delay: 0.1 });
      gsap.from("[data-hero-line]", { opacity: 0, y: 26, duration: 1.2, ease: "power3.out", stagger: 0.08, delay: 0.35 });
      // scroll: the collage opens outward and the title settles back
      els.forEach((el, i) => {
        const l = LAYOUT[i];
        const dx = (l.x + l.w / 2 - 50) * 0.9 * l.d;
        const dy = (l.y - 45) * 0.9 * l.d;
        gsap.to(el, { xPercent: dx * 3, yPercent: dy * 3 - 20, opacity: 0.25, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true } });
      });
      gsap.to(center.current, { scale: 0.92, opacity: 0, y: -40, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "70% top", scrub: true } });
    }, sec);

    // pointer parallax on the inner layer of each frame
    const inner = els.map((el) => el.querySelector<HTMLElement>("[data-frame-inner]")!);
    const movers = inner.map((el) => ({ x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }), y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }) }));
    const onMove = (e: PointerEvent) => {
      const mx = e.clientX / innerWidth - 0.5;
      const my = e.clientY / innerHeight - 0.5;
      movers.forEach((m, i) => { m.x(-mx * 34 * LAYOUT[i].d); m.y(-my * 26 * LAYOUT[i].d); });
    };
    if (!still && !reduced) sec.addEventListener("pointermove", onMove);

    // WebGL lamps + one aarti ring around the name
    let scene: import("./AartiScene").AartiScene | undefined;
    let ro: ResizeObserver | undefined;
    let io: IntersectionObserver | undefined;
    let st: ScrollTrigger | undefined;
    let cancelled = false;
    const cv = canvas.current!;
    if (!still && (cv.getContext("webgl2") || cv.getContext("webgl"))) {
      import("./AartiScene").then(({ AartiScene }) => {
        if (cancelled) return;
        scene = new AartiScene(cv, { rings: 1, additive: true });
        const measure = () => {
          const s = sec.getBoundingClientRect();
          const c = center.current!.getBoundingClientRect();
          if (!s.width) return;
          scene!.setSize(s.width, s.height);
          scene!.setTarget(c.left - s.left + c.width / 2, c.top - s.top + c.height * 0.5, Math.min(s.width * 0.27, 420));
        };
        measure();
        ro = new ResizeObserver(measure);
        ro.observe(sec);
        io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene!.play() : scene!.pause()));
        io.observe(sec);
        st = ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom top", scrub: true, onUpdate: (t) => scene!.setScroll(t.progress) });
      });
    }

    return () => {
      cancelled = true;
      ctx.revert();
      sec.removeEventListener("pointermove", onMove);
      ro?.disconnect();
      io?.disconnect();
      st?.kill();
      scene?.dispose();
    };
  }, []);

  return (
    <section ref={root} className="hero-night relative isolate h-[clamp(680px,100svh,880px)] overflow-hidden text-white">
      {/* mandala watermark behind the name */}
      <svg viewBox="0 0 400 400" className="pointer-events-none absolute left-1/2 top-[47%] -z-10 w-[min(980px,120vw)] -translate-x-1/2 -translate-y-1/2 opacity-[.09]" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <path key={i} d="M200 200 C188 150 188 95 200 40 C212 95 212 150 200 200 Z" fill="none" stroke="#f3cf7a" strokeWidth=".8" transform={`rotate(${i * 15} 200 200)`} />
        ))}
        {[60, 110, 160, 190].map((r) => <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#f3cf7a" strokeWidth=".6" strokeDasharray={r === 190 ? "2 5" : undefined} />)}
      </svg>
      <canvas ref={canvas} className="pointer-events-none absolute inset-0 z-[5] h-full w-full" />

      {/* frames */}
      <div className="absolute inset-0 z-0">
        {frames.slice(0, LAYOUT.length).map((f, i) => {
          const l = LAYOUT[i];
          return (
            <figure
              key={i}
              data-frame
              className={`absolute ${i === 2 || i === 3 ? "hidden md:block" : ""} hero-frame-${i}`}
              style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.w}%`, aspectRatio: l.ar }}
            >
              <div data-frame-inner className={`relative h-full w-full overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)] ring-1 ring-white/15 ${l.shape === "arch" ? "rounded-t-[999px] rounded-b-[14px]" : "rounded-[16px]"}`}>
                {f.node}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0b24]/55 via-transparent to-transparent" />
                <figcaption className="absolute bottom-2.5 left-3 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-white/85">{f.label}</figcaption>
              </div>
            </figure>
          );
        })}
      </div>

      {/* the name */}
      <div className="relative z-10 grid h-[clamp(680px,100svh,880px)] place-items-center px-5 pb-28 pt-28">
        <div ref={center} className="hero-center max-w-[620px] text-center">
          <svg data-hero-line viewBox="0 0 64 40" className="mx-auto h-10 w-16 text-[#f3cf7a]" aria-hidden>
            <path d="M32 38 C25 31 25 17 32 4 C39 17 39 31 32 38 Z M32 38 C22 37 13 31 9 21 C19 21 27 28 32 38 Z M32 38 C42 37 51 31 55 21 C45 21 37 28 32 38 Z M32 38 C20 39 8 35 1 28 C12 26 23 30 32 38 Z M32 38 C44 39 56 35 63 28 C52 26 41 30 32 38 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <p data-hero-line className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[#f3cf7a]">ISKCON Chandigarh · Since 1978</p>
          <h1 data-hero-line className="display mt-4 text-[#fff8ea] [text-shadow:0_4px_40px_rgba(0,0,0,.45)]">
            Hare Krishna <em className="font-normal italic text-[#f3cf7a]">Dham</em>
          </h1>
          <p data-hero-line className="mx-auto mt-5 max-w-md font-serif text-[1.35rem] italic leading-snug text-white/80">
            The home of Sri Sri Radha Madhava, Sector 36-B
          </p>
          <div data-hero-line className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/visit" className="btn bg-[#f3cf7a] text-[#1a1638] hover:bg-[#f8dc97]">Plan your darshan</Link>
            <Link href="/live" className="btn border border-white/40 text-white hover:bg-white/10">Watch live</Link>
          </div>
        </div>
      </div>

      {/* today strip */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-[#0d0b24]/55 backdrop-blur-md">
        <div className="wrap flex flex-wrap items-center justify-between gap-x-8 gap-y-1 py-3 text-[0.8rem] text-white/80">
          <TempleStatus variant="chip" />
          <span className="hidden md:inline">Today: {today.tithi} · {today.masa}</span>
          {today.nextEkadashi && <span className="hidden lg:inline">Next Ekadashi: {today.nextEkadashi}</span>}
        </div>
      </div>
    </section>
  );
}
