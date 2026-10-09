import { PageTitle } from "@/components/admin/Shell";
import { HomeEditor } from "@/components/admin/HomeEditor";
import type { MediaDoc } from "@/components/admin/SingletonEditor";
import { readContent } from "@/lib/store";

export const metadata = { title: "Homepage" };

export default function HomepageAdmin() {
  return (
    <>
      <PageTitle title="Homepage" description="Every section on the homepage: words, buttons, icons, photos and videos, order and visibility." />
      <HomeEditor initial={readContent("home", { order: [], sections: {} })} media={readContent<MediaDoc>("media", { slots: {}, gallery: [] })} />
    </>
  );
}
