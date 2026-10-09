// Schema registry for the admin. Each resource maps to a /content/*.json file and
// describes its fields, so one set of editor components can render every form.
// Client-safe: no fs or server imports here.

export type FieldType =
  | "text" | "textarea" | "rich" | "slug" | "url" | "email" | "date" | "time" | "number"
  | "select" | "toggle" | "icon" | "image" | "video" | "link" | "list" | "paragraphs" | "repeater"
  | "slot" | "campaign";

export interface Field {
  key: string; // dotted paths allowed: "social.youtube"
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  required?: boolean;
  wide?: boolean; // spans both form columns
  options?: { value: string; label: string }[];
  fields?: Field[]; // repeater
  itemLabel?: string; // repeater / list
  titleKey?: string; // repeater: which subfield names the row
  from?: string; // slug: source field
  min?: number;
  step?: number;
}

export interface Group {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  slots?: { id: string; label: string }[]; // media slots edited alongside this group
}

export interface Resource {
  name: string; // content file
  title: string;
  singular: string;
  kind: "collection" | "singleton";
  key?: string; // collection identity field (slug / id); index when absent
  icon: string; // sidebar glyph
  role?: "super";
  description: string;
  fields?: Field[];
  groups?: Group[];
  columns?: { key: string; label: string; format?: "money" | "date" | "status" | "bool" | "progress" }[];
  preview?: (item: Record<string, unknown>) => string | undefined;
  defaults?: Record<string, unknown>;
  sortable?: boolean;
}

const STATUS = [
  { value: "draft", label: "Draft (hidden)" },
  { value: "live", label: "Live" },
  { value: "closed", label: "Completed" },
];
const KINDS = [
  { value: "festival", label: "Festival" },
  { value: "ekadashi", label: "Ekadashi" },
  { value: "appearance", label: "Appearance day" },
  { value: "disappearance", label: "Disappearance day" },
  { value: "observance", label: "Observance" },
];
const RICH_HELP = "Wrap words in *asterisks* for the accent italic. New line = line break.";
const link = (key: string, label: string): Field => ({ key, label, type: "link" });

