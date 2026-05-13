import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  ChevronLeft, Package, User, MapPin, 
  CreditCard, Clock, Truck, Download, 
  ExternalLink, PenTool, Image as ImageIcon,
  CheckCircle2, AlertCircle, FileText,
  Activity, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';

const STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState('');

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await api.get('/orders/' + id);
      return res.data?.data;
    },
    staleTime: 1000 * 60,
  });

  const statusMut = useMutation({
    mutationFn: (status) => api.patch('/orders/' + id + '/status', { status }),
    onSuccess: () => {
      toast.success('Logistics state synchronized');
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Synchronization failed'),
  });

  const trackingMut = useMutation({
    mutationFn: () => api.patch('/orders/' + id + '/tracking', { trackingNumber: trackingNumber.trim() }),
    onSuccess: () => {
      toast.success('Tracking matrix updated');
      setTrackingNumber('');
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Uplink failed'),
  });

  if (error) return (
    <div className="card p-12 text-center border-red-100 bg-red-50/20">
      <AlertCircle className="w-16 h-16 text-red-200 mx-auto mb-4" />
      <h3 className="text-brand-primary font-bold text-lg font-display">Logistics Connection Lost</h3>
      <p className="text-brand-text/50 text-sm mt-2 mb-8">{error.message}</p>
      <Link to="/orders" className="btn-primary py-3 px-8">Return to Control</Link>
    </div>
  );
  
  if (isLoading) return (
    <div className="space-y-8 animate-pulse">
       <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-brand-primary/5 rounded-2xl" />
          <div className="space-y-2 flex-1">
             <div className="h-4 bg-brand-primary/5 rounded w-1/4" />
             <div className="h-8 bg-brand-primary/5 rounded w-1/3" />
          </div>
       </div>
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 h-[600px] bg-brand-primary/5 rounded-3xl" />
          <div className="h-[600px] bg-brand-primary/5 rounded-3xl" />
       </div>
    </div>
  );

  if (!order) return (
    <div className="card p-12 text-center border-brand-primary/5 bg-brand-surface/20">
       <Package className="w-16 h-16 text-brand-primary/10 mx-auto mb-4" />
       <h3 className="text-brand-primary font-bold text-lg font-display">Manifest Record Missing</h3>
       <p className="text-brand-text/40 text-sm mt-2 mb-8">The requested shipment ID could not be located in our secure directory.</p>
       <Link to="/orders" className="btn-primary py-3 px-8">Return to Logistics</Link>
    </div>
  );

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
           <Link to="/orders" className="p-3.5 rounded-2xl bg-white border border-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-90">
              <ChevronLeft className="w-5 h-5" />
           </Link>
           <div>
              <div className="flex items-center gap-2 mb-1.5">
                 <span className="p-1 rounded-md bg-brand-primary/5 text-brand-primary border border-brand-primary/5">
                    <Activity className="w-3 h-3" />
                 </span>
                 <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Logistics Command / Shipment Intelligence</p>
              </div>
              <h1 className="text-3xl font-bold text-brand-primary font-display tracking-tight flex items-center gap-4">
                 Manifest #{order.orderNumber}
                 <span className={`badge-status ${order.status.toLowerCase()} transform scale-90 origin-left`}>{order.status}</span>
              </h1>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="btn-secondary py-3 px-6 flex items-center gap-2 group hover:bg-brand-primary hover:text-white transition-all duration-500">
              <FileText className="w-4 h-4 text-brand-primary/40 group-hover:text-white transition-colors" />
              <span className="text-xs font-bold uppercase tracking-widest">Generate Invoice</span>
           </button>
           <button className="btn-primary py-3 px-8 flex items-center gap-2 shadow-lg shadow-brand-primary/20">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Mark as Processed</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          {/* Items Section */}
          <div className="card overflow-hidden">
            <div className="p-8 border-b border-brand-primary/5 bg-white/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="p-2.5 rounded-xl bg-brand-secondary/10 text-brand-secondary">
                    <Package className="w-5 h-5" />
                 </div>
                 <h2 className="text-xl font-bold text-brand-primary font-display">Inventory Manifest</h2>
              </div>
              <span className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em]">{order.items?.length || 0} Assets Encapsulated</span>
            </div>
            <div className="divide-y divide-brand-primary/5">
              {order.items?.map((item) => (
                <div key={item.id} className="p-8 group hover:bg-brand-surface/30 transition-all duration-500">
                  <div className="flex items-start justify-between gap-8">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-brand-primary group-hover:text-brand-secondary transition-colors leading-tight">{item.productName || item.product?.name}</p>
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/5 text-brand-primary text-[10px] font-bold uppercase">
                            <Activity className="w-3 h-3 opacity-40" />
                            QTY: {item.quantity}
                         </div>
                         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/5 text-brand-primary text-[10px] font-bold uppercase">
                            <ShieldCheck className="w-3 h-3 opacity-40" />
                            SPEC: {item.productUnit || item.product?.unit || 'Standard'}
                         </div>
                      </div>

                      {/* Customization logic refined */}
                      {(item.customizationText || item.customizationImageUrl) && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                           {item.customizationText && (
                              <div className="bg-white border border-brand-primary/5 rounded-2xl p-6 shadow-sm group/custom">
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-brand-secondary/5 text-brand-secondary border border-brand-secondary/10">
                                       <PenTool className="w-4 h-4" />
                                    </div>
                                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest">Engraving Detail</p>
                                 </div>
                                 <p className="text-sm font-medium text-brand-primary italic leading-relaxed">"{item.customizationText}"</p>
                              </div>
                           )}
                           {item.customizationImageUrl && (
                              <div className="bg-white border border-brand-primary/5 rounded-2xl p-6 shadow-sm group/custom">
                                 <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-xl bg-brand-secondary/5 text-brand-secondary border border-brand-secondary/10">
                                       <ImageIcon className="w-4 h-4" />
                                    </div>
                                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest">Visual Asset</p>
                                 </div>
                                 <div className="flex items-center gap-5">
                                    <div className="relative shrink-0 group/img">
                                       <img src={item.customizationImageUrl} alt="Print asset" className="w-24 h-24 object-cover rounded-2xl border border-white shadow-lg group-hover/img:scale-110 transition-transform duration-500" />
                                       <div className="absolute inset-0 bg-brand-primary/40 opacity-0 group-hover/img:opacity-100 rounded-2xl transition-opacity flex items-center justify-center">
                                          <ExternalLink className="w-5 h-5 text-white" />
                                       </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                       <a href={item.customizationImageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] hover:text-brand-secondary transition-colors">
                                          <ExternalLink className="w-3.5 h-3.5" /> View Matrix
                                       </a>
                                       <a href={item.customizationImageUrl} download className="flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] hover:text-brand-primary transition-colors">
                                          <Download className="w-3.5 h-3.5" /> Process Resource
                                       </a>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-bold text-brand-primary font-display">₹{Number(item.total || 0).toLocaleString('en-IN')}</p>
                       <p className="text-[10px] text-brand-text/30 font-black uppercase tracking-widest mt-1">Valuation</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics Address */}
          <div className="card p-8 flex flex-col md:flex-row gap-10 bg-brand-surface/30 border-brand-primary/5 shadow-inner">
             <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary shrink-0 border border-brand-primary/10 shadow-sm">
                <MapPin className="w-7 h-7" />
             </div>
             <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-bold text-brand-primary font-display text-2xl tracking-tight">Destination Routing</h3>
                   <span className="p-2 rounded-xl bg-white border border-brand-primary/5 text-brand-primary shadow-sm hover:rotate-12 transition-transform cursor-pointer">
                      <ExternalLink className="w-4 h-4" />
                   </span>
                </div>
                {order.address ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-2">Authorized Recipient</p>
                          <p className="text-base font-bold text-brand-primary">{order.address.fullName}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-2">Communications Link</p>
                          <p className="text-sm font-semibold text-brand-text/60">{order.user?.phone || 'No direct uplink registered'}</p>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-2">Physical Matrix Coordinates</p>
                       <p className="text-sm font-bold text-brand-primary leading-loose">
                          <span className="block">{order.address.line1}</span>
                          {order.address.line2 && <span className="block">{order.address.line2}</span>}
                          <span className="block text-brand-text/50 font-medium">{order.address.city}, {order.address.state} {order.address.postalCode}</span>
                          <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest">{order.address.country || 'India'}</span>
                       </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center border-2 border-dashed border-brand-primary/5 rounded-3xl">
                     <AlertCircle className="w-10 h-10 text-brand-primary/5 mx-auto mb-4" />
                     <p className="text-xs font-bold text-brand-text/30 uppercase tracking-[0.2em]">Non-Physical Fulfillment Pattern Detected</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Financial Summary */}
          <div className="card p-10 bg-brand-primary text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
               <CreditCard className="w-32 h-32 transform translate-x-12 -translate-y-12" />
            </div>
            <div className="relative z-10">
               <h3 className="font-black text-white/40 text-[10px] uppercase tracking-[0.3em] mb-10">Financial Settlement Matrix</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Asset Subtotal</span>
                     <span className="text-base font-bold font-display">₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Logistics Premium</span>
                     <span className="text-base font-bold font-display">₹{Number(order.shippingCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-px bg-white/10 my-8" />
                  <div className="flex justify-between items-end">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Valuation</span>
                        <span className="text-4xl font-bold font-display leading-none tracking-tighter">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                     </div>
                  </div>
                  <div className="mt-10 pt-10 border-t border-white/5">
                     <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-200" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Settlement: {order.payment?.status || 'Authenticated'}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Workflow Management */}
          <div className="card p-8 space-y-8">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Clock className="w-4.5 h-4.5 text-brand-secondary" />
                  <h3 className="font-black text-brand-primary text-[10px] uppercase tracking-[0.2em]">Fulfillment Protocol</h3>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={statusMut.isPending}
                  onClick={() => statusMut.mutate(s)}
                  className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${
                    order.status === s
                      ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-[1.02]'
                      : 'bg-white border-brand-primary/5 text-brand-primary/40 hover:border-brand-secondary/30 hover:bg-brand-surface'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking Integration */}
          <div className="card p-8 space-y-8">
            <div className="flex items-center gap-3">
               <Truck className="w-4.5 h-4.5 text-brand-secondary" />
               <h3 className="font-black text-brand-primary text-[10px] uppercase tracking-[0.2em]">Real-time Tracking Uplink</h3>
            </div>
            <div className="space-y-6">
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-primary/5 shadow-inner">
                 <p className="text-[9px] font-black text-brand-text/30 uppercase tracking-[0.2em] mb-2">Active Manifest ID</p>
                 <p className="text-sm font-black text-brand-primary tracking-widest">{order.trackingNumber || 'PENDING ASSIGNMENT'}</p>
              </div>
              <div className="space-y-3">
                <div className="relative group/input">
                   <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/20 group-focus-within/input:text-brand-secondary transition-colors" />
                   <input
                     type="text"
                     className="input-field py-4 pl-12 text-xs font-bold w-full bg-white shadow-sm transition-all"
                     value={trackingNumber}
                     onChange={(e) => setTrackingNumber(e.target.value)}
                     placeholder="Deploy new manifest ID..."
                   />
                </div>
                <button
                  type="button"
                  className="btn-primary py-4 px-6 text-[10px] w-full font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-primary/10 active:scale-95 disabled:opacity-50 transition-all"
                  disabled={trackingMut.isPending}
                  onClick={() => {
                    if (!trackingNumber.trim()) {
                      toast.error('Manifest identifier required');
                      return;
                    }
                    trackingMut.mutate();
                  }}
                >
                  {trackingMut.isPending ? 'Synchronizing Nexus...' : 'Update Logistics Matrix'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
