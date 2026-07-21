interface ConfigCardProps {
  title: string;
  accent: "primary" | "success" | "warning";
  config: { model: string; prompt: string; temperature: number };
}

export function FlagConfiguration({ title, accent, config }: ConfigCardProps) {
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accent === "primary" ? "bg-primary" : accent === "success" ? "bg-success" : "bg-warning"}`} />
        <h3 className="font-display text-sm font-semibold text-ink-900">{title}</h3>
      </div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-xs text-ink-500">Model</dt>
          <dd className="font-mono text-ink-900">{config.model}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Prompt</dt>
          <dd className="rounded-xl bg-surface-bg p-2.5 font-mono text-xs leading-relaxed text-ink-700">{config.prompt}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Temperature</dt>
          <dd className="text-ink-900">{config.temperature}</dd>
        </div>
      </dl>
    </div>
  );
}
