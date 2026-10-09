// Gaudiya Vaishnava calendar engine for Chandigarh.
//
// Computes sunrise, tithi, lunar month and every observance astronomically, the
// way GCal does, so the calendar never needs a yearly data upload. Rules used:
//  · a day takes the tithi that prevails at local sunrise;
//  · a tithi that touches no sunrise (kshaya) is observed on the day it begins;
//  · lunar months are amanta and named by the sidereal sign of the sun at the
//    opening new moon; a month without a solar ingress is Adhika (Purushottama);
//  · Ekadashi is rejected if Dashami is present at arunodaya (96 min before
//    sunrise) and the fast moves to Dvadashi; Unmilani and Trisprsha
//    Mahadvadashi are detected.
import { Body, MoonPhase, Observer, SearchMoonPhase, SearchRiseSet, SunPosition } from "astronomy-engine";
import { readFileSync } from "fs";
import path from "path";
import {
  ADHIKA_EKADASHI, AMANTA_MONTHS, EKADASHI_NAMES, FESTIVAL_RULES, VAISHNAVA_MONTHS,
  tithiLabel, type EventKind,
} from "./festivals";

export const CHANDIGARH = { lat: 30.7333, lon: 76.7794, height: 350, tz: "Asia/Kolkata", offsetMin: 330 };
const observer = new Observer(CHANDIGARH.lat, CHANDIGARH.lon, CHANDIGARH.height);
const MIN = 60_000;
const DAY = 86_400_000;

export interface CalEvent {
  title: string;
  kind: EventKind;
  fast?: string;
  note?: string;
  slug?: string;
  major?: boolean;
  parana?: { from: string; to: string }; // HH:MM IST, on the day after an Ekadashi
  href?: string; // admin-added events can link anywhere
  custom?: boolean;
}

// ---------- admin overrides (content/calendar-events.json) ----------
interface Custom { date: string; title: string; kind: EventKind; note?: string; fast?: string; href?: string; major?: boolean; hide?: boolean }
function customEvents(): Custom[] {
  try {
    return JSON.parse(readFileSync(path.join(process.cwd(), "content/calendar-events.json"), "utf8"));
  } catch {
    return [];
  }
}
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");
function applyCustom(days: CalDay[]): CalDay[] {
  const list = customEvents();
  if (!list.length) return days;
  return days.map((d) => {
    const mine = list.filter((c) => c.date === d.date);
    if (!mine.length) return d;
    const hidden = mine.filter((c) => c.hide).map((c) => norm(c.title));
    const events = d.events.filter((e) => !hidden.some((h) => norm(e.title).includes(h)));
    for (const c of mine.filter((c) => !c.hide)) {
      events.push({ title: c.title, kind: c.kind, note: c.note, fast: c.fast, href: c.href, major: c.major, custom: true });
    }
    return { ...d, events };
  });
}

export interface CalDay {
  date: string; // YYYY-MM-DD (IST)
  weekday: number;
  sunrise: string;
  sunset: string;
  tithi: number;
  tithiName: string;
  paksha: "Gaura" | "Krishna";
  masa: string; // Vaishnava month name
  amanta: string;
  adhika: boolean;
  gaurabda: number;
  events: CalEvent[];
}

// ---------- time helpers ----------
const istMidnight = (key: string) => Date.parse(`${key}T00:00:00Z`) - CHANDIGARH.offsetMin * MIN;
export function istKey(ms: number) {
  return new Date(ms + CHANDIGARH.offsetMin * MIN).toISOString().slice(0, 10);
}
export function istTime(ms: number) {
  return new Date(ms + CHANDIGARH.offsetMin * MIN).toISOString().slice(11, 16);
}
const addDays = (key: string, n: number) => istKey(istMidnight(key) + n * DAY + 12 * 3600_000);

const tithiAt = (ms: number) => Math.floor(MoonPhase(new Date(ms)) / 12) % 30;
function tithiEnd(t: number, fromMs: number) {
  const r = SearchMoonPhase(((t + 1) * 12) % 360, new Date(fromMs), 3);
  return r ? r.date.getTime() : fromMs + DAY;
}
function siderealSun(ms: number) {
  const jd = ms / DAY + 2440587.5;
  const ayanamsa = 23.85306 + ((jd - 2451545) / 365.25) * (50.2788 / 3600); // Lahiri
  return (((SunPosition(new Date(ms)).elon - ayanamsa) % 360) + 360) % 360;
}

