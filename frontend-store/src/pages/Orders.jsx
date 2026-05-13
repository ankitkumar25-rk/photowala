import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package, ChevronRight, Clock, Truck, CheckCircle,
  XCircle, RefreshCw, Filter, ShoppingBag
} from 'lucide-react';
import { ordersApi } from '../api';
import toast from 'react-hot-toast';

const ORDER_STATUS_FILTERS = [
  { value: '',           label: 'All Orders' },
  { value: 'PENDING',    label: 'Pending' },
  { value: 'CONFIRMED',  label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED',    label: 'Shipped' },
  { value: 'DELIVERED',  label: 'Delivered' },
  { value: 'CANCELLED',  label: 'Cancelled' },
];

function StatusBadge({ status }) {
  const map = {
    // Shared & Order statuses
    PENDING:    { bg: 'bg-brand-secondary/15', text: 'text-brand-secondary', icon: Clock,         label: 'Pending' },
    NEW:        { bg: 'bg-blue-50',     text: 'text-blue-600',   icon: Clock,         label: 'New' },
    IN_PROGRESS: { bg: 'bg-purple-50',  text: 'text-purple-600', icon: RefreshCw,     label: 'In Progress' },
    CONFIRMED:  { bg: 'bg-blue-100',    text: 'text-blue-700',   icon: CheckCircle,   label: 'Confirmed' },
    PROCESSING: { bg: 'bg-purple-100',  text: 'text-purple-700', icon: RefreshCw,     label: 'Processing' },
    SHIPPED:    { bg: 'bg-indigo-100',  text: 'text-indigo-700', icon: Truck,         label: 'Shipped' },
    DELIVERED:  { bg: 'bg-green-100',   text: 'text-green-700',  icon: CheckCircle,   label: 'Delivered' },
    CANCELLED:  { bg: 'bg-red-100',     text: 'text-red-700',    icon: XCircle,       label: 'Cancelled' },
    REFUNDED:   { bg: 'bg-gray-100',    text: 'text-gray-700',   icon: RefreshCw,     label: 'Refunded' },
    CLOSED:     { bg: 'bg-gray-200',    text: 'text-gray-800',   icon: CheckCircle,   label: 'Closed' },
  };
  const s = map[status] || map.PENDING;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  );
}

function OrderCard({ order, onCancel }) {
  const navigate = useNavigate();
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const firstItem = order.items?.[0];
  const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="card bg-white hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-center justify-between p-4 border-b border-cream-200">
        <div>
          <p className="text-xs text-gray-600 font-medium">Order #</p>
          <p className="font-bold text-gray-900 font-mono text-sm">{order.orderNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">Placed on</p>
          <p className="text-sm font-semibold text-gray-800">{formattedDate}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="p-4 flex items-center gap-4">
        {firstItem?.product?.images?.[0] ? (
          <img
            src={firstItem.product.images[0].url}
            alt={firstItem.productName}
            className="w-16 h-16 rounded-xl object-cover bg-cream-100 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-brand-surface flex items-center justify-center shrink-0">
            <ShoppingBag className="w-7 h-7 text-brand-secondary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {firstItem?.productName}
          </p>
          {order.items.length > 1 && (
            <p className="text-xs text-gray-600 mt-0.5">+{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}</p>
          )}
          <p className="text-xs text-gray-600 mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-600">Total</p>
          <p className="font-bold text-brand-primary text-lg">₹{Number(order.total).toFixed(0)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-cream-200 bg-cream-50">
        <div>
          {order.trackingNumber && (
            <p className="text-xs text-gray-600">
              Tracking: <span className="font-mono font-semibold text-gray-800">{order.trackingNumber}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {canCancel && (
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(order.id); }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            className="flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-primary px-2 py-1 rounded-lg hover:bg-brand-surface transition-colors"
          >
            View Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="card bg-white animate-pulse">
      <div className="flex items-center justify-between p-4 border-b border-cream-200">
        <div className="space-y-2">
          <div className="h-2 w-16 bg-cream-300 rounded" />
          <div className="h-3 w-28 bg-cream-300 rounded" />
        </div>
        <div className="h-6 w-20 bg-cream-300 rounded-full" />
      </div>
      <div className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-cream-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 bg-cream-200 rounded" />
          <div className="h-2 w-1/2 bg-cream-200 rounded" />
        </div>
        <div className="h-6 w-16 bg-cream-200 rounded" />
      </div>
    </div>
  );
}

export default function Orders() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 8;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      
      if (true) {
        const { data } = await ordersApi.myOrders(params);
        setItems(data.data || []);
        setTotal(data.meta?.total || 0);
      }
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    setPage(1);
    setStatusFilter('');
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const cancelOrder = async (id) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await ordersApi.cancel(id);
      toast.success('Order cancelled');
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentFilters = ORDER_STATUS_FILTERS;

  return (
    <div className="min-h-screen bg-cream-100 pt-24 md:pt-32 pb-24 px-4 luxury-grain relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-brand-secondary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-gray-400 text-xs font-semibold uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <Link to="/" className="hover:text-brand-secondary transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <Link to="/account" className="hover:text-brand-secondary transition-colors">Account</Link>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-brand-primary">Order History</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-primary leading-tight">
              Order <br />
              <span className="text-brand-secondary">History</span>
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-0.5 w-12 bg-brand-secondary" />
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Track & manage your orders</p>
            </div>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center p-1.5 bg-cream-100 rounded-pill border border-cream-200 mb-12 overflow-x-auto no-scrollbar whitespace-nowrap gap-1">
          {currentFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-5 md:px-6 py-2.5 rounded-xl md:rounded-pill text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0 ${
                statusFilter === value 
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                  : 'text-gray-500 hover:text-brand-primary hover:bg-brand-surface'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-16 md:p-24 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-b from-brand-surface/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-brand-surface rounded-3xl flex items-center justify-center mx-auto mb-8 text-brand-secondary border border-cream-200 shadow-sm">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-brand-primary mb-3">
                {statusFilter ? 'No orders with this status' : 'No Orders Yet'}
              </h3>
              <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                {statusFilter ? 'Try a different filter or' : 'Start your shopping journey'} place your first order to see it here.
              </p>
              {!statusFilter && (
                <Link to="/products" className="inline-flex items-center gap-2 px-10 py-4 rounded-pill bg-brand-primary text-white font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-brand-primary/20 transition-all">
                  Start Shopping <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {items.map((item) => (
                <OrderCard key={item.id} order={item} onCancel={cancelOrder} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 rounded-pill border border-cream-200 bg-white text-brand-primary font-semibold text-xs uppercase tracking-wider hover:shadow-md disabled:opacity-40 transition-all"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-11 h-11 rounded-xl text-sm font-bold transition-all ${
                      page === p
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                        : 'bg-white text-gray-600 border border-cream-200 hover:border-brand-secondary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-3 rounded-pill border border-cream-200 bg-white text-brand-primary font-semibold text-xs uppercase tracking-wider hover:shadow-md disabled:opacity-40 transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

