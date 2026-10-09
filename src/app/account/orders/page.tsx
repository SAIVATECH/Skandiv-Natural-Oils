'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Phone,
  Search,
  ArrowRight,
  ShieldCheck,
  Truck,
  ExternalLink,
  ShoppingBag,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AccountOrdersPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp phone number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/customer/orders?phone=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to lookup account.');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
      
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-amber-400">Order History & Tracking</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Customer Orders & Tracking Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Look up all your past and active orders using your registered WhatsApp phone number.
        </p>
      </div>

      {/* Phone Lookup Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-xl mx-auto">
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Registered WhatsApp Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                placeholder="9876543210"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Orders...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>View Order History</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 pt-4 animate-in fade-in duration-300">
          {!result.found || result.orders.length === 0 ? (
            <div className="py-12 bg-slate-900/40 border border-slate-800 rounded-3xl text-center space-y-3">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No Orders Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We couldn&apos;t find any orders placed with this phone number. Have you placed an order with a different contact number?
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-100">
                    Welcome back, {result.customer.name || 'Valued Customer'}!
                  </h3>
                  <p className="text-xs text-slate-400">
                    Found {result.orders.length} {result.orders.length === 1 ? 'order' : 'orders'} registered to +{result.customer.whatsappNumber}
                  </p>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-xl">
                  {result.orders.length} Total Orders
                </span>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {result.orders.map((order: any) => (
                  <div
                    key={order.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-100">
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}>
                          {order.paymentStatus}
                        </span>

                        <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-950 text-slate-300 border border-slate-800">
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="divide-y divide-slate-800/60">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-950 rounded-lg border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                              <img src={item.product?.imageUrl || '/logo.jpg'} alt={item.product?.name} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-100">{item.product?.name}</p>
                              <p className="text-slate-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-bold text-amber-400 font-mono">
                            ₹{Number(item.price) * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-800/80 pt-3 gap-3">
                      <div>
                        <span className="text-xs text-slate-500">Grand Total: </span>
                        <strong className="text-sm font-black text-amber-400 font-mono">₹{Number(order.totalAmount)}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                          >
                            <span>Carrier Tracking</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <Link
                          href={`/track/${order.id}`}
                          className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <span>Live Timeline</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
