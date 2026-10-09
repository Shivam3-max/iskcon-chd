import { requireApi } from "@/lib/admin/auth";
import { deleteUpload, listUploads, saveUpload } from "@/lib/admin/uploads";

export async function GET() {
  const u = await requireApi();
  if (u instanceof Response) return u;
  return Response.json({ data: listUploads() });
}

export async function POST(req: Request) {
  const u = await requireApi();
  if (u instanceof Response) return u;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.size) return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  try {
    return Response.json({ data: await saveUpload(file, u.email) });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const u = await requireApi();
  if (u instanceof Response) return u;
  const { url } = await req.json().catch(() => ({}));
  if (typeof url !== "string") return Response.json({ error: "Missing file." }, { status: 400 });
  try {
    deleteUpload(url, u.email);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 503 });
  }
  return Response.json({ ok: true });
}
