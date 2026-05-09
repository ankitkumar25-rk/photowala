import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageSearch, ArrowRight, Truck, ClipboardList } from 'lucide-react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    navigate(`/orders/${orderId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-cream-100 page-enter py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center">
            <PackageSearch className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Track Order</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your order ID to open the order details page and check the latest status.
          </p>
        </div>

        <div className="card p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Order ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="input-field"
                placeholder="Paste your order ID here"
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center gap-2">
              Track Now <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="p-4 rounded-2xl bg-brand-surface">
              <Truck className="w-5 h-5 text-brand-secondary mb-2" />
              <p className="font-semibold text-gray-900 mb-1">Shipping updates</p>
              <p>Once your order ships, you can see the status and tracking info inside your order detail page.</p>
            </div>
            <div className="p-4 rounded-2xl bg-brand-surface">
              <ClipboardList className="w-5 h-5 text-brand-secondary mb-2" />
              <p className="font-semibold text-gray-900 mb-1">Need your order list?</p>
              <p>
                Visit <Link to="/orders" className="text-brand-primary font-semibold hover:underline">My Orders</Link> to see every order in one place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

