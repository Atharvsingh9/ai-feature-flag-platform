export interface ShadowTest {
  id: string;
  flagId: string;
  flagName: string;
  baselineVariant: string;
  experimentalVariant: string;
  mirroredRequests: number;
  qualityScore: number;
  latencyMs: number;
  errors: number;
  status: "running" | "completed" | "failed" | "paused";
  startedAt: string;
  baselinePrompt: string;
  experimentalPrompt: string;
  shadowOutput: string;
  judgeScore: number;
  feedback: string;
  differenceAnalysis: string;
}

export interface ShadowOverview {
  activeTests: number;
  mirroredRequests: number;
  averageQuality: number;
  averageLatency: number;
  errorRate: number;
  totalRequests: number;
}

export interface ShadowQualityPoint {
  timestamp: string;
  quality: number;
  requests: number;
  latencyMs: number;
}
