// Read / save any admin-editable content file. Every save revalidates the whole
// site so the change is live on the next page view.
import { revalidatePath } from "next/cache";
import { requireApi } from "@/lib/admin/auth";
import { resource } from "@/lib/admin/schema";
import { ReadOnlyError, readContent, writeContent } from "@/lib/store";

const EXTRA = new Set(["home", "media"]); // custom editors outside the schema registry

function allowed(name: string) {
  const r = resource(name);
  if (r) return { ok: true, role: r.role, kind: r.kind, key: r.key };
  if (EXTRA.has(name)) return { ok: true, role: undefined, kind: "singleton" as const, key: undefined };
  return { ok: false };
}

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 80);

function clean(name: string, data: unknown): { data?: unknown; error?: string } {
  const r = resource(name);
  if (!r) return { data };
  if (r.kind === "singleton") return typeof data === "object" && data && !Array.isArray(data) ? { data } : { error: "Expected an object." };
  if (!Array.isArray(data)) return { error: "Expected a list." };
  const items = data.map((x) => ({ ...(x as Record<string, unknown>) }));
  if (r.key === "slug") {
    const seen = new Set<string>();
    for (const it of items) {
      it.slug = slugify(String(it.slug || it.title || ""));
      if (!it.slug) return { error: `Every ${r.singular.toLowerCase()} needs a title.` };
      if (seen.has(it.slug as string)) return { error: `Two items use the address "${it.slug}". Make each one unique.` };
      seen.add(it.slug as string);
    }
  }
  if (r.key === "id") for (const it of items) if (!it.id) it.id = crypto.randomUUID().slice(0, 8);
  for (const f of r.fields ?? []) {
    if (!f.required) continue;
    const missing = items.find((it) => !String(it[f.key] ?? "").trim());
    if (missing) return { error: `"${f.label}" is required for every ${r.singular.toLowerCase()}.` };
  }
  // only one featured campaign: the most recently switched-on one wins (client sends it first)
  if (name === "campaigns") {
    let seen = false;
    for (const it of items) {
      if (it.featured && !seen) seen = true;
      else it.featured = false;
    }
  }
  return { data: items };
}

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const a = allowed(name);
  if (!a.ok) return Response.json({ error: "Unknown content." }, { status: 404 });
  const u = await requireApi(a.role);
  if (u instanceof Response) return u;
  return Response.json({ data: readContent(name, a.kind === "collection" ? [] : {}) });
}

export async function PUT(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const a = allowed(name);
  if (!a.ok) return Response.json({ error: "Unknown content." }, { status: 404 });
  const u = await requireApi(a.role);
  if (u instanceof Response) return u;
  const body = await req.json().catch(() => null);
  if (!body || !("data" in body)) return Response.json({ error: "Nothing to save." }, { status: 400 });
  const c = clean(name, body.data);
  if (c.error) return Response.json({ error: c.error }, { status: 400 });
  try {
    writeContent(name, c.data, { user: u.email, action: "save", summary: String(body.summary ?? "").slice(0, 160) || undefined });
  } catch (e) {
    return Response.json({ error: e instanceof ReadOnlyError ? e.message : "Couldn't save. Please try again." }, { status: e instanceof ReadOnlyError ? 503 : 500 });
  }
  revalidatePath("/", "layout");
  return Response.json({ ok: true, data: c.data });
}
