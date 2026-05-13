import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Download, Clock, User, 
  Mail, Phone, Package, Info, CheckCircle2,
  AlertCircle, Trash2, Printer, Settings, FileText, CreditCard,
  ChevronLeft, ExternalLink, PenTool, Layout, Truck,
  RefreshCw, ShieldCheck, Activity, MapPin, ChevronRight, Calendar
} from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import PaymentModal from '../../components/PaymentModal';

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function ServiceOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['service-order', id],
    queryFn: async () => {
      const { data } = await api.get(`/service-orders/${id}`);
      return data.data;
    },
    staleTime: 1000 * 60,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      await api.patch(`/service-orders/admin/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['service-order', id]);
      toast.success('Production stage synchronized');
    }
  });

  const updateTrackingMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/service-orders/admin/${id}/tracking`, { trackingNumber });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['service-order', id]);
      toast.success('Logistics manifest updated');
      setTrackingNumber('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!window.confirm('Confirm permanent archival of this technical manifest?')) return;
      await api.delete(`/service-orders/admin/${id}`);
    },
    onSuccess: () => {
      toast.success('Manifest successfully archived');
      navigate(order.category === 'MACHINE' ? '/machine-orders' : '/print-orders');
    }
  });

  if (isLoading) return (
    <div className="space-y-10 animate-pulse">
       <div className="h-12 bg-brand-primary/5 rounded-2xl w-1/4" />
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
             <div className="h-64 bg-brand-primary/5 rounded-[2.5rem]" />
             <div className="h-96 bg-brand-primary/5 rounded-[2.5rem]" />
          </div>
          <div className="h-[600px] bg-brand-primary/5 rounded-[2.5rem]" />
       </div>
    </div>
  );

  if (!order) return (
    <div className="card p-16 text-center border-brand-primary/5 bg-white/50 backdrop-blur-xl">
       <div className="w-20 h-20 bg-brand-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-primary/10">
          <Package className="w-10 h-10 text-brand-primary/20" />
       </div>
       <h3 className="text-brand-primary font-bold text-2xl font-display tracking-tight">Manifest Not Discovered</h3>
       <p className="text-brand-text/40 text-sm mt-3 mb-10 max-w-sm mx-auto">The requested service order manifest is missing from our central archives or has been permanently decommissioned.</p>
       <button onClick={() => navigate(-1)} className="btn-primary py-3.5 px-10 text-[10px] uppercase tracking-widest font-black">Return to Logistics</button>
    </div>
  );

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => navigate(-1)}
             className="p-3.5 rounded-2xl bg-white border border-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-90"
           >
              <ChevronLeft className="w-6 h-6" />
           </button>
           <div>
              <div className="flex items-center gap-2 mb-1.5">
                 <Activity className="w-3.5 h-3.5 text-brand-secondary" />
                 <span className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.4em]">Service Logistics / {order.category} Asset</span>
              </div>
              <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight flex items-center gap-4">
                 Order #{order.orderNumber}
                 <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${order.category === 'MACHINE' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-brand-surface text-brand-primary border-brand-primary/10'}`}>
                   {order.category}
                 </span>
              </h1>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => deleteMutation.mutate()}
             className="p-3.5 rounded-2xl bg-white border border-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
             title="Archive Order"
           >
             <Trash2 className="w-6 h-6" />
           </button>
           <button className="btn-primary py-3.5 px-10 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20">
              Process Manifest
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-10">
          
          <div className="card overflow-hidden bg-white/80 backdrop-blur-xl border-brand-primary/5">
            <div className="p-10 border-b border-brand-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div>
                  <h3 className="font-bold text-brand-primary font-display text-3xl tracking-tight leading-none">{order.serviceName}</h3>
                  <p className="text-[11px] font-black text-brand-text/30 uppercase tracking-[0.3em] mt-3">High-Fidelity Technical Implementation Request</p>
               </div>
               <div className="flex flex-col items-end gap-2">
                  <span className="text-[9px] font-black text-brand-text/30 uppercase tracking-widest mr-1">Current Production State</span>
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                    className="input-field py-3 px-6 text-[10px] font-black uppercase tracking-widest bg-brand-surface/50 border-brand-primary/10 shadow-inner focus:bg-white transition-all appearance-none cursor-pointer text-center"
                  >
                    {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-brand-primary/5">
              {[
                { label: 'Ingested On', value: new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), icon: Calendar },
                { label: 'Total Valuation', value: `₹${Number(order.totalAmount).toLocaleString('en-IN')}`, highlight: true, icon: Activity },
                { label: 'Asset Volume', value: `${order.quantity} Units`, icon: Package },
                { label: 'Source Format', value: order.fileOption, uppercase: true, icon: FileText }
              ].map((stat, i) => (
                <div key={i} className="p-8 text-center group hover:bg-brand-surface/30 transition-colors">
                  <div className="flex items-center justify-center mb-3">
                     <stat.icon className="w-3.5 h-3.5 text-brand-text/20 group-hover:text-brand-secondary transition-colors" />
                  </div>
                  <p className="text-[9px] font-black text-brand-text/30 uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className={`text-base font-bold ${stat.highlight ? 'text-brand-secondary' : 'text-brand-primary'} ${stat.uppercase ? 'uppercase tracking-tighter' : ''}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="card p-8 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
                   <CreditCard className="w-32 h-32 transform translate-x-12 -translate-y-12" />
                </div>
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border transition-all duration-500 ${order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600 border-green-100 shadow-xl shadow-green-600/5' : 'bg-red-50 text-red-600 border-red-100 shadow-xl shadow-red-600/5 animate-pulse'}`}>
                   <CreditCard className="w-10 h-10" />
                </div>
                <div className="relative z-10">
                   <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.3em] mb-2">Settlement Registry</p>
                   <h3 className="text-3xl font-bold text-brand-primary font-display tracking-tight mb-1">
                      {order.paymentStatus || 'PENDING'}
                   </h3>
                   {order.paymentMethod && <p className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">Protocol: {order.paymentMethod}</p>}
                </div>
                {order.paymentStatus !== 'PAID' && (
                  <button 
                    onClick={() => setShowPaymentModal(true)}
                    className="btn-primary py-3.5 px-10 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 w-full shadow-lg shadow-brand-primary/10 mt-2"
                  >
                    Authorize Settlement
                  </button>
                )}
             </div>

             <div className="card p-8 bg-brand-primary text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                   <Truck className="w-32 h-32 transform translate-x-12 -translate-y-12" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                      <div className="flex items-center gap-2 mb-4">
                         <ShieldCheck className="w-4 h-4 text-brand-secondary" />
                         <span className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em]">Logistics Protocol</span>
                      </div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Active Manifest ID</p>
                      <h3 className="text-2xl font-bold font-display tracking-widest text-white truncate max-w-full mb-4">
                         {order.trackingNumber || 'UNASSIGNED'}
                      </h3>
                   </div>
                   <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="New Manifest ID"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="flex-1 bg-white/10 border-white/10 rounded-xl text-xs font-bold focus:ring-1 focus:ring-brand-secondary px-4 py-3 text-white placeholder:text-white/20 transition-all outline-none"
                      />
                      <button 
                        onClick={() => updateTrackingMutation.mutate()}
                        className="bg-brand-secondary hover:bg-brand-accent px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                      >
                        Sync
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="card overflow-hidden bg-white/50 backdrop-blur-xl border-brand-primary/5">
            <div className="p-8 border-b border-brand-primary/5 flex items-center justify-between">
               <h3 className="text-[11px] font-black text-brand-secondary uppercase tracking-[0.3em] flex items-center gap-3">
                 <Settings className="w-4 h-4" /> Technical Execution Matrix
               </h3>
               <span className="text-[9px] font-bold text-brand-text/30 uppercase tracking-widest">{Object.keys(order.details || {}).length} Parameters Detected</span>
            </div>
            <div className="p-10 grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-6">
              {Object.entries(order.details || {}).map(([key, value]) => {
                if (key === 'pricing') return null;
                return (
                  <div key={key} className="flex justify-between items-end pb-4 border-b border-brand-primary/5 group hover:border-brand-secondary/30 transition-all duration-300">
                    <span className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest group-hover:text-brand-primary transition-colors">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-sm font-bold text-brand-primary tracking-tight group-hover:scale-105 transition-transform">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                  </div>
                );
              })}
            </div>

            {order.specialRemark && (
              <div className="mx-10 mb-10 p-8 bg-brand-surface rounded-[2rem] border border-brand-primary/5 flex gap-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                    <PenTool className="w-16 h-16" />
                 </div>
                 <div className="w-14 h-14 rounded-2xl bg-white border border-brand-primary/10 flex items-center justify-center text-brand-secondary shadow-sm shrink-0 group-hover:rotate-12 transition-transform">
                    <PenTool className="w-6 h-6" />
                 </div>
                 <div className="flex-1 relative z-10">
                    <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.3em] mb-2">Administrative Directives</p>
                    <p className="text-base text-brand-primary italic font-medium leading-relaxed">"{order.specialRemark}"</p>
                 </div>
              </div>
            )}
          </div>

          {order.fileUrl && (
             <div className="card p-10 bg-brand-surface border-brand-primary/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
               <div className="absolute top-0 left-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <Layout className="w-48 h-48 transform -translate-x-16 -translate-y-12" />
               </div>
               <div className="flex items-center gap-8 relative z-10">
                 <div className="w-20 h-20 bg-brand-primary/5 rounded-[1.5rem] flex items-center justify-center text-brand-primary border border-brand-primary/10 shadow-inner group-hover:scale-105 transition-transform duration-500">
                    <FileText className="w-10 h-10" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-bold text-brand-primary font-display tracking-tight leading-tight">Design Architecture</h4>
                    <p className="text-[11px] text-brand-text/40 font-black uppercase tracking-[0.2em] mt-2">Transmitted via {order.fileOption} Protocol</p>
                 </div>
               </div>
               <button 
                 onClick={() => {
                   if (order.fileUrl === 'SEND_VIA_EMAIL') {
                     toast.info('Principal opted for neural delivery (email).');
                     return;
                   }
                   window.open(order.fileUrl, '_blank');
                 }}
                 className="bg-brand-primary text-white hover:bg-brand-secondary font-black py-4 px-10 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-brand-primary/10 uppercase text-[11px] tracking-[0.2em] relative z-10 group active:scale-95"
               >
                 <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> 
                 {order.fileUrl === 'SEND_VIA_EMAIL' ? 'Protocol: Email' : 'Retrieve Technical Asset'}
               </button>
            </div>
          )}
        </div>

        <div className="space-y-10">
          <div className="card p-10 bg-white/50 backdrop-blur-xl border-brand-primary/5">
            <h3 className="text-[11px] font-black text-brand-secondary uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
              <User className="w-4 h-4" /> Principal Identity
            </h3>
            <div className="space-y-10">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-brand-primary/5 border border-brand-primary/10 rounded-[1.25rem] flex items-center justify-center font-bold text-brand-primary text-2xl font-display shadow-sm relative group">
                    <div className="absolute inset-0 bg-brand-primary/10 rounded-[1.25rem] scale-0 group-hover:scale-100 transition-transform duration-500" />
                    <span className="relative z-10">{(order.customerName || order.user?.name)?.[0]}</span>
                 </div>
                 <div>
                    <p className="text-lg font-bold text-brand-primary tracking-tight leading-tight">{order.customerName || order.user?.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                       <ShieldCheck className="w-3 h-3 text-brand-secondary" />
                       <span className="text-[10px] text-brand-text/40 font-black uppercase tracking-widest">Premium Member</span>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-center gap-5 p-4 bg-brand-surface rounded-[1.25rem] border border-brand-primary/5 group hover:border-brand-secondary/30 transition-all duration-300">
                  <div className="p-2 rounded-lg bg-white border border-brand-primary/5 text-brand-text/30 group-hover:text-brand-primary transition-colors">
                     <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-[9px] font-black text-brand-text/20 uppercase tracking-widest mb-0.5">Contact Link</span>
                     <span className="text-[11px] font-bold text-brand-primary truncate">{order.user?.email || 'Registry Missing'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 p-4 bg-brand-surface rounded-[1.25rem] border border-brand-primary/5 group hover:border-brand-secondary/30 transition-all duration-300">
                  <div className="p-2 rounded-lg bg-white border border-brand-primary/5 text-brand-text/30 group-hover:text-brand-primary transition-colors">
                     <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-[9px] font-black text-brand-text/20 uppercase tracking-widest mb-0.5">Secure Line</span>
                     <span className="text-[11px] font-bold text-brand-primary">{order.user?.phone || 'Line Missing'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-primary/5">
                 <Link 
                  to={`/customers/${order.userId}`}
                  className="flex items-center justify-between text-[10px] font-black text-brand-secondary hover:text-brand-primary uppercase tracking-[0.3em] transition-all group"
                >
                  Inspect Registry Record
                  <div className="w-8 h-8 rounded-full bg-brand-primary/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                     <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="card p-10 bg-[linear-gradient(180deg,#3b291f,#2a1d16)] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-secondary via-white/20 to-brand-secondary" />
              <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                 <Activity className="w-4 h-4" /> Production Lifecycle
              </h3>
              
              <div className="space-y-12 relative">
                <div className="absolute left-[13px] top-4 bottom-4 w-px bg-white/10" />
                
                {STATUS_FLOW.map((s, idx) => {
                  const isCompleted = STATUS_FLOW.indexOf(order.status) >= idx;
                  const isCurrent = order.status === s;
                  return (
                    <div key={s} className="relative flex items-center gap-8 group/step">
                      <div className={`w-[26px] h-[26px] rounded-full border-2 z-10 flex items-center justify-center transition-all duration-700 ${
                        isCompleted 
                          ? 'bg-brand-secondary border-brand-secondary shadow-[0_0_20px_rgba(231,168,124,0.4)] scale-110' 
                          : 'bg-white/5 border-white/10 group-hover/step:border-white/30'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-[#3b291f]" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 ${isCurrent ? 'text-white' : isCompleted ? 'text-white/60' : 'text-white/20'}`}>
                          {s}
                        </p>
                        {isCurrent && (
                           <div className="flex items-center gap-2 mt-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse" />
                              <p className="text-[9px] text-brand-secondary font-black uppercase tracking-widest">Active State</p>
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-16 pt-8 border-t border-white/5 text-center">
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Lifecycle Sync Active</p>
              </div>
          </div>
        </div>

      </div>
      
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={{
            orderId: order.id,
            orderType: 'SERVICE_ORDER',
            totalAmount: Number(order.totalAmount),
            userName: order.customerName || order.user?.name || 'Customer',
            userEmail: order.user?.email || '',
            userPhone: order.user?.phone || '',
          }}
          onSuccess={() => {
            queryClient.invalidateQueries(['service-order', id]);
            toast.success('Payment settlement verified');
          }}
        />
      )}
    </div>
  );
}
