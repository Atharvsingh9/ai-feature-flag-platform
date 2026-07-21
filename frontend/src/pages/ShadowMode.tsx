import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TestTube2, Activity, Gauge, Clock, AlertTriangle, X, Eye } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { ChartCard } from "../components/dashboard/ChartCard";
import { Badge } from "../components/common/Badge";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { useShadowTests } from "../hooks/useShadowTests";
import { formatCompact, formatLatency } from "../utils/formatters";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  running: "bg-success-50 text-success",
  completed: "bg-primary-50 text-primary",
  failed: "bg-error-50 text-error",
  paused: "bg-warning-50 text-warning",
};

export default function ShadowMode() {
  const { tests, overview, series, loading, error, refetch } = useShadowTests();
  const [selectedTest, setSelectedTest] = useState<typeof tests[0] | null>(null);

  if (loading || !overview) return <LoadingSpinner label="Loading shadow deployments..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Shadow Mode"
        description="Monitor all shadow deployments running in the platform."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard index={0} label="Active Shadow Tests" value={String(overview.activeTests)} delta="Running" icon={<TestTube2 className="h-5 w-5" />} accent="primary" />
        <StatCard index={1} label="Mirrored Requests" value={formatCompact(overview.mirroredRequests)} delta="Total" icon={<Activity className="h-5 w-5" />} accent="primary" />
        <StatCard index={2} label="Avg Shadow Quality" value={overview.averageQuality.toFixed(2)} delta="/5.0" icon={<Gauge className="h-5 w-5" />} accent="success" />
        <StatCard index={3} label="Avg Latency" value={formatLatency(overview.averageLatency)} delta="Average" icon={<Clock className="h-5 w-5" />} accent="warning" />
        <StatCard index={4} label="Error Rate" value={`${overview.errorRate.toFixed(1)}%`} delta="Across all tests" goodIsUp={false} icon={<AlertTriangle className="h-5 w-5" />} accent="error" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartCard title="Shadow Quality Over Time" subtitle="14-day trend" className="xl:col-span-1">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="shadowQualityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="quality" stroke="#2563EB" strokeWidth={2.5} fill="url(#shadowQualityFill)" name="Quality" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Shadow Requests" subtitle="Daily mirrored requests" className="xl:col-span-1">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar dataKey="requests" fill="#2563EB" radius={[6, 6, 0, 0]} name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Shadow Latency" subtitle="Average response time" className="xl:col-span-1">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="timestamp" tickFormatter={(v: string) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Line type="monotone" dataKey="latencyMs" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="Latency (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-5">
        <ChartCard title="Shadow Tests" subtitle={`${tests.length} total deployments`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-300/10 text-left text-xs font-medium text-ink-500">
                  <th className="pb-3 pr-4">Flag</th>
                  <th className="pb-3 pr-4">Baseline</th>
                  <th className="pb-3 pr-4">Experimental</th>
                  <th className="pb-3 pr-4 text-right">Requests</th>
                  <th className="pb-3 pr-4 text-right">Quality</th>
                  <th className="pb-3 pr-4 text-right">Latency</th>
                  <th className="pb-3 pr-4 text-right">Errors</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {tests.map((test, i) => (
                  <motion.tr
                    key={test.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="cursor-pointer border-b border-ink-300/5 transition-colors hover:bg-surface-bg"
                    onClick={() => setSelectedTest(test)}
                  >
                    <td className="py-3 pr-4 font-medium text-ink-900">{test.flagName}</td>
                    <td className="py-3 pr-4 text-ink-700">{test.baselineVariant}</td>
                    <td className="py-3 pr-4 text-ink-700">{test.experimentalVariant}</td>
                    <td className="py-3 pr-4 text-right text-ink-900">{formatCompact(test.mirroredRequests)}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className={test.qualityScore >= 4.0 ? "text-success" : test.qualityScore >= 3.5 ? "text-warning" : "text-error"}>
                        {test.qualityScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-ink-900">{formatLatency(test.latencyMs)}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className={test.errors === 0 ? "text-success" : "text-error"}>{test.errors}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[test.status]}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${test.status === "running" ? "bg-success animate-pulseRing" : test.status === "completed" ? "bg-primary" : test.status === "failed" ? "bg-error" : "bg-warning"}`} />
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="focus-ring rounded-lg p-1.5 text-ink-500 hover:bg-black/5">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      <AnimatePresence>
        {selectedTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/30 p-4 pt-12 backdrop-blur-sm"
            onClick={() => setSelectedTest(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="card w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink-900">{selectedTest.flagName}</h3>
                  <p className="text-sm text-ink-500">Shadow Evaluation Details</p>
                </div>
                <button onClick={() => setSelectedTest(null)} className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-black/5">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl2 bg-surface-bg p-4">
                  <p className="text-xs font-semibold text-ink-500 mb-2">Baseline Prompt</p>
                  <p className="text-sm text-ink-700">{selectedTest.baselinePrompt}</p>
                </div>
                <div className="rounded-xl2 bg-surface-bg p-4">
                  <p className="text-xs font-semibold text-ink-500 mb-2">Experimental Prompt</p>
                  <p className="text-sm text-ink-700">{selectedTest.experimentalPrompt}</p>
                </div>
              </div>

              <div className="rounded-xl2 bg-surface-bg p-4 mb-6">
                <p className="text-xs font-semibold text-ink-500 mb-2">Shadow Output</p>
                <p className="text-sm text-ink-700">{selectedTest.shadowOutput}</p>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-xs text-ink-500">Judge Score</p>
                  <p className="font-display text-xl font-semibold text-primary">{selectedTest.judgeScore.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ink-500">Latency</p>
                  <p className="font-display text-xl font-semibold text-warning">{formatLatency(selectedTest.latencyMs)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ink-500">Errors</p>
                  <p className={`font-display text-xl font-semibold ${selectedTest.errors === 0 ? "text-success" : "text-error"}`}>{selectedTest.errors}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-ink-500">Status</p>
                  <Badge status={selectedTest.status === "running" ? "active" : selectedTest.status === "completed" ? "completed" : selectedTest.status === "failed" ? "rolled_back" : "paused"} label={selectedTest.status.charAt(0).toUpperCase() + selectedTest.status.slice(1)} />
                </div>
              </div>

              <div className="rounded-xl2 bg-surface-bg p-4 mb-6">
                <p className="text-xs font-semibold text-ink-500 mb-2">Feedback</p>
                <p className="text-sm text-ink-700">{selectedTest.feedback}</p>
              </div>

              <div className="rounded-xl2 bg-surface-bg p-4 mb-6">
                <p className="text-xs font-semibold text-ink-500 mb-2">Difference Analysis</p>
                <p className="text-sm text-ink-700">{selectedTest.differenceAnalysis}</p>
              </div>

              <div className="rounded-xl2 border border-ink-300/20 p-5">
                <p className="text-xs font-semibold text-ink-500 mb-4 text-center">Architecture Diagram</p>
                <div className="flex flex-col items-center gap-3 text-xs">
                  <div className="flex items-center gap-8">
                    <div className="rounded-xl bg-primary-50 px-4 py-2 text-primary font-medium">Baseline Response</div>
                    <div className="text-ink-500">↓</div>
                    <div className="rounded-xl bg-success-50 px-4 py-2 text-success font-medium">Shown to User</div>
                  </div>
                  <div className="h-6 w-0.5 bg-ink-300/30" />
                  <div className="flex items-center gap-8">
                    <div className="rounded-xl bg-warning-50 px-4 py-2 text-warning font-medium">Experimental Response</div>
                    <div className="text-ink-500">↓</div>
                    <div className="rounded-xl bg-ink-300/20 px-4 py-2 text-ink-700 font-medium">Shadow Evaluation</div>
                  </div>
                  <div className="h-6 w-0.5 bg-ink-300/30" />
                  <div className="rounded-xl bg-ink-300/10 px-4 py-2 text-ink-500 font-medium">Stored in Database</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
