import { Link } from 'react-router-dom';
import { Calculator } from 'lucide-react';

export default function Services() {
  return (
    <div className="min-h-screen bg-cream-100 page-enter">
      <div className="relative overflow-hidden bg-linear-to-br from-[#7a3218] via-[#a6431a] to-[#d96a22] text-white">
        <div className="absolute inset-0 opacity-20 luxury-grain" />
        <div className="max-w-6xl mx-auto px-4 py-12 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/15 border border-white/20">
              Tools & Utilities
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-4" style={{ fontFamily: 'Fraunces, serif' }}>
              Services
            </h1>
            <p className="text-cream-50/85 text-sm md:text-base mt-2">
              Practical tools designed to help you calculate, plan, and execute print jobs with confidence.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group card bg-white p-6 flex flex-col gap-4 hover:shadow-[0_22px_40px_-24px_rgba(91,63,47,0.4)] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-brand-surface flex items-center justify-center border border-brand-secondary/20">
                <Calculator className="w-6 h-6 text-brand-primary" />
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-brand-secondary/15 text-brand-secondary">
                Free Tool
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mt-2">Paper GSM Calculator</h2>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Calculate GSM quickly from sheet size, sheet count, and total weight. Ideal for estimating
                and checking paper stock on the fly.
              </p>
            </div>
            <div className="mt-auto">
              <Link
                to="/services/paper-gsm"
                className="btn-primary w-full justify-center text-sm"
              >
                Open Calculator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
