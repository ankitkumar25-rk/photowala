import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, MapPin, CreditCard, Truck,
  Clock, CheckCircle, XCircle, RefreshCw, Copy, Check,
  Pencil, Download, ChevronRight
} from 'lucide-react';
import { ordersApi } from '../api';
import toast from 'react-hot-toast';

const STATUSES = [
  { key: 'PENDING',    label: 'Order Placed',   icon: Clock,       desc: 'Your order has been placed' },
  { key: 'CONFIRMED',  label: 'Confirmed',      icon: CheckCircle, desc: 'Order confirmed by seller' },
  { key: 'PROCESSING', label: 'Processing',     icon: RefreshCw,   desc: 'Being prepared for dispatch' },
  { key: 'SHIPPED',    label: 'Shipped',        icon: Truck,       desc: 'Out for delivery' },
  { key: 'DELIVERED',  label: 'Delivered',      icon: CheckCircle, desc: 'Delivered successfully' },
];

const STATUS_COLOR = {
  PENDING:    'bg-brand-secondary',
  CONFIRMED:  'bg-blue-500',
  PROCESSING: 'bg-purple-500',
  SHIPPED:    'bg-indigo-500',
  DELIVERED:  'bg-green-500',
  CANCELLED:  'bg-red-500',
  REFUNDED:   'bg-gray-500',
};

