"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "iskcon-chd-japa";
const BEADS = 108;

interface Store { day: string; rounds: number; streak: number; last: string; total: number }
const today = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);

function load(): Store {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null") as Store | null;
    if (s) return s.day === today() ? s : { ...s, day: today(), rounds: 0 };
  } catch {}
  return { day: today(), rounds: 0, streak: 0, last: "", total: 0 };
}

export default function JapaMala() {
  const [bead, setBead] = useState(0);
  const [store, setStore] = useState<Store | null>(null);
  const [goal, setGoal] = useState(16);

  // localStorage is only readable after mount
  useEffect(() => {
    const t = setTimeout(() => setStore(load()), 0);
    return () => clearTimeout(t);
  }, []);

  const save = (s: Store) => {
    setStore(s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  };

  const advance = useCallback(() => {
    if (!store) return;
    navigator.vibrate?.(8);
    setBead((b) => {
      const n = b + 1;
      if (n >= BEADS) {
        const t = today();
        const yesterday = new Date(Date.parse(`${t}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
        const streak = store.last === t ? store.streak : store.last === yesterday ? store.streak + 1 : 1;
        save({ day: t, rounds: store.rounds + 1, streak, last: t, total: store.total + 1 });
        navigator.vibrate?.([30, 60, 30]);
        return 0;
      }
      return n;
    });
  }, [store]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); advance(); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [advance]);

  const R = 168;
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_.8fr]">
      <button onClick={advance} className="relative mx-auto block aspect-square w-full max-w-[460px] select-none rounded-full outline-none" aria-label={`Chant one mantra. Bead ${bead} of 108`}>
        <svg viewBox="-200 -200 400 400" className="h-full w-full">
          <circle r={R} fill="none" stroke="#e4d2b0" strokeWidth="1" />
          {/* guru bead at the top */}
          <circle cx="0" cy={-R - 18} r="10" fill="#b88a2e" stroke="#7a5a1c" />
          <path d={`M0 ${-R - 8} L0 ${-R}`} stroke="#b88a2e" strokeWidth="1.5" />
          {Array.from({ length: BEADS }).map((_, i) => {
            const a = ((i + 0.5) / BEADS) * Math.PI * 2 - Math.PI / 2;
            const done = i < bead;
            const cur = i === bead;
            return (
              <circle
                key={i}
                cx={Math.cos(a) * R}
                cy={Math.sin(a) * R}
                r={cur ? 7.5 : 5}
                fill={cur ? "#e07b24" : done ? "#c99a3a" : "#f3e6cf"}
                stroke={done || cur ? "#8a5a1c" : "#cdb48d"}
                strokeWidth=".8"
                style={{ transition: "r .2s, fill .3s" }}
              />
            );
          })}
          <text y="-14" textAnchor="middle" className="fill-maroon font-serif" style={{ fontSize: 64 }}>{bead}</text>
          <text y="16" textAnchor="middle" className="fill-ink-soft" style={{ fontSize: 12, letterSpacing: 3 }}>OF 108</text>
          <text y="48" textAnchor="middle" className="fill-ink-soft" style={{ fontSize: 11 }}>tap · space · enter</text>
        </svg>
      </button>

      <div>
        <p className="deva text-[1.6rem] leading-relaxed text-maroon">
          हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे ।<br />हरे राम हरे राम राम राम हरे हरे ॥
        </p>
        <p className="mt-3 font-serif text-xl italic text-ink-soft">Hare Krishna Hare Krishna Krishna Krishna Hare Hare · Hare Rama Hare Rama Rama Rama Hare Hare</p>
        <dl className="mt-10 grid grid-cols-3 gap-4">
          {[
            ["Rounds today", store ? `${store.rounds}/${goal}` : "–"],
            ["Day streak", store ? String(store.streak) : "–"],
            ["All rounds", store ? String(store.total) : "–"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[14px] bg-paper p-4 text-center">
              <dt className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">{k}</dt>
              <dd className="mt-1 font-serif text-3xl font-semibold text-maroon">{v}</dd>
            </div>
          ))}
        </dl>
        {store && (
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-paper">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#d9721f,#e2c27a)] transition-[width] duration-500" style={{ width: `${Math.min(100, (store.rounds / goal) * 100)}%` }} />
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
          Daily goal
          {[1, 4, 8, 16].map((g) => (
            <button key={g} onClick={() => setGoal(g)} className={`rounded-full px-3.5 py-1 ${goal === g ? "bg-maroon text-ivory" : "bg-paper text-ink"}`}>{g}</button>
          ))}
          <button onClick={() => setBead(0)} className="ml-auto underline-offset-4 hover:underline">Restart this round</button>
        </div>
        <p className="mt-8 text-[0.88rem] text-ink-soft">Your count stays on this device only. Initiated devotees chant sixteen rounds a day, but one round, chanted with attention, is a beautiful start.</p>
      </div>
    </div>
  );
}
