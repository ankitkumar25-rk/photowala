import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { createElement, useState, useEffect } from 'react';
import { useAdminStore } from '../App';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  RotateCcw, BarChart3, MessageSquare, LogOut, Menu, X, ClipboardList,
  Settings, Printer, ExternalLink, User
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

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-cream-100 text-gray-900 grid grid-cols-1 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[#5b3f2f]/10 bg-[#5b3f2f] text-[#f5e7d8] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 luxury-grain ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-20 items-center gap-3 px-6 border-b border-white/5 bg-[#4a3427]">
             <img src={logo} alt="Logo" className="h-9 w-auto object-contain brightness-0 invert opacity-95" />
             <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase leading-none mb-1">Photowala</span>
                <span className="text-xs font-black tracking-widest text-white leading-none">ADMIN PANEL</span>
             </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto no-scrollbar">
            {NAV.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#b88a2f] text-white shadow-lg shadow-[#b88a2f]/20' 
                      : 'text-[#f5e7d8]/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {createElement(Icon, { className: `h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-[#b88a2f]'}` })}
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="mt-auto p-4 border-t border-white/5 bg-[#4a3427]/30">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 mb-3 border border-white/5">
              <div className="h-10 w-10 rounded-full bg-[#b88a2f] flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {user?.name?.[0]?.toUpperCase() || <User size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] font-bold text-[#b88a2f] uppercase tracking-wider">{user?.role || 'Super Admin'}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-black tracking-widest text-[#f5e7d8] uppercase transition-all hover:bg-[#d96a22] hover:text-white hover:border-[#d96a22] shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#3b1d16]/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-col lg:min-h-screen">
        {/* Top Navigation Bar */}
        <header className="glass-surface sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#5b3f2f]/10 px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-white border border-[#5b3f2f]/10 shadow-sm text-[#5b3f2f] hover:bg-[#f5e7d8] transition-all"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden sm:block">
            <h2 className="text-sm font-black tracking-widest text-[#5b3f2f] uppercase opacity-40">
              {NAV.find(n => n.to === location.pathname)?.label || 'Photowala Admin'}
            </h2>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <a 
              href={storeUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 rounded-full border border-[#5b3f2f]/20 bg-white/70 px-4 py-1.5 text-[10px] font-black tracking-wider text-[#5b3f2f] uppercase transition-all hover:bg-[#5b3f2f] hover:text-white"
            >
              <ExternalLink size={12} />
              <span className="hidden xs:inline">Storefront</span>
            </a>
            
            <div className="h-9 w-9 rounded-full border-2 border-white shadow-sm ring-1 ring-[#5b3f2f]/10 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-[#f5e7d8] text-[#5b3f2f] font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="fade-in flex-1 overflow-auto p-4 sm:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
