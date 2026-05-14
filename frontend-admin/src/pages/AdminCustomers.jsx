import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PaginationControls from '../components/PaginationControls';
export default function AdminCustomers() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-customers', page],
    queryFn: () => api.get('/admin/customers', { params: { page, limit: 20 } }).then(r => r.data),
    staleTime: 1000 * 60, // 1 minute
  });
  
  if (error) {
    return <div className="card p-5 bg-red-50 border border-red-200"><p className="text-red-700 font-semibold">Failed to load customers: {error.message}</p></div>;
  }

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-800">Customers</h1><p className="text-gray-400 text-sm">{data?.meta?.total || 0} registered customers</p></div>
      <div className="card">
        <div className="w-full overflow-x-auto rounded-xl no-scrollbar">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#f5e7d8]/50">
                {['Name', 'Email', 'Phone', 'Orders', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-brand-primary/40 uppercase tracking-widest px-4 py-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5e7d8]/30">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-cream-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.data?.map(u => (
                <tr key={u.id} className="hover:bg-brand-surface/30 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold shadow-inner">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-brand-primary">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-gray-500">{u.email}</td>
                  <td className="px-4 py-4 text-xs font-mono text-brand-secondary">{u.phone || '—'}</td>
                  <td className="px-4 py-4 text-sm font-bold text-brand-primary">{u._count?.orders || 0}</td>
                  <td className="px-4 py-4 text-[10px] font-medium text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-4">
                    <Link to={'/customers/' + u.id} className="btn-secondary py-1.5 px-3 text-[10px] whitespace-nowrap">
                      View Profile
                    </Link>
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
