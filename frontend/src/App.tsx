import { useState } from "react";
import { CostBreakdown } from "./components/CostBreakdown";
import { InsuranceSlider } from "./components/InsuranceSlider";
import { PaymentOptions } from "./components/PaymentOptions";
import {
  type InstallmentOption,
  calculateCoverage,
  calculateInstallments,
} from "./lib/calculator";

const TREATMENT_COST = 1000;

export default function App() {
  const [coveragePct, setCoveragePct] = useState(0);
  const [savedPlan, setSavedPlan] = useState<InstallmentOption | null>(null);

  const coverage = calculateCoverage(TREATMENT_COST, coveragePct);
  const installments = calculateInstallments(coverage.outOfPocket);

  function handleCoverageChange(value: number) {
    setCoveragePct(value);
    setSavedPlan(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-dental-50 to-slate-100">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dental-600 flex items-center justify-center text-white text-xl shadow-sm">
            🦷
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Dental Financing Calculator
            </h1>
            <p className="text-xs text-gray-500">Instant treatment cost breakdown</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Treatment Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Fixed treatment cost:{" "}
                <span className="font-semibold text-gray-700">$1,000.00</span>
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-dental-50 text-dental-700 text-xs font-semibold border border-dental-100">
              Active Quote
            </span>
          </div>

          <InsuranceSlider value={coveragePct} onChange={handleCoverageChange} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <CostBreakdown
            treatmentCost={coverage.treatmentCost}
            insuranceCovered={coverage.insuranceCovered}
            outOfPocket={coverage.outOfPocket}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <PaymentOptions
            options={installments}
            onSave={(plan) => setSavedPlan(plan)}
          />
        </div>

        {savedPlan && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3 animate-pulse-once">
            <div className="text-green-500 text-2xl mt-0.5">✓</div>
            <div>
              <p className="font-semibold text-green-800">Payment Plan Selected</p>
              <p className="text-sm text-green-700 mt-0.5">
                {savedPlan.label} —{" "}
                {savedPlan.months === 1
                  ? `$${savedPlan.total.toFixed(2)} due today`
                  : `${savedPlan.months} payments of $${savedPlan.monthlyPayment.toFixed(2)}`}
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        All amounts shown in USD. Calculations are estimates based on provided coverage percentage.
      </footer>
    </div>
  );
}
