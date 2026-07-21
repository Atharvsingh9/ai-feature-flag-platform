import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Zap, TrendingDown, CheckCircle2, AlertTriangle, Bell } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { ChartCard } from "../components/dashboard/ChartCard";
import { StatCard } from "../components/dashboard/StatCard";
import { Button } from "../components/common/Button";
import { NotificationToast } from "../components/common/NotificationToast";
import { ConfirmationDialog } from "../components/common/ConfirmationDialog";
import { RolloutTimeline } from "../components/rollout/RolloutTimeline";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const STAGES = ["1%", "5%", "25%", "50%", "100%"];
const STAGE_TRAFFIC = [1, 5, 25, 50, 100];
const SPEED_OPTIONS = [
  { label: "0.5x", value: 2000 },
  { label: "1x", value: 1000 },
  { label: "2x", value: 500 },
  { label: "4x", value: 250 },
];

interface SimEvent {
  id: number;
  time: number;
  type: "stage" | "quality" | "canary" | "rollback" | "slack";
  message: string;
}

export default function RolloutSimulation() {
  const [phase, setPhase] = useState<"idle" | "running" | "paused" | "degrading" | "rollback" | "completed">("idle");
  const [stageIndex, setStageIndex] = useState(0);
  const [qualityScore, setQualityScore] = useState(4.5);
  const [errorRate, setErrorRate] = useState(0.8);
  const [latencyMs, setLatencyMs] = useState(320);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [historyData, setHistoryData] = useState<{ time: number; quality: number; errorRate: number; traffic: number }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addEvent = useCallback((type: SimEvent["type"], message: string) => {
    setEvents((prev) => [{ id: Date.now(), time: elapsed, type, message }, ...prev].slice(0, 50));
  }, [elapsed]);

  const addDataPoint = useCallback(() => {
    setHistoryData((prev) => [...prev, { time: elapsed, quality: qualityScore, errorRate, traffic: STAGE_TRAFFIC[stageIndex] || 100 }].slice(-60));
  }, [elapsed, qualityScore, errorRate, stageIndex]);

  const runStep = useCallback(() => {
    setElapsed((t) => t + 1);
    setQualityScore((q) => {
      const stageProgress = stageIndex / (STAGES.length - 1);
      if (stageProgress >= 0.5 && stageProgress < 0.75) {
        const degraded = q - 0.08 + (Math.random() - 0.5) * 0.05;
        return Math.max(2.0, Math.min(5.0, +degraded.toFixed(2)));
      }
      const next = q + (Math.random() - 0.48) * 0.04;
      return Math.max(2.0, Math.min(5.0, +next.toFixed(2)));
    });
    setErrorRate((e) => {
      const stageProgress = stageIndex / (STAGES.length - 1);
      if (stageProgress >= 0.5 && stageProgress < 0.75) {
        return Math.min(8, +(e + Math.random() * 0.4).toFixed(2));
      }
      return Math.max(0.1, +(e + (Math.random() - 0.5) * 0.1).toFixed(2));
    });
    setLatencyMs((l) => Math.max(100, +(l + (Math.random() - 0.48) * 8).toFixed(0)));
  }, [stageIndex]);

  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => {
      runStep();
      addDataPoint();
    }, speed);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, speed, runStep, addDataPoint]);

  useEffect(() => {
    if (phase !== "running") return;
    if (elapsed > 0 && elapsed % 8 === 0) {
      const next = Math.min(stageIndex + 1, STAGES.length - 1);
      setStageIndex(next);
      if (STAGES[next]) {
        addEvent("stage", `Rollout advanced to ${STAGES[next]} — ${STAGE_TRAFFIC[next]}% traffic`);
      }
    }
  }, [elapsed, stageIndex, phase, addEvent]);

  useEffect(() => {
    if (stageIndex === 2 && phase === "running" && qualityScore < 3.5 && errorRate > 3) {
      setPhase("degrading");
      addEvent("canary", "⚠️ Canary analysis detected regression — quality dropped, error rate elevated");
      setToastMsg("Canary analysis: Quality regression detected — initiating rollback");
      setShowToast(true);

      setTimeout(() => {
        setPhase("rollback");
        addEvent("rollback", "🔄 Automatic rollback triggered — traffic returning to 0%");
        addEvent("slack", "📢 Slack notification sent to #ai-platform-alerts");
        setToastMsg("Rollback completed — traffic reverted to baseline");
        setShowRollbackModal(true);
        setStageIndex(0);

        setTimeout(() => {
          setShowRollbackModal(false);
          setPhase("completed");
          addEvent("stage", "✅ Rollback complete — all traffic on baseline variant");
          setToastMsg("Rollout simulation completed");
          setShowToast(true);
        }, 3000);
      }, 2000);
    }
  }, [stageIndex, qualityScore, errorRate, phase, addEvent]);

  const startSim = useCallback(() => {
    setPhase("running");
    setEvents([]);
    setHistoryData([]);
    setElapsed(0);
    setStageIndex(0);
    setQualityScore(4.5);
    setErrorRate(0.8);
    setLatencyMs(320);
    addEvent("stage", "🚀 Rollout simulation started — 1% traffic");
    setToastMsg("Rollout simulation started");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, [addEvent]);

  const pauseSim = useCallback(() => {
    setPhase("paused");
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const resetSim = useCallback(() => {
    setPhase("idle");
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStageIndex(0);
    setQualityScore(4.5);
    setErrorRate(0.8);
    setLatencyMs(320);
    setElapsed(0);
    setEvents([]);
    setHistoryData([]);
  }, []);

  const isRunning = phase === "running";
  const traffic = STAGE_TRAFFIC[stageIndex] ?? 0;

  return (
    <div>
      <PageHeader
        title="Live Rollout Simulation"
        description="Simulate a complete rollout with quality checks, canary analysis, and automatic rollback."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        {phase === "idle" || phase === "completed" ? (
          <Button icon={<Play className="h-4 w-4" />} onClick={startSim}>Start Simulation</Button>
        ) : isRunning ? (
          <Button variant="secondary" icon={<Pause className="h-4 w-4" />} onClick={pauseSim}>Pause</Button>
        ) : phase === "paused" ? (
          <Button icon={<Play className="h-4 w-4" />} onClick={() => setPhase("running")}>Resume</Button>
        ) : null}
        {(phase === "running" || phase === "paused") && (
          <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetSim}>Reset</Button>
        )}
        {phase === "completed" && (
          <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetSim}>Reset</Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSpeed(opt.value)}
              className={`focus-ring rounded-xl2 px-3 py-1.5 text-xs font-medium transition-colors ${
                speed === opt.value ? "bg-primary text-white" : "bg-white border border-ink-300/40 text-ink-700 hover:bg-surface-bg"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard index={0} label="Phase" value={phase.charAt(0).toUpperCase() + phase.slice(1)} icon={<Play className="h-5 w-5" />} accent={phase === "rollback" ? "error" : phase === "degrading" ? "warning" : phase === "completed" ? "success" : "primary"} />
        <StatCard index={1} label="Traffic" value={`${traffic}%`} icon={<Zap className="h-5 w-5" />} accent="primary" />
        <StatCard index={2} label="Quality" value={qualityScore.toFixed(2)} delta={qualityScore >= 4.0 ? "Good" : qualityScore >= 3.0 ? "At risk" : "Critical"} icon={<TrendingDown className="h-5 w-5" />} accent={qualityScore >= 4.0 ? "success" : qualityScore >= 3.0 ? "warning" : "error"} />
        <StatCard index={3} label="Error Rate" value={`${errorRate.toFixed(1)}%`} delta={errorRate > 3 ? "High" : "Normal"} goodIsUp={false} icon={<AlertTriangle className="h-5 w-5" />} accent={errorRate > 3 ? "error" : "success"} />
        <StatCard index={4} label="Latency" value={`${latencyMs}ms`} icon={<Zap className="h-5 w-5" />} accent={latencyMs > 500 ? "warning" : "primary"} />
        <StatCard index={5} label="Elapsed" value={`${elapsed}s`} icon={<Play className="h-5 w-5" />} accent="primary" />
      </div>

      <div className="mt-5">
        <ChartCard title="Rollout Timeline" subtitle={`Stage ${stageIndex + 1} of 5`}>
          {phase !== "idle" ? (
            <RolloutTimeline stages={STAGES} currentStageIndex={stageIndex} />
          ) : (
            <p className="py-6 text-center text-sm text-ink-500">Start the simulation to see the rollout timeline</p>
          )}
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Quality Score" subtitle="Live during simulation" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={historyData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="simQualityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[2, 5]} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="quality" stroke="#2563EB" strokeWidth={2} fill="url(#simQualityFill)" name="Quality" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Error Rate" subtitle="Live during simulation" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={historyData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="simErrorFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="errorRate" stroke="#EF4444" strokeWidth={2} fill="url(#simErrorFill)" name="Error Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Traffic %" subtitle="Rollout progression" className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={historyData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="traffic" fill="#2563EB" radius={[4, 4, 0, 0]} name="Traffic %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Activity Feed" subtitle="Simulation events">
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {events.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-500">No events yet. Start the simulation.</p>
            )}
            {events.map((ev) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 rounded-xl2 p-2.5 hover:bg-surface-bg"
              >
                <span className="mt-0.5 text-xs text-ink-500 shrink-0 w-8">{ev.time}s</span>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                  ev.type === "stage" ? "bg-primary-50 text-primary" :
                  ev.type === "quality" ? "bg-success-50 text-success" :
                  ev.type === "canary" ? "bg-warning-50 text-warning" :
                  ev.type === "rollback" ? "bg-error-50 text-error" :
                  "bg-ink-300/20 text-ink-500"
                }`}>
                  {ev.type === "slack" ? <Bell className="h-3 w-3" /> :
                   ev.type === "rollback" ? <RotateCcw className="h-3 w-3" /> :
                   ev.type === "canary" ? <AlertTriangle className="h-3 w-3" /> :
                   <CheckCircle2 className="h-3 w-3" />}
                </span>
                <p className="text-sm text-ink-700">{ev.message}</p>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Simulation Flow" subtitle="Stage progression">
          <div className="space-y-4">
            {STAGES.map((stage, i) => {
              const completed = phase !== "idle" && i < stageIndex;
              const current = phase !== "idle" && i === stageIndex;
              return (
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-4 rounded-xl2 p-4 transition-all ${
                    current ? "bg-primary-50 border border-primary/20" :
                    completed ? "bg-success-50 border border-success/20" :
                    "bg-surface-bg"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    completed ? "bg-success text-white" :
                    current ? "bg-primary text-white" :
                    "bg-white border-2 border-ink-300/50 text-ink-500"
                  }`}>
                    {completed ? <CheckCircle2 className="h-5 w-5" /> : stage}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${current ? "text-primary" : completed ? "text-success" : "text-ink-500"}`}>
                      {STAGE_TRAFFIC[i]}% Traffic
                    </p>
                    <p className="text-xs text-ink-500">
                      {completed ? "Completed" : current ? "In Progress" : phase === "idle" ? "Waiting" : "Pending"}
                    </p>
                  </div>
                  {current && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="flex h-6 w-6 items-center justify-center"
                    >
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      <NotificationToast open={showToast} message={toastMsg} onClose={() => setShowToast(false)} />
      <ConfirmationDialog
        open={showRollbackModal}
        title="Automatic Rollback Triggered"
        description="Quality dropped below threshold at 25% rollout. Canary analysis detected regression. Traffic automatically reverted to baseline variant. Slack notification sent."
        confirmLabel="Dismiss"
        danger
        onConfirm={() => { setShowRollbackModal(false); }}
        onCancel={() => { setShowRollbackModal(false); }}
      />
    </div>
  );
}
