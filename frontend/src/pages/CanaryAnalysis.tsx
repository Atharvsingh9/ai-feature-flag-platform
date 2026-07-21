import { useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { CanaryComparison } from "../components/canary/CanaryComparison";
import { FilterDropdown } from "../components/common/FilterDropdown";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { useCanary } from "../hooks/useCanary";

export default function CanaryAnalysis() {
  const { results, loading, error, refetch } = useCanary();
  const [filter, setFilter] = useState("all");

  if (loading) return <LoadingSpinner label="Comparing baseline vs experimental..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filtered = results.filter((r) => filter === "all" || r.decision === filter);

  return (
    <div>
      <PageHeader
        title="Canary Analysis"
        description="Baseline vs experimental comparisons with statistical confidence."
        actions={
          <FilterDropdown
            value={filter}
            options={[
              { value: "all", label: "All results" },
              { value: "passed", label: "Passed" },
              { value: "failed", label: "Failed" },
            ]}
            onChange={setFilter}
          />
        }
      />

      <div className="space-y-5">
        {filtered.map((r) => (
          <CanaryComparison key={r.id} result={r} />
        ))}
        {filtered.length === 0 && <div className="card p-10 text-center text-sm text-ink-500">No canary results match this filter.</div>}
      </div>
    </div>
  );
}
