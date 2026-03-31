"""Query route — natural language question → result."""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.models.schemas import QueryRequest, QueryResult
from app.services import dataset_service, query_service
from app.services.nlq_service import parse_query
from app.services.analytics_service import execute_plan, df_to_table
from app.services.chart_service import make_chart_spec
from app.services.insight_service import generate_insight

router = APIRouter()


@router.post("/", response_model=QueryResult)
async def run_query(req: QueryRequest):
    # 1. Load dataset
    profile = await dataset_service.get_dataset_profile(req.dataset_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    try:
        df = dataset_service.load_dataframe(profile.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load dataset: {e}")

    # 2. Categorize columns
    numeric_cols = [c.name for c in profile.columns if c.is_numeric]
    datetime_cols = [c.name for c in profile.columns if c.is_datetime]
    categorical_cols = [
        c.name
        for c in profile.columns
        if not c.is_numeric and not c.is_datetime
    ]

    # 3. NLQ parse
    plan = parse_query(
        question=req.question,
        columns=[c.name for c in profile.columns],
        numeric_cols=numeric_cols,
        categorical_cols=categorical_cols,
        datetime_cols=datetime_cols,
    )

    # 4. Execute analytics
    try:
        result_df, summary = execute_plan(df, plan)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {e}")

    # 5. Chart spec
    chart_title = req.question.strip().capitalize()
    chart_spec = make_chart_spec(result_df, plan, title=chart_title)

    # 6. Table data
    table_data = df_to_table(result_df) if result_df is not None else None

    # 7. Insight text
    insight = generate_insight(result_df, plan, summary)

    # 8. Build answer text
    answer_text = f"Here's what I found for: *{req.question}*\n\n{insight}"

    query_result = QueryResult(
        id=str(uuid.uuid4()),
        question=req.question,
        answer_text=answer_text,
        chart_spec=chart_spec,
        table_data=table_data,
        insight_text=insight,
        confidence_score=plan.confidence,
        operation=plan.operation_desc,
        created_at=datetime.utcnow(),
    )

    # 9. Auto-save query
    await query_service.save_query(req.dataset_id, req.question, query_result)

    return query_result
