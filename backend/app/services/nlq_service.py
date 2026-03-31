"""NLQ Engine — rule-based natural language to query plan."""

import re
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


class Intent(str, Enum):
    AGGREGATION = "aggregation"       # total, sum, count, average
    TREND = "trend"                   # over time, by month/year
    COMPARISON = "comparison"         # compare, vs, between
    DISTRIBUTION = "distribution"     # distribution, breakdown, histogram
    TOP_N = "top_n"                   # top 10, bottom 5
    CORRELATION = "correlation"       # correlation, relationship
    FILTER = "filter"                 # where, when, with
    RAW = "raw"                       # show me, list, display


@dataclass
class QueryPlan:
    intent: Intent
    metric_col: Optional[str] = None          # column to aggregate on
    group_col: Optional[str] = None           # group-by column
    agg_fn: str = "sum"                       # sum | mean | count | min | max
    filter_col: Optional[str] = None
    filter_val: Optional[str] = None
    filter_op: str = "eq"                     # eq | gt | lt | contains
    n: int = 10                               # for TOP_N
    sort_desc: bool = True
    confidence: float = 0.7
    operation_desc: str = ""
    columns_requested: list[str] = field(default_factory=list)


# ── Keyword maps ──────────────────────────────────────────

_AGG_KEYWORDS = {
    "sum": ["total", "sum", "jumlah", "keseluruhan"],
    "mean": ["average", "mean", "rata", "rata-rata", "avg"],
    "count": ["count", "how many", "berapa", "jumlah data", "banyak"],
    "max": ["maximum", "highest", "terbesar", "tertinggi", "max"],
    "min": ["minimum", "lowest", "terkecil", "terendah", "min"],
}

_TOP_N_PATTERNS = [
    r"top\s*(\d+)",
    r"bottom\s*(\d+)",
    r"(\d+)\s*terbesar",
    r"(\d+)\s*tertinggi",
    r"(\d+)\s*terkecil",
]

_TREND_KEYWORDS = [
    "over time", "by month", "by year", "by day", "by week",
    "per bulan", "per tahun", "per hari", "trend", "time series",
    "monthly", "yearly", "daily", "weekly", "overtime",
]

_CORRELATION_KEYWORDS = [
    "correlation", "correlate", "related", "relationship",
    "korelasi", "hubungan", "pengaruh",
]

_DISTRIBUTION_KEYWORDS = [
    "distribution", "breakdown", "spread", "histogram",
    "distribusi", "sebaran", "segmen",
]

_COMPARISON_KEYWORDS = [
    "compare", "versus", " vs ", "compared to", "bandingkan",
    "perbandingan", "antara",
]


def detect_intent(question: str) -> tuple[Intent, str]:
    q = question.lower()

    # Top N
    for pattern in _TOP_N_PATTERNS:
        if re.search(pattern, q):
            return Intent.TOP_N, "agg_fn"

    # Correlation
    if any(kw in q for kw in _CORRELATION_KEYWORDS):
        return Intent.CORRELATION, "corr"

    # Trend (time)
    if any(kw in q for kw in _TREND_KEYWORDS):
        return Intent.TREND, "trend"

    # Distribution
    if any(kw in q for kw in _DISTRIBUTION_KEYWORDS):
        return Intent.DISTRIBUTION, "value_counts"

    # Comparison
    if any(kw in q for kw in _COMPARISON_KEYWORDS):
        return Intent.COMPARISON, "agg_fn"

    # Aggregation
    for agg_fn, keywords in _AGG_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            return Intent.AGGREGATION, agg_fn

    return Intent.AGGREGATION, "sum"  # default


def detect_agg_fn(question: str) -> str:
    q = question.lower()
    for agg_fn, keywords in _AGG_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            return agg_fn
    return "sum"


def extract_n(question: str) -> tuple[int, bool]:
    q = question.lower()
    for pattern in _TOP_N_PATTERNS:
        m = re.search(pattern, q)
        if m:
            n = int(m.group(1))
            desc = "bottom" not in pattern
            return n, desc
    return 10, True


def match_column(word: str, columns: list[str]) -> Optional[str]:
    """Find the best matching column for a keyword."""
    word_clean = word.lower().replace("-", "").replace("_", "")
    # exact match
    for col in columns:
        if col.lower() == word.lower():
            return col
    # contains match
    for col in columns:
        col_clean = col.lower().replace("-", "").replace("_", "")
        if word_clean in col_clean or col_clean in word_clean:
            return col
    return None


def infer_columns(
    question: str,
    columns: list[str],
    numeric_cols: list[str],
    categorical_cols: list[str],
    datetime_cols: list[str],
) -> tuple[Optional[str], Optional[str]]:
    """
    Returns (metric_col, group_col) by scanning question words
    against available column names.
    """
    q_words = re.sub(r"[^\w\s]", " ", question.lower()).split()

    metric_col = None
    group_col = None

    # Try matching each word to column names
    candidates = []
    for word in q_words:
        matched = match_column(word, columns)
        if matched:
            candidates.append(matched)

    # Also try multi-word phrases (bigrams)
    for i in range(len(q_words) - 1):
        phrase = f"{q_words[i]}_{q_words[i+1]}"
        matched = match_column(phrase, columns)
        if matched and matched not in candidates:
            candidates.append(matched)

    # Assign: numeric → metric, categorical → group
    for col in candidates:
        if col in numeric_cols and metric_col is None:
            metric_col = col
        elif col in categorical_cols and group_col is None:
            group_col = col
        elif col in datetime_cols and group_col is None:
            group_col = col

    # Fallbacks
    if metric_col is None and numeric_cols:
        metric_col = numeric_cols[0]
    if group_col is None and categorical_cols:
        group_col = categorical_cols[0]

    return metric_col, group_col


def parse_query(
    question: str,
    columns: list[str],
    numeric_cols: list[str],
    categorical_cols: list[str],
    datetime_cols: list[str],
) -> QueryPlan:
    """
    Main entry point: parse a natural language question into a QueryPlan.
    """
    intent, hint = detect_intent(question)
    agg_fn = detect_agg_fn(question) if hint == "agg_fn" else hint

    metric_col, group_col = infer_columns(
        question, columns, numeric_cols, categorical_cols, datetime_cols
    )

    n, sort_desc = extract_n(question)

    confidence = 0.5
    if metric_col:
        confidence += 0.25
    if group_col:
        confidence += 0.25

    # Build operation description
    op_parts = []
    if intent == Intent.TOP_N:
        op_parts.append(f"TOP {n}")
    op_parts.append(agg_fn.upper())
    if metric_col:
        op_parts.append(f"({metric_col})")
    if group_col:
        op_parts.append(f"GROUP BY {group_col}")
    if intent == Intent.TREND and datetime_cols:
        group_col = group_col or datetime_cols[0]
        op_parts.append(f"ORDER BY {group_col}")
    op_desc = " ".join(op_parts)

    return QueryPlan(
        intent=intent,
        metric_col=metric_col,
        group_col=group_col,
        agg_fn=agg_fn,
        n=n,
        sort_desc=sort_desc,
        confidence=round(confidence, 2),
        operation_desc=op_desc,
    )
