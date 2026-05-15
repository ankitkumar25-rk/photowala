import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PaginationControls from '../components/PaginationControls';
export default function AdminReturns() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-returns', status, page],
    queryFn: () => api.get('/returns/admin', { params: { status: status || undefined, page, limit: 20 } }).then(r => r.data),
    staleTime: 1000 * 60, // 1 minute
  });
  if (error) return <div className="card p-5 bg-red-50 border border-red-200"><p className="text-red-700 font-semibold">Failed to load returns: {error.message}</p></div>;
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
        <div className="sm:hidden divide-y divide-[#5b3f2f]/5">
          {isLoading ? Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
          ))
          : data?.data?.map((r) => {
            const isService = r.orderType === 'SERVICE_ORDER';
            return (
              <div key={r.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#5b3f2f] truncate">{r.user?.name || 'Unknown'}</p>
                    <p className="text-[10px] font-black text-[#b88a2f] uppercase tracking-widest truncate">{r.order?.orderNumber || 'No ID'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={'badge-status ' + r.status.toLowerCase()}>{r.status}</span>
                    {isService && (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200">
                        Service — No Refund
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#7a655c] uppercase tracking-widest font-black">Reason</p>
                  <p className="text-xs text-[#5b3f2f] mt-1 line-clamp-3">{r.reason}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] font-semibold text-[#7a655c]/60">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMut.mutate({ id: r.id, refundAmount: r.order?.total })}
                        disabled={isService}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isService ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#5b3f2f] text-white shadow-sm hover:bg-[#4a3427]'}`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMut.mutate({ id: r.id })}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-200 text-red-500 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden sm:block overflow-x-auto luxury-grain">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[#5b3f2f]/5">
                {['Customer', 'Order', 'Reason', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-brand-primary/60 uppercase tracking-[0.2em] px-6 py-5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5b3f2f]/5">
              {isLoading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(6).fill(0).map((_,j) => (
                  <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              )) : data?.data?.map(r => {
                const isService = r.orderType === 'SERVICE_ORDER';
                return (
                  <tr key={r.id} className="hover:bg-[#f7f0e7]/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#5b3f2f]">{r.user?.name}</td>
                    <td className="px-6 py-4 text-[11px] font-black text-[#b88a2f] uppercase tracking-widest">{r.order?.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-[#7a655c] max-w-xs truncate">{r.reason}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={'badge-status ' + r.status.toLowerCase()}>{r.status}</span>
                        {isService && (
                          <span className="text-[9px] font-black uppercase tracking-tighter text-amber-600">Service — No Refund</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#7a655c]/60">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4">
                      {r.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => approveMut.mutate({ id: r.id, refundAmount: r.order?.total })}
                            disabled={isService}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isService ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#5b3f2f] text-white hover:bg-[#4a3427]'}`}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => rejectMut.mutate({ id: r.id })}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
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
