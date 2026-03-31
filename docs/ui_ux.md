# UI/UX Design — Ask Your Data

## Design Goals

### 1. Chat-First
The primary interaction is conversation, not form-filling or menu-clicking.  
Every feature must be reachable through chat or remain visible without cognitive search.

### 2. Minimal Cognitive Load
- Single primary action visible at all times: the chat input
- Progressively disclose complexity (collapsible details, expandable tables)
- No more than 3 levels of visual hierarchy per screen

### 3. Fast Perceived Performance
- Optimistic UI: show skeleton immediately on query submit
- Streaming-ready: animate chart data entry, not instant pop
- Never show blank states — always show placeholder or guide text

### 4. Trust Building
- Data quality badge on every dataset
- Confidence score on every answer
- Show the SQL/operation that was run (collapsible)
- Clear error messages with actionable suggestions

---

## Visual System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `background` | `#0b0f19` | App background |
| `surface` | `#131929` | Card / panel background |
| `surface-subtle` | `#1a2235` | Input / hover |
| `border` | `#1e2d45` | Dividers |
| `primary` | `#6366f1` | CTA, active states |
| `primary-glow` | `#818cf8` | Hover, focus ring |
| `accent` | `#22d3ee` | Highlight, chart accent |
| `text` | `#e2e8f0` | Primary text |
| `text-muted` | `#64748b` | Secondary text |
| `success` | `#10b981` | Positive metrics |
| `warning` | `#f59e0b` | Medium risk |
| `danger` | `#ef4444` | Error / negative |

### Typography

```
Headings:   Space Grotesk  (font-space-grotesk)
Body:       Inter           (font-inter)
Mono:       JetBrains Mono  (font-mono)
```

### Spacing & Radius

- Base unit: 4px
- Card radius: `rounded-2xl` (16px)
- Input radius: `rounded-xl` (12px)
- Button radius: `rounded-lg` (8px)
- Shadow: `shadow-[0_0_30px_rgba(99,102,241,0.08)]`

---

## Key UX Decisions

### Split Chat + Viz Layout
Chat panel (40%) | Visualization panel (60%)

Rationale: users need to see chart immediately as they ask. Tabbing between chat and chart breaks mental flow.

### Persistent History
Conversation history stays visible in the left panel during the session.  
Users can click any past message to restore that view in the viz panel.

### Progressive Disclosure
```
Answer text (always visible)
  └── Chart (visible)
       └── Data table (collapsible)
            └── SQL/operation (collapsible, dev mode)
```

### Deterministic Insight First
Always show rule-based insight before LLM explanation.  
Deterministic = trustworthy. LLM = augmentation.

### Non-blocking Upload
Dataset profiling runs in background.  
User sees progress indicator, can browse app while waiting.

---

## Page Designs

### Landing Page (`/`)

```
┌────────────────────────────────────────────┐
│  NAVBAR: logo | features | pricing | login  │
├────────────────────────────────────────────┤
│  HERO                                       │
│  "Chat with your business data"             │
│  subtitle + animated chat preview           │
│  [Upload your CSV → ]                       │
├────────────────────────────────────────────┤
│  FEATURES (3 cards)                         │
│  Ask | Visualize | Discover                 │
├────────────────────────────────────────────┤
│  DEMO PREVIEW (embedded screenshot/gif)     │
├────────────────────────────────────────────┤
│  FOOTER                                     │
└────────────────────────────────────────────┘
```

### App Workspace (`/app`)

```
┌──────────────┬─────────────────────────────┐
│  SIDEBAR     │  MAIN PANEL                 │
│  ─────────── │  ─────────────────────────  │
│  Datasets    │  [Chat Area]  [Viz Area]     │
│  My Queries  │                             │
│  Settings    │  messages...    chart here  │
│  ─────────── │                             │
│  [Upload +]  │  [Ask anything...]          │
└──────────────┴─────────────────────────────┘
```

### Dataset Page (`/app/datasets`)

```
┌──────────────────────────────────────────┐
│  Datasets                    [+ Upload]  │
├──────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐ │
│  │  dataset.csv    ● Good quality      │ │
│  │  10,000 rows · 12 columns           │ │
│  │  Updated 2h ago          [Analyze →]│ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## Component States

Every component must implement:
- `default` — normal view
- `loading` — skeleton shimmer
- `empty` — helpful guide / CTA
- `error` — clear message + retry

---

## Future UX (Backlog)

- **Voice query**: speak your question, see instant chart
- **Multi-dataset join**: "combine sales and customer data"
- **Auto dashboard**: "create a dashboard for sales performance"
- **Scheduled reports**: "send this chart every Monday"
- **Collaborative workspace**: share queries with team
- **Annotation layer**: team adds notes to charts
