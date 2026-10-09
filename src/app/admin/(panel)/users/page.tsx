import { PageTitle } from "@/components/admin/Shell";
import { UsersManager } from "@/components/admin/PeopleManagers";
import { listUsers, requirePage } from "@/lib/admin/auth";

export const metadata = { title: "Admin users" };

export default async function UsersAdmin() {
  const me = await requirePage();
  const users = listUsers();
  return (
    <>
      <PageTitle title="Admin users" description="Who can sign in to this admin, and what they can change." />
      <UsersManager initial={me.role === "super" ? users : users.filter((u) => u.id === me.id)} me={me} />
    </>
  );
}
