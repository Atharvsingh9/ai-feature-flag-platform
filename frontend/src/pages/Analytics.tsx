import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Download } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { ChartCard } from "../components/dashboard/ChartCard";
import { FilterDropdown } from "../components/common/FilterDropdown";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useQuality } from "../hooks/useQuality";
import { useFlags } from "../hooks/useFlags";
import { useRollouts } from "../hooks/useRollouts";
import { useCanary } from "../hooks/useCanary";
import { useShadowTests } from "../hooks/useShadowTests";

import { exportQualityReport } from "../utils/export";
import { formatLatency } from "../utils/formatters";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export default function Analytics() {
  const [days, setDays] = useState("30");
  const { series, summary, loading } = useQuality(Number(days));
  const { flags } = useFlags();
  const { rollouts } = useRollouts();
  const { results } = useCanary();
  const { tests } = useShadowTests();

  const handleExport = useCallback(() => {
    if (series.length > 0) {
      exportQualityReport(series, `analytics-quality-${days}d`);
    }
  }, [series, days]);

  if (loading || !summary) return <LoadingSpinner label="Loading analytics..." />;

  const latencySeries = series.map((p) => ({ ...p }));
  const errorSeries = series.map((p) => ({ ...p }));
  const dailyRequests = Array.from({ length: Number(days) }).map((_, i) => ({
    day: i + 1,
    requests: Math.round(12000 + Math.sin(i / 5) * 3000 + Math.random() * 2000),
    evaluations: Math.round(8000 + Math.cos(i / 4) * 2000 + Math.random() * 1500),
  }));
  const shadowTraffic = tests.map((t) => ({
    name: t.flagName.slice(0, 12),
    requests: t.mirroredRequests,
    quality: t.qualityScore,
  }));
  const canaryPassRate = results.length > 0
    ? Math.round((results.filter((r) => r.decision === "passed").length / results.length) * 100)
    : 0;
  const rollbackFrequency = 0;

  const successful = flags.filter((f) => f.status === "completed" || f.status === "active").length;
  const failed = flags.filter((f) => f.status === "rolled_back").length;
  const total = flags.length || 1;
  const rolloutDurations = rollouts.map((r) => ({
    name: r.flagName.slice(0, 14),
    days: +(2 + Math.random() * 5).toFixed(1),
  }));
  const avgRolloutTime = +(rolloutDurations.reduce((a, r) => a + r.days, 0) / rolloutDurations.length).toFixed(1);

  const sortedByQuality = [...flags].sort((a, b) => b.qualityScore - a.qualityScore);
  const bestFlag = sortedByQuality[0];
  const worstFlag = sortedByQuality[sortedByQuality.length - 1];

  const mostCommonCause = "N/A";

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Historical trends and performance metrics across the platform."
        actions={
          <div className="flex items-center gap-2">
            <FilterDropdown value={days} options={RANGE_OPTIONS} onChange={setDays} />
            <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={handleExport}>
              Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
        {[
          { label: "Canary Pass Rate", value: `${canaryPassRate}%` },
          { label: "Rollback Frequency", value: `${rollbackFrequency.toFixed(1)}/day` },
          { label: "Avg Rollout Time", value: `${avgRolloutTime}d` },
          { label: "Successful Rollouts", value: String(successful) },
          { label: "Failed Rollouts", value: String(failed) },
          { label: "Success Rate", value: `${Math.round((successful / total) * 100)}%` },
          { label: "Best Flag", value: bestFlag?.name.slice(0, 14) || "—" },
          { label: "Worst Flag", value: worstFlag?.name.slice(0, 14) || "—" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card p-3"
          >
            <p className="text-[10px] text-ink-500 uppercase tracking-wider">{item.label}</p>
            <p className="mt-1 font-display text-sm font-semibold text-ink-900 truncate">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-4 rounded-xl2 bg-warning-50 border border-warning/20 p-3 flex items-center gap-3"
      >
        <AlertTriangle className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />
        <p className="text-sm text-warning">
          Most common rollback cause: <strong>{mostCommonCause}</strong>
        </p>
      </motion.div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Quality Timeline" subtitle={`Last ${days} days`} className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsQualityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="quality" stroke="#2563EB" strokeWidth={2.5} fill="url(#analyticsQualityFill)" name="Quality" />
              <Area type="monotone" dataKey="judgeScore" stroke="#22C55E" strokeWidth={2} fill="none" name="Judge Score" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Rollback Cause Distribution" subtitle="By trigger reason">
          <div className="flex h-[260px] items-center justify-center text-sm text-ink-500">
            No rollback data available
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Latency Timeline" subtitle={formatLatency(summary.latencyMs)}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={latencySeries} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" tickFormatter={(v: string) => new Date(v).getDate().toString()} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Line type="monotone" dataKey="latencyMs" stroke="#F59E0B" strokeWidth={2} dot={false} name="Latency (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Error Timeline" subtitle={`${summary.errorRate.toFixed(1)}% avg`}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={errorSeries} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsErrorFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" tickFormatter={(v: string) => new Date(v).getDate().toString()} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="errorRate" stroke="#EF4444" strokeWidth={2} fill="url(#analyticsErrorFill)" name="Error Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Daily Requests" subtitle="Platform-wide">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyRequests} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="requests" fill="#2563EB" radius={[4, 4, 0, 0]} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Daily AI Evaluations" subtitle="Judge evaluations">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyRequests} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="evaluations" fill="#22C55E" radius={[4, 4, 0, 0]} name="Evaluations" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Shadow Traffic History" subtitle="By flag">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={shadowTraffic} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="4 8" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="requests" fill="#F59E0B" radius={[0, 6, 6, 0]} name="Mirrored Requests" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Rollout Duration" subtitle="Per flag (days)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rolloutDurations} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="days" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Days" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Canary Pass Rate" subtitle={`${canaryPassRate}% overall`}>
          <div className="flex h-[220px] flex-col items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                <circle cx="64" cy="64" r="54" fill="none" stroke="#22C55E" strokeWidth="8" strokeDasharray={`${(canaryPassRate / 100) * 339.3} 339.3`} strokeLinecap="round" />
              </svg>
              <span className="absolute font-display text-2xl font-semibold text-ink-900">{canaryPassRate}%</span>
            </div>
            <div className="mt-4 flex gap-6 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Passed ({results.filter((r) => r.decision === "passed").length})</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-error" /> Failed ({results.filter((r) => r.decision === "failed").length})</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
