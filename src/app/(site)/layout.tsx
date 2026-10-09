import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildCalendar, todayKey } from "@/lib/vaishnava/engine";

export const revalidate = 3600;

function todayLine() {
  const k = todayKey();
  const d = buildCalendar(k, k)[0];
  const date = new Date(`${k}T12:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return `${date} · ${d.tithiName}, ${d.masa} masa · Gaurabda ${d.gaurabda}`;
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header today={todayLine()} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
