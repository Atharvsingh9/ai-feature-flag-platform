import { TrendIndicator } from "./TrendIndicator";

interface JudgeScoreCardProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  delta?: string;
  goodIsUp?: boolean;
}

export function JudgeScoreCard({ label, value, trend, delta, goodIsUp = true }: JudgeScoreCardProps) {
  return (
    <div className="card p-4">
      <p className="text-xs text-ink-500">{label}</p>
      <div className="mt-1.5 flex items-end justify-between">
        <p className="font-display text-xl font-semibold text-ink-900">{value}</p>
        {trend && delta && <TrendIndicator trend={trend} delta={delta} goodIsUp={goodIsUp} />}
      </div>
    </div>
  );
}
