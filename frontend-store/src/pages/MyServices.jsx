import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { 
  Printer, Cpu, Clock, CheckCircle, Package, Truck, 
  ChevronRight, Search, AlertCircle, Calendar, IndianRupee 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_MAP = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  IN_PRODUCTION: { label: 'In Production', color: 'bg-blue-100 text-blue-700', icon: Package },
  DISPATCHED: { label: 'Dispatched', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  // Machine status
  PENDING_QUOTE: { label: 'Pending Quote', color: 'bg-amber-100 text-amber-700', icon: Clock },
  QUOTE_SENT: { label: 'Quote Sent', color: 'bg-purple-100 text-purple-700', icon: IndianRupee },
};

function ServiceCard({ order, type }) {
  const isPrint = type === 'PRINT';
  const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all group overflow-hidden">
      <div className={`p-4 flex items-center justify-between border-b border-gray-50 ${isPrint ? 'bg-[#fffaf5]' : 'bg-[#f5f7ff]'}`}>
        <div className="flex flex-col">
          <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${isPrint ? 'text-[#b65e2e]' : 'text-blue-600'}`}>
            {isPrint ? 'Custom Print' : 'Machine Service'}
          </span>
          <span className="font-bold text-gray-900 font-mono text-xs">{order.orderNumber || order.requestNumber}</span>
        </div>
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${status.color}`}>
          <StatusIcon className="w-2.5 h-2.5" /> {status.label}
        </div>
      </div>

      <div className="p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isPrint ? 'bg-[#fffaf5] text-[#b65e2e]' : 'bg-[#f5f7ff] text-blue-600'}`}>
          {isPrint ? <Printer className="w-6 h-6" /> : <Cpu className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-tight truncate">{order.orderName || order.serviceType}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            {isPrint ? `Total: ₹${order.totalAmount}` : (order.quotedPrice ? `Quote: ₹${order.quotedPrice}` : 'Awaiting Quote')}
          </p>
        </div>
        {isPrint ? (
          <Link to={`/orders/track/${order.orderNumber}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        ) : (
          <div className="p-2 text-gray-300">
             <ChevronRight className="w-5 h-5 opacity-20" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyServices() {
  const [activeTab, setActiveTab] = useState('ALL');

  const { data: response, isLoading } = useQuery({
    queryKey: ['my-all-services'],
    queryFn: async () => {
      const { data } = await api.get('/v1/orders/custom-printing/my-all-services');
      return data.data;
    }
  });

  const printOrders = response?.printOrders || [];
  const machineRequests = response?.machineRequests || [];

  const filteredItems = () => {
    if (activeTab === 'PRINT') return printOrders.map(o => ({ ...o, _type: 'PRINT' }));
    if (activeTab === 'MACHINE') return machineRequests.map(o => ({ ...o, _type: 'MACHINE' }));
    return [
      ...printOrders.map(o => ({ ...o, _type: 'PRINT' })),
      ...machineRequests.map(o => ({ ...o, _type: 'MACHINE' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const items = filteredItems();

  return (
    <div className="min-h-screen bg-[#faf8f5] py-20 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic">My Service <span className="text-[#b65e2e]">Vault</span></h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Track your custom prints and machine service requests</p>
        </div>

        <div className="flex justify-center">
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {['ALL', 'PRINT', 'MACHINE'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-[#b65e2e] text-white shadow-lg shadow-[#b65e2e]/20' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-gray-50" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
             <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <h3 className="text-lg font-black text-gray-900 uppercase">No Services Found</h3>
             <p className="text-gray-400 text-xs font-bold mt-2">You haven't requested any services yet.</p>
             <Link to="/services" className="inline-block mt-8 px-8 py-4 bg-[#b65e2e] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl">Browse Services</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <ServiceCard key={item.id} order={item} type={item._type} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
