import type { FeatureFlag, FlagEvaluation } from "../types/flag";
import type { RolloutEvent } from "../types/rollout";
import type { QualityPoint, QualitySummary } from "../types/quality";
import type { CanaryResult } from "../types/canary";
import type { RollbackEvent } from "../types/rollback";

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

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const FEATURE_FLAGS: FeatureFlag[] = FLAG_NAMES.map((name, i) => {
  const rnd = seededRandom(i + 1);
  const statuses: FeatureFlag["status"][] = ["active", "active", "active", "paused", "rolled_back", "draft", "completed"];
  const stages: FeatureFlag["currentStage"][] = ["1%", "5%", "25%", "50%", "100%"];
  const status = statuses[Math.floor(rnd() * statuses.length)];
  const stageIdx = Math.floor(rnd() * stages.length);
  const rollout = [1, 5, 25, 50, 100][stageIdx];
  return {
    id: `flag_${i + 1}`,
    name,
    key: name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    description: `Gradual rollout for the ${name.toLowerCase()} feature, gated by live quality checks.`,
    status,
    rolloutPercentage: status === "draft" ? 0 : rollout,
    currentStage: stages[stageIdx],
    qualityScore: +(3.6 + rnd() * 1.3).toFixed(2),
    qualityThreshold: 4.0,
    shadowMode: rnd() > 0.6,
    createdAt: new Date(Date.now() - Math.floor(rnd() * 60) * 86400000).toISOString(),
    owner: ["A. Chen", "M. Torres", "S. Patel", "J. Okafor", "L. Novak"][Math.floor(rnd() * 5)],
    baselineConfig: { model: "gpt-baseline-v1", prompt: "You are a helpful assistant...", temperature: 0.3 },
    experimentalConfig: { model: "gpt-candidate-v2", prompt: "You are a precise, concise assistant...", temperature: 0.2 },
    trafficSplit: { baseline: 100 - rollout, experimental: rollout },
    currentVariant: rnd() > 0.5 ? "experimental" : "baseline",
  };
});

export function makeEvaluations(flagId: string): FlagEvaluation[] {
  const rnd = seededRandom(flagId.length * 13);
  return Array.from({ length: 8 }).map((_, i) => ({
    id: `${flagId}_eval_${i}`,
    timestamp: new Date(Date.now() - i * 3600_000).toISOString(),
    variant: rnd() > 0.5 ? "experimental" : "baseline",
    qualityScore: +(3.5 + rnd() * 1.4).toFixed(2),
    latencyMs: Math.round(180 + rnd() * 420),
    outcome: rnd() > 0.15 ? "pass" : "fail",
  }));
}

export const ROLLOUTS: RolloutEvent[] = FEATURE_FLAGS.filter((f) => f.status === "active").map((f, i) => {
  const rnd = seededRandom(i + 100);
  const stageIdx = ["1%", "5%", "25%", "50%", "100%"].indexOf(f.currentStage);
  return {
    id: `rollout_${f.id}`,
    flagId: f.id,
    flagName: f.name,
    stages: ["1%", "5%", "25%", "50%", "100%"],
    currentStageIndex: stageIdx,
    trafficPercentage: f.rolloutPercentage,
    startedAt: new Date(Date.now() - Math.floor(rnd() * 5) * 86400000).toISOString(),
    estimatedCompletion: new Date(Date.now() + Math.floor(2 + rnd() * 4) * 86400000).toISOString(),
    remainingMinutes: Math.round(30 + rnd() * 600),
    qualityStatus: rnd() > 0.8 ? "at_risk" : "healthy",
    autoAdvance: rnd() > 0.3,
    progress: Math.round(((stageIdx + 1) / 5) * 100),
  };
});

export function makeQualitySeries(days = 14): QualityPoint[] {
  const rnd = seededRandom(42);
  return Array.from({ length: days }).map((_, i) => {
    const base = 4.2 + Math.sin(i / 2) * 0.25 + (rnd() - 0.5) * 0.2;
    return {
      timestamp: new Date(Date.now() - (days - i) * 86400000).toISOString(),
      quality: +base.toFixed(2),
      judgeScore: +(base - 0.15 + rnd() * 0.1).toFixed(2),
      latencyMs: Math.round(320 + rnd() * 180),
      errorRate: +(0.8 + rnd() * 1.5).toFixed(2),
      userFeedback: +(80 + rnd() * 15).toFixed(1),
    };
  });
}

