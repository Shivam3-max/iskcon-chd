export const SITE = {
  name: "ISKCON Chandigarh",
  temple: "Hare Krishna Dham",
  deities: "Sri Sri Radha Madhava",
  url: "https://iskconchandigarh.com",
  address: ["Hare Krishna Dham, Dakshin Marg", "Sector 36-B, Chandigarh 160036"],
  phone: "+91 172 260 1590",
  phoneHref: "tel:+911722601590",
  email: "iskconchandigarh@gmail.com",
  whatsapp: {
    counselling: { label: "Personal counselling", number: "94646 62288", href: "https://wa.me/919464662288" },
    kirtan: { label: "Kirtan at home", number: "94170 86796", href: "https://wa.me/919417086796" },
  },
  social: {
    youtube: "https://www.youtube.com/@iskconchd",
    instagram: "https://www.instagram.com/iskconchd",
    facebook: "https://www.facebook.com/iskconchd",
    x: "https://x.com/iskconchd",
  },
  maps: "https://www.google.com/maps/search/?api=1&query=ISKCON+Temple+Sector+36B+Chandigarh",
  mapsEmbed: "https://www.google.com/maps?q=ISKCON+Temple+Sector+36+B+Chandigarh&output=embed",
  since: 1978,
};

export const NAV = [
  {
    label: "Temple",
    href: "/about",
    children: [
      { label: "About the temple", href: "/about", note: "Sri Sri Radha Madhava since 1978" },
      { label: "Srila Prabhupada", href: "/srila-prabhupada", note: "Founder-Acharya of ISKCON" },
      { label: "Plan your visit", href: "/visit", note: "Darshan, aartis, directions" },
      { label: "Live darshan", href: "/live", note: "Join the aarti from anywhere" },
    ],
  },
  {
    label: "Calendar",
    href: "/calendar",
    children: [
      { label: "Vaishnava calendar", href: "/calendar", note: "Computed daily for Chandigarh" },
      { label: "Ekadashi dates", href: "/calendar/ekadashi", note: "Fast and parana times" },
      { label: "Festivals", href: "/festivals", note: "Stories and how we celebrate" },
    ],
  },
  {
    label: "Programs",
    href: "/programs",
    children: [
      { label: "Food for Life", href: "/programs/food-for-life", note: "Prasadam for every hungry soul" },
      { label: "Youth Forum", href: "/programs/youth", note: "Gita for students & young professionals" },
      { label: "Bhakti Yoga classes", href: "/programs/bhakti-yoga", note: "Courses and Sunday feast" },
      { label: "Kids & summer camp", href: "/programs/kids", note: "Values through stories and art" },
      { label: "Kirtan at your home", href: "/programs/kirtan-at-home", note: "Harinama in your living room" },
      { label: "All programs", href: "/programs", note: "Counselling, seminars & more" },
    ],
  },
  { label: "Chant", href: "/japa" },
  { label: "Journal", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
