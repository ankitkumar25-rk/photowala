import { ShieldCheck, Lock, Database, Mail } from 'lucide-react';

export default function Privacy() {
  const blocks = [
    { icon: Lock, title: 'What we protect', text: 'We protect your account details, contact information, and order history.' },
    { icon: Database, title: 'How we use data', text: 'We use your data to process orders, provide support, and improve the store experience.' },
    { icon: Mail, title: 'Communication', text: 'We may send order updates and important service messages related to your purchases.' },
  ];

  return (
    <div className="min-h-screen bg-cream-100 page-enter py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Privacy Policy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This page explains how we collect and use information when you shop with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {blocks.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <Icon className="w-6 h-6 text-brand-secondary mb-3" />
              <h2 className="font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            We do not sell your personal data. Access to customer information is limited to essential store operations and order fulfillment.
          </p>
          <p>
            If you need a privacy-related update or have a question about your account, contact support and we will help you out.
          </p>
        </div>
      </div>
    </div>
  );
}