export function getQualitySummary(series: QualityPoint[]): QualitySummary {
  const avg = series.reduce((a, p) => a + p.quality, 0) / series.length;
  const judge = series.reduce((a, p) => a + p.judgeScore, 0) / series.length;
  const lat = series.reduce((a, p) => a + p.latencyMs, 0) / series.length;
  const sorted = [...series].map((p) => p.quality).sort((a, b) => a - b);
  const p10 = sorted[Math.floor(sorted.length * 0.1)];
  const mean = avg;
  const variance = series.reduce((a, p) => a + (p.quality - mean) ** 2, 0) / series.length;
  const errRate = series.reduce((a, p) => a + p.errorRate, 0) / series.length;
  const first = series[0].quality;
  const last = series[series.length - 1].quality;
  return {
    average: +avg.toFixed(2),
    judgeScore: +judge.toFixed(2),
    latencyMs: Math.round(lat),
    p10: +p10.toFixed(2),
    stdDev: +Math.sqrt(variance).toFixed(2),
    errorRate: +errRate.toFixed(2),
    trend: last > first ? "up" : last < first ? "down" : "flat",
    trendDelta: +(last - first).toFixed(2),
  };
}

export const CANARY_RESULTS: CanaryResult[] = FEATURE_FLAGS.slice(0, 6).map((f, i) => {
  const rnd = seededRandom(i + 500);
  const passed = rnd() > 0.35;
  const mk = (metric: string, base: number, spread: number, unit: string, higherIsBetter: boolean) => ({
    metric,
    baseline: +base.toFixed(2),
    experimental: +(base + (passed ? spread : -spread) * (higherIsBetter ? 1 : -1) * (0.5 + rnd())).toFixed(2),
    unit,
    higherIsBetter,
  });
  return {
    id: `canary_${f.id}`,
    flagName: f.name,
    rows: [
      mk("Mean Quality", 4.1, 0.25, "", true),
      mk("Median Quality", 4.15, 0.2, "", true),
      mk("P10 Quality", 3.6, 0.3, "", true),
      mk("Error Rate", 1.8, 0.6, "%", false),
      mk("Latency", 410, 60, "ms", false),
      mk("Judge Score", 4.0, 0.2, "", true),
    ],
    confidence: +(passed ? 92 + rnd() * 7 : 60 + rnd() * 20).toFixed(1),
    statisticallySignificant: passed || rnd() > 0.5,
    decision: passed ? "passed" : "failed",
    analyzedAt: new Date(Date.now() - i * 7200_000).toISOString(),
  };
});

const TRIGGERS = ["P10 quality below threshold", "Error rate spike", "Latency SLO breach", "Manual rollback", "Judge score regression"];

export const ROLLBACK_EVENTS: RollbackEvent[] = Array.from({ length: 9 }).map((_, i) => {
  const rnd = seededRandom(i + 900);
  const flag = FEATURE_FLAGS[Math.floor(rnd() * FEATURE_FLAGS.length)];
  return {
    id: `rollback_${i}`,
    timestamp: new Date(Date.now() - i * 6 * 3600_000).toISOString(),
    flagName: flag.name,
    trigger: TRIGGERS[Math.floor(rnd() * TRIGGERS.length)],
    qualityAtRollback: +(3.0 + rnd() * 0.9).toFixed(2),
    reason: "Automatic rollback triggered by quality guardrail evaluation over rolling window.",
    slackNotified: rnd() > 0.15,
    status: rnd() > 0.9 ? "in_progress" : "completed",
  };
});

export const ACTIVITY_FEED = [
  { id: "a1", time: new Date(Date.now() - 4 * 60000).toISOString(), text: "Sales Email Personalizer advanced to 25%", type: "rollout" },
  { id: "a2", time: new Date(Date.now() - 22 * 60000).toISOString(), text: "Canary passed for Smart Summarizer", type: "canary" },
  { id: "a3", time: new Date(Date.now() - 48 * 60000).toISOString(), text: "Rollback triggered for Invoice Parser", type: "rollback" },
  { id: "a4", time: new Date(Date.now() - 95 * 60000).toISOString(), text: "Shadow test completed for Doc Search Reranker", type: "shadow" },
  { id: "a5", time: new Date(Date.now() - 130 * 60000).toISOString(), text: "New flag created: Ticket Triage Router", type: "flag" },
  { id: "a6", time: new Date(Date.now() - 210 * 60000).toISOString(), text: "Quality threshold updated for Code Review Assistant", type: "quality" },
];
