"use client";
import { useState } from "react";

const TOPICS = [
  ["visit", "Visiting the temple"], ["courses", "Courses & classes"], ["youth", "Youth Forum"], ["kids", "Kids & summer camp"],
  ["volunteer", "Volunteering"], ["seminar", "Seminar invitation"], ["seva", "Donations & seva"], ["other", "Something else"],
];

export default function ContactForm({ initialTopic, contactEmail = "iskconchandigarh@gmail.com" }: { initialTopic?: string; contactEmail?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [mailto, setMailto] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("busy");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.stored === false) {
      // the site can't store messages yet: hand it over to the visitor's email app, already written
      const text = `${body.message}\n\n${body.name}${body.phone ? ` · ${body.phone}` : ""} · ${body.email}`;
      setMailto(`mailto:${contactEmail}?subject=${encodeURIComponent(`Website enquiry: ${body.topic}`)}&body=${encodeURIComponent(text)}`);
    }
    setState(res.ok ? "done" : "error");
  }

  if (state === "done") {
    return (
      <div className="rounded-[18px] border border-line bg-paper p-10 text-center">
        <p className="font-serif text-3xl text-ink">Hare Krishna! Thank you.</p>
        {mailto ? (
          <>
            <p className="mt-2 text-ink-soft">One last step: press the button to send your message from your email app. It&rsquo;s already written for you.</p>
            <a href={mailto} className="btn btn-primary mt-6">Send by email</a>
          </>
        ) : (
          <p className="mt-2 text-ink-soft">Your message has reached the temple office. A devotee will reply within two days.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[18px] border border-line bg-paper p-6 md:p-8">
      <label className="text-sm text-ink-soft">
        What is it about?
        <select name="topic" defaultValue={initialTopic ?? "visit"} className="field mt-1">
          {TOPICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className="field" autoComplete="name" />
        <input name="phone" placeholder="Mobile (optional)" className="field" autoComplete="tel" inputMode="tel" />
      </div>
      <input name="email" type="email" required placeholder="Email" className="field" autoComplete="email" />
      <textarea name="message" required rows={6} placeholder="Your message" className="field" />
      {state === "error" && <p className="text-sm text-maroon">Something went wrong. Please try again, or call the temple office.</p>}
      <button disabled={state === "busy"} className="btn btn-primary justify-self-start disabled:opacity-60">{state === "busy" ? "Sending…" : "Send message"}</button>
    </form>
  );
}
