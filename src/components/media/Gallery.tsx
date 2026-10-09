import { getGallery } from "@/lib/media";
import { MediaView } from "./Media";

/** Masonry collage of photos and films ("Moments at the temple"). */
export default function Gallery() {
  const items = getGallery();
  return (
    <div className="grid grid-flow-dense auto-rows-[150px] grid-cols-2 gap-3 md:auto-rows-[190px] md:grid-cols-4 md:gap-4">
      {items.map((m, i) => (
        <MediaView
          key={i}
          m={m}
          className={`reveal rounded-[14px] ${m.span === "tall" ? "row-span-2" : ""} ${m.span === "wide" ? "col-span-2" : ""}`}
        />
      ))}
    </div>
  );
}
