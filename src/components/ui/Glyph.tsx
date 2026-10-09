/* eslint-disable @next/next/no-img-element */
import Illustration from "../illustrations/Illustration";
import { FIGURES } from "../illustrations/figures";
import type { Figure } from "../illustrations/types";

/**
 * An icon chosen in the admin: either one of the built-in hand-drawn
 * illustrations ("tulasi", "diya"…) or the URL of an uploaded image.
 */
export default function Glyph({ value, className = "", draw = false, title }: { value?: string; className?: string; draw?: boolean; title?: string }) {
  if (!value) return null;
  if (value in FIGURES) return <Illustration figure={value as Figure} className={className} draw={draw} title={title} />;
  return <img src={value} alt={title ?? ""} className={`object-contain ${className}`} />;
}
