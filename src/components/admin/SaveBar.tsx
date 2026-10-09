"use client";
import { useEffect, useState } from "react";

/** Sticky bar that appears when there are unsaved changes, plus a confirmation toast. */
export function SaveBar({ dirty, saving, onSave, onDiscard, error, savedAt, preview }: {
  dirty: boolean; saving: boolean; onSave: () => void; onDiscard: () => void; error?: string; savedAt?: number; preview?: string;
}) {
  const [toast, setToast] = useState(false);
  useEffect(() => {
    if (!savedAt) return;
    const show = setTimeout(() => setToast(true), 0);
    const hide = setTimeout(() => setToast(false), 3500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [savedAt]);
  // ⌘S / Ctrl+S saves
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); if (dirty && !saving) onSave(); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [dirty, saving, onSave]);
  // warn before leaving with unsaved work
  useEffect(() => {
    if (!dirty) return;
    const b = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", b);
    return () => window.removeEventListener("beforeunload", b);
  }, [dirty]);

  return (
    <>
      {(dirty || error) && (
        <div className="a-toast fixed bottom-5 left-1/2 z-50 flex w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#24120c] px-5 py-3 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)] lg:left-[calc(50%+130px)]">
          <span className={`h-2 w-2 shrink-0 rounded-full ${error ? "bg-[#ff8a80]" : "bg-[#f0b765]"}`} />
          <span className="flex-1 text-[0.86rem]">{error || "You have unsaved changes"}</span>
          <button type="button" onClick={onDiscard} disabled={saving} className="rounded-full px-3 py-1.5 text-[0.82rem] text-white/70 hover:text-white">Discard</button>
          <button type="button" onClick={onSave} disabled={saving || !dirty} className="a-btn a-btn-primary">{saving ? "Saving…" : "Save changes"}</button>
        </div>
      )}
      {toast && !dirty && (
        <div className="a-toast fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-[#1f4d2b] px-5 py-3 text-white shadow-xl lg:left-[calc(50%+130px)]">
          <span>✓ Saved. It&rsquo;s live on the website.</span>
          {preview && <a href={preview} target="_blank" rel="noreferrer" className="font-semibold underline underline-offset-4">View</a>}
        </div>
      )}
    </>
  );
}

/** Load-edit-save state for one content document. */
export function useDoc<T>(initial: T) {
  const [saved, setSaved] = useState(initial);
  const [doc, setDoc] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<number>();
  const dirty = JSON.stringify(doc) !== JSON.stringify(saved);
  async function save(fn: (d: T) => Promise<T>) {
    setSaving(true);
    setError("");
    try {
      const out = await fn(doc);
      setSaved(out);
      setDoc(out);
      setSavedAt(Date.now());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return { doc, setDoc: (d: T) => { setDoc(d); setError(""); }, saved, dirty, saving, error, savedAt, save, discard: () => { setDoc(saved); setError(""); } };
}
