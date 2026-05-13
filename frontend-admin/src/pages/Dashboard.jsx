import { useQuery } from '@tanstack/react-query';
import { createElement } from 'react';
import api from '../api/client';
import {
  TrendingUp, ShoppingCart, Users, Package,
  AlertTriangle, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// ── KPI Card ──────────────────────────────────────────────────
function KPICard({ title, value, subtitle, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand:  { bg: 'bg-brand-surface/50', text: 'text-brand-primary', icon: 'text-brand-secondary' },
    accent: { bg: 'bg-orange-50', text: 'text-brand-accent', icon: 'text-brand-accent' },
    gold:   { bg: 'bg-amber-50', text: 'text-brand-secondary', icon: 'text-brand-secondary' },
    red:    { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  }[color] || {};

  return (
    <div className="card p-6 transition-all duration-300 hover:shadow-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-brand-text/60 text-xs font-black uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-brand-text mt-1 truncate">{value}</p>
          {subtitle && <p className="text-[10px] font-bold text-brand-secondary mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-black/5 ${colors.bg}`}>
          {createElement(Icon, { className: `w-6 h-6 ${colors.icon}` })}
        </div>
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  PENDING: '#b88a2f', CONFIRMED: '#5b3f2f', PROCESSING: '#d96a22',
  SHIPPED: '#a06f20', DELIVERED: '#22c55e', CANCELLED: '#ef4444',
};

function SkeletonLine({ width = '100%', height = 'h-3' }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-brand-primary/5 ${height}`}
      style={{ width }}
      aria-hidden="true"
    />
  );
}

export default function Dashboard() {
  const { data: stats, isLoading, error: statsError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard/stats').then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: salesData } = useQuery({
    queryKey: ['admin-sales', 30],
    queryFn: () => api.get('/admin/dashboard/sales?days=30').then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  if (statsError) {
    return (
      <div className="card p-8 bg-red-50 border border-red-100 flex flex-col items-center text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-black text-red-900">Dashboard Unreachable</h2>
        <p className="text-red-600/70 mt-2 max-w-md">{statsError.message}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-6">Try Again</button>
      </div>
    );
  }

  const pieData = stats?.statusBreakdown
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="space-y-3">
          <SkeletonLine width="200px" height="h-10" />
          <SkeletonLine width="320px" height="h-4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-6 h-32 animate-pulse bg-white/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card p-8 h-80 animate-pulse bg-white/50" />
          <div className="card p-8 h-80 animate-pulse bg-white/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-text tracking-tight">Overview</h1>
          <p className="text-brand-text/50 font-bold mt-1 text-sm">Real-time performance analytics.</p>
        </div>
        <div className="text-xs font-black uppercase tracking-widest text-brand-secondary bg-brand-surface px-4 py-2 rounded-full border border-brand-secondary/20">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle={`₹${(stats?.revenueThisMonth || 0).toLocaleString('en-IN')} this month`}
          icon={TrendingUp} color="brand"
        />
        <KPICard
          title="Total Orders"
          value={(stats?.totalOrders || 0).toLocaleString()}
          subtitle={`${stats?.ordersThisMonth || 0} this month`}
          icon={ShoppingCart} color="accent"
        />
        <KPICard
          title="Total Customers"
          value={(stats?.totalUsers || 0).toLocaleString()}
          icon={Users} color="gold"
        />
        <KPICard
          title="Catalog Size"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.lowStockCount || 0} items low on stock`}
          icon={Package}
          color={stats?.lowStockCount > 0 ? 'red' : 'brand'}
        />
      </div>

      {/* Alerts */}
      {stats?.lowStockCount > 0 && (
        <div className="card bg-brand-surface/40 border-brand-secondary/30 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left transition-all hover:border-brand-secondary/60 group">
          <div className="p-3 rounded-full bg-brand-secondary/10 text-brand-secondary group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-brand-primary">Low Stock Inventory Alert</h4>
            <p className="text-xs font-bold text-brand-text/60 mt-0.5">There are {stats.lowStockCount} items that require immediate restocking to prevent fulfillment delays.</p>
          </div>
          <Link to="/inventory" className="btn-primary py-2 text-xs">Manage Stock</Link>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales trend */}
        <div className="card p-8 lg:col-span-2 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-brand-text tracking-tight uppercase text-xs">Revenue Performance</h3>
            <span className="text-[10px] font-black text-brand-secondary tracking-widest bg-brand-surface px-2 py-1 rounded">30 DAY WINDOW</span>
          </div>
          <div className="h-[300px] w-full">
            {salesData && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#b88a2f" />
                      <stop offset="100%" stopColor="#5b3f2f" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" stroke="rgba(91, 63, 47, 0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#7a655c' }} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} 
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#7a655c' }} 
                    tickLine={false} 
                    axisLine={false}
                    dx={-10}
                    tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 40px rgba(91, 63, 47, 0.15)',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}
                    formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                    labelFormatter={(l) => new Date(l).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#fff', stroke: '#b88a2f', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#5b3f2f', stroke: '#fff', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-brand-text/30 text-xs font-bold">Waiting for transaction data...</div>
            )}
          </div>
        </div>

        {/* Order status pie */}
        <div className="card p-8 flex flex-col">
          <div className="mb-8">
            <h3 className="font-black text-brand-text tracking-tight uppercase text-xs">Fulfillment Status</h3>
            <p className="text-[10px] text-brand-text/40 font-bold mt-1">Order lifecycle distribution</p>
          </div>
          <div className="h-[300px] w-full flex-1">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="45%" 
                    outerRadius={90} 
                    innerRadius={60}
                    paddingAngle={8}
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle" 
                    iconSize={8}
                    formatter={(value) => <span className="text-[10px] font-bold text-brand-text/60 uppercase ml-1">{value}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-brand-text/30 text-xs font-bold italic">No active orders tracked</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
