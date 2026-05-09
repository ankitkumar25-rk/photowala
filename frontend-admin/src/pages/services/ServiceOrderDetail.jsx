import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Download, Clock, User, 
  Mail, Phone, Package, Info, CheckCircle2,
  AlertCircle, Trash2, Printer, Settings, FileText
} from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function ServiceOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['service-order', id],
    queryFn: async () => {
      const { data } = await api.get(`/service-orders/${id}`);
      return data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status) => {
      await api.patch(`/service-orders/admin/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['service-order', id]);
      toast.success('Order status updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!window.confirm('Are you sure you want to delete this order?')) return;
      await api.delete(`/service-orders/admin/${id}`);
    },
    onSuccess: () => {
      toast.success('Order deleted');
      navigate(order.category === 'MACHINE' ? '/machine-orders' : '/print-orders');
    }
  });

  if (isLoading) return <div className="py-20 text-center text-gray-400">Loading order details...</div>;
  if (!order) return <div className="py-20 text-center text-red-500">Order not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <div className="flex gap-2">
           <button 
            onClick={() => deleteMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all text-sm font-bold"
          >
            <Trash2 className="w-4 h-4" /> Delete Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Order Main Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.category === 'MACHINE' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {order.category} SERVICE
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm font-bold text-gray-500">Order #{order.orderNumber}</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{order.serviceName}</h1>
              </div>
              <div className="text-right">
                <select 
                  value={order.status}
                  onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                  className="rounded-xl border-gray-200 text-sm font-bold focus:border-brand-primary focus:ring-brand-primary/20 bg-gray-50 px-4 py-2"
                >
                  {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-50">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placed On</p>
                <p className="text-sm font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                <p className="text-sm font-bold text-gray-900">₹{order.totalAmount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</p>
                <p className="text-sm font-bold text-gray-900">{order.quantity} units</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">File Option</p>
                <p className="text-sm font-bold text-gray-900 uppercase">{order.fileOption}</p>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-primary" /> Service Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              {Object.entries(order.details || {}).map(([key, value]) => {
                if (key === 'pricing') return null;
                return (
                  <div key={key} className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-sm font-bold text-gray-800">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                  </div>
                );
              })}
            </div>

            {order.specialRemark && (
              <div className="mt-8 p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Special Remark</p>
                <p className="text-sm text-amber-900 font-medium italic">"{order.specialRemark}"</p>
              </div>
            )}
          </div>

          {/* File Download Card */}
          {order.fileUrl && (
             <div className="bg-[#f0f7ff] rounded-3xl p-8 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                   <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Artwork / Design File</h4>
                  <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Attached via {order.fileOption}</p>
                </div>
              </div>
              <a 
                href={order.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 uppercase text-xs tracking-widest"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          )}
        </div>

        {/* Right Column: Customer Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" /> Customer Info
            </h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase">
                    {(order.customerName || order.user?.name)?.[0]}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-900">{order.customerName || order.user?.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium">Customer Account Linked</p>
                 </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-medium">{order.user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-medium">{order.user?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-50">
               <Link 
                to={`/customers/${order.userId}`}
                className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest"
              >
                View Customer Profile →
              </Link>
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-8 text-white">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Workflow Status</h3>
            <div className="space-y-8 relative">
              {/* Vertical line */}
              <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-gray-800" />
              
              {STATUS_FLOW.map((s, idx) => {
                const isCompleted = STATUS_FLOW.indexOf(order.status) >= idx;
                const isCurrent = order.status === s;
                return (
                  <div key={s} className="relative flex items-center gap-6">
                    <div className={`w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/20' : 'bg-gray-900 border-gray-700'
                    }`}>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                        {s}
                      </p>
                      {isCurrent && <p className="text-[10px] text-brand-primary font-bold uppercase mt-1">Active Stage</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
