'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  whatsappPhone?: string;
}

export function CartDrawer({ whatsappPhone = '919342365917' }: CartDrawerProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    isCartOpen,
    setCartOpen,
    removeItem,
    updateQuantity,
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
  const [couponMessage, setCouponMessage] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();
  const totalSavings = getTotalSavings();

  const freeShippingThreshold = 499;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    setCouponMessage(res);
  };

  // Construct WhatsApp checkout prefilled message
  const generateWhatsAppOrderText = () => {
    const itemList = items
      .map((item, idx) => `${idx + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`)
      .join('\n');

    return `Hi Skandiv Natural Oils! 🌿 I would like to place an order for the following items:\n\n${itemList}\n\n*Subtotal:* ₹${subtotal}\n*Shipping:* ${shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}\n*Total Amount:* ₹${grandTotal}\n\nPlease share payment & delivery confirmation details.`;
  };

  const whatsappCheckoutUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(generateWhatsAppOrderText())}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-900 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-100 leading-none">Your Cart</h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in bag
                </p>
              </div>
            </div>

            <button
              onClick={() => setCartOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-4 sm:px-6 py-3 bg-emerald-950/30 border-b border-emerald-900/40">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <Truck className="w-4 h-4 text-emerald-400" />
                {amountNeededForFreeShipping === 0 ? (
                  <span>🎉 Congratulations! You have unlocked <strong>FREE Express Delivery</strong></span>
                ) : (
                  <span>Add <strong className="text-amber-400">₹{amountNeededForFreeShipping}</strong> more for <strong>FREE Delivery</strong></span>
                )}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-slate-900/80">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">Your shopping bag is empty</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Explore our traditional cold-pressed natural oils and add them to your cart.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={() => setCartOpen(false)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={item.imageUrl || '/logo.jpg'}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="text-xs font-bold text-slate-100 hover:text-amber-400 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-400 transition-colors ml-2"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-slate-800 bg-slate-900 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-black text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-black text-amber-400">
                          ₹{item.price * item.quantity}
                        </span>
                        {item.mrp && item.mrp > item.price && (
                          <span className="block text-[10px] text-slate-400 line-through">
                            ₹{item.mrp * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-900 bg-slate-950 space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon Code (e.g. SKANDIV10)"
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 uppercase tracking-wider focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-400 border border-slate-800 font-bold text-xs rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className={`text-[11px] font-semibold flex items-center gap-1 ${couponMessage.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {couponMessage.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{couponMessage.message}</span>
                  </p>
                )}
                {couponCode && (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
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
              <div className="space-y-1.5 text-xs font-medium border-t border-slate-900 pt-3 text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-bold">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className={shippingFee === 0 ? 'text-emerald-400 font-bold' : 'text-slate-200 font-bold'}>
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-100 pt-2 border-t border-slate-900">
                  <span>Total Amount</span>
                  <span className="text-amber-400">₹{grandTotal}</span>
                </div>
                {totalSavings > 0 && (
                  <p className="text-[11px] text-emerald-400 font-bold text-right">
                    You save ₹{totalSavings} on this order!
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
                  onClick={() => setCartOpen(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99]"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={whatsappCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#053520] hover:bg-[#064228] text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-500/30 active:scale-[0.99]"
                >
                  <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
                    <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
                  </svg>
                  <span>Quick WhatsApp Checkout</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit SSL Secure</span>
                </span>
                <span>&bull;</span>
                <span>Razorpay Verified</span>
                <span>&bull;</span>
                <span>100% Purity Guarantee</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
