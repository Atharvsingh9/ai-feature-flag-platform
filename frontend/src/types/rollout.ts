import type { RolloutStage } from "./flag";

export interface RolloutEvent {
  id: string;
  flagId: string;
  flagName: string;
  stages: RolloutStage[];
  currentStageIndex: number;
  trafficPercentage: number;
  startedAt: string;
  estimatedCompletion: string;
  remainingMinutes: number;
  qualityStatus: "healthy" | "at_risk" | "failing";
  autoAdvance: boolean;
  progress: number;
}
