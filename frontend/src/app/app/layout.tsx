/**
 * App workspace layout — sidebar + main content area.
 */
"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAppStore } from "@/lib/store";
import { datasetsApi } from "@/lib/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { setDatasets } = useAppStore();

  useEffect(() => {
    datasetsApi.list().then(setDatasets).catch(console.error);
  }, [setDatasets]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
