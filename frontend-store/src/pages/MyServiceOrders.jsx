import { useQuery } from '@tanstack/react-query';
import { 
  History, Clock, CheckCircle2, XCircle, 
  ChevronRight, Info, Printer, Settings, 
  Search, Filter, Download, FileText, 
  Truck, RefreshCw, Package, ArrowLeft,
  ChevronDown, ChevronUp, MapPin, ExternalLink,
  ShieldCheck, Receipt, CreditCard
} from 'lucide-react';
import api from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store';
import PaymentModal from '../components/PaymentModal';
import { useQueryClient } from '@tanstack/react-query';

const STATUSES = [
  { key: 'PENDING',    label: 'Order Placed',   icon: Clock,       desc: 'Your request is being reviewed' },
  { key: 'CONFIRMED',  label: 'Confirmed',      icon: CheckCircle2, desc: 'Technical review complete' },
  { key: 'PROCESSING', label: 'In Production',  icon: RefreshCw,   desc: 'Your order is being crafted' },
  { key: 'SHIPPED',    label: 'Out for Delivery',icon: Truck,       desc: 'Order is on its way' },
  { key: 'DELIVERED',  label: 'Delivered',      icon: CheckCircle2, desc: 'Order received successfully' },
];

const STATUS_ICONS = {
  PENDING:    { icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50',     label: 'Reviewing' },
  CONFIRMED:  { icon: CheckCircle2,  color: 'text-blue-600',   bg: 'bg-blue-50',      label: 'Confirmed' },
  PROCESSING: { icon: RefreshCw,     color: 'text-indigo-600', bg: 'bg-indigo-50',    label: 'Production' },
  SHIPPED:    { icon: Truck,         color: 'text-purple-600', bg: 'bg-purple-50',    label: 'Shipped' },
  DELIVERED:  { icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50',     label: 'Delivered' },
  CANCELLED:  { icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50',       label: 'Cancelled' },
};

function TrackingTimeline({ currentStatus }) {
  const statusIndex = STATUSES.findIndex(s => s.key === currentStatus);
  if (currentStatus === 'CANCELLED') return null;

  return (
    <div className="mt-8 pt-8 border-t border-cream-200">
      <div className="flex items-center justify-between mb-8">
         <h5 className="text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.2em]">Service Progress Timeline</h5>
         <div className="px-2.5 py-1 rounded-full bg-green-50 text-[10px] font-bold text-green-700 uppercase tracking-wider border border-green-100">Live Status</div>
      </div>
      <div className="relative">
        {/* Mobile Vertical View */}
        <div className="md:hidden space-y-6 relative">
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-cream-200" />
          {STATUSES.map((s, idx) => {
            const isCompleted = statusIndex >= idx;
            const isCurrent = currentStatus === s.key;
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex items-center gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-brand-primary text-white' : 'bg-white border-2 border-cream-200 text-cream-400'
                } ${isCurrent ? 'ring-4 ring-brand-primary/20 scale-110 shadow-lg shadow-brand-primary/20' : ''}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div>
                  <p className={`text-[11px] font-black uppercase tracking-wider ${isCompleted ? 'text-brand-deep' : 'text-cream-400'}`}>{s.label}</p>
                  {isCurrent && <p className="text-[10px] text-brand-primary font-medium">{s.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Horizontal View */}
        <div className="hidden md:block">
          <div className="absolute top-4 left-0 right-0 h-[2px] bg-cream-200" />
          <div 
            className="absolute top-4 left-0 h-[2px] bg-brand-primary transition-all duration-1000 ease-in-out" 
            style={{ width: `${(statusIndex / (STATUSES.length - 1)) * 100}%` }}
          />
          <div className="flex justify-between relative z-10">
            {STATUSES.map((s, idx) => {
              const isCompleted = statusIndex >= idx;
              const isCurrent = currentStatus === s.key;
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex flex-col items-center text-center max-w-[100px]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all mb-3 ${
                    isCompleted ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30' : 'bg-white border-2 border-cream-200 text-cream-300'
                  } ${isCurrent ? 'ring-4 ring-brand-primary/20 scale-110' : ''}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest leading-tight ${isCompleted ? 'text-brand-deep' : 'text-cream-400'}`}>{s.label}</p>
                  {isCurrent && <p className="text-[8px] text-brand-primary font-bold mt-1.5 uppercase opacity-80 tracking-tighter">Current Stage</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onPay }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_ICONS[order.status] || STATUS_ICONS.PENDING;
  const Icon = status.icon;

  return (
    <div className={`group bg-white rounded-3xl border transition-all duration-500 overflow-hidden ${expanded ? 'border-brand-primary/30 shadow-2xl shadow-brand-primary/10' : 'border-cream-200 shadow-sm hover:shadow-xl hover:border-brand-primary/20'}`}>
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Main Info */}
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl ${order.category === 'MACHINE' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-brand-soft text-brand-primary border-brand-surface'} flex items-center justify-center shrink-0 shadow-inner border transition-transform duration-300 group-hover:scale-105`}>
               {order.category === 'MACHINE' ? <Settings className="w-10 h-10" /> : <Printer className="w-10 h-10" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                 <span className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em]">{order.orderNumber}</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-cream-300" />
                 <span className="text-[10px] font-bold text-cream-500 uppercase">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <h4 className="text-2xl font-black text-brand-deep uppercase tracking-tight truncate leading-tight">{order.serviceName}</h4>
              <p className="text-sm text-brand-text/60 font-medium">{order.productName || 'Standard Professional Service'}</p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center gap-8 lg:gap-16">
             <div className="space-y-1.5">
                <p className="text-[9px] font-black text-cream-500 uppercase tracking-widest">Transaction Status</p>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${status.bg} ${status.color} border border-current/20`}>
                   <Icon className="w-3.5 h-3.5" />
                   <span>{status.label}</span>
                </div>
             </div>

             <div className="space-y-1">
                <p className="text-[9px] font-black text-cream-500 uppercase tracking-widest">Total Value</p>
                <p className="text-2xl font-black text-brand-deep leading-none">₹{Number(order.totalAmount).toLocaleString('en-IN')}</p>
             </div>

             <div className="flex items-center gap-4">
                {order.fileUrl && (
                  <a href={order.fileUrl} target="_blank" rel="noreferrer" title="Download Artwork" className="w-12 h-12 bg-cream-100 rounded-2xl flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm border border-cream-200">
                     <Download className="w-5 h-5" />
                  </a>
                )}
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${expanded ? 'bg-brand-primary text-white rotate-180 shadow-lg shadow-brand-primary/30' : 'bg-brand-soft text-brand-primary hover:bg-brand-primary hover:text-white border border-brand-surface'}`}
                >
                   <ChevronDown className="w-6 h-6" />
                </button>
                {order.paymentStatus !== 'PAID' && (
                  <button 
                    onClick={() => onPay(order)}
                    className="bg-brand-primary text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Pay Now
                  </button>
                )}
             </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-10 animate-in fade-in slide-in-from-top-6 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-cream-200">
                <div className="space-y-8">
                   <h5 className="text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.25em] flex items-center gap-2">
                     <Receipt className="w-3.5 h-3.5" /> Service Specification
                   </h5>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(order.details || {}).map(([key, value]) => {
                        if (key === 'pricing' || key === 'deliveryOption') return null;
                        return (
                          <div key={key} className="p-5 bg-cream-50/50 rounded-2xl border border-cream-100 hover:border-brand-secondary/30 transition-colors">
                             <p className="text-[9px] font-bold text-cream-500 uppercase mb-1.5 tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                             <p className="text-xs font-black text-brand-deep break-words">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                          </div>
                        );
                      })}
                      <div className="p-5 bg-cream-50/50 rounded-2xl border border-cream-100">
                         <p className="text-[9px] font-bold text-cream-500 uppercase mb-1.5 tracking-wider">Quantity Ordered</p>
                         <p className="text-xs font-black text-brand-deep">{order.quantity} Units</p>
                      </div>
                   </div>
                   {order.specialRemark && (
                      <div className="p-6 bg-brand-soft/30 rounded-3xl border border-brand-surface/50 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Info className="w-12 h-12 text-brand-primary" />
                         </div>
                         <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-3">Customization Notes</p>
                         <p className="text-xs text-brand-deep font-medium italic leading-relaxed">"{order.specialRemark}"</p>
                      </div>
                   )}
                </div>

                <div className="space-y-8">
                   <h5 className="text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.25em] flex items-center gap-2">
                     <Truck className="w-3.5 h-3.5" /> Logistic Information
                   </h5>
                   <div className="space-y-5">
                      {order.trackingNumber ? (
                        <div className="p-6 bg-brand-deep text-white rounded-3xl shadow-xl shadow-brand-deep/10 flex items-center justify-between border border-white/10 group/tracking">
                           <div>
                              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-1.5">Courier Consignment ID</p>
                              <div className="flex items-center gap-3">
                                <p className="text-lg font-black font-mono tracking-widest">{order.trackingNumber}</p>
                                <ExternalLink className="w-4 h-4 text-brand-secondary opacity-0 group-hover/tracking:opacity-100 transition-opacity" />
                              </div>
                           </div>
                           <Truck className="w-8 h-8 text-brand-secondary/40" />
                        </div>
                      ) : (
                        <div className="p-6 bg-cream-50 rounded-3xl border border-cream-200 flex items-center gap-5 text-cream-600">
                           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-cream-200">
                             <Info className="w-5 h-5" />
                           </div>
                           <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wider">Logistic ID will be automatically generated upon 100% production completion.</p>
                        </div>
                      )}
                      <div className="p-6 rounded-3xl bg-white border border-cream-200 flex items-center justify-between hover:border-brand-primary/30 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center text-brand-primary border border-brand-surface">
                               <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-cream-500 uppercase tracking-widest">Delivery Mode</p>
                               <p className="text-xs font-black text-brand-deep uppercase tracking-wide">
                                  {order.details?.deliveryOption || 'Premium Surface Transport'}
                               </p>
                            </div>
                         </div>
                         <div className="px-3 py-1 rounded-full bg-brand-surface/30 text-[9px] font-black text-brand-primary uppercase tracking-widest border border-brand-surface">Verified</div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Tracking Timeline */}
             <TrackingTimeline currentStatus={order.status} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyServiceOrders() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-service-orders'],
    queryFn: async () => {
      const { data } = await api.get('/service-orders/my');
      return data.data;
    }
  });

  const handlePay = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries(['my-service-orders']);
    toast.success('Payment recorded! 🎉');
  };

  const filteredOrders = orders?.filter(o => {
    if (filter === 'ALL') return true;
    return o.category === filter;
  });

  if (isLoading) return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-8">
           <div className="absolute inset-0 border-4 border-brand-soft rounded-full" />
           <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
              <History className="w-8 h-8 text-brand-primary animate-pulse" />
           </div>
        </div>
        <p className="text-brand-primary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing Production Ledger</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100 pt-32 pb-24 px-4 luxury-grain relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-cream-600 text-[10px] font-black uppercase tracking-[0.2em] mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
           <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
           <ChevronRight className="w-3 h-3 text-cream-400" />
           <Link to="/account" className="hover:text-brand-primary transition-colors">Account</Link>
           <ChevronRight className="w-3 h-3 text-cream-400" />
           <span className="text-brand-deep bg-brand-soft px-2 py-0.5 rounded">Services Ledger</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div className="space-y-6 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black text-brand-deep uppercase tracking-tighter leading-[0.85] font-display">
              Services <br />
              <span className="text-brand-secondary">Ledger</span>
            </h1>
            <div className="flex items-center gap-5">
               <div className="h-[3px] w-16 bg-brand-secondary rounded-full" />
               <p className="text-[11px] text-brand-text/50 font-black uppercase tracking-[0.25em]">End-to-End Professional Service Monitoring</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white/50 shadow-sm">
             {['ALL', 'PRINTING', 'MACHINE'].map(f => (
               <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${filter === f ? 'bg-brand-deep text-white shadow-2xl shadow-brand-deep/30 scale-105' : 'text-brand-text/40 hover:text-brand-primary hover:bg-white'}`}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-[4rem] p-24 text-center border border-cream-200 shadow-2xl shadow-brand-primary/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-soft/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <div className="w-28 h-28 bg-brand-soft rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-brand-primary border border-brand-surface shadow-inner">
                 <Printer className="w-14 h-14" />
              </div>
              <h3 className="text-3xl font-black text-brand-deep uppercase tracking-tight mb-4">No Active Service Contracts</h3>
              <p className="text-brand-text/50 text-sm mb-12 max-w-sm mx-auto font-medium uppercase tracking-widest leading-loose">Your professional production history is currently empty. Initiate a new project below.</p>
              <Link to="/services" className="bg-brand-deep text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-deep/40 inline-block hover:scale-110 hover:-translate-y-1 transition-all active:scale-95">
                New Service Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredOrders?.map((order) => (
              <OrderCard key={order.id} order={order} onPay={handlePay} />
            ))}
          </div>
        )}

        {/* Feature grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="bg-white p-10 rounded-[3rem] border border-cream-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="w-14 h-14 bg-brand-soft text-brand-primary rounded-2xl flex items-center justify-center mb-8 border border-brand-surface">
                 <History className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-brand-deep mb-4">Automated Logs</h4>
              <p className="text-xs text-brand-text/50 font-medium leading-relaxed uppercase tracking-wider">Every technical stage is timestamped for complete project transparency and auditing.</p>
           </div>
           <div className="bg-white p-10 rounded-[3rem] border border-cream-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="w-14 h-14 bg-brand-soft text-brand-primary rounded-2xl flex items-center justify-center mb-8 border border-brand-surface">
                 <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-brand-deep mb-4">Asset Archiving</h4>
              <p className="text-xs text-brand-text/50 font-medium leading-relaxed uppercase tracking-wider">Your uploaded blueprints and artwork are securely archived for seamless re-production.</p>
           </div>
           <div className="bg-white p-10 rounded-[3rem] border border-cream-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="w-14 h-14 bg-brand-soft text-brand-primary rounded-2xl flex items-center justify-center mb-8 border border-brand-surface">
                 <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-brand-deep mb-4">Quality Assurance</h4>
              <p className="text-xs text-brand-text/50 font-medium leading-relaxed uppercase tracking-wider">Multi-stage QC protocols ensure every deliverable meets professional enterprise standards.</p>
           </div>
        </div>
      </div>
      {showPaymentModal && selectedOrder && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={{
            orderId: selectedOrder.id,
            orderType: 'SERVICE_ORDER',
            totalAmount: Number(selectedOrder.totalAmount),
            userName: user?.name || 'Customer',
            userEmail: user?.email || '',
            userPhone: user?.phone || '',
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
