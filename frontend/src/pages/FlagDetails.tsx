import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, PauseCircle, Rocket, RotateCcw, Edit, Trash2,
  CheckCircle2, AlertTriangle, BarChart3,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { ProgressBar } from "../components/common/ProgressBar";
import { ChartCard } from "../components/dashboard/ChartCard";
import { FlagConfiguration } from "../components/flags/FlagConfiguration";
import { TrafficSplit } from "../components/rollout/TrafficSplit";
import { ConfirmationDialog } from "../components/common/ConfirmationDialog";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { EvaluationInspector } from "../components/common/EvaluationInspector";
import type { EvaluationData } from "../components/common/EvaluationInspector";
import { getFlagById, getEvaluations, deleteFlag, pauseRollout, resumeRollout, rollbackFlag, startRollout } from "../services/flagService";
import type { FeatureFlag, FlagEvaluation } from "../types/flag";
import { formatDate, formatDateTime, formatLatency } from "../utils/formatters";
import { NotificationCenter, useToast } from "../components/common/NotificationCenter";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

function generateQualityBreakdown(flag: FeatureFlag) {
  return Array.from({ length: 14 }).map((_, i) => ({
    day: i + 1,
    quality: +(flag.qualityScore + Math.sin(i / 3) * 0.2 + (Math.random() - 0.5) * 0.15).toFixed(2),
    latency: Math.round(280 + Math.sin(i / 2) * 60 + Math.random() * 40),
    errors: +(0.5 + Math.random() * 1.5).toFixed(2),
  }));
}

