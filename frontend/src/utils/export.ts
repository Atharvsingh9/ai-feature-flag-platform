import type { QualityPoint } from "../types/quality";
import type { RollbackEvent } from "../types/rollback";
import type { SlackNotification } from "../types/slack";

function dateStr() {
  return new Date().toISOString().split("T")[0];
}

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: Record<string, unknown>[]
) {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val == null) return "";
        const str = String(val);
        return str.includes(",") || str.includes('"') || str.includes("\n")
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${dateStr()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${dateStr()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportQualityReport(series: QualityPoint[], filename = "quality-report") {
  const headers = ["Date", "Quality", "Judge Score", "Latency (ms)", "Error Rate (%)", "User Feedback"];
  const rows = series.map((p) => ({
    Date: new Date(p.timestamp).toLocaleDateString(),
    Quality: p.quality,
    "Judge Score": p.judgeScore,
    "Latency (ms)": p.latencyMs,
    "Error Rate (%)": p.errorRate,
    "User Feedback": p.userFeedback,
  }));
  exportToCsv(filename, headers, rows);
}

export function exportRolloutHistory(events: RollbackEvent[], filename = "rollout-history") {
  const headers = ["Date", "Flag", "Trigger", "Quality At Rollback", "Reason", "Status"];
  const rows = events.map((e) => ({
    Date: new Date(e.timestamp).toLocaleDateString(),
    Flag: e.flagName,
    Trigger: e.trigger,
    "Quality At Rollback": e.qualityAtRollback,
    Reason: e.reason,
    Status: e.status,
  }));
  exportToCsv(filename, headers, rows);
}

export function exportSlackNotifications(notifications: SlackNotification[], filename = "slack-notifications") {
  const headers = ["Time", "Flag", "Severity", "Message", "Action", "Delivered", "Channel"];
  const rows = notifications.map((n) => ({
    Time: new Date(n.timestamp).toLocaleString(),
    Flag: n.flagName,
    Severity: n.severity,
    Message: n.message,
    Action: n.action,
    Delivered: n.delivered ? "Yes" : "No",
    Channel: n.channel,
  }));
  exportToCsv(filename, headers, rows);
}
