import { useState } from "react";
import { type VerifyResponse, verifyInsurance } from "../lib/api";
import { formatCurrency } from "../lib/calculator";

const PLAN_TYPES = ["PPO", "HMO", "EPO", "DHMO"] as const;

const ACTION_STYLES: Record<string, string> = {
  approve: "bg-green-50 border-green-200 text-green-800",
  manual_review: "bg-yellow-50 border-yellow-200 text-yellow-800",
  likely_deny: "bg-red-50 border-red-200 text-red-800",
};

const ACTION_LABELS: Record<string, string> = {
  approve: "Likely Approved",
  manual_review: "Manual Review Recommended",
  likely_deny: "Likely Denied",
};

const RISK_LABELS: Record<string, string> = {
  age_risk: "Patient age risk",
  high_cost: "High-cost procedure",
};

function ProbabilityBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Approval probability</span>
        <span className="font-semibold tabular-nums">{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function InsuranceVerifier() {
  const [procedureCode, setProcedureCode] = useState("");
  const [procedureCost, setProcedureCost] = useState("");
  const [planType, setPlanType] = useState<(typeof PLAN_TYPES)[number]>("PPO");
  const [patientAge, setPatientAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await verifyInsurance({
        procedure_code: procedureCode.trim().toUpperCase(),
        procedure_cost: parseFloat(procedureCost),
        insurance_plan_type: planType,
        patient_age: parseInt(patientAge, 10),
      });
      setResult(res);
    } catch {
      setError("Could not reach the verification service. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-base font-semibold text-gray-900">AI Coverage Verification</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Predict claim approval before treatment begins
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
          AI Powered
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">
            CDT Procedure Code
          </label>
          <input
            required
            type="text"
            placeholder="e.g. D0120"
            value={procedureCode}
            onChange={(e) => setProcedureCode(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dental-400"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Procedure Cost ($)</label>
          <input
            required
            type="number"
            min="1"
            step="0.01"
            placeholder="e.g. 1000"
            value={procedureCost}
            onChange={(e) => setProcedureCost(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dental-400"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Insurance Plan Type</label>
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value as typeof planType)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dental-400 bg-white"
          >
            {PLAN_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Patient Age</label>
          <input
            required
            type="number"
            min="0"
            max="120"
            placeholder="e.g. 42"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dental-400"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dental-600 hover:bg-dental-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            {loading ? "Verifying…" : "Verify Coverage"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 pt-2">
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              ACTION_STYLES[result.recommended_action] ?? "bg-gray-50 border-gray-200 text-gray-700"
            }`}
          >
            {ACTION_LABELS[result.recommended_action] ?? result.recommended_action}
          </div>

          <ProbabilityBar value={result.approval_probability} />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-1">Predicted Coverage</p>
              <p className="text-xl font-bold text-dental-700">
                {result.predicted_coverage_pct.toFixed(0)}%
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-1">Est. Patient Cost</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(result.estimated_patient_cost)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-1">Est. Insurance Pays</p>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(result.estimated_insurance_payment)}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-1">Plan Type</p>
              <p className="text-xl font-bold text-gray-900">{result.insurance_plan_type}</p>
            </div>
          </div>

          {result.risk_factors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Risk Factors</p>
              <div className="flex flex-wrap gap-2">
                {result.risk_factors.map((f) => (
                  <span
                    key={f}
                    className="px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-medium"
                  >
                    {RISK_LABELS[f] ?? f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
