import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Filter, ChevronRight, Eye, Truck, CreditCard, Calendar, RefreshCw, Package, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import PaginationControls from '../components/PaginationControls';

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'];

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders', status, page],
    queryFn: () => api.get('/orders/admin/all', { params: { status: status || undefined, page, limit: 20 } }).then(r => r.data),
    staleTime: 1000 * 60,
  });

  if (error) return (
    <div className="card p-12 text-center border-red-100 bg-red-50/20">
      <ShoppingBag className="w-16 h-16 text-red-200 mx-auto mb-4" />
      <h3 className="text-brand-primary font-bold text-lg font-display">Logistics Nexus Interrupted</h3>
      <p className="text-brand-text/50 text-sm mt-2 mb-8">Failed to synchronize with the central fulfillment matrix.</p>
      <button onClick={() => window.location.reload()} className="btn-primary py-3 px-8">Re-establish Connection</button>
    </div>
  );

  const statusMut = useMutation({
    mutationFn: ({id, status, trackingNumber}) => api.patch('/orders/' + id + '/status', { status, trackingNumber }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-orders'] }); 
      toast.success('Logistics state synchronized'); 
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Update failed'),
  });

  const filtered = data?.data?.filter(order => 
    order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                 <Package className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Logistics Command</span>
           </div>
           <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight">Order Fulfillment</h1>
           <p className="text-brand-text/50 text-sm font-medium mt-1">Manage premium client requests and logistics flow ({data?.meta?.total || 0} active deployments)</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-5 py-3 rounded-2xl border border-brand-primary/10 shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-200" />
                 <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Real-time Feed</span>
              </div>
              <div className="w-px h-4 bg-brand-primary/10" />
              <button onClick={() => qc.invalidateQueries(['admin-orders'])} className="p-1 text-brand-text/40 hover:text-brand-secondary transition-colors">
                 <RefreshCw className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white/50 p-2 rounded-2xl border border-brand-primary/5 backdrop-blur-sm">
        <div className="flex gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide flex-1">
          {['', ...STATUSES].map(s => (
            <button 
              key={s} 
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                status === s ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text/40 hover:bg-brand-primary/5 hover:text-brand-primary'
              }`}
            >
              {s || 'All Shipments'}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/30" />
           <input 
             type="text" 
             placeholder="Search by Order ID or Client..." 
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="input-field pl-11 py-2.5 text-xs bg-white shadow-sm"
           />
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-brand-primary/5">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-8 space-y-4 animate-pulse">
                <div className="h-4 bg-brand-primary/5 rounded w-1/3" />
                <div className="h-12 bg-brand-primary/5 rounded w-full" />
              </div>
            ))
          ) : filtered.map((order) => (
            <div key={order.id} className="p-8 space-y-6 group hover:bg-brand-surface/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                   <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mb-1">#{order.orderNumber}</p>
                   <p className="text-base font-bold text-brand-primary leading-tight">{order.user?.name || 'Guest User'}</p>
                   <p className="text-[11px] text-brand-text/30 font-medium mt-1 uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long' })}</p>
                </div>
                <span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-white p-5 rounded-2xl border border-brand-primary/5 shadow-sm">
                 <div className="flex flex-col">
                    <span className="text-[9px] text-brand-text/30 font-black uppercase tracking-widest mb-1">Valuation</span>
                    <span className="text-lg font-bold text-brand-primary font-display">₹{Number(order.total).toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex flex-col text-right">
                    <span className="text-[9px] text-brand-text/30 font-black uppercase tracking-widest mb-1">Payment</span>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-tighter">Verified</span>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <select
                    className="input-field py-3 text-xs flex-1 shadow-sm font-bold bg-white"
                    value={order.status}
                    onChange={e => statusMut.mutate({ id: order.id, status: e.target.value, trackingNumber: order.trackingNumber ?? undefined })}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Link to={'/orders/' + order.id} className="p-3.5 rounded-xl bg-white border border-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm">
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>
                <div className="relative group/input">
                   <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/30 group-focus-within/input:text-brand-secondary transition-colors" />
                   <input
                     type="text"
                     className="input-field py-3 pl-11 text-xs w-full shadow-sm bg-white"
                     placeholder="Assign Logistics Tracking ID"
                     defaultValue={order.trackingNumber || ''}
                     onBlur={(e) => {
                       if (e.target.value !== (order.trackingNumber || '')) {
                         statusMut.mutate({ id: order.id, status: order.status, trackingNumber: e.target.value || undefined });
                       }
                     }}
                   />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Deployment ID', 'Principal Client', 'Valuation', 'Manifest State', 'Logistics Intelligence', 'Action'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest px-8 py-4 text-brand-text/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/5">
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-8 py-6"><div className="h-4 bg-brand-primary/5 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(order => (
                <tr key={order.id} className="group hover:bg-brand-surface/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-brand-primary group-hover:text-brand-secondary transition-colors uppercase tracking-widest leading-none">#{order.orderNumber}</span>
                       <span className="text-[10px] text-brand-text/30 font-bold uppercase tracking-[0.2em] mt-2 italic">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary text-[10px] font-black border border-brand-primary/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          {order.user?.name?.[0] || 'G'}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <p className="text-sm font-bold text-brand-primary leading-tight truncate">{order.user?.name || 'Authorized Guest'}</p>
                          <p className="text-[10px] text-brand-text/40 font-bold uppercase tracking-tighter truncate">{order.user?.email || 'DIRECT CHANNEL'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-primary font-display tracking-tight">₹{Number(order.total).toLocaleString('en-IN')}</span>
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-1">Settled</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <select
                         className="input-field py-2 px-3 text-[10px] font-bold uppercase tracking-widest w-36 bg-white shadow-sm border-brand-primary/5 hover:border-brand-primary/20 transition-all cursor-pointer"
                         value={order.status}
                         onChange={e => statusMut.mutate({ id: order.id, status: e.target.value, trackingNumber: order.trackingNumber ?? undefined })}>
                         {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                       <div className="relative group/track">
                          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-primary/20 group-focus-within/track:text-brand-secondary transition-colors" />
                          <input
                            type="text"
                            className="input-field py-2 pl-9 text-[10px] font-bold w-40 bg-white shadow-sm border-brand-primary/5 focus:w-56 transition-all"
                            placeholder="Tracking ID"
                            defaultValue={order.trackingNumber || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (order.trackingNumber || '')) {
                                statusMut.mutate({ id: order.id, status: order.status, trackingNumber: e.target.value || undefined });
                              }
                            }}
                          />
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Link to={'/orders/' + order.id} className="inline-flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] hover:text-brand-primary transition-all group/manage">
                       Intelligence
                       <div className="p-1.5 rounded-lg bg-brand-secondary/5 group-hover/manage:bg-brand-primary group-hover/manage:text-white transition-all">
                          <ChevronRight className="w-3.5 h-3.5 transform group-hover/manage:translate-x-0.5 transition-transform" />
                       </div>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-white/30 border-t border-brand-primary/5">
          <PaginationControls
            page={page}
            total={data?.meta?.total || 0}
            limit={20}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
