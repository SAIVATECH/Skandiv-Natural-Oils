'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  Megaphone,
  Plus,
  RefreshCw,
  TrendingUp,
  MailCheck,
  Eye,
  Settings as SettingsIcon,
  Trash2,
  Play,
  Pause,
  AlertTriangle,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  XCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface CampaignStats {
  total: number;
  pending: number;
  sending: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  skipped: number;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  templateName: string;
  templateLanguage: string;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  stats: CampaignStats;
}

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: any[];
  lastSyncedAt: string;
}

interface AnalyticsData {
  cards: {
    totalCampaigns: number;
    totalProcessed: number;
    sentCount: number;
    deliveredCount: number;
    readCount: number;
    deliveryRate: number;
    openRate: number;
    totalCost: number;
    dailyCap: number;
    monthlyCap: number;
    sentToday: number;
    sentThisMonth: number;
  };
  funnelData: Array<{ name: string; value: number }>;
  templateData: Array<{ name: string; value: number }>;
  dispatchTrends: Array<{ date: string; dispatched: number }>;
}

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingTemplates, setSyncingTemplates] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchCampaignsAndAnalytics = useCallback(async () => {
    try {
      const [campRes, analyticsRes] = await Promise.all([
        fetch('/api/campaigns'),
        fetch('/api/campaigns/analytics')
      ]);

      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load campaigns/analytics:', error);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    Promise.all([fetchCampaignsAndAnalytics(), fetchTemplates()]).finally(() => {
      setLoading(false);
    });
  }, [fetchCampaignsAndAnalytics, fetchTemplates]);

  // Sync templates from Meta Graph API
  const handleSyncTemplates = async () => {
    setSyncingTemplates(true);
    try {
      const res = await fetch('/api/campaigns/templates', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncingTemplates(false);
    }
  };

  // Toggle play/pause/cancel status of campaign
  const handleToggleCampaignStatus = async (id: string, currentStatus: string) => {
    const endpoint = currentStatus === 'SENDING' ? 'pause' : 'send';
    try {
      const res = await fetch(`/api/campaigns/${id}/${endpoint}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchCampaignsAndAnalytics();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCampaignsAndAnalytics();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Draft</span>;
      case 'SCHEDULED':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center w-max gap-1"><Clock className="w-3 h-3" /> Scheduled</span>;
      case 'SENDING':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center w-max gap-1"><Play className="w-3 h-3 fill-amber-400/20" /> Sending</span>;
      case 'PAUSED':
        return <span className="bg-zinc-700/55 text-zinc-400 border border-zinc-600/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center w-max gap-1"><Pause className="w-3 h-3" /> Paused</span>;
      case 'COMPLETED':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center w-max gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'CANCELLED':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center w-max gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading campaigns & templates...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const cards = analytics?.cards || {
    totalCampaigns: 0,
    totalProcessed: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    deliveryRate: 0,
    openRate: 0,
    totalCost: 0,
    dailyCap: 1000,
    monthlyCap: 30000,
    sentToday: 0,
    sentThisMonth: 0
  };

  const dailyPercentage = Math.min(100, Math.round((cards.sentToday / cards.dailyCap) * 100));
  const monthlyPercentage = Math.min(100, Math.round((cards.sentThisMonth / cards.monthlyCap) * 100));

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Top bar header actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Megaphone className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold font-mono uppercase tracking-widest">Broadcast Core</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-100">Campaign Management</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/admin/campaigns/settings" 
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-slate-100 transition-all text-xs font-bold flex items-center gap-2"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Limits Settings</span>
            </Link>
            <Link 
              href="/admin/campaigns/new" 
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl transition-all text-xs font-black shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Campaign</span>
            </Link>
          </div>
        </div>

        {/* Global Summary Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Campaigns */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 hover:border-slate-800/80 transition-all group">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Broadcasts</p>
                <h3 className="text-3xl font-black text-slate-100 tracking-tight">{cards.totalCampaigns}</h3>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-2xl text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-400 text-[11px] font-semibold mt-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>{cards.totalProcessed.toLocaleString()} total messages processed</span>
            </p>
          </div>

          {/* Card 2: Delivery Success */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 hover:border-slate-800/80 transition-all group">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Delivery Rate</p>
                <h3 className="text-3xl font-black text-slate-100 tracking-tight">{Math.round(cards.deliveryRate)}%</h3>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-2xl text-slate-400 group-hover:text-teal-400 group-hover:bg-teal-500/10 transition-all">
                <MailCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-400 text-[11px] font-semibold mt-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>{cards.deliveredCount.toLocaleString()} messages reached devices</span>
            </p>
          </div>

          {/* Card 3: Open (Read) Rate */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 hover:border-slate-800/80 transition-all group">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Read Open Rate</p>
                <h3 className="text-3xl font-black text-slate-100 tracking-tight">{Math.round(cards.openRate)}%</h3>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-2xl text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-400 text-[11px] font-semibold mt-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>{cards.readCount.toLocaleString()} customer devices marked READ</span>
            </p>
          </div>

          {/* Card 4: Estimated Campaign Cost */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 hover:border-slate-800/80 transition-all group">
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Simulated Cost</p>
                <h3 className="text-3xl font-black text-slate-100 tracking-tight">${cards.totalCost.toFixed(2)}</h3>
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded-2xl text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-all">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-400 text-[11px] font-semibold mt-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Marketing template fee estimates</span>
            </p>
          </div>
        </div>

        {/* Safety caps progress metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily limit tracker */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Daily Messaging Cap</span>
              <span className="text-slate-100 font-black">{cards.sentToday} / {cards.dailyCap} messages</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${dailyPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Resets at midnight UTC</span>
              <span className="font-bold text-emerald-400">{dailyPercentage}% Consumed</span>
            </div>
          </div>

          {/* Monthly limit tracker */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Monthly Messaging Cap</span>
              <span className="text-slate-100 font-black">{cards.sentThisMonth} / {cards.monthlyCap} messages</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>Resets on the 1st of next month</span>
              <span className="font-bold text-teal-400">{monthlyPercentage}% Consumed</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Headers */}
        <div className="flex border-b border-slate-900">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'campaigns'
                ? 'border-emerald-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            All Campaigns
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'templates'
                ? 'border-emerald-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Meta Cloud Templates ({templates.length})
          </button>
        </div>

        {/* Active Tab rendering */}
        {activeTab === 'campaigns' ? (
          <div className="space-y-6">
            
            {/* Charts section (Rendered only on client mount to prevent SSR hydration mismatches) */}
            {mounted && analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Funnel Delivery chart */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Marketing Funnel Summary</h4>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={analytics.funnelData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                      >
                        <XAxis type="number" stroke="#475569" fontSize={10} />
                        <YAxis type="category" dataKey="name" stroke="#475569" fontSize={10} width={100} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#10b981', fontSize: '11px' }}
                        />
                        <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} barSize={20}>
                          {analytics.funnelData.map((entry, index) => {
                            const colors = ['#38bdf8', '#10b981', '#0d9488', '#6366f1'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Dispatches trend chart */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Message Dispatch Trends (Past 7 Days)</h4>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analytics.dispatchTrends}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#0ea5e9', fontSize: '11px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="dispatched" 
                          stroke="#0ea5e9" 
                          strokeWidth={2.5}
                          fill="url(#colorDispatched)" 
                        />
                        <defs>
                          <linearGradient id="colorDispatched" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            )}

            {/* Campaign grid listing */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/40 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Marketing Campaigns</h3>
                <span className="text-[10px] text-slate-500 font-bold">{campaigns.length} campaigns configured</span>
              </div>

              {campaigns.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <Megaphone className="w-12 h-12 text-slate-700 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-slate-300 text-sm font-bold">No campaigns found</p>
                    <p className="text-slate-500 text-xs">Create your first marketing campaign using Meta templates to engage customers.</p>
                  </div>
                  <Link 
                    href="/admin/campaigns/new"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create Campaign</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-900">
                  {campaigns.map((c) => {
                    const progress = c.stats.total > 0 
                      ? Math.round(((c.stats.sent + c.stats.delivered + c.stats.read + c.stats.failed) / c.stats.total) * 100) 
                      : 0;

                    return (
                      <div key={c.id} className="p-5 hover:bg-slate-900/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Name and template detail info */}
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-100 text-sm hover:underline">
                              <Link href={`/admin/campaigns/${c.id}`}>{c.name}</Link>
                            </h4>
                            {getStatusBadge(c.status)}
                          </div>
                          {c.description && <p className="text-slate-500 text-xs line-clamp-1">{c.description}</p>}
                          <p className="text-slate-400 text-[10px] font-mono flex items-center gap-1.5">
                            <span>Template: <strong>{c.templateName}</strong></span>
                            <span className="text-slate-600">•</span>
                            <span>Code: {c.templateLanguage}</span>
                          </p>
                        </div>

                        {/* Stats Breakdown progress indicator */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                          
                          {/* Progress bar (only relevant if campaign is sending or completed) */}
                          <div className="w-36 space-y-1.5">
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Sending Progress</span>
                              <span className="font-mono text-slate-100">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Stat summary items */}
                          <div className="grid grid-cols-4 gap-3 text-center sm:border-l sm:border-slate-800 sm:pl-6">
                            <div className="px-1.5">
                              <span className="text-slate-500 text-[9px] font-bold block uppercase">Total</span>
                              <span className="text-xs font-mono text-slate-300 font-bold">{c.stats.total}</span>
                            </div>
                            <div className="px-1.5">
                              <span className="text-emerald-500/80 text-[9px] font-bold block uppercase">Sent</span>
                              <span className="text-xs font-mono text-emerald-400 font-bold">{c.stats.sent + c.stats.delivered + c.stats.read}</span>
                            </div>
                            <div className="px-1.5">
                              <span className="text-blue-500/80 text-[9px] font-bold block uppercase">Read</span>
                              <span className="text-xs font-mono text-blue-400 font-bold">{c.stats.read}</span>
                            </div>
                            <div className="px-1.5">
                              <span className="text-rose-500/80 text-[9px] font-bold block uppercase">Fail</span>
                              <span className="text-xs font-mono text-rose-400 font-bold">{c.stats.failed}</span>
                            </div>
                          </div>

                        </div>

                        {/* Actions Toolbar button set */}
                        <div className="flex items-center gap-2 lg:border-l lg:border-slate-800 lg:pl-4 justify-end">
                          
                          {/* Sending trigger play/pause buttons */}
                          {c.status === 'DRAFT' || c.status === 'PAUSED' || c.status === 'SCHEDULED' ? (
                            <button
                              onClick={() => handleToggleCampaignStatus(c.id, c.status)}
                              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all border border-emerald-500/20 active:scale-95 flex items-center gap-1.5 text-[11px] font-bold px-3"
                              title="Start Dispatch"
                            >
                              <Play className="w-3.5 h-3.5 fill-emerald-400/20 stroke-[2.5]" />
                              <span>Send</span>
                            </button>
                          ) : c.status === 'SENDING' ? (
                            <button
                              onClick={() => handleToggleCampaignStatus(c.id, c.status)}
                              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl transition-all border border-amber-500/20 active:scale-95 flex items-center gap-1.5 text-[11px] font-bold px-3"
                              title="Pause Dispatch"
                            >
                              <Pause className="w-3.5 h-3.5 fill-amber-400/20 stroke-[2.5]" />
                              <span>Pause</span>
                            </button>
                          ) : null}

                          <Link 
                            href={`/admin/campaigns/${c.id}`}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700/80 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                            title="Open Control Panel"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>

                          {c.status !== 'SENDING' && (
                            <button
                              onClick={() => handleDeleteCampaign(c.id)}
                              className="p-2 bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                              title="Delete Campaign"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Meta template sync card */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-100 text-base">WhatsApp Template Synchronization</h3>
                <p className="text-slate-400 text-xs max-w-xl">
                  Meta requires using approved message templates for bulk campaign outreach. Sync approved templates from your Meta Developer Account WABA console to formulate broadcasts.
                </p>
              </div>

              <button
                onClick={handleSyncTemplates}
                disabled={syncingTemplates}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/15"
              >
                <RefreshCw className={`w-4 h-4 ${syncingTemplates ? 'animate-spin' : ''}`} />
                <span>{syncingTemplates ? 'Syncing...' : 'Sync From Meta'}</span>
              </button>
            </div>

            {/* Templates listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.length === 0 ? (
                <div className="col-span-full bg-slate-900/20 border border-slate-900 p-12 text-center rounded-3xl space-y-3">
                  <Layers className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-slate-300 text-xs font-bold">No cached templates available</p>
                  <p className="text-slate-500 text-[11px]">Click &quot;Sync From Meta&quot; above to pull templates.</p>
                </div>
              ) : (
                templates.map((t) => {
                  // Find body and header elements
                  const headerComp = t.components.find((c: any) => c.type === 'HEADER');
                  const bodyComp = t.components.find((c: any) => c.type === 'BODY');
                  const footerComp = t.components.find((c: any) => c.type === 'FOOTER');

                  return (
                    <div key={t.id} className="bg-slate-900/30 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between hover:border-slate-800 transition-all">
                      
                      <div className="space-y-4">
                        {/* Header metadata */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-extrabold text-slate-100 text-xs truncate max-w-[150px]" title={t.name}>{t.name}</h4>
                            <span className="text-[9px] text-slate-500 font-mono">ID: {t.id}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-slate-800 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{t.category}</span>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{t.status}</span>
                          </div>
                        </div>

                        {/* Interactive message card preview */}
                        <div className="bg-slate-950/60 border border-slate-900 p-4 rounded-2xl text-[11px] text-slate-300 space-y-2 relative overflow-hidden">
                          
                          {/* Header section preview */}
                          {headerComp && (
                            <div className="font-bold text-slate-100 border-b border-slate-900 pb-1.5 mb-1.5 flex items-center gap-1 text-[10px]">
                              <span className="text-emerald-400">Header:</span>
                              <span className="truncate">{headerComp.text || `[${headerComp.format}]`}</span>
                            </div>
                          )}

                          {/* Body text body */}
                          {bodyComp && (
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-300 italic">
                              {bodyComp.text}
                            </p>
                          )}

                          {/* Footer text */}
                          {footerComp && (
                            <p className="text-[10px] text-slate-600 font-semibold border-t border-slate-900/80 pt-1.5 mt-1.5">
                              {footerComp.text}
                            </p>
                          )}
                          
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-900/80 flex justify-between items-center text-[10px] text-slate-500">
                        <span>Language: <strong>{t.language}</strong></span>
                        <span>Synced: {new Date(t.lastSyncedAt).toLocaleDateString()}</span>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>
    </DashboardShell>
  );
}
