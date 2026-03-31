/**
 * ChatInput — text input for natural language queries.
 */
"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { SendHorizonal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const EXAMPLE_PROMPTS = [
  "Show me total sales by region",
  "What are the top 10 customers by revenue?",
  "How has revenue trended over time?",
  "What is the distribution of order categories?",
];

export function ChatInput({
  onSubmit,
  isLoading,
  disabled,
  placeholder = "Ask anything about your data...",
}: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const q = value.trim();
    if (!q || isLoading || disabled) return;
    onSubmit(q);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="space-y-2">
      {/* Example prompts */}
      {!disabled && (
        <div className="flex gap-2 flex-wrap px-1">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setValue(p);
                textareaRef.current?.focus();
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-surface-subtle border border-[#1e2d45]
                text-text-muted hover:text-[#e2e8f0] hover:border-primary/30 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-surface-subtle p-2 transition-all",
          !disabled && !isLoading
            ? "border-[#1e2d45] focus-within:border-primary/50 focus-within:shadow-glow-sm"
            : "border-[#1e2d45] opacity-60 cursor-not-allowed"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKey}
          disabled={disabled || isLoading}
          placeholder={disabled ? "Select a dataset first..." : placeholder}
          rows={1}
          className="flex-1 bg-transparent text-sm text-[#e2e8f0] placeholder:text-text-muted
            resize-none outline-none max-h-40 leading-relaxed px-2 py-1"
        />

        <button
          onClick={submit}
          disabled={!value.trim() || isLoading || disabled}
          className={cn(
            "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
            value.trim() && !isLoading && !disabled
              ? "bg-primary hover:bg-primary-glow text-white shadow-glow-sm"
              : "bg-[#1e2d45] text-text-muted cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <SendHorizonal size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
