// Checks the computed calendar against published ISKCON dates (Drik ISKCON list, temple notices).
import { buildCalendar } from "../src/lib/vaishnava/engine";

const cal = buildCalendar("2026-01-01", "2026-12-31");
const find = (re: RegExp) => cal.filter((d) => d.events.some((e) => re.test(e.title))).map((d) => d.date);
const expect: [RegExp, string][] = [
  [/Shat-tila Ekadashi/, "2026-01-14"], [/Bhaimi/, "2026-01-29"], [/Vijaya Ekadashi/, "2026-02-13"],
  [/Varuthini/, "2026-04-13"], [/Mohini/, "2026-04-27"], [/Apara/, "2026-05-13"],
  [/Yogini/, "2026-07-11"], [/Pavitropana.*Vyanjuli/, "2026-08-24"],
  [/Amalaki/, "2026-02-27"], [/Papamochani/, "2026-03-15"], [/Kamada/, "2026-03-29"], [/Padmini/, "2026-05-27"],
  [/Parama/, "2026-06-11"], [/Nirjala/, "2026-06-25"], [/Shayana/, "2026-07-25"], [/Kamika/, "2026-08-09"],
  [/Annada/, "2026-09-07"], [/Parshva/, "2026-09-22"], [/Utpanna/, "2026-12-04"], [/Govardhana/, "2026-11-10"], [/Indira/, "2026-10-06"],
  [/Pashankusha/, "2026-10-22"], [/Rama Ekadashi/, "2026-11-05"], [/Utthana/, "2026-11-21"],
  [/Mokshada/, "2026-12-20"], [/Janmashtami/, "2026-09-04"], [/Gaura Purnima/, "2026-03-03"],
  [/^Ratha Yatra/, "2026-07-16"], [/Dipavali/, "2026-11-08"],
];
let fail = 0;
for (const [re, date] of expect) {
  const got = find(re);
  const ok = got.includes(date);
  if (!ok) fail++;
  console.log(ok ? "✓" : "✗", re.source.padEnd(22), "expected", date, "got", got.join(", "));
}
const ek = cal.flatMap((d) => d.events.filter((e) => e.kind === "ekadashi").map((e) => `${d.date} ${e.title}`));
console.log(`\n${ek.length} Ekadashis in 2026:\n` + ek.join("\n"));
const o = cal.find((d) => d.date === "2026-10-08")!;
console.log("\nToday:", o.date, o.tithiName, o.masa, o.amanta, "Gaurabda", o.gaurabda, o.sunrise, o.sunset);
console.log("Adhika span:", cal.filter((d) => d.adhika).map((d) => d.date).filter((_, i, a) => i === 0 || i === a.length - 1));
const paranaIndira = cal.find((d) => d.date === "2026-10-07")!.events.find((e) => e.parana);
console.log("Indira parana (Drik Delhi 06:17–10:12):", paranaIndira?.parana);
process.exit(fail ? 1 : 0);
