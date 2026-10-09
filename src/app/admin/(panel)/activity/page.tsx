import { PageTitle } from "@/components/admin/Shell";
import { readAudit } from "@/lib/store";

export const metadata = { title: "Activity log" };

export default function Activity() {
  const log = readAudit();
  return (
    <>
      <PageTitle title="Activity log" description="Every change made in the admin: who, what and when (last 1,000 entries)." />
      <div className="a-card overflow-hidden">
        <table className="a-table w-full">
          <thead><tr><th>When</th><th>Who</th><th>What</th><th>Where</th></tr></thead>
          <tbody>
            {log.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-ink-soft">No changes yet.</td></tr>}
            {log.map((a, i) => (
              <tr key={i}>
                <td className="whitespace-nowrap text-[0.8rem] text-ink-soft">{new Date(a.at).toLocaleString("en-IN")}</td>
                <td className="text-[0.86rem] text-ink">{a.user}</td>
                <td className="text-[0.86rem] capitalize text-ink">{a.action.replace(/-/g, " ")}{a.summary ? <span className="normal-case text-ink-soft"> · {a.summary}</span> : null}</td>
                <td className="font-mono text-[0.76rem] text-ink-soft">{a.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
