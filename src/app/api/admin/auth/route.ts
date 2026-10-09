import { login, logout } from "@/lib/admin/auth";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const r = await login(String(b.email ?? ""), String(b.password ?? ""));
  return r.ok ? Response.json({ ok: true }) : Response.json({ error: r.error }, { status: 401 });
}

export async function DELETE() {
  await logout();
  return Response.json({ ok: true });
}
