'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';
import { Menu, X, User, Bell, Activity, RefreshCw } from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client-side authentication check
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
    setLoading(false);
  }, [router]);

  // Translate pathname to clean human readable titles
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard Overview';
    if (pathname === '/admin/products') return 'Product Catalog';
    if (pathname === '/admin/orders') return 'Order Transactions';
    if (pathname === '/admin/customers') return 'Customer Directory';
    if (pathname === '/admin/chat') return 'Live Customer Chat';
    if (pathname === '/admin/campaigns') return 'Marketing Campaigns';
    if (pathname === '/admin/campaigns/new') return 'New Marketing Campaign';
    if (pathname === '/admin/campaigns/settings') return 'Campaign Settings';
    if (pathname.startsWith('/admin/campaigns/') && pathname !== '/admin/campaigns/new' && pathname !== '/admin/campaigns/settings') return 'Campaign Control Panel';
    if (pathname === '/admin/analytics') return 'Analytics & Insights';
    if (pathname === '/admin/settings') return 'Platform Settings';
    return 'Admin Panel';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Verifying session...</p>
      </div>
    );
  }

  if (!authorized) {
    return null; // Don't render dashboard if unauthorized
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      
      {/* 1. DESKTOP SIDEBAR (Static on left) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* 2. MOBILE DRAWER SIDEBAR (Slide-over sheet) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay background filter */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sliding panel contents */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800 animate-slide-in">
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 text-slate-400 active:scale-95"
              >
                <X className="w-5 h-5 text-slate-100" />
              </button>
            </div>
            <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between bg-slate-900/40 backdrop-blur-md border-b border-slate-900 px-6 z-20">
          
          {/* Left part: Mobile Menu Trigger + Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black tracking-tight text-slate-100 hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>

          {/* Right part: System Health Badge, Bell, Profile */}
          <div className="flex items-center space-x-4">
            
            {/* System status badge */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-full text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-[10px]">Meta Sandbox:</span>
              <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Connected</span>
            </div>

            {/* Notification trigger */}
            <button className="relative w-10 h-10 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
            </button>

            {/* Admin Badge */}
            <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800/60 p-1.5 pr-3.5 rounded-2xl">
              <div className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-100 leading-none">Admin Owner</p>
                <span className="text-[9px] text-slate-500 font-semibold font-mono">Store Manager</span>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic page content scroll wrapper */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 relative">
          {children}
        </main>

      </div>
    </div>
  );
}
