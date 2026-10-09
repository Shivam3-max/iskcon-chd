import type { Metadata } from "next";
import JapaMala from "@/components/japa/JapaMala";
import { PageHeroFor } from "@/components/ui/bits";

export const metadata: Metadata = { title: "Chant with Us · Digital Japa Mala", description: "Chant the Hare Krishna maha-mantra on a 108-bead digital japa mala, with your rounds and daily streak kept on your device." };

export default function JapaPage() {
  return (
    <>
      <PageHeroFor id="japa" />
      <section className="band-lotus py-16 md:py-24">
        <div className="wrap">
          <JapaMala />
        </div>
      </section>
    </>
  );
}
