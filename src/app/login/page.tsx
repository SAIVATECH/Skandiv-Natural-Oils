'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid admin credentials. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login authentication error:', err);
      setError('A connection error occurred. Please check your network and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Brand Logo and Title */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-slate-850 p-0.5 shadow-2xl flex items-center justify-center hover:rotate-3 transition-transform duration-300">
            <img 
              src="/logo.jpg" 
              alt="Skandiv Natural Oils Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="text-center space-y-0.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center justify-center space-x-1.5 leading-none">
              <span className="font-serif bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">SKANDÍV</span>
            </h1>
            <p className="text-[10px] text-amber-600 font-bold tracking-widest uppercase leading-none">Natural Oils</p>
            <p className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider pt-2 leading-none">Store Administration Portal</p>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-850 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="space-y-1 border-b border-slate-850 pb-4">
            <h2 className="text-xl font-bold text-slate-100 font-serif">Sign In</h2>
            <p className="text-slate-500 text-xs">Enter your store administrator account detail below</p>
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
                  className="w-full h-12 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-2xl pl-12 pr-4 text-slate-100 text-sm outline-none transition-colors placeholder:text-slate-500"
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
                  className="w-full h-12 bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-2xl pl-12 pr-4 text-slate-100 text-sm outline-none transition-colors placeholder:text-slate-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl text-center font-bold">
                {error}
              </div>
            )}

            {/* Login Submit Trigger */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-100 font-extrabold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-100" />
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] text-slate-100" />
                </>
              )}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-500 font-semibold tracking-wide">
          Designed by <span className="font-serif text-slate-400 hover:text-emerald-700 transition-colors">SaivaTech</span>
        </p>
      </div>
    </div>
  );
}
