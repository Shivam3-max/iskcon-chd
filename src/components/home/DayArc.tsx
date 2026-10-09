"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { fmt12, istMinutes, toMin } from "@/lib/schedule";
import { useSite } from "../SiteProvider";

const T0 = 240; // 4:00
const T1 = 1260; // 21:00
const X = (t: number) => 40 + ((t - T0) / (T1 - T0)) * 920;
const Y = (t: number) => 250 - Math.sin(Math.PI * ((X(t) - 40) / 920)) * 190;

function arcPath(a: number, b: number) {
  let d = "";
  for (let t = a; t <= b; t += 5) d += `${d ? "L" : "M"}${X(t).toFixed(1)} ${Y(t).toFixed(1)} `;
  return d + `L${X(b).toFixed(1)} ${Y(b).toFixed(1)}`;
}

export default function DayArc() {
  const { schedule: SCHEDULE } = useSite();
  const sun = useRef<SVGGElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // read the clock after mount so server and client render the same markup
    const first = setTimeout(() => setNow(istMinutes()), 0);
    const id = setInterval(() => setNow(istMinutes()), 60_000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);

  useEffect(() => {
    if (now === null || !sun.current) return;
    const target = Math.min(T1, Math.max(T0, now));
    const place = (t: number) => sun.current!.setAttribute("transform", `translate(${X(t)} ${Y(t)})`);
    if (document.documentElement.hasAttribute("data-still") || sun.current.dataset.placed) {
      place(target);
      return;
    }
    sun.current.dataset.placed = "1";
    place(T0);
    const o = { t: T0 };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      gsap.to(o, { t: target, duration: 2.6, ease: "power2.inOut", onUpdate: () => place(o.t) });
    }, { threshold: 0.4 });
    io.observe(svg.current!);
    return () => io.disconnect();
  }, [now]);

  const aartis = SCHEDULE.filter((s) => s.aarti);
  const night = now !== null && (now < toMin("04:30") || now >= toMin("20:30"));

  return (
    <div className="relative">
      <svg ref={svg} viewBox="0 -30 1000 330" className="w-full" role="img" aria-label="The temple day, from Mangala Aarti at 4:30 am to Shayana at 8:30 pm">
        <defs>
          <radialGradient id="sunglow">
            <stop offset="0" stopColor="#ffd98a" stopOpacity=".95" />
            <stop offset=".4" stopColor="#f0a13c" stopOpacity=".45" />
            <stop offset="1" stopColor="#f0a13c" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* horizon */}
        <line x1="20" y1="252" x2="980" y2="252" stroke="#d8c7a8" strokeWidth="1" />
        {/* whole day, faint */}
        <path d={arcPath(T0, T1)} fill="none" stroke="#d8c7a8" strokeWidth="1.2" strokeDasharray="2 6" />
        {/* altar-open stretches */}
        {SCHEDULE.filter((s) => s.open && toMin(s.start) < toMin(s.end)).map((s) => (
          <path key={s.start} d={arcPath(toMin(s.start), toMin(s.end))} fill="none" stroke="#c99a3a" strokeWidth="4" strokeLinecap="round" />
        ))}
        {/* hour ticks */}
        {[6, 9, 12, 15, 18].map((h) => (
          <g key={h}>
            <line x1={X(h * 60)} y1="252" x2={X(h * 60)} y2="260" stroke="#b9a582" />
            <text x={X(h * 60)} y="278" textAnchor="middle" className="fill-ink-soft text-[13px]">{h === 12 ? "noon" : `${h % 12}${h < 12 ? " am" : " pm"}`}</text>
          </g>
        ))}
        {/* aarti markers */}
        {aartis.map((s, i) => {
          const t = toMin(s.start);
          const up = i % 2 === 0;
          return (
            <g key={s.start}>
              <circle cx={X(t)} cy={Y(t)} r="6.5" fill="#fbf6ec" stroke="#7a1e22" strokeWidth="1.6" />
              <circle cx={X(t)} cy={Y(t)} r="2.4" fill="#7a1e22" />
              <line x1={X(t)} y1={Y(t) + (up ? -9 : 9)} x2={X(t)} y2={Y(t) + (up ? -30 : 30)} stroke="#7a1e22" strokeWidth=".8" />
              <text x={X(t)} y={Y(t) + (up ? -50 : 48)} textAnchor="middle" className="fill-maroon font-serif text-[18px]">{s.title.replace(" & Darshan", "").replace(" & Guru Puja", "").replace(" & Gita Class", "")}</text>
              <text x={X(t)} y={Y(t) + (up ? -34 : 64)} textAnchor="middle" className="fill-ink-soft text-[13px]">{fmt12(s.start)}</text>
            </g>
          );
        })}
        {/* the sun */}
        <g ref={sun} transform={`translate(${X(T0)} ${Y(T0)})`} style={{ opacity: now === null ? 0 : 1 }}>
          <circle r="34" fill="url(#sunglow)" />
          <circle r="11" fill={night ? "#efe6d2" : "#f2b54a"} stroke="#c26c3d" strokeWidth="1.2" />
          {!night && Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="0" y1="-16" x2="0" y2="-21" stroke="#c26c3d" strokeWidth="1.4" strokeLinecap="round" transform={`rotate(${i * 45})`} />
          ))}
        </g>
      </svg>
      {night && <p className="mt-2 text-center text-sm text-ink-soft">The Deities are resting. Mangala Aarti is at 4:30 am.</p>}
    </div>
  );
}
