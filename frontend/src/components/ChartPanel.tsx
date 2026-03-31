/**
 * ChartPanel — renders a ChartSpec using Recharts.
 */
"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChartSpec } from "@/lib/api";

const COLORS = [
  "#6366f1", "#22d3ee", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#131929",
    border: "1px solid #1e2d45",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#e2e8f0",
  },
  cursor: { fill: "rgba(99,102,241,0.05)" },
};

interface Props {
  spec: ChartSpec;
  className?: string;
}

export function ChartPanel({ spec, className }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chart = renderChart(spec);

  return (
    <div
      className={cn(
        "rounded-2xl bg-surface border border-[#1e2d45] p-5 space-y-4 animate-slide-up",
        isFullscreen && "fixed inset-4 z-50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#e2e8f0] font-display line-clamp-1">
          {spec.title}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-7 h-7 rounded-lg bg-surface-subtle border border-[#1e2d45]
              flex items-center justify-center text-text-muted hover:text-[#e2e8f0] transition-colors"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>

      {/* Chart type badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 rounded-md bg-surface-subtle border border-[#1e2d45] text-text-muted font-mono">
          {spec.type}
        </span>
        {spec.x && (
          <span className="text-xs text-text-muted">
            {spec.x} × {spec.y}
          </span>
        )}
      </div>
    </div>
  );
}

function renderChart(spec: ChartSpec) {
  const { type, data, x, y, color_key } = spec;

  switch (type) {
    case "bar":
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis dataKey={x} tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey={y!} fill="#6366f1" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      );

    case "line":
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis dataKey={x} tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Line
            type="monotone"
            dataKey={y!}
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: "#6366f1", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      );

    case "area":
      return (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis dataKey={x} tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey={y!}
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#areaGrad)"
          />
        </AreaChart>
      );

    case "pie":
      return (
        <PieChart>
          <Pie
            data={data}
            dataKey={y || "count"}
            nameKey={x}
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={45}
            paddingAngle={3}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} />
        </PieChart>
      );

    case "scatter":
      return (
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis dataKey={x} name={x} tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis dataKey={y} name={y} tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Scatter data={data} fill="#6366f1" />
        </ScatterChart>
      );

    default:
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
          <XAxis dataKey={x} tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey={y!} fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
  }
}
