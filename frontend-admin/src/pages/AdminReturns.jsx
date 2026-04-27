import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PaginationControls from '../components/PaginationControls';
export default function AdminReturns() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-returns', status, page],
    queryFn: () => api.get('/returns/admin', { params: { status: status || undefined, page, limit: 20 } }).then(r => r.data),
  });
  const approveMut = useMutation({
    mutationFn: ({id, refundAmount}) => api.patch('/returns/' + id + '/approve', { refundAmount: Number(refundAmount), refundMethod: 'original' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-returns'] }); toast.success('Return approved'); },
  });
  const rejectMut = useMutation({
    mutationFn: ({id}) => api.patch('/returns/' + id + '/reject', { adminNote: 'Rejected by admin' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-returns'] }); toast.success('Return rejected'); },
  });
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-800">Returns</h1></div>
      <div className="flex gap-2">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ' +
              (status === s ? 'bg-brand-primary text-white border-brand-primary' : 'border-gray-200 text-gray-600 hover:border-brand-secondary')}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">{['Customer', 'Order', 'Reason', 'Status', 'Date', 'Actions'].map(h =>
              <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(6).fill(0).map((_,j) =>
                <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>)
              : data?.data?.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{r.user?.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{r.order?.orderNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{r.reason}</td>
                  <td className="px-4 py-3 text-xs"><span className={'badge-status ' + r.status.toLowerCase()}>{r.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    {r.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button onClick={() => approveMut.mutate({ id: r.id, refundAmount: r.order?.total })}
                          className="px-2 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700">Approve</button>
                        <button onClick={() => rejectMut.mutate({ id: r.id })}
                          className="px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600">Reject</button>
                      </div>
                    )}
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
