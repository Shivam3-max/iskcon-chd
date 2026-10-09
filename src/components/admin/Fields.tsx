"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import type { Field } from "@/lib/admin/schema";
import Glyph from "../ui/Glyph";
import { getPath, loadContent, setPath } from "./api";
import { IconPicker, MediaPicker } from "./MediaPicker";

type V = Record<string, unknown>;
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 80);

function Move({ i, n, onMove, onRemove }: { i: number; n: number; onMove: (to: number) => void; onRemove: () => void }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <button type="button" disabled={i === 0} onClick={() => onMove(i - 1)} className="a-icon-btn" aria-label="Move up">↑</button>
      <button type="button" disabled={i === n - 1} onClick={() => onMove(i + 1)} className="a-icon-btn" aria-label="Move down">↓</button>
      <button type="button" onClick={onRemove} className="a-icon-btn hover:!bg-[#fdecea] hover:!text-[#9b2c2c]" aria-label="Remove">✕</button>
    </span>
  );
}
const move = <T,>(a: T[], from: number, to: number) => {
  const b = [...a];
  const [x] = b.splice(from, 1);
  b.splice(to, 0, x);
  return b;
};

function ImageField({ value, onChange, accept }: { value?: string; onChange: (v: string) => void; accept: "image" | "video" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#efe5d6] bg-[#fcf8f1] p-3">
      <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#efe5d6] text-[0.7rem] text-ink-soft">
        {value ? accept === "video" ? <video src={value} muted className="h-full w-full object-cover" /> : <img src={value} alt="" className="h-full w-full object-cover" /> : "No file"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOpen(true)} className="a-btn">{value ? "Replace" : accept === "video" ? "Add video" : "Add image"}</button>
          {value && <button type="button" onClick={() => onChange("")} className="a-btn a-btn-ghost">Remove</button>}
        </div>
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="…or paste a link" className="a-input mt-2 text-[0.8rem]" />
      </div>
      {open && <MediaPicker accept={accept} onClose={() => setOpen(false)} onPick={(url) => { onChange(url); setOpen(false); }} />}
    </div>
  );
}

function IconField({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => setOpen(true)} className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[#efe5d6] bg-[#fff8ee] hover:border-saffron">
        {value ? <Glyph value={value} className="h-12 w-12" /> : <span className="text-xs text-ink-soft">None</span>}
      </button>
      <div>
        <button type="button" onClick={() => setOpen(true)} className="a-btn">Change icon</button>
        <p className="mt-1 text-[0.72rem] text-ink-soft">{value && !value.startsWith("/") ? value.replace("-", " ") : value ? "Uploaded icon" : ""}</p>
      </div>
      {open && <IconPicker value={value} onClose={() => setOpen(false)} onPick={(v) => { onChange(v); setOpen(false); }} />}
    </div>
  );
}

function CampaignField({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const [list, setList] = useState<{ slug: string; title: string; status: string }[]>([]);
  useEffect(() => { loadContent<{ slug: string; title: string; status: string }[]>("campaigns").then(setList).catch(() => {}); }, []);
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="a-input">
      <option value="">Featured campaign (automatic)</option>
      {list.map((c) => <option key={c.slug} value={c.slug}>{c.title}{c.status !== "live" ? ` (${c.status})` : ""}</option>)}
    </select>
  );
}

