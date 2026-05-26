'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, CheckCircle, XCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

function CheckoutMockContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [amount, setAmount] = useState(searchParams.get('amount') || '0');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [autoSettingUp, setAutoSettingUp] = useState(!searchParams.get('orderId'));

  useEffect(() => {
    const autoSetup = async () => {
      const qOrderId = searchParams.get('orderId');
      if (qOrderId) {
        setOrderId(qOrderId);
        setAmount(searchParams.get('amount') || '0');
        setPhone(searchParams.get('phone') || '');
        setAutoSettingUp(false);
        return;
      }

      console.log('[Mock Checkout] No orderId query parameter. Auto-fetching latest pending order...');
      try {
        const res = await fetch('/api/orders?paymentStatus=PENDING');
        if (res.ok) {
          const orders = await res.json();
          if (orders.length > 0) {
            const latest = orders[0];
            setOrderId(latest.id);
            setAmount(String(latest.totalAmount));
            setPhone(latest.user?.whatsappNumber || '');
            router.replace(`/checkout/mock?orderId=${latest.id}&amount=${latest.totalAmount}&phone=${latest.user?.whatsappNumber || ''}`);
            setAutoSettingUp(false);
            return;
          }
        }

        console.log('[Mock Checkout] No pending orders in DB. Auto-generating a dummy pending order...');
        const createRes = await fetch('/api/orders', { method: 'POST' });
        if (createRes.ok) {
          const newOrder = await createRes.json();
          setOrderId(newOrder.id);
          setAmount(String(newOrder.totalAmount));
          setPhone(newOrder.user?.whatsappNumber || '');
          router.replace(`/checkout/mock?orderId=${newOrder.id}&amount=${newOrder.totalAmount}&phone=${newOrder.user?.whatsappNumber || ''}`);
        } else {
          throw new Error('Failed to auto-create dummy pending order.');
        }
      } catch (err: any) {
        console.error('[Mock Checkout Error]', err);
        setErrorMessage('Failed to initialize a simulation checkout order. Please check console logs.');
      } finally {
        setAutoSettingUp(false);
      }
    };

    autoSetup();
  }, [searchParams, router]);

  const handlePayment = async (success: boolean) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        entity: 'event',
        account_id: 'acc_mock_12345',
        event: success ? 'payment_link.paid' : 'payment_link.cancelled',
        payload: {
          payment_link: {
            entity: {
              id: `plink_mock_${Math.random().toString(36).substring(2, 9)}`,
              reference_id: orderId,
              amount: Math.round(parseFloat(amount) * 100),
              status: success ? 'paid' : 'cancelled',
            },
          },
          payment: success
            ? {
                entity: {
                  id: `pay_mock_${Math.random().toString(36).substring(2, 9)}`,
                  amount: Math.round(parseFloat(amount) * 100),
                  status: 'captured',
                  method: 'upi',
                  email: 'customer@whatsappstore.com',
                  contact: phone.replace('whatsapp:', ''),
                },
              }
            : null,
        },
      };

      const response = await fetch('/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'mock_signature_bypass', // Webhook bypass for mock keys
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to process webhook simulation.');
      }

      setStatus(success ? 'success' : 'failed');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during payment processing.');
    } finally {
      setLoading(false);
    }
  };

  if (autoSettingUp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
          <h1 className="text-xl font-bold text-slate-100">Preparing Payment Simulation...</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Locating or creating pending orders in database</p>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-bold">Checkout Setup Failed</h1>
          <p className="text-slate-400 text-sm">We could not locate or auto-generate a pending order. Please verify that your Supabase database is connected and active.</p>
          {errorMessage && <p className="text-rose-400 text-xs font-semibold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{errorMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Card Frame */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-emerald-400 font-bold text-sm tracking-wider uppercase">Razorpay Sandbox</h2>
                <p className="text-white text-xs font-mono">Simulated Payment Link</p>
              </div>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Test Mode</span>
            </div>
          </div>

          {status === 'idle' && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Order ID</span>
                  <span className="text-white font-mono font-semibold">{orderId.substring(0, 16)}...</span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-800/60 pb-2">
                  <span className="text-slate-400">Customer Phone</span>
                  <span className="text-white font-mono">{phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-slate-300 text-sm font-semibold">Amount Due</span>
                  <span className="text-2xl font-black text-white">₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handlePayment(true)}
                  disabled={loading}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Simulate Successful Payment</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handlePayment(false)}
                  disabled={loading}
                  className="w-full h-12 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Simulate Failed Payment</span>
                    </>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-xs text-center font-semibold">
                  {errorMessage}
                </div>
              )}

              <p className="text-[10px] text-center text-slate-500 italic">
                This transaction is secure and runs locally. Outgoing confirmation templates will be sent to the WhatsApp handler simulating webhook callback response logs.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner shadow-emerald-500/10">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Payment Successful</h3>
                <p className="text-slate-400 text-xs px-4">
                  Webhook payload successfully processed! The order status has been updated to **PROCESSING** and order notification sent.
                </p>
              </div>
              <button
                onClick={() => router.push('/admin/orders')}
                className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors pt-2"
              >
                <span>Go to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner shadow-rose-500/10">
                <XCircle className="w-10 h-10 text-rose-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Payment Cancelled</h3>
                <p className="text-slate-400 text-xs px-4">
                  You simulated a failed or cancelled transaction. Conversation state has been preserved. The user can retry payment from their WhatsApp thread.
                </p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors pt-2"
              >
                <span>Retry Sandbox Flow</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function CheckoutMockPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    }>
      <CheckoutMockContent />
    </Suspense>
  );
}
