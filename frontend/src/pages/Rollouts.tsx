import { PageHeader } from "../components/layout/PageHeader";
import { StageCard } from "../components/rollout/StageCard";
import { RolloutTimeline } from "../components/rollout/RolloutTimeline";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { useRollouts } from "../hooks/useRollouts";

export default function Rollouts() {
  const { rollouts, loading, error, refetch } = useRollouts();

  if (loading) return <LoadingSpinner label="Loading rollouts..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Rollouts" description="Where is each deployment currently, and how fast is it advancing?" />

      {rollouts.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">No rollouts are currently in progress.</div>
      ) : (
        <div className="space-y-6">
          {rollouts.map((r) => (
            <div key={r.id}>
              <div className="card mb-4 overflow-x-auto p-6">
                <div className="min-w-[520px]">
                  <RolloutTimeline stages={r.stages} currentStageIndex={r.currentStageIndex} />
                </div>
              </div>
              <StageCard rollout={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
