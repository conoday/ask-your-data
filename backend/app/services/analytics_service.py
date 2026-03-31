"""Analytics service — execute a QueryPlan against a DataFrame."""

from typing import Optional
import pandas as pd
import numpy as np

from app.services.nlq_service import QueryPlan, Intent
from app.models.schemas import TableData


def _safe_numeric(val):
    """Convert numpy types to Python native."""
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return float(val)
    return val


def execute_plan(df: pd.DataFrame, plan: QueryPlan) -> tuple[pd.DataFrame, str]:
    """
    Execute a QueryPlan against a DataFrame.
    Returns (result_df, summary_text).
    """
    intent = plan.intent

    if intent == Intent.AGGREGATION or intent == Intent.COMPARISON:
        return _execute_aggregation(df, plan)

    if intent == Intent.TOP_N:
        return _execute_top_n(df, plan)

    if intent == Intent.TREND:
        return _execute_trend(df, plan)

    if intent == Intent.DISTRIBUTION:
        return _execute_distribution(df, plan)

    if intent == Intent.CORRELATION:
        return _execute_correlation(df, plan)

    # Fallback: raw aggregation
    return _execute_aggregation(df, plan)


def _execute_aggregation(df: pd.DataFrame, plan: QueryPlan) -> tuple[pd.DataFrame, str]:
    if plan.group_col and plan.metric_col and plan.group_col in df.columns and plan.metric_col in df.columns:
        result = (
            df.groupby(plan.group_col)[plan.metric_col]
            .agg(plan.agg_fn)
            .reset_index()
            .sort_values(plan.metric_col, ascending=not plan.sort_desc)
        )
        total = _safe_numeric(result[plan.metric_col].sum()) if len(result) > 0 else 0
        summary = (
            f"{plan.agg_fn.capitalize()} of {plan.metric_col} by {plan.group_col}: "
            f"{len(result)} groups, total {total:,.2f}"
        )
        return result, summary

    if plan.metric_col and plan.metric_col in df.columns:
        val = _safe_numeric(getattr(df[plan.metric_col], plan.agg_fn)())
        result = pd.DataFrame({plan.metric_col: [val]})
        summary = f"{plan.agg_fn.capitalize()} of {plan.metric_col} = {val:,.2f}"
        return result, summary

    # Fallback: shape
    result = pd.DataFrame({"rows": [len(df)], "columns": [len(df.columns)]})
    return result, f"Dataset has {len(df):,} rows and {len(df.columns)} columns."


def _execute_top_n(df: pd.DataFrame, plan: QueryPlan) -> tuple[pd.DataFrame, str]:
    base, summary = _execute_aggregation(df, plan)
    top = base.head(plan.n)
    label = "Top" if plan.sort_desc else "Bottom"
    summary = f"{label} {plan.n} {plan.group_col or ''} by {plan.metric_col or ''}"
    return top, summary


def _execute_trend(df: pd.DataFrame, plan: QueryPlan) -> tuple[pd.DataFrame, str]:
    # Find datetime column
    dt_cols = [c for c in df.columns if pd.api.types.is_datetime64_any_dtype(df[c])]

    if not dt_cols:
        # Try to parse object columns
        for col in df.columns:
            if df[col].dtype == object:
                try:
                    df[col] = pd.to_datetime(df[col], errors="coerce")
                    if df[col].notna().sum() > len(df) * 0.5:
                        dt_cols.append(col)
                        break
                except Exception:
                    pass

    if not dt_cols or not plan.metric_col or plan.metric_col not in df.columns:
        return _execute_aggregation(df, plan)

    dt_col = dt_cols[0]
    df = df.copy()
    df["_period"] = df[dt_col].dt.to_period("M").astype(str)
    result = (
        df.groupby("_period")[plan.metric_col]
        .agg(plan.agg_fn)
        .reset_index()
        .rename(columns={"_period": dt_col})
        .sort_values(dt_col)
    )
    summary = f"Trend of {plan.metric_col} over time ({len(result)} periods)"
    return result, summary


def _execute_distribution(df: pd.DataFrame, plan: QueryPlan) -> tuple[pd.DataFrame, str]:
    col = plan.group_col or plan.metric_col
    if not col or col not in df.columns:
        return _execute_aggregation(df, plan)

    counts = df[col].value_counts().reset_index()
    counts.columns = [col, "count"]
    summary = f"Distribution of {col}: {len(counts)} unique values"
    return counts, summary


def _execute_correlation(df: pd.DataFrame, plan: QueryPlan) -> tuple[pd.DataFrame, str]:
    numeric = df.select_dtypes(include="number")
    if numeric.shape[1] < 2:
        return _execute_aggregation(df, plan)

    corr = numeric.corr().round(3)
    # Melt to long form for visualization
    melted = corr.reset_index().melt(id_vars="index")
    melted.columns = ["col_a", "col_b", "correlation"]
    summary = f"Correlation matrix for {numeric.shape[1]} numeric columns"
    return melted, summary


def df_to_table(df: pd.DataFrame, max_rows: int = 200) -> TableData:
    df_clean = df.head(max_rows).copy()
    for col in df_clean.select_dtypes(include="datetime").columns:
        df_clean[col] = df_clean[col].astype(str)

    rows = []
    for _, row in df_clean.iterrows():
        rows.append([_safe_numeric(v) if not isinstance(v, str) else v for v in row.tolist()])

    return TableData(
        columns=list(df_clean.columns),
        rows=rows,
        total_rows=len(df),
    )
