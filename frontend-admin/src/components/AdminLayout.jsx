import { Outlet, Link, useNavigate } from 'react-router-dom';
import { createElement, useState } from 'react';
import { useAdminStore } from '../App';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  RotateCcw, BarChart3, MessageSquare, LogOut, Menu, X, ClipboardList,
  Settings, Printer
} from 'lucide-react';
import logo from '../assets/logo.png';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',  icon: Package,         label: 'Products' },
  { to: '/orders',    icon: ShoppingCart,    label: 'Orders' },
  { to: '/machine-orders', icon: Settings,   label: 'Machine Services' },
  { to: '/print-orders',   icon: Printer,    label: 'Print Orders' },
  { to: '/customers', icon: Users,           label: 'Customers' },
  { to: '/returns',   icon: RotateCcw,       label: 'Returns' },
  { to: '/inventory', icon: BarChart3,       label: 'Inventory' },
  { to: '/support',   icon: MessageSquare,   label: 'Support' },
];

export default function AdminLayout() {
  const { user, logout } = useAdminStore();
  const navigate = useNavigate();
  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-cream-100 text-gray-900 grid grid-cols-1 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-70 border-r border-white/5 bg-[linear-gradient(180deg,#5a3f2f,#3b291f)] text-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 luxury-grain ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 px-6 border-b border-white/5 mb-2">
             <img src={logo} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert opacity-90" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase leading-none mb-1">Photowala</span>
                <span className="text-xs font-black tracking-widest text-white leading-none">ADMIN PANEL</span>
             </div>
          </div>

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

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-col lg:min-h-screen">
        {/* Top bar */}
        <header className="glass-surface sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-brand-primary/15 px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>

          <div className="ml-auto flex items-center gap-3">
            <a href={storeUrl} target="_blank" rel="noreferrer" className="hidden rounded-full border border-brand-primary/20 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-surface sm:inline-block">
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
