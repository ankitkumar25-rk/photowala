import { useQuery } from '@tanstack/react-query';
import { createElement, useState } from 'react';
import api from '../api/client';
import {
  TrendingUp, ShoppingCart, Users, Package,
  AlertTriangle, ArrowUp, ArrowDown, ExternalLink,
  Clock, Activity, Calendar, Zap, ChevronRight,
  RefreshCcw, Filter, LayoutDashboard
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Link } from 'react-router-dom';

// ── KPI Card ──────────────────────────────────────────────────
function KPICard({ title, value, subtitle, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand:  { bg: 'bg-brand-primary/5', text: 'text-brand-primary', icon: 'text-brand-secondary' },
    accent: { bg: 'bg-brand-accent/5', text: 'text-brand-accent', icon: 'text-brand-accent' },
    gold:   { bg: 'bg-brand-secondary/5', text: 'text-brand-secondary', icon: 'text-brand-secondary' },
    red:    { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-600' },
  }[color] || {};

  return (
    <div className="card p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700">
        {createElement(Icon, { className: 'w-24 h-24 transform translate-x-6 -translate-y-6' })}
      </div>
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1">
          <p className="text-brand-text/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{title}</p>
          <p className="text-4xl font-bold text-brand-primary tracking-tight font-display leading-none">{value}</p>
          <div className="flex items-center gap-2 mt-4">
             {trend !== undefined && (
               <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${trend >= 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                 {trend >= 0 ? <ArrowUp className="w-2 h-2" /> : <ArrowDown className="w-2 h-2" />}
                 {Math.abs(trend)}%
               </div>
             )}
             <p className="text-[10px] text-brand-text/30 font-bold uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-brand-primary/5 shadow-sm ${colors.bg}`}>
          {createElement(Icon, { className: `w-6 h-6 ${colors.icon}` })}
        </div>
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  PENDING: '#b88a2f', CONFIRMED: '#5b3f2f', PROCESSING: '#d96a22',
  SHIPPED: '#3b82f6', DELIVERED: '#22c55e', CANCELLED: '#ef4444',
};

function SkeletonKPICard() {
  return (
    <div className="card p-8 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full space-y-4">
          <div className="h-2 bg-brand-primary/5 rounded w-1/3" />
          <div className="h-10 bg-brand-primary/5 rounded w-1/2" />
          <div className="h-2 bg-brand-primary/5 rounded w-2/3" />
        </div>
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-brand-primary/5" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [days, setDays] = useState(30);

  const { data: stats, isLoading, error: statsError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard/stats').then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: salesData } = useQuery({
    queryKey: ['admin-sales', days],
    queryFn: () => api.get(`/admin/dashboard/sales?days=${days}`).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  if (statsError) return (
    <div className="card p-12 text-center border-red-100 bg-red-50/20">
      <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-600 shadow-xl shadow-red-200/50">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h3 className="text-brand-primary font-bold text-xl font-display">Neural Interface Disrupted</h3>
      <p className="text-brand-text/50 text-sm mt-2 mb-8 max-w-sm mx-auto">We encountered an anomaly while synchronizing with the central intelligence core.</p>
      <button onClick={() => window.location.reload()} className="btn-primary py-3 px-10">Re-establish Uplink</button>
    </div>
  );

  const pieData = stats?.statusBreakdown
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  if (isLoading) return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-brand-primary/5 rounded w-48 animate-pulse" />
          <div className="h-4 bg-brand-primary/5 rounded w-64 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array(4).fill(0).map((_, i) => <SkeletonKPICard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[450px] card animate-pulse bg-brand-primary/5" />
        <div className="h-[450px] card animate-pulse bg-brand-primary/5" />
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                 <LayoutDashboard className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.3em]">Management Interface</span>
           </div>
           <h1 className="text-4xl font-bold text-brand-primary font-display tracking-tight">Command Hub</h1>
           <p className="text-brand-text/50 text-sm font-medium mt-1">Global operations & multi-channel performance synchronization</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white px-5 py-3 rounded-2xl border border-brand-primary/10 shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-200" />
                 <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Realtime Feed</span>
              </div>
              <div className="w-px h-4 bg-brand-primary/10" />
              <button onClick={() => window.location.reload()} className="p-1 text-brand-text/40 hover:text-brand-secondary transition-colors">
                 <RefreshCcw className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>
      </div>

      {/* KPI Ecosystem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <KPICard
          title="Consolidated Assets"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle="Lifetime accumulation"
          icon={TrendingUp} color="brand" trend={12.5}
        />
        <KPICard
          title="Operational Cycles"
          value={(stats?.totalOrders || 0).toLocaleString()}
          subtitle="Successful deployments"
          icon={ShoppingCart} color="accent" trend={8.2}
        />
        <KPICard
          title="Principal Clients"
          value={(stats?.totalUsers || 0).toLocaleString()}
          subtitle="Authorized users"
          icon={Users} color="gold" trend={3.1}
        />
        <KPICard
          title="Resource Inventory"
          value={stats?.totalProducts || 0}
          subtitle="Cataloged units"
          icon={Package}
          color={stats?.lowStockCount > 0 ? 'red' : 'brand'}
        />
      </div>

      {/* Analytics Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Trajectory */}
        <div className="lg:col-span-2 card overflow-hidden group">
          <div className="p-8 border-b border-brand-primary/5 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h3 className="text-xl font-bold text-brand-primary font-display">Revenue Intelligence</h3>
               <p className="text-[11px] text-brand-text/40 font-bold uppercase tracking-widest mt-1">Multi-channel settlement trends</p>
            </div>
            <div className="flex p-1 bg-brand-primary/5 rounded-xl border border-brand-primary/5">
               {[7, 30, 90].map(d => (
                 <button 
                   key={d} 
                   onClick={() => setDays(d)}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${days === d ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-text/30 hover:text-brand-primary'}`}
                 >
                   {d}D
                 </button>
               ))}
            </div>
          </div>
          
          <div className="p-8">
            {salesData && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={salesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" stroke="rgba(91, 63, 47, 0.04)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 9, fill: 'rgba(91, 63, 47, 0.4)', fontWeight: 800 }} 
                    tickLine={false} 
                    axisLine={false}
                    dy={15}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} 
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fill: 'rgba(91, 63, 47, 0.4)', fontWeight: 800 }} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                    tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: '1px solid rgba(91, 63, 47, 0.1)', 
                      boxShadow: '0 20px 40px rgba(91, 63, 47, 0.12)',
                      fontFamily: 'Outfit',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(10px)'
                    }}
                    itemStyle={{ fontSize: '13px', fontWeight: '900', color: 'var(--brand-primary)' }}
                    labelStyle={{ fontSize: '10px', color: 'rgba(91, 63, 47, 0.4)', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'SETTLEMENT']}
                    labelFormatter={(l) => new Date(l).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--brand-primary)" 
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 8, fill: 'var(--brand-primary)', stroke: '#fff', strokeWidth: 4, shadow: '0 4px 12px rgba(0,0,0,0.2)' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex flex-col items-center justify-center bg-brand-primary/5 rounded-3xl border border-brand-primary/5 border-dashed">
                 <Activity className="w-10 h-10 text-brand-primary/10 mb-4" />
                 <p className="text-[11px] text-brand-text/30 font-bold uppercase tracking-[0.2em]">Synchronization Required</p>
              </div>
            )}
          </div>
        </div>

        {/* Lifecycle Distribution */}
        <div className="card overflow-hidden">
           <div className="p-8 border-b border-brand-primary/5 bg-white/50">
              <h3 className="text-xl font-bold text-brand-primary font-display">Operational Mix</h3>
              <p className="text-[11px] text-brand-text/40 font-bold uppercase tracking-widest mt-1">Lifecycle phase segmentation</p>
           </div>
          
           <div className="p-8">
            {pieData.length > 0 ? (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="45%" 
                      outerRadius={100} 
                      innerRadius={75}
                      paddingAngle={8}
                      stroke="none"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 12px 24px rgba(0,0,0,0.15)', background: '#fff' }}
                       itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle" 
                      iconSize={10}
                      wrapperStyle={{ paddingTop: '30px' }}
                      formatter={(value) => <span className="text-[9px] font-bold text-brand-text/40 uppercase tracking-widest ml-2">{value}</span>} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[320px] flex flex-col items-center justify-center bg-brand-primary/5 rounded-3xl border border-brand-primary/5 border-dashed">
                 <Zap className="w-10 h-10 text-brand-primary/10 mb-4" />
                 <p className="text-[11px] text-brand-text/30 font-bold uppercase tracking-[0.2em]">Awaiting Operations</p>
              </div>
            )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Inventory Insights */}
         <div className="card p-8 group">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-xl font-bold text-brand-primary font-display">Supply Chain Health</h3>
                  <p className="text-[11px] text-brand-text/40 font-bold uppercase tracking-widest mt-1">Critical inventory management</p>
               </div>
               <Link to="/inventory" className="p-2.5 rounded-xl bg-brand-primary/5 text-brand-primary hover:bg-brand-primary hover:text-white transition-all">
                  <ExternalLink className="w-4 h-4" />
               </Link>
            </div>
            
            <div className="space-y-4">
               {stats?.lowStockCount > 0 ? (
                 <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-100 shrink-0">
                       <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="text-red-900 font-bold text-lg leading-tight">{stats.lowStockCount} Assets Depleted</h4>
                       <p className="text-red-700/60 text-xs font-medium mt-1 mb-4 leading-relaxed">System has detected stock levels below the minimum safety threshold. Immediate replenishment recommended.</p>
                       <Link to="/inventory" className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                          Initiate Replenishment <ChevronRight className="w-3.5 h-3.5" />
                       </Link>
                    </div>
                 </div>
               ) : (
                 <div className="p-12 text-center border-2 border-dashed border-brand-primary/5 rounded-2xl">
                    <div className="w-16 h-16 bg-brand-surface rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 border border-green-50">
                       <Zap className="w-8 h-8" />
                    </div>
                    <h4 className="text-brand-primary font-bold">Optimal Supply State</h4>
                    <p className="text-[11px] text-brand-text/30 font-bold uppercase tracking-widest mt-1">No critical depletions detected</p>
                 </div>
               )}
            </div>
         </div>

         {/* Quick Actions Hub */}
         <div className="card p-8">
            <h3 className="text-xl font-bold text-brand-primary font-display mb-1">Administrative Matrix</h3>
            <p className="text-[11px] text-brand-text/40 font-bold uppercase tracking-widest mb-8">Direct interface shortcuts</p>
            
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Dispatch Manifests', icon: ShoppingCart, path: '/orders', color: 'brand' },
                 { label: 'Catalog Assets', icon: Package, path: '/products', color: 'accent' },
                 { label: 'Client Directory', icon: Users, path: '/customers', color: 'gold' },
                 { label: 'Technical Ops', icon: Settings, path: '/machine-orders', color: 'brand' }
               ].map((action, i) => (
                 <Link 
                   key={i} 
                   to={action.path}
                   className="flex flex-col items-center justify-center p-6 bg-brand-surface border border-brand-primary/5 rounded-2xl group hover:bg-brand-primary hover:border-brand-primary transition-all duration-300"
                 >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-primary group-hover:text-brand-primary shadow-sm mb-4 transition-all">
                       <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-brand-primary group-hover:text-white uppercase tracking-widest text-center">{action.label}</span>
                 </Link>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
