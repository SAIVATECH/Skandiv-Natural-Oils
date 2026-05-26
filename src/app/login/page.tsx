'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('example@gmail.com');
  const [password, setPassword] = useState('secret');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulated short timeout to mimic server-side auth checking
    setTimeout(() => {
      if (email === 'info@skandiventerprises.com' && password === 'skandiv@123') {
        localStorage.setItem('isAdminAuthenticated', 'true');
        router.push('/admin');
      } else {
        setError('Invalid admin credentials. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Logo and Brand Heading */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 mx-auto animate-pulse-slow">
            <Smartphone className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight">WABA Automations</h1>
            <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Store Administration Portal</p>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white">Sign In</h2>
            <p className="text-slate-400 text-xs">Enter your store administrator account detail below</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-2xl pl-12 pr-4 text-white text-sm outline-none transition-colors"
                  placeholder="admin@whatsappstore.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-2xl pl-12 pr-4 text-white text-sm outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl text-center font-bold">
                {error}
              </div>
            )}

            {/* Login Submit Trigger */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Test Mode Credentials Helper */}
          {/* <div className="bg-slate-950 border border-slate-850/80 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 uppercase tracking-wide">
              <span>Sandbox Account Keys</span>
            </h4>
            <div className="text-[11px] text-slate-400 space-y-1 font-mono">
              <p><span className="text-slate-500 font-bold">Email:</span> admin@whatsappstore.com</p>
              <p><span className="text-slate-500 font-bold">Pass:</span> admin123</p>
            </div>
          </div> */}
         
        </div>
 <p><span className="text-slate-500 font-bold">Designed by </span>SaivaTech</p>
      </div>
    </div>
  );
}
