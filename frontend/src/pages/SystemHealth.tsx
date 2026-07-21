import { useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse, Cpu, MemoryStick, Activity, Wifi, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { useSystemHealth } from "../hooks/useSystemHealth";
import { formatLatency, formatCompact } from "../utils/formatters";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ServiceHealth } from "../types/health";

const STATUS_ICONS: Record<string, any> = {
  operational: CheckCircle2,
  degraded: AlertTriangle,
  down: AlertTriangle,
};

const STATUS_COLORS: Record<string, string> = {
  operational: "text-success",
  degraded: "text-warning",
  down: "text-error",
};

const STATUS_BG: Record<string, string> = {
  operational: "bg-success-50 text-success border-success/20",
  degraded: "bg-warning-50 text-warning border-warning/20",
  down: "bg-error-50 text-error border-error/20",
};

const STATUS_LABELS: Record<string, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

function ServiceCard({ service }: { service: ServiceHealth }) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = STATUS_ICONS[service.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 cursor-pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl2 ${service.status === "operational" ? "bg-success-50" : "bg-error-50"}`}>
            <HeartPulse className={`h-5 w-5 ${STATUS_COLORS[service.status]}`} />
          </div>
          <div>
            <p className="font-medium text-ink-900">{service.name}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-medium ${STATUS_COLORS[service.status]}`}>
              <StatusIcon className="h-3 w-3" />
              {STATUS_LABELS[service.status]}
            </span>
          </div>
        </div>
        <div className={`rounded-pill border px-3 py-1 text-xs font-medium ${STATUS_BG[service.status]}`}>
          {service.uptimePercent}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-surface-bg p-2.5 text-center">
          <Cpu className="mx-auto h-4 w-4 text-ink-500 mb-1" />
          <p className="text-xs font-medium text-ink-900">{service.cpuPercent}%</p>
          <p className="text-[10px] text-ink-500">CPU</p>
        </div>
        <div className="rounded-xl bg-surface-bg p-2.5 text-center">
          <MemoryStick className="mx-auto h-4 w-4 text-ink-500 mb-1" />
          <p className="text-xs font-medium text-ink-900">{service.memoryMb}MB</p>
          <p className="text-[10px] text-ink-500">Memory</p>
        </div>
        <div className="rounded-xl bg-surface-bg p-2.5 text-center">
          <Activity className="mx-auto h-4 w-4 text-ink-500 mb-1" />
          <p className="text-xs font-medium text-ink-900">{formatLatency(service.latencyMs)}</p>
          <p className="text-[10px] text-ink-500">Latency</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-lg bg-surface-bg px-3 py-2">
          <span className="text-xs text-ink-500">Requests</span>
          <span className="text-xs font-medium text-ink-900">{formatCompact(service.requestsPerMin)}/min</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-surface-bg px-3 py-2">
          <span className="text-xs text-ink-500">Failures</span>
          <span className={`text-xs font-medium ${service.failuresPerMin > 0 ? "text-error" : "text-success"}`}>
            {service.failuresPerMin}/min
          </span>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-4 overflow-hidden"
        >
          <p className="text-xs font-semibold text-ink-500 mb-2">Health Timeline (24h)</p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={service.history} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={`healthFill${service.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="time" tickFormatter={(v: string) => new Date(v).getHours() + "h"} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 1]} />
              <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="stepAfter" dataKey="status" stroke="#22C55E" strokeWidth={2} fill={`url(#healthFill${service.id})`} name="Status" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function SystemHealthPage() {
  const { services, loading, error, refetch } = useSystemHealth();

  if (loading) return <LoadingSpinner label="Checking system health..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const operational = services.filter((s) => s.status === "operational").length;
  const degraded = services.filter((s) => s.status === "degraded").length;
  const down = services.filter((s) => s.status === "down").length;

  return (
    <div>
      <PageHeader
        title="System Health"
        description="Real-time health monitoring for all platform services."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-5">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="font-display text-xl font-semibold text-ink-900">{operational}</p>
              <p className="text-xs text-ink-500">Operational</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-display text-xl font-semibold text-ink-900">{degraded}</p>
              <p className="text-xs text-ink-500">Degraded</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-error" />
            <div>
              <p className="font-display text-xl font-semibold text-ink-900">{down}</p>
              <p className="text-xs text-ink-500">Down</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Wifi className="h-5 w-5 text-primary" />
            <div>
              <p className="font-display text-xl font-semibold text-ink-900">{services.length}</p>
              <p className="text-xs text-ink-500">Total Services</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
