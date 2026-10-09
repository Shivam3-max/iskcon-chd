import { requireApi } from "@/lib/admin/auth";
import { ReadOnlyError, readContent, writeContent } from "@/lib/store";

interface Enquiry { id: string; status: string; [k: string]: unknown }

export async function PATCH(req: Request) {
  try {
    return await _PATCH(req);
  } catch (e) {
    if (e instanceof ReadOnlyError) return Response.json({ error: e.message }, { status: 503 });
    throw e;
  }
}

async function _PATCH(req: Request) {
  const u = await requireApi();
  if (u instanceof Response) return u;
  const { id, status, remove } = await req.json().catch(() => ({}));
  const list = readContent<Enquiry[]>("enquiries", []);
  if (remove) {
    writeContent("enquiries", list.filter((e) => e.id !== id), { user: u.email, action: "delete-enquiry", target: `enquiries/${id}` });
    return Response.json({ ok: true });
  }
  if (!["new", "read", "replied", "archived"].includes(status)) return Response.json({ error: "Unknown status." }, { status: 400 });
  const e = list.find((x) => x.id === id);
  if (!e) return Response.json({ error: "Not found." }, { status: 404 });
  e.status = status;
  writeContent("enquiries", list, { user: u.email, action: "enquiry-status", target: `enquiries/${id}`, summary: status });
  return Response.json({ ok: true });
}
