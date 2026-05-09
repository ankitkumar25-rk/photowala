import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { 
  Search, Filter, ChevronRight, Eye, FileText, Download, 
  ExternalLink, Clock, CheckCircle, Package, Truck, XCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  IN_PRODUCTION: { label: 'In Production', color: 'bg-blue-100 text-blue-700', icon: Package },
  DISPATCHED: { label: 'Dispatched', color: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function ServiceOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['service-orders', page, statusFilter, serviceFilter],
    queryFn: async () => {
      const { data } = await api.get('/orders/admin/custom-printing', {
        params: { page, status: statusFilter, serviceType: serviceFilter }
      });
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }) => {
      return api.patch(`/orders/admin/custom-printing/${id}`, { status, adminNotes });
    },
    onSuccess: () => {
      toast.success('Order updated successfully');
      queryClient.invalidateQueries(['service-orders']);
      setSelectedOrder(null);
    }
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading service orders...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">CUSTOM PRINTING ORDERS</h1>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest text-[10px]">Manage specialized print services</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            value={serviceFilter} 
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#b65e2e]/20"
          >
            <option value="">All Services</option>
            <option value="PEN">Pen</option>
            <option value="STICKER">Stickers</option>
            <option value="LETTERHEAD">Letterhead</option>
            <option value="GARMENT_TAG">Garment Tag</option>
            <option value="BILL_BOOK">Bill Book</option>
            <option value="ENVELOPE">Envelope</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#b65e2e]/20"
          >
            <option value="">All Status</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Order #</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Service</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Qty</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.data?.map((order) => {
                const StatusIcon = STATUS_CONFIG[order.status].icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-gray-900">{order.orderNumber}</span>
                      <div className="text-[10px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gray-700">{order.user.name}</div>
                      <div className="text-[10px] text-gray-400">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[9px] font-black uppercase tracking-widest">
                        {order.serviceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-700">{order.quantity}</td>
                    <td className="px-6 py-4 text-xs font-black text-[#b65e2e]">₹{Number(order.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_CONFIG[order.status].color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {STATUS_CONFIG[order.status].label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Placeholder */}
      {data?.pagination?.total > data?.pagination?.limit && (
         <div className="flex justify-center gap-2 mt-8">
            {/* Simple pagination logic */}
         </div>
      )}

      {/* Order Detail Modal / Sidebar */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <header className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">ORDER DETAILS</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Status Update */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Update Order Status</label>
                <div className="flex gap-2">
                  <select 
                    defaultValue={selectedOrder.status}
                    id="status-select"
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                  >
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                  </select>
                  <button 
                    onClick={() => {
                      const status = document.getElementById('status-select').value;
                      const adminNotes = document.getElementById('admin-notes').value;
                      updateStatusMutation.mutate({ id: selectedOrder.id, status, adminNotes });
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="bg-[#b65e2e] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#a15024] transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Service Specs */}
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Specifications</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border border-gray-100 rounded-xl">
                       <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Order Name</p>
                       <p className="text-xs font-bold text-gray-700">{selectedOrder.orderName}</p>
                    </div>
                    <div className="p-3 bg-white border border-gray-100 rounded-xl">
                       <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Service Type</p>
                       <p className="text-xs font-bold text-gray-700">{selectedOrder.serviceType}</p>
                    </div>
                    {Object.entries(selectedOrder.details).map(([key, val]) => (
                      <div key={key} className="p-3 bg-white border border-gray-100 rounded-xl">
                         <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                         <p className="text-xs font-bold text-gray-700">{String(val)}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Files */}
              {selectedOrder.files?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Design Files</h3>
                  {selectedOrder.files.map(file => (
                    <div key={file.id} className="group relative bg-[#fffaf5] border border-[#e8dfd5] rounded-2xl p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center">
                             <FileText className="w-5 h-5 text-[#b65e2e]" />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-gray-700 truncate max-w-[200px]">{file.fileName || 'Design File'}</p>
                             <p className="text-[9px] text-gray-400 uppercase font-bold">{file.fileType}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <a href={file.url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-gray-100 hover:border-[#b65e2e] transition-colors">
                             <Eye className="w-4 h-4 text-gray-400 hover:text-[#b65e2e]" />
                          </a>
                          <a href={file.url} download className="p-2 bg-white rounded-lg border border-gray-100 hover:border-[#b65e2e] transition-colors">
                             <Download className="w-4 h-4 text-gray-400 hover:text-[#b65e2e]" />
                          </a>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pricing */}
              <div className="bg-gray-900 text-white rounded-2xl p-6">
                 <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Financial Summary</h3>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-gray-400">Base Amount</span><span>₹{selectedOrder.baseAmount}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-400">Email Handling Fee</span><span>₹{selectedOrder.emailFee}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-400">GST (18%)</span><span>₹{selectedOrder.gstAmount}</span></div>
                    <div className="flex justify-between pt-4 border-t border-gray-800 mt-4"><span className="text-sm font-black uppercase tracking-widest">Total Payable</span><span className="text-xl font-black text-[#f0ba9c]">₹{selectedOrder.totalAmount}</span></div>
                 </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Internal Admin Notes</label>
                <textarea 
                  id="admin-notes"
                  defaultValue={selectedOrder.adminNotes}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-gray-200 h-24"
                  placeholder="Order instructions, production status..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
