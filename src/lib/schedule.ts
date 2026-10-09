// Daily altar schedule (IST). `open` = altar doors open for darshan.
export interface Slot {
  start: string;
  end: string;
  title: string;
  detail: string;
  open: boolean;
  aarti?: boolean;
}

export const SCHEDULE: Slot[] = [
  { start: "04:30", end: "05:00", title: "Mangala Aarti", detail: "The first offering of the day, before dawn, with kirtan", open: true, aarti: true },
  { start: "05:00", end: "07:15", title: "Tulasi Puja & Japa", detail: "Circumambulation of Tulasi-devi, then chanting on beads", open: false },
  { start: "07:15", end: "08:00", title: "Shringar Darshan & Guru Puja", detail: "The Deities are seen in fresh dress; prayers to Srila Prabhupada", open: true, aarti: true },
  { start: "08:00", end: "08:30", title: "Srimad-Bhagavatam Class", detail: "A verse read and discussed in the temple hall", open: false },
  { start: "08:30", end: "11:30", title: "Morning Darshan", detail: "Altar open for darshan", open: true },
  { start: "11:30", end: "12:00", title: "Raj Bhoga Offering", detail: "The midday meal is offered; altar curtains closed", open: false },
  { start: "12:00", end: "12:30", title: "Raj Bhoga Aarti", detail: "Midday aarti, followed by prasadam", open: true, aarti: true },
  { start: "12:30", end: "16:15", title: "The Lord Rests", detail: "Temple hall open; altar closed", open: false },
  { start: "16:15", end: "18:30", title: "Dhoop Aarti & Darshan", detail: "Afternoon awakening and darshan", open: true, aarti: true },
  { start: "18:30", end: "19:00", title: "Sandhya Bhoga", detail: "Evening offering; altar curtains closed", open: false },
  { start: "19:00", end: "20:30", title: "Sandhya Aarti & Gita Class", detail: "Gaura Aarti with kirtan, then Bhagavad-gita", open: true, aarti: true },
  { start: "20:30", end: "04:30", title: "Shayana", detail: "The Deities retire for the night", open: false },
];

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function fmt12(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

/** Minutes since midnight in Chandigarh. */
export function istMinutes(now = Date.now()) {
  const d = new Date(now + 330 * 60_000);
  return d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
}

export function templeStatus(now = Date.now(), schedule: Slot[] = SCHEDULE) {
  const m = istMinutes(now);
  const idx = schedule.findIndex((s) => {
    const a = toMin(s.start);
    const b = toMin(s.end);
    return a < b ? m >= a && m < b : m >= a || m < b;
  });
  const current = schedule[idx] ?? schedule[schedule.length - 1];
  // next aarti
  let next: Slot | undefined;
  let minsToNext = Infinity;
  for (const s of schedule.filter((s) => s.aarti)) {
    let diff = toMin(s.start) - m;
    if (diff <= 0) diff += 1440;
    if (diff < minsToNext) { minsToNext = diff; next = s; }
  }
  return { current, next: next!, minsToNext: Math.round(minsToNext) };
}

export function humanMins(n: number) {
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const r = n % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
