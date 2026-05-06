import { Link } from 'react-router-dom';

export default function PenIndex() {
  return (
    <div className="min-h-screen bg-cream-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs text-gray-500">Home → Our Services → Custom Printing → Pen</p>
        <h1 className="mt-3 text-3xl font-bold text-brand-primary" style={{ fontFamily: 'Fraunces, serif' }}>
          Pen Printing
        </h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link
            to="/services/custom-printing/pen/laser-printed-pen"
            className="card p-6 transition hover:shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900">Laser Printed Pen</h2>
            <p className="mt-2 text-sm text-gray-600">Production Time: 5 days</p>
          </Link>
          <div className="card p-6 opacity-70">
            <h2 className="text-xl font-bold text-gray-900">Product Slot #2</h2>
            <p className="mt-2 text-sm text-gray-600">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
