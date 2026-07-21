export type FlagStatus = "active" | "rolling_out" | "paused" | "rolled_back" | "draft" | "completed";
export type RolloutStage = "1%" | "5%" | "25%" | "50%" | "100%";

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  status: FlagStatus;
  rolloutPercentage: number;
  currentStage: RolloutStage;
  qualityScore: number;
  qualityThreshold: number;
  shadowMode: boolean;
  createdAt: string;
  owner: string;
  baselineConfig: { model: string; prompt: string; temperature: number };
  experimentalConfig: { model: string; prompt: string; temperature: number };
  trafficSplit: { baseline: number; experimental: number };
  currentVariant: "baseline" | "experimental";
}

export interface FlagEvaluation {
  id: string;
  timestamp: string;
  variant: "baseline" | "experimental";
  qualityScore: number;
  latencyMs: number;
  outcome: "pass" | "fail";
}
