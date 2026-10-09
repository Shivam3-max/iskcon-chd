import type { Metadata } from "next";
import Script from "next/script";
import { Great_Vibes, Lora, Manrope, Tiro_Devanagari_Sanskrit } from "next/font/google";
import "./globals.css";
import RevealObserver from "@/components/RevealObserver";
import { SiteProvider } from "@/components/SiteProvider";
import { getSchedule, getSettings } from "@/lib/data";

const garamond = Lora({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-garamond", display: "swap" });
const source = Manrope({ subsets: ["latin"], variable: "--font-source", display: "swap" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });
const tiro = Tiro_Devanagari_Sanskrit({ subsets: ["devanagari"], weight: "400", variable: "--font-tiro", display: "swap" });

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const site = getSettings();
  return {
    metadataBase: new URL(site.url),
    title: { default: site.seoTitle || site.name, template: `%s · ${site.name}` },
    description: site.seoDescription,
  };
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getSettings();
  return (
    <html lang="en" suppressHydrationWarning className={`${garamond.variable} ${source.variable} ${tiro.variable} ${script.variable}`}>
      <head>
        {/* ?still=1 freezes every animation for screenshots */}
        <Script id="still" strategy="beforeInteractive">{"if(location.search.includes('still'))document.documentElement.setAttribute('data-still','');"}</Script>
      </head>
      <body className="antialiased">
        <SiteProvider value={{ phone: site.phone, phoneHref: site.phoneHref, schedule: getSchedule(), announcement: site.announcement }}>
        {children}
        <RevealObserver />
        </SiteProvider>
      </body>
    </html>
  );
}
