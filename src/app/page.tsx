'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, ShieldCheck, CreditCard, Layers, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function HomePortal() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background visual flows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-48 left-10 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Content card */}
      <div className="max-w-3xl w-full text-center space-y-10 relative z-10">
        
        {/* Brand Banner */}
        <div className="space-y-4">
          <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mx-auto animate-pulse-slow">
            <Smartphone className="w-9 h-9 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none">
              SAIVATECH WABA E-Commerce Automations
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              A full-stack, production-grade conversational e-commerce engine integrating Next.js 15, Meta WhatsApp Business API, Razorpay, and Supabase.
            </p>
          </div>
        </div>

        {/* Dynamic Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          
          {/* Admin Dashboard Entry Card */}
          <Link
            href="/login"
            className="group bg-slate-900/60 hover:bg-slate-900/90 border border-slate-850 hover:border-emerald-500/30 p-6 rounded-3xl shadow-xl flex flex-col text-left space-y-4 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-extrabold text-white text-base flex items-center space-x-1">
                <span>Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Manage inventory, toggle active items, verify customer spent statistics, and trigger manual WhatsApp alerts.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold font-mono border-t border-slate-850 pt-3">
              Credentials: admin@whatsappstore.com
            </div>
          </Link>

          {/* Payment Sandbox Simulator Card */}
          <Link
            href="/checkout/mock"
            className="group bg-slate-900/60 hover:bg-slate-900/90 border border-slate-850 hover:border-indigo-500/30 p-6 rounded-3xl shadow-xl flex flex-col text-left space-y-4 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5.5 h-5.5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-extrabold text-white text-base flex items-center space-x-1">
                <span>Checkout Simulator</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </h3>
              <p className="text-xs text-slate-400 leading-normal">
                Open mock customer carts to test Razorpay webhook triggers, automatic stock decrements, and notifications.
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold font-mono border-t border-slate-850 pt-3">
              Local bypass webhook receiver
            </div>
          </Link>

        </div>

        {/* Technical stack logs */}
        <div className="max-w-xl mx-auto bg-slate-900/30 border border-slate-900 p-5 rounded-3xl space-y-3">
          <div className="flex justify-center space-x-6 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            <span className="flex items-center space-x-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> <span>Next.js 15</span></span>
            <span className="flex items-center space-x-1"><Layers className="w-3.5 h-3.5 text-blue-500" /> <span>Supabase</span></span>
            <span className="flex items-center space-x-1"><RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> <span>Meta Cloud API</span></span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-semibold font-mono border-t border-slate-850 pt-3">
              © 2026 SaivaTech. All rights reserved.
            </div>

      </div>
    </div>
  );
}
