"use client";
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { resource, type Resource } from "@/lib/admin/schema";
import Glyph from "../ui/Glyph";
import { getPath, saveContent } from "./api";
import { Form } from "./Fields";
import { SaveBar, useDoc } from "./SaveBar";

type V = Record<string, unknown>;
const inr = (n: number) => "₹" + Number(n || 0).toLocaleString("en-IN");
const date = (s: string) => (s ? new Date(`${s.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");
const STATUS: Record<string, string> = {
  live: "bg-[#e3f1df] text-[#2f6a2a]", published: "bg-[#e3f1df] text-[#2f6a2a]", draft: "bg-[#f1ebe1] text-[#7a6758]", closed: "bg-[#e8e4f3] text-[#4b3f80]",
};

function Cell({ col, item }: { col: NonNullable<Resource["columns"]>[number]; item: V }) {
  const v = getPath(item, col.key);
  switch (col.format) {
    case "money": return <>{Number(v) ? inr(Number(v)) : "Any"}</>;
    case "date": return <>{date(String(v ?? ""))}</>;
    case "bool": return v ? <span className="a-pill bg-[#fff1df] text-[#a4501a]">Yes</span> : <span className="text-ink-soft/50">—</span>;
    case "status": return <span className={`a-pill capitalize ${STATUS[String(v)] ?? "bg-[#f1ebe1] text-ink-soft"}`}>{String(v ?? "—")}</span>;
    case "progress": {
      const pct = Math.min(100, Math.round((Number(item.raised) / Math.max(1, Number(item.goal))) * 100));
      return (
        <div className="w-40">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#f1e8da]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#d9772b,#e2c27a)]" style={{ width: `${pct}%` }} /></div>
          <p className="mt-1 text-[0.72rem] text-ink-soft">{inr(Number(item.raised))} of {inr(Number(item.goal))} · {pct}%</p>
        </div>
      );
    }
    default: return <>{String(v ?? "") || <span className="text-ink-soft/50">—</span>}</>;
  }
}

export function CollectionManager({ name, initial }: { name: string; initial: V[] }) {
  const r = resource(name)!;
  const d = useDoc<V[]>(initial);
  const [open, setOpen] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const list = d.doc;
  const idOf = (it: V, i: number) => String((r.key && it[r.key]) || i);
  const titleKey = r.columns?.find((c) => !c.format)?.key ?? "title";

  const shown = useMemo(
    () => list.map((it, i) => ({ it, i })).filter(({ it }) => !q || JSON.stringify(it).toLowerCase().includes(q.toLowerCase())),
    [list, q],
  );

  const update = (i: number, v: V) => {
    let next = list.map((x, j) => (j === i ? v : x));
    // switching "featured" on for one item switches it off for the rest
    if (v.featured && !list[i].featured) next = next.map((x, j) => (j === i ? x : { ...x, featured: false }));
    d.setDoc(next);
  };
  const add = () => {
    const blank = { ...(r.defaults ?? {}) } as V;
    d.setDoc([blank, ...list]);
    setOpen(0);
  };
  const duplicate = (i: number) => {
    const c = { ...list[i] } as V;
    if (r.key === "slug") c.slug = `${c.slug}-copy`;
    if (r.key === "id") delete c.id;
    if ("title" in c) c.title = `${c.title} (copy)`;
    if ("status" in c) c.status = "draft";
    if ("featured" in c) c.featured = false;
    d.setDoc([...list.slice(0, i + 1), c, ...list.slice(i + 1)]);
    setOpen(i + 1);
  };
  const remove = (i: number) => {
    if (!confirm(`Delete this ${r.singular.toLowerCase()}? You can still discard before saving.`)) return;
    d.setDoc(list.filter((_, j) => j !== i));
    setOpen(null);
  };
  const moveTo = (i: number, to: number) => {
    const b = [...list];
    const [x] = b.splice(i, 1);
    b.splice(to, 0, x);
    d.setDoc(b);
  };
  const save = () => d.save(async (doc) => (await saveContent(name, doc)) as V[]);

  const editing = open !== null ? list[open] : null;

  return (
    <div className="pb-24">
      {editing ? (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setOpen(null)} className="a-btn">← All {r.title.toLowerCase()}</button>
            <h2 className="flex-1 truncate font-serif text-2xl text-ink">{String(getPath(editing, titleKey) || `New ${r.singular.toLowerCase()}`)}</h2>
            {r.preview && !d.dirty && getPath(editing, r.key ?? "title") ? <a href={r.preview(editing)} target="_blank" rel="noreferrer" className="a-btn">View on site ↗</a> : null}
            <button type="button" onClick={() => duplicate(open!)} className="a-btn">Duplicate</button>
            <button type="button" onClick={() => remove(open!)} className="a-btn a-btn-danger">Delete</button>
          </div>
          <div className="a-card p-6 md:p-8">
            <Form fields={r.fields ?? []} value={editing} onChange={(v) => update(open!, v)} />
          </div>
        </div>
      ) : (
        <div className="a-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#f1e8da] p-4">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${r.title.toLowerCase()}…`} className="a-input max-w-xs" />
            <span className="flex-1 text-[0.8rem] text-ink-soft">{list.length} {list.length === 1 ? r.singular.toLowerCase() : "items"}</span>
            <button type="button" onClick={add} className="a-btn a-btn-primary">+ New {r.singular.toLowerCase()}</button>
          </div>
          {list.length === 0 ? (
            <div className="grid place-items-center px-6 py-16 text-center">
              <Glyph value={r.icon} className="h-20 w-20 opacity-80" />
              <p className="mt-3 font-serif text-xl text-ink">Nothing here yet</p>
              <button type="button" onClick={add} className="a-btn a-btn-primary mt-4">Create the first {r.singular.toLowerCase()}</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="a-table w-full">
                <thead>
                  <tr>
                    {r.sortable && <th className="hidden w-16 sm:table-cell" />}
                    {(r.columns ?? []).map((c, ci) => <th key={c.key} className={ci > 1 ? "hidden md:table-cell" : ""}>{c.label}</th>)}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {shown.map(({ it, i }) => (
                    <tr key={idOf(it, i) + i} className="cursor-pointer" onClick={() => setOpen(i)}>
                      {r.sortable && (
                        <td className="hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                          <span className="flex gap-0.5">
                            <button type="button" disabled={i === 0 || !!q} onClick={() => moveTo(i, i - 1)} className="a-icon-btn" aria-label="Move up">↑</button>
                            <button type="button" disabled={i === list.length - 1 || !!q} onClick={() => moveTo(i, i + 1)} className="a-icon-btn" aria-label="Move down">↓</button>
                          </span>
                        </td>
                      )}
                      {(r.columns ?? []).map((c, ci) => (
                        <td key={c.key} className={`${ci === 0 ? "font-medium text-ink" : "text-[0.86rem] text-ink-soft"} ${ci > 1 ? "hidden md:table-cell" : ""}`}>
                          {ci === 0 ? (
                            <span className="flex items-center gap-3">
                              {"image" in it && it.image ? <img src={String(it.image)} alt="" className="h-9 w-12 rounded-md object-cover" /> : null}
                              {"cover" in it && it.cover ? <img src={String(it.cover)} alt="" className="h-9 w-12 rounded-md object-cover" /> : null}
                              {(it.illustration || it.figure) && !it.image && !it.cover ? <Glyph value={String(it.illustration || it.figure)} className="h-9 w-9" /> : null}
                              <Cell col={c} item={it} />
                            </span>
                          ) : (
                            <Cell col={c} item={it} />
                          )}
                        </td>
                      ))}
                      <td className="whitespace-nowrap text-right text-[0.8rem] font-semibold text-[#a4501a]">Edit →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <SaveBar dirty={d.dirty} saving={d.saving} error={d.error} savedAt={d.savedAt} onSave={save} onDiscard={() => { d.discard(); setOpen(null); }} preview={editing && r.preview ? r.preview(editing) : undefined} />
    </div>
  );
}
