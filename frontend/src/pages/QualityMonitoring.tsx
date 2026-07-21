import { useState, useCallback } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { ChartCard } from "../components/dashboard/ChartCard";
import { LatencyChart } from "../components/quality/LatencyChart";
import { ErrorRateChart } from "../components/quality/ErrorRateChart";
import { JudgeScoreCard } from "../components/quality/JudgeScoreCard";
import { QualityEvaluationDrawer } from "../components/quality/QualityEvaluationDrawer";
import { FilterDropdown } from "../components/common/FilterDropdown";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useQuality } from "../hooks/useQuality";
import { formatLatency, formatPercentage, formatDate } from "../utils/formatters";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { QualityPoint } from "../types/quality";

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
];

export default function QualityMonitoring() {
  const [days, setDays] = useState("14");
  const { series, summary, loading } = useQuality(Number(days));
  const [selectedPoint, setSelectedPoint] = useState<QualityPoint | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  type ChartClickData = { activePayload?: { payload: QualityPoint }[] };
  const handleChartClick = useCallback((nextState: ChartClickData) => {
    const point = nextState?.activePayload?.[0]?.payload;
    if (point) {
      setSelectedPoint(point);
      setDrawerOpen(true);
    }
  }, []);

  if (loading || !summary) return <LoadingSpinner label="Crunching quality metrics..." />;

  return (
    <div>
      <PageHeader
        title="Quality Monitoring"
        description="Live judge scores, latency, and error rates across every AI-powered flag. Click any chart point for details."
        actions={<FilterDropdown value={days} options={RANGE_OPTIONS} onChange={setDays} />}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <JudgeScoreCard label="Average Quality" value={summary.average.toFixed(2)} trend={summary.trend} delta={`${summary.trendDelta > 0 ? "+" : ""}${summary.trendDelta}`} />
        <JudgeScoreCard label="Judge Score" value={summary.judgeScore.toFixed(2)} />
        <JudgeScoreCard label="Latency" value={formatLatency(summary.latencyMs)} />
        <JudgeScoreCard label="P10" value={summary.p10.toFixed(2)} />
        <JudgeScoreCard label="Std Deviation" value={summary.stdDev.toFixed(2)} />
        <JudgeScoreCard label="Error Rate" value={formatPercentage(summary.errorRate, 1)} trend={summary.errorRate > 1.5 ? "up" : "down"} delta={formatPercentage(summary.errorRate, 1)} goodIsUp={false} />
      </div>

      <div className="mt-5">
        <ChartCard title="Quality Score Over Time" subtitle={`Rolling window · last ${days} days · Click a point for details`}>
          <div className="cursor-pointer">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} onClick={(data: unknown) => handleChartClick(data as ChartClickData)}>
                <defs>
                  <linearGradient id="qualityFillClick" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="timestamp" tickFormatter={(v) => formatDate(v).replace(/,.*/, "")} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} labelFormatter={(v) => formatDate(v as string)} />
                <Area type="monotone" dataKey="quality" stroke="#2563EB" strokeWidth={2.5} fill="url(#qualityFillClick)" name="Quality" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Latency">
          <LatencyChart data={series} />
        </ChartCard>
        <ChartCard title="Judge Score">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" tickFormatter={(v) => formatDate(v).replace(/,.*/, "")} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Line type="monotone" dataKey="judgeScore" stroke="#22C55E" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="User Feedback">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" tickFormatter={(v) => formatDate(v).replace(/,.*/, "")} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Line type="monotone" dataKey="userFeedback" stroke="#2563EB" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Error Rate">
          <ErrorRateChart data={series} />
        </ChartCard>
      </div>

      <QualityEvaluationDrawer open={drawerOpen} point={selectedPoint} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
