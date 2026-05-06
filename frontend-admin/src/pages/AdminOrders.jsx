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

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status, page],
    queryFn: () => api.get('/orders/admin/all', { params: { status: status || undefined, page, limit: 20 } }).then(r => r.data),
  });

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
              className={'px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ' +
                (status === s ? 'bg-brand-primary text-white border-brand-primary' : 'border-gray-200 text-gray-600 hover:border-brand-secondary')}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? Array(6).fill(0).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              <div className="h-8 bg-gray-100 rounded animate-pulse w-full" />
            </div>
          )) : data?.data?.map((order) => (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold text-gray-700 break-all">{order.orderNumber}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{order.user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-400 truncate">{order.user?.email || 'No email'}</p>
                </div>
                <span className={'badge-status ' + order.status.toLowerCase()}>{order.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Total</p>
                  <p className="text-sm font-bold text-gray-800">₹{Number(order.total).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Payment</p>
                  <span className={'badge-status ' + (order.payment?.status === 'PAID' ? 'delivered' : 'pending')}>
                    {order.payment?.status || 'Pending'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Date</p>
                  <p className="text-gray-700">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <select
                    className="input-field py-2 text-xs flex-1"
                    value={order.status}
                    onChange={e => statusMut.mutate({ id: order.id, status: e.target.value, trackingNumber: order.trackingNumber })}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Link to={'/orders/' + order.id} className="text-xs font-semibold text-brand-primary hover:underline whitespace-nowrap">
                    View
                  </Link>
                </div>
                <input
                  type="text"
                  className="input-field py-1 text-xs w-full"
                  placeholder="Tracking #"
                  defaultValue={order.trackingNumber || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (order.trackingNumber || '')) {
                      statusMut.mutate({ id: order.id, status: order.status, trackingNumber: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
          ))}

          {!isLoading && (!data?.data || data.data.length === 0) && (
            <p className="p-4 text-sm text-gray-500">No orders found.</p>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-200">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order #', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Update Status', 'Tracking #', 'Details'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 sm:px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}>{Array(8).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              )) : data?.data?.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-4 py-3 text-sm font-mono font-semibold text-gray-700">{order.orderNumber}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm">
                    <p className="font-medium text-gray-800">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm font-bold text-gray-800">₹{Number(order.total).toLocaleString('en-IN')}</td>
                  <td className="px-3 sm:px-4 py-3 text-xs">
                    <span className={'badge-status ' + (order.payment?.status === 'PAID' ? 'delivered' : 'pending')}>
                      {order.payment?.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs">
                    <span className={'badge-status ' + order.status.toLowerCase()}>{order.status}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <select
                      className="input-field py-1 text-xs w-32 sm:w-36"
                      value={order.status}
                      onChange={e => statusMut.mutate({ id: order.id, status: e.target.value, trackingNumber: order.trackingNumber })}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <input
                      type="text"
                      className="input-field py-1 text-xs w-32"
                      placeholder="Tracking #"
                      defaultValue={order.trackingNumber || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (order.trackingNumber || '')) {
                          statusMut.mutate({ id: order.id, status: order.status, trackingNumber: e.target.value });
                        }
                      }}
                    />
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <Link to={'/orders/' + order.id} className="text-xs font-semibold text-brand-primary hover:underline">
                      View
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
