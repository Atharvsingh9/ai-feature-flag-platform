import { useMemo, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SearchBar } from "../components/common/SearchBar";
import { FilterDropdown } from "../components/common/FilterDropdown";
import { Button } from "../components/common/Button";
import { FlagTable } from "../components/flags/FlagTable";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { useFlags } from "../hooks/useFlags";
import { createFlag, deleteFlag } from "../services/flagService";
import type { FlagCreatePayload } from "../services/flagService";
import { CreateFlagModal } from "../components/flags/CreateFlagModal";
import { NotificationCenter, useToast } from "../components/common/NotificationCenter";
import { ConfirmationDialog } from "../components/common/ConfirmationDialog";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "rolled_back", label: "Rolled back" },
  { value: "draft", label: "Draft" },
];

const PAGE_SIZE = 7;

export default function FeatureFlags() {
  const { flags, loading, error, refetch } = useFlags();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toasts, addToast, dismiss } = useToast();

  const filtered = useMemo(() => {
    return flags.filter((f) => {
      const matchesQuery = f.name.toLowerCase().includes(query.toLowerCase()) || f.key.includes(query.toLowerCase());
      const matchesStatus = status === "all" || f.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [flags, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = useCallback(async (payload: FlagCreatePayload) => {
    await createFlag(payload);
    addToast("success", "Flag Created", `"${payload.name}" has been created.`);
    refetch();
  }, [addToast, refetch]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteFlag(deleteTarget);
      addToast("success", "Flag Deleted", "The flag has been removed.");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast("error", "Delete Failed", err instanceof Error ? err.message : "Failed to delete flag");
    }
  }, [deleteTarget, addToast, refetch]);

  if (loading) return <LoadingSpinner label="Loading feature flags..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Feature Flags"
        description="Manage gradual rollouts gated by live quality checks."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>Create Flag</Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search by name or key..." className="sm:max-w-xs" />
        <FilterDropdown value={status} options={STATUS_OPTIONS} onChange={(v) => { setStatus(v); setPage(1); }} />
        <span className="text-xs text-ink-500 sm:ml-auto">{filtered.length} flags</span>
      </div>

      <FlagTable flags={paged} onDelete={(id) => setDeleteTarget(id)} />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`focus-ring h-8 w-8 rounded-xl2 text-sm font-medium transition-colors ${
                page === i + 1 ? "bg-primary text-white" : "text-ink-500 hover:bg-black/5"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <CreateFlagModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete Flag?"
        description="This action cannot be undone. The flag and all associated data will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <NotificationCenter toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
