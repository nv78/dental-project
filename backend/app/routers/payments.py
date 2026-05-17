from __future__ import annotations

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PaymentInstallment, PaymentPlan
from app.notifications import send_sms
from app.schemas import CreatePlanRequest, MonerisWebhookPayload, PaymentPlanSchema

router = APIRouter(prefix="/api/v1", tags=["payments"])


@router.post("/payment-plans", response_model=PaymentPlanSchema, status_code=201)
def create_payment_plan(payload: CreatePlanRequest, db: Session = Depends(get_db)) -> PaymentPlan:
    monthly_payment = round(payload.total_amount / payload.months, 2)

    plan = PaymentPlan(
        calculation_record_id=payload.calculation_record_id,
        patient_phone=payload.patient_phone,
        total_amount=payload.total_amount,
        months=payload.months,
        monthly_payment=monthly_payment,
        status="active",
    )
    db.add(plan)
    db.flush()  # get plan.id before creating installments

    now = datetime.utcnow()
    for i in range(1, payload.months + 1):
        installment = PaymentInstallment(
            plan_id=plan.id,
            installment_number=i,
            amount=monthly_payment,
            due_date=now + timedelta(days=30 * i),
            status="pending",
        )
        db.add(installment)

    db.commit()
    db.refresh(plan)

    if payload.patient_phone:
        send_sms(
            payload.patient_phone,
            f"Your payment plan of ${payload.total_amount:.2f} over {payload.months} months "
            f"(${monthly_payment:.2f}/mo) has been created.",
        )

    return plan


@router.get("/payment-plans", response_model=list[PaymentPlanSchema])
def list_payment_plans(db: Session = Depends(get_db)) -> list[PaymentPlan]:
    return db.query(PaymentPlan).order_by(PaymentPlan.id.desc()).limit(50).all()


@router.get("/payment-plans/{plan_id}", response_model=PaymentPlanSchema)
def get_payment_plan(plan_id: int, db: Session = Depends(get_db)) -> PaymentPlan:
    plan = db.query(PaymentPlan).filter(PaymentPlan.id == plan_id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Payment plan not found")
    return plan


@router.post("/webhooks/moneris")
def moneris_webhook(
    payload: MonerisWebhookPayload, db: Session = Depends(get_db)
) -> dict[str, str]:
    if payload.event_type != "payment_received":
        return {"status": "ignored"}

    installment = (
        db.query(PaymentInstallment)
        .join(PaymentPlan)
        .filter(
            PaymentPlan.id == payload.plan_id,
            PaymentInstallment.amount == payload.amount,
            PaymentInstallment.status == "pending",
        )
        .order_by(PaymentInstallment.installment_number)
        .first()
    )

    if installment is None:
        return {"status": "processed"}

    installment.status = "paid"
    installment.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(installment)

    plan = db.query(PaymentPlan).filter(PaymentPlan.id == payload.plan_id).first()
    if plan and plan.patient_phone:
        send_sms(
            plan.patient_phone,
            f"Payment of ${payload.amount:.2f} received for installment "
            f"#{installment.installment_number} of your plan. Thank you!",
        )

    return {"status": "processed"}
