import { memo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { QualityPoint } from "../../types/quality";
import { formatDate } from "../../utils/formatters";

export const ErrorRateChart = memo(function ErrorRateChart({ data }: { data: QualityPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="timestamp" tickFormatter={(v) => formatDate(v).replace(/,.*/, "")} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }} />
        <Bar dataKey="errorRate" fill="#EF4444" radius={[6, 6, 0, 0]} name="Error rate (%)" />
      </BarChart>
    </ResponsiveContainer>
  );
});
