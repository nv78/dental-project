from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, func
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
