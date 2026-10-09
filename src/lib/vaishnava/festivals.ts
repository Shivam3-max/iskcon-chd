// Festival rules for the Gaudiya Vaishnava calendar.
//
// Every observance is keyed to an amanta lunar month (0 = Chaitra … 11 = Phalguna)
// and a tithi index (0–14 = Shukla Pratipada…Purnima, 15–29 = Krishna Pratipada…Amavasya).
// The engine places each rule on the civil day where that tithi prevails at sunrise
// in Chandigarh, so the whole calendar regenerates itself for any year.

export type EventKind = "ekadashi" | "festival" | "appearance" | "disappearance" | "observance";

export interface FestivalRule {
  month: number;
  tithi: number;
  title: string;
  kind: EventKind;
  fast?: string;
  note?: string;
  slug?: string; // links to a festival story page
  major?: boolean;
  atSunset?: boolean; // tithi judged at sunset instead of sunrise
}

export const AMANTA_MONTHS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna",
];

// Gaudiya month names, aligned to the amanta month of the shukla paksha they contain.
export const VAISHNAVA_MONTHS = [
  "Vishnu", "Madhusudana", "Trivikrama", "Vamana", "Sridhara", "Hrishikesha",
  "Padmanabha", "Damodara", "Keshava", "Narayana", "Madhava", "Govinda",
];

export const TITHI_NAMES = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi",
];

export function tithiLabel(t: number) {
  const paksha = t < 15 ? "Gaura" : "Krishna";
  const i = t % 15;
  if (i === 14) return t < 15 ? "Purnima" : "Amavasya";
  return `${paksha} ${TITHI_NAMES[i]}`;
}

// [shukla, krishna] Ekadashi names for each amanta month.
export const EKADASHI_NAMES: [string, string][] = [
  ["Kamada", "Varuthini"],
  ["Mohini", "Apara"],
  ["Pandava Nirjala", "Yogini"],
  ["Shayana", "Kamika"],
  ["Pavitropana", "Annada"],
  ["Parshva", "Indira"],
  ["Pashankusha", "Rama"],
  ["Utthana", "Utpanna"],
  ["Mokshada", "Saphala"],
  ["Putrada", "Shat-tila"],
  ["Bhaimi", "Vijaya"],
  ["Amalaki", "Papamochani"],
];
export const ADHIKA_EKADASHI: [string, string] = ["Padmini", "Parama"];

const S = (n: number) => n - 1; // shukla tithi number → index
const K = (n: number) => 14 + n; // krishna tithi number → index
const PURNIMA = 14;
const AMAVASYA = 29;

