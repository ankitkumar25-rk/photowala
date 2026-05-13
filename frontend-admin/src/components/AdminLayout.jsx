import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { createElement, useState } from 'react';
import { useAdminStore } from '../App';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  RotateCcw, BarChart3, MessageSquare, LogOut, Menu, X, 
  Settings, Printer, ChevronRight, ShieldCheck, ExternalLink,
  Globe, Bell
} from 'lucide-react';
import logo from '../assets/logo.png';

const NAV = [
  { to: '/',               icon: LayoutDashboard, label: 'Intelligence' },
  { to: '/products',       icon: Package,         label: 'Asset Hub' },
  { to: '/orders',         icon: ShoppingCart,    label: 'Deployments' },
  { to: '/machine-orders', icon: Settings,        label: 'Technical Ops' },
  { to: '/print-orders',   icon: Printer,         label: 'Print Logistics' },
  { to: '/customers',      icon: Users,           label: 'Principals' },
  { to: '/returns',        icon: RotateCcw,       label: 'Decommission' },
  { to: '/inventory',      icon: BarChart3,       label: 'Inventory' },
  { to: '/support',        icon: MessageSquare,   label: 'Concierge' },
];

export default function AdminLayout() {
  const { user, logout } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();
  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-brand-surface text-brand-text flex flex-col lg:flex-row font-sans selection:bg-brand-secondary/30 selection:text-brand-primary">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-brand-deep/60 backdrop-blur-md lg:hidden transition-all duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-[300px] border-r border-white/5 bg-[#1a120e] text-[#f6e9da] transform transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:translate-x-0 shadow-2xl ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col relative z-10 overflow-hidden">
          {/* Decorative Sidebar Gradient */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(231,168,124,0.05),transparent)] pointer-events-none" />
          
          {/* Logo Area */}
          <div className="flex h-24 items-center gap-4 px-10 border-b border-white/5 relative z-10">
             <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                <img src={logo} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert opacity-90" />
             </div>
             <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black tracking-[0.4em] text-brand-secondary uppercase leading-none mb-1.5">Photowala</span>
                <span className="text-base font-bold tracking-widest text-white leading-none font-display truncate">MATRIX</span>
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-6 py-10 overflow-y-auto no-scrollbar relative z-10">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 ml-4">Terminal Console</p>
            {NAV.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between rounded-2xl px-5 py-4 text-xs font-bold transition-all duration-500 relative overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-r from-brand-secondary/20 to-transparent text-white shadow-lg shadow-brand-secondary/5' 
                      : 'text-white/40 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && (
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-secondary rounded-full shadow-[0_0_15px_rgba(231,168,124,0.6)]" />
                  )}
                  <div className="flex items-center gap-4 relative z-10">
                    {createElement(Icon, { className: `h-4.5 w-4.5 shrink-0 transition-all duration-500 ${isActive ? 'text-brand-secondary scale-110 drop-shadow-[0_0_8px_rgba(231,168,124,0.4)]' : 'text-white/20 group-hover:text-white/60'}` })}
                    <span className={`tracking-widest uppercase ${isActive ? 'translate-x-1' : ''} transition-transform duration-500`}>{label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3 w-3 text-brand-secondary animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info */}
          <div className="mt-auto border-t border-white/5 p-8 bg-black/20 backdrop-blur-md relative z-10">
            {user && (
              <div className="flex items-center gap-4 mb-8 px-2 group cursor-pointer">
                <div className="h-12 w-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center border border-brand-secondary/20 shadow-lg group-hover:rotate-6 transition-transform">
                   <span className="text-lg font-bold text-brand-secondary">{user.name?.[0]}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold text-white leading-tight truncate">{user.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                     <ShieldCheck className="w-3 h-3 text-brand-secondary/60" />
                     <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{user.role}</p>
                  </div>
                </div>
              </div>
            )}
            <button 
              onClick={handleLogout} 
              className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] border border-white/5 bg-white/5 px-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.3em] transition-all hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 group active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Deactivate Session</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 bg-brand-surface relative">
        {/* Background Decorative Layer */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_80%_0%,rgba(231,168,124,0.03),transparent)] pointer-events-none" />
        
        {/* Header */}
        <header className="sticky top-0 z-[40] flex h-24 items-center justify-between px-8 lg:px-12 bg-brand-surface/80 backdrop-blur-xl border-b border-brand-primary/5">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-3.5 rounded-2xl bg-white border border-brand-primary/10 shadow-xl shadow-brand-primary/5 text-brand-primary hover:bg-brand-surface transition-all active:scale-90"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="hidden lg:block">
               <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-brand-primary tracking-tight font-display">Administrative Console</h2>
                  <div className="px-2.5 py-0.5 rounded-lg bg-brand-primary/5 border border-brand-primary/10 flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[9px] font-black text-brand-primary/60 uppercase tracking-widest">Protocol Active</span>
                  </div>
               </div>
               <p className="text-[10px] text-brand-text/30 uppercase font-black tracking-[0.3em] mt-1.5">Photowala Neural Processing Unit</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
             {/* Action Bar */}
             <div className="flex items-center gap-3 pr-8 border-r border-brand-primary/10">
                <button className="p-2.5 rounded-xl text-brand-text/30 hover:text-brand-primary hover:bg-brand-primary/5 transition-all relative">
                   <Bell className="w-5 h-5" />
                   <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-secondary rounded-full border-2 border-white" />
                </button>
                <a 
                  href={storeUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hidden md:flex items-center gap-3 rounded-2xl border border-brand-primary/10 bg-white px-5 py-2.5 text-[10px] font-black text-brand-primary uppercase tracking-widest transition-all hover:bg-brand-primary hover:text-white hover:border-brand-primary hover:shadow-xl hover:shadow-brand-primary/10 active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Live Environment
                </a>
             </div>
            
            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-brand-primary tracking-tight">{user?.name}</p>
                <p className="text-[9px] text-brand-secondary font-black uppercase tracking-[0.2em] mt-1">Authorized Node</p>
              </div>
              <div className="relative group">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-12 w-12 rounded-2xl border-2 border-white shadow-xl object-cover ring-1 ring-brand-primary/10 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-deep flex items-center justify-center text-white text-base font-bold shadow-2xl ring-2 ring-white group-hover:rotate-6 transition-transform duration-500">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-auto no-scrollbar">
          <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
             <div className="fade-in">
               <Outlet />
             </div>
          </div>
        </main>

        {/* Global Footer Meta */}
        <footer className="px-12 py-6 border-t border-brand-primary/5 flex items-center justify-between">
           <p className="text-[9px] font-black text-brand-text/20 uppercase tracking-[0.4em]">Control Matrix v1.0.4 - Secure Instance</p>
           <div className="flex items-center gap-6">
              <span className="text-[9px] font-black text-brand-text/20 uppercase tracking-[0.2em] flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" /> Encrypted Session
              </span>
           </div>
        </footer>
      </div>
    </div>
  );
}
