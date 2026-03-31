/**
 * InsightCard — renders the insight text from a query result.
 */
import { Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Props {
  insight: string;
  confidence: number;
  className?: string;
}

export function InsightCard({ insight, confidence, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#1e2d45] bg-surface p-4 space-y-2 animate-slide-up",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center">
          <Lightbulb size={13} className="text-yellow-400" />
        </div>
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Insight
        </span>
        <span
          className={cn(
            "ml-auto text-xs px-2 py-0.5 rounded-full border",
            confidence >= 0.8
              ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
              : confidence >= 0.5
              ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
              : "text-red-400 border-red-500/20 bg-red-500/10"
          )}
        >
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>

      <div className="text-sm text-[#cbd5e1] leading-relaxed">
        <ReactMarkdown
          components={{
            strong: ({ children }) => (
              <strong className="text-[#e2e8f0] font-semibold">{children}</strong>
            ),
            p: ({ children }) => <p>{children}</p>,
          }}
        >
          {insight}
        </ReactMarkdown>
      </div>
    </div>
  );
}
