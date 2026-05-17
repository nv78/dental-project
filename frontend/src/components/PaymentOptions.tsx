import { useState } from "react";
import { type InstallmentOption, formatCurrency } from "../lib/calculator";

interface PaymentOptionsProps {
  options: InstallmentOption[];
  onSave?: (selected: InstallmentOption) => void;
}

const ICONS: Record<number, string> = {
  1: "💳",
  3: "📅",
  6: "🗓️",
  12: "📆",
};

export function PaymentOptions({ options, onSave }: PaymentOptionsProps) {
  const [selected, setSelected] = useState<number>(1);
  const [saved, setSaved] = useState(false);

  const selectedOption = options.find((o) => o.months === selected) ?? options[0];

  function handleSave() {
    if (selectedOption && onSave) {
      onSave(selectedOption);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (options.every((o) => o.monthlyPayment === 0)) {
    return (
      <div className="rounded-xl border-2 border-dashed border-dental-200 bg-dental-50 p-6 text-center">
        <p className="text-dental-700 font-semibold">
          Great news — insurance covers 100% of this treatment!
        </p>
        <p className="text-dental-500 text-sm mt-1">No out-of-pocket payment required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Payment Options
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {options.map((option) => {
          const isSelected = selected === option.months;
          return (
            <button
              key={option.months}
              onClick={() => setSelected(option.months)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-dental-500 focus:ring-offset-2
                ${
                  isSelected
                    ? "border-dental-600 bg-dental-50 shadow-md scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-dental-300 hover:shadow-sm"
                }`}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-dental-600 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
              <div className="text-xl mb-2">{ICONS[option.months] ?? "💰"}</div>
              <p
                className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                  isSelected ? "text-dental-600" : "text-gray-500"
                }`}
              >
                {option.months === 1 ? "Full Payment" : `${option.months} Months`}
              </p>
              <p
                className={`text-xl font-bold tabular-nums ${
                  isSelected ? "text-dental-700" : "text-gray-800"
                }`}
              >
                {formatCurrency(option.monthlyPayment)}
              </p>
              {option.months > 1 && (
                <p className="text-xs text-gray-400 mt-0.5">per month</p>
              )}
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{selectedOption.label}</span>
              {selectedOption.months > 1 && (
                <>
                  {" — "}
                  {selectedOption.months} payments of{" "}
                  <span className="font-semibold text-dental-700">
                    {formatCurrency(selectedOption.monthlyPayment)}
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Total: {formatCurrency(selectedOption.total)}
            </p>
          </div>
          {onSave && (
            <button
              onClick={handleSave}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                ${
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-dental-600 text-white hover:bg-dental-700 active:scale-95"
                }`}
            >
              {saved ? "Saved!" : "Select Plan"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
