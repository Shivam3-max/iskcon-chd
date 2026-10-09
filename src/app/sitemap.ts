import type { MetadataRoute } from "next";
import { getFestivals, getPosts, getPrograms } from "@/lib/data";
import { getCampaigns, getSevas } from "@/lib/content";
import { getSettings } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE = getSettings();
  const fixed = ["", "/about", "/srila-prabhupada", "/visit", "/live", "/calendar", "/calendar/ekadashi", "/festivals", "/programs", "/donate", "/japa", "/blog", "/contact"];
  const urls = [
    ...fixed,
    ...getFestivals().map((f) => `/festivals/${f.slug}`),
    ...getPrograms().map((p) => `/programs/${p.slug}`),
    ...getPosts().map((p) => `/blog/${p.slug}`),
    ...(await getCampaigns()).map((c) => `/donate/${c.slug}`),
    ...(await getSevas()).map((s) => `/donate/seva/${s.slug}`),
  ];
  return urls.map((u) => ({ url: `${SITE.url}${u}`, changeFrequency: u.startsWith("/calendar") ? "daily" : "weekly" }));
}
