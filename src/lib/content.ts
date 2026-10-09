// Content repository. Campaigns, sevas and donations live in /content as JSON so
// the admin (stage 2) can create and edit them; every page reads through here.
import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { READ_ONLY } from "./store";

const DIR = path.join(process.cwd(), "content");

/** A built-in illustration name ("diya", "tulasi"…) or an uploaded image URL. */
export type Illustration = string;

export interface Campaign {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  story: string;
  goal: number;
  raised: number;
  donors: number;
  start: string;
  end: string;
  status: "draft" | "live" | "closed";
  featured: boolean;
  illustration: Illustration;
  image?: string;
  tiers: { amount: number; label: string }[];
  updates: { date: string; text: string }[];
}

export interface Seva {
  slug: string;
  title: string;
  detail: string;
  amount: number;
  unit: string;
  illustration: Illustration;
}

export interface Donation {
  id: string;
  createdAt: string;
  target: string; // campaign or seva slug
  targetTitle: string;
  amount: number;
  name: string;
  email: string;
  phone: string;
  pan?: string;
  address?: string;
  dedication?: string;
  wants80G: boolean;
  status: "pending" | "paid" | "failed" | "refunded";
  method?: "online" | "cash" | "cheque" | "upi" | "bank";
  note?: string;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DIR, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function getCampaigns(opts: { includeDrafts?: boolean } = {}) {
  const all = await readJson<Campaign[]>("campaigns.json", []);
  return opts.includeDrafts ? all : all.filter((c) => c.status !== "draft");
}

export async function getCampaign(slug: string) {
  return (await getCampaigns()).find((c) => c.slug === slug);
}

export async function getFeaturedCampaign() {
  const live = (await getCampaigns()).filter((c) => c.status === "live");
  return live.find((c) => c.featured) ?? live[0];
}

export async function getSevas() {
  return readJson<Seva[]>("sevas.json", []);
}

export async function getSeva(slug: string) {
  return (await getSevas()).find((s) => s.slug === slug);
}

export async function recordDonation(d: Omit<Donation, "id" | "createdAt" | "status">) {
  const list = await readJson<Donation[]>("donations.json", []);
  const donation: Donation = {
    ...d,
    id: `ISK-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  list.push(donation);
  if (READ_ONLY) return donation; // no database yet: the donor still reaches the thank-you page
  try {
    await fs.writeFile(path.join(DIR, "donations.json"), JSON.stringify(list, null, 2));
  } catch {
    // read-only host (Vercel, before the database is connected): the donor still reaches the thank-you page
  }
  return donation;
}

export async function getDonation(id: string) {
  return (await readJson<Donation[]>("donations.json", [])).find((d) => d.id === id);
}

export { inr, daysLeft } from "./format";
