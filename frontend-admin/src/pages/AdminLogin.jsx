import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../App';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, RefreshCw } from 'lucide-react';
import adminLogo from '../assets/logo.png';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAdminStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', form);
      const { data } = response;
      const { user, accessToken, refreshToken } = data?.data || {};
      
      if (!user || !accessToken) {
        toast.error('Invalid protocol response');
        return;
      }
      
      if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        toast.error('Privilege escalation denied. Administrative credentials required.');
        return;
      }
      
      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      
      toast.success(`Identity Verified. Welcome, ${user.name}`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-surface relative overflow-hidden px-4">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-brand-primary/5 rounded-full blur-[120px]" />
         <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-brand-secondary/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="card p-10 sm:p-12 border-brand-primary/5 shadow-2xl shadow-brand-primary/5 bg-white/80 backdrop-blur-xl">
          <div className="text-center mb-10">
            <div className="w-full h-28 bg-brand-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 overflow-hidden px-10 border border-brand-primary/10">
              <img src={adminLogo} alt="Photowala" className="w-full h-full object-contain filter drop-shadow-sm" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
               <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary" />
               <span className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.4em]">Administrative Terminal</span>
            </div>
            <p className="text-brand-text/40 text-xs font-bold uppercase tracking-widest mt-2">Initialize secure session</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-brand-text/30 uppercase tracking-widest ml-1">Credential Email</label>
              <div className="relative group">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/20 group-focus-within:text-brand-primary transition-colors" />
                 <input
                   id="admin-email"
                   type="email" 
                   required
                   value={form.email}
                   onChange={(e) => setForm({ ...form, email: e.target.value })}
                   className="input-field pl-12 py-4 text-sm bg-brand-surface/50 border-brand-primary/5 focus:bg-white transition-all shadow-inner"
                   placeholder="admin@photowala.in"
                 />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-brand-text/30 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text/20 group-focus-within:text-brand-primary transition-colors" />
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'} 
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-12 pr-12 py-4 text-sm bg-brand-surface/50 border-brand-primary/5 focus:bg-white transition-all shadow-inner"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text/30 hover:text-brand-primary transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full justify-center py-4 mt-4 shadow-xl shadow-brand-primary/20 group relative overflow-hidden" 
              id="admin-login-btn"
            >
              <div className="flex items-center gap-3 relative z-10">
                 {loading ? (
                    <>
                       <RefreshCw className="w-4 h-4 animate-spin" />
                       <span className="text-[11px] font-black uppercase tracking-[0.2em]">Verifying Identity...</span>
                    </>
                 ) : (
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Establish Connection</span>
                 )}
              </div>
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-brand-primary/5 text-center">
             <p className="text-[9px] font-black text-brand-text/20 uppercase tracking-[0.3em]">Photowala Control Matrix v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
