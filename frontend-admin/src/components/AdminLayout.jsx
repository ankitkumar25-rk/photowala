import { Outlet, Link, useNavigate } from 'react-router-dom';
import { createElement, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { useAdminStore } from '../App';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  RotateCcw, BarChart3, MessageSquare, LogOut, Menu, X, ClipboardList, Printer, Cpu
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

const SERVICE_NAV = [
  { to: '/services/custom-printing', icon: Printer, label: 'Print Orders' },
  { to: '/services/machine-requests', icon: Cpu, label: 'Machine Quotes' },
];

export default function AdminLayout() {
  const { user, logout } = useAdminStore();
  const navigate = useNavigate();
  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Poll for counts every 30 seconds
  const { data: serviceCounts } = useQuery({
    queryKey: ['admin-service-counts'],
    queryFn: async () => {
      const [{ data: cp }, { data: ms }] = await Promise.all([
        api.get('/orders/admin/custom-printing', { params: { status: 'PENDING', limit: 1 } }),
        api.get('/orders/admin/machine-requests', { params: { status: 'PENDING_QUOTE', limit: 1 } })
      ]);
      return { 
        cp: cp?.pagination?.total || 0, 
        ms: ms?.pagination?.total || 0 
      };
    },
    enabled: !!user && user.role === 'SUPER_ADMIN',
    refetchInterval: 30000 
  });

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-cream-100 text-gray-900 grid grid-cols-1 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-70 border-r border-brand-primary/15 bg-[#4a2f23] text-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
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

            {user?.role === 'SUPER_ADMIN' && (
              <div className="pt-4 mt-4 border-t border-white/10">
                <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#e8caa6]/50">Services</p>
                {SERVICE_NAV.map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-[#f6e9da] transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <div className="flex items-center gap-3">
                      {createElement(Icon, { className: 'h-4 w-4 shrink-0' })}
                      <span>{label}</span>
                    </div>
                    {to.includes('custom-printing') && serviceCounts?.cp > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center">{serviceCounts.cp}</span>
                    )}
                    {to.includes('machine-requests') && serviceCounts?.ms > 0 && (
                      <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center">{serviceCounts.ms}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
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
