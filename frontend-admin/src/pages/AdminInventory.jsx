import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
export default function AdminInventory() {
  const [editing, setEditing] = useState({});
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: () => api.get('/admin/inventory').then(r => r.data.data),
  });
  const updateMut = useMutation({
    mutationFn: ({id, stock}) => api.patch('/products/' + id + '/stock', { stock }),
    onSuccess: () => { qc.invalidateQueries(['admin-inventory']); toast.success('Stock updated'); setEditing({}); },
  });
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-800">Inventory</h1><p className="text-gray-400 text-sm">Manage product stock levels</p></div>
      <div className="card">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-gray-100">{['Product', 'Category', 'SKU', 'Stock', 'Alert at', 'Status', 'Update'].map(h =>
              <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 sm:px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? Array(8).fill(0).map((_, i) => <tr key={i}>{Array(7).fill(0).map((_,j) =>
                <td key={j} className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>)
              : data?.map(p => {
                const isLow = p.stock <= p.lowStockAlert;
                return (
                  <tr key={p.id} className={'hover:bg-gray-50 ' + (p.stock === 0 ? 'bg-red-50/40' : isLow ? 'bg-brand-surface/40' : '')}>
                    <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-gray-800 flex items-center gap-2">
                      {isLow && <AlertTriangle className="w-3.5 h-3.5 text-brand-secondary flex-shrink-0" />}
                      {p.name}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-500">{p.category?.name}</td>
                    <td className="px-3 sm:px-4 py-3 text-xs font-mono text-gray-400">{p.sku || '—'}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm font-bold">{p.stock}</td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-gray-400">{p.lowStockAlert}</td>
                    <td className="px-3 sm:px-4 py-3 text-xs">
                      {p.stock === 0 ? <span className="badge-status cancelled">Out of Stock</span>
                        : isLow ? <span className="badge-status pending">Low</span>
                        : <span className="badge-status delivered">OK</span>}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex gap-1">
                        <input type="number" min="0"
                          value={editing[p.id] ?? p.stock}
                          onChange={e => setEditing(prev => ({...prev, [p.id]: Number(e.target.value)}))}
                          className="input-field py-1 px-2 w-16 sm:w-20 text-sm" />
                        <button onClick={() => updateMut.mutate({ id: p.id, stock: editing[p.id] ?? p.stock })}
                          className="px-2 py-1 rounded bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary">Save</button>
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
