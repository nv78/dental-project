interface InsuranceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function InsuranceSlider({ value, onChange }: InsuranceSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label
          htmlFor="coverage-slider"
          className="text-sm font-semibold text-gray-700 uppercase tracking-wide"
        >
          Insurance Coverage
        </label>
        <span className="text-2xl font-bold text-dental-600 tabular-nums">
          {value}%
        </span>
      </div>

      <div className="relative">
        <input
          id="coverage-slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
                     bg-gradient-to-r from-dental-500 to-dental-600
                     focus:outline-none focus:ring-2 focus:ring-dental-500 focus:ring-offset-2
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-white
                     [&::-webkit-slider-thumb]:border-2
                     [&::-webkit-slider-thumb]:border-dental-600
                     [&::-webkit-slider-thumb]:shadow-md
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-125
                     [&::-moz-range-thumb]:h-5
                     [&::-moz-range-thumb]:w-5
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-white
                     [&::-moz-range-thumb]:border-2
                     [&::-moz-range-thumb]:border-dental-600
                     [&::-moz-range-thumb]:shadow-md"
          style={{
            background: `linear-gradient(to right, #0ea5e9 0%, #0284c7 ${value}%, #e2e8f0 ${value}%, #e2e8f0 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
