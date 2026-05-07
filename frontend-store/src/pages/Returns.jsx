import { Link } from 'react-router-dom';
import { createElement } from 'react';
import { RotateCcw, ShieldCheck, Clock3, PackageCheck } from 'lucide-react';

export default function Returns() {
  const points = [
    { icon: Clock3, title: '7-day return window', text: 'You can request a return within 7 days of delivery for eligible items.' },
    { icon: PackageCheck, title: 'Item condition', text: 'Products should be unused, in original packaging, and include all accessories.' },
    { icon: ShieldCheck, title: 'Quick resolution', text: 'Our team reviews return requests and updates you as soon as possible.' },
  ];

  return (
    <div className="min-h-screen bg-cream-100 page-enter py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center">
            <RotateCcw className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Return Policy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We want you to be happy with every order. If something is not right, here is how returns work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {points.map(({ icon, title, text }) => (
            <div key={title} className="card p-5">
              {createElement(icon, { className: 'w-6 h-6 text-brand-secondary mb-3' })}
              <h2 className="font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-xl text-gray-900">How to request a return</h2>
          <ol className="space-y-3 text-gray-600 text-sm">
            <li>1. Open <Link to="/orders" className="text-brand-primary font-semibold hover:underline">My Orders</Link> and select the order.</li>
            <li>2. Use the support/contact option or reach out with your order ID.</li>
            <li>3. Our team will confirm eligibility and guide you through the return steps.</li>
          </ol>
          <p className="text-xs text-gray-500">Some personalized or custom-made items may not be eligible for return unless they arrive damaged or defective.</p>
        </div>
      </div>
    </div>
  );
}

