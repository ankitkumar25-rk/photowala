import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, ChevronRight, Clock, Truck, CheckCircle,
  XCircle, RefreshCw, Filter, ShoppingBag, Drill
} from 'lucide-react';
import { ordersApi, serviceRequestsApi } from '../api';
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

const SERVICE_STATUS_FILTERS = [
  { value: '',           label: 'All Requests' },
  { value: 'NEW',        label: 'New' },
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

function ServiceRequestCard({ request }) {
  const formattedDate = new Date(request.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="card bg-white hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-center justify-between p-4 border-b border-cream-200">
        <div>
          <p className="text-xs text-gray-600 font-medium">Request #</p>
          <p className="font-bold text-gray-900 font-mono text-sm">{request.orderNumber || 'Pending'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">Requested on</p>
          <p className="text-sm font-semibold text-gray-800">{formattedDate}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-[#FFF4E5] flex items-center justify-center shrink-0">
          <Drill className="w-7 h-7 text-[#8F431A]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {request.serviceType.replace('_', ' ')}
          </p>
          <p className="text-xs text-gray-600 mt-1">Qty: {request.quantity} | Size: {request.sizeL}x{request.sizeB}x{request.sizeH}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{request.notes || 'No notes provided'}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-600">Est. Price</p>
          <p className="font-bold text-[#8F431A] text-sm leading-tight">{request.priceRange}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-cream-200 bg-cream-50">
        <div>
          {request.trackingNumber ? (
            <p className="text-xs text-gray-600">
              Tracking: <span className="font-mono font-semibold text-gray-800">{request.trackingNumber}</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">Tracking details will appear once shipped</p>
          )}
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <a
            href={request.designFileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-[#8F431A] hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors border border-[#8F431A]/20"
          >
            Download Design
          </a>
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
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'services'
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
      
      if (activeTab === 'orders') {
        const { data } = await ordersApi.myOrders(params);
        setItems(data.data || []);
        setTotal(data.meta?.total || 0);
      } else {
        const { data } = await serviceRequestsApi.myRequests(params);
        setItems(data.data || []);
        setTotal(data.meta?.total || 0);
      }
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, activeTab]);

  useEffect(() => {
    setPage(1);
    setStatusFilter('');
  }, [activeTab]);

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
  const currentFilters = activeTab === 'orders' ? ORDER_STATUS_FILTERS : SERVICE_STATUS_FILTERS;

  return (
    <div className="min-h-screen bg-cream-100 page-enter">
      <div className="bg-linear-to-br from-forest-800 to-forest-600 text-white">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-8 h-8" />
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fraunces, serif' }}>History & Tracking</h1>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-2xl w-fit mb-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-forest-800 shadow-lg' : 'hover:bg-white/10'}`}
            >
              Product Orders
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-white text-forest-800 shadow-lg' : 'hover:bg-white/10'}`}
            >
              Service Requests
            </button>
          </div>

          {/* Status filter pills */}
          <div className="flex gap-2 flex-wrap">
            {currentFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === value
                    ? 'bg-white text-brand-primary shadow-md'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-16 text-center bg-white">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
              {statusFilter ? 'No items with this status' : 'Nothing found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'orders' 
                ? 'You haven\'t placed any product orders yet.' 
                : 'You haven\'t made any service requests yet.'}
            </p>
            {activeTab === 'orders' && !statusFilter && (
              <a href="/products" className="btn-primary">
                Shop Products 🏆
              </a>
            )}
            {activeTab === 'services' && !statusFilter && (
              <a href="/services" className="btn-primary">
                Explore Services
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                activeTab === 'orders' 
                  ? <OrderCard key={item.id} order={item} onCancel={cancelOrder} />
                  : <ServiceRequestCard key={item.id} request={item} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      page === p
                        ? 'bg-brand-primary text-white shadow-md'
                        : 'bg-white text-gray-600 border border-cream-300 hover:border-brand-secondary'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
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
