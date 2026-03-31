/**
 * Type-safe API client for the FastAPI backend.
 * All routes are prefixed with /api via Next.js rewrite.
 */

export interface ColumnProfile {
  name: string;
  dtype: string;
  null_pct: number;
  unique_count: number;
  sample_values: unknown[];
  is_numeric: boolean;
  is_datetime: boolean;
  min?: unknown;
  max?: unknown;
  mean?: number;
}

export interface DatasetProfile {
  id: string;
  name: string;
  filename: string;
  row_count: number;
  col_count: number;
  columns: ColumnProfile[];
  quality_score: number;
  created_at: string;
}

export interface DatasetSummary {
  id: string;
  name: string;
  filename: string;
  row_count: number;
  col_count: number;
  quality_score: number;
  created_at: string;
}

export interface ChartSpec {
  type: "bar" | "line" | "pie" | "scatter" | "area" | "heatmap";
  x?: string;
  y?: string;
  x_label?: string;
  y_label?: string;
  title: string;
  data: Record<string, unknown>[];
  color_key?: string;
}

export interface TableData {
  columns: string[];
  rows: unknown[][];
  total_rows: number;
}

export interface QueryResult {
  id: string;
  question: string;
  answer_text: string;
  chart_spec?: ChartSpec;
  table_data?: TableData;
  insight_text: string;
  confidence_score: number;
  operation?: string;
  created_at: string;
}

export interface SavedQuery {
  id: string;
  dataset_id: string;
  question: string;
  result?: QueryResult;
  is_favorite: boolean;
  created_at: string;
}

// ── Base fetch ────────────────────────────────────────────

const BASE = "/api";

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Dataset API ───────────────────────────────────────────

export const datasetsApi = {
  upload: async (file: File): Promise<DatasetProfile> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/datasets/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  list: (): Promise<DatasetSummary[]> =>
    apiFetch<DatasetSummary[]>("/datasets/"),

  get: (id: string): Promise<DatasetProfile> =>
    apiFetch<DatasetProfile>(`/datasets/${id}`),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/datasets/${id}`, { method: "DELETE" }),
};

// ── Query API ─────────────────────────────────────────────

export const queryApi = {
  run: (datasetId: string, question: string): Promise<QueryResult> =>
    apiFetch<QueryResult>("/query/", {
      method: "POST",
      body: JSON.stringify({ dataset_id: datasetId, question }),
    }),
};

// ── Saved Queries API ────────────────────────────────────

export const queriesApi = {
  list: (datasetId?: string): Promise<SavedQuery[]> =>
    apiFetch<SavedQuery[]>(
      datasetId ? `/queries/?dataset_id=${datasetId}` : "/queries/"
    ),

  toggleFavorite: (id: string, isFavorite: boolean): Promise<void> =>
    apiFetch<void>(`/queries/${id}/favorite`, {
      method: "PATCH",
      body: JSON.stringify({ is_favorite: isFavorite }),
    }),

  delete: (id: string): Promise<void> =>
    apiFetch<void>(`/queries/${id}`, { method: "DELETE" }),
};
