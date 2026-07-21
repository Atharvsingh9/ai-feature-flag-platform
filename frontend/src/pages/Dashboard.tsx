import { useMemo, useCallback } from "react";
import {
  Flag, Rocket, Gauge, RotateCcw, TestTube2, SplitSquareHorizontal,
  BarChart3, Clock, Target, CheckCircle2, XCircle,
  Activity, Download,
} from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { ChartCard } from "../components/dashboard/ChartCard";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { SystemHealth } from "../components/dashboard/SystemHealth";
import { QuickActions } from "../components/dashboard/QuickActions";
import { QualityChart } from "../components/quality/QualityChart";
import { ErrorRateChart } from "../components/quality/ErrorRateChart";
import { RolloutTimeline } from "../components/rollout/RolloutTimeline";
import { Button } from "../components/common/Button";
import { ErrorState } from "../components/common/ErrorState";
import { Skeleton } from "../components/common/Skeleton";
import { useFlags } from "../hooks/useFlags";
import { useRollouts } from "../hooks/useRollouts";
import { useQuality } from "../hooks/useQuality";
import { useCanary } from "../hooks/useCanary";
import { useShadowTests } from "../hooks/useShadowTests";
import { useDemo } from "../context/DemoContext";
import { exportToCsv } from "../utils/export";
import { formatLatency, formatPercentage } from "../utils/formatters";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import type { FeatureFlag } from "../types/flag";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  rolling_out: "Rolling Out",
  paused: "Paused",
  rolled_back: "Rolled Back",
};

const STATUS_COLORS_MAP: Record<string, string> = {
  active: "#22C55E",
  draft: "#CBD5E1",
  rolling_out: "#2563EB",
  paused: "#F59E0B",
  rolled_back: "#EF4444",
};

