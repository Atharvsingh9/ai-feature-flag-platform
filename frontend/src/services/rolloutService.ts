import { api } from "./api";
import type { RolloutEvent } from "../types/rollout";

export async function getRollouts(): Promise<RolloutEvent[]> {
  const data = await api.get<any[]>("/rollouts");
  return (data || []).map((d: any) => ({
    id: d.id,
    flagId: d.flagId,
    flagName: d.flagName,
    stages: d.stages || [],
    currentStageIndex: d.currentStageIndex ?? 0,
    trafficPercentage: d.trafficPercentage ?? 0,
    startedAt: d.startedAt || new Date().toISOString(),
    estimatedCompletion: d.estimatedCompletion || "",
    remainingMinutes: d.remainingMinutes ?? 0,
    qualityStatus: d.qualityStatus || "healthy",
    autoAdvance: d.autoAdvance ?? true,
    progress: d.progress ?? 0,
  }));
}
