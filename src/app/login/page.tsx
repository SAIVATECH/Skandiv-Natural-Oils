'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Smartphone,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Package,
  UserCheck,
  Sparkles
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('callbackUrl') || '';
  
  const { login, isAuthenticated, user } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN' && (!redirectUrl || redirectUrl.startsWith('/admin'))) {
        router.push('/admin');
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/account');
      }
    }
  }, [isAuthenticated, user, redirectUrl, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please verify your phone/email and password.');
        setLoading(false);
        return;
      }

      // Success
      login(data.user);
      setLoginSuccess(true);

      setTimeout(() => {
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push('/account');
        }
      }, 500);

    } catch (err: any) {
      console.error('Login error:', err);
      setError('A connection error occurred. Please check your network and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <span className="font-serif font-black text-xl text-amber-400">S</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to track orders, manage your cart, and checkout faster.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          {loginSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Signed in successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Phone or Email Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                WhatsApp Phone or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  placeholder="9876543210 or yourname@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || loginSuccess}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Sign up Link */}
          <div className="pt-2 text-center border-t border-slate-800/80 space-y-3">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link
                href={redirectUrl ? `/signup?redirect=${encodeURIComponent(redirectUrl)}` : '/signup'}
                className="text-amber-400 hover:text-amber-300 font-bold transition-colors underline underline-offset-4"
              >
                Create Free Account
              </Link>
            </p>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
              <Link href="/track" className="hover:text-slate-400 flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                <span>Track Order Without Sign In</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Value Prop Badges */}
        <div className="grid grid-cols-2 gap-3 text-center text-xs text-slate-400">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>100% Mara Chekku Pure</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Exclusive Web Discounts</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
