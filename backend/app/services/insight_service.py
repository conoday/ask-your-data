"""Insight service — generate human-readable text insights from results."""

import pandas as pd
import numpy as np
from app.services.nlq_service import QueryPlan, Intent


def _fmt(v) -> str:
    try:
        fv = float(v)
        if fv >= 1_000_000:
            return f"{fv/1_000_000:.2f}M"
        if fv >= 1_000:
            return f"{fv/1_000:.1f}K"
        return f"{fv:,.2f}"
    except Exception:
        return str(v)


def generate_insight(df: pd.DataFrame, plan: QueryPlan, summary: str) -> str:
    """
    Produce a 1-3 sentence insight from the result DataFrame.
    """
    if df is None or df.empty:
        return "No data found for this query."

    intent = plan.intent
    cols = list(df.columns)

    try:
        if intent in (Intent.AGGREGATION, Intent.TOP_N, Intent.COMPARISON) and len(cols) >= 2:
            x_col, y_col = cols[0], cols[1]
            if df[y_col].dtype in [object, str]:
                return summary

            top_row = df.iloc[0]
            top_label = top_row[x_col]
            top_val = _fmt(top_row[y_col])

            avg = df[y_col].mean()
            top_vs_avg = ((float(top_row[y_col]) - avg) / avg * 100) if avg != 0 else 0

            direction = "above" if top_vs_avg > 0 else "below"
            insight = (
                f"**{top_label}** leads with {top_val} "
                f"({abs(top_vs_avg):.0f}% {direction} average). "
            )

            if len(df) > 1:
                bottom_row = df.iloc[-1]
                bottom_label = bottom_row[x_col]
                bottom_val = _fmt(bottom_row[y_col])
                insight += f"**{bottom_label}** is the lowest at {bottom_val}."

            return insight

        if intent == Intent.TREND and len(cols) >= 2:
            y_col = cols[1]
            if df[y_col].dtype == object:
                return summary
            first_val = float(df[y_col].iloc[0])
            last_val = float(df[y_col].iloc[-1])
            pct = ((last_val - first_val) / first_val * 100) if first_val != 0 else 0
            direction = "increased" if pct > 0 else "decreased"
            return (
                f"Over the period, {y_col} has {direction} by **{abs(pct):.1f}%** "
                f"(from {_fmt(first_val)} to {_fmt(last_val)})."
            )

        if intent == Intent.DISTRIBUTION and len(cols) >= 2:
            x_col, y_col = cols[0], cols[1]
            top = df.iloc[0]
            total = df[y_col].sum()
            pct = float(top[y_col]) / total * 100 if total else 0
            return (
                f"**{top[x_col]}** is the most common category, "
                f"representing {pct:.1f}% of all records."
            )

        if intent == Intent.CORRELATION:
            # Find highest absolute correlation (excluding self-pairs)
            filtered = df[df["col_a"] != df["col_b"]].copy()
            if filtered.empty:
                return summary
            filtered["abs_corr"] = filtered["correlation"].abs()
            top = filtered.nlargest(1, "abs_corr").iloc[0]
            direction = "positively" if top["correlation"] > 0 else "negatively"
            return (
                f"**{top['col_a']}** and **{top['col_b']}** are most {direction} "
                f"correlated (r = {top['correlation']:.2f})."
            )

    except Exception:
        pass

    return summary
