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
        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? Array(8).fill(0).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          ))
          : data?.data?.map((u) => (
            <div key={u.id} className="p-4 space-y-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-brand-surface text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">{u.name?.[0]?.toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-gray-700">{u.phone || 'â€”'}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Orders</p>
                  <p className="font-semibold text-gray-800">{u._count?.orders || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Joined</p>
                  <p className="text-gray-700">{new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              <Link to={'/customers/' + u.id} className="inline-flex text-xs font-semibold text-brand-primary hover:underline">View Details</Link>
            </div>
          ))}
          {!isLoading && (!data?.data || data.data.length === 0) && (
            <p className="p-4 text-sm text-gray-500">No customers found.</p>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
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
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-400">{u.phone || 'â€”'}</td>
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
