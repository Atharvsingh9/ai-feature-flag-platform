import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, RotateCcw, AlertTriangle, Activity, Gauge,
  Clock, Flag, GitBranch, Percent, FileText, Sparkles, Beaker,
  RefreshCw, ThumbsDown,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Skeleton } from "../components/common/Skeleton";
import { ErrorState } from "../components/common/ErrorState";
import { ProgressBar } from "../components/common/ProgressBar";
import { demoGenerate, demoBadGenerate, demoStatus, demoReset } from "../services/demoService";
import type { DemoGenerateResponse, DemoStatusResponse } from "../services/demoService";

const GOAL_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "marketing", label: "Marketing" },
  { value: "apology", label: "Apology" },
  { value: "followup", label: "Follow-up" },
];

function MetadataCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-xl2 bg-surface-bg p-3 flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-ink-500">{label}</p>
        <p className="text-sm font-semibold text-ink-900 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function DemoApp() {
  const [goal, setGoal] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [badGenerating, setBadGenerating] = useState(false);
  const [result, setResult] = useState<DemoGenerateResponse | null>(null);
  const [status, setStatus] = useState<DemoStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setStatusError(null);
      const s = await demoStatus();
      setStatus(s);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Failed to load status");
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleGenerate = async () => {
    setGenerating(true);
    setErrorMessage(null);
    try {
      const res = await demoGenerate(goal);
      setResult(res);
      fetchStatus();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleBadGenerate = async () => {
    setBadGenerating(true);
    setErrorMessage(null);
    try {
      const res = await demoBadGenerate(goal);
      setResult(res);
      fetchStatus();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setBadGenerating(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setErrorMessage(null);
    try {
      await demoReset();
      setResult(null);
      await fetchStatus();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const meta = result?.metadata;
  const isExperimental = meta?.variant === "experimental";

  return (
    <div>
      <PageHeader
        title="AI Email Assistant"
        description="Interactive demo showcasing feature flags, prompt versioning, canary analysis, shadow mode, and automatic rollback."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={handleReset} disabled={resetting}>
              {resetting ? "Resetting..." : "Reset Demo"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Left Column - Input + Result */}
        <div className="xl:col-span-2 space-y-5">
          {/* Input Card */}
          <div className="card p-5">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Generate Email</h2>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-ink-500">Email Goal</label>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`focus-ring rounded-xl2 px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                      goal === opt.value
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface-bg text-ink-700 hover:bg-primary-50 hover:text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={handleGenerate}
                disabled={generating || badGenerating}
              >
                {generating ? "Generating..." : "Normal Demo"}
              </Button>
              <Button
                variant="danger"
                size="md"
                icon={<ThumbsDown className="h-4 w-4" />}
                onClick={handleBadGenerate}
                disabled={generating || badGenerating}
              >
                {badGenerating ? "Generating..." : "Bad Demo"}
              </Button>
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl2 bg-error-50 border border-error/20 p-3 flex items-center gap-3"
              >
                <AlertTriangle className="h-4 w-4 text-error shrink-0" />
                <p className="text-xs text-error">{errorMessage}</p>
              </motion.div>
            )}
          </div>

          {/* Result Card */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="card p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold text-ink-900">Generated Email</h2>
                  {isExperimental ? (
                    <Badge status="rolling_out" label="Experimental Variant" pulse />
                  ) : (
                    <Badge status="active" label="Baseline Variant" />
                  )}
                </div>

                <div className="rounded-xl2 bg-surface-bg p-4">
                  <p className="text-[11px] font-medium text-ink-500 mb-1">Subject</p>
                  <p className="text-sm font-semibold text-ink-900">{result.subject || "(no subject)"}</p>
                </div>

                <div className="rounded-xl2 bg-surface-bg p-4">
                  <p className="text-[11px] font-medium text-ink-500 mb-1">Body</p>
                  <p className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed">{result.body || "(no content)"}</p>
                </div>

                <div className="rounded-xl2 border border-ink-300/10 bg-ink-300/5 p-3">
                  <p className="text-[11px] font-semibold text-ink-500 mb-2">Generation Metadata</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <MetadataCard label="Feature Flag" value={meta?.flagName ?? ""} icon={Flag} />
                    <MetadataCard label="Current Variant" value={meta?.variant ?? ""} icon={GitBranch} />
                    <MetadataCard label="Rollout %" value={`${meta?.rolloutPercentage ?? 0}%`} icon={Percent} />
                    <MetadataCard label="Prompt Version" value={meta?.promptVersion ?? ""} icon={FileText} />
                    <MetadataCard label="Latency" value={`${meta?.latencyMs ?? 0}ms`} icon={Clock} />
                    <MetadataCard label="Model" value={meta?.model ?? ""} icon={Activity} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-10 flex flex-col items-center justify-center text-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl2 bg-primary-50 text-primary">
                  <Send className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-ink-900">Ready to generate</p>
                <p className="text-xs text-ink-500 max-w-md">
                  Select an email goal and click <strong>Normal Demo</strong> to test the AI feature flag pipeline,
                  or <strong>Bad Demo</strong> to demonstrate quality degradation and automatic rollback.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Status Panel */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Demo Status</h2>

            {statusLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : statusError ? (
              <ErrorState message={statusError} onRetry={fetchStatus} />
            ) : status ? (
              <div className="space-y-3">
                <MetadataCard label="Flag Name" value={status.flagName} icon={Flag} />
                <MetadataCard
                  label="Status"
                  value={status.status === "rolling_out" ? "Rolling Out" : status.status === "draft" ? "Draft" : status.status}
                  icon={Activity}
                />
                <MetadataCard label="Rollout %" value={`${status.rolloutPercentage}%`} icon={Percent} />
                <MetadataCard label="Current Variant" value={status.currentVariant} icon={GitBranch} />
                <MetadataCard label="Total Evaluations" value={String(status.totalEvaluations)} icon={Beaker} />
                <MetadataCard
                  label="Avg Quality"
                  value={status.averageQuality.toFixed(2)}
                  icon={Gauge}
                />

                {status.rolloutPercentage > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs text-ink-500">{status.rolloutPercentage}% rollout</p>
                    <ProgressBar value={status.rolloutPercentage} showLabel />
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Info Card */}
          <div className="card p-5 space-y-3">
            <h2 className="font-display text-base font-semibold text-ink-900">How It Works</h2>
            <div className="space-y-2.5">
              {[
                { icon: Flag, text: "SDK evaluates feature flag to determine variant" },
                { icon: FileText, text: "Prompt version selected based on variant" },
                { icon: Sparkles, text: "LLM generates email (OpenAI / OpenRouter)" },
                { icon: Gauge, text: "Quality score recorded via monitoring pipeline" },
                { icon: Activity, text: "Dashboard updates with live metrics" },
                { icon: RotateCcw, text: "Low quality triggers automatic rollback" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary">
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-xs text-ink-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
