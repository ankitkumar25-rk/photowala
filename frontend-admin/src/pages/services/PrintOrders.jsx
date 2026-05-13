import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, Download, Eye, Trash2, 
  ChevronRight, MoreVertical, CheckCircle2, 
  Clock, XCircle, FileText, Printer, Package,
  Mail, Calendar, CreditCard, ExternalLink,
  RefreshCw, Activity
} from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function PrintOrders() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['service-orders', 'PRINTING', statusFilter],
    queryFn: async () => {
      const { data } = await api.get('/service-orders/admin/all', {
        params: { 
          category: 'PRINTING',
          status: statusFilter === 'ALL' ? undefined : statusFilter
        }
      });
      return data.data;
    },
    staleTime: 1000 * 60,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.patch(`/service-orders/admin/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['service-orders']);
      toast.success('Workflow status synchronized');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!window.confirm('Confirm permanent archival of this logistics manifest?')) return;
      await api.delete(`/service-orders/admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['service-orders']);
      toast.success('Manifest successfully archived');
    }
  });

  const filteredOrders = orders?.filter(o => 
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    o.serviceName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                 <Printer className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Design Logistics</span>
           </div>
           <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight">Print Manifests</h1>
           <p className="text-brand-text/50 text-sm font-medium mt-1">Manage bespoke design and high-fidelity printing requests</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-5 py-3 rounded-2xl border border-brand-primary/10 shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
                 <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Workflow Live</span>
              </div>
              <div className="w-px h-4 bg-brand-primary/10" />
              <button onClick={() => queryClient.invalidateQueries(['service-orders'])} className="p-1 text-brand-text/40 hover:text-brand-secondary transition-colors">
                 <RefreshCw className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white/50 p-2 rounded-2xl border border-brand-primary/5 backdrop-blur-sm">
        <div className="relative flex-1">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/30" />
           <input
             type="text"
             placeholder="Search manifests, principals or service profiles..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="input-field pl-11 py-3 text-xs bg-white shadow-sm"
           />
        </div>
        <div className="flex items-center gap-3 pr-2">
           <div className="relative flex-1 lg:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-primary/30 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-9 py-3 text-[10px] font-black uppercase tracking-widest bg-white shadow-sm appearance-none cursor-pointer"
              >
                <option value="ALL">All Manifests</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
           </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-brand-primary/5">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-8 space-y-4 animate-pulse">
                <div className="h-4 bg-brand-primary/5 rounded w-1/3" />
                <div className="h-10 bg-brand-primary/5 rounded w-full" />
              </div>
            ))
          ) : filteredOrders?.map((order) => (
            <div key={order.id} className="p-8 space-y-6 group hover:bg-brand-surface/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                   <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] mb-1.5">#{order.orderNumber}</p>
                   <p className="text-base font-bold text-brand-primary leading-tight">{order.customerName || order.user?.name}</p>
                   <p className="text-[10px] text-brand-text/30 font-bold uppercase mt-1 tracking-tighter">{order.user?.email}</p>
                </div>
                <span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>

              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-brand-primary/5 shadow-sm">
                 <div className="p-2.5 rounded-xl bg-brand-primary/5 text-brand-primary border border-brand-primary/10 shadow-sm group-hover:scale-110 transition-transform">
                    <Printer className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-xs font-black text-brand-primary uppercase tracking-widest leading-none">{order.serviceName}</p>
                    <p className="text-[10px] text-brand-text/40 font-medium mt-1.5">{order.productName || 'Bespoke Production'}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                 <div className="flex flex-col">
                    <span className="text-[9px] text-brand-text/30 font-black uppercase tracking-widest">Valuation</span>
                    <span className="text-lg font-bold text-brand-primary">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Link to={`/services/orders/${order.id}`} className="p-3.5 rounded-xl bg-brand-primary/5 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95">
                       <Eye className="w-5 h-5" />
                    </Link>
                    <button onClick={() => deleteMutation.mutate(order.id)} className="p-3.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 border border-red-100">
                       <Trash2 className="w-5 h-5" />
                    </button>
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
                {['Logistics ID', 'Principal', 'Service Profile', 'Production State', 'Valuation', 'Action'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest px-8 py-4 text-brand-text/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/5">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-8 py-6"><div className="h-4 bg-brand-primary/5 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredOrders?.map((order) => (
                <tr key={order.id} className="group hover:bg-brand-surface/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-brand-primary group-hover:text-brand-secondary transition-colors tracking-tight">#{order.orderNumber}</span>
                       <div className="flex items-center gap-1.5 text-[9px] font-bold text-brand-text/30 uppercase tracking-widest mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-2xl bg-white border border-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px] font-black shadow-sm group-hover:rotate-6 transition-transform">
                          {(order.customerName || order.user?.name)?.[0]}
                       </div>
                       <div className="flex flex-col">
                          <p className="text-sm font-bold text-brand-primary leading-tight">{order.customerName || order.user?.name}</p>
                          <p className="text-[10px] text-brand-text/40 font-bold uppercase tracking-tighter mt-1">{order.user?.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-brand-primary/5 text-brand-primary border border-brand-primary/10 shadow-sm">
                        <Printer className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-brand-primary uppercase tracking-widest">{order.serviceName}</span>
                        <span className="text-[9px] text-brand-text/40 font-bold uppercase tracking-widest mt-1">{order.productName || 'Bespoke Item'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-primary">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                        <span className="text-[9px] font-bold text-brand-text/30 uppercase tracking-widest mt-1">Total Valuation</span>
                     </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {order.fileUrl && (
                          <button 
                            onClick={() => {
                              if (order.fileUrl === 'SEND_VIA_EMAIL') {
                                toast.info('Client opted for neural delivery (email).');
                                return;
                              }
                              window.open(order.fileUrl, '_blank');
                            }}
                            className="p-2.5 rounded-xl bg-white border border-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white shadow-sm transition-all active:scale-90"
                            title="Download Asset"
                          >
                            {order.fileUrl === 'SEND_VIA_EMAIL' ? <Mail className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                          </button>
                       )}
                       <Link 
                          to={`/services/orders/${order.id}`}
                          className="p-2.5 rounded-xl bg-white border border-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white shadow-sm transition-all active:scale-90"
                          title="Intelligence Insight"
                       >
                          <Eye className="w-4 h-4" />
                       </Link>
                       <button 
                          onClick={() => deleteMutation.mutate(order.id)}
                          className="p-2.5 rounded-xl bg-white border border-red-50 text-red-400 hover:bg-red-500 hover:text-white shadow-sm transition-all active:scale-90"
                          title="Archival"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