export const RESOURCES: Resource[] = [
  {
    name: "campaigns",
    title: "Donation campaigns",
    singular: "Campaign",
    kind: "collection",
    key: "slug",
    icon: "diya",
    description: "Fundraising campaigns. The featured live campaign appears on the homepage.",
    sortable: true,
    columns: [
      { key: "title", label: "Campaign" },
      { key: "status", label: "Status", format: "status" },
      { key: "raised", label: "Raised", format: "progress" },
      { key: "end", label: "Ends", format: "date" },
      { key: "featured", label: "Homepage", format: "bool" },
    ],
    preview: (c) => `/donate/${c.slug}`,
    defaults: { status: "draft", featured: false, goal: 100000, raised: 0, donors: 0, illustration: "diya", tiers: [{ amount: 501, label: "" }, { amount: 1100, label: "" }], updates: [] },
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Web address", type: "slug", from: "title", help: "Used in the link: /donate/<address>" },
      { key: "kicker", label: "Short line above the title", type: "text", placeholder: "Damodara month · 26 Oct – 24 Nov" },
      { key: "status", label: "Status", type: "select", options: STATUS },
      { key: "featured", label: "Feature on the homepage", type: "toggle", help: "Only one campaign is featured; turning this on turns it off for the others." },
      { key: "summary", label: "Summary", type: "textarea", wide: true, help: "One or two sentences shown on cards and the homepage." },
      { key: "story", label: "The story", type: "textarea", wide: true },
      { key: "image", label: "Campaign image", type: "image", wide: true },
      { key: "illustration", label: "Icon", type: "icon" },
      { key: "start", label: "Starts", type: "date" },
      { key: "end", label: "Ends", type: "date" },
      { key: "goal", label: "Goal (₹)", type: "number", min: 0, step: 1000 },
      { key: "raised", label: "Raised so far (₹)", type: "number", min: 0, step: 100, help: "Online gifts are added automatically when payment is confirmed; add offline gifts here." },
      { key: "donors", label: "Number of donors", type: "number", min: 0 },
      { key: "tiers", label: "Suggested amounts", type: "repeater", wide: true, itemLabel: "amount", titleKey: "label", fields: [
        { key: "amount", label: "Amount (₹)", type: "number", min: 1 },
        { key: "label", label: "What it offers", type: "text" },
      ] },
      { key: "updates", label: "Progress updates", type: "repeater", wide: true, itemLabel: "update", titleKey: "text", fields: [
        { key: "date", label: "Date", type: "date" },
        { key: "text", label: "Update", type: "textarea" },
      ] },
    ],
  },
  {
    name: "sevas",
    title: "Sevas",
    singular: "Seva",
    kind: "collection",
    key: "slug",
    icon: "kalash",
    description: "Daily and monthly offerings people can sponsor.",
    sortable: true,
    columns: [
      { key: "title", label: "Seva" },
      { key: "amount", label: "Amount", format: "money" },
      { key: "unit", label: "Per" },
    ],
    preview: (s) => `/donate/seva/${s.slug}`,
    defaults: { amount: 1100, unit: "per day", illustration: "lotus" },
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Web address", type: "slug", from: "title" },
      { key: "detail", label: "Description", type: "textarea", wide: true },
      { key: "amount", label: "Amount (₹, 0 = any amount)", type: "number", min: 0 },
      { key: "unit", label: "Unit", type: "select", options: ["per day", "per month", "per Sunday", "per meal", "per puja", "any amount"].map((v) => ({ value: v, label: v })) },
      { key: "illustration", label: "Icon", type: "icon" },
    ],
  },
  {
    name: "posts",
    title: "Blog / Journal",
    singular: "Article",
    kind: "collection",
    key: "slug",
    icon: "books",
    description: "Temple news, festival notes and articles.",
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status", format: "status" },
      { key: "date", label: "Date", format: "date" },
    ],
    preview: (p) => `/blog/${p.slug}`,
    defaults: { status: "draft", category: "Temple News", figure: "lotus", body: [""], date: new Date().toISOString().slice(0, 10) },
    fields: [
      { key: "title", label: "Title", type: "text", required: true, wide: true },
      { key: "slug", label: "Web address", type: "slug", from: "title" },
      { key: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }] },
      { key: "date", label: "Date", type: "date" },
      { key: "category", label: "Category", type: "select", options: ["Temple News", "Festivals", "Practice", "Philosophy", "Food for Life", "Events"].map((v) => ({ value: v, label: v })) },
      { key: "cover", label: "Cover image", type: "image", wide: true },
      { key: "figure", label: "Icon", type: "icon" },
      { key: "excerpt", label: "Excerpt", type: "textarea", wide: true },
      { key: "body", label: "Article", type: "paragraphs", wide: true, itemLabel: "paragraph" },
    ],
  },
  {
    name: "festivals",
    title: "Festival stories",
    singular: "Festival",
    kind: "collection",
    key: "slug",
    icon: "ratha",
    description: "Story pages for festivals. Dates come from the Vaishnava calendar automatically.",
    columns: [{ key: "title", label: "Festival" }, { key: "slug", label: "Address" }],
    preview: (f) => `/festivals/${f.slug}`,
    defaults: { figure: "lotus", story: [""], atTemple: [] },
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Web address", type: "slug", from: "title", help: "Keep the existing address for calendar festivals so their dates link here." },
      { key: "sanskrit", label: "Name in Devanagari", type: "text" },
      { key: "figure", label: "Icon", type: "icon" },
      { key: "lede", label: "One-line summary", type: "textarea", wide: true },
      { key: "story", label: "The story", type: "paragraphs", wide: true, itemLabel: "paragraph" },
      { key: "atTemple", label: "At the temple", type: "list", wide: true, itemLabel: "item" },
      { key: "observe", label: "How to observe", type: "textarea", wide: true },
    ],
  },
  {
    name: "programs",
    title: "Programs",
    singular: "Program",
    kind: "collection",
    key: "slug",
    icon: "kirtan",
    description: "Food for Life, youth, classes, kids and other programs.",
    sortable: true,
    columns: [{ key: "title", label: "Program" }, { key: "when", label: "When" }],
    preview: (p) => `/programs/${p.slug}`,
    defaults: { figure: "kirtan", body: [""], points: [], cta: { label: "Get in touch", href: "/contact" } },
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Web address", type: "slug", from: "title" },
      { key: "tagline", label: "Tagline", type: "text", wide: true },
      { key: "when", label: "When", type: "text" },
      { key: "figure", label: "Icon", type: "icon" },
      { key: "intro", label: "Introduction", type: "textarea", wide: true },
      { key: "body", label: "Body", type: "paragraphs", wide: true, itemLabel: "paragraph" },
      { key: "points", label: "What it includes", type: "list", wide: true, itemLabel: "point" },
      link("cta", "Button"),
    ],
  },
  {
    name: "calendar-events",
    title: "Calendar events",
    singular: "Event",
    kind: "collection",
    key: "id",
    icon: "tulasi",
    description: "Add temple events to the Vaishnava calendar, or hide a computed one.",
    columns: [
      { key: "date", label: "Date", format: "date" },
      { key: "title", label: "Event" },
      { key: "kind", label: "Type" },
      { key: "hide", label: "Hides a date", format: "bool" },
    ],
    preview: (e) => `/calendar?d=${e.date}`,
    defaults: { kind: "festival", major: false, hide: false },
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "kind", label: "Type", type: "select", options: KINDS },
      { key: "fast", label: "Fasting note", type: "text", placeholder: "Fast till noon" },
      { key: "note", label: "Note", type: "text", wide: true },
      { key: "href", label: "Link (optional)", type: "url", placeholder: "/festivals/ratha-yatra" },
      { key: "major", label: "Show among major festivals", type: "toggle" },
      { key: "hide", label: "Hide the computed event with this title on this date", type: "toggle", help: "Use this when the temple observes a festival on a different day: hide it here and add it on the right date." },
    ],
  },
  {
    name: "testimonials",
    title: "Visitor reviews",
    singular: "Review",
    kind: "collection",
    icon: "lotus",
    description: "Short quotes from visitors. Use genuine reviews only.",
    sortable: true,
    columns: [{ key: "name", label: "Name" }, { key: "source", label: "Source" }, { key: "sample", label: "Sample", format: "bool" }],
    defaults: { source: "Google review", sample: false },
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "source", label: "Source", type: "text" },
      { key: "text", label: "Review", type: "textarea", wide: true },
      { key: "sample", label: "Mark as sample", type: "toggle" },
    ],
  },
  {
    name: "schedule",
    title: "Darshan timings",
    singular: "Time slot",
    kind: "collection",
    icon: "chamara",
    description: "The daily altar schedule. Drives the live status, the day arc and the visit page.",
    sortable: true,
    columns: [{ key: "start", label: "From" }, { key: "end", label: "To" }, { key: "title", label: "Programme" }, { key: "open", label: "Altar open", format: "bool" }, { key: "aarti", label: "Aarti", format: "bool" }],
    defaults: { start: "08:00", end: "09:00", open: true, aarti: false },
    fields: [
      { key: "start", label: "From", type: "time" },
      { key: "end", label: "To", type: "time" },
      { key: "title", label: "Programme", type: "text", required: true },
      { key: "detail", label: "Detail", type: "text", wide: true },
      { key: "open", label: "Altar open for darshan", type: "toggle" },
      { key: "aarti", label: "This is an aarti", type: "toggle" },
    ],
  },
  {
    name: "sunday",
    title: "Sunday Love Feast",
    singular: "Sunday feast",
    kind: "singleton",
    icon: "prasadam",
    description: "The weekly programme shown on the homepage.",
    preview: () => "/#welcome",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "tagline", label: "Tagline", type: "textarea", wide: true },
      { key: "start", label: "Starts", type: "time" },
      { key: "end", label: "Ends", type: "time" },
      { key: "program", label: "Running order", type: "repeater", wide: true, itemLabel: "item", titleKey: "title", fields: [
        { key: "time", label: "Time", type: "time" },
        { key: "title", label: "Title", type: "text" },
        { key: "detail", label: "Detail", type: "text" },
      ] },
      { key: "kids", label: "Children's note", type: "text", wide: true },
      { key: "sponsorSeva", label: "Seva for the sponsor link", type: "text", help: "Seva web address, e.g. sunday-feast" },
    ],
  },
  {
    name: "pages",
    title: "Page headers",
    singular: "Page headers",
    kind: "singleton",
    icon: "temple",
    description: "The title, intro and icon at the top of every inner page.",
    groups: ([
      ["about", "About the temple", "/about"], ["prabhupada", "Srila Prabhupada", "/srila-prabhupada"], ["visit", "Plan your visit", "/visit"],
      ["live", "Live darshan", "/live"], ["calendar", "Vaishnava calendar", "/calendar"], ["ekadashi", "Ekadashi list", "/calendar/ekadashi"],
      ["festivals", "Festivals", "/festivals"], ["programs", "Programs", "/programs"], ["donate", "Donate", "/donate"],
      ["japa", "Chant (japa)", "/japa"], ["blog", "Journal", "/blog"], ["contact", "Contact", "/contact"],
    ] as const).map(([id, title, href]) => ({
      id,
      title,
      description: href,
      slots: [{ id: `page.${id}`, label: "Header background" }],
      fields: [
        { key: `${id}.eyebrow`, label: "Small heading", type: "text" },
        { key: `${id}.icon`, label: "Icon", type: "icon" },
        { key: `${id}.title`, label: "Title", type: "rich", wide: true, help: RICH_HELP },
        { key: `${id}.lede`, label: "Introduction", type: "textarea", wide: true },
      ],
    })),
  },
  {
    name: "settings",
    title: "Site settings",
    singular: "Settings",
    kind: "singleton",
    icon: "conch",
    role: "super",
    description: "Contact details, social links, SEO and the announcement bar.",
    groups: [
      { id: "announce", title: "Announcement bar", description: "A slim banner across the top of every page.", fields: [
        { key: "announcement.enabled", label: "Show the announcement", type: "toggle" },
        { key: "announcement.text", label: "Text", type: "text", wide: true, placeholder: "Janmashtami: temple open till 1 am" },
        { key: "announcement.href", label: "Link", type: "url" },
      ] },
      { id: "temple", title: "Temple", fields: [
        { key: "name", label: "Site name", type: "text" },
        { key: "temple", label: "Temple name", type: "text" },
        { key: "deities", label: "Presiding Deities", type: "text" },
        { key: "since", label: "Serving since", type: "number" },
        { key: "address", label: "Address lines", type: "list", wide: true, itemLabel: "line" },
      ] },
      { id: "contact", title: "Contact", fields: [
        { key: "phone", label: "Phone (as shown)", type: "text" },
        { key: "phoneHref", label: "Phone link", type: "text", placeholder: "tel:+911722601590" },
        { key: "email", label: "Email", type: "email" },
        { key: "whatsapp.counselling.number", label: "WhatsApp: counselling", type: "text" },
        { key: "whatsapp.counselling.href", label: "Counselling WhatsApp link", type: "url" },
        { key: "whatsapp.kirtan.number", label: "WhatsApp: kirtan at home", type: "text" },
        { key: "whatsapp.kirtan.href", label: "Kirtan WhatsApp link", type: "url" },
        { key: "maps", label: "Google Maps link", type: "url", wide: true },
        { key: "mapsEmbed", label: "Map embed link", type: "url", wide: true },
      ] },
      { id: "social", title: "Social links", fields: [
        { key: "social.youtube", label: "YouTube", type: "url" },
        { key: "social.instagram", label: "Instagram", type: "url" },
        { key: "social.facebook", label: "Facebook", type: "url" },
        { key: "social.x", label: "X (Twitter)", type: "url" },
      ] },
      { id: "seo", title: "Search & sharing", fields: [
        { key: "url", label: "Website address", type: "url" },
        { key: "seoTitle", label: "Search title", type: "text", wide: true },
        { key: "seoDescription", label: "Search description", type: "textarea", wide: true },
      ] },
    ],
  },
];

