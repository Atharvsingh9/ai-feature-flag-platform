import { memo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { QualityPoint } from "../../types/quality";
import { formatDate } from "../../utils/formatters";

interface QualityChartProps {
  data: QualityPoint[];
  height?: number;
}

export const QualityChart = memo(function QualityChart({ data, height = 280 }: QualityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="qualityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#E2E8F0" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(v) => formatDate(v).replace(/,.*/, "")}
          tick={{ fontSize: 11, fill: "#64748B" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 14, border: "1px solid #E2E8F0", fontSize: 12 }}
          labelFormatter={(v) => formatDate(v as string)}
        />
        <Area type="monotone" dataKey="quality" stroke="#2563EB" strokeWidth={2.5} fill="url(#qualityFill)" name="Quality" />
      </AreaChart>
    </ResponsiveContainer>
  );
});
