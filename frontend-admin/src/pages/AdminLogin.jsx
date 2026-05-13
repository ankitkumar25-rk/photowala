import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../App';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react';
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
        toast.error('Invalid response from server');
        return;
      }
      
      if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        toast.error('Access denied. Admin account required.');
        return;
      }
      
      // Persist tokens and user state
      localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      
      // Update store with user data - this triggers persistence
      setUser(user);
      
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-brand-deep luxury-grain">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-secondary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-accent/5 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10">
           <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10 mb-4 shadow-2xl scale-110">
              <img src={adminLogo} alt="Admin logo" className="h-12 w-auto object-contain brightness-0 invert opacity-95" />
           </div>
           <h2 className="text-white text-2xl font-black tracking-tight flex items-center gap-2">
             <ShieldCheck className="w-6 h-6 text-brand-secondary" />
             <span>Secure Access</span>
           </h2>
           <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mt-2">Photowala Admin Gateway</p>
        </div>

        <div className="card glass-surface p-8 sm:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-brand-primary uppercase tracking-widest mb-2 ml-1">Administrative Email</label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field bg-white/50 backdrop-blur-sm border-brand-primary/10 focus:bg-white"
                  placeholder="admin@photowalagift.online"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-brand-primary uppercase tracking-widest mb-2 ml-1">Security Key</label>
              <div className="relative group">
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field bg-white/50 backdrop-blur-sm border-brand-primary/10 pr-12 focus:bg-white"
                  placeholder="••••••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary/40 hover:text-brand-secondary transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full h-14 justify-center gap-3 text-sm group relative overflow-hidden"
              id="admin-login-btn"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Authenticate Admin</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 text-center">
           <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
             &copy; {new Date().getFullYear()} Photowala Gift. Restricted Area.
           </p>
        </div>
      </div>
    </div>
  );
}
