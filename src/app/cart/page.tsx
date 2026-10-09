'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Lock,
  Droplet
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getDiscount,
    getShippingFee,
    getGrandTotal,
    getTotalSavings,
    couponCode,
    applyCoupon,
    removeCoupon
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();
  const totalSavings = getTotalSavings();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const res = await applyCoupon(couponInput.trim());
      setCouponMsg(res);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';
  const generateWhatsAppOrderText = () => {
    const itemList = items
      .map((item, idx) => `${idx + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`)
      .join('\n');

    return `Hi Skandiv Natural Oils! 🌿 I would like to place an order for:\n\n${itemList}\n\n*Total Amount:* ₹${grandTotal}\n\nPlease share payment link & address confirmation.`;
  };

  const whatsappCheckoutUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(generateWhatsAppOrderText())}`;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-500 mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Your Shopping Cart is Empty
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
            You haven&apos;t added any pure cold-pressed organic oils yet. Discover our Mara Chekku products and enjoy natural vitality.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/shop"
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/10"
          >
            Explore Catalog
          </Link>
          <Link
            href="/"
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-800"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
      
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-amber-400">Shopping Cart</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Review Your Shopping Bag ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      {/* Express Delivery Notice Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between text-xs font-bold">
        <span className="flex items-center gap-2 text-amber-400">
          <Truck className="w-4 h-4 text-amber-400" />
          <span>⚡ <strong>Express Safe Delivery:</strong> ₹49 flat courier fee per order across India.</span>
        </span>
        <span className="text-slate-400 font-mono">Standard ₹49</span>
      </div>

      {/* Main Grid: Items List (7 cols) + Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items Table / Cards */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 divide-y divide-slate-800/80">
          {items.map((item) => (
            <div key={item.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Product Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-20 h-20 bg-slate-950 rounded-2xl border border-slate-800 p-2 flex items-center justify-center flex-shrink-0">
                  <img
                    src={item.imageUrl || '/logo.jpg'}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    {item.category}
                  </span>
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm sm:text-base font-black text-slate-100 hover:text-amber-400 transition-colors block line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Unit Price: <strong className="text-slate-200">₹{item.price}</strong>
                  </p>
                </div>
              </div>

              {/* Quantity Controller & Price */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                
                <div className="flex items-center border border-slate-800 bg-slate-950 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <span className="text-base font-black text-amber-400">
                    ₹{item.price * item.quantity}
                  </span>
                  {item.mrp && item.mrp > item.price && (
                    <span className="block text-[10px] text-slate-500 line-through">
                      ₹{item.mrp * item.quantity}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="Remove from Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>

            </div>
          ))}

          <div className="pt-4 flex justify-between items-center">
            <Link
              href="/shop"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right: Summary Card */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <h2 className="text-lg font-black text-slate-100 border-b border-slate-800 pb-3">
            Order Summary
          </h2>

          {/* Coupon Box */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Promo / Discount Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="e.g. SKANDIV10"
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 uppercase tracking-wider focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Apply
              </button>
            </div>

            {couponMsg && (
              <p className={`text-[11px] font-semibold flex items-center gap-1 ${couponMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {couponMsg.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{couponMsg.message}</span>
              </p>
            )}

            {couponCode && (
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1.5 rounded-xl">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Code <strong>{couponCode}</strong> applied</span>
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-slate-400 hover:text-rose-400 text-[10px] underline"
                >
                  Remove
                </button>
              </div>
            )}
          </form>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs text-slate-400 border-t border-slate-800 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-100 font-bold">₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Coupon Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Delivery</span>
              <span className={shippingFee === 0 ? 'text-emerald-400 font-bold' : 'text-slate-100 font-bold'}>
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
              </span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-100 pt-3 border-t border-slate-800">
              <span>Grand Total</span>
              <span className="text-amber-400 font-mono text-xl">₹{grandTotal}</span>
            </div>

            {totalSavings > 0 && (
              <p className="text-[11px] font-bold text-emerald-400 text-right">
                🎉 Total savings on this order: ₹{totalSavings}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Link
              href={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={whatsappCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#053520] hover:bg-[#064228] text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 border border-emerald-500/40 shadow-lg shadow-emerald-950/30 active:scale-95"
            >
              <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
              </svg>
              <span>Instant WhatsApp Checkout</span>
            </a>
          </div>

          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit SSL Encrypted</span>
            </span>
            <span>&bull;</span>
            <span>Razorpay Verified</span>
          </div>

        </div>

      </div>

    </div>
  );
}
