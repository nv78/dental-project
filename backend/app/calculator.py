"""Pure calculation logic — no framework dependencies."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal


def _to_decimal(value: float | int | str) -> Decimal:
    return Decimal(str(value))


def _round2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class CoverageResult:
    treatment_cost: float
    coverage_pct: float
    insurance_covered: float
    out_of_pocket: float


@dataclass(frozen=True)
class InstallmentOption:
    months: int
    monthly_payment: float
    total: float


def calculate_coverage(treatment_cost: float, coverage_pct: float) -> CoverageResult:
    """Return insurance-covered and out-of-pocket amounts.

    Args:
        treatment_cost: Total procedure cost in USD (must be >= 0).
        coverage_pct: Insurance coverage percentage 0–100.

    Raises:
        ValueError: If inputs are out of valid range.
    """
    if treatment_cost < 0:
        raise ValueError("treatment_cost must be >= 0")
    if not (0 <= coverage_pct <= 100):
        raise ValueError("coverage_pct must be between 0 and 100")

    cost = _to_decimal(treatment_cost)
    pct = _to_decimal(coverage_pct)

    insurance_covered = _round2(cost * pct / Decimal("100"))
    out_of_pocket = _round2(cost - insurance_covered)

    return CoverageResult(
        treatment_cost=float(cost),
        coverage_pct=float(pct),
        insurance_covered=float(insurance_covered),
        out_of_pocket=float(out_of_pocket),
    )


def calculate_installments(
    out_of_pocket: float,
    months_options: list[int] | None = None,
) -> list[InstallmentOption]:
    """Return a list of installment options for the given out-of-pocket amount.

    Args:
        out_of_pocket: Amount to be paid by the patient (>= 0).
        months_options: List of month durations to compute. Defaults to [1, 3, 6, 12].
    """
    if out_of_pocket < 0:
        raise ValueError("out_of_pocket must be >= 0")

    if months_options is None:
        months_options = [1, 3, 6, 12]

    amount = _to_decimal(out_of_pocket)
    results: list[InstallmentOption] = []

    for months in months_options:
        if months <= 0:
            raise ValueError("months must be > 0")
        monthly = _round2(amount / Decimal(str(months)))
        total = _round2(monthly * Decimal(str(months)))
        results.append(
            InstallmentOption(
                months=months,
                monthly_payment=float(monthly),
                total=float(total),
            )
        )

    return results
