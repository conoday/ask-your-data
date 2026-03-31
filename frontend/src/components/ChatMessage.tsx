/**
 * ChatMessage component — renders a single chat bubble.
 */
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Terminal, BarChart3, User2, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/store";

interface Props {
  message: ChatMessageType;
  onSelectResult?: (msg: ChatMessageType) => void;
}

export function ChatMessage({ message, onSelectResult }: Props) {
  const [showOp, setShowOp] = useState(false);
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div
      className={cn(
        "flex gap-3 animate-slide-up",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold mt-1",
          isUser
            ? "bg-primary/20 text-primary-glow border border-primary/30"
            : isError
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-accent/10 text-accent border border-accent/20"
        )}
      >
        {isUser ? <User2 size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[85%] space-y-2",
          isUser && "items-end"
        )}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-primary/20 border border-primary/30 text-[#e2e8f0] rounded-tr-sm"
              : isError
              ? "bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm"
              : "bg-surface border border-[#1e2d45] text-[#e2e8f0] rounded-tl-sm"
          )}
        >
          <ReactMarkdown
            components={{
              strong: ({ children }) => (
                <strong className="text-primary-glow font-semibold">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="text-[#94a3b8]">{children}</em>
              ),
              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>

        {/* Visualization Button (assistant only) */}
        {message.result && !isUser && (
          <div className="flex items-center gap-2 flex-wrap">
            {message.result.chart_spec && (
              <button
                onClick={() => onSelectResult?.(message)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                  bg-primary/10 border border-primary/20 text-primary-glow
                  hover:bg-primary/20 transition-colors"
              >
                <BarChart3 size={12} />
                View chart
              </button>
            )}

            {message.result.operation && (
              <button
                onClick={() => setShowOp(!showOp)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
                  bg-[#1a2235] border border-[#1e2d45] text-text-muted
                  hover:text-[#e2e8f0] transition-colors"
              >
                <Terminal size={12} />
                Operation
                {showOp ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            )}

            <span className={cn(
              "text-xs px-2 py-1 rounded-md border",
              message.result.confidence_score >= 0.8
                ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                : message.result.confidence_score >= 0.5
                ? "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
                : "text-red-400 border-red-500/20 bg-red-500/10"
            )}>
              {Math.round(message.result.confidence_score * 100)}% confidence
            </span>
          </div>
        )}

        {/* Operation (collapsible) */}
        {showOp && message.result?.operation && (
          <div className="rounded-xl bg-[#0b0f19] border border-[#1e2d45] px-4 py-3 animate-fade-in">
            <p className="text-xs text-text-muted mb-1 font-mono uppercase tracking-wider">
              Operation
            </p>
            <code className="text-xs font-mono text-accent">
              {message.result.operation}
            </code>
          </div>
        )}

        {/* Timestamp */}
        <p className={cn(
          "text-[10px] text-text-muted",
          isUser && "text-right"
        )}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
