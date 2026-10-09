'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import {
  ShieldCheck,
  Lock,
  Truck,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    getSubtotal,
    getDiscount,
    getShippingFee,
    getGrandTotal,
    getTotalSavings,
    couponCode,
    campaignId,
    deliveryZoneName,
    updateLocationShipping,
    clearCart
  } = useCartStore();

  const { user, isAuthenticated } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();
  const totalSavings = getTotalSavings();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live recalculation of location-based delivery fee
  useEffect(() => {
    if (state || pincode) {
      updateLocationShipping(state, pincode);
    }
  }, [state, pincode, updateLocationShipping]);

  // Mandatory Login Redirect (Amazon/Flipkart flow)
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [mounted, isAuthenticated, router]);

  // Pre-fill fields if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name) setFullName(user.name);
      if (user.whatsappNumber) {
        const clean = user.whatsappNumber.replace(/\D/g, '').slice(-10);
        setWhatsappNumber(clean);
      }
      if (user.email) setEmail(user.email);
    }
  }, [isAuthenticated, user]);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (!mounted || (!isAuthenticated && mounted)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-100">Your Cart is Empty</h1>
        <p className="text-xs text-slate-400">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!whatsappNumber.trim() || whatsappNumber.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp phone number.');
      return;
    }
    if (!address.trim() || !city.trim() || !state.trim() || pincode.trim().length !== 6) {
      setErrorMessage('Please complete your full delivery address with a 6-digit Pincode.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on server side (Validates prices, reserves stock, creates Order record)
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          whatsappNumber,
          email,
          address,
          city,
          state,
          pincode,
          items: items.map(i => ({ id: i.id, quantity: i.quantity })),
          couponCode,
          campaignId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize order.');
      }

      const { orderId, amount, keyId, razorpayOrderId, mockCheckoutUrl } = data;

      // 2. Open Razorpay Checkout or fallback to mock sandbox
      if (window.Razorpay && razorpayOrderId) {
        const options = {
          key: keyId,
          amount: amount * 100,
          currency: 'INR',
          name: 'Skandiv Natural Oils',
          description: `Order #${orderId.substring(0, 8).toUpperCase()}`,
          image: '/logo.jpg',
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            setLoading(true);
            try {
              // 3. Verify Razorpay signature server-side
              const verifyRes = await fetch('/api/checkout/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (verifyRes.ok) {
                clearCart();
                router.push(`/order-success?orderId=${orderId}`);
              } else {
                const verifyData = await verifyRes.json();
                throw new Error(verifyData.error || 'Payment signature verification failed.');
              }
            } catch (vErr: any) {
              setErrorMessage(vErr.message || 'Payment verification failed');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: fullName,
            contact: whatsappNumber,
            email: email || '',
          },
          theme: {
            color: '#053520',
          },
        };

        const rzpPayment = new window.Razorpay(options);
        rzpPayment.on('payment.failed', function (response: any) {
          setErrorMessage(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        rzpPayment.open();
      } else if (mockCheckoutUrl) {
        // Mock checkout redirect in local development
        clearCart();
        window.location.href = mockCheckoutUrl;
      } else {
        // Complete mock checkout flow instantly
        const verifyRes = await fetch('/api/checkout/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            isMockSuccess: true,
          }),
        });

        if (verifyRes.ok) {
          clearCart();
          router.push(`/order-success?orderId=${orderId}`);
        } else {
          throw new Error('Failed to confirm order.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
      
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-amber-400">Checkout</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Secure Express Checkout
          </h1>
        </div>

        <Link
          href="/cart"
          className="text-xs font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Bag</span>
        </Link>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Checkout Layout Grid */}
      <form onSubmit={handleProcessPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Contact & Address Information (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Customer Details Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-100 uppercase tracking-wider">
                <User className="w-4 h-4 text-amber-500" />
                <span>1. Customer &amp; WhatsApp Details</span>
              </div>
              {isAuthenticated && user ? (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Logged in as {user.name.split(' ')[0]}</span>
                </span>
              ) : (
                <Link
                  href="/login?redirect=/checkout"
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
                >
                  Sign in for faster checkout
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Sundaram"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block flex items-center justify-between">
                  <span>WhatsApp Number *</span>
                  <span className="text-[10px] text-emerald-400">Order updates sent here</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-12 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>2. Delivery Address</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Street Address / House / Flat No. *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Door No, Street Name, Landmark..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Chennai"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Tamil Nadu"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Pincode (6 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="600001"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Order Review & Razorpay Pay Button (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-lg font-black text-slate-100 border-b border-slate-800 pb-3">
            Order Review
          </h2>

          {/* Items Summary list */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-800/60">
            {items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                    <img src={item.imageUrl || '/logo.jpg'} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity} &times; ₹{item.price}</p>
                  </div>
                </div>
                <span className="font-bold text-amber-400 font-mono">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-100 font-bold">₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Coupon Discount ({couponCode})</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <span>Delivery Fee</span>
                {deliveryZoneName && (
                  <span className="block text-[10px] text-slate-400 font-normal">
                    {deliveryZoneName}
                  </span>
                )}
              </div>
              <span className="text-slate-100 font-bold font-mono">
                ₹{shippingFee}
              </span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-100 pt-3 border-t border-slate-800">
              <span>Total Payable</span>
              <span className="text-amber-400 font-mono text-xl">₹{grandTotal}</span>
            </div>

            {totalSavings > 0 && (
              <p className="text-[11px] font-bold text-emerald-400 text-right">
                You save ₹{totalSavings} on this order!
              </p>
            )}
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{grandTotal} via Razorpay</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Razorpay 256-Bit SSL Encrypted</span>
            </span>
            <span>&bull;</span>
            <span>UPI / Cards / NetBanking</span>
          </div>

        </div>

      </form>

    </div>
  );
}
