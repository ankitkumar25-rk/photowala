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
        {/* Mobile View - Card Based */}
        <div className="sm:hidden divide-y divide-[#f5e7d8]/50">
          {isLoading ? Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="h-4 bg-cream-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-cream-200 rounded animate-pulse w-1/2" />
            </div>
          ))
          : data?.data?.map((r) => {
            const isService = r.order?.orderNumber?.startsWith('SRV') || r.orderType === 'SERVICE_ORDER';
            return (
              <div key={r.id} className="p-4 space-y-4 luxury-grain">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold mb-0.5">Customer</p>
                    <p className="text-sm font-bold text-brand-primary truncate">{r.user?.name || 'Unknown'}</p>
                    <p className="text-[10px] font-mono text-gray-400 truncate">{r.order?.orderNumber || 'No order'}</p>
                  </div>
                  <span className={'badge-status ' + r.status.toLowerCase()}>{r.status}</span>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold mb-1">Return Reason</p>
                  <p className="text-xs text-gray-600 italic break-words leading-relaxed bg-brand-surface/30 p-2 rounded-lg border border-[#f5e7d8]/50">
                    "{r.reason}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#f5e7d8]/50">
                  <div className="flex flex-col">
                    <p className="text-[10px] text-gray-400 font-medium">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                    {isService && (
                      <span className="mt-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider border border-amber-200 inline-block w-fit">
                        Service — No Refund
                      </span>
                    )}
                  </div>
                  
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveMut.mutate({ id: r.id, refundAmount: r.order?.total })}
                        disabled={isService}
                        className={`btn-primary py-2 px-4 text-[10px] ${isService ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMut.mutate({ id: r.id })}
                        className="btn-ghost py-2 px-4 text-[10px] text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!isLoading && (!data?.data || data.data.length === 0) && (
            <div className="p-10 text-center">
              <p className="text-sm text-gray-500 italic">No return requests found.</p>
            </div>
          )}
        </div>

        {/* Desktop View - Horizontal Scroll Table */}
        <div className="hidden sm:block overflow-x-auto rounded-xl no-scrollbar">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#f5e7d8]/50">
                {['Customer', 'Order', 'Reason', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-brand-primary/40 uppercase tracking-widest px-4 py-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5e7d8]/30">
              {isLoading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(6).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-4"><div className="h-4 bg-cream-100 rounded animate-pulse" /></td>
                ))}</tr>
              )) : data?.data?.map(r => {
                const isService = r.order?.orderNumber?.startsWith('SRV') || r.orderType === 'SERVICE_ORDER';
                return (
                  <tr key={r.id} className="hover:bg-brand-surface/30 transition-colors group">
                    <td className="px-4 py-4">
                      <p className="text-sm font-bold text-brand-primary">{r.user?.name}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{r.user?.email}</p>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono font-bold text-brand-primary">
                      {r.order?.orderNumber}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-gray-600 italic max-w-xs truncate" title={r.reason}>"{r.reason}"</p>
                      {isService && (
                        <span className="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider border border-amber-200">
                          Service — No Refund
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-[10px]">
                      <span className={'badge-status ' + r.status.toLowerCase()}>{r.status}</span>
                    </td>
                    <td className="px-4 py-4 text-[10px] text-gray-500 font-medium">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-4">
                      {r.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => approveMut.mutate({ id: r.id, refundAmount: r.order?.total })}
                            disabled={isService}
                            className={`btn-primary py-1.5 px-3 text-[10px] ${isService ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => rejectMut.mutate({ id: r.id })}
                            className="btn-ghost py-1.5 px-3 text-[10px] text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100"
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
