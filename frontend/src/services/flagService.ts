import { api } from "./api";
import type { FeatureFlag, FlagEvaluation } from "../types/flag";

export interface BackendFlag {
  id: string;
  name: string;
  description: string;
  baseline_variant: string;
  experimental_variant: string;
  quality_threshold: number;
  status: string;
  rollout_percentage: number;
  created_at: string;
  updated_at: string;
  shadow_enabled: boolean;
  shadow_sample_percentage: number;
}

export interface FlagCreatePayload {
  name: string;
  description: string;
  baseline_variant: string;
  experimental_variant: string;
  quality_threshold: number;
  shadow_enabled?: boolean;
  shadow_sample_percentage?: number;
}

export interface FlagUpdatePayload {
  name?: string;
  description?: string;
  baseline_variant?: string;
  experimental_variant?: string;
  quality_threshold?: number;
  shadow_enabled?: boolean;
  shadow_sample_percentage?: number;
}

export interface RolloutActionPayload {
  percentage?: number;
  actor: string;
  reason: string;
}

interface BackendEvent {
  id: number;
  flag_id: string;
  event_type: string;
  actor: string;
  reason: string;
  previous_percentage: number;
  new_percentage: number;
  created_at?: string;
}

function getStage(pct: number): FeatureFlag["currentStage"] {
  if (pct >= 100) return "100%";
  if (pct >= 50) return "50%";
  if (pct >= 25) return "25%";
  if (pct >= 5) return "5%";
  return "1%";
}

function mapFlag(b: BackendFlag): FeatureFlag {
  const pct = b.rollout_percentage;
  return {
    id: b.id,
    name: b.name,
    key: b.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    description: b.description,
    status: b.status.toLowerCase() as FeatureFlag["status"],
    rolloutPercentage: pct,
    currentStage: getStage(pct),
    qualityScore: 4.0,
    qualityThreshold: b.quality_threshold,
    shadowMode: b.shadow_enabled,
    createdAt: b.created_at,
    owner: "System",
    baselineConfig: { model: b.baseline_variant, prompt: "", temperature: 0.3 },
    experimentalConfig: { model: b.experimental_variant, prompt: "", temperature: 0.2 },
    trafficSplit: { baseline: 100 - pct, experimental: pct },
    currentVariant: pct > 50 ? "experimental" : "baseline",
  };
}

export async function getFlags(): Promise<FeatureFlag[]> {
  const data = await api.get<BackendFlag[]>("/flags");
  return (data || []).map(mapFlag);
}

export async function getFlagById(id: string): Promise<FeatureFlag | undefined> {
  const data = await api.get<BackendFlag>(`/flags/${id}`);
  return data ? mapFlag(data) : undefined;
}

export async function getEvaluations(id: string): Promise<FlagEvaluation[]> {
  const data = await api.get<BackendEvent[]>(`/flags/${id}/events`);
  return (data || []).map((ev) => ({
    id: `eval_${ev.id}`,
    timestamp: ev.created_at || new Date().toISOString(),
    variant: (ev.new_percentage > ev.previous_percentage ? "experimental" : "baseline") as "baseline" | "experimental",
    qualityScore: 4.0,
    latencyMs: 0,
    outcome: ev.event_type === "ROLLED_BACK" ? "fail" : "pass",
  }));
}

export async function createFlag(payload: FlagCreatePayload): Promise<FeatureFlag> {
  const data = await api.post<BackendFlag>("/flags", payload);
  return mapFlag(data);
}

export async function updateFlag(id: string, payload: FlagUpdatePayload): Promise<FeatureFlag> {
  const data = await api.patch<BackendFlag>(`/flags/${id}`, payload);
  return mapFlag(data);
}

export async function deleteFlag(id: string): Promise<void> {
  await api.delete<void>(`/flags/${id}`);
}

export async function startRollout(id: string, payload: RolloutActionPayload): Promise<FeatureFlag> {
  const data = await api.post<BackendFlag>(`/flags/${id}/rollout`, payload);
  return mapFlag(data);
}

export async function pauseRollout(id: string, payload: Omit<RolloutActionPayload, "percentage">): Promise<FeatureFlag> {
  const data = await api.post<BackendFlag>(`/flags/${id}/pause`, payload);
  return mapFlag(data);
}

export async function resumeRollout(id: string, payload: Omit<RolloutActionPayload, "percentage">): Promise<FeatureFlag> {
  const data = await api.post<BackendFlag>(`/flags/${id}/resume`, payload);
  return mapFlag(data);
}

export async function rollbackFlag(id: string, payload: Omit<RolloutActionPayload, "percentage">): Promise<FeatureFlag> {
  const data = await api.post<BackendFlag>(`/flags/${id}/rollback`, payload);
  return mapFlag(data);
}
