const ITEMS = [
  { label: "API Gateway", status: "operational" },
  { label: "Quality Judge Service", status: "operational" },
  { label: "Rollout Orchestrator", status: "operational" },
  { label: "Shadow Test Runner", status: "degraded" },
];

const DOT: Record<string, string> = {
  operational: "bg-success",
  degraded: "bg-warning",
  down: "bg-error",
};

const TEXT: Record<string, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

export function SystemHealth() {
  return (
    <div className="space-y-3">
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-sm">
          <span className="text-ink-700">{item.label}</span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
            <span className={`h-1.5 w-1.5 rounded-full ${DOT[item.status]}`} />
            {TEXT[item.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
