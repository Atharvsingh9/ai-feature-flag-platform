import { motion } from "framer-motion";
import { RotateCcw, MessageSquareWarning } from "lucide-react";
import type { RollbackEvent } from "../../types/rollback";
import { formatDateTime } from "../../utils/formatters";
import { Badge } from "../common/Badge";

export function RollbackTimeline({ events }: { events: RollbackEvent[] }) {
  return (
    <div className="relative pl-6">
      <div className="absolute bottom-2 left-[9px] top-2 w-px bg-ink-300/25" />
      <div className="space-y-6">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative"
          >
            <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error-50 text-error ring-4 ring-surface-bg">
              <RotateCcw className="h-3 w-3" />
            </div>
            <div className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold text-ink-900">{event.flagName}</p>
                <Badge status={event.status === "completed" ? "completed" : "paused"} label={event.status.replace("_", " ")} />
              </div>
              <p className="mt-1 text-xs text-ink-500">{formatDateTime(event.timestamp)}</p>
              <p className="mt-2 text-sm text-ink-700">{event.trigger}</p>
              <p className="mt-1 text-xs text-ink-500">{event.reason}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-ink-500">
                <span>
                  Quality at rollback: <span className="font-medium text-error">{event.qualityAtRollback}</span>
                </span>
                {event.slackNotified && (
                  <span className="flex items-center gap-1 text-primary">
                    <MessageSquareWarning className="h-3.5 w-3.5" /> Slack notified
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
