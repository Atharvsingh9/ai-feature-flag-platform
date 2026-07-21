export type ServiceStatus = "operational" | "degraded" | "down";

export interface ServiceHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  latencyMs: number;
  cpuPercent: number;
  memoryMb: number;
  requestsPerMin: number;
  failuresPerMin: number;
  uptimePercent: number;
  history: { time: string; status: ServiceStatus }[];
}

export interface SystemHealthOverview {
  services: ServiceHealth[];
  overallStatus: ServiceStatus;
  totalServices: number;
  operationalCount: number;
  degradedCount: number;
  downCount: number;
}
