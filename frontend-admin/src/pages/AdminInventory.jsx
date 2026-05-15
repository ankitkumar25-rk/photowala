import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
export default function AdminInventory() {
  const [editing, setEditing] = useState({});
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => api.get('/admin/inventory').then(r => r.data.data),
    staleTime: 1000 * 60, // 1 minute
  });
  if (error) return <div className="card p-5 bg-red-50 border border-red-200"><p className="text-red-700 font-semibold">Failed to load inventory: {error.message}</p></div>;
  const updateMut = useMutation({
    mutationFn: ({id, stock}) => api.patch('/products/' + id + '/stock', { stock }),
    onSuccess: () => { qc.invalidateQueries(['admin-inventory']); toast.success('Stock updated'); setEditing({}); },
  });
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-800">Inventory</h1><p className="text-gray-400 text-sm">Manage product stock levels</p></div>
      <div className="card">
        <div className="w-full overflow-x-auto rounded-xl no-scrollbar luxury-grain">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#5b3f2f]/5">
                {['Product', 'Category', 'SKU', 'Stock', 'Alert at', 'Status', 'Update'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.2em] px-6 py-5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5b3f2f]/5">
              {isLoading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}>{Array(7).fill(0).map((_,j) => (
                  <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              )) : data?.map(p => {
                const isLow = p.stock <= p.lowStockAlert;
                const isOut = p.stock === 0;
                return (
                  <tr key={p.id} className={`hover:bg-[#f7f0e7]/50 transition-colors ${isOut ? 'bg-red-50/50' : isLow ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#f5e7d8] flex items-center justify-center text-[#5b3f2f] shadow-sm border border-[#5b3f2f]/5">
                          {isOut ? <AlertTriangle size={14} className="text-red-500" /> : <Package size={14} />}
                        </div>
                        <span className="text-sm font-bold text-[#5b3f2f]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#7a655c]">{p.category?.name || 'Uncategorized'}</td>
                    <td className="px-6 py-4 text-[11px] font-black text-[#b88a2f] uppercase tracking-widest">{p.sku || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#5b3f2f]">{p.stock}</td>
                    <td className="px-6 py-4 text-sm text-[#7a655c]/60 font-medium">{p.lowStockAlert}</td>
                    <td className="px-6 py-4">
                      {isOut ? <span className="badge-status cancelled">Out of Stock</span>
                        : isLow ? <span className="badge-status pending">Low Stock</span>
                        : <span className="badge-status delivered">Healthy</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min="0"
                          value={editing[p.id] ?? p.stock}
                          onChange={e => setEditing(prev => ({...prev, [p.id]: Number(e.target.value)}))}
                          className="w-20 px-3 py-1.5 rounded-lg border border-[#5b3f2f]/10 bg-white text-sm font-bold text-[#5b3f2f] focus:ring-1 focus:ring-[#b88a2f] outline-none" 
                        />
                        <button 
                          onClick={() => updateMut.mutate({ id: p.id, stock: editing[p.id] ?? p.stock })}
                          className="px-3 py-1.5 rounded-lg bg-[#5b3f2f] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#4a3427] transition-all"
                        >
                          Sync
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
