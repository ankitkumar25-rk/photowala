import { Outlet, Link, useNavigate } from 'react-router-dom';
import { createElement } from 'react';
import { useAdminStore } from '../App';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  RotateCcw, BarChart3, MessageSquare, LogOut
} from 'lucide-react';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',  icon: Package,         label: 'Products' },
  { to: '/orders',    icon: ShoppingCart,    label: 'Orders' },
  { to: '/customers', icon: Users,           label: 'Customers' },
  { to: '/returns',   icon: RotateCcw,       label: 'Returns' },
  { to: '/inventory', icon: BarChart3,       label: 'Inventory' },
  { to: '/support',   icon: MessageSquare,   label: 'Support' },
];

export default function AdminLayout() {
  const { user, logout } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-cream-100 text-gray-900 grid grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="w-[280px] border-r border-brand-primary/15 bg-[#4a2f23] text-slate-100">
        <div className="flex h-full flex-col">
          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-5">
            {NAV.map(({ to, icon: Icon, label }) => {
              return (
                <Link
                  key={to}
                  to={to}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#f6e9da] transition-colors hover:bg-white/10 hover:text-white"
                >
                  {createElement(Icon, { className: 'h-4 w-4 shrink-0' })}
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="space-y-3 border-t border-[#f0c894]/18 px-4 py-4">
            {user && (
              <div className="rounded-xl bg-[#ffffff10] px-3 py-2">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-[#e8caa6]">{user.role}</p>
              </div>
            )}
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl border border-[#f2d5b4]/30 px-3 py-2 text-sm font-semibold text-[#f8efe7] transition-colors hover:bg-white/10 hover:text-white">
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-col lg:min-h-screen">
        {/* Top bar */}
        <header className="glass-surface sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-brand-primary/15 px-4 sm:px-6">
          <div className="ml-auto flex items-center gap-3">
            <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="hidden rounded-full border border-brand-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-surface sm:inline-block">
              View Store ↗
            </a>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full border border-brand-primary/20 object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="fade-in flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
