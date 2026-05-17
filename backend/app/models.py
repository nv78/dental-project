from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

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


class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    procedure_code: Mapped[str] = mapped_column(String(20), nullable=False)
    procedure_cost: Mapped[float] = mapped_column(Float, nullable=False)
    insurance_plan_type: Mapped[str] = mapped_column(String(10), nullable=False)
    patient_age: Mapped[int] = mapped_column(Integer, nullable=False)
    predicted_coverage_pct: Mapped[float] = mapped_column(Float, nullable=False)
    approval_probability: Mapped[float] = mapped_column(Float, nullable=False)
    recommended_action: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
