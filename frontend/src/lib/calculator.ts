/** Pure calculation logic — mirrors backend app/calculator.py. */

export interface CoverageResult {
  treatmentCost: number;
  coveragePct: number;
  insuranceCovered: number;
  outOfPocket: number;
}

export interface InstallmentOption {
  months: number;
  label: string;
  monthlyPayment: number;
  total: number;
}

function round2(value: number): number {
  return Number(Math.round(Number(value + "e2")) + "e-2");
}

export function calculateCoverage(
  treatmentCost: number,
  coveragePct: number
): CoverageResult {
  const insuranceCovered = round2((treatmentCost * coveragePct) / 100);
  const outOfPocket = round2(treatmentCost - insuranceCovered);
  return { treatmentCost, coveragePct, insuranceCovered, outOfPocket };
}

const INSTALLMENT_LABELS: Record<number, string> = {
  1: "Pay in Full",
  3: "3 Monthly Installments",
  6: "6 Monthly Installments",
  12: "12 Monthly Installments",
};

export function calculateInstallments(
  outOfPocket: number,
  monthsOptions: number[] = [1, 3, 6, 12]
): InstallmentOption[] {
  return monthsOptions.map((months) => {
    const monthlyPayment = round2(outOfPocket / months);
    const total = round2(monthlyPayment * months);
    return {
      months,
      label: INSTALLMENT_LABELS[months] ?? `${months} Monthly Installments`,
      monthlyPayment,
      total,
    };
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
