'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAdminStore } from '@/store/adminStore';
import {
  TrendingUp,
  BarChart3,
  Loader2,
  Calendar,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Users,
  Repeat,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function AdminAnalyticsPage() {
  const { analytics, loadingAnalytics, fetchAnalytics } = useAdminStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (!mounted || loadingAnalytics || !analytics) {
    return (
      <DashboardShell>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Compiling analytical ledgers...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const { cards, salesTrend, categoryBreakdown, topProducts } = analytics;

  // Calculate advanced insights
  const avgOrderValue = cards.totalOrders > 0 
    ? Math.round(cards.totalRevenue / cards.totalOrders) 
    : 0;

  const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];

  const stats = [
    { title: 'Average Order Value', value: `₹${avgOrderValue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-400', desc: 'Revenue divided by total orders' },
    { title: 'Repeat Customer Rate', value: `${cards.repeatCustomerRate}%`, icon: Repeat, color: 'text-blue-400', desc: 'Buyers who completed >1 purchases' },
    { title: 'Product Catalog Strength', value: topProducts.length, icon: ShoppingBag, color: 'text-indigo-400', desc: 'Count of unique products generating sales' },
    { title: 'Total Customers', value: cards.totalCustomers, icon: Users, color: 'text-purple-400', desc: 'WhatsApp unique client numbers' },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* 1. KEY ANALYTICS WIDGETS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-850 p-5 rounded-3xl shadow-xl flex items-center justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.title}</span>
                  <h3 className="text-2xl font-black text-white">{stat.value}</h3>
                  <span className="text-[10px] text-slate-500 font-medium block">{stat.desc}</span>
                </div>
                <div className="w-11 h-11 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. DOUBLE CHART ANALYTICAL WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sales growth stream chart */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue Stream Over Time</h3>
                <p className="text-xs text-slate-400">Past 7 days daily earnings chart</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Analytics Stream</span>
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend}>
                  <defs>
                    <linearGradient id="colorRevAnalytics" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value) => [`₹${value}`, 'Sales']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevAnalytics)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart distribution */}
          <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue share by Category</h3>
              <p className="text-xs text-slate-400">Visual distributions of store inventory</p>
            </div>

            {categoryBreakdown.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs italic">
                No inventory categories found.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={categoryBreakdown}>
                    <XAxis
                      dataKey="name"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
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
                        fontSize: '11px',
                      }}
                      formatter={(value) => [`₹${value}`, 'Revenue']}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>

        {/* 3. DETAILED BESTSELLERS TABLE */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Detailed Sales Inventory Audit</h3>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs italic">
              No sales logged.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-850 bg-slate-900/40">
                    <th className="p-4">Rank</th>
                    <th className="p-4">Product Name</th>
                    <th className="p-4 text-center">Volume Sold</th>
                    <th className="p-4 text-right">Financial Yield</th>
                    <th className="p-4 text-right">AOV contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {topProducts.map((prod, idx) => {
                    const contribution = cards.totalRevenue > 0 
                      ? Math.round((prod.revenue / cards.totalRevenue) * 100) 
                      : 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-500">
                          #{(idx + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="p-4 font-bold text-white">{prod.name}</td>
                        <td className="p-4 text-center text-slate-300 font-semibold">{prod.quantity} units</td>
                        <td className="p-4 text-right font-black text-emerald-400 text-sm">
                          ₹{prod.revenue.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-slate-500">
                          {contribution}% share
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
