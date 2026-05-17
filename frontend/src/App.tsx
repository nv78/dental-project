import { useState } from "react";
import { CostBreakdown } from "./components/CostBreakdown";
import { CreatePaymentPlan } from "./components/CreatePaymentPlan";
import { InsuranceSlider } from "./components/InsuranceSlider";
import { InsuranceVerifier } from "./components/InsuranceVerifier";
import { PaymentOptions } from "./components/PaymentOptions";
import {
  type InstallmentOption,
  calculateCoverage,
  calculateInstallments,
} from "./lib/calculator";

const TREATMENT_COST = 1000;
type Tab = "calculator" | "verify";

export default function App() {
  const [tab, setTab] = useState<Tab>("calculator");
  const [coveragePct, setCoveragePct] = useState(0);
  const [pendingPlan, setPendingPlan] = useState<InstallmentOption | null>(null);
  const [confirmedPlan, setConfirmedPlan] = useState<InstallmentOption | null>(null);

  const coverage = calculateCoverage(TREATMENT_COST, coveragePct);
  const installments = calculateInstallments(coverage.outOfPocket);

  function handleCoverageChange(value: number) {
    setCoveragePct(value);
    setPendingPlan(null);
    setConfirmedPlan(null);
  }

  function handleSelectPlan(plan: InstallmentOption) {
    setPendingPlan(plan);
  }

  function handlePlanConfirmed() {
    setConfirmedPlan(pendingPlan);
    setPendingPlan(null);
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

        <div className="max-w-4xl mx-auto px-4 flex gap-1 border-t border-gray-100">
          {(
            [
              { id: "calculator", label: "Calculator" },
              { id: "verify", label: "AI Verify Coverage" },
            ] as { id: Tab; label: string }[]
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === id
                  ? "border-dental-600 text-dental-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {tab === "calculator" && (
          <>
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
              <PaymentOptions options={installments} onSave={handleSelectPlan} />
            </div>

            {confirmedPlan && !pendingPlan && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
                <div className="text-green-500 text-2xl mt-0.5">✓</div>
                <div>
                  <p className="font-semibold text-green-800">Payment Plan Confirmed</p>
                  <p className="text-sm text-green-700 mt-0.5">
                    {confirmedPlan.months === 1
                      ? `$${confirmedPlan.total.toFixed(2)} due today`
                      : `${confirmedPlan.months} payments of $${confirmedPlan.monthlyPayment.toFixed(2)}`}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "verify" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <InsuranceVerifier />
          </div>
        )}
      </main>

      {pendingPlan && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Confirm Payment Plan</h3>
              <button
                onClick={() => setPendingPlan(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <CreatePaymentPlan
              selectedPlan={pendingPlan}
              onClose={handlePlanConfirmed}
            />
          </div>
        </div>
      )}

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
        All amounts shown in USD. Calculations are estimates based on provided coverage percentage.
      </footer>
    </div>
  );
}
