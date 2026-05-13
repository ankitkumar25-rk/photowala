import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  RotateCcw, Package, User, Clock, 
  CheckCircle2, XCircle, ChevronRight, 
  Search, Filter, ExternalLink, RefreshCw,
  History
} from 'lucide-react';
import PaginationControls from '../components/PaginationControls';

export default function AdminReturns() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-returns', status, page],
    queryFn: () => api.get('/returns/admin', { params: { status: status || undefined, page, limit: 20 } }).then(r => r.data),
    staleTime: 1000 * 60,
  });

  if (error) return (
    <div className="card p-12 text-center border-red-100 bg-red-50/20">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600 shadow-sm">
        <RotateCcw className="w-8 h-8" />
      </div>
      <h3 className="text-brand-primary font-bold text-lg font-display">Resolution System Error</h3>
      <p className="text-brand-text/50 text-sm mt-2 mb-6">Failed to synchronize return manifests.</p>
      <button onClick={() => window.location.reload()} className="btn-primary py-3 px-8">Re-establish Uplink</button>
    </div>
  );

  const approveMut = useMutation({
    mutationFn: ({id, refundAmount}) => api.patch('/returns/' + id + '/approve', { refundAmount: Number(refundAmount), refundMethod: 'original' }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-returns'] }); 
      toast.success('Return resolution approved'); 
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Resolution failed'),
  });

  const rejectMut = useMutation({
    mutationFn: ({id}) => api.patch('/returns/' + id + '/reject', { adminNote: 'Resolution rejected by administration' }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-returns'] }); 
      toast.success('Return resolution declined'); 
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Decline failed'),
  });

  const filtered = data?.data?.filter(r => 
    r.order?.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                 <RotateCcw className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Reverse Logistics</span>
           </div>
           <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight">Return Manifests</h1>
           <p className="text-brand-text/50 text-sm font-medium mt-1">Manage product resolutions and refund deployments ({data?.meta?.total || 0} active)</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-5 py-3 rounded-2xl border border-brand-primary/10 shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
                 <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Resolution Feed</span>
              </div>
              <div className="w-px h-4 bg-brand-primary/10" />
              <button onClick={() => qc.invalidateQueries(['admin-returns'])} className="p-1 text-brand-text/40 hover:text-brand-secondary transition-colors">
                 <RefreshCw className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white/50 p-2 rounded-2xl border border-brand-primary/5 backdrop-blur-sm">
        <div className="flex gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide flex-1">
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'].map(s => (
            <button 
              key={s} 
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                status === s ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text/40 hover:bg-brand-primary/5 hover:text-brand-primary'
              }`}
            >
              {s || 'All States'}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/30" />
           <input 
             type="text" 
             placeholder="Search manifest ID..." 
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
                <div className="h-10 bg-brand-primary/5 rounded w-full" />
              </div>
            ))
          ) : filtered.map((r) => (
            <div key={r.id} className="p-8 space-y-6 group hover:bg-brand-surface/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                   <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mb-1">#{r.order?.orderNumber}</p>
                   <p className="text-base font-bold text-brand-primary">{r.user?.name || 'Authorized Client'}</p>
                </div>
                <span className={`badge-status ${r.status.toLowerCase()}`}>{r.status}</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-brand-primary/5 shadow-sm">
                 <p className="text-[9px] text-brand-text/30 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <History className="w-3 h-3" /> Declaration Reason
                 </p>
                 <p className="text-xs text-brand-text/60 font-medium leading-relaxed italic">"{r.reason}"</p>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[9px] text-brand-text/30 font-bold uppercase tracking-widest">Logged</span>
                    <span className="text-xs font-bold text-brand-primary">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                 </div>
                 {r.status === 'PENDING' && (
                   <div className="flex gap-2">
                     <button
                       onClick={() => approveMut.mutate({ id: r.id, refundAmount: r.order?.total })}
                       className="p-3 rounded-xl bg-green-50 text-green-600 border border-green-100 shadow-sm active:scale-95"
                     >
                       <CheckCircle2 className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => rejectMut.mutate({ id: r.id })}
                       className="p-3 rounded-xl bg-red-50 text-red-500 border border-red-100 shadow-sm active:scale-95"
                     >
                       <XCircle className="w-4 h-4" />
                     </button>
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Principal', 'Manifest ID', 'Resolution Reason', 'State', 'Logged', 'Operations'].map(h => (
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
              ) : filtered.map(r => (
                <tr key={r.id} className="group hover:bg-brand-surface/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary text-[10px] font-black border border-brand-primary/10">
                          {r.user?.name?.[0]}
                       </div>
                       <p className="text-sm font-bold text-brand-primary leading-tight">{r.user?.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-xs font-black text-brand-primary uppercase tracking-widest">#{r.order?.orderNumber}</span>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                     <p className="text-xs text-brand-text/50 font-medium truncate italic" title={r.reason}>"{r.reason}"</p>
                  </td>
                  <td className="px-8 py-6">
                     <span className={`badge-status ${r.status.toLowerCase()}`}>{r.status}</span>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-brand-text/30 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-8 py-6">
                    {r.status === 'PENDING' ? (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                        <button onClick={() => approveMut.mutate({ id: r.id, refundAmount: r.order?.total })}
                          className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border border-green-100 shadow-sm transition-all" title="Resolve Approval">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => rejectMut.mutate({ id: r.id })}
                          className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 shadow-sm transition-all" title="Decline Resolution">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-brand-primary/5 text-brand-primary/20 cursor-not-allowed">
                         <History className="w-4 h-4" />
                      </div>
                    )}
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
