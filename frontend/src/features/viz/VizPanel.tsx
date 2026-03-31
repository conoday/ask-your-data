/**
 * VizPanel — right-side panel showing chart + table + insights.
 */
"use client";

import { BarChart3, Table2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ChartPanel } from "@/components/ChartPanel";
import { DataTable } from "@/components/DataTable";
import { InsightCard } from "@/components/InsightCard";
import { ChartSkeleton, LoadingSkeleton } from "@/components/LoadingSkeleton";

export function VizPanel() {
  const { activeChart, activeTable, activeInsight, activeConfidence, isQueryLoading } = useAppStore();

  const isEmpty = !activeChart && !activeTable && !activeInsight;

  if (isQueryLoading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4 overflow-y-auto">
        <ChartSkeleton />
        <div className="rounded-2xl bg-surface border border-[#1e2d45] p-4 space-y-3">
          <LoadingSkeleton lines={4} />
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center p-8 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-[#1e2d45]
          flex items-center justify-center">
          <BarChart3 size={28} className="text-text-muted" />
        </div>
        <div>
          <p className="text-[#cbd5e1] font-semibold">Visualization will appear here</p>
          <p className="text-text-muted text-sm mt-1">
            Ask a question in the chat panel →
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-4">
          {[
            { icon: BarChart3, label: "Bar charts" },
            { icon: BarChart3, label: "Area trends" },
            { icon: Table2, label: "Data tables" },
            { icon: BarChart3, label: "Pie breakdowns" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl border border-[#1e2d45] bg-surface p-3
                flex items-center gap-2 text-sm text-text-muted"
            >
              <Icon size={14} className="text-primary-glow flex-shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {activeChart && <ChartPanel spec={activeChart} />}

      {activeInsight && activeChart && (
        <InsightCard insight={activeInsight} confidence={activeConfidence} />
      )}

      {activeTable && <DataTable data={activeTable} />}
    </div>
  );
}
