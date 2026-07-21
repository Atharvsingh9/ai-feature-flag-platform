import type { RollbackEvent } from "../../types/rollback";
import { formatDateTime } from "../../utils/formatters";
import { Badge } from "../common/Badge";

export function RollbackTable({ events }: { events: RollbackEvent[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-300/20 text-xs uppercase tracking-wide text-ink-500">
              <th className="px-5 py-3.5 font-medium">Time</th>
              <th className="px-5 py-3.5 font-medium">Feature Flag</th>
              <th className="px-5 py-3.5 font-medium">Trigger</th>
              <th className="px-5 py-3.5 font-medium">Quality</th>
              <th className="px-5 py-3.5 font-medium">Slack</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-ink-300/10 last:border-0 hover:bg-surface-bg">
                <td className="px-5 py-3.5 text-ink-500">{formatDateTime(event.timestamp)}</td>
                <td className="px-5 py-3.5 font-medium text-ink-900">{event.flagName}</td>
                <td className="px-5 py-3.5 text-ink-700">{event.trigger}</td>
                <td className="px-5 py-3.5 text-error">{event.qualityAtRollback}</td>
                <td className="px-5 py-3.5 text-ink-500">{event.slackNotified ? "Sent" : "—"}</td>
                <td className="px-5 py-3.5">
                  <Badge status={event.status === "completed" ? "completed" : "paused"} label={event.status.replace("_", " ")} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
