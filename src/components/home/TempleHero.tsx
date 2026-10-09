"use client";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface Props {
  welcome?: string;
  title: string;
  subtitle?: string;
  medallions: { label: string; href: string; icon: ReactNode }[];
  today?: string;
  background: ReactNode;
  reel: { node: ReactNode; label: string }[];
  next?: { title: string; when: string; href: string };
}

export default function TempleHero({ welcome, title: heading, subtitle, medallions, background, reel, next, today }: Props) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const title = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = root.current!;
    const still = document.documentElement.hasAttribute("data-still");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (still || reduced) return;
      gsap.from("[data-h]", { opacity: 0, y: 28, duration: 1.3, ease: "power3.out", stagger: 0.1, delay: 0.15 });
      gsap.from("[data-medal]", { opacity: 0, y: 30, scale: 0.85, duration: 1.1, ease: "back.out(1.6)", stagger: 0.08, delay: 0.7 });
      gsap.fromTo("[data-bg]", { scale: 1.12 }, { scale: 1, duration: 3.2, ease: "power2.out" });
      gsap.to("[data-bg]", { yPercent: 14, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(title.current, { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true } });
    }, sec);

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
          const t = title.current!.getBoundingClientRect();
          if (!s.width) return;
          scene!.setSize(s.width, s.height);
          scene!.setTarget(t.left - s.left + t.width / 2, t.top - s.top + t.height * 0.42, Math.min(s.width * 0.36, 520));
        };
        measure();
        ro = new ResizeObserver(measure);
        ro.observe(sec);
        io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene!.play() : scene!.pause()));
        io.observe(sec);
        st = ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom top", scrub: true, onUpdate: (x) => scene!.setScroll(x.progress) });
      });
    }
    return () => {
      cancelled = true;
      ctx.revert();
      ro?.disconnect();
      io?.disconnect();
      st?.kill();
      scene?.dispose();
    };
  }, []);

  return (
    <>
      <section ref={root} className="relative isolate overflow-hidden bg-[#140a08] pt-[108px] text-white">
        <div data-bg className="absolute inset-0 -z-20">{background}</div>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_45%,rgba(20,8,6,.25),rgba(20,8,6,.78))]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#140a08] to-transparent" />
        <canvas ref={canvas} className="pointer-events-none absolute inset-0 z-0 h-full w-full" />

        <div className="relative z-10 flex min-h-[clamp(580px,calc(100svh-108px),780px)] flex-col items-center justify-center px-5 pb-36 pt-10 text-center">
          <div ref={title}>
            {welcome && <p data-h className="text-[0.95rem] font-medium tracking-wide text-white/90">{welcome}</p>}
            <h1 data-h className="script mt-3 text-[clamp(3rem,7.4vw,6.6rem)] leading-[1.05] text-white [text-shadow:0_6px_40px_rgba(240,160,70,.45)]">
              {heading}
            </h1>
            {subtitle && (
              <p data-h className="mt-4 text-[clamp(0.95rem,1.4vw,1.1rem)] font-medium text-white/90">{subtitle}</p>
            )}
          </div>

          <div className={`mt-10 grid grid-cols-2 gap-x-10 gap-y-6 md:gap-x-14 ${medallions.length >= 4 ? "sm:grid-cols-4" : medallions.length === 3 ? "sm:grid-cols-3" : ""}`}>
            {medallions.map((m) => (
              <Link key={m.href + m.label} href={m.href} data-medal className="group flex flex-col items-center">
                <span className="relative grid h-[92px] w-[92px] place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff6e6,#f3dcb4)] shadow-[0_18px_40px_-14px_rgba(240,140,50,.75)] ring-4 ring-[#e8913f]/45 transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:ring-[#f0b765]/80 md:h-[104px] md:w-[104px]">
                  {m.icon}
                </span>
                <span className="mt-3 text-[0.92rem] font-semibold tracking-wide text-white [text-shadow:0_2px_12px_rgba(0,0,0,.6)]">{m.label}</span>
              </Link>
            ))}
          </div>

          {next && (
            <Link href={next.href} data-h className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/30 px-5 py-2 text-[0.8rem] text-white/85 backdrop-blur-md hover:bg-black/40">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f0b765]" />
              {today && <span className="hidden sm:inline">{today} ·</span>} Next: <strong className="font-semibold text-white">{next.title}</strong> · {next.when}
            </Link>
          )}
        </div>

        {/* wave edge */}
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[-1px] z-10 h-[70px] w-full md:h-[110px]" aria-hidden>
          <path d="M0 64 C180 20 360 100 560 70 C760 40 900 110 1100 80 C1260 56 1360 40 1440 52 L1440 120 L0 120 Z" fill="#fffdf8" />
          <path d="M0 64 C180 20 360 100 560 70 C760 40 900 110 1100 80 C1260 56 1360 40 1440 52" fill="none" stroke="#f0b765" strokeOpacity=".5" strokeWidth="1.2" />
        </svg>
      </section>

      {/* festival reel riding the wave: every frame plays its own film */}
      {reel.length > 0 && <div className="relative z-20 -mt-16 overflow-hidden pb-4 md:-mt-20">
        <div className="reel-track flex w-max gap-4 px-4">
          {[...reel, ...reel].map((r, i) => (
            <figure key={i} className="relative h-[120px] w-[200px] shrink-0 overflow-hidden rounded-[16px] shadow-[0_18px_40px_-20px_rgba(60,20,5,.7)] ring-4 ring-[#fffdf8] md:h-[150px] md:w-[250px]" aria-hidden={i >= reel.length}>
              {r.node}
              <figcaption className="absolute bottom-2 left-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,.6)]">{r.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>}
    </>
  );
}
