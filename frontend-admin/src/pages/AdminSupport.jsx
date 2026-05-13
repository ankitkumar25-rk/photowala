import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Search, Filter, 
  RefreshCw, CheckCircle2, Clock, 
  User, Send, History, AlertCircle,
  MessageCircle, ShieldCheck
} from 'lucide-react';
import PaginationControls from '../components/PaginationControls';

export default function AdminSupport() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [replies, setReplies] = useState({});
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-support', status, page],
    queryFn: () => api.get('/support/admin/tickets', { params: { status: status || undefined, page, limit: 20 } }).then(r => r.data),
    staleTime: 1000 * 60,
  });

  if (error) return (
    <div className="card p-12 text-center border-red-100 bg-red-50/20">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600 shadow-sm">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h3 className="text-brand-primary font-bold text-lg font-display">Communications Nexus Error</h3>
      <p className="text-brand-text/50 text-sm mt-2 mb-8">Failed to synchronize with the client inquiry stream.</p>
      <button onClick={() => window.location.reload()} className="btn-primary py-3 px-8">Re-establish Uplink</button>
    </div>
  );

  const replyMut = useMutation({
    mutationFn: ({id, adminReply}) => api.patch('/support/admin/tickets/' + id, { adminReply, status: 'RESOLVED' }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-support'] }); 
      toast.success('Reply deployed successfully'); 
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Deployment failed'),
  });

  const statusMut = useMutation({
    mutationFn: ({id, ticketStatus}) => api.patch('/support/admin/tickets/' + id, { status: ticketStatus }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-support'] }); 
      toast.success('Inquiry status synchronized'); 
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Synchronization failed'),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                 <MessageSquare className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Client Relations</span>
           </div>
           <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight">Concierge Desk</h1>
           <p className="text-brand-text/50 text-sm font-medium mt-1">Manage premium inquiries and support requests ({data?.meta?.total || 0} total manifest)</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-5 py-3 rounded-2xl border border-brand-primary/10 shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
                 <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Active Stream</span>
              </div>
              <div className="w-px h-4 bg-brand-primary/10" />
              <button onClick={() => qc.invalidateQueries(['admin-support'])} className="p-1 text-brand-text/40 hover:text-brand-secondary transition-colors">
                 <RefreshCw className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white/50 p-2 rounded-2xl border border-brand-primary/5 backdrop-blur-sm">
        <div className="flex gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide flex-1">
          {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
            <button 
              key={s} 
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                status === s ? 'bg-brand-primary text-white shadow-md' : 'text-brand-text/40 hover:bg-brand-primary/5 hover:text-brand-primary'
              }`}
            >
              {s || 'All Inquiries'}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/30" />
           <input 
             type="text" 
             placeholder="Search manifest ID..." 
             className="input-field pl-11 py-2.5 text-xs bg-white shadow-sm"
           />
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="card p-10 animate-pulse h-40" />) 
        ) : data?.data?.map(t => (
          <div key={t.id} className="card overflow-hidden group hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500">
            <div className="p-8 space-y-6">
               <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-brand-text/30 uppercase tracking-[0.2em]">#{t.ticketNumber}</span>
                        <span className={`badge-status ${t.status.toLowerCase().replace('_','-')}`}>{t.status}</span>
                        <span className="text-[10px] font-bold text-brand-text/20 uppercase tracking-widest ml-auto md:ml-0 flex items-center gap-1.5">
                           <Clock className="w-3 h-3" /> {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                     </div>
                     <h3 className="text-xl font-bold text-brand-primary font-display">{t.subject}</h3>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary text-[10px] font-black border border-brand-primary/10">
                           {t.user?.name?.[0]}
                        </div>
                        <div className="flex flex-col">
                           <p className="text-sm font-bold text-brand-primary leading-none">{t.user?.name}</p>
                           <p className="text-[10px] text-brand-text/40 font-bold uppercase tracking-tighter mt-1.5">{t.user?.email}</p>
                        </div>
                     </div>
                  </div>
                  <div className="bg-brand-surface/50 p-6 rounded-3xl border border-brand-primary/5 flex-1 min-w-0">
                     <p className="text-[9px] text-brand-text/30 font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <MessageCircle className="w-3.5 h-3.5" /> Client Declaration
                     </p>
                     <p className="text-sm text-brand-text/70 leading-relaxed font-medium">{t.message}</p>
                  </div>
               </div>

               {t.adminReply && (
                 <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-3xl p-6 flex gap-5">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-2">Administrative Resolution</p>
                       <p className="text-sm font-bold text-brand-primary/80 italic leading-relaxed">"{t.adminReply}"</p>
                    </div>
                 </div>
               )}

               {t.status !== 'CLOSED' && t.status !== 'RESOLVED' && (
                 <div className="pt-8 border-t border-brand-primary/5 space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((ticketStatus) => (
                        <button
                          key={ticketStatus}
                          type="button"
                          onClick={() => statusMut.mutate({ id: t.id, ticketStatus })}
                          className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${
                             t.status === ticketStatus 
                               ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
                               : 'bg-white border-brand-primary/5 text-brand-primary/40 hover:border-brand-secondary/30'
                          }`}
                        >
                          {ticketStatus}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <div className="relative flex-1 group/reply">
                          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary/20 group-focus-within/reply:text-brand-secondary transition-colors" />
                          <input 
                            type="text" 
                            placeholder="Draft resolution protocol..." 
                            value={replies[t.id] || ''} 
                            onChange={e => setReplies(p => ({...p, [t.id]: e.target.value}))} 
                            className="input-field pl-12 py-4 text-xs bg-brand-surface/30 border-brand-primary/5 focus:bg-white shadow-inner" 
                          />
                       </div>
                       <button onClick={() => {
                         if (!(replies[t.id] || '').trim()) {
                           toast.error('Manifest reply required');
                           return;
                         }
                         replyMut.mutate({ id: t.id, adminReply: replies[t.id] });
                       }} className="btn-primary py-4 px-8 flex items-center justify-center gap-3 group/btn">
                          <span className="text-[10px] font-black uppercase tracking-widest">Deploy Resolution</span>
                          <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                       </button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        ))}

        {!isLoading && (!data?.data || data.data.length === 0) && (
          <div className="card p-20 text-center border-brand-primary/5 bg-brand-surface/20">
             <ShieldCheck className="w-16 h-16 text-brand-primary/10 mx-auto mb-4" />
             <h3 className="text-brand-primary font-bold text-lg font-display uppercase tracking-widest">No Active Alerts</h3>
             <p className="text-brand-text/40 text-sm mt-2">All client communications are currently synchronized and resolved.</p>
          </div>
        )}
      </div>

      <div className="p-8 bg-white/30 rounded-3xl border border-brand-primary/5">
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

