import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { createElement, useEffect } from 'react';
import { useAdminStore, useUIStore } from '../App';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  RotateCcw, BarChart3, MessageSquare, LogOut, Menu, X,
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
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';

  // Close sidebar on navigation (mobile/tablet)
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-cream-100 text-gray-900 flex">
      {/* Sidebar Overlay (Mobile/Tablet) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out luxury-grain flex flex-col
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-16'}
        bg-[#5b3f2f] text-[#f5e7d8] border-r border-[#5b3f2f]/10 shadow-2xl`}
      >
        {/* Logo Section */}
        <div className={`flex items-center border-b border-white/5 bg-[#4a3427] h-16 ${sidebarOpen ? 'px-6' : 'justify-center'}`}>
           <img src={logo} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert opacity-95" />
           {sidebarOpen && (
             <div className="flex flex-col ml-3">
                <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase leading-none mb-1">Photowala</span>
                <span className="text-xs font-black tracking-widest text-white leading-none">ADMIN</span>
             </div>
           )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto no-scrollbar">
          {NAV.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative group flex items-center rounded-xl px-2.5 py-2.5 text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-[#b88a2f] text-white shadow-lg shadow-[#b88a2f]/20' 
                    : 'text-[#f5e7d8]/70 hover:bg-white/10 hover:text-white'}
                  ${sidebarOpen ? 'gap-3' : 'justify-center'}
                `}
              >
                {createElement(Icon, { className: `h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-[#b88a2f]'}` })}
                {sidebarOpen && <span className="truncate">{label}</span>}
                
                {/* Tooltip for collapsed mode */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-brand-primary text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-white/10">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className={`mt-auto p-3 border-t border-white/5 bg-[#4a3427]/30 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 mb-3 border border-white/5">
              <div className="h-10 w-10 rounded-full bg-[#b88a2f] flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {user?.name?.[0]?.toUpperCase() || <User size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-bold text-[#b88a2f] uppercase tracking-wider">{user?.role || 'Admin'}</p>
              </div>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-xl bg-[#b88a2f] flex items-center justify-center text-white font-bold text-sm mb-3 shadow-inner">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          
          <button 
            onClick={handleLogout} 
            title="Sign Out"
            className={`flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[#f5e7d8] transition-all hover:bg-[#d96a22] hover:text-white hover:border-[#d96a22] shadow-sm
              ${sidebarOpen ? 'w-full gap-2 px-4 py-2.5 text-xs font-black tracking-widest uppercase' : 'h-10 w-10'}
            `}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Top Navigation Bar */}
        <header className="glass-surface sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#5b3f2f]/10 px-4 sm:px-6">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-white border border-[#5b3f2f]/10 shadow-sm text-[#5b3f2f] hover:bg-[#f5e7d8] transition-all"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-black tracking-widest text-[#5b3f2f] uppercase truncate">
              {NAV.find(n => n.to === location.pathname)?.label || 'Photowala Admin'}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a 
              href={storeUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 rounded-full border border-[#5b3f2f]/20 bg-white/70 px-3 sm:px-4 py-1.5 text-[10px] font-black tracking-wider text-[#5b3f2f] uppercase transition-all hover:bg-[#5b3f2f] hover:text-white"
            >
              <ExternalLink size={12} />
              <span className="hidden sm:inline">Store</span>
            </a>
            
            <div className="h-9 w-9 rounded-full border-2 border-white shadow-sm ring-1 ring-[#5b3f2f]/10 overflow-hidden shrink-0">
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
        <main className="fade-in flex-1 p-4 sm:p-6 lg:p-10 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
