"""Chart service — pick best chart type and produce a ChartSpec."""

import pandas as pd
from app.services.nlq_service import QueryPlan, Intent
from app.models.schemas import ChartSpec


def _safe_val(v):
    try:
        return float(v)
    except Exception:
        return v


def make_chart_spec(
    df: pd.DataFrame,
    plan: QueryPlan,
    title: str = "",
) -> ChartSpec | None:
    """
    Produce a ChartSpec from a result DataFrame and the QueryPlan.
    Returns None if no suitable chart is possible.
    """
    if df is None or df.empty:
        return None

    cols = list(df.columns)
    intent = plan.intent

    # ── Correlation heatmap ────────────────────────────────
    if intent == Intent.CORRELATION:
        return ChartSpec(
            type="heatmap",
            x="col_a",
            y="col_b",
            title=title or "Correlation Matrix",
            data=_df_to_records(df),
            color_key="correlation",
        )

    # ── Trend → line chart ────────────────────────────────
    if intent == Intent.TREND:
        x_col = cols[0]
        y_col = cols[1] if len(cols) > 1 else cols[0]
        return ChartSpec(
            type="area",
            x=x_col,
            y=y_col,
            x_label=x_col,
            y_label=y_col,
            title=title or f"{y_col} over time",
            data=_df_to_records(df),
        )

    # ── Distribution → choose bar or pie ─────────────────
    if intent == Intent.DISTRIBUTION:
        x_col = cols[0]
        y_col = cols[1] if len(cols) > 1 else cols[0]
        n_unique = df[x_col].nunique()
        chart_type = "pie" if n_unique <= 8 else "bar"
        return ChartSpec(
            type=chart_type,
            x=x_col,
            y=y_col,
            title=title or f"Distribution of {x_col}",
            data=_df_to_records(df),
        )

    # ── Comparison → grouped bar ──────────────────────────
    if intent == Intent.COMPARISON:
        x_col = cols[0]
        y_col = cols[1] if len(cols) > 1 else cols[0]
        return ChartSpec(
            type="bar",
            x=x_col,
            y=y_col,
            title=title or f"Comparison: {y_col} by {x_col}",
            data=_df_to_records(df),
        )

    # ── Aggregation / Top-N → bar ─────────────────────────
    if len(cols) >= 2:
        x_col = cols[0]
        y_col = cols[1]
        n_unique = df[x_col].nunique()
        chart_type = "bar" if n_unique > 2 else "pie"
        return ChartSpec(
            type=chart_type,
            x=x_col,
            y=y_col,
            x_label=x_col,
            y_label=y_col,
            title=title or f"{y_col} by {x_col}",
            data=_df_to_records(df),
        )

    return None


def _df_to_records(df: pd.DataFrame) -> list[dict]:
    records = []
    for _, row in df.iterrows():
        rec = {}
        for k, v in row.items():
            try:
                rec[k] = float(v)
            except Exception:
                rec[k] = str(v) if not isinstance(v, str) else v
        records.append(rec)
    return records
