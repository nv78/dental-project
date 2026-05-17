from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.ml.predictor import predict_coverage
from app.models import VerificationRecord
from app.schemas import VerificationRecordSchema, VerifyRequest, VerifyResponse

router = APIRouter(prefix="/api/v1", tags=["verification"])


@router.post("/verify-coverage", response_model=VerifyResponse)
def verify_coverage(request: VerifyRequest, db: Session = Depends(get_db)) -> VerifyResponse:
    result = predict_coverage(
        procedure_code=request.procedure_code,
        procedure_cost=request.procedure_cost,
        insurance_plan_type=request.insurance_plan_type,
        patient_age=request.patient_age,
    )

    estimated_insurance_payment = round(
        request.procedure_cost * result.predicted_coverage_pct / 100, 2
    )
    estimated_patient_cost = round(request.procedure_cost - estimated_insurance_payment, 2)

    record = VerificationRecord(
        procedure_code=request.procedure_code,
        procedure_cost=request.procedure_cost,
        insurance_plan_type=request.insurance_plan_type,
        patient_age=request.patient_age,
        predicted_coverage_pct=result.predicted_coverage_pct,
        approval_probability=result.approval_probability,
        recommended_action=result.recommended_action,
    )
    db.add(record)
    db.commit()

    return VerifyResponse(
        procedure_code=request.procedure_code,
        procedure_cost=request.procedure_cost,
        insurance_plan_type=request.insurance_plan_type,
        predicted_coverage_pct=result.predicted_coverage_pct,
        approval_probability=result.approval_probability,
        risk_factors=result.risk_factors,
        recommended_action=result.recommended_action,
        estimated_insurance_payment=estimated_insurance_payment,
        estimated_patient_cost=estimated_patient_cost,
    )


@router.get("/verify-coverage/history", response_model=list[VerificationRecordSchema])
def verification_history(db: Session = Depends(get_db)) -> list[VerificationRecord]:
    return (
        db.query(VerificationRecord)
        .order_by(VerificationRecord.created_at.desc(), VerificationRecord.id.desc())
        .limit(50)
        .all()
    )
