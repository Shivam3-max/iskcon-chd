// Stores contact enquiries in content/enquiries.json for the admin inbox (stage 2).
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { READ_ONLY } from "@/lib/store";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? "").trim();
  const email = String(b?.email ?? "").trim();
  const message = String(b?.message ?? "").trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 2) {
    return NextResponse.json({ error: "Please fill in your name, email and message." }, { status: 400 });
  }
  const file = path.join(process.cwd(), "content/enquiries.json");
  const list = JSON.parse(await fs.readFile(file, "utf8").catch(() => "[]"));
  list.push({
    id: `ENQ-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    topic: String(b.topic ?? "other").slice(0, 30),
    name: name.slice(0, 120),
    email: email.slice(0, 160),
    phone: String(b.phone ?? "").slice(0, 20),
    message: message.slice(0, 4000),
    status: "new",
  });
  if (READ_ONLY) return NextResponse.json({ ok: true, stored: false });
  try {
    await fs.writeFile(file, JSON.stringify(list, null, 2));
  } catch {
    // read-only host: tell the form so it can hand the message over to email instead
    return NextResponse.json({ ok: true, stored: false });
  }
  return NextResponse.json({ ok: true, stored: true });
}
