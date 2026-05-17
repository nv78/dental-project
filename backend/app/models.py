from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CalculationRecord(Base):
    __tablename__ = "calculation_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    treatment_cost: Mapped[float] = mapped_column(Float, nullable=False)
    coverage_pct: Mapped[float] = mapped_column(Float, nullable=False)
    insurance_covered: Mapped[float] = mapped_column(Float, nullable=False)
    out_of_pocket: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )


class PaymentPlan(Base):
    __tablename__ = "payment_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    calculation_record_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("calculation_records.id"), nullable=True
    )
    patient_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    months: Mapped[int] = mapped_column(Integer, nullable=False)
    monthly_payment: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    installments: Mapped[list[PaymentInstallment]] = relationship(
        "PaymentInstallment",
        back_populates="plan",
        order_by="PaymentInstallment.installment_number",
    )


class PaymentInstallment(Base):
    __tablename__ = "payment_installments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    plan_id: Mapped[int] = mapped_column(Integer, ForeignKey("payment_plans.id"), nullable=False)
    installment_number: Mapped[int] = mapped_column(Integer, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    plan: Mapped[PaymentPlan] = relationship("PaymentPlan", back_populates="installments")
