export interface QualityPoint {
  timestamp: string;
  quality: number;
  judgeScore: number;
  latencyMs: number;
  errorRate: number;
  userFeedback: number;
}

export interface QualitySummary {
  average: number;
  judgeScore: number;
  latencyMs: number;
  p10: number;
  stdDev: number;
  errorRate: number;
  trend: "up" | "down" | "flat";
  trendDelta: number;
}
