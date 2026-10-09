import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { PageHeroFor } from "@/components/ui/bits";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Contact", description: "Write to ISKCON Chandigarh: visits, programs, volunteering, kirtan at home, counselling and seminars." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const SITE = getSettings();
  const { topic } = await searchParams;
  return (
    <>
      <PageHeroFor id="contact" />
      <section className="py-16 md:py-24">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_380px]">
          <ContactForm initialTopic={topic} contactEmail={SITE.email} />
          <aside className="space-y-5">
            <div className="rounded-[18px] border border-line bg-paper p-7">
              <p className="eyebrow">Temple office</p>
              <p className="mt-3 font-serif text-2xl leading-snug text-ink">{SITE.address[0]}<br />{SITE.address[1]}</p>
              <p className="mt-4 text-ink"><a href={SITE.phoneHref} className="link">{SITE.phone}</a><br /><a href={`mailto:${SITE.email}`} className="link">{SITE.email}</a></p>
            </div>
            {Object.values(SITE.whatsapp).map((w) => (
              <a key={w.href} href={w.href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[18px] border border-line bg-paper p-6 transition-colors hover:border-gold">
                <span>
                  <span className="block font-serif text-xl text-ink">{w.label}</span>
                  <span className="text-[0.88rem] text-ink-soft">WhatsApp {w.number}</span>
                </span>
                <span className="text-tulasi">→</span>
              </a>
            ))}
          </aside>
        </div>
      </section>
    </>
  );
}
