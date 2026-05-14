import { useQuery } from '@tanstack/react-query';
import { createElement } from 'react';
import { Link } from 'react-router-dom';
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
    brand:  { bg: 'bg-[#fdf8f3]', text: 'text-[#5b3f2f]', icon: 'text-[#b88a2f]', border: 'border-[#b88a2f]/10' },
    accent: { bg: 'bg-[#fff5f2]', text: 'text-[#8f2d1d]', icon: 'text-[#d96a22]', border: 'border-[#d96a22]/10' },
    gold:   { bg: 'bg-[#fefaf2]', text: 'text-[#704709]', icon: 'text-[#b88a2f]', border: 'border-[#b88a2f]/10' },
    red:    { bg: 'bg-[#fff1f1]', text: 'text-[#991b1b]', icon: 'text-[#dc2626]', border: 'border-[#dc2626]/10' },
  }[color] || {};

  return (
    <div className={`card group p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${colors.bg} ${colors.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</p>
          <p className={`text-3xl font-bold ${colors.text} tracking-tight`}>{value}</p>
          {subtitle && (
            <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5 pt-1">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {subtitle}
            </p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              <div className={`p-1 rounded-full ${trend >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              </div>
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${colors.bg} border ${colors.border}`}>
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
      className={`animate-pulse rounded-full bg-[#e8ecef] ${height}`}
      style={{ width }}
      aria-hidden="true"
    />
  );
}

function SkeletonKPICard() {
  return (
    <div className="card p-5" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full space-y-3">
          <SkeletonLine width="38%" height="h-3" />
          <SkeletonLine width="22%" height="h-8" />
          <SkeletonLine width="50%" height="h-3" />
        </div>
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[#dfe6ea]" />
      </div>
    </div>
  );
}

function SkeletonChartCard({ compact = false }) {
  return (
    <div className="card p-5" aria-hidden="true">
      <SkeletonLine width="34%" height="h-4" />
      <div className={`mt-5 rounded-2xl border border-[#eef2f4] bg-[#f8fafb] ${compact ? 'h-[220px]' : 'h-[260px]'} p-4`}>
        {!compact ? (
          <div className="flex h-full flex-col justify-end gap-3">
            <SkeletonLine width="100%" height="h-2" />
            <SkeletonLine width="88%" height="h-2" />
            <SkeletonLine width="74%" height="h-2" />
            <SkeletonLine width="95%" height="h-2" />
            <SkeletonLine width="62%" height="h-2" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="h-36 w-36 animate-pulse rounded-full border-[18px] border-[#dfe8ec] border-t-[#cfd8de]" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading, error: statsError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard/stats').then((r) => r.data.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: salesData, error: salesError } = useQuery({
    queryKey: ['admin-sales', 30],
    queryFn: () => api.get('/admin/dashboard/sales?days=30').then((r) => r.data.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (statsError) {
    return (
      <div className="card p-6 bg-red-50 border border-red-200">
        <p className="text-red-700 font-semibold">Failed to load dashboard stats</p>
        <p className="text-sm text-red-600 mt-1">{statsError.message}</p>
      </div>
    );
  }

  const pieData = stats?.statusBreakdown
    ? Object.entries(stats.statusBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2" aria-hidden="true">
          <SkeletonLine width="180px" height="h-8" />
          <SkeletonLine width="280px" height="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <SkeletonKPICard key={i} />
          ))}
        </div>

        <div className="card flex items-center gap-3 px-4 py-3" aria-hidden="true">
          <div className="h-5 w-5 animate-pulse rounded-full bg-[#e3e8ec]" />
          <SkeletonLine width="320px" height="h-3" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SkeletonChartCard />
          </div>
          <SkeletonChartCard compact />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary tracking-tight">Executive Dashboard</h1>
          <div className="flex items-center gap-4 mt-1">
            <div className="h-0.5 w-8 bg-brand-secondary rounded-full" />
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Business Intelligence Overview</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Metrics
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          title="Customers"
          value={(stats?.totalUsers || 0).toLocaleString()}
          icon={Users} color="gold"
        />
        <KPICard
          title="Products"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.lowStockCount || 0} low stock`}
          icon={Package}
          color={stats?.lowStockCount > 0 ? 'red' : 'brand'}
        />
      </div>

      {/* Low stock alert */}
      {stats?.lowStockCount > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 bg-red-50/50 border border-red-200/50 rounded-2xl backdrop-blur-sm group hover:bg-red-50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm border border-red-100">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800 tracking-tight">Inventory Alert</p>
              <p className="text-xs text-red-600/80 font-medium">
                <span className="font-bold">{stats.lowStockCount} items</span> are below the minimum threshold.
              </p>
            </div>
          </div>
          <Link 
            to="/inventory" 
            className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-md shadow-red-500/20 active:scale-95"
          >
            Reorder Now
          </Link>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales trend */}
        <div className="card p-6 lg:col-span-2 border-none shadow-xl bg-white/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-primary">Revenue Trend</h3>
            <div className="px-3 py-1 rounded-full bg-brand-surface text-[10px] font-bold text-brand-primary border border-brand-primary/10">
              Last 30 Days
            </div>
          </div>
          
          {salesData && salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={salesData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b88a2f" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#b88a2f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} 
                />
                <YAxis 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                  tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(1) + 'k' : v}`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#5b3f2f' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}
                  formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                  labelFormatter={(l) => new Date(l).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#5b3f2f" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#fff', stroke: '#5b3f2f', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: '#5b3f2f', stroke: '#fff', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3">
              <TrendingUp className="w-8 h-8 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No transaction data available</p>
            </div>
          )}
        </div>

        <div className="card p-6 border-none shadow-xl bg-white/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-primary">Distribution</h3>
            <ShoppingCart className="w-4 h-4 text-brand-secondary opacity-40" />
          </div>
          
          {pieData.length > 0 ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie 
                    data={pieData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="40%" 
                    outerRadius={85} 
                    innerRadius={60}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle" 
                    iconSize={6}
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{value}</span>} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 leading-none mb-1">Total</p>
                <p className="text-2xl font-bold text-brand-primary leading-none">
                  {pieData.reduce((acc, curr) => acc + curr.value, 0)}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3">
              <ShoppingCart className="w-8 h-8 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No order records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
