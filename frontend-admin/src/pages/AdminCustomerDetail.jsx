import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => api.get('/admin/customers/' + id).then((r) => r.data.data),
  });

  const banMut = useMutation({
    mutationFn: () => api.patch('/admin/customers/' + id + '/ban'),
    onSuccess: () => {
      toast.success('Customer action completed');
      qc.invalidateQueries({ queryKey: ['admin-customer', id] });
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update customer'),
  });

  if (isLoading) {
    return <div className="card p-5">Loading customer details...</div>;
  }

  if (!data) {
    return <div className="card p-5">Customer not found.</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Profile</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage customer account and recent activity</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:justify-end">
          <button
            type="button"
            className="btn-ghost w-full justify-center sm:w-auto"
            onClick={() => banMut.mutate()}
            disabled={banMut.isPending}
          >
            {banMut.isPending ? 'Updating...' : 'Record Ban Action'}
          </button>
          <Link to="/customers" className="btn-primary w-full justify-center sm:w-auto">Back to Customers</Link>
        </div>
      </div>

      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Name</p>
            <p className="text-sm font-semibold text-gray-800 mt-1">{data.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
            <p className="text-sm text-gray-700 mt-1">{data.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Phone</p>
            <p className="text-sm text-gray-700 mt-1">{data.phone || '—'}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <span className="text-xs text-gray-400">{data.orders?.length || 0} orders loaded</span>
        </div>
        <div className="md:hidden divide-y divide-gray-100">
          {data.orders?.length ? data.orders.map((o) => (
            <div key={o.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-mono font-semibold text-gray-700 break-all">{o.orderNumber}</p>
                <span className={'badge-status ' + o.status.toLowerCase()}>{o.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Total</p>
                  <p className="text-sm font-semibold text-gray-800">₹{Number(o.total || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Payment</p>
                  <p className="text-gray-700">{o.payment?.status || 'Pending'}</p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase tracking-wider">Date</p>
                  <p className="text-gray-700">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </div>
          )) : (
            <p className="px-4 py-6 text-sm text-gray-500">No orders found.</p>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order #', 'Total', 'Status', 'Payment', 'Date'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.orders?.length ? data.orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-700">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">₹{Number(o.total || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-xs"><span className={'badge-status ' + o.status.toLowerCase()}>{o.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{o.payment?.status || 'Pending'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-4 py-6 text-sm text-gray-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Saved Addresses</h2>
          <span className="text-xs text-gray-400">{data.addresses?.length || 0} addresses</span>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.addresses?.length ? data.addresses.map((a) => (
            <div key={a.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <p className="text-sm text-gray-700">{a.fullName || data.name}</p>
              <p className="text-sm text-gray-600 mt-1">{[a.line1, a.line2].filter(Boolean).join(', ')}</p>
              <p className="text-sm text-gray-600">{[a.city, a.state, a.postalCode].filter(Boolean).join(', ')}</p>
              <p className="text-sm text-gray-600">{a.country || 'India'}</p>
            </div>
          )) : <p className="text-sm text-gray-500">No saved addresses found.</p>}
        </div>
      </div>
    </div>
  );
}
