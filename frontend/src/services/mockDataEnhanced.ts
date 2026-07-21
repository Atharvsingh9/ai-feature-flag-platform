import type { ShadowTest, ShadowQualityPoint, ShadowOverview } from "../types/shadow";
import type { SlackNotification, SlackOverview } from "../types/slack";
import type { ServiceHealth } from "../types/health";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const FLAG_NAMES = [
  "Email Generator v2",
  "Smart Summarizer",
  "Code Review Assistant",
  "Support Reply Drafting",
  "Product Copy Rewriter",
  "Meeting Notes Extractor",
  "Sentiment Classifier",
  "Onboarding Chat Agent",
  "Invoice Parser",
  "Doc Search Reranker",
  "Ticket Triage Router",
  "Sales Email Personalizer",
];

export const SHADOW_TESTS: ShadowTest[] = FLAG_NAMES.filter((_, i) => i % 2 === 0).map((name, i) => {
  const rnd = seededRandom(i + 200);
  const statuses: ShadowTest["status"][] = ["running", "running", "completed", "completed", "failed", "paused"];
  return {
    id: `shadow_${i + 1}`,
    flagId: `flag_${i * 2 + 1}`,
    flagName: name,
    baselineVariant: "gpt-baseline-v1",
    experimentalVariant: "gpt-candidate-v2",
    mirroredRequests: Math.round(5000 + rnd() * 45000),
    qualityScore: +(3.8 + rnd() * 1.1).toFixed(2),
    latencyMs: Math.round(180 + rnd() * 340),
    errors: rnd() > 0.7 ? Math.round(rnd() * 15) : 0,
    status: statuses[Math.floor(rnd() * statuses.length)],
    startedAt: new Date(Date.now() - Math.floor(rnd() * 14) * 86400000).toISOString(),
    baselinePrompt: "Summarize the following meeting transcript into key action items, decisions, and unresolved discussions.",
    experimentalPrompt: "Extract structured action items, decisions, and discussion points from the meeting transcript with timestamps and assignees.",
    shadowOutput: "The shadow evaluation returned high alignment with baseline responses. Quality score: 4.5/5.0. Minor differences in verbosity.",
    judgeScore: +(4.0 + rnd() * 0.8).toFixed(2),
    feedback: rnd() > 0.5 ? "Experimental variant shows improved structure and clarity." : "Both variants perform similarly for this input.",
    differenceAnalysis: rnd() > 0.5
      ? "The experimental variant provides more structured output with clear categorization. Baseline is more narrative. For this use case, structured format is preferred."
      : "Minimal difference detected. Both variants produce semantically equivalent outputs with similar quality scores.",
  };
});

export function getShadowOverview(): ShadowOverview {
  const active = SHADOW_TESTS.filter((t) => t.status === "running").length;
  const totalRequests = SHADOW_TESTS.reduce((a, t) => a + t.mirroredRequests, 0);
  const avgQuality = SHADOW_TESTS.reduce((a, t) => a + t.qualityScore, 0) / SHADOW_TESTS.length;
  const avgLatency = SHADOW_TESTS.reduce((a, t) => a + t.latencyMs, 0) / SHADOW_TESTS.length;
  const totalErrors = SHADOW_TESTS.reduce((a, t) => a + t.errors, 0);
  const totalMirrored = SHADOW_TESTS.reduce((a, t) => a + t.mirroredRequests, 0);
  return {
    activeTests: active,
    mirroredRequests: totalRequests,
    averageQuality: +avgQuality.toFixed(2),
    averageLatency: Math.round(avgLatency),
    errorRate: totalMirrored > 0 ? +((totalErrors / totalMirrored) * 100).toFixed(2) : 0,
    totalRequests: totalMirrored,
  };
}

export function makeShadowQualitySeries(): ShadowQualityPoint[] {
  const rnd = seededRandom(333);
  return Array.from({ length: 14 }).map((_, i) => ({
    timestamp: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
    quality: +(4.0 + Math.sin(i / 3) * 0.3 + (rnd() - 0.5) * 0.2).toFixed(2),
    requests: Math.round(800 + rnd() * 2400),
    latencyMs: Math.round(280 + rnd() * 220),
  }));
}

const SEVERITIES: SlackNotification["severity"][] = ["critical", "warning", "info"];
const ACTIONS: SlackNotification["action"][] = [
  "rollback", "pause", "alert", "canary_passed", "canary_failed", "stage_advanced", "shadow_completed",
];
const CHANNELS = ["#ai-platform-alerts", "#rollouts", "#canary-reports", "#shadow-eval", "#quality-monitor"];

