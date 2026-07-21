import { cn } from "../../utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  colorClass?: string;
  trackClass?: string;
  height?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  colorClass = "bg-primary",
  trackClass = "bg-primary-50",
  height = "h-2",
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full">
      <div className={cn("w-full overflow-hidden rounded-pill", height, trackClass)}>
        <div
          className={cn("h-full rounded-pill transition-all duration-700 ease-out", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <div className="mt-1 text-xs text-ink-500">{pct.toFixed(0)}%</div>}
    </div>
  );
}
