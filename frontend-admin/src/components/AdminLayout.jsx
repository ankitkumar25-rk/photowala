import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { createElement, useState } from 'react';
import { useAdminStore } from '../App';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  RotateCcw, BarChart3, MessageSquare, LogOut, Menu, X, 
  Settings, Printer, ExternalLink
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
  const location = useLocation();
  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-cream-50 text-brand-text flex lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-brand-primary/10 bg-brand-deep text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 luxury-grain ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 px-6 border-b border-white/10">
             <img src={logo} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert opacity-90" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-[0.2em] text-brand-secondary uppercase leading-none mb-1">Photowala</span>
                <span className="text-xs font-black tracking-widest text-white leading-none">ADMIN PANEL</span>
             </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto no-scrollbar">
            {NAV.map(({ to, icon: Icon, label }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    active 
                    ? 'bg-brand-secondary text-white shadow-lg' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {createElement(Icon, { className: `h-5 w-5 shrink-0 ${active ? 'animate-pulse' : ''}` })}
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div className="border-t border-white/10 px-4 py-6 bg-brand-deep/50 backdrop-blur-sm">
            {user && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-secondary text-white font-bold shadow-inner">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="truncate text-sm font-bold text-white">{user.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-brand-secondary font-black">{user.role}</p>
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white/80 transition-all hover:bg-white/10 hover:text-white hover:border-white/20">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-deep/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-col flex-1 lg:min-h-screen">
        {/* Top bar */}
        <header className="glass-surface sticky top-0 z-20 flex h-20 items-center justify-between border-b border-brand-primary/10 px-6 sm:px-8">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2.5 -ml-2 rounded-xl bg-brand-surface text-brand-primary border border-brand-primary/10 transition-all hover:scale-105 active:scale-95"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <a 
              href={storeUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 rounded-full border border-brand-secondary/30 bg-brand-secondary/5 px-4 py-2 text-xs font-bold text-brand-secondary transition-all hover:bg-brand-secondary hover:text-white group"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Visit Store</span>
            </a>
            
            <div className="h-8 w-px bg-brand-primary/10" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-brand-primary leading-tight">{user?.name}</p>
                <p className="text-[10px] text-brand-secondary font-black uppercase tracking-tighter">Verified Admin</p>
              </div>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full border-2 border-white shadow-md object-cover ring-2 ring-brand-secondary/20" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-secondary shadow-md text-sm font-black text-white ring-2 ring-brand-secondary/20">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="fade-in flex-1 overflow-auto p-6 sm:p-8 md:p-10 bg-[radial-gradient(circle_at_bottom_right,rgba(184,138,47,0.05),transparent_40%)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
