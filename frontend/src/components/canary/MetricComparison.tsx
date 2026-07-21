import type { MetricComparisonRow } from "../../types/canary";
import { cn } from "../../utils/cn";

function isBetter(row: MetricComparisonRow) {
  return row.higherIsBetter ? row.experimental >= row.baseline : row.experimental <= row.baseline;
}

export function MetricComparison({ rows }: { rows: MetricComparisonRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-300/20 text-xs uppercase tracking-wide text-ink-500">
            <th className="py-3 font-medium">Metric</th>
            <th className="py-3 font-medium">Baseline</th>
            <th className="py-3 font-medium">Experimental</th>
            <th className="py-3 font-medium text-right">Delta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const good = isBetter(row);
            const delta = row.experimental - row.baseline;
            return (
              <tr key={row.metric} className="border-b border-ink-300/10 last:border-0">
                <td className="py-3 font-medium text-ink-900">{row.metric}</td>
                <td className="py-3 text-ink-500">
                  {row.baseline}
                  {row.unit}
                </td>
                <td className="py-3 text-ink-900">
                  {row.experimental}
                  {row.unit}
                </td>
                <td className={cn("py-3 text-right font-medium", good ? "text-success" : "text-error")}>
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(2)}
                  {row.unit}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
