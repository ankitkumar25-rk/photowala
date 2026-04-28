import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PaginationControls from '../components/PaginationControls';
export default function AdminCustomers() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page],
    queryFn: () => api.get('/admin/customers', { params: { page, limit: 20 } }).then(r => r.data),
  });
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-800">Customers</h1><p className="text-gray-400 text-sm">{data?.meta?.total || 0} registered customers</p></div>
      <div className="card">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-gray-100">{['Name', 'Email', 'Phone', 'Orders', 'Joined', 'Details'].map(h =>
              <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 sm:px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? Array(8).fill(0).map((_, i) => <tr key={i}>{Array(6).fill(0).map((_,j) =>
                <td key={j} className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>)
              : data?.data?.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-surface text-brand-primary flex items-center justify-center text-xs font-bold">{u.name?.[0]?.toUpperCase()}</div>
                      <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-400">{u.phone || '—'}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-gray-800">{u._count?.orders || 0}</td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <Link to={'/customers/' + u.id} className="text-xs font-semibold text-brand-primary hover:underline">View</Link>
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
