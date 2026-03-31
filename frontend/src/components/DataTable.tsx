/**
 * DataTable — responsive table for query results.
 */
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TableData } from "@/lib/api";

interface Props {
  data: TableData;
  className?: string;
  maxRows?: number;
}

export function DataTable({ data, className, maxRows = 50 }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visibleRows = expanded ? data.rows.slice(0, maxRows) : data.rows.slice(0, 8);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#1e2d45] bg-surface overflow-hidden animate-slide-up",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#1e2d45]">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Result data
        </span>
        <span className="text-xs text-text-muted">
          {data.total_rows.toLocaleString()} rows × {data.columns.length} cols
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1e2d45]">
              {data.columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2.5 text-left font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-[#1e2d45] transition-colors",
                  i % 2 === 0
                    ? "bg-transparent"
                    : "bg-surface-subtle/40",
                  "hover:bg-primary/5"
                )}
              >
                {(row as unknown[]).map((cell, j) => (
                  <td
                    key={j}
                    className="px-4 py-2.5 text-[#cbd5e1] whitespace-nowrap font-mono"
                  >
                    {cell === null || cell === undefined
                      ? <span className="text-text-muted italic">null</span>
                      : typeof cell === "number"
                      ? cell.toLocaleString()
                      : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expand / collapse */}
      {data.rows.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-text-muted
            hover:text-[#e2e8f0] hover:bg-surface-subtle transition-all border-t border-[#1e2d45]"
        >
          {expanded ? (
            <>
              <ChevronUp size={13} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={13} /> Show all {data.rows.length.toLocaleString()} rows
            </>
          )}
        </button>
      )}
    </div>
  );
}
