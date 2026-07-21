export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPercentage(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function formatLatency(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

export function calculateTrendColor(trend: "up" | "down" | "flat", goodIsUp = true): string {
  if (trend === "flat") return "text-ink-500";
  const isGood = goodIsUp ? trend === "up" : trend === "down";
  return isGood ? "text-success" : "text-error";
}
