import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../App';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
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
      
      toast.success(`Welcome, ${user.name}!`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-4">
      <div className="w-full max-w-sm">
        <div className="card bg-cream-50 p-7 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-full h-24 bg-[#f7efe5] rounded-[1.75rem] flex items-center justify-center mx-auto mb-5 overflow-hidden px-6">
              <img src={adminLogo} alt="Admin logo" className="w-28 h-14 sm:w-32 sm:h-16 object-contain" />
            </div>
            <p className="text-brand-secondary text-sm font-medium">Sign in to manage your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-primary mb-1.5">Email</label>
              <input
                id="admin-email"
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="admin@photowala.in"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-primary mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary/70 hover:text-brand-secondary">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-1" id="admin-login-btn">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
