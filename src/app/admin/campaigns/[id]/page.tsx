'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  ArrowLeft,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  AlertTriangle,
  Info,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  Megaphone,
  MailCheck
} from 'lucide-react';
import Link from 'next/link';

interface Recipient {
  id: string;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
  wamid: string | null;
  customer: {
    name: string;
    whatsappNumber: string;
  };
}

interface CampaignLog {
  id: string;
  level: string;
  message: string;
  timestamp: string;
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
  logs: CampaignLog[];
  stats: {
    total: number;
    pending: number;
    sending: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    skipped: number;
  };
}

export default function CampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // Campaign State
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recipients list state (Paginated)
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Control actions states
  const [actionLoading, setActionLoading] = useState(false);
  const [polling, setPolling] = useState(true);

  // Fetch campaign details and logs
  const fetchCampaignDetails = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to load campaign');
      }
    } catch (err: any) {
      setError(err.message || 'Network connection failed');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id]);

  // Fetch recipients list
  const fetchRecipients = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        status: statusFilter,
        search: searchQuery
      });
      const res = await fetch(`/api/campaigns/${id}/recipients?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.recipients);
        setTotalRecipients(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load recipients:', err);
    }
  }, [id, page, statusFilter, searchQuery]);

  // Initial load
  useEffect(() => {
    fetchCampaignDetails(true);
  }, [fetchCampaignDetails]);

  // Load recipients whenever filters change
  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  // Polling updates when campaign is sending
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const runPoll = () => {
      if (document.hidden) return; // Don't query when browser tab is inactive
      fetchCampaignDetails(false);
      fetchRecipients();
    };

    if (polling && campaign?.status === 'SENDING') {
      interval = setInterval(runPoll, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [polling, campaign?.status, fetchCampaignDetails, fetchRecipients]);

  const handleToggleSend = async () => {
    if (!campaign) return;
    setActionLoading(true);
    const endpoint = campaign.status === 'SENDING' ? 'pause' : 'send';
    try {
      const res = await fetch(`/api/campaigns/${id}/${endpoint}`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchCampaignDetails(false);
        await fetchRecipients();
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!confirm('Are you sure you want to delete this campaign? Recipients history will be deleted.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.push('/admin/campaigns');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setActionLoading(false);
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

  const getRecipientStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-[10px] text-slate-500 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>;
      case 'SENDING':
        return <span className="text-[10px] text-amber-400 font-bold bg-amber-500/5 border border-amber-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Sending</span>;
      case 'SENT':
        return <span className="text-[10px] text-slate-300 font-bold bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Sent</span>;
      case 'DELIVERED':
        return <span className="text-[10px] text-teal-400 font-bold bg-teal-500/5 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Delivered</span>;
      case 'READ':
        return <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-max">Read</span>;
      case 'FAILED':
        return <span className="text-[10px] text-rose-400 font-bold bg-rose-500/5 border border-rose-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 w-max">Failed</span>;
      default:
        return <span className="text-[10px] text-slate-400 font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Accessing Campaign control Room...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardShell>
        <div className="space-y-4 max-w-md mx-auto text-center py-12">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-white">Access Failure</h2>
          <p className="text-slate-400 text-xs">{error || 'Campaign details could not be retrieved.'}</p>
          <Link 
            href="/admin/campaigns" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl hover:bg-slate-850"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Link>
        </div>
      </DashboardShell>
    );
  }

  // Progress aggregates
  const total = campaign.stats.total;
  const processed = campaign.stats.sent + campaign.stats.delivered + campaign.stats.read + campaign.stats.failed;
  const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;
  const sentAndReached = campaign.stats.sent + campaign.stats.delivered + campaign.stats.read;

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
          <div className="flex items-center space-x-3.5">
            <Link 
              href="/admin/campaigns" 
              className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-white tracking-tight">{campaign.name}</h1>
                {getStatusBadge(campaign.status)}
              </div>
              <p className="text-slate-500 text-xs mt-0.5">Template: <strong className="text-slate-300 font-mono">{campaign.templateName}</strong> ({campaign.templateLanguage})</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            {campaign.status === 'SENDING' && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-full text-[10px] font-bold text-amber-400 animate-pulse mr-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Polling live dispatches...</span>
              </div>
            )}

            {/* Play / Pause dispatches controls */}
            {campaign.status === 'DRAFT' || campaign.status === 'PAUSED' || campaign.status === 'SCHEDULED' ? (
              <button
                onClick={handleToggleSend}
                disabled={actionLoading || campaign.stats.total === 0}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-650 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/15"
              >
                <Play className="w-4 h-4 fill-slate-950/20" />
                <span>{campaign.status === 'PAUSED' ? 'Resume Send' : 'Send Campaign'}</span>
              </button>
            ) : campaign.status === 'SENDING' ? (
              <button
                onClick={handleToggleSend}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Send</span>
              </button>
            ) : null}

            {campaign.status !== 'SENDING' && (
              <button
                onClick={handleDeleteCampaign}
                disabled={actionLoading}
                className="p-2.5 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all active:scale-95"
                title="Delete Campaign"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>

        {campaign.description && (
          <div className="bg-slate-900/10 border border-slate-900/60 p-4 rounded-2xl text-xs text-slate-400">
            <span className="font-bold text-slate-300 block mb-1">Campaign Description:</span>
            {campaign.description}
          </div>
        )}

        {/* Progress bar container */}
        {campaign.status !== 'DRAFT' && (
          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Dispatch Progress</span>
              <span className="text-white font-black">{processed} / {total} recipients processed ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>{campaign.stats.pending} remaining queue tasks</span>
              <span>{progressPercent}% Complete</span>
            </div>
          </div>
        )}

        {/* Campaign specific statistical dashboard cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 text-center">
            <span className="text-slate-500 text-[10px] font-bold block uppercase tracking-wider mb-1">Target List</span>
            <span className="text-2xl font-black text-white font-mono">{total}</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 text-center">
            <span className="text-emerald-400 text-[10px] font-bold block uppercase tracking-wider mb-1">Sent</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{sentAndReached}</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 text-center">
            <span className="text-teal-400 text-[10px] font-bold block uppercase tracking-wider mb-1">Delivered</span>
            <span className="text-2xl font-black text-teal-400 font-mono">{campaign.stats.delivered + campaign.stats.read}</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 text-center">
            <span className="text-blue-400 text-[10px] font-bold block uppercase tracking-wider mb-1">Read (Open)</span>
            <span className="text-2xl font-black text-blue-400 font-mono">{campaign.stats.read}</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 text-center col-span-2 md:col-span-1">
            <span className="text-rose-450 text-[10px] font-bold block uppercase tracking-wider mb-1">Failed</span>
            <span className="text-2xl font-black text-rose-450 font-mono">{campaign.stats.failed}</span>
          </div>
        </div>

        {/* Recipients list directory & Diagnostics Logs split console panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left/Middle: Recipients List directory */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-900 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Recipients Directory</span>
                </h3>

                {/* Filter selectors */}
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-slate-800"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="SENDING">Sending</option>
                    <option value="SENT">Sent</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="READ">Read</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Search recipient customer name or number..."
                  className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-xl pl-9 pr-4 py-3 text-slate-100 text-xs focus:outline-none transition-colors"
                />
              </div>

              {/* Table */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/40 border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Client</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Timeline updates</th>
                      <th className="p-3">Meta Errors / ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {recipients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-600">
                          No recipients match search criteria
                        </td>
                      </tr>
                    ) : (
                      recipients.map(r => (
                        <tr key={r.id} className="hover:bg-slate-900/10">
                          <td className="p-3">
                            <div className="font-bold text-slate-200">{r.customer.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">+{r.customer.whatsappNumber}</div>
                          </td>
                          <td className="p-3">{getRecipientStatusBadge(r.status)}</td>
                          <td className="p-3 text-[10px] text-slate-400 font-mono space-y-0.5">
                            {r.sentAt && <div>Sent: {new Date(r.sentAt).toLocaleTimeString()}</div>}
                            {r.deliveredAt && <div>Deliv: {new Date(r.deliveredAt).toLocaleTimeString()}</div>}
                            {r.readAt && <div className="text-emerald-450">Read: {new Date(r.readAt).toLocaleTimeString()}</div>}
                            {r.failedAt && <div className="text-rose-450">Fail: {new Date(r.failedAt).toLocaleTimeString()}</div>}
                          </td>
                          <td className="p-3 max-w-[200px] truncate text-[10px]">
                            {r.status === 'FAILED' && r.errorMessage ? (
                              <span className="text-rose-400 font-semibold block whitespace-normal leading-tight" title={r.errorMessage}>{r.errorMessage}</span>
                            ) : r.wamid ? (
                              <span className="text-slate-600 font-mono select-all truncate block" title={r.wamid}>{r.wamid}</span>
                            ) : (
                              <span className="text-slate-650">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginated Footer actions */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-900">
                  <span>Page {page} of {totalPages} ({totalRecipients} total matches)</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 bg-slate-950 border border-slate-900 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 bg-slate-950 border border-slate-900 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right: Diagnostics Campaign logs console */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-emerald-400" />
              <span>Execution Logs</span>
            </h3>

            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 h-[440px] overflow-y-auto font-mono text-[10px] text-slate-400 space-y-3.5">
              {campaign.logs.length === 0 ? (
                <p className="text-slate-650 text-center py-12">No execution events logged</p>
              ) : (
                campaign.logs.map(log => (
                  <div key={log.id} className="space-y-0.5 leading-relaxed">
                    <div className="flex justify-between text-[8px] text-slate-650 font-bold border-b border-slate-900 pb-0.5">
                      <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={log.level === 'ERROR' ? 'text-rose-500' : log.level === 'WARN' ? 'text-amber-500' : 'text-emerald-500'}>{log.level}</span>
                    </div>
                    <p className={`pt-0.5 ${log.level === 'ERROR' ? 'text-rose-400 font-semibold' : log.level === 'WARN' ? 'text-amber-300' : 'text-slate-300'}`}>{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
