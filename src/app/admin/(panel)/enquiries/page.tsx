import { PageTitle } from "@/components/admin/Shell";
import { EnquiriesManager } from "@/components/admin/PeopleManagers";
import { readContent } from "@/lib/store";

export const metadata = { title: "Enquiries" };

export default function EnquiriesAdmin() {
  return (
    <>
      <PageTitle title="Enquiries" description="Messages sent from the contact form." />
      <EnquiriesManager initial={readContent("enquiries", [])} />
    </>
  );
}
