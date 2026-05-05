import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

const UNIT_OPTIONS = [
  { value: 'in', label: 'Inches', factor: 25.4 },
  { value: 'cm', label: 'CM', factor: 10 },
  { value: 'mm', label: 'MM', factor: 1 },
];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function PaperGsmCalculator() {
  const [unit, setUnit] = useState('in');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [sheets, setSheets] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const widthValue = toNumber(width);
    const heightValue = toNumber(height);
    const sheetsValue = toNumber(sheets);
    const weightValue = toNumber(weightKg);

    if (!widthValue || !heightValue || !sheetsValue || !weightValue) {
      return null;
    }

    const factor = UNIT_OPTIONS.find((item) => item.value === unit)?.factor || 1;
    const widthMm = widthValue * factor;
    const heightMm = heightValue * factor;
    const areaMm2 = widthMm * heightMm;

    if (!areaMm2 || sheetsValue <= 0) {
      return null;
    }

    const gsm = (weightValue * 1000000) / (areaMm2 * sheetsValue);
    return Math.round(gsm * 100) / 100;
  }, [unit, width, height, sheets, weightKg]);

  const hasErrors = submitted && !result;

  const handleReset = () => {
    setUnit('in');
    setWidth('');
    setHeight('');
    setSheets('');
    setWeightKg('');
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-cream-100 page-enter">
      <div className="bg-linear-to-br from-forest-800 to-forest-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
                Paper GSM Calculator
              </h1>
              <p className="text-cream-50/80 text-sm mt-1">
                Calculate GSM from sheet size, quantity, and total weight.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="card bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900">Enter Details</h2>
            <p className="text-sm text-gray-600 mt-1">All fields are required to calculate GSM.</p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="input-field"
                >
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paper Width</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="input-field"
                  placeholder="Enter width"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paper Height</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="input-field"
                  placeholder="Enter height"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Sheets</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={sheets}
                  onChange={(e) => setSheets(e.target.value)}
                  className="input-field"
                  placeholder="Total sheets"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Weight (in KGS)</label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="input-field"
                  placeholder="Total weight"
                />
              </div>
            </div>

            {hasErrors && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                Please enter valid values for all fields.
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                className="btn-primary px-6"
                onClick={() => setSubmitted(true)}
              >
                Calculate GSM
              </button>
              <button
                type="button"
                className="btn-secondary px-6"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="card bg-white p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900">Result</h2>
            <div className="rounded-2xl bg-brand-surface border border-brand-secondary/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">Calculated GSM</p>
              <p className="text-3xl font-bold text-gray-900 mt-3">
                {result ? `${result} GSM` : '--'}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Formula: GSM = (Weight in KG * 1,000,000) / (Area in mm² * Sheets)
              </p>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p className="font-semibold text-gray-800">Tips</p>
              <p>Use the total weight for the exact number of sheets entered.</p>
              <p>Check units before calculating to avoid errors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
