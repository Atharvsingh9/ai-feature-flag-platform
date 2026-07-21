interface ConfidenceCardProps {
  confidence: number;
  significant: boolean;
}

export function ConfidenceCard({ confidence, significant }: ConfidenceCardProps) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (confidence / 100) * circumference;
  return (
    <div className="card flex flex-col items-center p-6">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#EFF4FF" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#2563EB"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-semibold text-ink-900">{confidence}%</span>
          <span className="text-[10px] text-ink-500">confidence</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-500">
        {significant ? "Statistically significant" : "Not yet significant"}
      </p>
    </div>
  );
}
