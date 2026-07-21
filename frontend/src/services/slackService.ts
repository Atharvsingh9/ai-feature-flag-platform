import type { SlackNotification, SlackOverview } from "../types/slack";

export async function getSlackNotifications(): Promise<SlackNotification[]> {
  return [];
}

export async function getSlackOverview(): Promise<SlackOverview> {
  return { totalAlerts: 0, rollbackAlerts: 0, pausedRollouts: 0, warnings: 0 };
}
