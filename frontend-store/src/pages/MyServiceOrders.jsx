import { useQuery } from '@tanstack/react-query';
import { 
  History, Clock, CheckCircle2, XCircle, 
  ChevronRight, Info, Printer, Settings, 
  Search, Filter, Download, FileText, 
  Truck, RefreshCw, Package, ArrowLeft,
  ChevronDown, ChevronUp, MapPin, ExternalLink
} from 'lucide-react';
import api from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const STATUSES = [
  { key: 'PENDING',    label: 'Order Placed',   icon: Clock,       desc: 'Your request is being reviewed' },
  { key: 'CONFIRMED',  label: 'Confirmed',      icon: CheckCircle2, desc: 'Technical review complete' },
  { key: 'PROCESSING', label: 'In Production',  icon: RefreshCw,   desc: 'Your order is being crafted' },
  { key: 'SHIPPED',    label: 'Out for Delivery',icon: Truck,       desc: 'Order is on its way' },
  { key: 'DELIVERED',  label: 'Delivered',      icon: CheckCircle2, desc: 'Order received successfully' },
];

const STATUS_ICONS = {
  PENDING:    { icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50',     label: 'Reviewing' },
  CONFIRMED:  { icon: CheckCircle2,  color: 'text-blue-500',   bg: 'bg-blue-50',      label: 'Confirmed' },
  PROCESSING: { icon: RefreshCw,     color: 'text-indigo-500', bg: 'bg-indigo-50',    label: 'Production' },
  SHIPPED:    { icon: Truck,         color: 'text-purple-500', bg: 'bg-purple-50',    label: 'Shipped' },
  DELIVERED:  { icon: CheckCircle2,  color: 'text-green-500',  bg: 'bg-green-50',     label: 'Delivered' },
  CANCELLED:  { icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50',       label: 'Cancelled' },
};

function TrackingTimeline({ currentStatus }) {
  const statusIndex = STATUSES.findIndex(s => s.key === currentStatus);
  if (currentStatus === 'CANCELLED') return null;

  return (
    <div className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-8">
         <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Service Timeline</h5>
         <div className="px-2 py-0.5 rounded-md bg-green-50 text-[10px] font-bold text-green-600 uppercase tracking-wider">Live Status</div>
      </div>
      <div className="relative">
        {/* Mobile Vertical View */}
        <div className="md:hidden space-y-6 relative">
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-100" />
          {STATUSES.map((s, idx) => {
            const isCompleted = statusIndex >= idx;
            const isCurrent = currentStatus === s.key;
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex items-center gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-brand-primary text-white' : 'bg-white border-2 border-gray-100 text-gray-300'
                } ${isCurrent ? 'ring-4 ring-brand-primary/20 scale-110' : ''}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wide ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                  {isCurrent && <p className="text-[10px] text-brand-primary font-medium">{s.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Horizontal View */}
        <div className="hidden md:block">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100" />
          <div 
            className="absolute top-4 left-0 h-0.5 bg-brand-primary transition-all duration-700" 
            style={{ width: `${(statusIndex / (STATUSES.length - 1)) * 100}%` }}
          />
          <div className="flex justify-between relative z-10">
            {STATUSES.map((s, idx) => {
              const isCompleted = statusIndex >= idx;
              const isCurrent = currentStatus === s.key;
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex flex-col items-center text-center max-w-[80px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all mb-3 ${
                    isCompleted ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white border-2 border-gray-100 text-gray-300'
                  } ${isCurrent ? 'ring-4 ring-brand-primary/20 scale-110' : ''}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest leading-tight ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                  {isCurrent && <p className="text-[8px] text-brand-primary font-bold mt-1 uppercase opacity-70">Active</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_ICONS[order.status] || STATUS_ICONS.PENDING;
  const Icon = status.icon;

  return (
    <div className={`bg-white rounded-[2.5rem] border transition-all duration-300 ${expanded ? 'border-brand-primary/20 shadow-xl shadow-brand-primary/5' : 'border-gray-100 shadow-sm hover:shadow-md'}`}>
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Info */}
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.25rem] ${order.category === 'MACHINE' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center shrink-0 shadow-inner`}>
               {order.category === 'MACHINE' ? <Settings className="w-8 h-8" /> : <Printer className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                 <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{order.orderNumber}</span>
                 <span className="w-1 h-1 rounded-full bg-gray-200" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{order.serviceName}</h4>
              <p className="text-sm text-gray-500 font-medium">{order.productName || 'Standard Customization'}</p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-12 pl-20 lg:pl-0">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Status</p>
                <div className={`flex items-center gap-2 ${status.color}`}>
                   <Icon className="w-4 h-4" />
                   <span className="text-xs font-black uppercase tracking-wider">{status.label}</span>
                </div>
             </div>

             <div className="space-y-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Invested</p>
                <p className="text-lg font-black text-gray-900 leading-none">₹{Number(order.totalAmount).toFixed(0)}</p>
             </div>

             <div className="flex items-center gap-3">
                {order.fileUrl && (
                  <a href={order.fileUrl} target="_blank" rel="noreferrer" title="Download Artwork" className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                     <Download className="w-4 h-4" />
                  </a>
                )}
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${expanded ? 'bg-brand-primary text-white rotate-180' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white'}`}
                >
                   {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
             </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                <div className="space-y-6">
                   <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Service Configuration</h5>
                   <div className="grid grid-cols-2 gap-4">
                      {Object.entries(order.details || {}).map(([key, value]) => {
                        if (key === 'pricing') return null;
                        return (
                          <div key={key} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                             <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                             <p className="text-xs font-bold text-gray-800 break-words">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                          </div>
                        );
                      })}
                      <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                         <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Quantity</p>
                         <p className="text-xs font-bold text-gray-800">{order.quantity} Units</p>
                      </div>
                   </div>
                   {order.specialRemark && (
                      <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100/50">
                         <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">Instructions for Production</p>
                         <p className="text-xs text-amber-900 font-medium italic">"{order.specialRemark}"</p>
                      </div>
                   )}
                </div>

                <div className="space-y-6">
                   <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Logistic Details</h5>
                   <div className="space-y-4">
                      {order.trackingNumber ? (
                        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                           <div>
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Courier ID</p>
                              <p className="text-sm font-black text-indigo-900 font-mono tracking-wider">{order.trackingNumber}</p>
                           </div>
                           <Truck className="w-6 h-6 text-indigo-400" />
                        </div>
                      ) : (
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4 text-gray-400">
                           <Info className="w-5 h-5 shrink-0" />
                           <p className="text-[11px] font-bold leading-snug">Logistics ID will be assigned once production is 100% complete.</p>
                        </div>
                      )}
                      <div className="p-5 rounded-2xl bg-white border border-gray-100">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <MapPin className="w-3 h-3" /> Delivery Option
                         </p>
                         <p className="text-xs font-black text-gray-900 uppercase tracking-wide">
                            {order.details?.deliveryOption || 'Standard Logistic'}
                         </p>
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

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-service-orders'],
    queryFn: async () => {
      const { data } = await api.get('/service-orders/my');
      return data.data;
    }
  });

  const filteredOrders = orders?.filter(o => {
    if (filter === 'ALL') return true;
    return o.category === filter;
  });

  if (isLoading) return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-brand-primary font-black uppercase tracking-widest text-xs">Accessing Production Ledger...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8">
           <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
           <ChevronRight className="w-3 h-3" />
           <Link to="/account" className="hover:text-brand-primary transition-colors">Account</Link>
           <ChevronRight className="w-3 h-3" />
           <span className="text-gray-900">Services Ledger</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none font-outfit">My Services Ledger</h1>
            <div className="flex items-center gap-4">
               <div className="h-1 w-12 bg-brand-primary rounded-full" />
               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Real-time production & tracking monitor</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             {['ALL', 'PRINTING', 'MACHINE'].map(f => (
               <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/20' : 'bg-white text-gray-400 border border-gray-100 hover:border-brand-primary hover:text-brand-primary'}`}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-brand-primary/10 shadow-sm">
            <div className="w-24 h-24 bg-brand-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-brand-primary">
               <Printer className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">No Active Service Contracts</h3>
            <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto font-medium">Your customized production history is currently empty. Explore our enterprise solutions to begin.</p>
            <Link to="/services" className="bg-brand-primary text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/30 inline-block hover:scale-105 transition-all">
              Initialize Service
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders?.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <History className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight text-gray-900 mb-2">Automated Logs</h4>
              <p className="text-[11px] text-gray-500 font-medium">Every stage of production is logged and timestamped for transparency.</p>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight text-gray-900 mb-2">Design Archiving</h4>
              <p className="text-[11px] text-gray-500 font-medium">Your uploaded artwork is safely archived for future re-production requests.</p>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center">
              <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight text-gray-900 mb-2">Quality Control</h4>
              <p className="text-[11px] text-gray-500 font-medium">All services pass through strict QC before being marked as 'Delivered'.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function ShieldCheckIcon({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
