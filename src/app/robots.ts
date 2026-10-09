import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  const SITE = getSettings();
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/donate/thank-you"] }], sitemap: `${SITE.url}/sitemap.xml` };
}
