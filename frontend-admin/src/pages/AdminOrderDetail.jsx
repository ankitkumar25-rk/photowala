import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';

const STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await api.get('/orders/' + id);
      return res.data?.data;
    },
  });

  const statusMut = useMutation({
    mutationFn: (status) => api.patch('/orders/' + id + '/status', { status }),
    onSuccess: () => {
      toast.success('Order status updated');
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to update order status'),
  });

  const trackingMut = useMutation({
    mutationFn: () => api.patch('/orders/' + id + '/tracking', { trackingNumber: trackingNumber.trim() }),
    onSuccess: () => {
      toast.success('Tracking updated');
      setTrackingNumber('');
      qc.invalidateQueries({ queryKey: ['admin-order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to update tracking'),
  });

  if (isLoading) return <div className="card p-5">Loading order details...</div>;
  if (!order) return <div className="card p-5">Order not found.</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Detail</h1>
          <p className="text-gray-400 text-sm mt-0.5">{order.orderNumber}</p>
        </div>
        <Link to="/orders" className="btn-primary w-full justify-center sm:w-auto">Back to Orders</Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Items</h2>
              <span className="text-xs text-gray-400">{order.items?.length || 0} items</span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{item.productName || item.product?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} Ã‚Â· Unit: {item.productUnit || item.product?.unit || 'N/A'}</p>

                    {/* Customization info */}
                    {item.customizationText && (
                      <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <span className="text-amber-600 text-xs">Ã¢Å“ÂÃ¯Â¸Â</span>
                        <div>
                          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Custom Text</p>
                          <p className="text-sm font-medium text-amber-900 break-words">{item.customizationText}</p>
                        </div>
                      </div>
                    )}
                    {item.customizationImageUrl && (
                      <div className="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <span className="text-blue-600 text-xs">Ã°Å¸â€“Â¼Ã¯Â¸Â</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wide mb-1">Custom Image / Logo</p>
                          <a href={item.customizationImageUrl} target="_blank" rel="noopener noreferrer">
                            <img src={item.customizationImageUrl} alt="Customer customization" className="w-20 h-20 object-cover rounded-lg border border-blue-200 hover:scale-105 transition-transform" />
                          </a>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <a
                              href={item.customizationImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Ã¢â€ â€” Open Full Size
                            </a>
                            <a
                              href={item.customizationImageUrl}
                              download={`customization-${item.id}.jpg`}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              Ã¢Â¬â€¡ Download & Print
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 shrink-0">₹{Number(item.total || 0).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h2 className="font-semibold text-gray-800">Shipping Address</h2>
            {order.address ? (
              <div className="text-sm text-gray-700 leading-6">
                <p>{order.address.fullName}</p>
                <p>{[order.address.line1, order.address.line2].filter(Boolean).join(', ')}</p>
                <p>{[order.address.city, order.address.state, order.address.postalCode].filter(Boolean).join(', ')}</p>
                <p>{order.address.country || 'India'}</p>
              </div>
            ) : <p className="text-sm text-gray-500">Address not available.</p>}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-4 space-y-3">
            <h2 className="font-semibold text-gray-800">Order Summary</h2>
            <div className="text-sm text-gray-700 space-y-2">
              <p className="flex justify-between"><span>Subtotal</span><span>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</span></p>
              <p className="flex justify-between"><span>Shipping</span><span>₹{Number(order.shippingCost || 0).toLocaleString('en-IN')}</span></p>
              <p className="flex justify-between font-bold text-gray-900"><span>Total</span><span>₹{Number(order.total || 0).toLocaleString('en-IN')}</span></p>
              <p className="flex justify-between"><span>Payment</span><span>{order.payment?.status || 'Pending'}</span></p>
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h2 className="font-semibold text-gray-800">Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={statusMut.isPending}
                  onClick={() => statusMut.mutate(s)}
                  className={
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ' +
                    (order.status === s
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'border-gray-200 text-gray-600 hover:border-brand-secondary')
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4 space-y-3">
            <h2 className="font-semibold text-gray-800">Tracking</h2>
            <p className="text-xs text-gray-500">Current: {order.trackingNumber || 'Not set'}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="input-field py-2 text-sm w-full"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
              <button
                type="button"
                className="btn-primary py-2 px-4 text-sm w-full sm:w-auto"
                disabled={trackingMut.isPending}
                onClick={() => {
                  if (!trackingNumber.trim()) {
                    toast.error('Tracking number is required');
                    return;
                  }
                  trackingMut.mutate();
                }}
              >
                {trackingMut.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
