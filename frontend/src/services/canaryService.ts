import { api } from "./api";
import type { CanaryResult } from "../types/canary";

export async function getCanaryResults(): Promise<CanaryResult[]> {
  const data = await api.get<any[]>("/canary");
  return (data || []).map((d: any) => ({
    id: d.id,
    flagName: d.flagName,
    rows: (d.rows || []).map((r: any) => ({
      metric: r.metric,
      baseline: r.baseline,
      experimental: r.experimental,
      unit: r.unit || "",
      higherIsBetter: r.higherIsBetter ?? true,
    })),
    confidence: d.confidence ?? 0,
    statisticallySignificant: d.statisticallySignificant ?? false,
    decision: d.decision || "failed",
    analyzedAt: d.analyzedAt || new Date().toISOString(),
  }));
}
