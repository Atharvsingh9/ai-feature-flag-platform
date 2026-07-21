export interface RollbackEvent {
  id: string;
  timestamp: string;
  flagName: string;
  trigger: string;
  qualityAtRollback: number;
  reason: string;
  slackNotified: boolean;
  status: "completed" | "in_progress" | "failed";
}
