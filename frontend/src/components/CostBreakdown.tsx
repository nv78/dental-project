import { formatCurrency } from "../lib/calculator";

interface CostBreakdownProps {
  treatmentCost: number;
  insuranceCovered: number;
  outOfPocket: number;
}

export function CostBreakdown({
  treatmentCost,
  insuranceCovered,
  outOfPocket,
}: CostBreakdownProps) {
  const coveragePct = treatmentCost > 0 ? (insuranceCovered / treatmentCost) * 100 : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Cost Breakdown
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Treatment Cost
          </p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            {formatCurrency(treatmentCost)}
          </p>
        </div>

        <div className="bg-dental-50 rounded-xl p-4 border border-dental-100">
          <p className="text-xs font-medium text-dental-600 uppercase tracking-wide mb-1">
            Insurance Covers
          </p>
          <p className="text-2xl font-bold text-dental-700 tabular-nums">
            {formatCurrency(insuranceCovered)}
          </p>
        </div>

        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">
            Your Cost
          </p>
          <p className="text-2xl font-bold text-orange-700 tabular-nums">
            {formatCurrency(outOfPocket)}
          </p>
        </div>
      </div>

      <div className="rounded-full h-4 bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-dental-500 to-dental-600 transition-all duration-300 ease-out"
          style={{ width: `${coveragePct}%` }}
          role="progressbar"
          aria-valuenow={coveragePct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Insurance covers ${coveragePct.toFixed(0)}% of treatment`}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-dental-500" />
          Insurance: {formatCurrency(insuranceCovered)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
          You pay: {formatCurrency(outOfPocket)}
        </span>
      </div>
    </div>
  );
}
