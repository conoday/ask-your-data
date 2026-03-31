/**
 * QueryHistory — list of saved/recent queries.
 */
"use client";

import { Star, Trash2, RefreshCw } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { SavedQuery } from "@/lib/api";

interface Props {
  queries: SavedQuery[];
  onRerun?: (q: SavedQuery) => void;
  onToggleFavorite?: (id: string, current: boolean) => void;
  onDelete?: (id: string) => void;
}

export function QueryHistory({
  queries,
  onRerun,
  onToggleFavorite,
  onDelete,
}: Props) {
  if (queries.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-text-muted text-sm">No saved queries yet.</p>
        <p className="text-text-muted text-xs mt-1">
          Ask a question and it will be saved here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {queries.map((q) => (
        <div
          key={q.id}
          className="group rounded-xl border border-[#1e2d45] bg-surface p-3.5
            hover:border-primary/20 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#e2e8f0] truncate">{q.question}</p>
              <p className="text-xs text-text-muted mt-1">
                {formatDate(q.created_at)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              {onRerun && (
                <button
                  onClick={() => onRerun(q)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    text-text-muted hover:text-primary-glow hover:bg-primary/10 transition-all"
                  title="Re-run query"
                >
                  <RefreshCw size={12} />
                </button>
              )}
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(q.id, q.is_favorite)}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                    q.is_favorite
                      ? "text-yellow-400 bg-yellow-500/10"
                      : "text-text-muted hover:text-yellow-400 hover:bg-yellow-500/10"
                  )}
                  title={q.is_favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star size={12} fill={q.is_favorite ? "currentColor" : "none"} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(q.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                    text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Result preview */}
          {q.result?.insight_text && (
            <p className="text-xs text-text-muted mt-2 line-clamp-2">
              {q.result.insight_text}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
