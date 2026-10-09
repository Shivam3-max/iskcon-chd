"use client";
import { useState } from "react";
import { api } from "./api";
import { Modal } from "./MediaPicker";

interface Enquiry { id: string; createdAt: string; topic: string; name: string; email: string; phone: string; message: string; status: string }
const TOPIC: Record<string, string> = { visit: "Visit", courses: "Courses", youth: "Youth", kids: "Kids", volunteer: "Volunteering", seminar: "Seminar", seva: "Seva", other: "Other" };
const ST: Record<string, string> = { new: "bg-[#fff1df] text-[#a4501a]", read: "bg-[#f1ebe1] text-ink-soft", replied: "bg-[#e3f1df] text-[#2f6a2a]", archived: "bg-[#e8e4f3] text-[#4b3f80]" };

export function EnquiriesManager({ initial }: { initial: Enquiry[] }) {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState("open");
  const [open, setOpen] = useState<Enquiry | null>(null);
  const set = async (e: Enquiry, status: string) => {
    await api("/api/admin/enquiries", { method: "PATCH", json: { id: e.id, status } });
    setList((l) => l.map((x) => (x.id === e.id ? { ...x, status } : x)));
    setOpen((o) => (o?.id === e.id ? { ...o, status } : o));
  };
  const remove = async (e: Enquiry) => {
    if (!confirm("Delete this enquiry permanently?")) return;
    await api("/api/admin/enquiries", { method: "PATCH", json: { id: e.id, remove: true } });
    setList((l) => l.filter((x) => x.id !== e.id));
    setOpen(null);
  };
  const shown = list.filter((e) => (filter === "open" ? e.status !== "archived" : filter === "all" ? true : e.status === filter)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="a-card overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-[#f1e8da] p-4">
        {[["open", "Inbox"], ["new", "New"], ["replied", "Replied"], ["archived", "Archived"], ["all", "All"]].map(([v, l]) => (
          <button key={v} type="button" onClick={() => setFilter(v)} className={`rounded-full px-4 py-1.5 text-[0.82rem] font-semibold ${filter === v ? "bg-[#24120c] text-white" : "bg-[#f6efe4] text-ink-soft"}`}>{l}</button>
        ))}
      </div>
      <ul className="divide-y divide-[#f1e8da]">
        {shown.length === 0 && <li className="py-14 text-center text-ink-soft">No enquiries here.</li>}
        {shown.map((e) => (
          <li key={e.id}>
            <button type="button" onClick={() => { setOpen(e); if (e.status === "new") set(e, "read"); }} className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-[#fcf7ef]">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.status === "new" ? "bg-[#d9772b]" : "bg-transparent"}`} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2"><span className={`text-ink ${e.status === "new" ? "font-semibold" : ""}`}>{e.name}</span><span className="a-pill bg-[#f6efe4] text-ink-soft">{TOPIC[e.topic] ?? e.topic}</span></span>
                <span className="mt-0.5 block truncate text-[0.84rem] text-ink-soft">{e.message}</span>
              </span>
              <span className={`a-pill capitalize ${ST[e.status]}`}>{e.status}</span>
              <span className="w-24 text-right text-[0.76rem] text-ink-soft">{new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </button>
          </li>
        ))}
      </ul>
      {open && (
        <Modal title={`${open.name} · ${TOPIC[open.topic] ?? open.topic}`} onClose={() => setOpen(null)}>
          <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-ink">{open.message}</p>
          <p className="mt-5 text-[0.84rem] text-ink-soft">{open.email}{open.phone ? ` · ${open.phone}` : ""} · {new Date(open.createdAt).toLocaleString("en-IN")}</p>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-[#f1e8da] pt-5">
            <a href={`mailto:${open.email}?subject=${encodeURIComponent("Re: your message to ISKCON Chandigarh")}`} onClick={() => set(open, "replied")} className="a-btn a-btn-primary">Reply by email</a>
            {open.phone && <a href={`https://wa.me/${open.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}`} target="_blank" rel="noreferrer" onClick={() => set(open, "replied")} className="a-btn">WhatsApp</a>}
            <button type="button" onClick={() => set(open, "replied")} className="a-btn">Mark replied</button>
            <button type="button" onClick={() => set(open, "archived")} className="a-btn">Archive</button>
            <button type="button" onClick={() => remove(open)} className="a-btn a-btn-danger">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface User { id: string; name: string; email: string; role: "super" | "editor"; createdAt: string; lastLogin?: string }

export function UsersManager({ initial, me }: { initial: User[]; me: User }) {
  const [list, setList] = useState(initial);
  const [edit, setEdit] = useState<Partial<User> | null>(null);
  const [err, setErr] = useState("");
  const isSuper = me.role === "super";

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      await api("/api/admin/users", { method: "POST", json: { ...f, id: edit?.id } });
      window.location.reload();
    } catch (x) {
      setErr((x as Error).message);
    }
  }
  async function remove(u: User) {
    if (!confirm(`Remove ${u.email}'s access?`)) return;
    try {
      await api("/api/admin/users", { method: "DELETE", json: { id: u.id } });
      setList((l) => l.filter((x) => x.id !== u.id));
    } catch (x) {
      alert((x as Error).message);
    }
  }

  return (
    <div className="a-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#f1e8da] p-4">
        <p className="text-[0.84rem] text-ink-soft"><strong className="text-ink">Super admins</strong> can do everything, including users and settings. <strong className="text-ink">Editors</strong> manage content, media, campaigns, donations and the calendar.</p>
        {isSuper && <button type="button" onClick={() => setEdit({ role: "editor" })} className="a-btn a-btn-primary">+ Add person</button>}
      </div>
      <table className="a-table w-full">
        <thead><tr><th>Name</th><th>Role</th><th>Last sign-in</th><th /></tr></thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id}>
              <td><span className="font-medium text-ink">{u.name}{u.id === me.id && <span className="a-pill ml-2 bg-[#fff1df] text-[#a4501a]">You</span>}</span><span className="block text-[0.76rem] text-ink-soft">{u.email}</span></td>
              <td><span className={`a-pill ${u.role === "super" ? "bg-[#24120c] text-white" : "bg-[#f1ebe1] text-ink-soft"}`}>{u.role === "super" ? "Super admin" : "Editor"}</span></td>
              <td className="text-[0.8rem] text-ink-soft">{u.lastLogin ? new Date(u.lastLogin).toLocaleString("en-IN") : "Never"}</td>
              <td className="text-right">
                {(isSuper || u.id === me.id) && <button type="button" onClick={() => setEdit(u)} className="a-btn">Edit</button>}
                {isSuper && u.id !== me.id && <button type="button" onClick={() => remove(u)} className="a-btn a-btn-danger ml-2">Remove</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {edit && (
        <Modal title={edit.id ? `Edit ${edit.name}` : "Add a person"} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="grid gap-4">
            <label><span className="a-label">Name</span><input name="name" defaultValue={edit.name} required className="a-input mt-1.5" /></label>
            <label><span className="a-label">Email</span><input name="email" type="email" defaultValue={edit.email} required className="a-input mt-1.5" /></label>
            {isSuper && (
              <label><span className="a-label">Role</span>
                <select name="role" defaultValue={edit.role} className="a-input mt-1.5"><option value="editor">Editor</option><option value="super">Super admin</option></select>
              </label>
            )}
            <label><span className="a-label">{edit.id ? "New password (leave blank to keep)" : "Password (at least 8 characters)"}</span><input name="password" type="password" minLength={8} required={!edit.id} autoComplete="new-password" className="a-input mt-1.5" /></label>
            {err && <p className="rounded-xl bg-[#fdecea] px-4 py-3 text-sm text-[#9b2c2c]">{err}</p>}
            <button className="a-btn a-btn-primary">Save</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
