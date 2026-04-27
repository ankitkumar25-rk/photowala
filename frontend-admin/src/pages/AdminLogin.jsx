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
  const { setUser, setToken } = useAdminStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      const { user, accessToken } = data.data;
      if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        toast.error('Access denied. Admin account required.');
        return;
      }
      setUser(user);
      setToken(accessToken);
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
        <div className="card bg-cream-50 p-8">
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-[#f7efe5] rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden">
              <img src={adminLogo} alt="Premium Admin" className="w-9 h-9 object-contain" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-primary">Admin Portal</h1>
            <p className="text-brand-secondary text-sm mt-1 font-medium">Sign in to manage your store</p>
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
                placeholder="admin@manufact.in"
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

          <p className="text-center text-xs text-brand-secondary/70 mt-5">
            Demo: admin@manufact.in / Admin@1234
          </p>
        </div>
      </div>
    </div>
  );
}