export const FESTIVAL_RULES: FestivalRule[] = [
  // Chaitra
  { month: 0, tithi: S(9), title: "Sri Rama Navami", kind: "appearance", fast: "Fast till sunset", slug: "rama-navami", major: true },
  // Vaishakha
  { month: 1, tithi: S(3), title: "Akshaya Tritiya · Chandana Yatra begins", kind: "festival", note: "Twenty-one days of sandalwood for the Lord" },
  { month: 1, tithi: S(14), title: "Sri Nrisimha Chaturdashi", kind: "appearance", fast: "Fast till dusk", slug: "nrisimha-chaturdashi", major: true },
  { month: 1, tithi: PURNIMA, title: "Krishna Phula Dola · Chandana Yatra ends", kind: "festival" },
  // Jyeshtha
  { month: 2, tithi: PURNIMA, title: "Snana Yatra", kind: "festival", note: "Bathing ceremony of Lord Jagannatha", major: true },
  // Ashadha
  { month: 3, tithi: S(2), title: "Ratha Yatra", kind: "festival", slug: "ratha-yatra", major: true },
  { month: 3, tithi: S(10), title: "Return Ratha Yatra", kind: "festival" },
  { month: 3, tithi: PURNIMA, title: "Guru Purnima · Chaturmasya begins", kind: "observance", note: "First month: fast from green leafy vegetables" },
  // Shravana
  { month: 4, tithi: S(11), title: "Jhulan Yatra begins", kind: "festival", note: "Swing festival of Sri Sri Radha-Krishna" },
  { month: 4, tithi: PURNIMA, title: "Sri Balarama Jayanti", kind: "appearance", fast: "Fast till noon", major: true },
  { month: 4, tithi: K(8), title: "Sri Krishna Janmashtami", kind: "appearance", fast: "Fast till midnight", slug: "janmashtami", major: true },
  { month: 4, tithi: K(9), title: "Nandotsava · Srila Prabhupada's Appearance", kind: "appearance", fast: "Fast till noon", slug: "vyasa-puja", major: true },
  // Bhadrapada
  { month: 5, tithi: S(8), title: "Sri Radhashtami", kind: "appearance", fast: "Fast till noon", slug: "radhashtami", major: true },
  { month: 5, tithi: S(12), title: "Sri Vamana Dvadashi", kind: "appearance", fast: "Fast till noon" },
  { month: 5, tithi: S(14), title: "Ananta Chaturdashi · Haridasa Thakura's Disappearance", kind: "disappearance", fast: "Fast till noon" },
  { month: 5, tithi: PURNIMA, title: "Chaturmasya third month begins", kind: "observance", note: "Fast from milk for one month" },
  // Ashvina
  { month: 6, tithi: S(10), title: "Ramachandra Vijayotsava · Dussehra", kind: "festival" },
  { month: 6, tithi: PURNIMA, title: "Sharad Purnima · Damodara month begins", kind: "festival", note: "Daily lamp offering to Lord Damodara for the whole month", slug: "kartika-damodara" },
  { month: 6, tithi: K(8), title: "Bahulashtami · Appearance of Radha Kunda", kind: "festival", note: "Midnight bathing at Radha Kunda" },
  { month: 6, tithi: AMAVASYA, title: "Dipavali · Deepotsava", kind: "festival", atSunset: true, slug: "diwali-govardhana", major: true },
  // Kartika
  { month: 7, tithi: S(1), title: "Govardhana Puja · Go Puja", kind: "festival", slug: "diwali-govardhana", major: true },
  { month: 7, tithi: S(4), title: "Srila Prabhupada's Disappearance", kind: "disappearance", fast: "Fast till noon", major: true },
  { month: 7, tithi: S(8), title: "Gopashtami", kind: "festival", note: "Krishna begins tending the cows" },
  { month: 7, tithi: S(11), title: "Bhishma Panchaka begins", kind: "observance" },
  { month: 7, tithi: PURNIMA, title: "Sri Krishna Rasa Yatra · Tulasi-Shaligrama Vivaha", kind: "festival", note: "Damodara month and Chaturmasya end" },
  // Margashirsha
  { month: 8, tithi: S(11), title: "Gita Jayanti", kind: "festival", note: "Day the Bhagavad-gita was spoken at Kurukshetra", slug: "gita-jayanti", major: true },
  // Magha
  { month: 10, tithi: S(5), title: "Vasanta Panchami", kind: "festival" },
  { month: 10, tithi: S(7), title: "Sri Advaita Acharya's Appearance", kind: "appearance", fast: "Fast till noon" },
  { month: 10, tithi: S(12), title: "Sri Varaha Dvadashi", kind: "appearance", fast: "Fast till noon" },
  { month: 10, tithi: S(13), title: "Sri Nityananda Trayodashi", kind: "appearance", fast: "Fast till noon", major: true },
  { month: 10, tithi: K(5), title: "Srila Bhaktisiddhanta Sarasvati Thakura's Appearance", kind: "appearance", fast: "Fast till noon" },
  // Phalguna
  { month: 11, tithi: PURNIMA, title: "Gaura Purnima", kind: "appearance", fast: "Fast till moonrise", slug: "gaura-purnima", major: true },
];
