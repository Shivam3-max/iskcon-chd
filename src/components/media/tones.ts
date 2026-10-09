import type { Tone } from "@/lib/media";

// Soft-focus "photographic" stand-ins: layered light pools that read like an
// out-of-focus temple photograph until the real image is uploaded.
export const TONES: Record<Tone, string> = {
  altar:
    "radial-gradient(28% 34% at 50% 42%, rgba(255,214,140,.85), transparent 70%), radial-gradient(14% 16% at 30% 30%, rgba(255,190,110,.55), transparent 70%), radial-gradient(12% 14% at 72% 28%, rgba(255,226,170,.55), transparent 70%), radial-gradient(10% 12% at 22% 72%, rgba(240,120,60,.4), transparent 70%), radial-gradient(9% 10% at 80% 70%, rgba(255,200,120,.45), transparent 70%), linear-gradient(170deg, #6e1f1c 0%, #3c1110 60%, #2a0c0b 100%)",
  saffron:
    "radial-gradient(30% 34% at 35% 40%, rgba(255,220,150,.75), transparent 70%), radial-gradient(18% 20% at 75% 60%, rgba(255,170,80,.6), transparent 70%), radial-gradient(10% 12% at 60% 22%, rgba(255,240,200,.6), transparent 70%), linear-gradient(160deg, #e7923a 0%, #c4581f 55%, #8a3414 100%)",
  dusk:
    "radial-gradient(26% 30% at 70% 35%, rgba(255,210,150,.75), transparent 70%), radial-gradient(14% 16% at 25% 60%, rgba(255,170,140,.5), transparent 70%), radial-gradient(9% 10% at 45% 25%, rgba(255,235,200,.55), transparent 70%), linear-gradient(180deg, #8d5d7a 0%, #c98b6b 55%, #e8b07a 100%)",
  night:
    "radial-gradient(9% 11% at 30% 55%, rgba(255,190,90,.9), transparent 70%), radial-gradient(8% 10% at 52% 48%, rgba(255,210,120,.85), transparent 70%), radial-gradient(7% 9% at 70% 58%, rgba(255,170,70,.8), transparent 70%), radial-gradient(6% 7% at 40% 30%, rgba(255,220,150,.6), transparent 70%), radial-gradient(40% 40% at 50% 55%, rgba(200,90,30,.35), transparent 75%), linear-gradient(180deg, #1f1420 0%, #2a1612 100%)",
  gold:
    "radial-gradient(30% 34% at 50% 40%, rgba(255,246,215,.9), transparent 70%), radial-gradient(14% 16% at 20% 65%, rgba(255,215,140,.6), transparent 70%), radial-gradient(12% 14% at 80% 25%, rgba(255,230,170,.6), transparent 70%), linear-gradient(170deg, #e9c27a 0%, #c9933f 60%, #9b6a2a 100%)",
  rose:
    "radial-gradient(22% 26% at 30% 40%, rgba(255,215,225,.85), transparent 70%), radial-gradient(18% 20% at 70% 55%, rgba(250,170,190,.7), transparent 70%), radial-gradient(10% 11% at 55% 20%, rgba(255,240,220,.7), transparent 70%), linear-gradient(160deg, #e8a3b2 0%, #c86b84 60%, #8f3f55 100%)",
  garden:
    "radial-gradient(26% 30% at 40% 35%, rgba(240,250,210,.75), transparent 70%), radial-gradient(14% 16% at 75% 60%, rgba(200,230,160,.6), transparent 70%), radial-gradient(9% 10% at 20% 70%, rgba(255,240,190,.5), transparent 70%), linear-gradient(170deg, #9dbb7c 0%, #5f8a4e 60%, #3c5f35 100%)",
  marble:
    "radial-gradient(32% 36% at 60% 35%, rgba(255,255,250,.95), transparent 70%), radial-gradient(18% 20% at 25% 60%, rgba(255,236,205,.8), transparent 70%), radial-gradient(10% 12% at 80% 70%, rgba(240,210,170,.6), transparent 70%), linear-gradient(170deg, #f3e7d3 0%, #e4d0ae 60%, #cfb388 100%)",
};
