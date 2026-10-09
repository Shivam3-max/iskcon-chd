// Typed loaders for admin-editable content. Server only.
import "server-only";
import { readContent } from "./store";
import { SITE } from "./site";
import { SCHEDULE, type Slot } from "./schedule";
import type { Figure } from "@/components/illustrations/types";

export type Icon = Figure | string; // a built-in illustration name, or an uploaded image URL

export interface Settings {
  name: string;
  temple: string;
  deities: string;
  url: string;
  address: string[];
  phone: string;
  phoneHref: string;
  email: string;
  whatsapp: Record<string, { label: string; number: string; href: string }>;
  social: Record<string, string>;
  maps: string;
  mapsEmbed: string;
  since: number;
  seoTitle: string;
  seoDescription: string;
  donateNote: string;
  announcement: { enabled: boolean; text: string; href: string };
}

export interface Program {
  slug: string;
  title: string;
  tagline: string;
  when: string;
  figure: Icon;
  intro: string;
  body: string[];
  points: string[];
  cta: { label: string; href: string };
}

export interface FestivalStory {
  slug: string;
  title: string;
  sanskrit?: string;
  figure: Icon;
  lede: string;
  story: string[];
  atTemple: string[];
  observe: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  figure: Icon;
  excerpt: string;
  body: string[];
  cover?: string;
  status: "draft" | "published";
}

export interface CustomEvent {
  id: string;
  date: string;
  title: string;
  kind: "festival" | "ekadashi" | "appearance" | "disappearance" | "observance";
  note?: string;
  fast?: string;
  href?: string;
  major?: boolean;
  hide?: boolean; // hides a computed event with the same date + title instead of adding one
}

export interface PageHeader {
  eyebrow: string;
  title: string;
  lede: string;
  icon: Icon;
}

export const getSettings = () => readContent<Settings>("settings", { ...SITE, seoTitle: SITE.name, seoDescription: "", donateNote: "", announcement: { enabled: false, text: "", href: "" } } as Settings);
export const getSchedule = () => readContent<Slot[]>("schedule", SCHEDULE);
export const getPrograms = () => readContent<Program[]>("programs", []);
export const getProgram = (slug: string) => getPrograms().find((p) => p.slug === slug);
export const getFestivals = () => readContent<FestivalStory[]>("festivals", []);
export const getFestival = (slug: string) => getFestivals().find((f) => f.slug === slug);
export const getPosts = (opts: { drafts?: boolean } = {}) =>
  readContent<Post[]>("posts", [])
    .filter((p) => opts.drafts || p.status !== "draft")
    .sort((a, b) => b.date.localeCompare(a.date));
export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);
export const getCustomEvents = () => readContent<CustomEvent[]>("calendar-events", []);
export const getPageHeader = (id: string) => readContent<Record<string, PageHeader>>("pages", {})[id];
export function getHome<T = Record<string, unknown>>() {
  return readContent<{ order: string[]; sections: Record<string, T & { visible: boolean }> }>("home", { order: [], sections: {} });
}
export const getTestimonials = () => readContent<{ name: string; source: string; text: string; sample?: boolean }[]>("testimonials", []);
