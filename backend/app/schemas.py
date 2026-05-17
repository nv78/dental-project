from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class CalculateRequest(BaseModel):
    treatment_cost: float = Field(
        default=1000.0,
        ge=0,
        description="Total treatment cost in USD",
    )
    coverage_pct: float = Field(
        ...,
        ge=0,
        le=100,
        description="Insurance coverage percentage (0–100)",
    )

    @field_validator("treatment_cost", "coverage_pct", mode="before")
    @classmethod
    def must_be_finite(cls, v: float) -> float:
        import math

        if not math.isfinite(float(v)):
            raise ValueError("Value must be a finite number")
        return v


class InstallmentOptionSchema(BaseModel):
    months: int
    monthly_payment: float
    total: float


class CalculateResponse(BaseModel):
    treatment_cost: float
    coverage_pct: float
    insurance_covered: float
    out_of_pocket: float
    installment_options: list[InstallmentOptionSchema]


class CalculationRecordSchema(BaseModel):
    id: int
    treatment_cost: float
    coverage_pct: float
    insurance_covered: float
    out_of_pocket: float
    created_at: datetime

    model_config = {"from_attributes": True}


class VerifyRequest(BaseModel):
    procedure_code: str
    procedure_cost: float = Field(gt=0)
    insurance_plan_type: str = Field(pattern="^(PPO|HMO|EPO|DHMO)$")
    patient_age: int = Field(ge=0, le=120)


class VerifyResponse(BaseModel):
    procedure_code: str
    procedure_cost: float
    insurance_plan_type: str
    predicted_coverage_pct: float
    approval_probability: float
    risk_factors: list[str]
    recommended_action: str
    estimated_insurance_payment: float
    estimated_patient_cost: float


class VerificationRecordSchema(BaseModel):
    id: int
    procedure_code: str
    procedure_cost: float
    insurance_plan_type: str
    patient_age: int
    predicted_coverage_pct: float
    approval_probability: float
    recommended_action: str
    created_at: datetime

    model_config = {"from_attributes": True}
