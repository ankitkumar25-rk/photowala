import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import { 
  User, Mail, Shield, Calendar, MapPin, 
  ShoppingBag, Ban, ArrowLeft, ExternalLink,
  History, CreditCard, Activity, Package
} from 'lucide-react';

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => api.get('/admin/customers/' + id).then((r) => r.data.data),
    staleTime: 1000 * 60,
  });

  const banMut = useMutation({
    mutationFn: () => api.patch('/admin/customers/' + id + '/ban'),
    onSuccess: () => {
      toast.success('Principal account state synchronized');
      qc.invalidateQueries({ queryKey: ['admin-customer', id] });
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Synchronization failed'),
  });

  if (isLoading) return (
    <div className="space-y-8 animate-pulse">
       <div className="h-20 bg-brand-primary/5 rounded-3xl w-1/3" />
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 h-[400px] card bg-brand-primary/5" />
          <div className="lg:col-span-2 h-[400px] card bg-brand-primary/5" />
       </div>
    </div>
  );

  if (error || !data) return (
    <div className="card p-12 text-center border-red-100 bg-red-50/20">
      <User className="w-16 h-16 text-red-200 mx-auto mb-4" />
      <h3 className="text-brand-primary font-bold text-lg font-display">Principal Record Missing</h3>
      <p className="text-brand-text/50 text-sm mt-2 mb-8">The requested user profile could not be retrieved from the central directory.</p>
      <Link to="/customers" className="btn-primary py-3 px-8">Return to Directory</Link>
    </div>
  );

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                 <User className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Principal Profile</span>
           </div>
           <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight">{data.name}</h1>
           <p className="text-brand-text/50 text-sm font-medium mt-1">Authorized member since {new Date(data.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
           <button
             onClick={() => banMut.mutate()}
             disabled={banMut.isPending}
             className={`btn-secondary py-3 px-6 flex items-center gap-2 group ${data.role === 'BANNED' ? 'text-green-600 border-green-100' : 'text-red-500 border-red-100'}`}
           >
             <Ban className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-widest">{banMut.isPending ? 'Synchronizing...' : data.role === 'BANNED' ? 'Restore Account' : 'Restrict Access'}</span>
           </button>
           <Link to="/customers" className="btn-primary py-3 px-8 flex items-center gap-2">
             <ArrowLeft className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest">Directory</span>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <div className="card overflow-hidden group">
              <div className="p-8 bg-brand-primary text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Shield className="w-24 h-24 transform translate-x-6 -translate-y-6" />
                 </div>
                 <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                       <User className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold font-display leading-tight">{data.name}</h2>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-widest mt-1">{data.role} ACCESS</p>
                 </div>
              </div>
              <div className="p-8 space-y-6">
                 <div className="flex items-center gap-4 group/item">
                    <div className="p-2 rounded-xl bg-brand-primary/5 text-brand-primary border border-brand-primary/5 group-hover/item:bg-brand-primary group-hover/item:text-white transition-all">
                       <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                       <span className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest">Interface Email</span>
                       <span className="text-sm font-bold text-brand-primary truncate">{data.email}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 group/item">
                    <div className="p-2 rounded-xl bg-brand-primary/5 text-brand-primary border border-brand-primary/5 group-hover/item:bg-brand-primary group-hover/item:text-white transition-all">
                       <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                       <span className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest">Security Layer</span>
                       <span className="text-sm font-bold text-brand-primary">{data.googleId ? 'Google Neural Link' : 'Biometric/Password'}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 group/item">
                    <div className="p-2 rounded-xl bg-brand-primary/5 text-brand-primary border border-brand-primary/5 group-hover/item:bg-brand-primary group-hover/item:text-white transition-all">
                       <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                       <span className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest">Inception Date</span>
                       <span className="text-sm font-bold text-brand-primary">{new Date(data.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Stats Summary */}
           <div className="card p-8 grid grid-cols-2 gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                 <History className="w-16 h-16" />
              </div>
              <div className="space-y-1 relative z-10">
                 <p className="text-[9px] font-black text-brand-text/30 uppercase tracking-[0.2em]">Deployments</p>
                 <p className="text-2xl font-bold text-brand-primary font-display">{data.orders?.length || 0}</p>
              </div>
              <div className="space-y-1 relative z-10">
                 <p className="text-[9px] font-black text-brand-text/30 uppercase tracking-[0.2em]">Total Value</p>
                 <p className="text-2xl font-bold text-brand-primary font-display">₹{Number(data.orders?.reduce((acc, o) => acc + (o.total || 0), 0) || 0).toLocaleString('en-IN')}</p>
              </div>
           </div>
        </div>

        {/* Orders & Activity */}
        <div className="lg:col-span-2 space-y-8">
           <div className="card overflow-hidden">
              <div className="p-8 border-b border-brand-primary/5 bg-white/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-brand-primary" />
                    <h3 className="text-xl font-bold text-brand-primary font-display">Engagement History</h3>
                 </div>
                 <span className="text-[10px] font-bold text-brand-text/30 uppercase tracking-widest">{data.orders?.length || 0} Records Synchronized</span>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr>
                          {['Deployment ID', 'Valuation', 'State', 'Settlement', 'Timestamp'].map(h => (
                            <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest px-8 py-4 text-brand-text/40">{h}</th>
                          ))}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-primary/5">
                       {data.orders?.length ? data.orders.map((o) => (
                         <tr key={o.id} className="group hover:bg-brand-surface/30 transition-colors">
                            <td className="px-8 py-5">
                               <Link to={`/orders/${o.id}`} className="text-xs font-black text-brand-primary group-hover:text-brand-secondary transition-colors uppercase tracking-widest">#{o.orderNumber}</Link>
                            </td>
                            <td className="px-8 py-5 text-sm font-bold text-brand-primary">₹{Number(o.total || 0).toLocaleString('en-IN')}</td>
                            <td className="px-8 py-5">
                               <span className={`badge-status ${o.status.toLowerCase()}`}>{o.status}</span>
                            </td>
                            <td className="px-8 py-5 text-[10px] font-bold text-brand-text/40 uppercase tracking-tighter">{o.payment?.status || 'Pending'}</td>
                            <td className="px-8 py-5 text-[10px] font-bold text-brand-text/30 uppercase">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                         </tr>
                       )) : (
                         <tr>
                            <td colSpan={5} className="px-8 py-20 text-center">
                               <Package className="w-12 h-12 text-brand-primary/5 mx-auto mb-4" />
                               <p className="text-[11px] text-brand-text/30 font-bold uppercase tracking-[0.2em]">No transactional history recorded</p>
                            </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Address Matrix */}
           <div className="card overflow-hidden">
              <div className="p-8 border-b border-brand-primary/5 bg-white/50 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-brand-primary" />
                    <h3 className="text-xl font-bold text-brand-primary font-display">Geographic Matrix</h3>
                 </div>
                 <span className="text-[10px] font-bold text-brand-text/30 uppercase tracking-widest">{data.addresses?.length || 0} Registered Locations</span>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {data.addresses?.length ? data.addresses.map((a) => (
                   <div key={a.id} className="p-6 bg-brand-surface border border-brand-primary/5 rounded-2xl group hover:border-brand-primary/20 transition-all">
                      <div className="flex items-start justify-between mb-4">
                         <div className="p-2.5 rounded-xl bg-white shadow-sm border border-brand-primary/5 text-brand-primary">
                            <MapPin className="w-4 h-4" />
                         </div>
                         <span className="text-[9px] font-black text-brand-text/30 uppercase tracking-widest">Registered Link</span>
                      </div>
                      <p className="text-sm font-bold text-brand-primary mb-1">{a.fullName || data.name}</p>
                      <p className="text-[11px] text-brand-text/50 font-medium leading-relaxed">{[a.line1, a.line2].filter(Boolean).join(', ')}</p>
                      <p className="text-[11px] text-brand-text/50 font-medium">{[a.city, a.state, a.postalCode].filter(Boolean).join(', ')}</p>
                      <div className="mt-4 pt-4 border-t border-brand-primary/5">
                         <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">{a.country || 'India'}</p>
                      </div>
                   </div>
                 )) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-brand-primary/5 rounded-3xl">
                       <MapPin className="w-10 h-10 text-brand-primary/5 mx-auto mb-4" />
                       <p className="text-[11px] text-brand-text/30 font-bold uppercase tracking-[0.2em]">No location data registered</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
