import { useEffect, useState } from "react";
import { LayoutList, ListTree } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { SearchBar } from "../components/common/SearchBar";
import { RollbackTimeline } from "../components/rollback/RollbackTimeline";
import { RollbackTable } from "../components/rollback/RollbackTable";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { getRollbackEvents } from "../services/rollbackService";
import type { RollbackEvent } from "../types/rollback";

export default function RollbackHistory() {
  const [events, setEvents] = useState<RollbackEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"timeline" | "table">("timeline");

  useEffect(() => {
    let active = true;
    getRollbackEvents().then((data) => {
      if (active) {
        setEvents(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading rollback history..." />;

  const filtered = events.filter((e) => e.flagName.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Rollback History"
        description="Every automatic and manual rollback event, with the trigger that caused it."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by flag name..." className="sm:max-w-xs" />
        <div className="flex gap-1 rounded-xl2 border border-ink-300/40 bg-white p-1 sm:ml-auto">
          <button
            onClick={() => setView("timeline")}
            className={`focus-ring flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium ${view === "timeline" ? "bg-primary-50 text-primary" : "text-ink-500"}`}
          >
            <ListTree className="h-3.5 w-3.5" /> Timeline
          </button>
          <button
            onClick={() => setView("table")}
            className={`focus-ring flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium ${view === "table" ? "bg-primary-50 text-primary" : "text-ink-500"}`}
          >
            <LayoutList className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {view === "timeline" ? <RollbackTimeline events={filtered} /> : <RollbackTable events={filtered} />}
    </div>
  );
}
