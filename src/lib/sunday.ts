// The weekly Sunday Love Feast: content from content/sunday.json, date from the IST clock.
import "server-only";
import { readFileSync } from "fs";
import path from "path";
import { addDays, buildCalendar, todayKey } from "./vaishnava/engine";
import { istMinutes, toMin } from "./schedule";

export interface SundayInfo {
  title: string;
  tagline: string;
  start: string;
  end: string;
  program: { time: string; title: string; detail: string }[];
  kids?: string;
  sponsorSeva?: string;
}

export function getSunday() {
  const info = JSON.parse(readFileSync(path.join(process.cwd(), "content/sunday.json"), "utf8")) as SundayInfo;
  const today = todayKey();
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
  const isToday = dow === 0 && istMinutes() < toMin(info.end);
  const date = isToday ? today : addDays(today, dow === 0 ? 7 : 7 - dow);
  const day = buildCalendar(date, date)[0];
  const festival = day.events.find((e) => !e.parana && e.kind !== "observance") ?? day.events.find((e) => !e.parana && e.major);
  return { info, date, isToday, day, festival };
}
