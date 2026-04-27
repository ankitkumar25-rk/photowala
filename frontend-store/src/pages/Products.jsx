import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { productsApi, categoriesApi } from '../api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc',      label: 'Price: Low to High' },
  { value: 'price-desc',     label: 'Price: High to Low' },
  { value: 'name-asc',       label: 'Name A-Z' },
];

export default function Products() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [sortValue, setSortValue] = useState('createdAt-desc');
  const [showFilters, setShowFilters] = useState(false);

  const [sort, order] = sortValue.split('-');

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters, sort, order],
    queryFn: () => productsApi.list({ ...filters, sort, order }).then((r) => r.data),
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoriesApi.list().then((r) => r.data.data),
  });

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  const clearFilter = (key) => setFilters((f) => { const n = { ...f }; delete n[key]; return { ...n, page: 1 }; });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Fraunces, serif' }}>All Products</h1>
          <p className="text-gray-400 text-sm mt-1">{data?.meta?.total || 0} products found</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            className="input-field py-2 text-sm flex-1 sm:w-auto min-w-[140px]"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="card p-5 space-y-5">
            {/* Categories */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cat" checked={!filters.category} onChange={() => clearFilter('category')} className="accent-brand-primary" />
                  <span className="text-sm text-gray-700">All Categories</span>
                </label>
                {catData?.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" checked={filters.category === cat.slug} onChange={() => setFilter('category', cat.slug)} className="accent-brand-primary" />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                    <span className="ml-auto text-xs text-gray-400">({cat._count?.products})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Price Range</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="Min ₹" className="input-field py-2 text-sm" onBlur={(e) => e.target.value ? setFilter('minPrice', e.target.value) : clearFilter('minPrice')} />
                <input type="number" placeholder="Max ₹" className="input-field py-2 text-sm" onBlur={(e) => e.target.value ? setFilter('maxPrice', e.target.value) : clearFilter('maxPrice')} />
              </div>
            </div>

            {/* Premium Only */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={filters.isFeatured === 'true'} onChange={(e) => e.target.checked ? setFilter('isFeatured', 'true') : clearFilter('isFeatured')} className="accent-brand-primary w-4 h-4 rounded" />
                <span className="text-sm text-gray-700 font-medium">⭐ Featured Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="bg-cream-200 aspect-square" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-cream-300 rounded w-3/4" />
                    <div className="h-4 bg-cream-300 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-xl text-gray-700">No products found</h3>
              <p className="text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data?.data?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data?.meta?.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setFilters((f) => ({ ...f, page }))}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    filters.page === page
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-gray-600 border border-cream-300 hover:border-brand-secondary'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
