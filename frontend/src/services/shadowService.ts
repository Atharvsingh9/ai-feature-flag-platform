import { api } from "./api";
import type { ShadowTest, ShadowOverview, ShadowQualityPoint } from "../types/shadow";

export async function getShadowTests(): Promise<ShadowTest[]> {
  const data = await api.get<any[]>("/shadow/tests");
  return (data || []).map((d: any) => ({
    id: d.id,
    flagId: d.flagId,
    flagName: d.flagName,
    baselineVariant: d.baselineVariant || "baseline",
    experimentalVariant: d.experimentalVariant || "experimental",
    mirroredRequests: d.mirroredRequests || 0,
    qualityScore: d.qualityScore || d.judgeScore || 0,
    latencyMs: d.latencyMs || 0,
    errors: d.errors || 0,
    status: d.status || "completed",
    startedAt: d.startedAt || new Date().toISOString(),
    baselinePrompt: d.baselinePrompt || "",
    experimentalPrompt: d.experimentalPrompt || "",
    shadowOutput: d.shadowOutput || "",
    judgeScore: d.judgeScore || 0,
    feedback: d.feedback || "",
    differenceAnalysis: d.differenceAnalysis || "",
  }));
}

export async function getShadowOverview(): Promise<ShadowOverview> {
  const data = await api.get<any>("/shadow/overview");
  return data || { activeTests: 0, mirroredRequests: 0, averageQuality: 0, averageLatency: 0, errorRate: 0, totalRequests: 0 };
}

export async function getShadowQualitySeries(): Promise<ShadowQualityPoint[]> {
  const data = await api.get<any[]>("/shadow/quality-series");
  return (data || []).map((d: any) => ({
    timestamp: d.timestamp,
    quality: d.quality,
    requests: d.requests,
    latencyMs: d.latencyMs,
  }));
}