export default function FlagDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flag, setFlag] = useState<FeatureFlag | null>(null);
  const [evaluations, setEvaluations] = useState<FlagEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [rolloutOpen, setRolloutOpen] = useState(false);
  const [acting, setActing] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorEval, setInspectorEval] = useState<EvaluationData | null>(null);
  const { toasts, addToast, dismiss } = useToast();

  const fetchData = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([getFlagById(id), getEvaluations(id)])
      .then(([f, evals]) => {
        if (f) {
          setFlag(f);
          setEvaluations(evals);
        } else {
          setError("Flag not found");
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load flag");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const qualityBreakdown = useMemo(() => flag ? generateQualityBreakdown(flag) : [], [flag]);

  const openInspector = (evalItem: FlagEvaluation) => {
    setInspectorEval({
      id: evalItem.id,
      prompt: "Summarize the financial report highlighting revenue growth and key risks.",
      response: "Q3 revenue grew 23% YoY to $1.2B. Key risks include supply chain disruptions.",
      promptVersion: "v2.3",
      model: flag?.experimentalConfig.model || "gpt-4",
      latencyMs: evalItem.latencyMs,
      judgeScore: 4.2,
      qualityScore: evalItem.qualityScore,
      tokenUsage: { prompt: 245, completion: 180, total: 425 },
      cost: 0.00235,
      executionTimeMs: evalItem.latencyMs,
      timestamp: evalItem.timestamp,
      userMetadata: { userId: "usr_8a7b3c", sessionId: "sess_9f2e1d" },
      decision: evalItem.outcome,
    });
    setInspectorOpen(true);
  };

  const doAction = useCallback(async (action: () => Promise<unknown>, successMsg: string) => {
    setActing(true);
    try {
      await action();
      addToast("success", "Success", successMsg);
      fetchData();
    } catch (err) {
      addToast("error", "Action Failed", err instanceof Error ? err.message : "Request failed");
    } finally {
      setActing(false);
    }
  }, [addToast, fetchData]);

  const handleRollback = () => {
    setRollbackOpen(false);
    if (!flag || !id) return;
    doAction(
      () => rollbackFlag(id, { actor: "admin", reason: "Manual rollback via dashboard" }),
      `${flag.name} rolled back successfully`
    );
  };

  const handleDelete = async () => {
    setDeleteOpen(false);
    if (!id) return;
    await doAction(
      () => deleteFlag(id),
      "Flag deleted successfully"
    );
    navigate("/flags");
  };

  const handlePause = () => {
    setPauseOpen(false);
    if (!flag || !id) return;
    doAction(
      () => pauseRollout(id, { actor: "admin", reason: "Paused from dashboard" }),
      `${flag.name} paused`
    );
  };

  const handleResume = () => {
    setResumeOpen(false);
    if (!flag || !id) return;
    doAction(
      () => resumeRollout(id, { actor: "admin", reason: "Resumed from dashboard" }),
      `${flag.name} resumed`
    );
  };

  const handleStartRollout = () => {
    setRolloutOpen(false);
    if (!flag || !id) return;
    doAction(
      () => startRollout(id, { percentage: 5, actor: "admin", reason: "Starting rollout from dashboard" }),
      `${flag.name} rollout started`
    );
  };

  if (loading) return <LoadingSpinner label="Loading flag details..." />;

  if (error || !flag) {
    return (
      <ErrorState
        message={error || "Flag not found"}
        onRetry={fetchData}
      />
    );
  }

  const avgLatency = Math.round(evaluations.reduce((a, e) => a + e.latencyMs, 0) / (evaluations.length || 1));

  const isDraft = flag.status === "draft";
  const isRollingOut = flag.status === "rolling_out" || flag.status === "active" || flag.status === "completed";
  const isPaused = flag.status === "paused";

  return (
    <div>
      <button
        onClick={() => navigate("/flags")}
        className="focus-ring mb-4 flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
        aria-label="Back to feature flags"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Flags
      </button>

      <PageHeader
        title={flag.name}
        description={flag.description}
        actions={
          <div className="flex flex-wrap gap-2">
            {isDraft && (
              <Button variant="secondary" size="sm" icon={<Rocket className="h-4 w-4" />} onClick={() => setRolloutOpen(true)} disabled={acting}>
                Start Rollout
              </Button>
            )}
            {isRollingOut && !isPaused && (
              <Button variant="secondary" size="sm" icon={<PauseCircle className="h-4 w-4" />} onClick={() => setPauseOpen(true)} disabled={acting}>
                Pause
              </Button>
            )}
            {isPaused && (
              <Button variant="secondary" size="sm" icon={<Rocket className="h-4 w-4" />} onClick={() => setResumeOpen(true)} disabled={acting}>
                Resume
              </Button>
            )}
            {(isRollingOut || isPaused) && (
              <Button variant="danger" size="sm" icon={<RotateCcw className="h-4 w-4" />} onClick={() => setRollbackOpen(true)} disabled={acting}>
                Rollback
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={<Edit className="h-4 w-4" />} disabled>
              Edit
            </Button>
            <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteOpen(true)} disabled={acting}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-4 text-sm">
        <Badge status={flag.status} />
        <span className="text-ink-500">Key: <span className="font-mono text-ink-700">{flag.key}</span></span>
        <span className="text-ink-500">Owner: <span className="text-ink-700">{flag.owner}</span></span>
        <span className="text-ink-500">Created: <span className="text-ink-700">{formatDate(flag.createdAt)}</span></span>
        {flag.shadowMode && <Badge status="active" label="Shadow Mode" pulse />}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 mb-5">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink-900">Rollout Status</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-ink-500">Current Rollout %</p>
              <p className="font-display text-2xl font-semibold text-ink-900">{flag.rolloutPercentage}%</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Target Quality</p>
              <p className="font-display text-2xl font-semibold text-ink-900">{flag.qualityThreshold.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Current Quality</p>
              <div className="flex items-center gap-2">
                <p className={`font-display text-2xl font-semibold ${flag.qualityScore >= flag.qualityThreshold ? "text-success" : "text-error"}`}>
                  {flag.qualityScore.toFixed(2)}
                </p>
                {flag.qualityScore >= flag.qualityThreshold
                  ? <CheckCircle2 className="h-5 w-5 text-success" />
                  : <AlertTriangle className="h-5 w-5 text-error" />}
              </div>
            </div>
            <div>
              <p className="text-xs text-ink-500">Current Stage</p>
              <p className="font-display text-2xl font-semibold text-primary">{flag.currentStage}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-ink-500">Rollout Progress</span>
              <span className="font-medium text-ink-700">{flag.rolloutPercentage}%</span>
            </div>
            <ProgressBar value={flag.rolloutPercentage} colorClass={flag.status === "rolled_back" ? "bg-error" : "bg-primary"} />
          </div>
          {flag.status !== "draft" && (
            <div className="mt-4">
              <TrafficSplit baseline={flag.trafficSplit.baseline} experimental={flag.trafficSplit.experimental} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <FlagConfiguration title="Baseline Configuration" accent="primary" config={flag.baselineConfig} />
          <FlagConfiguration title="Experimental Configuration" accent="warning" config={flag.experimentalConfig} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-5">
        <ChartCard title="Quality Breakdown" subtitle="14-day trend">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={qualityBreakdown} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="detailQualityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="quality" stroke="#2563EB" strokeWidth={2} fill="url(#detailQualityFill)" name="Quality" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Latency Breakdown" subtitle={`Avg ${formatLatency(avgLatency)}`}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={qualityBreakdown} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="latency" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Latency (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-5">
        <ChartCard title="Error Breakdown" subtitle="Daily error rate">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={qualityBreakdown} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="detailErrorFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} fill="url(#detailErrorFill)" name="Error Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Judge Score Distribution" subtitle="Evaluation scores">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={evaluations} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="qualityScore" fill="#22C55E" radius={[4, 4, 0, 0]} name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Recent Evaluations" subtitle="Click any row to inspect">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-300/10 text-left text-xs font-medium text-ink-500">
                <th className="pb-3 pr-4">Time</th>
                <th className="pb-3 pr-4">Variant</th>
                <th className="pb-3 pr-4 text-right">Quality</th>
                <th className="pb-3 pr-4 text-right">Latency</th>
                <th className="pb-3 pr-4">Outcome</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev) => (
                <motion.tr
                  key={ev.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="cursor-pointer border-b border-ink-300/5 transition-colors hover:bg-surface-bg"
                  onClick={() => openInspector(ev)}
                >
                  <td className="py-3 pr-4 text-ink-500 whitespace-nowrap">{formatDateTime(ev.timestamp)}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium ${ev.variant === "experimental" ? "text-warning" : "text-primary"}`}>
                      {ev.variant}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right text-ink-900">{ev.qualityScore.toFixed(2)}</td>
                  <td className="py-3 pr-4 text-right text-ink-900">{formatLatency(ev.latencyMs)}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${ev.outcome === "pass" ? "text-success" : "text-error"}`}>
                      {ev.outcome === "pass" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      {ev.outcome === "pass" ? "Pass" : "Fail"}
                    </span>
                  </td>
                  <td className="py-3">
                    <button className="focus-ring rounded-lg p-1.5 text-ink-500 hover:bg-black/5" aria-label="Inspect evaluation">
                      <BarChart3 className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ConfirmationDialog
        open={rollbackOpen}
        title={`Rollback ${flag.name}?`}
        description="This will immediately stop rollout and return all traffic to the baseline model."
        confirmLabel="Rollback"
        danger
        onConfirm={handleRollback}
        onCancel={() => setRollbackOpen(false)}
      />
      <ConfirmationDialog
        open={deleteOpen}
        title={`Delete ${flag.name}?`}
        description="This action cannot be undone. The flag and all associated data will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
      <ConfirmationDialog
        open={pauseOpen}
        title={`Pause ${flag.name}?`}
        description="The rollout will be paused. You can resume it later."
        confirmLabel="Pause"
        onConfirm={handlePause}
        onCancel={() => setPauseOpen(false)}
      />
      <ConfirmationDialog
        open={resumeOpen}
        title={`Resume ${flag.name}?`}
        description="The rollout will continue from where it was paused."
        confirmLabel="Resume"
        onConfirm={handleResume}
        onCancel={() => setResumeOpen(false)}
      />
      <ConfirmationDialog
        open={rolloutOpen}
        title={`Start Rollout for ${flag.name}?`}
        description="This will begin the rollout at 5% traffic."
        confirmLabel="Start"
        onConfirm={handleStartRollout}
        onCancel={() => setRolloutOpen(false)}
      />
      <EvaluationInspector open={inspectorOpen} evaluation={inspectorEval} onClose={() => setInspectorOpen(false)} />
      <NotificationCenter toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
