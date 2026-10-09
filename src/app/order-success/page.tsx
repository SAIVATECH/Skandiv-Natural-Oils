import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  Phone,
  ShieldCheck,
  Calendar,
  MapPin
} from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Order Confirmed - SKANDÍV Natural Oils',
  description: 'Thank you for your order. Your Mara Chekku cold-pressed oils are being prepared for dispatch.',
};

export default async function OrderSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams?.orderId;

  let order: any = null;
  if (orderId) {
    try {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: { product: true },
          },
          user: true,
        },
      });
    } catch (err) {
      console.error('Error fetching order for success page:', err);
    }
  }

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';
  const whatsappSupportUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hi Skandiv Natural Oils! 🌿 I have a question about my Order #${orderId ? orderId.substring(0, 8).toUpperCase() : ''}.`
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 w-full">
      
      {/* Top Banner Box */}
      <div className="bg-slate-900/80 border border-emerald-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            Payment Verified &bull; Order Received
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight pt-2">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            We have received your order. We are carefully bottling and packing your pure cold-pressed oils for dispatch.
          </p>
        </div>

        {order && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 pt-2">
            <span>Order Reference:</span>
            <span className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 font-mono text-amber-400">
              #{order.id.substring(0, 8).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* WhatsApp Notification Alert */}
      <div className="bg-[#053520]/60 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 flex-shrink-0">
            <Phone className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Live Updates via WhatsApp</h3>
            <p className="text-[11px] text-emerald-200/90 mt-0.5">
              Tracking numbers and dispatch notifications have been sent to your WhatsApp number.
            </p>
          </div>
        </div>

        <a
          href={whatsappSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-md"
        >
          Open Chat
        </a>
      </div>

      {/* Order Summary & Delivery Details Card */}
      {order && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-black text-slate-100 border-b border-slate-800 pb-3">
            Order & Shipping Breakdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <p className="text-slate-500 font-semibold">Recipient Name:</p>
              <p className="font-bold text-slate-100">{order.user.name}</p>
              <p className="text-slate-400">+{order.user.whatsappNumber}</p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-500 font-semibold">Shipping Destination:</p>
              <p className="font-bold text-slate-100 leading-relaxed">
                {order.shippingAddress || 'Standard Delivery'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-500 font-semibold">Order Date:</p>
              <p className="font-bold text-slate-100">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-500 font-semibold">Payment Status:</p>
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{order.paymentStatus} (₹{Number(order.totalAmount)})</span>
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Items Included ({order.items.length})
            </p>

            <div className="divide-y divide-slate-800/60">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-950 rounded-lg border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                      <img src={item.product?.imageUrl || '/logo.jpg'} alt={item.product?.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100">{item.product?.name}</p>
                      <p className="text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-400 font-mono">
                    ₹{Number(item.price) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm font-black text-slate-100 border-t border-slate-800 pt-3">
              <span>Grand Total Paid</span>
              <span className="text-amber-400 font-mono text-base">₹{Number(order.totalAmount)}</span>
            </div>
          </div>

        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        {order && (
          <Link
            href={`/track/${order.id}`}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all text-center shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>
        )}

        <Link
          href="/shop"
          className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center border border-slate-800 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

    </div>
  );
}
