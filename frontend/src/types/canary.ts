export interface MetricComparisonRow {
  metric: string;
  baseline: number;
  experimental: number;
  unit: string;
  higherIsBetter: boolean;
}

export interface CanaryResult {
  id: string;
  flagName: string;
  rows: MetricComparisonRow[];
  confidence: number;
  statisticallySignificant: boolean;
  decision: "passed" | "failed";
  analyzedAt: string;
}
