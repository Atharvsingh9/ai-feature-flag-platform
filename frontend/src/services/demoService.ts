import { api } from "./api";

export interface DemoGenerateRequest {
  goal: string;
  userId?: string;
}

export interface DemoGenerateResponse {
  subject: string;
  body: string;
  metadata: {
    flagName: string;
    flagStatus: string;
    variant: string;
    rolloutPercentage: number;
    promptVersion: string;
    qualityScore: number;
    judgeScore: number;
    latencyMs: number;
    model: string;
  };
}

export interface DemoStatusResponse {
  initialized: boolean;
  flagName: string;
  status: string;
  rolloutPercentage: number;
  currentVariant: string;
  totalEvaluations: number;
  averageQuality: number;
  flagId?: string;
}

export interface DemoResetResponse {
  status: string;
  message: string;
}

export async function demoGenerate(goal: string): Promise<DemoGenerateResponse> {
  return api.post<DemoGenerateResponse>("/demo/generate", { goal });
}

export async function demoBadGenerate(goal: string): Promise<DemoGenerateResponse> {
  return api.post<DemoGenerateResponse>("/demo/bad-generate", { goal });
}

export async function demoStatus(): Promise<DemoStatusResponse> {
  return api.get<DemoStatusResponse>("/demo/status");
}

export async function demoReset(): Promise<DemoResetResponse> {
  return api.post<DemoResetResponse>("/demo/reset");
}
