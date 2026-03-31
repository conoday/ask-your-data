/**
 * App workspace — main page with split chat + viz panel.
 */
"use client";

import { ChatPanel } from "@/features/chat/ChatPanel";
import { VizPanel } from "@/features/viz/VizPanel";

export default function WorkspacePage() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat Panel (40%) */}
      <div className="w-2/5 flex-shrink-0 border-r border-[#1e2d45] overflow-hidden">
        <ChatPanel />
      </div>

      {/* Viz Panel (60%) */}
      <div className="flex-1 overflow-hidden">
        <VizPanel />
      </div>
    </div>
  );
}