function sunEvents(key: string) {
  const start = new Date(istMidnight(key));
  const rise = SearchRiseSet(Body.Sun, observer, +1, start, 1)!.date.getTime();
  const set = SearchRiseSet(Body.Sun, observer, -1, start, 1)!.date.getTime();
  return { rise, set };
}

// ---------- lunations ----------
interface Lunation { start: number; end: number; month: number; adhika: boolean }

function lunations(fromMs: number, toMs: number): Lunation[] {
  const moons: number[] = [];
  let t = fromMs - 35 * DAY;
  while (t < toMs + 35 * DAY) {
    const nm = SearchMoonPhase(0, new Date(t), 40)!.date.getTime();
    moons.push(nm);
    t = nm + 2 * DAY;
  }
  const out: Lunation[] = [];
  for (let i = 0; i < moons.length - 1; i++) {
    const r0 = Math.floor(siderealSun(moons[i]) / 30);
    const r1 = Math.floor(siderealSun(moons[i + 1]) / 30);
    out.push({ start: moons[i], end: moons[i + 1], month: (r0 + 1) % 12, adhika: r0 === r1 });
  }
  return out;
}
const lunationAt = (ls: Lunation[], ms: number) => ls.find((l) => ms >= l.start && ms < l.end)!;

// ---------- main ----------
const cache = new Map<string, CalDay[]>();

