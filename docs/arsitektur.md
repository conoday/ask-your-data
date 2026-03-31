# Architecture — Ask Your Data

## Overview

```
┌─────────────────────────────────────────────┐
│                   BROWSER                   │
│                                             │
│  ┌──────────────┐     ┌──────────────────┐  │
│  │  Chat Panel  │ ←→  │  Viz Panel       │  │
│  │  (left 40%)  │     │  (right 60%)     │  │
│  └──────────────┘     └──────────────────┘  │
│             Next.js 14 SPA                  │
└────────────────────┬────────────────────────┘
                     │ REST / JSON
┌────────────────────▼────────────────────────┐
│               FastAPI Backend               │
│                                             │
│  POST /api/upload     → profiling           │
│  POST /api/query      → NLQ engine          │
│  GET  /api/datasets   → list                │
│  GET  /api/queries    → saved history       │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
  NLQ Engine    pandas pipeline   SQLite
  (rule-based)  (aggregations)    (metadata)
```

---

## Backend Services

| Service | Responsibility |
|---|---|
| `dataset_service` | Upload, store, profile CSV |
| `nlq_service` | Parse natural language → query plan |
| `analytics_service` | Execute query plan with pandas |
| `chart_service` | Select best chart type, emit chart spec |
| `insight_service` | Generate text insights from results |
| `query_service` | CRUD for saved queries |

---

## NLQ Engine (Rule-based MVP)

Input: `"total sales by region last quarter"`

```
1. Intent Detection
   → aggregation | trend | comparison | distribution | correlation

2. Entity Extraction
   → columns, filters, time ranges, group-by

3. Query Plan
   → { op: "groupby", col: "region", agg: "sum", metric: "sales", filter: {...} }

4. pandas Execution
   → DataFrame result

5. Chart Spec
   → { type: "bar", x: "region", y: "sales", data: [...] }

6. Insight Generation
   → "Region X leads with Rp 1.2B, 25% above average"
```

---

## Data Flow

```
User uploads CSV
  → backend saves to /uploads/{session_id}/
  → profile: shape, dtypes, nulls, uniques, sample
  → return DatasetProfile to frontend

User types query
  → POST /api/query { dataset_id, question }
  → NLQ parse → pandas execute
  → return QueryResult { answer_text, chart_spec, table_data, insight_text, confidence }

Frontend renders
  → ChatMessage (answer_text)
  → ChartPanel (chart_spec → Recharts)
  → DataTable (table_data)
  → InsightCard (insight_text)
```

---

## Database Schema (SQLite)

```sql
-- datasets
CREATE TABLE datasets (
  id TEXT PRIMARY KEY,
  name TEXT,
  filename TEXT,
  row_count INTEGER,
  col_count INTEGER,
  profile JSON,
  created_at DATETIME
);

-- queries
CREATE TABLE queries (
  id TEXT PRIMARY KEY,
  dataset_id TEXT,
  question TEXT,
  result JSON,
  is_favorite BOOLEAN,
  created_at DATETIME
);

-- sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  dataset_id TEXT,
  created_at DATETIME
);
```

---

## Frontend State (Zustand)

```typescript
interface AppStore {
  // Dataset
  datasets: Dataset[]
  activeDataset: Dataset | null

  // Chat
  messages: ChatMessage[]
  isLoading: boolean

  // Visualization
  activeChart: ChartSpec | null
  activeTable: TableData | null
  activeInsights: Insight[]

  // Queries
  savedQueries: SavedQuery[]
}
```
