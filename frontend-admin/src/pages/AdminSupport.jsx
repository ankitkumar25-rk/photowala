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
      <div className="space-y-3">
        {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="card p-4 animate-pulse h-24 bg-gray-100" />) 
        : data?.data?.map(t => (
          <div key={t.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400">{t.ticketNumber}</span>
                  <span className={'badge-status ' + t.status.toLowerCase().replace('_','-')}>{t.status}</span>
                </div>
                <p className="font-semibold text-gray-800 mt-1">{t.subject}</p>
                <p className="text-sm text-gray-500 mt-0.5">{t.user?.name} · {t.user?.email}</p>
                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">{t.message}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            {t.adminReply && <div className="bg-brand-surface border border-brand-secondary rounded-lg p-3 text-sm text-brand-primary"><strong>Reply:</strong> {t.adminReply}</div>}
            {t.status !== 'CLOSED' && t.status !== 'RESOLVED' && (
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((ticketStatus) => (
                    <button
                      key={ticketStatus}
                      type="button"
                      onClick={() => statusMut.mutate({ id: t.id, ticketStatus })}
                      className={'px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ' + (t.status === ticketStatus ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white border-brand-primary/10 text-brand-primary/60 hover:border-brand-primary/30')}
                    >
                      {ticketStatus}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" placeholder="Type your reply..." value={replies[t.id] || ''} onChange={e => setReplies(p => ({...p, [t.id]: e.target.value}))} className="input-field py-2 text-sm" />
                <button onClick={() => {
                  if (!(replies[t.id] || '').trim()) {
                    toast.error('Reply cannot be empty');
                    return;
                  }
                  replyMut.mutate({ id: t.id, adminReply: replies[t.id] });
                }} className="btn-primary py-2 px-4 text-sm whitespace-nowrap w-full sm:w-auto">Send Reply</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="card">
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
