"use client";
import { useRef, useState } from "react";
import { HOME_SECTIONS } from "@/lib/admin/schema";
import { saveContent } from "./api";
import { SaveBar, useDoc } from "./SaveBar";
import { GroupCard, type MediaDoc } from "./SingletonEditor";

type V = Record<string, unknown>;
interface HomeDoc { order: string[]; sections: Record<string, V & { visible?: boolean }> }

export function HomeEditor({ initial, media }: { initial: HomeDoc; media: MediaDoc }) {
  const d = useDoc<{ home: HomeDoc; media: MediaDoc }>({ home: initial, media });
  const [sel, setSel] = useState(initial.order[0]);
  const [preview, setPreview] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const { home } = d.doc;
  const group = HOME_SECTIONS.find((g) => g.id === sel)!;

  const setHome = (h: HomeDoc) => d.setDoc({ ...d.doc, home: h });
  const move = (i: number, to: number) => {
    const o = [...home.order];
    const [x] = o.splice(i, 1);
    o.splice(to, 0, x);
    setHome({ ...home, order: o });
  };
  const toggle = (id: string) => setHome({ ...home, sections: { ...home.sections, [id]: { ...home.sections[id], visible: home.sections[id]?.visible === false } } });

  const save = () =>
    d.save(async (doc) => {
      const h = (await saveContent("home", doc.home)) as HomeDoc;
      const m = JSON.stringify(doc.media) !== JSON.stringify(d.saved.media) ? ((await saveContent("media", doc.media)) as MediaDoc) : doc.media;
      setTimeout(() => frame.current?.contentWindow?.location.reload(), 300);
      return { home: h, media: m };
    });

  return (
    <div className="pb-24">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.84rem] text-ink-soft">Choose a section to edit its words, buttons, icons and photos. Use the arrows to reorder sections and the switch to hide one.</p>
        <button type="button" onClick={() => setPreview((p) => !p)} className="a-btn">{preview ? "Hide preview" : "Show live preview"}</button>
      </div>
      <div className={`grid gap-6 ${preview ? "xl:grid-cols-[260px_1fr_460px]" : "lg:grid-cols-[280px_1fr]"}`}>
        <nav className="a-card h-max p-2 lg:sticky lg:top-24">
          {home.order.map((id, i) => {
            const g = HOME_SECTIONS.find((x) => x.id === id);
            if (!g) return null;
            const visible = home.sections[id]?.visible !== false;
            return (
              <div key={id} className={`group flex items-center gap-1 rounded-xl pr-1 ${sel === id ? "bg-[#fff1df]" : "hover:bg-[#faf5ec]"}`}>
                <button type="button" onClick={() => setSel(id)} className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left">
                  <span className="w-5 text-right font-mono text-[0.7rem] text-ink-soft">{i + 1}</span>
                  <span className={`truncate text-[0.86rem] ${sel === id ? "font-semibold text-ink" : visible ? "text-ink" : "text-ink-soft line-through"}`}>{g.title}</span>
                </button>
                <button type="button" onClick={() => toggle(id)} title={visible ? "Hide section" : "Show section"} className={`a-icon-btn ${visible ? "" : "!text-[#c0392b]"}`}>{visible ? "●" : "○"}</button>
                <span className="hidden group-hover:flex">
                  <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} className="a-icon-btn" aria-label="Move up">↑</button>
                  <button type="button" disabled={i === home.order.length - 1} onClick={() => move(i, i + 1)} className="a-icon-btn" aria-label="Move down">↓</button>
                </span>
              </div>
            );
          })}
        </nav>

        <div className="min-w-0">
          {home.sections[sel]?.visible === false && (
            <p className="mb-4 rounded-2xl bg-[#fdf0e1] px-4 py-3 text-[0.84rem] text-[#8a4a14]">This section is hidden on the website. Switch it back on in the list.</p>
          )}
          <GroupCard
            g={group}
            value={home.sections[sel] ?? {}}
            onChange={(v) => setHome({ ...home, sections: { ...home.sections, [sel]: v } })}
            media={d.doc.media}
            onMedia={(m) => d.setDoc({ ...d.doc, media: m })}
          />
        </div>

        {preview && (
          <div className="a-card hidden h-[calc(100vh-140px)] overflow-hidden xl:sticky xl:top-24 xl:block">
            <div className="flex items-center justify-between border-b border-[#f1e8da] px-4 py-2 text-[0.76rem] text-ink-soft">
              <span>Live site · updates after you save</span>
              <button type="button" onClick={() => frame.current?.contentWindow?.location.reload()} className="font-semibold text-[#a4501a]">Reload</button>
            </div>
            <div className="relative h-full w-full overflow-hidden">
              <iframe ref={frame} src="/" title="Homepage preview" className="absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[0.4]" />
            </div>
          </div>
        )}
      </div>
      <SaveBar dirty={d.dirty} saving={d.saving} error={d.error} savedAt={d.savedAt} onSave={save} onDiscard={d.discard} preview="/" />
    </div>
  );
}
