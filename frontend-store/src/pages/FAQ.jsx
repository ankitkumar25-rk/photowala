import { HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'How long does delivery take?',
    answer: 'Most orders are delivered within 2-5 business days, depending on your location and the product type.',
  },
  {
    question: 'Do you offer cash on delivery?',
    answer: 'Yes. Cash on delivery is currently available across the store.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Open My Orders from the footer or visit the Track Order page and enter your order ID.',
  },
  {
    question: 'Can I return a custom product?',
    answer: 'Custom and personalized items may have limited return eligibility. Check the Return Policy page for details.',
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-cream-100 page-enter py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>FAQ</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Answers to common questions about orders, delivery, and returns.
          </p>
        </div>

        <div className="card p-2 sm:p-4">
          <div className="space-y-2">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-cream-200 bg-white overflow-hidden">
                <summary className="list-none cursor-pointer px-5 py-4 font-semibold text-gray-900 flex items-center justify-between gap-4">
                  <span>{item.question}</span>
                  <span className="text-brand-secondary text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
