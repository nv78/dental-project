from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.calculator import calculate_coverage, calculate_installments
from app.database import get_db
from app.models import CalculationRecord
from app.schemas import (
    CalculateRequest,
    CalculateResponse,
    CalculationRecordSchema,
    InstallmentOptionSchema,
)

router = APIRouter(prefix="/api/v1", tags=["calculator"])


@router.post("/calculate", response_model=CalculateResponse)
def calculate(request: CalculateRequest, db: Session = Depends(get_db)) -> CalculateResponse:
    coverage = calculate_coverage(request.treatment_cost, request.coverage_pct)
    installments = calculate_installments(coverage.out_of_pocket)

    record = CalculationRecord(
        treatment_cost=coverage.treatment_cost,
        coverage_pct=coverage.coverage_pct,
        insurance_covered=coverage.insurance_covered,
        out_of_pocket=coverage.out_of_pocket,
    )
    db.add(record)
    db.commit()

    return CalculateResponse(
        treatment_cost=coverage.treatment_cost,
        coverage_pct=coverage.coverage_pct,
        insurance_covered=coverage.insurance_covered,
        out_of_pocket=coverage.out_of_pocket,
        installment_options=[
            InstallmentOptionSchema(
                months=opt.months,
                monthly_payment=opt.monthly_payment,
                total=opt.total,
            )
            for opt in installments
        ],
    )


@router.get("/history", response_model=list[CalculationRecordSchema])
def history(db: Session = Depends(get_db)) -> list[CalculationRecord]:
    return (
        db.query(CalculationRecord)
        .order_by(CalculationRecord.created_at.desc(), CalculationRecord.id.desc())
        .limit(50)
        .all()
    )
