import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

interface RolloutTimelineProps {
  stages: string[];
  currentStageIndex: number;
}

export function RolloutTimeline({ stages, currentStageIndex }: RolloutTimelineProps) {
  return (
    <div className="flex items-center">
      {stages.map((stage, i) => {
        const done = i < currentStageIndex;
        const current = i === currentStageIndex;
        return (
          <div key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{ scale: current ? 1.12 : 1 }}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  done && "border-success bg-success text-white",
                  current && "border-primary bg-primary text-white shadow-glow",
                  !done && !current && "border-ink-300/50 bg-white text-ink-500"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : stage}
              </motion.div>
              <span className={cn("text-xs font-medium", current ? "text-primary" : "text-ink-500")}>{stage}</span>
            </div>
            {i < stages.length - 1 && (
              <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-ink-300/20 sm:mx-3">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", done ? "w-full bg-success" : "w-0 bg-primary")}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
