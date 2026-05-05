import { Calculator } from 'lucide-react';

export default function Services() {
  return (
    <div className="min-h-screen bg-cream-100 page-enter">
      <div className="bg-gradient-to-br from-forest-800 to-forest-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>
            Services
          </h1>
          <p className="text-cream-50/80 text-sm mt-2">
            Tools and utilities to help you plan and execute print jobs better.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-white p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-surface flex items-center justify-center">
              <Calculator className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-brand-secondary/15 text-brand-secondary">
                Free Tool
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-3">Paper GSM Calculator</h2>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Calculate paper GSM and grammage from sheet size, count, and weight. Built for quick,
                accurate checks during estimating and production.
              </p>
            </div>
            <div className="mt-auto">
              <button
                type="button"
                className="btn-secondary w-full justify-center text-sm"
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