/** Full calendar for the inclusive IST date range. */
export function buildCalendar(fromKey: string, toKey: string): CalDay[] {
  const ck = `${fromKey}|${toKey}`;
  const hit = cache.get(ck);
  if (hit) return applyCustom(hit);

  // Pad the range so tithis at the edges resolve correctly.
  const padFrom = addDays(fromKey, -3);
  const padTo = addDays(toKey, 3);
  const ls = lunations(istMidnight(padFrom), istMidnight(padTo));

  type Raw = { key: string; rise: number; set: number; tithi: number; lun: Lunation; covered: { tithi: number; lun: Lunation }[] };
  const raw: Raw[] = [];
  let prevTithi: number | null = null;
  for (let key: string = padFrom; key <= padTo; key = addDays(key, 1)) {
    const { rise, set } = sunEvents(key);
    const tithi = tithiAt(rise);
    const lun = lunationAt(ls, rise);
    const covered: Raw["covered"] = [];
    if (prevTithi !== null && tithi !== prevTithi) {
      // tithis from prev+1 up to today's; earlier ones are kshaya and belong here
      let k: number = (prevTithi + 1) % 30;
      let guard = 0;
      while (guard++ < 3) {
        const kLun = k > tithi ? lunationAt(ls, rise - DAY / 2) : lun;
        covered.push({ tithi: k, lun: kLun });
        if (k === tithi) break;
        k = (k + 1) % 30;
      }
    }
    raw.push({ key, rise, set, tithi, lun, covered });
    prevTithi = tithi;
  }

  const events = new Map<string, CalEvent[]>();
  const push = (key: string, e: CalEvent) => {
    const list = events.get(key) ?? [];
    list.push(e);
    events.set(key, list);
  };

  // Festivals: first day each tithi is "covered" within its lunation.
  // Evening festivals (Dipavali) take the first day whose sunset falls in the tithi.
  for (const rule of FESTIVAL_RULES.filter((r) => r.atSunset)) {
    for (const d of raw) {
      const lun = lunationAt(ls, d.set);
      if (tithiAt(d.set) === rule.tithi && lun.month === rule.month && !lun.adhika) {
        if (!(events.get(d.key) ?? []).some((e) => e.title === rule.title)) {
          const prev = raw[raw.indexOf(d) - 1];
          if (prev && tithiAt(prev.set) === rule.tithi) continue;
          push(d.key, { title: rule.title, kind: rule.kind, fast: rule.fast, note: rule.note, slug: rule.slug, major: rule.major });
        }
      }
    }
  }
  for (const d of raw) {
    for (const c of d.covered) {
      if (c.tithi === 10 || c.tithi === 25) continue; // Ekadashi handled below
      for (const rule of FESTIVAL_RULES) {
        if (rule.atSunset) continue;
        if (rule.tithi !== c.tithi || rule.month !== c.lun.month || c.lun.adhika) continue;
        push(d.key, { title: rule.title, kind: rule.kind, fast: rule.fast, note: rule.note, slug: rule.slug, major: rule.major });
      }
    }
  }

  // Ekadashi
  for (let i = 1; i < raw.length - 2; i++) {
    const d = raw[i];
    const ek = d.covered.find((c) => c.tithi === 10 || c.tithi === 25);
    if (!ek) continue;
    const shukla = ek.tithi === 10;
    const names = ek.lun.adhika ? ADHIKA_EKADASHI : EKADASHI_NAMES[ek.lun.month];
    const name = names[shukla ? 0 : 1];

    let fastIdx = i;
    let label = `${name} Ekadashi`;
    const dashami = ek.tithi - 1;
    const trayodashi = ek.tithi + 2;
    const dvadashiIdx = ek.tithi + 1;
    const arunodaya = d.rise - 96 * MIN;
    const ekAtSunrise = d.tithi === ek.tithi;
    if (ekAtSunrise && tithiAt(arunodaya) === dashami) {
      fastIdx = i + 1; // Dashami-viddha: fast on Dvadashi
    } else if (ekAtSunrise && raw[i + 1].tithi === ek.tithi) {
      fastIdx = i + 1;
      label = `${name} Ekadashi · Unmilani Mahadvadashi`;
    } else if (ekAtSunrise && raw[i + 1].tithi === dvadashiIdx && raw[i + 2].tithi === dvadashiIdx) {
      fastIdx = i + 1;
      label = `${name} Ekadashi · Vyanjuli Mahadvadashi`;
    } else if (ekAtSunrise && raw[i + 1].tithi === trayodashi) {
      label = `${name} Ekadashi · Trisprsha Mahadvadashi`;
    }

    const fastDay = raw[fastIdx];
    const next = raw[fastIdx + 1];
    // Parana: after Hari-vasara (first quarter of Dvadashi), within the first third of daylight.
    const dvadashi = ek.tithi + 1;
    const dvStart = SearchMoonPhase((dvadashi * 12) % 360, new Date(fastDay.rise - DAY), 3)!.date.getTime();
    const dvEnd = tithiEnd(dvadashi, dvStart + MIN);
    const hariVasaraEnd = dvStart + (dvEnd - dvStart) / 4;
    let from = Math.max(next.rise, hariVasaraEnd);
    let to = next.rise + (next.set - next.rise) / 3;
    if (dvEnd > next.rise && dvEnd < to) to = dvEnd;
    if (to <= from) { from = next.rise; to = next.rise + (next.set - next.rise) / 3; }

    push(fastDay.key, { title: label, kind: "ekadashi", fast: "Fast from grains and beans", slug: "ekadashi" });
    push(next.key, {
      title: "Break fast (Parana)",
      kind: "observance",
      parana: { from: istTime(from), to: istTime(to) },
    });
  }

  const days: CalDay[] = [];
  for (const d of raw) {
    if (d.key < fromKey || d.key > toKey) continue;
    const shukla = d.tithi < 15;
    const masaIdx = shukla ? d.lun.month : (d.lun.month + 1) % 12;
    const adhika = d.lun.adhika;
    // Gaurabda year turns the day after Gaura Purnima (start of Vishnu month).
    const y = Number(d.key.slice(0, 4));
    const m = Number(d.key.slice(5, 7));
    const beforeNewYear = m <= 5 && masaIdx >= 9 && !adhika;
    days.push({
      date: d.key,
      weekday: new Date(`${d.key}T12:00:00Z`).getUTCDay(),
      sunrise: istTime(d.rise),
      sunset: istTime(d.set),
      tithi: d.tithi,
      tithiName: tithiLabel(d.tithi),
      paksha: shukla ? "Gaura" : "Krishna",
      masa: adhika ? "Purushottama" : VAISHNAVA_MONTHS[masaIdx],
      amanta: (adhika ? "Adhika " : "") + AMANTA_MONTHS[d.lun.month],
      adhika,
      gaurabda: y - (beforeNewYear ? 1487 : 1486),
      events: events.get(d.key) ?? [],
    });
  }
  cache.set(ck, days);
  return applyCustom(days);
}

export function monthCalendar(year: number, month: number /* 1-12 */) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return buildCalendar(from, to);
}

export function todayKey(now = Date.now()) {
  return istKey(now);
}

/** Upcoming observances starting today, flattened. */
export function upcoming(days = 90, now = Date.now()) {
  const from = todayKey(now);
  const cal = buildCalendar(from, addDays(from, days));
  return cal.flatMap((d) => d.events.filter((e) => !e.parana).map((e) => ({ ...e, date: d.date, day: d })));
}

export function nextEkadashi(now = Date.now()) {
  return upcoming(40, now).find((e) => e.kind === "ekadashi");
}

export { addDays };
