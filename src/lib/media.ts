// Media manifest: every photo and video on the site is a named slot in
// content/media.json, so the admin can swap them without touching code.
import "server-only";
import { readFileSync } from "fs";
import path from "path";

export type Tone = "altar" | "saffron" | "dusk" | "night" | "gold" | "rose" | "garden" | "marble";

export interface MediaItem {
  type: "image" | "video";
  src: string;
  poster?: string;
  youtube?: string;
  alt: string;
  label: string;
  tone: Tone;
  duration?: string;
  span?: "tall" | "wide";
}

interface Manifest {
  slots: Record<string, MediaItem>;
  gallery: MediaItem[];
}

function load(): Manifest {
  try {
    return JSON.parse(readFileSync(path.join(process.cwd(), "content/media.json"), "utf8"));
  } catch {
    return { slots: {}, gallery: [] };
  }
}

export function getSlot(id: string): MediaItem {
  return load().slots[id] ?? { type: "image", src: "", alt: id, label: id.split(".").pop() ?? id, tone: "marble" };
}

export function getGallery() {
  return load().gallery;
}
