/**
 * LoadingSkeleton — shimmer placeholder for any content.
 */
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  lines?: number;
}

export function LoadingSkeleton({ className, lines = 3 }: Props) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 rounded-lg shimmer",
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface p-5 border border-[#1e2d45] space-y-3",
        className
      )}
    >
      <div className="h-5 w-1/2 rounded-lg shimmer" />
      <div className="h-4 w-3/4 rounded-lg shimmer" />
      <div className="h-4 w-1/3 rounded-lg shimmer" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl bg-surface border border-[#1e2d45] p-5 h-72 flex flex-col gap-4">
      <div className="h-5 w-48 rounded-lg shimmer" />
      <div className="flex-1 flex items-end gap-2 px-4">
        {[60, 40, 80, 55, 70, 35, 90, 50].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md shimmer"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full shimmer flex-shrink-0 mt-1" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 rounded-lg shimmer w-full" />
        <div className="h-4 rounded-lg shimmer w-5/6" />
        <div className="h-4 rounded-lg shimmer w-4/6" />
      </div>
    </div>
  );
}
