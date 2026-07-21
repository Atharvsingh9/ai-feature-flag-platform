import { cn } from "../../utils/cn";

interface SkeletonProps {
  className?: string;
  lines?: number;
  width?: string;
  height?: string;
}

export function Skeleton({ className, lines, width, height }: SkeletonProps) {
  if (lines) {
    return (
      <div className="space-y-2" role="status" aria-label="Loading">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 animate-shimmer rounded-lg bg-gradient-to-r from-surface-bg via-ink-300/10 to-surface-bg bg-[length:200%_100%]"
            style={{ width: width ?? `${80 + Math.random() * 20}%` }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-shimmer rounded-lg bg-gradient-to-r from-surface-bg via-ink-300/10 to-surface-bg bg-[length:200%_100%]",
        className
      )}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-5" role="status" aria-label="Loading card">
      <Skeleton className="mb-3 h-10 w-10 rounded-xl2" />
      <Skeleton className="mb-1 h-6 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Loading table">
      <div className="mb-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="mb-3 flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div role="status" aria-label="Loading chart" style={{ height }} className="flex items-center justify-center rounded-xl bg-surface-bg">
      <Skeleton className="h-4 w-24" />
    </div>
  );
}
