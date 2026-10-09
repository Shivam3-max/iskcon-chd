"use client";
import { useEffect, useState } from "react";
import { fmt12, humanMins, templeStatus } from "@/lib/schedule";
import { useSite } from "./SiteProvider";

/** Live altar state for Chandigarh time. Renders nothing until mounted so SSR and client agree. */
export default function TempleStatus({ variant = "bar" }: { variant?: "bar" | "chip" }) {
  const { schedule } = useSite();
  const [s, setS] = useState<ReturnType<typeof templeStatus> | null>(null);
  useEffect(() => {
    const tick = () => setS(templeStatus(Date.now(), schedule));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [schedule]);
  if (!s) return <span className="inline-block h-4" />;

  const open = s.current.open;
  const dot = (
    <span className="relative inline-flex h-2 w-2">
      <span className={`inline-flex h-2 w-2 rounded-full ${open ? "bg-[#6fb36a]" : "bg-[#c9a36a]"}`} />
    </span>
  );

  if (variant === "chip") {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
        {dot}
        <span className="font-semibold">{open ? "Altar open" : "Altar closed"}</span>
        <span className="opacity-60">·</span>
        <span>{s.current.title}</span>
        <span className="opacity-60">·</span>
        <span className="opacity-80">
          {s.next.title} in {humanMins(s.minsToNext)}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      {dot}
      <span>
        {open ? "Darshan open now" : "Altar closed now"} · {s.current.title}
      </span>
      <span className="hidden opacity-70 md:inline">
        · Next: {s.next.title}, {fmt12(s.next.start)}
      </span>
    </span>
  );
}
