import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { calculateTrendColor } from "../../utils/formatters";

interface TrendIndicatorProps {
  trend: "up" | "down" | "flat";
  delta: string;
  goodIsUp?: boolean;
}

export function TrendIndicator({ trend, delta, goodIsUp = true }: TrendIndicatorProps) {
  const color = calculateTrendColor(trend, goodIsUp);
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {delta}
    </span>
  );
}
