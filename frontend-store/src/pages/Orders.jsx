import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package, ChevronRight, Clock, Truck, CheckCircle,
  XCircle, RefreshCw, Filter, ShoppingBag, Printer, Search
} from 'lucide-react';
import { ordersApi } from '../api';
import { useMyOrders as useServiceOrders } from '../services/customPrinting.api';
import toast from 'react-hot-toast';

const ORDER_STATUS_FILTERS = [
  { value: '',           label: 'All' },
  { value: 'PENDING',    label: 'Pending' },
  { value: 'CONFIRMED',  label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED',    label: 'Shipped' },
  { value: 'DELIVERED',  label: 'Delivered' },
  { value: 'CANCELLED',  label: 'Cancelled' },
];

function StatusBadge({ status }) {
  const map = {
    PENDING:      { bg: 'bg-amber-100',   text: 'text-amber-700',   icon: Clock,       label: 'Pending' },
    IN_PRODUCTION: { bg: 'bg-purple-100',  text: 'text-purple-700', icon: RefreshCw,   label: 'In Production' },
    CONFIRMED:    { bg: 'bg-blue-100',    text: 'text-blue-700',   icon: CheckCircle, label: 'Confirmed' },
    PROCESSING:   { bg: 'bg-purple-100',  text: 'text-purple-700', icon: RefreshCw,   label: 'Processing' },
    SHIPPED:      { bg: 'bg-indigo-100',  text: 'text-indigo-700', icon: Truck,       label: 'Shipped' },
    DISPATCHED:   { bg: 'bg-indigo-100',  text: 'text-indigo-700', icon: Truck,       label: 'Dispatched' },
    DELIVERED:    { bg: 'bg-green-100',   text: 'text-green-700',  icon: CheckCircle, label: 'Delivered' },
    CANCELLED:    { bg: 'bg-red-100',     text: 'text-red-700',    icon: XCircle,     label: 'Cancelled' },
  };
  const s = map[status] || map.PENDING;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.bg} ${s.text}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  );
}

function ProductOrderCard({ order, onCancel }) {
  const navigate = useNavigate();
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const firstItem = order.items?.[0];
  const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-cream-200 hover:shadow-xl transition-all group overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-cream-100 bg-cream-50/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Order Number</span>
          <span className="font-bold text-gray-900 font-mono text-sm">{order.orderNumber}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-brand-surface flex items-center justify-center shrink-0">
          {firstItem?.product?.images?.[0] ? (
            <img src={firstItem.product.images[0].url} className="w-full h-full object-cover rounded-xl" alt="" />
          ) : (
            <ShoppingBag className="w-7 h-7 text-brand-secondary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight truncate">{firstItem?.productName || 'Multiple Products'}</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{itemCount} Items • ₹{Number(order.total).toFixed(0)}</p>
        </div>
        <button onClick={() => navigate(`/orders/${order.id}`)} className="p-2 hover:bg-cream-100 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

function ServiceOrderCard({ order }) {
  const navigate = useNavigate();
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-cream-200 hover:shadow-xl transition-all group overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-cream-100 bg-[#fffaf5]">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-[#b65e2e] uppercase tracking-widest leading-none mb-1">Service Order</span>
          <span className="font-bold text-gray-900 font-mono text-sm">{order.orderNumber}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="p-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-[#fffaf5] border border-[#f3ebdf] flex items-center justify-center shrink-0">
          <Printer className="w-7 h-7 text-[#b65e2e]" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-bold text-gray-900 text-sm leading-tight truncate">{order.orderName}</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{order.serviceType} • ₹{Number(order.totalAmount).toFixed(0)}</p>
        </div>
        <Link to={`/orders/track/${order.orderNumber}`} className="flex items-center gap-1.5 px-4 py-2 bg-[#b65e2e] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#a15024] transition-all">
          <Search className="w-3 h-3" /> Track
        </Link>
      </div>
    </div>
  );
}

export default function Orders() {
  const [activeTab, setActiveTab] = useState('products');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 8;

  const navigate = useNavigate();

  // Fetch product orders
  const fetchProductOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      const { data } = await ordersApi.myOrders(params);
      setItems(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch {
      toast.error('Failed to load product history');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  // Fetch service orders using TanStack Query hook manually for simpler integration here
  const { data: serviceData, isLoading: servicesLoading, refetch: refetchServices } = useServiceOrders(page);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProductOrders();
    } else {
      setItems(serviceData?.data || []);
      setTotal(serviceData?.pagination?.total || 0);
      setLoading(servicesLoading);
    }
  }, [activeTab, fetchProductOrders, serviceData, servicesLoading]);

  const cancelOrder = async (id) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await ordersApi.cancel(id);
      toast.success('Order cancelled');
      fetchProductOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-[#faf8f5] font-sans">
      <div className="bg-[#1c1a19] text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#b65e2e_0%,transparent_60%)] opacity-20" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-10 h-10 text-[#b65e2e]" />
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">My Order <span className="text-[#b65e2e]">Vault</span></h1>
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Track and manage your retail & custom service orders</p>
            </div>
            
            <div className="flex bg-[#2d2a29] p-1.5 rounded-2xl border border-gray-800">
              <button 
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'products' ? 'bg-[#b65e2e] text-white shadow-lg shadow-[#b65e2e]/20' : 'text-gray-500 hover:text-white'
                }`}
              >
                Retail Store
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'services' ? 'bg-[#b65e2e] text-white shadow-lg shadow-[#b65e2e]/20' : 'text-gray-500 hover:text-white'
                }`}
              >
                Custom Services
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-white rounded-3xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">No Orders Found</h2>
            <p className="text-gray-500 text-xs font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              It seems you haven't placed any {activeTab === 'products' ? 'retail' : 'custom service'} orders yet.
            </p>
            <Link to={activeTab === 'products' ? '/products' : '/services'} className="inline-flex items-center gap-2 px-8 py-4 bg-[#b65e2e] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#a15024] transition-all">
               Browse {activeTab === 'products' ? 'Products' : 'Services'} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {items.map((item) => (
              activeTab === 'products' ? (
                <ProductOrderCard key={item.id} order={item} onCancel={cancelOrder} />
              ) : (
                <ServiceOrderCard key={item.id} order={item} />
              )
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-16">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-[#b65e2e] disabled:opacity-30 transition-all"
            >
              ←
            </button>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-[#b65e2e] disabled:opacity-30 transition-all"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
