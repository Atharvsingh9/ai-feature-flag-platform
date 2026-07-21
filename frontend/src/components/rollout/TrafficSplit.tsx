interface TrafficSplitProps {
  baseline: number;
  experimental: number;
}

export function TrafficSplit({ baseline, experimental }: TrafficSplitProps) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-pill bg-surface-bg">
        <div className="h-full bg-ink-300 transition-all duration-700" style={{ width: `${baseline}%` }} />
        <div className="h-full bg-primary transition-all duration-700" style={{ width: `${experimental}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <span className="flex items-center gap-1.5 text-ink-500">
          <span className="h-2 w-2 rounded-full bg-ink-300" /> Baseline {baseline}%
        </span>
        <span className="flex items-center gap-1.5 text-ink-500">
          <span className="h-2 w-2 rounded-full bg-primary" /> Experimental {experimental}%
        </span>
      </div>
    </div>
  );
}
