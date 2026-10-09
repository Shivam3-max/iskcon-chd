import Shell from "@/components/admin/Shell";
import { requirePage } from "@/lib/admin/auth";
import { READ_ONLY, readContent } from "@/lib/store";

export default async function Panel({ children }: { children: React.ReactNode }) {
  const user = await requirePage();
  const pending = readContent<{ status: string }[]>("donations", []).filter((d) => d.status === "pending").length;
  const enquiries = readContent<{ status: string }[]>("enquiries", []).filter((e) => e.status === "new").length;
  return <Shell user={user} badges={{ pending, enquiries }} readOnly={READ_ONLY}>{children}</Shell>;
}
