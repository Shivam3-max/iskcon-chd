"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { api, upload } from "./api";
import Glyph from "../ui/Glyph";
import { BUILTIN_ICONS } from "@/lib/admin/schema";

export interface Upload { url: string; name: string; kind: "image" | "video" | "icon"; size: number; width?: number; height?: number; uploadedAt: string }

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#1a0d08]/55 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`a-card flex max-h-[88vh] w-full flex-col overflow-hidden ${wide ? "max-w-5xl" : "max-w-xl"}`} role="dialog" aria-label={title}>
        <div className="flex items-center justify-between border-b border-[#efe5d6] px-6 py-4">
          <h3 className="font-serif text-xl text-ink">{title}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-ink-soft hover:bg-[#f6efe4]" aria-label="Close">✕</button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

const fmtSize = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`);

/** Upload a new file or choose one already in the library. */
export function MediaPicker({ accept, onPick, onClose }: { accept: "image" | "video" | "icon"; onPick: (url: string, u?: Upload) => void; onClose: () => void }) {
  const [lib, setLib] = useState<Upload[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ data: Upload[] }>("/api/admin/upload").then((r) => setLib(r.data)).catch((e) => setErr(e.message));
  }, []);

  const send = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr("");
    try {
      const u = (await upload(files[0])) as Upload;
      onPick(u.url, u);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [onPick]);

  const mime = accept === "video" ? "video/mp4,video/webm,video/quicktime" : accept === "icon" ? "image/svg+xml,image/png,image/webp" : "image/jpeg,image/png,image/webp,image/avif,image/gif";
  const items = (lib ?? []).filter((u) => (accept === "icon" ? u.kind === "icon" || u.kind === "image" : u.kind === accept));

  return (
    <Modal title={accept === "video" ? "Choose a video" : accept === "icon" ? "Upload or choose an icon" : "Choose an image"} onClose={onClose} wide>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); send(e.dataTransfer.files); }}
        className={`grid place-items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${drag ? "border-saffron bg-[#fff4e4]" : "border-[#e6d8c3] bg-[#fcf8f1]"}`}
      >
        <p className="font-serif text-lg text-ink">{busy ? "Uploading…" : "Drop a file here"}</p>
        <p className="mt-1 text-[0.82rem] text-ink-soft">
          {accept === "video"
            ? "MP4 (H.264) works everywhere. Keep background loops 10–20 s, 1920×1080, under 15 MB, with no sound."
            : accept === "icon"
            ? "SVG or transparent PNG, square, at least 256×256."
            : "JPG, PNG or WebP. Images are optimised automatically (WebP, max 2400 px wide)."}
        </p>
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="a-btn a-btn-primary mt-5">Choose from computer</button>
        <input ref={input} type="file" accept={mime} hidden onChange={(e) => send(e.target.files)} />
      </div>
      {err && <p className="mt-4 rounded-xl bg-[#fdecea] px-4 py-3 text-sm text-[#9b2c2c]">{err}</p>}
      <p className="a-label mt-8">Library</p>
      {lib === null ? (
        <p className="mt-3 text-sm text-ink-soft">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nothing uploaded yet.</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {items.map((u) => (
            <button key={u.url} type="button" onClick={() => onPick(u.url, u)} className="group overflow-hidden rounded-xl border border-[#efe5d6] bg-white text-left hover:border-saffron">
              <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-[#f6efe4]">
                {u.kind === "video" ? (
                  <video src={u.url} muted preload="metadata" className="h-full w-full object-cover" />
                ) : (
                  <img src={u.url} alt="" className={`h-full w-full ${u.kind === "icon" ? "object-contain p-4" : "object-cover"} transition-transform group-hover:scale-105`} />
                )}
              </div>
              <p className="truncate px-2.5 pt-2 text-[0.75rem] text-ink">{u.name}</p>
              <p className="px-2.5 pb-2 text-[0.68rem] text-ink-soft">{fmtSize(u.size)}{u.width ? ` · ${u.width}×${u.height}` : ""}</p>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

/** Built-in hand-drawn illustrations, plus any uploaded icon. */
export function IconPicker({ value, onPick, onClose }: { value?: string; onPick: (v: string) => void; onClose: () => void }) {
  const [upload, setUpload] = useState(false);
  if (upload) return <MediaPicker accept="icon" onPick={(url) => onPick(url)} onClose={() => setUpload(false)} />;
  return (
    <Modal title="Choose an icon" onClose={onClose} wide>
      <p className="a-label">Temple illustrations</p>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {BUILTIN_ICONS.map((k) => (
          <button key={k} type="button" onClick={() => onPick(k)} className={`flex flex-col items-center rounded-2xl border p-3 transition-colors hover:border-saffron hover:bg-[#fff8ee] ${value === k ? "border-saffron bg-[#fff4e4] ring-2 ring-saffron/30" : "border-[#efe5d6] bg-white"}`}>
            <Glyph value={k} className="h-16 w-16" />
            <span className="mt-1.5 text-[0.7rem] capitalize text-ink-soft">{k.replace("-", " ")}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#fcf8f1] p-4">
        <p className="text-sm text-ink-soft">Want your own icon? Upload an SVG or transparent PNG.</p>
        <button type="button" onClick={() => setUpload(true)} className="a-btn">Upload icon</button>
      </div>
    </Modal>
  );
}
