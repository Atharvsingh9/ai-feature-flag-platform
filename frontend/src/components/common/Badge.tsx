import { memo } from "react";
import { cn } from "../../utils/cn";
import { STATUS_COLORS } from "../../utils/constants";

interface BadgeProps {
  status: keyof typeof STATUS_COLORS | string;
  label?: string;
  pulse?: boolean;
}

const LABELS: Record<string, string> = {
  active: "Active",
  rolling_out: "Rolling Out",
  paused: "Paused",
  rolled_back: "Rolled back",
  draft: "Draft",
  completed: "Completed",
};

export const Badge = memo(function Badge({ status, label, pulse }: BadgeProps) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium",
        colors.bg,
        colors.text
      )}
      role="status"
      aria-label={label ?? LABELS[status] ?? status}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot, pulse && "animate-pulseRing")} aria-hidden="true" />
      {label ?? LABELS[status] ?? status}
    </span>
  );
});
