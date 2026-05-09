import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageSearch, ArrowRight, Truck, ClipboardList, Printer } from 'lucide-react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) return;

    // Custom Printing orders start with CP-
    if (id.startsWith('CP-')) {
      navigate(`/orders/track/${id}`);
    } else {
      // Standard product orders use UUIDs, usually handled by /orders/:id
      navigate(`/orders/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] page-enter py-16 md:py-32">
      <div className="max-w-3xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-[#1c1a19] flex items-center justify-center shadow-xl shadow-[#b65e2e]/10">
            <PackageSearch className="w-10 h-10 text-[#b65e2e]" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tighter">Track Your <span className="text-[#b65e2e]">Order</span></h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
            Enter your Order Number or ID to get real-time updates on your production and delivery status.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm space-y-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Number / Transaction ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-[#b65e2e]/20 transition-all"
                placeholder="e.g. CP-2026-1234 or your order ID"
              />
            </div>
            <button type="submit" className="w-full bg-[#b65e2e] text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-lg shadow-[#b65e2e]/20 hover:bg-[#a15024] transition-all flex items-center justify-center gap-3">
              Track Now <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
            <div className="p-6 rounded-3xl bg-[#fffaf5] border border-[#f3ebdf]">
              <Truck className="w-6 h-6 text-[#b65e2e] mb-3" />
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 text-left">Live Updates</p>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed text-left">Real-time production and shipping milestones updated by our processing team.</p>
            </div>
            <div className="p-6 rounded-3xl bg-[#f8f9fa] border border-gray-100">
              <ClipboardList className="w-6 h-6 text-gray-400 mb-3" />
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 text-left">Full History</p>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed text-left">
                View your complete purchase history including service orders in <Link to="/orders" className="text-[#b65e2e] font-bold hover:underline">My Orders</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