export const resource = (name: string) => RESOURCES.find((r) => r.name === name);

// ---------- Homepage sections ----------
export const HOME_SECTIONS: Group[] = [
  { id: "hero", title: "Hero", description: "The first screen: temple video, title and the four round buttons.", slots: [{ id: "home.hero.bg", label: "Background video / image" }, ...["janmashtami", "harinama", "gaura", "govardhana", "darshan", "ratha", "kartika"].map((f) => ({ id: `hero.frame.${f}`, label: `Reel: ${f}` }))], fields: [
    { key: "welcome", label: "Small line above", type: "text" },
    { key: "title", label: "Title (script)", type: "text", wide: true },
    { key: "subtitle", label: "Subtitle", type: "text", wide: true },
    { key: "medallions", label: "Round buttons", type: "repeater", wide: true, itemLabel: "button", titleKey: "label", fields: [
      { key: "label", label: "Label", type: "text" }, { key: "href", label: "Link", type: "url" }, { key: "icon", label: "Icon", type: "icon" },
    ] },
    { key: "showReel", label: "Show the festival video reel", type: "toggle" },
    { key: "showNext", label: "Show today's tithi and next Ekadashi", type: "toggle" },
  ] },
  { id: "welcome", title: "Welcome", slots: [{ id: "home.welcome.main", label: "Large arch photo" }, { id: "home.welcome.second", label: "Small photo" }, { id: "home.welcome.third", label: "Small photo 2" }], fields: [
    { key: "eyebrow", label: "Small heading", type: "text" },
    { key: "icon", label: "Medallion icon", type: "icon" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    { key: "paragraphs", label: "Text", type: "paragraphs", wide: true, itemLabel: "paragraph" },
    link("primaryCta", "Main button"), link("secondaryCta", "Text link"),
  ] },
  { id: "darshan", title: "Darshan & aarti", slots: [{ id: "aarti.mangala", label: "Mangala" }, { id: "aarti.shringar", label: "Shringar" }, { id: "aarti.rajbhoga", label: "Raj Bhoga" }, { id: "aarti.dhoop", label: "Dhoop" }, { id: "aarti.sandhya", label: "Sandhya" }], fields: [
    { key: "eyebrow", label: "Small heading", type: "text" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    link("cta", "Button"),
    { key: "showDayArc", label: "Show the sun-path timeline", type: "toggle" },
    { key: "aartis", label: "Aarti cards", type: "repeater", wide: true, itemLabel: "card", titleKey: "label", fields: [
      { key: "label", label: "Name", type: "text" }, { key: "time", label: "Time", type: "time" }, { key: "slot", label: "Photo slot", type: "text", help: "Media slot id, e.g. aarti.mangala" },
    ] },
  ] },
  { id: "calendar", title: "Coming up (calendar)", fields: [
    { key: "eyebrow", label: "Small heading", type: "text" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    { key: "ekadashiCta", label: "Ekadashi button", type: "text" },
  ] },
  { id: "sunday", title: "This Sunday", description: "Content is edited under Sunday Love Feast.", slots: [{ id: "home.sunday", label: "Photo" }, { id: "home.sunday.kirtan", label: "Small video" }], fields: [] },
  { id: "scripture", title: "Scripture band", fields: [
    { key: "sanskrit", label: "Sanskrit verse", type: "textarea", wide: true },
    { key: "quote", label: "Translation", type: "textarea", wide: true },
    { key: "source", label: "Source", type: "text" },
    { key: "icon", label: "Icon", type: "icon" },
  ] },
  { id: "campaign", title: "Featured campaign", description: "Text, amounts and image come from the campaign itself.", slots: [{ id: "home.campaign", label: "Fallback image (if the campaign has none)" }], fields: [
    { key: "campaign", label: "Campaign to show", type: "campaign", help: "Leave on 'Featured' to show whichever campaign is marked featured." },
    { key: "eyebrow", label: "Label", type: "text" },
    { key: "ctaLabel", label: "Button text", type: "text" },
    { key: "familiesLabel", label: "Donor word", type: "text", placeholder: "families" },
  ] },
  { id: "moments", title: "Moments gallery", description: "Photos and videos are managed under Media → Gallery.", fields: [
    { key: "eyebrow", label: "Small heading", type: "text" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    link("link", "Link"),
  ] },
  { id: "festivals", title: "Festivals", fields: [
    { key: "eyebrow", label: "Small heading", type: "text" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    link("cta", "Button"),
    { key: "count", label: "How many festivals", type: "number", min: 1 },
  ] },
  { id: "programs", title: "Programs", fields: [
    { key: "eyebrow", label: "Small heading", type: "text" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    { key: "count", label: "How many programs", type: "number", min: 1 },
  ] },
  { id: "film", title: "Film", slots: [{ id: "home.film", label: "Film (video)" }], fields: [
    { key: "eyebrow", label: "Label", type: "text" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    { key: "text", label: "Text", type: "text", wide: true },
  ] },
  { id: "prabhupada", title: "Srila Prabhupada", slots: [{ id: "home.prabhupada", label: "Portrait" }], fields: [
    { key: "eyebrow", label: "Small heading", type: "text" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    { key: "quote", label: "Quote", type: "text", wide: true },
    { key: "text", label: "Text", type: "textarea", wide: true },
    link("primaryCta", "Main button"), link("secondaryCta", "Second button"),
  ] },
  { id: "serve", title: "Ways to serve", fields: [
    { key: "eyebrow", label: "Small heading", type: "text" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    { key: "text", label: "Text", type: "text", wide: true },
    link("cta", "Button"),
    { key: "campaignCount", label: "Campaign cards", type: "number", min: 0 },
    { key: "sevaCount", label: "Seva tiles", type: "number", min: 0 },
  ] },
  { id: "chant", title: "Chant invitation", fields: [
    { key: "mantra", label: "Mantra", type: "text", wide: true },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    { key: "text", label: "Text", type: "text", wide: true },
    link("cta", "Button"),
    { key: "icon", label: "Icon", type: "icon" },
  ] },
  { id: "visit", title: "Visit & map", fields: [
    { key: "eyebrow", label: "Small heading", type: "text" },
    { key: "title", label: "Title", type: "rich", wide: true, help: RICH_HELP },
    { key: "morning", label: "Morning timings", type: "textarea" },
    { key: "evening", label: "Evening timings", type: "textarea" },
    link("cta", "Directions button (blank link = Google Maps)"), link("secondaryCta", "Second button"),
  ] },
];

/** Built-in illustration names offered in the icon picker. */
export const BUILTIN_ICONS = [
  "gaura-nitai", "kirtan", "kartal", "preacher", "children", "books", "prasadam", "ratha", "cow",
  "tulasi", "lotus", "diya", "conch", "flute", "temple", "kalash", "peacock", "chamara",
] as const;
