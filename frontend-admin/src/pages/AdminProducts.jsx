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

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page],
    queryFn: () => api.get('/products', { params: { page, limit: 20, sort: 'createdAt', order: 'desc' } }).then(r => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete('/products/' + id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deactivated'); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const filtered = data?.data?.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.meta?.total || 0} total products</p>
        </div>
        <Link to="/products/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search products..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Product', 'Category', 'Price', 'MRP', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : <Package className="w-4 h-4 text-gray-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku || product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.category?.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">₹{product.price}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 line-through">₹{product.mrp}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3"><StatusBadge stock={product.stock} lowAlert={product.lowStockAlert} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (!product.id) {
                            toast.error('This product cannot be edited because its id is missing');
                            return;
                          }
                          navigate('/products/id/' + product.id + '/edit');
                        }}
                        className="btn-ghost p-1.5 text-blue-500 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => { if(confirm('Deactivate this product?')) deleteMut.mutate(product.id); }}
                        className="btn-ghost p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
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
