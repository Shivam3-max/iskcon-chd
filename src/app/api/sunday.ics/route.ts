// A weekly recurring calendar invite for the Sunday Love Feast.
import { getSunday } from "@/lib/sunday";
import { getSettings } from "@/lib/data";

export const revalidate = 86400;

export function GET() {
  const SITE = getSettings();
  const { info, date } = getSunday();
  const d = date.replace(/-/g, "");
  const t = (hhmm: string) => hhmm.replace(":", "") + "00";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const desc = info.program.map((p) => `${p.time} ${p.title}`).join("\\n");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ISKCON Chandigarh//Sunday Feast//EN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:sunday-love-feast@iskconchandigarh.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Asia/Kolkata:${d}T${t(info.start)}`,
    `DTEND;TZID=Asia/Kolkata:${d}T${t(info.end)}`,
    "RRULE:FREQ=WEEKLY;BYDAY=SU",
    `SUMMARY:${info.title} · ISKCON Chandigarh`,
    `LOCATION:${SITE.address.join(", ").replace(/,/g, "\\,")}`,
    `DESCRIPTION:${desc}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return new Response(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="sunday-love-feast.ics"' } });
}
