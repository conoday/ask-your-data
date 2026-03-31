/**
 * DatasetCard — card representing an uploaded dataset.
 */
"use client";

import { Database, Trash2, ArrowRight } from "lucide-react";
import { cn, formatNumber, qualityColor, qualityLabel, formatDate } from "@/lib/utils";
import type { DatasetSummary } from "@/lib/api";

interface Props {
  dataset: DatasetSummary;
  isActive?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export function DatasetCard({ dataset, isActive, onClick, onDelete, compact }: Props) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
          isActive
            ? "bg-primary/15 border border-primary/30 text-[#e2e8f0]"
            : "hover:bg-surface-subtle text-text-muted hover:text-[#e2e8f0]"
        )}
      >
        <Database size={14} className={isActive ? "text-primary-glow" : "text-text-muted"} />
        <span className="text-sm truncate">{dataset.name}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
        )}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-surface p-5 space-y-4 transition-all shadow-card",
        isActive
          ? "border-primary/40 shadow-glow"
          : "border-[#1e2d45] hover:border-primary/20"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Database size={18} className="text-primary-glow" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#e2e8f0] truncate">{dataset.name}</p>
          <p className="text-xs text-text-muted mt-0.5">{formatDate(dataset.created_at)}</p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-base font-bold text-[#e2e8f0]">{formatNumber(dataset.row_count)}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Rows</p>
        </div>
        <div className="text-center border-x border-[#1e2d45]">
          <p className="text-base font-bold text-[#e2e8f0]">{dataset.col_count}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Cols</p>
        </div>
        <div className="text-center">
          <p className={cn("text-base font-bold", qualityColor(dataset.quality_score))}>
            {dataset.quality_score}
          </p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Quality</p>
        </div>
      </div>

      {/* Quality bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>Data quality</span>
          <span className={qualityColor(dataset.quality_score)}>
            {qualityLabel(dataset.quality_score)}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-subtle overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              dataset.quality_score >= 80
                ? "bg-emerald-500"
                : dataset.quality_score >= 60
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
            style={{ width: `${dataset.quality_score}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      {onClick && (
        <button
          onClick={onClick}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
            isActive
              ? "bg-primary/20 text-primary-glow border border-primary/30"
              : "bg-surface-subtle text-text-muted hover:text-[#e2e8f0] hover:bg-primary/10 border border-[#1e2d45] hover:border-primary/20"
          )}
        >
          {isActive ? "Active" : "Analyze"}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