export const SLACK_NOTIFICATIONS: SlackNotification[] = Array.from({ length: 20 }).map((_, i) => {
  const rnd = seededRandom(i + 400);
  const flag = FLAG_NAMES[Math.floor(rnd() * FLAG_NAMES.length)];
  const severity = SEVERITIES[Math.floor(rnd() * SEVERITIES.length)];
  const action = ACTIONS[Math.floor(rnd() * ACTIONS.length)];
  const severityWeights = { critical: 0.15, warning: 0.35, info: 0.5 };
  const weightedSeverity = rnd() < severityWeights[severity] ? severity : "info";
  return {
    id: `slack_${i + 1}`,
    timestamp: new Date(Date.now() - i * 3600_000 * (0.5 + rnd())).toISOString(),
    flagName: flag,
    severity: weightedSeverity as SlackNotification["severity"],
    message: getSlackMessage(action, flag),
    delivered: rnd() > 0.05,
    channel: CHANNELS[Math.floor(rnd() * CHANNELS.length)],
    deliveryTimeMs: Math.round(200 + rnd() * 1800),
    jsonPayload: {
      flag,
      action,
      severity: weightedSeverity,
      timestamp: new Date().toISOString(),
    },
    reason: getReason(action),
    threshold: getThreshold(action),
    currentMetrics: getCurrentMetrics(action, rnd),
    action,
  };
});

function getSlackMessage(action: SlackNotification["action"], flag: string): string {
  const messages: Record<string, string> = {
    rollback: `🚨 Rollback triggered for ${flag} — quality score dropped below threshold`,
    pause: `⏸️ Rollout paused for ${flag} — investigating quality regression`,
    alert: `⚠️ Alert: ${flag} quality score at risk — monitoring closely`,
    canary_passed: `✅ Canary passed for ${flag} — advancing to next stage`,
    canary_failed: `❌ Canary failed for ${flag} — rollout halted`,
    stage_advanced: `📈 ${flag} advanced to next rollout stage — traffic increased`,
    shadow_completed: `🧪 Shadow evaluation completed for ${flag} — review results`,
  };
  return messages[action];
}

function getReason(action: SlackNotification["action"]): string {
  const reasons: Record<string, string> = {
    rollback: "Quality score fell below threshold (3.5) for 3 consecutive evaluations",
    pause: "Error rate increased by 200% in the last 5 minutes",
    alert: "P10 quality score approaching minimum threshold",
    canary_passed: "All metric comparisons passed with statistical significance",
    canary_failed: "Experimental variant shows regression in 2 of 5 metrics",
    stage_advanced: "Rollout conditions met for next traffic percentage",
    shadow_completed: "Shadow evaluation finished with sufficient sample size",
  };
  return reasons[action];
}

function getThreshold(action: SlackNotification["action"]): string {
  const thresholds: Record<string, string> = {
    rollback: "Min quality: 3.5 | P10: 3.0",
    pause: "Max error rate: 2.5%",
    alert: "P10 threshold: 3.2",
    canary_passed: "Confidence: >90% | Effect size: <0.2",
    canary_failed: "Confidence: >95% | Effect size: >0.3",
    stage_advanced: "Quality: >4.0 | Duration: >24h",
    shadow_completed: "Sample size: >1000 | Duration: >48h",
  };
  return thresholds[action];
}

function getCurrentMetrics(_action: SlackNotification["action"], rnd: () => number): string {
  return `Quality: ${(3.2 + rnd() * 1.5).toFixed(2)} | Latency: ${Math.round(200 + rnd() * 400)}ms | Errors: ${(rnd() * 3).toFixed(1)}%`;
}

export function getSlackOverview(): SlackOverview {
  return {
    totalAlerts: SLACK_NOTIFICATIONS.length,
    rollbackAlerts: SLACK_NOTIFICATIONS.filter((n) => n.action === "rollback").length,
    pausedRollouts: SLACK_NOTIFICATIONS.filter((n) => n.action === "pause").length,
    warnings: SLACK_NOTIFICATIONS.filter((n) => n.severity === "warning").length,
  };
}

const SERVICE_NAMES = [
  "Redis Cache",
  "PostgreSQL",
  "Quality Worker",
  "Rollout Scheduler",
  "Slack Notifier",
  "Flag Service",
  "Judge Service",
  "API Gateway",
  "Shadow Runner",
  "Rollback Monitor",
];

export const SYSTEM_HEALTH: ServiceHealth[] = SERVICE_NAMES.map((name, i) => {
  const rnd = seededRandom(i + 600);
  const statuses: ServiceHealth["status"][] = ["operational", "operational", "operational", "degraded", "operational"];
  const status = statuses[Math.floor(rnd() * statuses.length)];
  const h: ServiceHealth["history"] = Array.from({ length: 24 }).map((_, j) => ({
    time: new Date(Date.now() - (23 - j) * 3600_000).toISOString(),
    status: (j > 18 && status === "degraded" ? "degraded" : "operational") as ServiceHealth["status"],
  }));
  return {
    id: `svc_${i + 1}`,
    name,
    status,
    latencyMs: Math.round(status === "degraded" ? 200 + rnd() * 600 : 20 + rnd() * 120),
    cpuPercent: +(20 + rnd() * 60).toFixed(1),
    memoryMb: Math.round(128 + rnd() * 768),
    requestsPerMin: Math.round(100 + rnd() * 2900),
    failuresPerMin: Math.round(rnd() * (status === "degraded" ? 15 : 3)),
    uptimePercent: +(status === "degraded" ? 97 + rnd() * 2.5 : 99.5 + rnd() * 0.49).toFixed(2),
    history: h,
  };
});
