import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Package, Filter, ChevronRight, MoreHorizontal, Image as ImageIcon, Box, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import PaginationControls from '../components/PaginationControls';

function StatusBadge({ stock, lowAlert }) {
  if (stock === 0) return <span className="badge-status cancelled">Depleted</span>;
  if (stock <= lowAlert) return <span className="badge-status pending">Low Reserve ({stock})</span>;
  return <span className="badge-status delivered">Active Stock ({stock})</span>;
}

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => api.get('/products', { params: { page, limit: 20, sort: 'createdAt', order: 'desc' } }).then(r => r.data),
    staleTime: 1000 * 60,
  });

  if (error) return (
    <div className="card p-12 text-center border-red-100 bg-red-50/20">
      <Package className="w-16 h-16 text-red-200 mx-auto mb-4" />
      <h3 className="text-brand-primary font-bold text-lg font-display">Neural Catalog Disconnected</h3>
      <p className="text-brand-text/50 text-sm mt-2">{error.message}</p>
    </div>
  );

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete('/products/' + id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-products'] }); 
      toast.success('Asset successfully archived'); 
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Update failed'),
  });

  const filtered = data?.data?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                 <Box className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Inventory Core</span>
           </div>
           <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight">Product Catalog</h1>
           <p className="text-brand-text/50 text-sm font-medium mt-1">Manage your premium inventory assets ({data?.meta?.total || 0} cataloged)</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="btn-secondary py-3 px-6 flex items-center gap-2 group">
              <Filter className="w-4 h-4 text-brand-primary/40 group-hover:rotate-180 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Filter Matrix</span>
           </button>
           <Link to="/products/new" className="btn-primary py-3 px-8 flex items-center gap-2 shadow-lg shadow-brand-primary/20">
             <Plus className="w-4 h-4" /> New Asset
           </Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        {/* Search Header */}
        <div className="p-8 border-b border-brand-primary/5 bg-white/50">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-primary/30 group-focus-within:text-brand-secondary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, SKU or brand..." 
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
              <div key={i} className="p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-brand-primary/5 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-brand-primary/5 rounded w-3/4" />
                    <div className="h-2 bg-brand-primary/5 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : filtered.map((product) => (
            <div key={product.id} className="p-6 group hover:bg-brand-surface/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-5 min-w-0">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-brand-primary/10 flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-all duration-500">
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : <Package className="w-8 h-8 text-brand-primary/10" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-bold text-brand-primary line-clamp-1 leading-tight">{product.name}</p>
                    <p className="text-[10px] font-bold text-brand-text/30 uppercase tracking-[0.2em] mt-1.5">{product.sku || 'STD-UNIT'}</p>
                    <div className="mt-3">
                       <StatusBadge stock={product.stock} lowAlert={product.lowStockAlert} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-xl font-bold text-brand-primary font-display">₹{product.price}</p>
                   {product.mrp > product.price && <p className="text-[10px] text-brand-text/30 line-through font-bold mt-1">₹{product.mrp}</p>}
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-between border-t border-brand-primary/5 pt-5">
                 <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-brand-text/30" />
                    <span className="text-[10px] font-bold text-brand-text/40 uppercase tracking-widest">{product.category?.name || 'Standard'}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate('/products/id/' + product.id + '/edit')}
                      className="p-3 rounded-xl bg-white border border-brand-primary/10 text-brand-primary hover:bg-brand-surface shadow-sm transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if(confirm('Archive this product?')) deleteMut.mutate(product.id); }}
                      className="p-3 rounded-xl bg-white border border-red-100 text-red-400 hover:bg-red-50 shadow-sm transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Catalog Asset', 'Classification', 'Pricing Model', 'Availability', 'Lifecycle', 'Operations'].map(h => (
                  <th key={h} className="text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/5">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-6"><div className="h-4 bg-brand-primary/5 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(product => (
                <tr key={product.id} className="group hover:bg-brand-surface/30 transition-all duration-300">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-brand-primary/10 flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : <Package className="w-6 h-6 text-brand-primary/10" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-brand-primary group-hover:text-brand-secondary transition-colors line-clamp-1 leading-tight">{product.name}</p>
                        <p className="text-[10px] font-bold text-brand-text/30 uppercase tracking-[0.2em] mt-1">{product.sku || 'STD-UNIT'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-4 py-1.5 rounded-xl bg-brand-primary/5 text-brand-primary text-[10px] font-bold uppercase tracking-widest border border-brand-primary/5">
                       {product.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-brand-primary font-display">₹{product.price}</span>
                      {product.mrp > product.price && <span className="text-[10px] text-brand-text/30 line-through font-bold">₹{product.mrp}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-[11px] font-black text-brand-primary/70 uppercase tracking-widest">{product.stock} Units</td>
                  <td className="px-6 py-6"><StatusBadge stock={product.stock} lowAlert={product.lowStockAlert} /></td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                      <button
                        onClick={() => navigate('/products/id/' + product.id + '/edit')}
                        className="p-3 rounded-xl bg-white border border-brand-primary/10 text-brand-primary hover:bg-brand-secondary hover:text-white hover:border-brand-secondary transition-all shadow-md active:scale-95"
                        title="Edit Architecture"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Archive this catalog asset?')) deleteMut.mutate(product.id); }}
                        className="p-3 rounded-xl bg-white border border-red-50 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-md active:scale-95"
                        title="Archive Asset"
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
