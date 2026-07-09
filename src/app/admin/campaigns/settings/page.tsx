'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  ArrowLeft,
  Settings,
  ShieldAlert,
  Save,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function CampaignSettingsPage() {
  const router = useRouter();

  // Settings form states
  const [dailyCap, setDailyCap] = useState(1000);
  const [monthlyCap, setMonthlyCap] = useState(30000);
  const [rateLimit, setRateLimit] = useState(60);

  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/campaigns/settings')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setDailyCap(data.dailyCap);
          setMonthlyCap(data.monthlyCap);
          setRateLimit(data.campaignRateLimitPerMin);
        }
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        setError('Failed to fetch settings from server');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError(null);

    const payload = {
      dailyCap,
      monthlyCap,
      campaignRateLimitPerMin: rateLimit
    };

    try {
      const res = await fetch('/api/campaigns/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to update campaign settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success alert after 3 seconds
    } catch (err: any) {
      setError(err.message || 'Something went wrong while saving settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center space-y-2">
            <Settings className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">Synchronizing safety configs...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-2xl mx-auto">
        
        {/* Header toolbar */}
        <div className="flex items-center space-x-3 pb-2 border-b border-slate-900">
          <Link 
            href="/admin/campaigns" 
            className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <p className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-widest">Global Caps</p>
            <h1 className="text-xl font-black text-white tracking-tight">Campaign Limits & Settings</h1>
          </div>
        </div>

        {/* Alerts and confirmation messages */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-semibold animate-slide-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p>Campaign limit configurations updated successfully!</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-semibold">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Configuration settings form */}
        <form onSubmit={handleSaveSettings} className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-6 shadow-xl">
          
          <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider border-b border-slate-900 pb-3 mb-2">
            <ShieldAlert className="w-4.5 h-4.5 text-emerald-400" />
            <span>Messaging Safety Guardrails</span>
          </div>

          {/* Daily message cap */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold block">Daily Message Cap</label>
            <input 
              type="number" 
              value={dailyCap}
              onChange={e => setDailyCap(Math.max(1, parseInt(e.target.value) || 0))}
              min={1}
              className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500 leading-relaxed block">
              Limits the maximum number of campaign messages sent within any single 24-hour UTC window. Prevents sudden spam flags.
            </span>
          </div>

          {/* Monthly message cap */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold block">Monthly Message Cap</label>
            <input 
              type="number" 
              value={monthlyCap}
              onChange={e => setMonthlyCap(Math.max(1, parseInt(e.target.value) || 0))}
              min={1}
              className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500 leading-relaxed block">
              Monthly dispatch limit bounds. Helps budget API usage and control billing costs.
            </span>
          </div>

          {/* Rate limits settings */}
          <div className="space-y-2">
            <label className="text-slate-400 text-xs font-bold block">Campaign Rate Limit (Messages / Min)</label>
            <input 
              type="number" 
              value={rateLimit}
              onChange={e => setRateLimit(Math.max(1, parseInt(e.target.value) || 0))}
              min={1}
              className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none transition-colors"
            />
            <span className="text-[10px] text-slate-500 leading-relaxed block">
              Governs message dispatch frequency. A limit of 60 ensures a 1-second delay between consecutive Meta API calls, preventing rate-limiting blocks.
            </span>
          </div>

          {/* Warning notice panel */}
          <div className="bg-amber-500/5 border border-amber-500/15 p-4.5 rounded-2xl flex items-start gap-3 text-amber-300 text-[11px] leading-relaxed">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
            <div>
              <span className="font-bold block text-white mb-0.5">API Rate limits and Meta Account Rules</span>
              Meta restricts template sending rates based on your WhatsApp Business phone number quality score and tier rating. Ensure you match local regulatory guidelines to avoid account bans.
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-slate-900 pt-5 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Settings...' : 'Save Settings'}</span>
            </button>
          </div>

        </form>

      </div>
    </DashboardShell>
  );
}
