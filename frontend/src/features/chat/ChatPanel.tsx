/**
 * ChatPanel — full chat interface with message history and input.
 */
"use client";

import { useRef, useEffect } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { MessageSkeleton } from "@/components/LoadingSkeleton";
import { useAppStore, type ChatMessage as ChatMsg } from "@/lib/store";
import { queryApi } from "@/lib/api";
import { generateId } from "@/lib/utils";

export function ChatPanel() {
  const {
    messages,
    isQueryLoading,
    addMessage,
    clearMessages,
    setQueryLoading,
    activeDataset,
    setActiveViz,
  } = useAppStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isQueryLoading]);

  const handleSubmit = async (question: string) => {
    if (!activeDataset) return;

    // Add user message
    addMessage({
      id: generateId(),
      role: "user",
      text: question,
      timestamp: new Date(),
    });

    setQueryLoading(true);

    try {
      const result = await queryApi.run(activeDataset.id, question);

      const assistantMsg: ChatMsg = {
        id: generateId(),
        role: "assistant",
        text: result.answer_text,
        result,
        timestamp: new Date(),
      };
      addMessage(assistantMsg);

      // Update viz panel
      setActiveViz(
        result.chart_spec ?? null,
        result.table_data ?? null,
        result.insight_text,
        result.confidence_score
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Query failed";
      addMessage({
        id: generateId(),
        role: "error",
        text: `Error: ${msg}`,
        timestamp: new Date(),
      });
      toast.error("Query failed. Try rephrasing your question.");
    } finally {
      setQueryLoading(false);
    }
  };

  const handleSelectResult = (msg: ChatMsg) => {
    if (msg.result) {
      setActiveViz(
        msg.result.chart_spec ?? null,
        msg.result.table_data ?? null,
        msg.result.insight_text,
        msg.result.confidence_score
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d45] flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-primary-glow" />
          <span className="text-sm font-semibold text-[#e2e8f0]">
            {activeDataset ? activeDataset.name : "Chat"}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Clear conversation"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {messages.length === 0 && !isQueryLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20
              flex items-center justify-center">
              <MessageSquare size={22} className="text-primary-glow" />
            </div>
            <div>
              <p className="text-[#e2e8f0] font-semibold">
                {activeDataset ? "Ask a question about your data" : "Select a dataset to start"}
              </p>
              <p className="text-text-muted text-xs mt-1">
                {activeDataset
                  ? "Try: "Show me total sales by region" or "Top 10 products""
                  : "Upload a CSV in the Datasets section"}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onSelectResult={handleSelectResult}
          />
        ))}

        {isQueryLoading && <MessageSkeleton />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[#1e2d45] flex-shrink-0">
        <ChatInput
          onSubmit={handleSubmit}
          isLoading={isQueryLoading}
          disabled={!activeDataset}
        />
      </div>
    </div>
  );
}
