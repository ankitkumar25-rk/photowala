import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageSearch, ArrowRight, Truck, ClipboardList, ChevronRight } from 'lucide-react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = orderId.trim();
    if (!cleanId) return;
    // Normalize to uppercase for consistent lookup if it's an orderNumber
    navigate(`/orders/${cleanId.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-cream-100 luxury-grain pt-32 pb-24 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-brand-secondary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-gray-400 text-xs font-semibold uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link to="/" className="hover:text-brand-secondary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-brand-primary">Track Order</span>
        </div>

        {/* Luxury header */}
        <div className="space-y-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
              Track <br />
              <span className="text-brand-secondary">Your Order</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-0.5 w-12 bg-brand-secondary" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Real-time Updates</p>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl font-medium">
            Enter your order ID to check the latest status and tracking information.
          </p>
        </div>

        {/* Form card */}
        <div className="card p-8 space-y-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-cream-200 bg-white text-gray-900 placeholder-gray-400 font-medium focus:outline-none focus:border-brand-secondary transition-colors"
                placeholder="Paste your order ID here"
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center gap-2 py-4 text-base">
              Track Now <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-brand-surface space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center">
                <Truck className="w-5 h-5 text-brand-secondary" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Shipping Updates</p>
                <p className="text-sm text-gray-700">Once your order ships, check the status and tracking info inside your order detail page.</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-brand-surface space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-cream-200 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-brand-secondary" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Your Orders</p>
                <p className="text-sm text-gray-700">
                  Visit <Link to="/orders" className="text-brand-primary font-semibold hover:underline">My Orders</Link> to see all your orders in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

