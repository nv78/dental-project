from __future__ import annotations

from dataclasses import dataclass


@dataclass
class PredictionResult:
    predicted_coverage_pct: float
    approval_probability: float
    risk_factors: list[str]
    recommended_action: str


def predict_coverage(
    procedure_code: str,
    procedure_cost: float,
    insurance_plan_type: str,
    patient_age: int,
) -> PredictionResult:
    """Rule-based predictor that mimics an ML model interface.

    Will be replaced with XGBoost when labelled training data is available.
    """
    risk_factors: list[str] = []

    # Base coverage by plan type
    plan_coverage: dict[str, float] = {
        "PPO": 70.0,
        "HMO": 60.0,
        "EPO": 65.0,
        "DHMO": 40.0,
    }
    predicted_coverage_pct = plan_coverage.get(insurance_plan_type, 60.0)

    # Base approval probability by procedure code prefix
    if procedure_code.startswith("D0"):
        approval_probability = 0.92
    elif procedure_code.startswith("D7"):
        approval_probability = 0.60
    elif procedure_code.startswith("D3"):
        approval_probability = 0.72
    else:
        approval_probability = 0.78

    # Age risk factor
    if patient_age < 18 or patient_age > 65:
        risk_factors.append("age_risk")
        approval_probability = round(approval_probability - 0.05, 10)

    # High cost risk factor
    if procedure_cost > 2000:
        risk_factors.append("high_cost")
        predicted_coverage_pct = round(predicted_coverage_pct - 5.0, 10)

    # Clamp values to valid ranges
    predicted_coverage_pct = max(0.0, min(100.0, predicted_coverage_pct))
    approval_probability = max(0.0, min(1.0, approval_probability))

    # Determine recommended action
    if approval_probability >= 0.70:
        recommended_action = "approve"
    elif approval_probability >= 0.50:
        recommended_action = "manual_review"
    else:
        recommended_action = "likely_deny"

    return PredictionResult(
        predicted_coverage_pct=round(predicted_coverage_pct, 2),
        approval_probability=round(approval_probability, 2),
        risk_factors=risk_factors,
        recommended_action=recommended_action,
    )