function StatusBadge({ status }) {
  const map = {
    PENDING:    { bg: 'bg-brand-secondary/15', text: 'text-brand-secondary', label: 'Pending' },
    CONFIRMED:  { bg: 'bg-blue-100',    text: 'text-blue-700',   label: 'Confirmed' },
    PROCESSING: { bg: 'bg-purple-100',  text: 'text-purple-700', label: 'Processing' },
    SHIPPED:    { bg: 'bg-indigo-100',  text: 'text-indigo-700', label: 'Shipped' },
    DELIVERED:  { bg: 'bg-green-100',   text: 'text-green-700',  label: 'Delivered' },
    CANCELLED:  { bg: 'bg-red-100',     text: 'text-red-700',    label: 'Cancelled' },
    REFUNDED:   { bg: 'bg-gray-100',    text: 'text-gray-700',   label: 'Refunded' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[status]}`} />
      {s.label}
    </span>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ordersApi.getById(id);
        setOrder(data.data);
      } catch {
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const cancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(id);
      toast.success('Order cancelled');
      setOrder((o) => ({ ...o, status: 'CANCELLED' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel at this stage');
    } finally { setCancelling(false); }
  };

  const copyTracking = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-float mb-4">⌛</div>
          <p className="text-brand-primary font-medium">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const isCancelled = order.status === 'CANCELLED';
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const statusIndex = STATUSES.findIndex((s) => s.key === order.status);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-cream-100 luxury-grain pt-32 pb-24 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-brand-secondary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-gray-400 text-xs font-semibold uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link to="/" className="hover:text-brand-secondary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <Link to="/orders" className="hover:text-brand-secondary transition-colors">Orders</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-brand-primary">Order Details</span>
        </div>

        {/* Luxury header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
              Order <br />
              <span className="text-brand-secondary">Details</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-0.5 w-12 bg-brand-secondary" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{order.orderNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            {canCancel && (
              <button
                onClick={cancelOrder}
                disabled={cancelling}
                className="px-6 py-3 rounded-pill bg-red-50 border border-red-100 text-red-600 font-semibold text-xs uppercase tracking-wider hover:shadow-md transition-all"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
        {/* Order info and date */}
        <p className="text-xs text-gray-500 font-medium">{formattedDate}</p>

        {/* Order Progress (non-cancelled) */}
        {!isCancelled && (
          <div className="card p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-brand-surface flex items-center justify-center">
                <Truck className="w-5 h-5 text-brand-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Order Progress</h2>
            </div>
            <div className="relative">
              {/* progress line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-cream-200" />
              <div
                className="absolute left-4 top-4 w-0.5 bg-brand-secondary transition-all duration-500"
                style={{ height: statusIndex >= 0 ? `${(statusIndex / (STATUSES.length - 1)) * 100}%` : '0%' }}
              />
              <div className="space-y-6">
                {STATUSES.map((s, i) => {
                  const done = i <= statusIndex;
                  const active = i === statusIndex;
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className="flex items-start gap-4 relative">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        done
                          ? 'bg-brand-secondary text-white shadow-md'
                          : 'bg-cream-200 text-gray-400'
                      } ${active ? 'ring-4 ring-brand-secondary' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className={`pt-1 ${done ? 'opacity-100' : 'opacity-70'}`}>
                        <p className={`font-semibold text-sm ${done ? 'text-gray-900' : 'text-gray-700'}`}>
                          {s.label}
                        </p>
                        <p className="text-xs text-gray-600">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking number */}
            {order.trackingNumber && (
              <div className="mt-6 p-4 bg-brand-surface rounded-2xl border border-brand-secondary flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-primary font-semibold uppercase tracking-wide">Tracking Number</p>
                  <p className="font-mono font-bold text-gray-900 mt-0.5">{order.trackingNumber}</p>
                </div>
                <button
                  onClick={copyTracking}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-secondary transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}

        {isCancelled && (
          <div className="card p-8 border-l-4 border-red-500 bg-red-50 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-red-700 mb-1">Order Cancelled</p>
              <p className="text-sm text-red-600">This order has been cancelled. Refund will be processed within 5-7 business days if payment was made.</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 card p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-surface flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Order Items <span className="text-brand-secondary text-lg">({order.items.length})</span></h2>
            </div>
            <div className="divide-y divide-cream-200">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.productName}
                      className="w-16 h-16 rounded-xl object-cover bg-cream-100 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-brand-surface flex items-center justify-center shrink-0 text-xl">
                      📦
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 leading-tight">{item.productName}</p>
                    {item.productUnit && (
                      <p className="text-xs text-gray-600 mt-0.5">{item.productUnit}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>

                    {/* Customization details */}
                    {item.customizationText && (
                      <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <Pencil className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Your Custom Text</p>
                          <p className="text-sm font-semibold text-amber-900">{item.customizationText}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 ml-auto mt-0.5" />
                      </div>
                    )}
                    {item.customizationImageUrl && (
                        <div className="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                          <img src={item.customizationImageUrl} alt="Custom" className="w-12 h-12 object-cover rounded-lg border border-blue-200 shrink-0" loading="lazy" width={48} height={48} />
                          <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Your Custom Logo/Image</p>
                          <a
                            href={item.customizationImageUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold underline mt-0.5"
                          >
                            <Download className="w-3 h-3" /> View / Download
                          </a>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">₹{Number(item.total).toFixed(2)}</p>
                    <p className="text-xs text-gray-600">₹{Number(item.price).toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price summary */}
            <div className="mt-4 pt-4 border-t border-cream-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className={`font-medium ${order.shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {order.shippingCost === 0 ? 'FREE' : `₹${Number(order.shippingCost).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-cream-200">
                <span className="text-gray-900">Total</span>
                <span className="text-brand-primary text-lg">₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="space-y-4">
            {/* Delivery address */}
            {order.address && (
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-surface flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-brand-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900">Delivery Address</h3>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-gray-900">{order.address.fullName}</p>
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>{order.address.city}, {order.address.state} – {order.address.pincode}</p>
                  <p className="text-gray-600 font-medium">{order.address.phone}</p>
                </div>
              </div>
            )}

            {/* Payment info */}
            {order.payment && (
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-surface flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-brand-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900">Payment</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-semibold ${
                      order.payment.status === 'PAID' ? 'text-green-600' : 'text-brand-secondary'
                    }`}>
                      {order.payment.status}
                    </span>
                  </div>
                  {order.payment.method && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Method</span>
                      <span className="font-medium text-gray-800 capitalize">{order.payment.method}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="card p-6 space-y-3 border-l-4 border-brand-secondary">
                <p className="font-bold text-gray-900">Order Notes</p>
                <p className="text-sm text-gray-700 italic">"{order.notes}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Help section */}
        <div className="card p-8 flex items-center justify-between hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <p className="font-bold text-gray-900">Need help with this order?</p>
            <p className="text-sm text-gray-600">Our support team is ready to assist you</p>
          </div>
          <a
            href="mailto:support@premiumstore.com"
            className="btn-primary py-3 px-8 text-sm"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

