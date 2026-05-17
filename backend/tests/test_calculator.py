"""Unit tests for pure calculation logic."""

import pytest

from app.calculator import (
    CoverageResult,
    InstallmentOption,
    calculate_coverage,
    calculate_installments,
)


class TestCalculateCoverage:
    def test_zero_coverage(self):
        result = calculate_coverage(1000.0, 0.0)
        assert result.insurance_covered == 0.0
        assert result.out_of_pocket == 1000.0

    def test_full_coverage(self):
        result = calculate_coverage(1000.0, 100.0)
        assert result.insurance_covered == 1000.0
        assert result.out_of_pocket == 0.0

    def test_fifty_percent(self):
        result = calculate_coverage(1000.0, 50.0)
        assert result.insurance_covered == 500.0
        assert result.out_of_pocket == 500.0

    def test_returns_coverage_result(self):
        result = calculate_coverage(1000.0, 30.0)
        assert isinstance(result, CoverageResult)

    def test_treatment_cost_preserved(self):
        result = calculate_coverage(1000.0, 25.0)
        assert result.treatment_cost == 1000.0
        assert result.coverage_pct == 25.0

    def test_fractional_percentage(self):
        result = calculate_coverage(1000.0, 33.33)
        assert result.insurance_covered == 333.30
        assert result.out_of_pocket == 666.70

    def test_two_decimal_places(self):
        result = calculate_coverage(1000.0, 10.0)
        assert result.insurance_covered == 100.0
        assert result.out_of_pocket == 900.0

    def test_rounding_edge_case(self):
        # 1000 * 0.333 = 333.0 exactly
        result = calculate_coverage(1000.0, 33.3)
        assert result.insurance_covered == 333.0
        assert result.out_of_pocket == 667.0

    def test_negative_cost_raises(self):
        with pytest.raises(ValueError, match="treatment_cost"):
            calculate_coverage(-1.0, 50.0)

    def test_coverage_above_100_raises(self):
        with pytest.raises(ValueError, match="coverage_pct"):
            calculate_coverage(1000.0, 101.0)

    def test_coverage_below_0_raises(self):
        with pytest.raises(ValueError, match="coverage_pct"):
            calculate_coverage(1000.0, -1.0)

    def test_zero_cost(self):
        result = calculate_coverage(0.0, 50.0)
        assert result.insurance_covered == 0.0
        assert result.out_of_pocket == 0.0

    def test_coverage_pct_boundary_zero(self):
        result = calculate_coverage(1000.0, 0.0)
        assert result.coverage_pct == 0.0

    def test_coverage_pct_boundary_hundred(self):
        result = calculate_coverage(1000.0, 100.0)
        assert result.coverage_pct == 100.0


class TestCalculateInstallments:
    def test_default_options(self):
        opts = calculate_installments(600.0)
        months = [o.months for o in opts]
        assert months == [1, 3, 6, 12]

    def test_full_payment(self):
        opts = calculate_installments(600.0)
        full = next(o for o in opts if o.months == 1)
        assert full.monthly_payment == 600.0
        assert full.total == 600.0

    def test_three_month(self):
        opts = calculate_installments(600.0)
        three = next(o for o in opts if o.months == 3)
        assert three.monthly_payment == 200.0
        assert three.total == 600.0

    def test_six_month(self):
        opts = calculate_installments(600.0)
        six = next(o for o in opts if o.months == 6)
        assert six.monthly_payment == 100.0
        assert six.total == 600.0

    def test_twelve_month(self):
        opts = calculate_installments(600.0)
        twelve = next(o for o in opts if o.months == 12)
        assert twelve.monthly_payment == 50.0
        assert twelve.total == 600.0

    def test_returns_installment_option(self):
        opts = calculate_installments(300.0)
        assert all(isinstance(o, InstallmentOption) for o in opts)

    def test_zero_out_of_pocket(self):
        opts = calculate_installments(0.0)
        assert all(o.monthly_payment == 0.0 for o in opts)

    def test_rounding_indivisible_amount(self):
        # $10 / 3 months = $3.33 per month
        opts = calculate_installments(10.0)
        three = next(o for o in opts if o.months == 3)
        assert three.monthly_payment == 3.33

    def test_custom_months(self):
        opts = calculate_installments(120.0, months_options=[2, 4])
        assert len(opts) == 2
        assert opts[0].months == 2
        assert opts[0].monthly_payment == 60.0

    def test_negative_out_of_pocket_raises(self):
        with pytest.raises(ValueError, match="out_of_pocket"):
            calculate_installments(-1.0)

    def test_invalid_months_raises(self):
        with pytest.raises(ValueError, match="months"):
            calculate_installments(100.0, months_options=[0])
