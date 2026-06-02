'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  Settings,
  ShieldAlert,
  Save,
  Loader2,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Key,
  MessageSquare,
  Globe
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [sandboxMode, setSandboxMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Settings mock fields
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_5n4F9kM8L0wO3p');
  const [whatsappPhoneId, setWhatsappPhoneId] = useState('123456789012345');
  const [whatsappVerifyToken, setWhatsappVerifyToken] = useState('mock_verify_token_secure123');
  const [whatsappAccessToken, setWhatsappAccessToken] = useState('EAAG...mocktoken');
  const [storeAddress, setStoreAddress] = useState('Smart Store Warehouse, New Delhi, India');

  useEffect(() => {
    // Read cached checkout mode on mount
    const savedMode = localStorage.getItem('razorpay_sandbox_bypass');
    setSandboxMode(savedMode === 'true' || savedMode === null);
  }, []);

  const handleToggleSandbox = () => {
    const nextVal = !sandboxMode;
    setSandboxMode(nextVal);
    localStorage.setItem('razorpay_sandbox_bypass', String(nextVal));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3050);
    }, 800);
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl space-y-6">
        
        {/* 1. MOCK CHECKOUT BYPASS WARNING BANNER */}
        <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start space-x-3.5">
            <ShieldAlert className="w-6 h-6 text-emerald-400 mt-1 md:mt-0 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-slate-100 text-sm">Simulated Razorpay Checkout Sandbox</h4>
              <p className="text-xs text-slate-400">
                Generate local checkout pages instead of real Razorpay payment links for local developer testing.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleSandbox}
            className="flex items-center space-x-2 bg-slate-950 border border-slate-850 px-4 py-2 rounded-2xl transition-colors active:scale-95 text-xs font-bold"
          >
            {sandboxMode ? (
              <>
                <ToggleRight className="w-6 h-6 text-emerald-400" />
                <span className="text-emerald-400">SIMULATOR ACTIVE</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-6 h-6 text-slate-500" />
                <span className="text-slate-500">LIVE CREDENTIALS</span>
              </>
            )}
          </button>
        </div>

        {/* 2. CREDENTIALS AND SETTINGS FORM */}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Razorpay details card */}
          <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Key className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Razorpay Payment Integrations</h4>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Key ID (Test/Live)</label>
                <input
                  type="text"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-slate-100 font-mono outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Key Secret</label>
                <input
                  type="password"
                  value="••••••••••••••••••••"
                  disabled
                  className="w-full h-11 bg-slate-950/70 border border-slate-850 text-slate-500 font-mono rounded-xl px-4 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Meta WhatsApp details card */}
          <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Key className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Meta WhatsApp Cloud API</h4>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number ID</label>
                <input
                  type="text"
                  value={whatsappPhoneId}
                  onChange={(e) => setWhatsappPhoneId(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-slate-100 font-mono outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Webhook Verify Token</label>
                <input
                  type="text"
                  value={whatsappVerifyToken}
                  onChange={(e) => setWhatsappVerifyToken(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-slate-100 font-mono outline-none"
                />
              </div>
            </div>
          </div>

          {/* Store general configurations */}
          <div className="md:col-span-2 bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Store Logistics Operations</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fulfillment Center Address</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-xl px-4 text-slate-100 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Currency</label>
                <input
                  type="text"
                  value="INR (₹) Indian Rupee"
                  disabled
                  className="w-full h-11 bg-slate-950/70 border border-slate-850 text-slate-500 rounded-xl px-4 outline-none cursor-not-allowed font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Automated Text Previews */}
          <div className="md:col-span-2 bg-slate-900/60 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Automated Conversational Templates</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Catalogue Welcome Message */}
              <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 space-y-2 text-xs">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Template 1: Welcome Catalog</p>
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 text-emerald-400 font-mono text-[10px] whitespace-pre-line leading-relaxed">
                  {`Welcome to our Smart Store! 🛍️

Explore our premium catalog below. To purchase an item, reply with its code word (e.g. *headphones* or *keyboard*):

1. *Wireless Noise-Canceling Headphones*
💰 Price: ₹8,999.00
👉 Reply: *headphones*`}
                </div>
              </div>

              {/* Paid Confirmation Message */}
              <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 space-y-2 text-xs">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Template 2: Payment Confirmed</p>
                <div className="bg-slate-900 border border-slate-850 rounded-xl p-3 text-emerald-400 font-mono text-[10px] whitespace-pre-line leading-relaxed">
                  {`💳 *Payment Verified!*
----------------------------------
Thank you! Your payment of *₹8,999.00* has been successfully processed.

📦 *Order ID:* #ORD-8A9F
🚚 *Shipment Status:* Processing

You can monitor your package live at any time using this tracking link:
🔗 http://localhost:3000/orders/1234/track`}
                </div>
              </div>

            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="md:col-span-2 flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            {success && (
              <div className="text-xs text-emerald-400 font-bold flex items-center space-x-1.5 mr-2 animate-bounce">
                <CheckCircle className="w-4 h-4" />
                <span>Configuration changes updated!</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 rounded-xl text-xs flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </DashboardShell>
  );
}
