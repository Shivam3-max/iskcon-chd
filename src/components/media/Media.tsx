import { getSlot, type MediaItem, type Tone } from "@/lib/media";
import VideoPlayer from "./VideoPlayer";

import { TONES } from "./tones";

const DARK: Tone[] = ["altar", "night", "saffron", "dusk", "rose", "garden"];

function Placeholder({ m, showLabel, ambient }: { m: MediaItem; showLabel: boolean; ambient?: boolean }) {
  const dark = DARK.includes(m.tone);
  return (
    <div className="absolute inset-0" style={{ background: TONES[m.tone] }} role="img" aria-label={m.alt} data-media-placeholder>
      <div className="media-grain absolute inset-0" />
      {m.type === "video" && !ambient && (
        <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-white/20 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
          <svg width="18" height="20" viewBox="0 0 18 20"><path d="M2 1.5 L16 10 L2 18.5 Z" fill="#fff" /></svg>
        </span>
      )}
      {showLabel && (
        <span className={`absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.68rem] font-medium tracking-wide backdrop-blur-md ${dark ? "bg-black/25 text-white/90" : "bg-white/55 text-ink/75"}`}>
          {m.type === "video" ? (
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1 L9 5 L1 9 Z" fill="currentColor" /></svg>
          ) : (
            <svg width="12" height="10" viewBox="0 0 12 10"><rect x=".6" y="1.8" width="10.8" height="7.6" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1" /><circle cx="6" cy="5.6" r="2" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
          )}
          {m.label}
          {m.duration && <span className="opacity-70">· {m.duration}</span>}
        </span>
      )}
    </div>
  );
}

export function MediaView({ m, className = "", showLabel = true, ambient = false }: { m: MediaItem; className?: string; showLabel?: boolean; ambient?: boolean }) {
  return (
    <div className={`group overflow-hidden bg-ivory-deep ${className.includes("absolute") ? "" : "relative"} ${className}`}>
      {m.src ? (
        m.type === "video" ? (
          <VideoPlayer src={m.src} poster={m.poster} alt={m.alt} ambient={ambient} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.src} alt={m.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.04]" />
        )
      ) : m.youtube ? (
        <a href={m.youtube} target="_blank" rel="noreferrer" className="absolute inset-0">
          <Placeholder m={m} showLabel={showLabel} />
        </a>
      ) : (
        <Placeholder m={m} showLabel={showLabel} ambient={ambient} />
      )}
    </div>
  );
}

/** A named media slot from content/media.json. */
export default function Media({ slot, className, showLabel, ambient }: { slot: string; className?: string; showLabel?: boolean; ambient?: boolean }) {
  return <MediaView m={getSlot(slot)} className={className} showLabel={showLabel} ambient={ambient} />;
}
