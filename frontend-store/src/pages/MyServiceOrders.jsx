import { useQuery } from '@tanstack/react-query';
import { 
  History, Clock, CheckCircle2, XCircle, 
  ChevronRight, Info, Printer, Settings, 
  Search, Filter, Download, FileText
} from 'lucide-react';
import api from '../api/client';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const STATUS_ICONS = {
  PENDING: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'In Review' },
  CONFIRMED: { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Confirmed' },
  PROCESSING: { icon: Settings, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Processing' },
  SHIPPED: { icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Shipped' },
  DELIVERED: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Delivered' },
  CANCELLED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Cancelled' },
};

export default function MyServiceOrders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-service-orders'],
    queryFn: async () => {
      const { data } = await api.get('/service-orders/my');
      return data.data;
    }
  });

  if (isLoading) return (
    <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Fetching your service history...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                 <History className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight font-outfit">My Services History</h1>
            </div>
            <p className="text-sm text-gray-500 font-medium ml-12">Track all your custom printing and machine service orders</p>
          </div>
          <Link to="/services" className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform uppercase tracking-widest">
            New Service Request
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-brand-primary/10 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Printer className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Service Requests Yet</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">You haven't placed any custom printing or machine service orders yet.</p>
            <Link to="/services" className="text-brand-primary font-bold hover:underline">Explore Our Services →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_ICONS[order.status] || STATUS_ICONS.PENDING;
              const Icon = status.icon;
              return (
                <div key={order.id} className="bg-white rounded-3xl p-6 border border-brand-primary/5 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-brand-primary">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${order.category === 'MACHINE' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'} flex items-center justify-center shrink-0`}>
                         {order.category === 'MACHINE' ? <Settings className="w-7 h-7" /> : <Printer className="w-7 h-7" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.orderNumber}</span>
                           <span className="text-gray-200">•</span>
                           <span className="text-[10px] font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{order.serviceName}</h4>
                        <p className="text-xs text-gray-500 font-medium">{order.productName || 'Custom Project'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-8">
                       <div className="text-left md:text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                          <div className={`flex items-center gap-1.5 ${status.color}`}>
                             <Icon className="w-4 h-4" />
                             <span className="text-xs font-black uppercase tracking-wider">{status.label}</span>
                          </div>
                       </div>
                       
                       <div className="text-left md:text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                          <p className="text-sm font-black text-gray-900">₹{order.totalAmount || '0.00'}</p>
                       </div>

                       <div className="flex items-center gap-2">
                          {order.fileUrl && (
                            <a href={order.fileUrl} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 rounded-2xl text-gray-600 hover:bg-brand-primary hover:text-white transition-all">
                               <Download className="w-4 h-4" />
                            </a>
                          )}
                          <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-brand-primary group-hover:border-brand-primary transition-all">
                             <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Info className="w-32 h-32" />
           </div>
           <div className="relative z-10 max-w-xl">
             <h3 className="text-xl font-black uppercase tracking-tight mb-4">How it works?</h3>
             <ul className="space-y-4">
                <li className="flex gap-4 items-start">
                   <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                   <p className="text-xs text-gray-400 leading-relaxed"><span className="text-white font-bold">Review Stage:</span> Our team reviews your design files and requirements for technical feasibility.</p>
                </li>
                <li className="flex gap-4 items-start">
                   <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                   <p className="text-xs text-gray-400 leading-relaxed"><span className="text-white font-bold">Confirmation:</span> Once approved, the status changes to <span className="text-blue-400 font-bold uppercase">Confirmed</span> and production begins.</p>
                </li>
                <li className="flex gap-4 items-start">
                   <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                   <p className="text-xs text-gray-400 leading-relaxed"><span className="text-white font-bold">Completion:</span> You'll receive a notification when your order is ready for dispatch or pickup.</p>
                </li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
