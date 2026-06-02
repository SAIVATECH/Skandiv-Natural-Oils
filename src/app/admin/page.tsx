'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAdminStore } from '@/store/adminStore';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  DollarSign,
  Receipt,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

// Lazy load Recharts on client side only to prevent Next.js SSR hydration mismatches
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function AdminOverviewPage() {
  const {
    analytics,
    orders,
    loadingAnalytics,
    loadingOrders,
    fetchAnalytics,
    fetchOrders
  } = useAdminStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
    fetchOrders();
  }, [fetchAnalytics, fetchOrders]);

  if (!mounted || loadingAnalytics || loadingOrders) {
    return (
      <DashboardShell>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Aggregating live insights...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Fallbacks if data isn't loaded yet
  const cards = analytics?.cards || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    repeatCustomerRate: 0,
  };

  const salesTrend = analytics?.salesTrend || [];
  const categoryBreakdown = analytics?.categoryBreakdown || [];
  const topProducts = analytics?.topProducts || [];
  const recentOrdersList = orders.slice(0, 5);

  const cardStats = [
    {
      title: 'Total Revenue',
      value: `₹${Number(cards.totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/10',
      desc: 'All completed WhatsApp orders',
    },
    {
      title: 'Total Orders',
      value: cards.totalOrders,
      icon: Receipt,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/10',
      desc: 'Pending & paid conversation carts',
    },
    {
      title: 'Store Customers',
      value: cards.totalCustomers,
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/10',
      desc: 'Unique WhatsApp client chats',
    },
    {
      title: 'Bestseller Rate',
      value: `${cards.repeatCustomerRate}%`,
      icon: UserCheck,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/10',
      desc: 'Percentage of repeat customers',
    },
  ];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'SHIPPED': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Low Stock Warning Banner */}
        {cards.lowStockCount > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-100">Stock Warning</p>
                <p className="text-xs text-slate-400">There are {cards.lowStockCount} product(s) running dangerously low on inventory.</p>
              </div>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-amber-400 hover:underline flex items-center space-x-1"
            >
              <span>Manage Stock</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 1. KPI WIDGET CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`bg-slate-900/60 border border-slate-850 p-5 rounded-3xl shadow-xl flex items-center justify-between transition-transform duration-200 hover:-translate-y-0.5`}
              >
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.title}</span>
                  <h3 className="text-2xl font-black text-slate-100">{stat.value}</h3>
                  <span className="text-[10px] text-slate-500 font-medium block">{stat.desc}</span>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} border ${stat.borderColor} rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. RECHARTS PLOTS VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart: Sales Trend AreaChart */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Weekly Revenue Stream</h3>
                <p className="text-xs text-slate-400">Sum of PAID order transactions</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Live Feed</span>
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Secondary Chart: Category Pie Breakdown */}
          <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Category Revenue</h3>
              <p className="text-xs text-slate-400">Total volume grouped by type</p>
            </div>

            {categoryBreakdown.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs italic">
                No purchases documented yet.
              </div>
            ) : (
              <div className="h-64 w-full flex flex-col justify-center">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`₹${value}`, 'Sales']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-4 font-semibold">
                  {categoryBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-400 truncate">{item.name}</span>
                      <span className="text-slate-100 ml-auto">₹{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* 3. RECENT ORDERS GRID + BEST SELLERS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Orders Grid */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Incoming Cart Requests</h3>
                <p className="text-xs text-slate-400">Recent customer interactions</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>All Orders</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {recentOrdersList.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs italic">
                No orders logged in database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-bold border-b border-slate-800 pb-2">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Shipment</th>
                      <th className="pb-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {recentOrdersList.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3.5 font-mono font-bold text-slate-300">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3.5">
                          <p className="font-bold text-slate-100">{order.user.name || 'WhatsApp Buyer'}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{order.user.whatsappNumber}</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getOrderStatusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-extrabold text-slate-100">
                          ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Selling Products List */}
          <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Top Selling Items</h3>
              <p className="text-xs text-slate-400">Total units sold & financial yield</p>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs italic">
                No product items sold yet.
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((prod, idx) => (
                  <div key={idx} className="flex items-center space-x-3.5 bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center font-black text-emerald-400 border border-emerald-500/20 text-xs">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate">{prod.name}</p>
                      <span className="text-[10px] text-slate-500 font-semibold">{prod.quantity} Units Sold</span>
                    </div>
                    <div className="text-right text-xs font-extrabold text-emerald-400">
                      ₹{prod.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
