/**
 * MetricCard — displays a single KPI / metric tile.
 */
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  accent?: "blue" | "green" | "yellow" | "red" | "cyan";
  className?: string;
}

const ACCENT_STYLES = {
  blue: {
    icon: "bg-primary/10 text-primary-glow",
    value: "text-primary-glow",
  },
  green: {
    icon: "bg-emerald-500/10 text-emerald-400",
    value: "text-emerald-400",
  },
  yellow: {
    icon: "bg-yellow-500/10 text-yellow-400",
    value: "text-yellow-400",
  },
  red: {
    icon: "bg-red-500/10 text-red-400",
    value: "text-red-400",
  },
  cyan: {
    icon: "bg-accent/10 text-accent",
    value: "text-accent",
  },
};

export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "blue",
  className,
}: Props) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={cn(
        "rounded-2xl bg-surface border border-[#1e2d45] p-4",
        "hover:border-primary/20 transition-all shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
            {label}
          </p>
          <p className={cn("text-2xl font-bold font-display", styles.value)}>
            {value}
          </p>
          {sub && <p className="text-xs text-text-muted">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", styles.icon)}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
