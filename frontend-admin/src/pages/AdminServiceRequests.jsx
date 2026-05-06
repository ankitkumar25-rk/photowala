import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import PaginationControls from '../components/PaginationControls';

const SERVICE_TYPES = [
  { value: '', label: 'All Services' },
  { value: 'CO2_LASER', label: 'CO2 Laser Machine' },
  { value: 'LASER_MARKING', label: 'Laser Marking Machine' },
  { value: 'CNC_ROUTER', label: 'CNC Router Machine' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function AdminServiceRequests() {
  const [serviceType, setServiceType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['service-requests', serviceType, status, page],
    queryFn: () => api.get('/admin/service-requests', {
      params: { serviceType: serviceType || undefined, status: status || undefined, page, limit: 20 },
    }).then((r) => r.data),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status: nextStatus, trackingNumber }) =>
      api.patch(`/admin/service-requests/${id}/status`, { status: nextStatus, trackingNumber }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['service-requests'] }); toast.success('Status updated'); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Update failed'),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Service Requests</h1>
          <p className="text-gray-400 text-sm mt-0.5">{data?.meta?.total || 0} total requests</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="input-field py-2 text-xs"
            value={serviceType}
            onChange={(e) => { setServiceType(e.target.value); setPage(1); }}
          >
            {SERVICE_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="input-field py-2 text-xs"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order #', 'Service', 'Size (L×B×H)', 'Qty', 'Price Range', 'Timing', 'Design', 'Status', 'Tracking', 'Customer', 'Date'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 sm:px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}>{Array(11).fill(0).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              )) : data?.data?.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 sm:px-4 py-3 text-xs font-bold text-brand-primary">{req.orderNumber || '---'}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-gray-800">{req.serviceType.replace('_', ' ')}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-700">
                    {req.sizeL} × {req.sizeB} × {req.sizeH}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-700">{req.quantity}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-700">{req.priceRange}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-700">{req.timingRange}</td>
                  <td className="px-3 sm:px-4 py-3 text-xs">
                    <a
                      href={req.designFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-primary font-semibold hover:underline"
                    >
                      Download
                    </a>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <select
                      className="input-field py-1 text-xs w-32"
                      value={req.status}
                      onChange={(e) => statusMut.mutate({ id: req.id, status: e.target.value, trackingNumber: req.trackingNumber })}
                    >
                      {STATUS_OPTIONS.filter((opt) => opt.value).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <input
                      type="text"
                      className="input-field py-1 text-xs w-32"
                      placeholder="Tracking #"
                      defaultValue={req.trackingNumber || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (req.trackingNumber || '')) {
                          statusMut.mutate({ id: req.id, status: req.status, trackingNumber: e.target.value });
                        }
                      }}
                    />
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-gray-600">
                    <p className="font-semibold text-gray-800">{req.user?.name || 'Guest'}</p>
                    <p className="text-gray-400">{req.user?.email || 'No email'}</p>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-gray-100">
          {isLoading ? Array(6).fill(0).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              <div className="h-8 bg-gray-100 rounded animate-pulse w-full" />
            </div>
          )) : data?.data?.map((req) => (
            <div key={req.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Order #</p>
                  <p className="text-sm font-bold text-brand-primary">{req.orderNumber || '---'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Service</p>
                  <p className="text-sm font-semibold text-gray-800">{req.serviceType.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Size</p>
                  <p className="text-gray-700">{req.sizeL} × {req.sizeB} × {req.sizeH}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Qty</p>
                  <p className="text-gray-700">{req.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Price</p>
                  <p className="text-gray-700">{req.priceRange}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Timing</p>
                  <p className="text-gray-700">{req.timingRange}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <select
                    className="input-field py-1 text-xs flex-1"
                    value={req.status}
                    onChange={(e) => statusMut.mutate({ id: req.id, status: e.target.value, trackingNumber: req.trackingNumber })}
                  >
                    {STATUS_OPTIONS.filter((opt) => opt.value).map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <a
                    href={req.designFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-brand-primary hover:underline px-3"
                  >
                    Download
                  </a>
                </div>
                <input
                  type="text"
                  className="input-field py-1 text-xs w-full"
                  placeholder="Enter Tracking #"
                  defaultValue={req.trackingNumber || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (req.trackingNumber || '')) {
                      statusMut.mutate({ id: req.id, status: req.status, trackingNumber: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
          ))}
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
