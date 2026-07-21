export type SlackSeverity = "critical" | "warning" | "info";

export interface SlackNotification {
  id: string;
  timestamp: string;
  flagName: string;
  severity: SlackSeverity;
  message: string;
  delivered: boolean;
  channel: string;
  deliveryTimeMs: number;
  jsonPayload: Record<string, unknown>;
  reason: string;
  threshold: string;
  currentMetrics: string;
  action: "rollback" | "pause" | "alert" | "canary_passed" | "canary_failed" | "stage_advanced" | "shadow_completed";
}

export interface SlackOverview {
  totalAlerts: number;
  rollbackAlerts: number;
  pausedRollouts: number;
  warnings: number;
}
