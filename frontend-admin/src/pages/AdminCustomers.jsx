import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, 
  ShoppingBag, ChevronRight, Search, 
  RefreshCw, UserPlus, Filter, ShieldCheck,
  Activity
} from 'lucide-react';
import PaginationControls from '../components/PaginationControls';

export default function AdminCustomers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-customers', page],
    queryFn: () => api.get('/admin/customers', { params: { page, limit: 20 } }).then(r => r.data),
    staleTime: 1000 * 60,
  });
  
  if (error) return (
    <div className="card p-12 text-center border-red-100 bg-red-50/20">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600 shadow-sm">
        <User className="w-8 h-8" />
      </div>
      <h3 className="text-brand-primary font-bold text-lg font-display">Client Directory Offline</h3>
      <p className="text-brand-text/50 text-sm mt-2 mb-8">Failed to synchronize with the premium member registry.</p>
      <button onClick={() => window.location.reload()} className="btn-primary py-3 px-8">Re-establish Sync</button>
    </div>
  );

  const filtered = data?.data?.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                 <User className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Client Relations</span>
           </div>
           <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight">Principal Registry</h1>
           <p className="text-brand-text/50 text-sm font-medium mt-1">Directory of your premium members and verified accounts ({data?.meta?.total || 0} total)</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-5 py-3 rounded-2xl border border-brand-primary/10 shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
                 <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Live Sync</span>
              </div>
              <div className="w-px h-4 bg-brand-primary/10" />
              <button onClick={() => qc.invalidateQueries(['admin-customers'])} className="p-1 text-brand-text/40 hover:text-brand-secondary transition-colors">
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
             placeholder="Search by Principal name, Email, or Communications link..." 
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="input-field pl-11 py-3 text-xs bg-white shadow-sm"
           />
        </div>
        <div className="flex items-center gap-2 pr-2">
           <button className="p-3 rounded-xl bg-white border border-brand-primary/5 text-brand-text/40 hover:text-brand-primary transition-all shadow-sm">
              <Filter className="w-4 h-4" />
           </button>
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
          ) : filtered.map((u) => (
            <div key={u.id} className="p-8 space-y-6 group hover:bg-brand-surface/30 transition-colors">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/5 text-brand-primary flex items-center justify-center text-lg font-black border border-brand-primary/10 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-500">
                   {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-brand-primary truncate leading-tight">{u.name}</p>
                  <p className="text-[11px] text-brand-text/30 font-bold uppercase tracking-widest mt-1 truncate">{u.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-white p-5 rounded-2xl border border-brand-primary/5 shadow-sm">
                <div className="space-y-1">
                   <p className="text-[9px] text-brand-text/30 font-black uppercase tracking-widest">Deployment</p>
                   <p className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-brand-secondary/50" />
                      {u._count?.orders || 0} Orders
                   </p>
                </div>
                <div className="space-y-1 text-right">
                   <p className="text-[9px] text-brand-text/30 font-black uppercase tracking-widest">Verification</p>
                   <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3 h-3" /> Authenticated
                   </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[9px] text-brand-text/30 font-bold uppercase tracking-widest">Logged Since</span>
                    <span className="text-xs font-bold text-brand-primary/60">{new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                 </div>
                 <Link to={'/customers/' + u.id} className="p-3.5 rounded-xl bg-brand-primary/5 text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95">
                    <ChevronRight className="w-5 h-5" />
                 </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Principal Profile', 'Communications Link', 'Acquisitions', 'Registry Date', 'Action'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest px-8 py-4 text-brand-text/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/5">
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-8 py-6"><div className="h-4 bg-brand-primary/5 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(u => (
                <tr key={u.id} className="group hover:bg-brand-surface/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-black shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                         {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-primary leading-tight group-hover:text-brand-secondary transition-colors">{u.name}</span>
                        <span className="text-[10px] text-brand-text/40 font-bold uppercase tracking-widest mt-1">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 text-brand-text/60 bg-white/40 px-3 py-2 rounded-xl border border-brand-primary/5 w-fit">
                       <Phone className="w-3.5 h-3.5 text-brand-secondary/40" />
                       <span className="text-xs font-bold text-brand-primary/70 tracking-tight">{u.phone || 'Direct line pending'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-xl bg-brand-secondary/5 text-brand-secondary">
                          <ShoppingBag className="w-4 h-4" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-brand-primary leading-none">{u._count?.orders || 0}</span>
                          <span className="text-[9px] font-bold text-brand-text/30 uppercase tracking-widest mt-1">Deployments</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-brand-text/30 uppercase tracking-[0.2em]">
                       <Calendar className="w-3.5 h-3.5 opacity-30" />
                       {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Link to={'/customers/' + u.id} className="inline-flex items-center gap-2 text-[10px] font-black text-brand-secondary uppercase tracking-[0.2em] hover:text-brand-primary transition-all group/manage">
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
