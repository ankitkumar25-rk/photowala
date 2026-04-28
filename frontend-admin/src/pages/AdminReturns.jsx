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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Returns</h1>
        <p className="text-gray-400 text-sm mt-0.5">{data?.meta?.total || 0} return requests</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={'px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ' +
              (status === s ? 'bg-brand-primary text-white border-brand-primary' : 'border-gray-200 text-gray-600 hover:border-brand-secondary')}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          ))
          : data?.data?.map((r) => (
            <div key={r.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{r.user?.name || 'Unknown customer'}</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{r.order?.orderNumber || 'No order id'}</p>
                </div>
                <span className={'badge-status ' + r.status.toLowerCase()}>{r.status}</span>
              </div>

              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider">Reason</p>
                <p className="text-sm text-gray-600 mt-1 break-words">{r.reason}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                {r.status === 'PENDING' && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => approveMut.mutate({ id: r.id, refundAmount: r.order?.total })}
                      className="px-2 py-1 rounded bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectMut.mutate({ id: r.id })}
                      className="px-2 py-1 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {!isLoading && (!data?.data || data.data.length === 0) && (
            <p className="p-4 text-sm text-gray-500">No return requests found.</p>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-gray-100">{['Customer', 'Order', 'Reason', 'Status', 'Date', 'Actions'].map(h =>
              <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 sm:px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(6).fill(0).map((_,j) =>
                <td key={j} className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>)
              : data?.data?.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-gray-800">{r.user?.name}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm font-mono text-gray-600">{r.order?.orderNumber}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{r.reason}</td>
                  <td className="px-3 sm:px-4 py-3 text-xs"><span className={'badge-status ' + r.status.toLowerCase()}>{r.status}</span></td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-3 sm:px-4 py-3">
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
