import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import PaginationControls from '../components/PaginationControls';

function StatusBadge({ stock, lowAlert }) {
  if (stock === 0) return <span className="badge-status cancelled">Out of Stock</span>;
  if (stock <= lowAlert) return <span className="badge-status pending">Low Stock ({stock})</span>;
  return <span className="badge-status delivered">In Stock ({stock})</span>;
}

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => api.get('/products', { params: { page, limit: 20, sort: 'createdAt', order: 'desc' } }).then(r => r.data),
    staleTime: 1000 * 60, // 1 minute
  });
  if (error) return <div className="card p-5 bg-red-50 border border-red-200"><p className="text-red-700 font-semibold">Failed to load products: {error.message}</p></div>;

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete('/products/' + id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deactivated'); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const filtered = data?.data?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.meta?.total || 0} total products</p>
        </div>
        <Link to="/products/new" className="btn-primary justify-center w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-[#f5e7d8]/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-secondary/60" />
            <input type="text" placeholder="Search products..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm w-full" />
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl no-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#f5e7d8]/50">
                {['Product', 'Category', 'Price', 'MRP', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-brand-primary/40 uppercase tracking-widest px-4 py-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5e7d8]/30">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-cream-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(product => (
                <tr key={product.id} className="hover:bg-brand-surface/30 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#f5e7d8] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : <Package className="w-5 h-5 text-brand-secondary/40" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-brand-primary line-clamp-1">{product.name}</p>
                        <p className="text-[10px] font-mono font-bold text-brand-secondary uppercase tracking-wider">{product.sku || product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-brand-primary/80">{product.category?.name || 'Uncategorized'}</td>
                  <td className="px-4 py-4 text-sm font-bold text-brand-primary">₹{Number(product.price).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 text-xs text-gray-400 line-through">₹{Number(product.mrp).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 text-sm font-bold text-brand-primary">{product.stock}</td>
                  <td className="px-4 py-4"><StatusBadge stock={product.stock} lowAlert={product.lowStockAlert} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate('/products/id/' + product.id + '/edit')}
                        className="btn-ghost p-2 text-brand-primary hover:bg-brand-surface border border-transparent hover:border-[#f5e7d8]"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Deactivate this product?')) deleteMut.mutate(product.id); }}
                        className="btn-ghost p-2 text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100"
                        title="Delete Product"
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

        <PaginationControls
          page={page}
          total={data?.meta?.total || 0}
          limit={20}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
