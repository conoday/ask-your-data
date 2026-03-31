/**
 * Saved Queries page.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useAppStore } from "@/lib/store";
import { queriesApi, queryApi, type SavedQuery } from "@/lib/api";
import { QueryHistory } from "@/components/QueryHistory";

export default function QueriesPage() {
  const router = useRouter();
  const { savedQueries, setSavedQueries, activeDataset, setActiveViz } = useAppStore();
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  const refresh = async () => {
    const list = await queriesApi.list();
    setSavedQueries(list);
  };

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  const handleToggleFavorite = async (id: string, current: boolean) => {
    await queriesApi.toggleFavorite(id, !current);
    refresh();
  };

  const handleDelete = async (id: string) => {
    await queriesApi.delete(id);
    toast.success("Query deleted.");
    refresh();
  };

  const handleRerun = async (q: SavedQuery) => {
    if (!activeDataset) {
      toast.error("Select a dataset first.");
      return;
    }
    const result = await queryApi.run(activeDataset.id, q.question);
    setActiveViz(
      result.chart_spec ?? null,
      result.table_data ?? null,
      result.insight_text,
      result.confidence_score
    );
    router.push("/app");
  };

  const displayed = filter === "favorites"
    ? savedQueries.filter((q) => q.is_favorite)
    : savedQueries;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-[#e2e8f0]">Saved Queries</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Your query history and favorites
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "favorites"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? "bg-primary/15 text-primary-glow border border-primary/30"
                : "text-text-muted hover:text-[#e2e8f0] border border-[#1e2d45] hover:border-primary/20"
            }`}
          >
            {f === "favorites" ? (
              <span className="flex items-center gap-1.5">
                <Star size={13} /> Favorites
              </span>
            ) : (
              "All queries"
            )}
          </button>
        ))}
        <span className="ml-auto text-sm text-text-muted self-center">
          {displayed.length} queries
        </span>
      </div>

      {/* Query list */}
      <QueryHistory
        queries={displayed}
        onRerun={handleRerun}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
      />
    </div>
  );
}
