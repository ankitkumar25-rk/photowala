import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { createElement, useEffect } from 'react';
import { useAdminStore } from '../App';
import { useUIStore } from '../store/uiStore';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  RotateCcw, BarChart3, MessageSquare, LogOut, Menu, X, ClipboardList,
  Settings, Printer, ExternalLink, User
} from 'lucide-react';
import logo from '../assets/logo.png';
import { NotificationBell } from './NotificationBell';
import { useAdminSSE } from '../hooks/useAdminSSE';

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
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';

  // Initialize SSE connection for admin notifications
  useAdminSSE();

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-cream-100 text-gray-900">
      {/* Sidebar - Mobile Drawer / Tablet Icon-only / Desktop Fixed */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-[#5b3f2f] text-[#f5e7d8] transition-all duration-300 ease-in-out luxury-grain border-r border-[#5b3f2f]/10
          ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-64 sm:w-16 lg:w-64'}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 sm:h-20 items-center gap-3 px-4 sm:px-6 border-b border-white/5 bg-[#4a3427] overflow-hidden">
             <img src={logo} alt="Logo" className="h-8 sm:h-9 w-auto object-contain brightness-0 invert opacity-95 shrink-0" />
             <div className={`flex flex-col transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 sm:hidden lg:opacity-100 lg:block'}`}>
                <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase leading-none mb-1 whitespace-nowrap">Photowala</span>
                <span className="text-xs font-black tracking-widest text-white leading-none whitespace-nowrap">ADMIN PANEL</span>
             </div>
             {/* Mobile Close Button */}
             <button 
               onClick={() => setSidebarOpen(false)}
               className="ml-auto p-1 text-white/50 hover:text-white sm:hidden"
             >
               <X className="w-6 h-6" />
             </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 px-2 sm:px-3 py-6 overflow-y-auto no-scrollbar">
            {NAV.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#b88a2f] text-white shadow-lg shadow-[#b88a2f]/20' 
                      : 'text-[#f5e7d8]/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center shrink-0 w-6">
                    {createElement(Icon, { className: `h-5 w-5 ${isActive ? 'text-white' : 'text-[#b88a2f]'}` })}
                  </div>
                  <span className={`transition-all duration-300 ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible sm:hidden lg:opacity-100 lg:visible'}`}>
                    {label}
                  </span>
                  
                  {/* Tablet Tooltip */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-[#4a3427] text-white text-[10px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 hidden sm:block lg:hidden shadow-xl border border-white/5 uppercase tracking-widest">
                      {label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="mt-auto p-2 sm:p-3 border-t border-white/5 bg-[#4a3427]/30">
            <div className={`flex items-center gap-3 rounded-2xl bg-white/5 p-2 sm:p-3 mb-3 border border-white/5 overflow-hidden`}>
              <div className="h-8 sm:h-10 w-8 sm:w-10 shrink-0 rounded-full bg-[#b88a2f] flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {user?.name?.[0]?.toUpperCase() || <User size={18} />}
              </div>
              <div className={`flex-1 min-w-0 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 sm:hidden lg:opacity-100 lg:block'}`}>
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] font-bold text-[#b88a2f] uppercase tracking-wider">{user?.role || 'Super Admin'}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs font-black tracking-widest text-[#f5e7d8] uppercase transition-all hover:bg-[#d96a22] hover:text-white hover:border-[#d96a22] shadow-sm"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={`${sidebarOpen ? 'block' : 'hidden lg:block'}`}>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop (Mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex min-w-0 flex-col transition-all duration-300 ${sidebarOpen ? 'ml-0 sm:ml-64' : 'ml-0 sm:ml-16 lg:ml-64'}`}>
        {/* Top Header Bar */}
        <header className="glass-surface sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#5b3f2f]/10 px-4 sm:px-6">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-white border border-[#5b3f2f]/10 shadow-sm text-[#5b3f2f] hover:bg-[#f5e7d8] transition-all"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-xs sm:text-sm font-black tracking-widest text-[#5b3f2f] uppercase opacity-60 truncate">
              {NAV.find(n => n.to === location.pathname)?.label || 'Photowala Admin'}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a 
              href={storeUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="hidden xs:flex items-center gap-2 rounded-full border border-[#5b3f2f]/20 bg-white/70 px-3 sm:px-4 py-1.5 text-[10px] font-black tracking-wider text-[#5b3f2f] uppercase transition-all hover:bg-[#5b3f2f] hover:text-white"
            >
              <ExternalLink size={12} />
              <span className="hidden sm:inline">Store</span>
            </a>

            <NotificationBell />
            
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border-2 border-white shadow-sm ring-1 ring-[#5b3f2f]/10 overflow-hidden shrink-0">
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
        <main className="fade-in flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
