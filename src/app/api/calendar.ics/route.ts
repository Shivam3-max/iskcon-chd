// iCalendar feed: subscribe once and the phone keeps itself up to date.
import { addDays, buildCalendar, todayKey } from "@/lib/vaishnava/engine";

export const revalidate = 86400;

const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
const compact = (d: string) => d.replace(/-/g, "");

export function GET() {
  const from = addDays(todayKey(), -30);
  const to = addDays(from, 430);
  const cal = buildCalendar(from, to);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ISKCON Chandigarh//Vaishnava Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Vaishnava Calendar · ISKCON Chandigarh",
    "X-WR-TIMEZONE:Asia/Kolkata",
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    "X-PUBLISHED-TTL:P1D",
  ];
  for (const d of cal) {
    for (const e of d.events) {
      const title = e.parana ? `Parana ${e.parana.from}–${e.parana.to}` : e.title;
      const desc = [e.fast, e.note, `${d.tithiName}, ${d.masa} masa`].filter(Boolean).join("\n");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${compact(d.date)}-${title.replace(/[^a-z0-9]/gi, "").slice(0, 40)}@iskconchandigarh.com`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${compact(d.date)}`,
        `DTEND;VALUE=DATE:${compact(addDays(d.date, 1))}`,
        `SUMMARY:${esc(title)}`,
        `DESCRIPTION:${esc(desc)}`,
        "TRANSP:TRANSPARENT",
        "END:VEVENT",
      );
    }
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="iskcon-chandigarh-vaishnava.ics"',
    },
  });
}
