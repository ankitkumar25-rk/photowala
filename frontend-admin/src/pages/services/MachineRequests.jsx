import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { 
  Clock, CheckCircle, XCircle, Send, Eye, FileText, 
  Download, User, Calendar, Tag, Info, IndianRupee
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const REQ_STATUS = {
  PENDING_QUOTE: { label: 'Pending Quote', color: 'bg-amber-100 text-amber-700', icon: Clock },
  QUOTE_SENT: { label: 'Quote Sent', color: 'bg-blue-100 text-blue-700', icon: Send },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function MachineRequests() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedReq, setSelectedReq] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['machine-requests', page],
    queryFn: async () => {
      const { data } = await api.get('/orders/admin/machine-requests', { params: { page } });
      return data;
    }
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ id, quotedPrice, status, adminNotes }) => {
      return api.patch(`/orders/admin/machine-requests/${id}`, { quotedPrice, status, adminNotes });
    },
    onSuccess: () => {
      toast.success('Quote updated successfully');
      queryClient.invalidateQueries(['machine-requests']);
      setSelectedReq(null);
    }
  });

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">MACHINE SERVICE QUOTATIONS</h1>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-widest text-[10px]">Handle CNC, Laser & Marking inquiries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.map((req) => (
          <div key={req.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-[#fffaf5] text-[#b65e2e] rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#e8dfd5]">
                  {req.serviceType.replace('_', ' ')}
                </span>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${REQ_STATUS[req.status].color}`}>
                  {req.status.replace('_', ' ')}
                </div>
              </div>

              <h3 className="text-sm font-black text-gray-900 mb-1">{req.orderName || req.projectTitle}</h3>
              <p className="text-[10px] text-gray-400 font-bold mb-4">{req.requestNumber}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {req.user.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  Qty: {req.serviceData?.quantity || 'N/A'}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <div>
                 {req.quotedPrice ? (
                   <div className="flex items-center gap-1 text-sm font-black text-green-600">
                     <IndianRupee className="w-3 h-3" />
                     {req.quotedPrice}
                   </div>
                 ) : (
                   <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Pending Quote</span>
                 )}
              </div>
              <button 
                onClick={() => setSelectedReq(req)}
                className="flex items-center gap-2 text-[10px] font-black text-[#b65e2e] uppercase tracking-widest hover:text-[#a15024] transition-colors"
              >
                Review Request <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <header className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#fffaf5]">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                    <Info className="w-6 h-6 text-[#b65e2e]" />
                 </div>
                 <div>
                    <h2 className="text-lg font-black text-gray-900">REVIEW QUOTATION</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedReq.requestNumber}</p>
                 </div>
              </div>
              <button onClick={() => setSelectedReq(null)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-white border border-gray-100">
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </header>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div>
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Service Details</h3>
                   <div className="space-y-4">
                      {Object.entries(selectedReq.serviceData || {}).map(([key, val]) => (
                        <div key={key}>
                           <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                           <p className="text-xs font-bold text-gray-700">{String(val)}</p>
                        </div>
                      ))}
                   </div>
                </div>

                {selectedReq.files?.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Files Provided</h3>
                    <div className="space-y-2">
                       {selectedReq.files.map(file => (
                         <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 overflow-hidden">
                               <FileText className="w-4 h-4 text-gray-400" />
                               <span className="text-[10px] font-bold text-gray-700 truncate">{file.fileName || 'Design'}</span>
                            </div>
                            <div className="flex gap-1">
                               <a href={file.url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-white rounded transition-colors"><Eye className="w-3.5 h-3.5 text-gray-400" /></a>
                               <a href={file.url} download className="p-1.5 hover:bg-white rounded transition-colors"><Download className="w-3.5 h-3.5 text-gray-400" /></a>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-[#1c1a19] text-white rounded-2xl p-6">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Pricing & Notes</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Quote Amount (INR)</label>
                      <input 
                        type="number"
                        id="quote-price"
                        defaultValue={selectedReq.quotedPrice}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-[#b65e2e]"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Update Status</label>
                      <select 
                        id="quote-status"
                        defaultValue={selectedReq.status}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-[#b65e2e]"
                      >
                         {Object.keys(REQ_STATUS).map(s => <option key={s} value={s}>{REQ_STATUS[s].label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Admin Notes</label>
                      <textarea 
                        id="quote-notes"
                        defaultValue={selectedReq.adminNotes}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:ring-1 focus:ring-[#b65e2e] h-20"
                        placeholder="Terms, delivery time..."
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const quotedPrice = document.getElementById('quote-price').value;
                        const status = document.getElementById('quote-status').value;
                        const adminNotes = document.getElementById('quote-notes').value;
                        updateQuoteMutation.mutate({ id: selectedReq.id, quotedPrice, status, adminNotes });
                      }}
                      disabled={updateQuoteMutation.isPending}
                      className="w-full bg-[#b65e2e] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#a15024] transition-all disabled:opacity-50"
                    >
                      {updateQuoteMutation.isPending ? 'Updating...' : 'Update & Send Quote'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
