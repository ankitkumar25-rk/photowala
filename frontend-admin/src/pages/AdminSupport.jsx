import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PaginationControls from '../components/PaginationControls';
export default function AdminSupport() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-support', status, page],
    queryFn: () => api.get('/support/admin/tickets', { params: { status: status || undefined, page, limit: 20 } }).then(r => r.data),
    staleTime: 1000 * 60, // 1 minute
  });
  if (error) return <div className="card p-5 bg-red-50 border border-red-200"><p className="text-red-700 font-semibold">Failed to load tickets: {error.message}</p></div>;
  const replyMut = useMutation({
    mutationFn: ({id, adminReply}) => api.patch('/support/admin/tickets/' + id, { adminReply, status: 'RESOLVED' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-support'] }); toast.success('Reply sent'); },
  });
  const statusMut = useMutation({
    mutationFn: ({id, ticketStatus}) => api.patch('/support/admin/tickets/' + id, { status: ticketStatus }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-support'] }); toast.success('Ticket status updated'); },
  });
  const [replies, setReplies] = useState({});
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
        <p className="text-gray-400 text-sm mt-0.5">{data?.meta?.total || 0} tickets</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ' +
              (status === s 
                ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
                : 'bg-white border-brand-primary/10 text-brand-primary/60 hover:border-brand-primary/30')}>
            {s || 'All Tickets'}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="card p-4 animate-pulse h-24 bg-gray-100" />) 
        : data?.data?.map(t => (
          <div key={t.id} className="card p-5 sm:p-6 space-y-5 luxury-grain border-[#5b3f2f]/5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-[#b88a2f] uppercase tracking-[0.2em]">{t.ticketNumber}</span>
                  <span className={'badge-status ' + t.status.toLowerCase().replace('_','-')}>{t.status}</span>
                </div>
                <h3 className="font-bold text-[#5b3f2f] text-lg mt-2">{t.subject}</h3>
                <p className="text-xs font-semibold text-[#7a655c]/60 mt-1 truncate">{t.user?.name} · {t.user?.email}</p>
              </div>
              <span className="text-[10px] font-black text-[#7a655c]/40 uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>

            <div className="bg-[#fcf9f6] p-5 rounded-2xl border border-[#5b3f2f]/5 relative">
               <div className="absolute top-0 left-6 -mt-2 w-4 h-4 bg-[#fcf9f6] border-t border-l border-[#5b3f2f]/5 rotate-45"></div>
               <p className="text-sm text-[#5b3f2f] leading-relaxed italic">"{t.message}"</p>
            </div>

            {t.adminReply && (
              <div className="bg-[#5b3f2f]/5 p-5 rounded-2xl border border-[#5b3f2f]/10">
                <p className="text-[10px] font-black text-[#5b3f2f] uppercase tracking-widest mb-2">Our Response</p>
                <p className="text-sm text-[#5b3f2f] font-medium leading-relaxed">{t.adminReply}</p>
              </div>
            )}

            {t.status !== 'CLOSED' && t.status !== 'RESOLVED' && (
              <div className="pt-4 border-t border-[#5b3f2f]/5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((ticketStatus) => (
                    <button
                      key={ticketStatus}
                      type="button"
                      onClick={() => statusMut.mutate({ id: t.id, ticketStatus })}
                      className={'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ' + (t.status === ticketStatus ? 'bg-[#5b3f2f] text-white border-[#5b3f2f] shadow-lg shadow-[#5b3f2f]/10' : 'bg-white border-[#5b3f2f]/10 text-[#7a655c] hover:border-[#b88a2f]/40')}
                    >
                      {ticketStatus.replace('_',' ')}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                   <input 
                      type="text" 
                      placeholder="Type your strategic response..." 
                      value={replies[t.id] || ''} 
                      onChange={e => setReplies(p => ({...p, [t.id]: e.target.value}))} 
                      className="input-field bg-[#fcf9f6] text-sm py-3 flex-1" 
                   />
                   <button 
                      onClick={() => {
                        if (!(replies[t.id] || '').trim()) {
                          toast.error('Response cannot be empty');
                          return;
                        }
                        replyMut.mutate({ id: t.id, adminReply: replies[t.id] });
                      }} 
                      className="px-6 py-3 rounded-xl bg-[#b88a2f] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#a07a2a] transition-all whitespace-nowrap active:scale-95"
                   >
                     Send Response
                   </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="card luxury-grain p-4">
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
