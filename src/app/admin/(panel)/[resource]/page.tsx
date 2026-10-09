import { notFound } from "next/navigation";
import { PageTitle } from "@/components/admin/Shell";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { SingletonEditor, type MediaDoc } from "@/components/admin/SingletonEditor";
import { requirePage } from "@/lib/admin/auth";
import { resource } from "@/lib/admin/schema";
import { readContent } from "@/lib/store";

export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource: name } = await params;
  const r = resource(name);
  if (!r) notFound();
  await requirePage(r.role);
  const hasSlots = r.groups?.some((g) => g.slots?.length);
  return (
    <>
      <PageTitle title={r.title} description={r.description} />
      {r.kind === "collection" ? (
        <CollectionManager name={name} initial={readContent<Record<string, unknown>[]>(name, [])} />
      ) : (
        <SingletonEditor name={name} initial={readContent<Record<string, unknown>>(name, {})} media={hasSlots ? readContent<MediaDoc>("media", { slots: {}, gallery: [] }) : undefined} />
      )}
    </>
  );
}
