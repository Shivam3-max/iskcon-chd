"use client";
import { useState } from "react";
import type { Group } from "@/lib/admin/schema";
import { resource } from "@/lib/admin/schema";
import type { MediaItem } from "@/lib/media";
import { saveContent } from "./api";
import { Form } from "./Fields";
import { SaveBar, useDoc } from "./SaveBar";
import { SlotCard } from "./SlotCard";

type V = Record<string, unknown>;
export interface MediaDoc { slots: Record<string, MediaItem>; gallery: MediaItem[] }

export const blankSlot = (id: string): MediaItem => ({ type: "image", src: "", alt: id, label: id.split(".").pop() ?? id, tone: "marble" });

/** Cards for a group of fields plus the photo/video slots that belong with it. */
export function GroupCard({ g, value, onChange, media, onMedia }: { g: Group; value: V; onChange: (v: V) => void; media?: MediaDoc; onMedia?: (m: MediaDoc) => void }) {
  return (
    <section id={`g-${g.id}`} className="a-card scroll-mt-24 p-6 md:p-7">
      <div className="mb-5">
        <h2 className="font-serif text-[1.35rem] text-ink">{g.title}</h2>
        {g.description && <p className="mt-0.5 text-[0.82rem] text-ink-soft">{g.description}</p>}
      </div>
      {g.fields.length > 0 && <Form fields={g.fields} value={value} onChange={onChange} />}
      {g.slots && media && onMedia && (
        <div className={g.fields.length ? "mt-7 border-t border-[#f1e8da] pt-6" : ""}>
          <p className="a-label mb-3">Photos & videos in this section</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {g.slots.map((s) => (
              <SlotCard key={s.id} id={s.id} label={s.label} m={media.slots[s.id] ?? blankSlot(s.id)} onChange={(m) => onMedia({ ...media, slots: { ...media.slots, [s.id]: m } })} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function SingletonEditor({ name, initial, media: initialMedia }: { name: string; initial: V; media?: MediaDoc }) {
  const r = resource(name)!;
  const d = useDoc<{ data: V; media?: MediaDoc }>({ data: initial, media: initialMedia });
  const groups: Group[] = r.groups ?? [{ id: "main", title: r.title, fields: r.fields ?? [] }];
  const [active, setActive] = useState(groups[0]?.id);

  const save = () =>
    d.save(async (doc) => {
      const data = await saveContent(name, doc.data);
      const media = doc.media && JSON.stringify(doc.media) !== JSON.stringify(d.saved.media) ? await saveContent("media", doc.media) : doc.media;
      return { data: data as V, media: media as MediaDoc | undefined };
    });

  return (
    <div className={groups.length > 1 ? "grid gap-6 lg:grid-cols-[220px_1fr]" : ""}>
      {groups.length > 1 && (
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-0.5">
            {groups.map((g) => (
              <a key={g.id} href={`#g-${g.id}`} onClick={() => setActive(g.id)} className={`block rounded-xl px-3 py-2 text-[0.84rem] ${active === g.id ? "bg-white font-semibold text-ink shadow-sm" : "text-ink-soft hover:bg-white/60"}`}>
                {g.title}
              </a>
            ))}
          </div>
        </nav>
      )}
      <div className="space-y-6 pb-24">
        {groups.map((g) => (
          <GroupCard key={g.id} g={g} value={d.doc.data} onChange={(v) => d.setDoc({ ...d.doc, data: v })} media={d.doc.media} onMedia={(m) => d.setDoc({ ...d.doc, media: m })} />
        ))}
      </div>
      <SaveBar dirty={d.dirty} saving={d.saving} error={d.error} savedAt={d.savedAt} onSave={save} onDiscard={d.discard} preview={r.preview?.(d.doc.data)} />
    </div>
  );
}
