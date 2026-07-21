import { useApiData } from "./useApiData";
import { getQualitySeries } from "../services/qualityService";
import type { QualityPoint, QualitySummary } from "../types/quality";
import { useMemo } from "react";

function computeSummary(series: QualityPoint[]): QualitySummary {
  if (!series.length) return { average: 0, judgeScore: 0, latencyMs: 0, p10: 0, stdDev: 0, errorRate: 0, trend: "flat", trendDelta: 0 };
  const avg = series.reduce((a, p) => a + p.quality, 0) / series.length;
  const judge = series.reduce((a, p) => a + p.judgeScore, 0) / series.length;
  const lat = series.reduce((a, p) => a + p.latencyMs, 0) / series.length;
  const sorted = [...series].map((p) => p.quality).sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)];
  const variance = series.reduce((a, p) => a + (p.quality - avg) ** 2, 0) / series.length;
  const errRate = series.reduce((a, p) => a + p.errorRate, 0) / series.length;
  const first = series[0].quality;
  const last = series[series.length - 1].quality;
  return {
    average: +avg.toFixed(2),
    judgeScore: +judge.toFixed(2),
    latencyMs: Math.round(lat),
    p10: +p10.toFixed(2),
    stdDev: +Math.sqrt(variance).toFixed(2),
    errorRate: +errRate.toFixed(2),
    trend: last > first ? "up" : last < first ? "down" : "flat",
    trendDelta: +(last - first).toFixed(2),
  };
}

export function useQuality(days = 14) {
  const { data, loading, error, refetch } = useApiData<QualityPoint[]>(
    () => getQualitySeries(days),
    [days]
  );

  const series = data || [];
  const summary = useMemo(() => computeSummary(series), [series]);

  return { series, summary, loading, error, refetch };
}
