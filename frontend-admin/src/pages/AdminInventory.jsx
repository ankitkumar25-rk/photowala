import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { AlertTriangle, Box, Package, RefreshCw, Search, ArrowUpRight, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AdminInventory() {
  const [editing, setEditing] = useState({});
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => api.get('/admin/inventory').then(r => r.data.data),
    staleTime: 1000 * 60,
  });

  if (error) return (
    <div className="card p-12 text-center border-red-100 bg-red-50/20">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-brand-primary font-bold text-lg font-display">Supply Chain Disruption</h3>
      <p className="text-brand-text/50 text-sm mt-2 mb-6">Failed to synchronize with the inventory matrix.</p>
      <button onClick={() => window.location.reload()} className="btn-primary py-3 px-8">Re-establish Uplink</button>
    </div>
  );

  const updateMut = useMutation({
    mutationFn: ({id, stock}) => api.patch('/products/' + id + '/stock', { stock }),
    onSuccess: () => { 
      qc.invalidateQueries(['admin-inventory']); 
      toast.success('Stock levels synchronized'); 
      setEditing({}); 
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Update failed'),
  });

  const filtered = data?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                 <Box className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Logistics Command</span>
           </div>
           <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight">Resource Management</h1>
           <p className="text-brand-text/50 text-sm font-medium mt-1">Real-time supply chain health and asset levels</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-5 py-3 rounded-2xl border border-brand-primary/10 shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-200" />
                 <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Feed Active</span>
              </div>
              <div className="w-px h-4 bg-brand-primary/10" />
              <button onClick={() => qc.invalidateQueries(['admin-inventory'])} className="p-1 text-brand-text/40 hover:text-brand-secondary transition-colors">
                 <RefreshCw className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Search Header */}
        <div className="p-8 border-b border-brand-primary/5 bg-white/50">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-primary/30 group-focus-within:text-brand-secondary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter assets by name or SKU..." 
              value={search}
              onChange={e => setSearch(e.target.value)} 
              className="input-field pl-12 py-3.5 shadow-sm bg-white" 
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-brand-primary/5">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-8 space-y-4 animate-pulse">
                <div className="h-4 bg-brand-primary/5 rounded w-1/3" />
                <div className="h-8 bg-brand-primary/5 rounded w-full" />
              </div>
            ))
          ) : filtered.map((p) => {
            const isLow = p.stock <= p.lowStockAlert;
            return (
              <div key={p.id} className={`p-8 space-y-6 group hover:bg-brand-surface/30 transition-all ${p.stock === 0 ? 'bg-red-50/10' : isLow ? 'bg-amber-50/10' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-brand-primary line-clamp-1">{p.name}</p>
                    <p className="text-[10px] font-bold text-brand-text/30 uppercase tracking-[0.2em] mt-1.5">{p.sku || 'STD-UNIT'}</p>
                  </div>
                  <span className={`badge-status ${p.stock === 0 ? 'cancelled' : isLow ? 'pending' : 'delivered'}`}>
                    {p.stock === 0 ? 'Depleted' : isLow ? 'Low Reserve' : 'Healthy'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-white p-5 rounded-2xl border border-brand-primary/5 shadow-sm">
                   <div>
                      <p className="text-[9px] text-brand-text/30 font-black uppercase tracking-widest mb-1">Current Units</p>
                      <p className="text-xl font-bold text-brand-primary font-display">{p.stock}</p>
                   </div>
                   <div>
                      <p className="text-[9px] text-brand-text/30 font-black uppercase tracking-widest mb-1">Threshold</p>
                      <p className="text-xl font-bold text-brand-primary/40 font-display">{p.lowStockAlert}</p>
                   </div>
                </div>

                <div className="flex gap-3">
                   <div className="relative flex-1 group/input">
                      <input 
                        type="number" 
                        min="0"
                        placeholder="Units"
                        value={editing[p.id] ?? p.stock}
                        onChange={e => setEditing(prev => ({...prev, [p.id]: Number(e.target.value)}))}
                        className="input-field py-3 px-4 text-xs font-bold text-center bg-white shadow-inner group-focus-within/input:border-brand-secondary transition-all" 
                      />
                   </div>
                   <button 
                     onClick={() => updateMut.mutate({ id: p.id, stock: editing[p.id] ?? p.stock })}
                     disabled={updateMut.isLoading}
                     className="btn-primary py-3 px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/10 active:scale-95 disabled:opacity-50"
                   >
                     Update Matrix
                   </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Asset Manifest', 'Inventory Core', 'Critical Threshold', 'Lifecycle State', 'Manual Override'].map(h => (
                  <th key={h} className="text-left">{h}</th>
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
              ) : filtered.map(p => {
                const isLow = p.stock <= p.lowStockAlert;
                return (
                  <tr key={p.id} className={`group hover:bg-brand-surface/30 transition-all duration-300 ${p.stock === 0 ? 'bg-red-50/20' : isLow ? 'bg-amber-50/10' : ''}`}>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl border transition-all duration-500 ${p.stock === 0 ? 'bg-red-100 border-red-200 text-red-600' : isLow ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-brand-primary/5 border-brand-primary/10 text-brand-primary'}`}>
                             <Package className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-brand-primary group-hover:text-brand-secondary transition-colors leading-tight">{p.name}</p>
                             <p className="text-[10px] font-bold text-brand-text/30 uppercase tracking-[0.2em] mt-1">{p.sku || 'STD-UNIT'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-brand-primary font-display">{p.stock}</span>
                          <span className="text-[10px] font-bold text-brand-text/30 uppercase tracking-widest">Units</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2 text-brand-text/40">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold font-display">{p.lowStockAlert} units</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`badge-status ${p.stock === 0 ? 'cancelled' : isLow ? 'pending' : 'delivered'}`}>
                         {p.stock === 0 ? 'Depleted' : isLow ? 'Low Reserve' : 'Healthy State'}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                          <input 
                            type="number" 
                            min="0"
                            value={editing[p.id] ?? p.stock}
                            onChange={e => setEditing(prev => ({...prev, [p.id]: Number(e.target.value)}))}
                            className="w-20 py-2 px-3 text-xs font-bold text-center bg-white border border-brand-primary/10 rounded-xl focus:border-brand-secondary transition-colors" 
                          />
                          <button 
                            onClick={() => updateMut.mutate({ id: p.id, stock: editing[p.id] ?? p.stock })}
                            className="p-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-secondary transition-all shadow-md active:scale-90"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
