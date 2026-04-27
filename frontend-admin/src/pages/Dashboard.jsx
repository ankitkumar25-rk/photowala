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
function KPICard({ title, value, subtitle, icon: Icon, color = 'forest', trend }) {
  const colors = {
    forest: { bg: '#d8f3dc', text: '#1e4d34', icon: '#2d6a4f' },
    blue:   { bg: '#dbeafe', text: '#1e40af', icon: '#2563eb' },
    amber:  { bg: '#fef3c7', text: '#92400e', icon: '#d97706' },
    red:    { bg: '#fee2e2', text: '#991b1b', icon: '#dc2626' },
  }[color] || {};

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(trend)}% vs last month
            </div>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: colors.bg }}>
          {createElement(Icon, { className: 'w-5 h-5', style: { color: colors.icon } })}
        </div>
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PROCESSING: '#8b5cf6',
  SHIPPED: '#06b6d4', DELIVERED: '#22c55e', CANCELLED: '#ef4444',
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
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard/stats').then((r) => r.data.data),
  });

  const { data: salesData } = useQuery({
    queryKey: ['admin-sales', 30],
    queryFn: () => api.get('/admin/dashboard/sales?days=30').then((r) => r.data.data),
  });

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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subtitle={`₹${(stats?.revenueThisMonth || 0).toLocaleString('en-IN')} this month`}
          icon={TrendingUp} color="forest"
        />
        <KPICard
          title="Total Orders"
          value={(stats?.totalOrders || 0).toLocaleString()}
          subtitle={`${stats?.ordersThisMonth || 0} this month`}
          icon={ShoppingCart} color="blue"
        />
        <KPICard
          title="Customers"
          value={(stats?.totalUsers || 0).toLocaleString()}
          icon={Users} color="amber"
        />
        <KPICard
          title="Products"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.lowStockCount || 0} low stock`}
          icon={Package}
          color={stats?.lowStockCount > 0 ? 'red' : 'forest'}
        />
      </div>

      {/* Low stock alert */}
      {stats?.lowStockCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-brand-surface border border-brand-secondary rounded-xl text-brand-secondary text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span><strong>{stats.lowStockCount} products</strong> are running low on stock. <a href="/inventory" className="underline font-semibold">View inventory →</a></span>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales trend */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Sales — Last 30 Days</h3>
          {salesData && salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']}
                  labelFormatter={(l) => new Date(l).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} />
                <Line type="monotone" dataKey="revenue" stroke="#2d6a4f" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 4, fill: '#2d6a4f' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>

        {/* Order status pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Order Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>} />
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
