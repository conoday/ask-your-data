/**
 * Sidebar — left navigation for the app workspace.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Database, History,
  ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { DatasetCard } from "@/components/DatasetCard";
import { UploadDropzone } from "@/features/upload/UploadDropzone";
import { datasetsApi } from "@/lib/api";

const NAV = [
  { href: "/app", label: "Workspace", icon: LayoutDashboard },
  { href: "/app/datasets", label: "Datasets", icon: Database },
  { href: "/app/queries", label: "Saved Queries", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarOpen,
    toggleSidebar,
    datasets,
    activeDataset,
    setActiveDataset,
    setDatasets,
  } = useAppStore();

  const handleSelectDataset = async (id: string) => {
    const profile = await datasetsApi.get(id);
    setActiveDataset(profile);
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-surface border-r border-[#1e2d45] transition-all duration-300 flex-shrink-0",
        sidebarOpen ? "w-60" : "w-14"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-[#1e2d45] flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-bold text-sm font-display gradient-text truncate">
            Ask Your Data
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto w-6 h-6 rounded-md flex items-center justify-center
            text-text-muted hover:text-[#e2e8f0] hover:bg-surface-subtle transition-all flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 py-3 space-y-1 flex-shrink-0">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
              pathname === href
                ? "bg-primary/15 text-primary-glow border border-primary/20"
                : "text-text-muted hover:text-[#e2e8f0] hover:bg-surface-subtle"
            )}
          >
            <Icon size={15} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Datasets section */}
      {sidebarOpen && (
        <div className="flex-1 overflow-hidden flex flex-col px-2 pb-2">
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
              Datasets
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {datasets.length === 0 ? (
              <p className="text-xs text-text-muted px-3 py-2">No datasets yet.</p>
            ) : (
              datasets.map((d) => (
                <DatasetCard
                  key={d.id}
                  dataset={d}
                  compact
                  isActive={activeDataset?.id === d.id}
                  onClick={() => handleSelectDataset(d.id)}
                />
              ))
            )}
          </div>

          {/* Upload shortcut */}
          <div className="pt-2 px-1">
            <UploadDropzone
              compact
              onSuccess={async () => {
                const list = await datasetsApi.list();
                setDatasets(list);
              }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
