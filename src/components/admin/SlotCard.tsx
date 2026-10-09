"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { MediaItem, Tone } from "@/lib/media";
import { TONES } from "../media/tones";
import { MediaPicker } from "./MediaPicker";

const TONE_NAMES: Tone[] = ["altar", "night", "saffron", "gold", "dusk", "rose", "garden", "marble"];

export function SlotPreview({ m, className = "" }: { m: MediaItem; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={m.src ? undefined : { background: TONES[m.tone] }}>
      {m.src && (m.type === "video" ? (
        <video src={m.src} poster={m.poster || undefined} muted loop autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <img src={m.src} alt={m.alt} className="absolute inset-0 h-full w-full object-cover" />
      ))}
      {!m.src && <span className="absolute bottom-2 left-2 rounded-full bg-black/30 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-white/90">Placeholder</span>}
      {m.type === "video" && <span className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[0.62rem] font-semibold text-white">▶ Video</span>}
    </div>
  );
}

/** Edits one named photo/video slot from content/media.json. */
export function SlotCard({ id, label, m, onChange }: { id: string; label?: string; m: MediaItem; onChange: (m: MediaItem) => void }) {
  const [pick, setPick] = useState<null | "src" | "poster">(null);
  const [more, setMore] = useState(false);
  return (
    <div className="a-card overflow-hidden">
      <SlotPreview m={m} className="aspect-[16/10]" />
      <div className="space-y-3 p-4">
        <div>
          <p className="truncate text-[0.88rem] font-semibold text-ink">{label ?? m.label}</p>
          <p className="truncate font-mono text-[0.68rem] text-ink-soft">{id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPick("src")} className="a-btn a-btn-primary">{m.src ? "Replace" : "Upload"}</button>
          <div className="inline-flex overflow-hidden rounded-full border border-[#e3d6c1] text-[0.76rem]">
            {(["image", "video"] as const).map((t) => (
              <button key={t} type="button" onClick={() => onChange({ ...m, type: t })} className={`px-3 py-1.5 capitalize ${m.type === t ? "bg-[#24120c] text-white" : "bg-white text-ink-soft"}`}>{t}</button>
            ))}
          </div>
          {m.src && <button type="button" onClick={() => onChange({ ...m, src: "", poster: "" })} className="a-btn a-btn-ghost a-btn-danger">Remove</button>}
        </div>
        <button type="button" onClick={() => setMore((x) => !x)} className="text-[0.76rem] font-semibold text-[#a4501a]">{more ? "Hide details" : "Details: alt text, caption, colour"}</button>
        {more && (
          <div className="space-y-2.5">
            <label className="block"><span className="a-label">Alt text (describes the photo for screen readers and Google)</span><input value={m.alt} onChange={(e) => onChange({ ...m, alt: e.target.value })} className="a-input mt-1" /></label>
            <label className="block"><span className="a-label">Caption / label</span><input value={m.label} onChange={(e) => onChange({ ...m, label: e.target.value })} className="a-input mt-1" /></label>
            {m.type === "video" && (
              <>
                <div>
                  <span className="a-label">Poster image (shown before the video plays, and on slow connections)</span>
                  <div className="mt-1 flex items-center gap-2">
                    {m.poster && <img src={m.poster} alt="" className="h-10 w-16 rounded-md object-cover" />}
                    <button type="button" onClick={() => setPick("poster")} className="a-btn">{m.poster ? "Change poster" : "Add poster"}</button>
                  </div>
                </div>
                <label className="block"><span className="a-label">Duration label</span><input value={m.duration ?? ""} onChange={(e) => onChange({ ...m, duration: e.target.value })} placeholder="0:30" className="a-input mt-1" /></label>
              </>
            )}
            <div>
              <span className="a-label">Placeholder colour (used while there&rsquo;s no file)</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {TONE_NAMES.map((t) => (
                  <button key={t} type="button" title={t} onClick={() => onChange({ ...m, tone: t })} className={`h-7 w-7 rounded-full ring-offset-2 ${m.tone === t ? "ring-2 ring-saffron" : ""}`} style={{ background: TONES[t] }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {pick && (
        <MediaPicker
          accept={pick === "poster" ? "image" : m.type}
          onClose={() => setPick(null)}
          onPick={(url, u) => {
            if (pick === "poster") onChange({ ...m, poster: url });
            else onChange({ ...m, src: url, type: u?.kind === "video" ? "video" : u?.kind ? "image" : m.type });
            setPick(null);
          }}
        />
      )}
    </div>
  );
}
