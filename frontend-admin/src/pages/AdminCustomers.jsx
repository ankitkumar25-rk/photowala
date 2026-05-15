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
        <div className="w-full overflow-x-auto rounded-xl no-scrollbar luxury-grain">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[#5b3f2f]/5">
                {['Name', 'Email', 'Phone', 'Orders', 'Joined', 'Details'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.2em] px-6 py-5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5b3f2f]/5">
              {isLoading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}>{Array(6).fill(0).map((_,j) => (
                  <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              )) : data?.data?.map(u => (
                <tr key={u.id} className="hover:bg-[#f7f0e7]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f5e7d8] text-[#5b3f2f] flex items-center justify-center text-xs font-bold border border-[#5b3f2f]/5">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-[#5b3f2f]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#7a655c]">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-[#7a655c]">{u.phone || '—'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#5b3f2f]">{u._count?.orders || 0}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-[#7a655c]/60">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <Link to={'/customers/' + u.id} className="text-xs font-black uppercase tracking-widest text-[#b88a2f] hover:text-[#5b3f2f] transition-colors">
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