export function FieldInput({ field: f, value, onChange, item }: { field: Field; value: unknown; onChange: (v: unknown) => void; item?: V }) {
  const str = (value ?? "") as string;
  switch (f.type) {
    case "textarea":
    case "rich":
      return <textarea value={str} onChange={(e) => onChange(e.target.value)} rows={f.type === "rich" ? 2 : 4} placeholder={f.placeholder} className="a-input resize-y leading-relaxed" />;
    case "number":
      return <input type="number" value={value === undefined || value === null ? "" : String(value)} min={f.min} step={f.step ?? 1} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className="a-input" />;
    case "date":
    case "time":
    case "email":
      return <input type={f.type} value={str} onChange={(e) => onChange(e.target.value)} className="a-input" />;
    case "select":
      return (
        <select value={str} onChange={(e) => onChange(e.target.value)} className="a-input">
          {!f.options?.some((o) => o.value === str) && <option value={str}>{str || "Choose…"}</option>}
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case "toggle":
      return (
        <button type="button" role="switch" aria-checked={Boolean(value)} onClick={() => onChange(!value)} className="group inline-flex items-center gap-3 text-left">
          <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? "bg-[#c8601e]" : "bg-[#ddd0bb]"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
          </span>
          <span className="text-[0.86rem] text-ink">{value ? "On" : "Off"}</span>
        </button>
      );
    case "slug":
      return (
        <div className="flex gap-2">
          <input value={str} onChange={(e) => onChange(slugify(e.target.value))} placeholder={slugify(String(item?.[f.from ?? "title"] ?? "")) || "auto"} className="a-input font-mono text-[0.82rem]" />
          {f.from && <button type="button" onClick={() => onChange(slugify(String(item?.[f.from!] ?? "")))} className="a-btn shrink-0">From title</button>}
        </div>
      );
    case "icon":
      return <IconField value={str} onChange={onChange} />;
    case "image":
    case "video":
      return <ImageField value={str} onChange={onChange} accept={f.type} />;
    case "campaign":
      return <CampaignField value={str} onChange={onChange} />;
    case "link": {
      const l = (value ?? {}) as { label?: string; href?: string };
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={l.label ?? ""} onChange={(e) => onChange({ ...l, label: e.target.value })} placeholder="Button text" className="a-input" />
          <input value={l.href ?? ""} onChange={(e) => onChange({ ...l, href: e.target.value })} placeholder="/page or https://…" className="a-input font-mono text-[0.82rem]" />
        </div>
      );
    }
    case "list":
    case "paragraphs": {
      const arr = (Array.isArray(value) ? value : []) as string[];
      const big = f.type === "paragraphs";
      return (
        <div className="space-y-2">
          {arr.map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              {big ? (
                <textarea value={t} rows={3} onChange={(e) => onChange(arr.map((x, j) => (j === i ? e.target.value : x)))} className="a-input resize-y leading-relaxed" />
              ) : (
                <input value={t} onChange={(e) => onChange(arr.map((x, j) => (j === i ? e.target.value : x)))} className="a-input" />
              )}
              <Move i={i} n={arr.length} onMove={(to) => onChange(move(arr, i, to))} onRemove={() => onChange(arr.filter((_, j) => j !== i))} />
            </div>
          ))}
          <button type="button" onClick={() => onChange([...arr, ""])} className="a-btn a-btn-ghost">+ Add {f.itemLabel ?? "item"}</button>
        </div>
      );
    }
    case "repeater": {
      const arr = (Array.isArray(value) ? value : []) as V[];
      return (
        <div className="space-y-3">
          {arr.map((row, i) => (
            <div key={i} className="rounded-2xl border border-[#efe5d6] bg-[#fcf8f1] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="truncate text-[0.8rem] font-semibold text-ink">
                  {i + 1}. {String((f.titleKey && row[f.titleKey]) || (f.itemLabel ?? "Item"))}
                </p>
                <Move i={i} n={arr.length} onMove={(to) => onChange(move(arr, i, to))} onRemove={() => onChange(arr.filter((_, j) => j !== i))} />
              </div>
              <Form fields={f.fields ?? []} value={row} onChange={(r) => onChange(arr.map((x, j) => (j === i ? r : x)))} compact />
            </div>
          ))}
          <button type="button" onClick={() => onChange([...arr, {}])} className="a-btn a-btn-ghost">+ Add {f.itemLabel ?? "item"}</button>
        </div>
      );
    }
    default:
      return <input type="text" value={str} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className={`a-input ${f.type === "url" ? "font-mono text-[0.82rem]" : ""}`} />;
  }
}

/** Renders a schema as a two-column form. */
export function Form({ fields, value, onChange, compact }: { fields: Field[]; value: V; onChange: (v: V) => void; compact?: boolean }) {
  return (
    <div className={`grid gap-x-5 ${compact ? "gap-y-3 sm:grid-cols-3" : "gap-y-5 sm:grid-cols-2"}`}>
      {fields.map((f) => {
        const wide = f.wide || ["repeater", "paragraphs", "list", "image", "video"].includes(f.type);
        // plain inputs get a <label>; composite controls must not, or a click anywhere would press their first button
        const Wrap = ["text", "textarea", "rich", "number", "date", "time", "email", "url", "select", "slug"].includes(f.type) ? "label" : "div";
        return (
          <Wrap key={f.key} className={`block ${wide ? (compact ? "sm:col-span-3" : "sm:col-span-2") : ""}`}>
            <span className="a-label">{f.label}{f.required && <span className="text-saffron"> *</span>}</span>
            <span className="mt-1.5 block">
              <FieldInput field={f} value={getPath(value, f.key)} item={value} onChange={(v) => onChange(setPath(value, f.key, v))} />
            </span>
            {f.help && <span className="mt-1.5 block text-[0.74rem] leading-snug text-ink-soft">{f.help}</span>}
          </Wrap>
        );
      })}
    </div>
  );
}
