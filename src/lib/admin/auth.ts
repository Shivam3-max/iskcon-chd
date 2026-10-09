// Admin authentication: scrypt-hashed users in content/admin/users.json and an
// HMAC-signed, httpOnly session cookie. Roles: "super" (everything, incl. users
// and settings) and "editor" (content, media, campaigns, blog, calendar).
import "server-only";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { READ_ONLY, readContent, writeContent } from "../store";

export type Role = "super" | "editor";
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  hash: string;
  salt: string;
  createdAt: string;
  lastLogin?: string;
}
export type PublicUser = Omit<AdminUser, "hash" | "salt">;

const COOKIE = "isk_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // a week

function secret() {
  const s = process.env.ADMIN_SECRET;
  return s && s.length >= 32 ? s : null;
}

const hashPassword = (pw: string, salt = randomBytes(16).toString("hex")) => ({ salt, hash: scryptSync(pw, salt, 64).toString("hex") });
function verifyPassword(pw: string, u: AdminUser) {
  const a = Buffer.from(scryptSync(pw, u.salt, 64).toString("hex"));
  const b = Buffer.from(u.hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const readUsers = () => readContent<AdminUser[]>("admin/users", []);
export const listUsersOrBootstrap = () => (readUsers().length ? readUsers() : bootstrap());
const strip = ({ hash: _h, salt: _s, ...u }: AdminUser): PublicUser => u; // eslint-disable-line @typescript-eslint/no-unused-vars
export const listUsers = () => listUsersOrBootstrap().map(strip);

/** First run: create the super admin from ADMIN_EMAIL / ADMIN_PASSWORD. */
function bootstrap() {
  const users = readUsers();
  if (users.length) return users;
  const email = process.env.ADMIN_EMAIL;
  const pw = process.env.ADMIN_PASSWORD;
  if (!email || !pw) return users;
  // a stable id derived from the email, so sessions survive restarts even when nothing can be written
  const id = createHmac("sha256", "isk-admin").update(email.toLowerCase()).digest("hex").slice(0, 32);
  const u: AdminUser = { id, name: "Super Admin", email: email.toLowerCase(), role: "super", ...hashPassword(pw), createdAt: new Date().toISOString() };
  if (READ_ONLY) return [u];
  writeContent("admin/users", [u], { user: "system", action: "create-user", summary: "Bootstrapped super admin" });
  return [u];
}

// --- brute-force throttle (per email, in memory) ---
const attempts = new Map<string, { n: number; until: number }>();

export async function login(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = email.toLowerCase().trim();
  const sec = secret();
  if (!sec) return { ok: false, error: "The admin isn't configured yet. Set ADMIN_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD." };
  const a = attempts.get(key);
  if (a && a.until > Date.now()) return { ok: false, error: "Too many attempts. Please wait a few minutes." };
  const user = bootstrap().find((u) => u.email === key);
  if (!user || !verifyPassword(password, user)) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(key, { n, until: n >= 5 ? Date.now() + 5 * 60_000 : 0 });
    return { ok: false, error: "That email and password don't match." };
  }
  attempts.delete(key);
  if (!READ_ONLY) {
    const users = readUsers().map((u) => (u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u));
    writeContent("admin/users", users);
  }
  const payload = Buffer.from(JSON.stringify({ uid: user.id, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  const sig = createHmac("sha256", sec).update(payload).digest("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sig}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<PublicUser | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const sec = secret();
  if (!sec) return null;
  const [payload, sig] = raw.split(".");
  const expect = createHmac("sha256", sec).update(payload ?? "").digest("base64url");
  if (!sig || sig.length !== expect.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (exp < Date.now()) return null;
    const u = (readUsers().length ? readUsers() : bootstrap()).find((x) => x.id === uid);
    return u ? strip(u) : null;
  } catch {
    return null;
  }
}

/** For admin pages: redirect to login when signed out. */
export async function requirePage(role?: Role) {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (role === "super" && u.role !== "super") redirect("/admin?denied=1");
  return u;
}

/** For admin API routes: returns the user, or a 401/403 Response to send back. */
export async function requireApi(role?: Role): Promise<PublicUser | Response> {
  const u = await currentUser();
  if (!u) return Response.json({ error: "Please sign in again." }, { status: 401 });
  if (role === "super" && u.role !== "super") return Response.json({ error: "Only a super admin can do that." }, { status: 403 });
  return u;
}

export function saveUser(input: { id?: string; name: string; email: string; role: Role; password?: string }, by: string) {
  if (READ_ONLY) throw new Error("Adding or editing users needs the database. For now, change the admin login with the ADMIN_EMAIL and ADMIN_PASSWORD settings on Vercel.");
  const users = readUsers();
  const email = input.email.toLowerCase().trim();
  if (users.some((u) => u.email === email && u.id !== input.id)) throw new Error("Someone already uses that email.");
  if (input.id) {
    const i = users.findIndex((u) => u.id === input.id);
    if (i < 0) throw new Error("User not found.");
    const supers = users.filter((u) => u.role === "super");
    if (users[i].role === "super" && input.role !== "super" && supers.length === 1) throw new Error("Keep at least one super admin.");
    users[i] = { ...users[i], name: input.name, email, role: input.role, ...(input.password ? hashPassword(input.password) : {}) };
  } else {
    if (!input.password || input.password.length < 8) throw new Error("Use a password of at least 8 characters.");
    users.push({ id: randomUUID(), name: input.name, email, role: input.role, ...hashPassword(input.password), createdAt: new Date().toISOString() });
  }
  writeContent("admin/users", users, { user: by, action: input.id ? "update-user" : "create-user", summary: email });
}

export function deleteUser(id: string, by: string) {
  if (READ_ONLY) throw new Error("Removing users needs the database.");
  const users = readUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return;
  if (target.role === "super" && users.filter((u) => u.role === "super").length === 1) throw new Error("Keep at least one super admin.");
  writeContent("admin/users", users.filter((u) => u.id !== id), { user: by, action: "delete-user", summary: target.email });
}
