import { PageTitle } from "@/components/admin/Shell";
import { MediaManager } from "@/components/admin/MediaManager";
import type { MediaDoc } from "@/components/admin/SingletonEditor";
import { readContent } from "@/lib/store";

export const metadata = { title: "Photos & videos" };

export default function MediaAdmin() {
  return (
    <>
      <PageTitle title="Photos & videos" description="Every photo and video spot on the website. Upload a file to replace its placeholder." />
      <MediaManager initial={readContent<MediaDoc>("media", { slots: {}, gallery: [] })} />
    </>
  );
}
