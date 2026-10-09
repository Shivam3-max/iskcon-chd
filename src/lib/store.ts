// Content store. Every editable thing on the site lives in /content/*.json.
// Writes are atomic (temp file + rename), audited, and invalidate the page cache
// so a save in the admin shows up on the live site on the next request.
//
// To move to a database later, re-implement readContent/writeContent only.
import "server-only";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import path from "path";

export const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Vercel (and any serverless host) has a read-only filesystem. Until a database
 * is connected, the site runs in read-only mode: everything reads from the
 * committed /content files, and anything that would save throws ReadOnlyError.
 * Set CONTENT_WRITABLE=1 on a normal server with a persistent disk to allow saving.
 */
export const READ_ONLY = process.env.CONTENT_WRITABLE !== "1" && (process.env.VERCEL === "1" || process.env.CONTENT_READONLY === "1");
export class ReadOnlyError extends Error {
  constructor() {
    super("Saving is switched off on this live preview until the database is connected. Your changes were not saved.");
  }
}
const ADMIN_DIR = path.join(CONTENT_DIR, "admin");

function file(name: string) {
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)?$/.test(name)) throw new Error(`Bad content name: ${name}`);
  return path.join(CONTENT_DIR, `${name}.json`);
}

export function readContent<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(file(name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export interface AuditEntry {
  at: string;
  user: string;
  action: string;
  target: string;
  summary?: string;
}

export function writeContent(name: string, data: unknown, audit?: Omit<AuditEntry, "at" | "target"> & { target?: string }) {
  if (READ_ONLY) throw new ReadOnlyError();
  const f = file(name);
  mkdirSync(path.dirname(f), { recursive: true });
  const tmp = `${f}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, f);
  if (audit) logAudit({ ...audit, target: audit.target ?? name });
}

export function logAudit(e: Omit<AuditEntry, "at">) {
  if (READ_ONLY) return;
  mkdirSync(ADMIN_DIR, { recursive: true });
  const f = path.join(ADMIN_DIR, "audit.json");
  const list: AuditEntry[] = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : [];
  list.unshift({ at: new Date().toISOString(), ...e });
  writeFileSync(f, JSON.stringify(list.slice(0, 1000), null, 2));
}

export function readAudit(): AuditEntry[] {
  return readContent<AuditEntry[]>("admin/audit", []);
}
