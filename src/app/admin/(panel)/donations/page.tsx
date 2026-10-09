import { PageTitle } from "@/components/admin/Shell";
import { DonationsManager } from "@/components/admin/DonationsManager";
import type { Campaign, Donation, Seva } from "@/lib/content";
import { readContent } from "@/lib/store";

export const metadata = { title: "Donations" };

export default async function DonationsAdmin({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const donations = readContent<Donation[]>("donations", []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const targets = [
    ...readContent<Campaign[]>("campaigns", []).map((c) => ({ slug: c.slug, title: c.title })),
    ...readContent<Seva[]>("sevas", []).map((s) => ({ slug: s.slug, title: s.title })),
  ];
  return (
    <>
      <PageTitle title="Donations" description="Every offering made on the website, plus gifts recorded at the temple. 80G details are included in the export." />
      <DonationsManager initial={donations} targets={targets} initialStatus={status} />
    </>
  );
}
