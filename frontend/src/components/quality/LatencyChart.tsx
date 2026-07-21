import { memo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { QualityPoint } from "../../types/quality";
import { formatDate } from "../../utils/formatters";

export const LatencyChart = memo(function LatencyChart({ data }: { data: QualityPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="timestamp" tickFormatter={(v) => formatDate(v).replace(/,.*/, "")} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
        <Line type="monotone" dataKey="latencyMs" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="Latency (ms)" />
      </LineChart>
    </ResponsiveContainer>
  );
});
