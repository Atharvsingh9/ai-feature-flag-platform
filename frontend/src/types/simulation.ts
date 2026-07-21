export type SimulationPhase = "idle" | "running" | "paused" | "degrading" | "rollback" | "completed";

export interface SimulationState {
  phase: SimulationPhase;
  currentStage: number;
  trafficPercentage: number;
  qualityScore: number;
  errorRate: number;
  latencyMs: number;
  elapsedSeconds: number;
  stageDurations: number[];
}

export interface SimulationEvent {
  id: string;
  time: number;
  type: "stage_advance" | "quality_update" | "canary_update" | "rollback" | "notification" | "slack";
  message: string;
  detail: string;
}

export interface SpeedOption {
  label: string;
  multiplier: number;
}
