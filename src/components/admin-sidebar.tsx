'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Smartphone,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Simulator', href: '/admin/simulator', icon: Smartphone },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Orders', href: '/admin/orders', icon: Receipt },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },

  ];

  const handleLogout = () => {
    // Clear cookies/localStorage and redirect to login
    localStorage.removeItem('isAdminAuthenticated');
    if (onCloseMobile) onCloseMobile();
    router.push('/login');
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-3">
        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Smartphone className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-white leading-none tracking-wide text-sm">WABA STORE</h1>
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Automations</span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group active:scale-[0.98] ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Action footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all duration-200 active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
