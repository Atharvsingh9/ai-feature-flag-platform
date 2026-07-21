import { api } from "./api";
import type { RollbackEvent } from "../types/rollback";

export async function getRollbackEvents(): Promise<RollbackEvent[]> {
  const data = await api.get<any[]>("/rollbacks");
  return (data || []).map((d: any) => ({
    id: d.id,
    timestamp: d.timestamp || new Date().toISOString(),
    flagName: d.flagName || "Unknown",
    trigger: d.trigger || "",
    qualityAtRollback: d.qualityAtRollback ?? 0,
    reason: d.reason || "",
    slackNotified: d.slackNotified ?? false,
    status: d.status || "completed",
  }));
}
