"use client";
import { useMemo, useState } from "react";
import type { MediaItem } from "@/lib/media";
import { saveContent } from "./api";
import { SaveBar, useDoc } from "./SaveBar";
import { SlotCard } from "./SlotCard";
import type { MediaDoc } from "./SingletonEditor";

const GROUPS: { id: string; title: string; match: (id: string) => boolean }[] = [
  { id: "hero", title: "Homepage hero & reel", match: (k) => k.startsWith("hero.") || k === "home.hero.bg" || k === "home.hero.deity" || k === "home.hero.kirtan" || k === "home.hero.temple" },
  { id: "home", title: "Homepage sections", match: (k) => k.startsWith("home.") || k.startsWith("aarti.") },
  { id: "pages", title: "Page headers", match: (k) => k.startsWith("page.") },
  { id: "festivals", title: "Festivals", match: (k) => k.startsWith("festival.") },
  { id: "programs", title: "Programs", match: (k) => k.startsWith("program.") },
  { id: "about", title: "About & visit", match: (k) => k.startsWith("about.") || k.startsWith("visit.") },
];

export function MediaManager({ initial }: { initial: MediaDoc }) {
  const d = useDoc<MediaDoc>(initial);
  const [tab, setTab] = useState("hero");
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const ids = Object.keys(d.doc.slots);
  const filled = ids.filter((k) => d.doc.slots[k].src).length;

  const visible = useMemo(() => {
    if (tab === "gallery") return [];
    const g = GROUPS.find((x) => x.id === tab)!;
    const taken = new Set(GROUPS.slice(0, GROUPS.indexOf(g)).flatMap((x) => ids.filter(x.match)));
    return ids.filter((k) => g.match(k) && !taken.has(k) && (!onlyEmpty || !d.doc.slots[k].src));
  }, [tab, ids, onlyEmpty, d.doc.slots]);

  const setSlot = (k: string, m: MediaItem) => d.setDoc({ ...d.doc, slots: { ...d.doc.slots, [k]: m } });
  const gallery = d.doc.gallery;
  const setGallery = (g: MediaItem[]) => d.setDoc({ ...d.doc, gallery: g });

  return (
    <div className="pb-24">
      <div className="a-card mb-6 flex flex-wrap items-center gap-5 p-5">
        <div className="flex-1">
          <p className="font-serif text-xl text-ink">{filled} of {ids.length} photo & video spots filled</p>
          <div className="mt-2 h-2 max-w-md overflow-hidden rounded-full bg-[#f1e8da]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#d9772b,#e2c27a)]" style={{ width: `${(filled / Math.max(1, ids.length)) * 100}%` }} /></div>
        </div>
        <label className="flex items-center gap-2 text-[0.84rem] text-ink-soft"><input type="checkbox" checked={onlyEmpty} onChange={(e) => setOnlyEmpty(e.target.checked)} className="accent-[#c8601e]" /> Show only empty spots</label>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[...GROUPS, { id: "gallery", title: `Moments gallery (${gallery.length})` }].map((g) => (
          <button key={g.id} type="button" onClick={() => setTab(g.id)} className={`rounded-full px-4 py-2 text-[0.84rem] font-semibold ${tab === g.id ? "bg-[#24120c] text-white" : "bg-white text-ink-soft hover:text-ink"}`}>{g.title}</button>
        ))}
      </div>

      {tab === "gallery" ? (
        <div>
          <p className="mb-4 text-[0.84rem] text-ink-soft">The masonry collage on the homepage. Tall and wide tiles span two rows or columns.</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {gallery.map((m, i) => (
              <div key={i}>
                <SlotCard id={`gallery #${i + 1}`} m={m} onChange={(x) => setGallery(gallery.map((y, j) => (j === i ? x : y)))} />
                <div className="mt-2 flex items-center gap-1">
                  <select value={m.span ?? ""} onChange={(e) => setGallery(gallery.map((y, j) => (j === i ? { ...y, span: (e.target.value || undefined) as MediaItem["span"] } : y)))} className="a-input !py-1.5 text-[0.8rem]">
                    <option value="">Normal tile</option><option value="tall">Tall tile</option><option value="wide">Wide tile</option>
                  </select>
                  <button type="button" disabled={i === 0} onClick={() => { const g = [...gallery]; [g[i - 1], g[i]] = [g[i], g[i - 1]]; setGallery(g); }} className="a-icon-btn">←</button>
                  <button type="button" disabled={i === gallery.length - 1} onClick={() => { const g = [...gallery]; [g[i + 1], g[i]] = [g[i], g[i + 1]]; setGallery(g); }} className="a-icon-btn">→</button>
                  <button type="button" onClick={() => setGallery(gallery.filter((_, j) => j !== i))} className="a-icon-btn hover:!text-[#9b2c2c]">✕</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setGallery([...gallery, { type: "image", src: "", alt: "", label: "New photo", tone: "gold" }])} className="grid min-h-[220px] place-items-center rounded-[20px] border-2 border-dashed border-[#e3d6c1] text-ink-soft hover:border-saffron hover:text-[#a4501a]">+ Add a tile</button>
          </div>
        </div>
      ) : visible.length === 0 ? (
        <p className="a-card p-10 text-center text-ink-soft">All the spots here are filled. 🙏</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((k) => <SlotCard key={k} id={k} m={d.doc.slots[k]} onChange={(m) => setSlot(k, m)} />)}
        </div>
      )}
      <SaveBar dirty={d.dirty} saving={d.saving} error={d.error} savedAt={d.savedAt} onSave={() => d.save(async (doc) => (await saveContent("media", doc)) as MediaDoc)} onDiscard={d.discard} />
    </div>
  );
}
