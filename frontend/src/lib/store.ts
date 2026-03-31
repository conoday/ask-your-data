/**
 * Global Zustand store.
 */
import { create } from "zustand";
import type {
  DatasetSummary,
  DatasetProfile,
  QueryResult,
  SavedQuery,
  ChartSpec,
  TableData,
} from "@/lib/api";

export type ChatRole = "user" | "assistant" | "error";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  result?: QueryResult;
  timestamp: Date;
}

interface AppState {
  // ── Dataset ──────────────────────────────────────
  datasets: DatasetSummary[];
  activeDataset: DatasetProfile | null;
  setDatasets: (d: DatasetSummary[]) => void;
  setActiveDataset: (d: DatasetProfile | null) => void;

  // ── Chat ─────────────────────────────────────────
  messages: ChatMessage[];
  isQueryLoading: boolean;
  addMessage: (m: ChatMessage) => void;
  clearMessages: () => void;
  setQueryLoading: (v: boolean) => void;

  // ── Visualization ─────────────────────────────────
  activeChart: ChartSpec | null;
  activeTable: TableData | null;
  activeInsight: string;
  activeConfidence: number;
  setActiveViz: (chart: ChartSpec | null, table: TableData | null, insight: string, confidence?: number) => void;

  // ── Saved Queries ─────────────────────────────────
  savedQueries: SavedQuery[];
  setSavedQueries: (q: SavedQuery[]) => void;

  // ── UI ────────────────────────────────────────────
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Dataset
  datasets: [],
  activeDataset: null,
  setDatasets: (datasets) => set({ datasets }),
  setActiveDataset: (activeDataset) =>
    set({ activeDataset, messages: [], activeChart: null, activeTable: null, activeInsight: "", activeConfidence: 0 }),

  // Chat
  messages: [],
  isQueryLoading: false,
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clearMessages: () => set({ messages: [] }),
  setQueryLoading: (isQueryLoading) => set({ isQueryLoading }),

  // Visualization
  activeChart: null,
  activeTable: null,
  activeInsight: "",
  activeConfidence: 0,
  setActiveViz: (activeChart, activeTable, activeInsight, confidence = 0) =>
    set({ activeChart, activeTable, activeInsight, activeConfidence: confidence }),

  // Saved Queries
  savedQueries: [],
  setSavedQueries: (savedQueries) => set({ savedQueries }),

  // UI
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
