import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PaginationControls from '../components/PaginationControls';

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'];

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders', status, page],
    queryFn: () => api.get('/orders/admin/all', { params: { status: status || undefined, page, limit: 20 } }).then(r => r.data),
    staleTime: 1000 * 60, // 1 minute
  });

  if (error) {
    return <div className="card p-5 bg-red-50 border border-red-200"><p className="text-red-700 font-semibold">Failed to load orders: {error.message}</p></div>;
  }

  const statusMut = useMutation({
    mutationFn: ({id, status, trackingNumber}) => api.patch('/orders/' + id + '/status', { status, trackingNumber }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Status updated'); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.meta?.total || 0} total orders</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUSES].map(s => (
            <button key={s} onClick={() => {setStatus(s); setPage(1);}}
              className={'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ' +
                (status === s 
                  ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
                  : 'bg-white border-brand-primary/10 text-brand-primary/60 hover:border-brand-primary/30')}>
              {s || 'All Orders'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {/* Mobile View - Card Based */}
        <div className="sm:hidden divide-y divide-[#f5e7d8]/50">
          {isLoading ? Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-cream-200 rounded animate-pulse w-32" />
                <div className="h-6 bg-cream-200 rounded-full animate-pulse w-20" />
              </div>
              <div className="h-3 bg-cream-200 rounded animate-pulse w-full" />
              <div className="h-10 bg-cream-200 rounded-xl animate-pulse w-full" />
            </div>
          )) : data?.data?.map((order) => (
            <div key={order.id} className="p-4 space-y-4 luxury-grain relative">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold mb-0.5">Order Number</p>
                  <p className="text-sm font-mono font-bold text-brand-primary break-all">{order.orderNumber}</p>
                </div>
                <span className={'badge-status ' + order.status.toLowerCase()}>{order.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold">Customer</p>
                  <p className="text-xs font-bold text-brand-primary truncate">{order.user?.name || 'Guest'}</p>
                  <p className="text-[9px] text-gray-400 truncate">{order.user?.email || 'No email'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold">Amount</p>
                  <p className="text-sm font-bold text-brand-primary">₹{Number(order.total).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold">Payment</p>
                  <span className={'badge-status mt-1 ' + (order.payment?.status === 'PAID' ? 'delivered' : 'pending')}>
                    {order.payment?.status || 'Pending'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold">Date</p>
                  <p className="text-xs font-bold text-brand-primary">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#f5e7d8]/50">
                <div className="flex items-center gap-2">
                  <select
                    className="input-field py-2 text-xs flex-1"
                    value={order.status}
                    onChange={e => statusMut.mutate({ id: order.id, status: e.target.value, trackingNumber: order.trackingNumber ?? undefined })}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Link to={'/orders/' + order.id} className="btn-secondary py-2 px-4 text-[10px]">
                    View
                  </Link>
                </div>
                <input
                  type="text"
                  className="input-field py-2 text-xs w-full"
                  placeholder="Tracking #"
                  defaultValue={order.trackingNumber || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (order.trackingNumber || '')) {
                      statusMut.mutate({ id: order.id, status: order.status, trackingNumber: e.target.value || undefined });
                    }
                  }}
                />
              </div>
            </div>
          ))}

          {!isLoading && (!data?.data || data.data.length === 0) && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 italic">No orders match the selected criteria.</p>
            </div>
          )}
        </div>

        {/* Desktop View - Horizontal Scroll Table */}
        <div className="hidden sm:block overflow-x-auto rounded-xl no-scrollbar">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#f5e7d8]/50">
                {['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Update Status', 'Tracking #', 'Actions'].map(h => (
                  <th key={h} className="text-left text-[10px] font-black text-brand-primary/40 uppercase tracking-widest px-4 py-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5e7d8]/30">
              {isLoading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}>{Array(9).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-4"><div className="h-4 bg-cream-100 rounded animate-pulse" /></td>
                ))}</tr>
              )) : data?.data?.map(order => (
                <tr key={order.id} className="hover:bg-brand-surface/30 transition-colors group">
                  <td className="px-4 py-4 text-xs font-mono font-bold text-brand-primary">{order.orderNumber}</td>
                  <td className="px-4 py-4 text-xs">
                    <p className="font-bold text-brand-primary">{order.user?.name}</p>
                    <p className="text-[10px] text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-brand-primary">₹{Number(order.total).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-4 text-[10px]">
                    <span className={'badge-status ' + (order.payment?.status === 'PAID' ? 'delivered' : 'pending')}>
                      {order.payment?.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[10px]">
                    <span className={'badge-status ' + order.status.toLowerCase()}>{order.status}</span>
                  </td>
                  <td className="px-4 py-4 text-[10px] text-gray-500 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      className="input-field py-1.5 text-[10px] w-32 border-[#f5e7d8] focus:border-brand-secondary bg-transparent"
                      value={order.status}
                      onChange={e => statusMut.mutate({ id: order.id, status: e.target.value, trackingNumber: order.trackingNumber ?? undefined })}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="text"
                      className="input-field py-1.5 text-[10px] w-32 border-[#f5e7d8] focus:border-brand-secondary bg-transparent"
                      placeholder="Tracking #"
                      defaultValue={order.trackingNumber || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (order.trackingNumber || '')) {
                          statusMut.mutate({ id: order.id, status: order.status, trackingNumber: e.target.value || undefined });
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Link to={'/orders/' + order.id} className="btn-secondary py-1.5 px-3 text-[10px] whitespace-nowrap">
                      Details
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
