'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  ArrowRight,
  ShieldCheck,
  Truck,
  Phone
} from 'lucide-react';

export default function TrackSearchPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderId.trim().replace(/^#/, '');
    if (!cleanId) {
      setError('Please enter a valid Order ID.');
      return;
    }
    router.push(`/track/${encodeURIComponent(cleanId)}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8 w-full text-center">
      
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
        <Package className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Enter the Order Reference ID from your confirmation message or email to check real-time shipment status.
        </p>
      </div>

      {/* Tracking Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto text-left space-y-4">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Order ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. 7f8a9b2c or full order uuid..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Track Live Shipment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Forgot your Order ID?</span>
          <Link href="/account/orders" className="text-amber-400 hover:underline font-bold">
            Lookup with Phone Number &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
}
