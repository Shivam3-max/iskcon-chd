import { deleteUser, requireApi, saveUser } from "@/lib/admin/auth";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  // Anyone signed in may change their own name/password; everything else needs a super admin.
  const me = await requireApi();
  if (me instanceof Response) return me;
  const self = b.id && b.id === me.id;
  if (!self && me.role !== "super") return Response.json({ error: "Only a super admin can manage users." }, { status: 403 });
  try {
    saveUser({ id: b.id || undefined, name: String(b.name ?? "").trim() || "Admin", email: String(b.email ?? ""), role: self && me.role !== "super" ? me.role : b.role === "super" ? "super" : "editor", password: b.password || undefined }, me.email);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const me = await requireApi("super");
  if (me instanceof Response) return me;
  const { id } = await req.json().catch(() => ({}));
  if (id === me.id) return Response.json({ error: "You can't delete your own account." }, { status: 400 });
  try {
    deleteUser(String(id), me.email);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
