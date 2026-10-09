// Tiny client for the admin API: JSON in, JSON out, readable errors.
export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.json !== undefined ? { "Content-Type": "application/json", ...init?.headers } : init?.headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && typeof window !== "undefined") window.location.href = "/admin/login";
  if (!res.ok) throw new Error(data.error ?? `Something went wrong (${res.status}).`);
  return data as T;
}

export const loadContent = <T,>(name: string) => api<{ data: T }>(`/api/admin/content/${name}`).then((r) => r.data);
export const saveContent = <T,>(name: string, data: T, summary?: string) =>
  api<{ data: T }>(`/api/admin/content/${name}`, { method: "PUT", json: { data, summary } }).then((r) => r.data);

export async function upload(file: File) {
  const form = new FormData();
  form.append("file", file);
  return api<{ data: { url: string; kind: string; width?: number; height?: number } }>("/api/admin/upload", { method: "POST", body: form }).then((r) => r.data);
}

/** Read / write a dotted path ("social.youtube") without mutating. */
export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}
export function setPath<T>(obj: T, path: string, value: unknown): T {
  const [k, ...rest] = path.split(".");
  const base = (obj && typeof obj === "object" ? obj : {}) as Record<string, unknown>;
  return { ...base, [k]: rest.length ? setPath(base[k], rest.join("."), value) : value } as T;
}