function FlagStatusChart({ flags }: { flags: FeatureFlag[] }) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    flags.forEach((f) => {
      const key = f.status || "draft";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [flags]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={counts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
          {counts.map((d) => (
            <Cell key={d.name} fill={STATUS_COLORS_MAP[d.name] || "#CBD5E1"} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }}
          formatter={(value, name) => [value, STATUS_LABELS[name as string] || name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="card p-4">
            <Skeleton className="mb-3 h-8 w-8 rounded-xl2" />
            <Skeleton className="mb-1 h-6 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { flags, loading: flagsLoading, error: flagsError, refetch: refetchFlags } = useFlags();
  const { rollouts, loading: rolloutsLoading } = useRollouts();
  const { series, summary, loading: qualityLoading } = useQuality();
  const { results } = useCanary();
  const { tests } = useShadowTests();
  const { tick } = useDemo();

  const handleExportDashboard = useCallback(() => {
    const h = ["Metric", "Value"];
    const r = [
      { Metric: "Active Flags", Value: flags.filter((f) => f.status === "active" || f.status === "rolling_out").length },
      { Metric: "Active Rollouts", Value: rollouts.length },
      { Metric: "Avg Quality", Value: summary ? +(summary.average + Math.sin(tick * 0.3) * 0.05).toFixed(2) : 0 },
      { Metric: "Auto Rollbacks", Value: flags.filter((f) => f.status === "rolled_back").length },
      { Metric: "Shadow Tests", Value: tests.length },
      { Metric: "Canary Success", Value: results.length > 0 ? `${Math.round((results.filter((r) => r.decision === "passed").length / results.length) * 100)}%` : "N/A" },
    ];
    exportToCsv("dashboard-metrics", h, r);
  }, [flags, rollouts.length, summary, tick, tests.length, results]);

  if (flagsLoading || rolloutsLoading || qualityLoading) {
    return <DashboardSkeleton />;
  }

  if (flagsError) {
    return <ErrorState message={flagsError} onRetry={refetchFlags} />;
  }

  const activeFlags = flags.filter((f) => f.status === "active" || f.status === "rolling_out").length;
  const rollbacks = flags.filter((f) => f.status === "rolled_back").length;
  const draftFlags = flags.filter((f) => f.status === "draft").length;
  const pausedFlags = flags.filter((f) => f.status === "paused").length;
  const shadow = tests.length;
  const canaryPassRate = results.length > 0 ? Math.round((results.filter((r) => r.decision === "passed").length / results.length) * 100) : 0;
  const successfulRollouts = flags.filter((f) => f.status === "active" || f.status === "completed").length;
  const failedRollouts = rollbacks;
  const activeCanary = results.filter((r) => r.decision === "passed").length;
  const avgLatency = summary?.latencyMs || 0;
  const errorRate = summary?.errorRate || 0;

  const demoQuality = summary ? +(summary.average + Math.sin(tick * 0.3) * 0.05).toFixed(2) : 0;
  const demoLatency = +(avgLatency + Math.sin(tick * 0.2) * 15).toFixed(0);
  const demoErrorRate = +(errorRate + Math.sin(tick * 0.25) * 0.1).toFixed(2);

  const topFlags = [...flags].sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="How healthy is the AI deployment platform right now."
        actions={
          <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={handleExportDashboard}>
            Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard index={0} label="Active Flags" value={String(activeFlags)} delta={`${draftFlags} draft`} trend="up" icon={<Flag className="h-5 w-5" />} accent="primary" />
        <StatCard index={1} label="Flags Rolling Out" value={String(rollouts.length)} delta="In progress" trend="up" icon={<Rocket className="h-5 w-5" />} accent="primary" />
        <StatCard index={2} label="Paused" value={String(pausedFlags)} delta="Paused" trend="flat" icon={<CheckCircle2 className="h-5 w-5" />} accent="warning" />
        <StatCard index={3} label="Rolled Back" value={String(rollbacks)} delta="-1 vs last week" trend="down" goodIsUp={false} icon={<RotateCcw className="h-5 w-5" />} accent="error" />
        <StatCard index={4} label="Avg Quality Score" value={demoQuality.toFixed(2)} delta={summary ? `${summary.trendDelta > 0 ? "+" : ""}${summary.trendDelta}` : ""} trend={summary?.trend} icon={<Gauge className="h-5 w-5" />} accent="success" />
        <StatCard index={5} label="Avg Latency" value={formatLatency(demoLatency)} delta="Average" icon={<Clock className="h-5 w-5" />} accent="warning" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard index={6} label="Error Rate" value={formatPercentage(demoErrorRate, 1)} delta={demoErrorRate > 2 ? "Elevated" : "Normal"} goodIsUp={false} icon={<Activity className="h-5 w-5" />} accent={demoErrorRate > 2 ? "error" : "success"} />
        <StatCard index={7} label="Active Canary" value={String(activeCanary)} delta="Running" trend="flat" icon={<SplitSquareHorizontal className="h-5 w-5" />} accent="primary" />
        <StatCard index={8} label="Shadow Executions" value={String(shadow)} delta="Active" icon={<TestTube2 className="h-5 w-5" />} accent="warning" />
        <StatCard index={9} label="Successful Rollouts" value={String(successfulRollouts)} delta="+3 this month" trend="up" icon={<BarChart3 className="h-5 w-5" />} accent="success" />
        <StatCard index={10} label="Failed Rollouts" value={String(failedRollouts)} delta="-2 vs last month" trend="down" goodIsUp={false} icon={<XCircle className="h-5 w-5" />} accent="error" />
        <StatCard index={11} label="Canary Success" value={`${canaryPassRate}%`} delta={`${results.length} analyzed`} trend="flat" icon={<Target className="h-5 w-5" />} accent="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartCard title="Quality Trend" subtitle="14-day rolling average" className="xl:col-span-2">
          <QualityChart data={series} />
        </ChartCard>
        <ChartCard title="Flag Status Distribution" subtitle="All flags by status">
          <FlagStatusChart flags={flags} />
          <div className="mt-1 flex flex-wrap justify-center gap-3 text-[10px] text-ink-500">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <span key={key} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS_MAP[key] }} />
                {label}
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Rollout Progress" subtitle="Most advanced active rollout">
          {rollouts[0] && <RolloutTimeline stages={rollouts[0].stages} currentStageIndex={rollouts[0].currentStageIndex} />}
          {!rollouts[0] && <p className="text-sm text-ink-500 py-8 text-center">No active rollouts</p>}
        </ChartCard>
        <ChartCard title="Error Rate" subtitle="Aggregated across flags">
          <ErrorRateChart data={series} />
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-4">
        <ChartCard title="Top Active Flags" subtitle="Highest quality scores" className="lg:col-span-1">
          <div className="space-y-2.5">
            {topFlags.map((f, i) => (
              <div key={f.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-ink-500 w-4">{i + 1}.</span>
                  <span className="truncate text-sm text-ink-900">{f.name}</span>
                </div>
                <span className={`text-xs font-medium shrink-0 ${f.qualityScore >= 4.5 ? "text-success" : f.qualityScore >= 4.0 ? "text-primary" : "text-warning"}`}>
                  {f.qualityScore.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Recent Activity" className="lg:col-span-1">
          <ActivityFeed compact />
        </ChartCard>
        <div className="flex flex-col gap-5 lg:col-span-2">
          <ChartCard title="Quick Actions">
            <QuickActions />
          </ChartCard>
          <ChartCard title="System Health">
            <SystemHealth />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
