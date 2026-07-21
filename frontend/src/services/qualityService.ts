import { api } from "./api";
import type { QualityPoint, QualitySummary } from "../types/quality";

export async function getQualitySeries(days = 14): Promise<QualityPoint[]> {
  const data = await api.get<any[]>(`/quality/series?days=${days}`);
  return (data || []).map((d: any) => ({
    timestamp: d.timestamp,
    quality: d.quality,
    judgeScore: d.judgeScore,
    latencyMs: d.latencyMs,
    errorRate: d.errorRate,
    userFeedback: d.userFeedback || 85,
  }));
}

export async function getQualitySummaryData(days = 14): Promise<QualitySummary> {
  const data = await api.get<any>(`/quality/summary?days=${days}`);
  return data || { average: 0, judgeScore: 0, latencyMs: 0, p10: 0, stdDev: 0, errorRate: 0, trend: "flat", trendDelta: 0 };
}
