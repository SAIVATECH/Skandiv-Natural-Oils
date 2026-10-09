'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  LogOut,
  ShieldCheck,
  Truck,
  ExternalLink,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Settings
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'support'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && user?.whatsappNumber) {
      fetchUserOrders(user.whatsappNumber);
    }
  }, [mounted, isAuthenticated, user]);

  const fetchUserOrders = async (phone: string) => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      const clean = phone.replace(/\D/g, '');
      const res = await fetch(`/api/customer/orders?phone=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setOrdersError('Could not load orders at this moment.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  // If user is not logged in, show the Account Entrance Portal
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            Customer Account &amp; Orders
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to view your past orders, real-time live shipping status, and manage your account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
          
          {/* Sign In Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Existing Customer</span>
              <h2 className="text-xl font-bold text-slate-100">Sign In to Your Account</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log in with your WhatsApp phone number or registered email to view full order history.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Sign Up Card */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">New to Skandiv?</span>
              <h2 className="text-xl font-bold text-slate-100">Create Free Account</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enjoy 1-click WhatsApp order tracking, express checkout, and special seasonal member discounts.
              </p>
            </div>
            <Link
              href="/signup"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-black rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Guest Order Lookup Shortcut */}
        <div className="text-center pt-4">
          <Link
            href="/account/orders"
            className="text-xs text-slate-400 hover:text-amber-400 font-semibold underline underline-offset-4 transition-colors"
          >
            Looking to look up an order by phone without signing in? Click here
          </Link>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  const formatCurrency = (val: number | string) => `₹${Number(val).toLocaleString('en-IN')}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Customer Header Banner */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                {user.name || 'Customer'}
              </h1>
              {user.role === 'ADMIN' && (
                <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-500/30">
                  ADMIN
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+{user.whatsappNumber}</span>
              </span>
              {user.email && (
                <>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>{user.email}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:self-center">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
            activeTab === 'support'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>WhatsApp Support</span>
        </button>
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              <p className="text-xs text-slate-400">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">No orders found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven&apos;t placed any orders yet. Discover our pure Mara Chekku cold-pressed oils today.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div
                    key={order.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 hover:border-slate-700 transition-colors"
                  >
                    {/* Top Row: ID, Date, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">Order ID:</span>
                          <span className="text-xs font-mono font-bold text-amber-400">{order.id}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Placed on {orderDate}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            order.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : order.orderStatus === 'SHIPPED'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : order.orderStatus === 'PROCESSING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {order.orderStatus}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Items */}
                    <div className="space-y-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="font-semibold text-slate-200">
                              {item.product?.name || 'Product'} &times; {item.quantity}
                            </span>
                          </div>
                          <span className="font-mono text-slate-300 font-bold">
                            {formatCurrency(Number(item.price) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Row: Total & Track CTA */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                      <div>
                        <span className="text-xs text-slate-400">Total Paid: </span>
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/track/${order.id}`}
                          className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Delivery</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-100">Account &amp; Personal Info</h2>
          
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Full Name</span>
                <p className="text-slate-100 font-semibold text-sm">{user.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold text-[10px]">WhatsApp Phone</span>
                <p className="text-slate-100 font-semibold text-sm font-mono">+{user.whatsappNumber}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Email Address</span>
                <p className="text-slate-100 font-semibold text-sm">{user.email || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Account Role</span>
                <p className="text-emerald-400 font-semibold text-sm uppercase">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUPPORT */}
      {activeTab === 'support' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">Direct Customer Concierge</h2>
            <p className="text-xs text-slate-400">
              Need assistance with an ongoing Mara Chekku oil shipment or bulk enquiry? Reach out directly via WhatsApp.
            </p>
          </div>

          <a
            href="https://wa.me/919342365917?text=Hi%20Skandiv%2C%20I%20need%20assistance%20with%20my%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#053520] hover:bg-[#064228] text-white font-bold rounded-2xl border border-emerald-500/40 text-xs shadow-lg transition-all"
          >
            <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
              <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
            </svg>
            <span>Message Support on WhatsApp</span>
          </a>
        </div>
      )}

    </div>
  );
}
