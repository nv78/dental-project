import { useState } from "react";
import { type PaymentPlanResponse, createPaymentPlan } from "../lib/api";
import { formatCurrency } from "../lib/calculator";
import { type InstallmentOption } from "../lib/calculator";

interface CreatePaymentPlanProps {
  selectedPlan: InstallmentOption;
  onClose: () => void;
}

export function CreatePaymentPlan({ selectedPlan, onClose }: CreatePaymentPlanProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<PaymentPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const plan = await createPaymentPlan({
        total_amount: selectedPlan.total,
        months: selectedPlan.months,
        patient_phone: phone.trim() || undefined,
      });
      setConfirmed(plan);
    } catch {
      setError("Could not create the payment plan. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">
            ✓
          </div>
          <div>
            <p className="font-semibold text-gray-900">Payment Plan Created</p>
            <p className="text-sm text-gray-500">Plan #{confirmed.id}</p>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 border border-gray-100 divide-y divide-gray-100">
          {confirmed.installments.map((inst) => (
            <div key={inst.id} className="flex justify-between items-center px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Payment {inst.installment_number}
                </p>
                <p className="text-xs text-gray-500">
                  Due {new Date(inst.due_date).toLocaleDateString()}
                </p>
              </div>
              <span className="text-sm font-semibold text-dental-700">
                {formatCurrency(inst.amount)}
              </span>
            </div>
          ))}
        </div>

        {phone && (
          <p className="text-xs text-gray-500 text-center">
            SMS reminders will be sent to {phone}
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleConfirm} className="space-y-4">
      <div className="rounded-xl bg-dental-50 border border-dental-100 p-4">
        <p className="text-sm font-semibold text-dental-800">
          {selectedPlan.months === 1
            ? `Pay ${formatCurrency(selectedPlan.total)} today`
            : `${selectedPlan.months} monthly payments of ${formatCurrency(selectedPlan.monthlyPayment)}`}
        </p>
        <p className="text-xs text-dental-600 mt-0.5">
          Total: {formatCurrency(selectedPlan.total)}
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-700">
          Patient phone number{" "}
          <span className="text-gray-400 font-normal">(optional — for SMS reminders)</span>
        </label>
        <input
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dental-400"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-dental-600 hover:bg-dental-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          {loading ? "Creating…" : "Confirm Plan"}
        </button>
      </div>
    </form>
  );
}
