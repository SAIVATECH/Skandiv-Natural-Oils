import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  CheckCircle2,
  Package,
  Truck,
  Clock,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Phone,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

export const revalidate = 0;

interface TrackOrderPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: TrackOrderPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const orderId = resolvedParams.orderId;
  return {
    title: `Track Order #${orderId.substring(0, 8).toUpperCase()} - SKANDÍV Natural Oils`,
  };
}

export default async function TrackOrderPage({ params }: TrackOrderPageProps) {
  const resolvedParams = await params;
  const rawId = resolvedParams.orderId.trim();

  // Find order by exact ID or partial prefix
  let order = await prisma.order.findUnique({
    where: { id: rawId },
    include: {
      items: {
        include: { product: true },
      },
      user: true,
      payments: true,
    },
  });

  if (!order) {
    // Attempt find first by prefix
    order = await prisma.order.findFirst({
      where: {
        id: { startsWith: rawId, mode: 'insensitive' },
      },
      include: {
        items: {
          include: { product: true },
        },
        user: true,
        payments: true,
      },
    });
  }

  if (!order) {
    notFound();
  }

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';
  const whatsappQueryUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hi Skandiv Natural Oils! 🌿 I am checking the status of my Order #${order.id.substring(0, 8).toUpperCase()}.`
  )}`;

  // Timeline Step Calculations
  const isPaid = order.paymentStatus === 'PAID';
  const isProcessing = order.orderStatus === 'PROCESSING' || order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED';
  const isShipped = order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED';
  const isDelivered = order.orderStatus === 'DELIVERED';
  const isCancelled = order.orderStatus === 'CANCELLED';

  const timeline = [
    {
      title: 'Order Placed',
      description: 'Your order has been registered in our system.',
      completed: true,
      current: !isPaid && !isCancelled,
      date: order.createdAt,
    },
    {
      title: 'Payment Confirmed',
      description: isPaid ? 'Razorpay payment verified securely.' : 'Awaiting payment confirmation.',
      completed: isPaid,
      current: isPaid && order.orderStatus === 'PENDING',
      date: order.payments?.[0]?.createdAt || null,
    },
    {
      title: 'Processing & Bottling',
      description: 'Cold-pressed oils are inspected, sealed, and packed.',
      completed: isProcessing,
      current: order.orderStatus === 'PROCESSING',
      date: null,
    },
    {
      title: 'Shipped & In Transit',
      description: order.trackingUrl ? 'Dispatched via courier with live tracking.' : 'Courier pickup scheduled.',
      completed: isShipped,
      current: order.orderStatus === 'SHIPPED',
      date: null,
    },
    {
      title: 'Delivered',
      description: 'Delivered safely to your destination.',
      completed: isDelivered,
      current: isDelivered,
      date: null,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/track" className="hover:text-white transition-colors">Track</Link>
            <span>/</span>
            <span className="text-amber-400">Order #{order.id.substring(0, 8).toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Order #{order.id.substring(0, 8).toUpperCase()}
            </h1>
            <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-xl ${
              isDelivered
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : isShipped
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : isCancelled
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}>
              {order.orderStatus}
            </span>
          </div>
        </div>

        <Link
          href="/shop"
          className="text-xs font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Shop More Oils</span>
        </Link>
      </div>

      {/* External Tracking Link Alert (if courier link exists) */}
      {order.trackingUrl && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-300">Carrier Shipment Dispatched</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Your parcel has been handed over to our delivery partner.
              </p>
            </div>
          </div>

          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 whitespace-nowrap"
          >
            <span>Live Courier Tracking</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Timeline Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
        <h2 className="text-lg font-black text-slate-100 border-b border-slate-800 pb-3">
          Shipment Progress Timeline
        </h2>

        <div className="space-y-6 relative pl-4 sm:pl-6 border-l-2 border-slate-800 ml-4 sm:ml-6">
          {timeline.map((step, idx) => (
            <div key={idx} className="relative group">
              
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-[25px] sm:-left-[33px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.completed
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                    : step.current
                    ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold ${step.completed || step.current ? 'text-slate-100' : 'text-slate-500'}`}>
                    {step.title}
                  </h3>
                  {step.date && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(step.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {step.description}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-black text-slate-100 border-b border-slate-800 pb-3">
          Order Summary & Shipping Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <p className="text-slate-500 font-semibold">Customer Name:</p>
            <p className="font-bold text-slate-100">{order.user.name}</p>
            <p className="text-slate-400">+{order.user.whatsappNumber}</p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-500 font-semibold">Shipping Address:</p>
            <p className="font-bold text-slate-100 leading-relaxed">
              {order.shippingAddress || 'Direct Store Delivery'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-500 font-semibold">Order Placed On:</p>
            <p className="font-bold text-slate-100">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-slate-500 font-semibold">Payment Status:</p>
            <span className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-0.5 rounded-md ${
              isPaid
                ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                : 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{order.paymentStatus}</span>
            </span>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Items in this Shipment ({order.items.length})
          </p>

          <div className="divide-y divide-slate-800/60">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-950 rounded-lg border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                    <img src={item.product?.imageUrl || '/logo.jpg'} alt={item.product?.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <Link href={`/products/${item.product?.slug}`} className="font-bold text-slate-100 hover:text-amber-400 transition-colors">
                      {item.product?.name}
                    </Link>
                    <p className="text-slate-500">Qty: {item.quantity} &times; ₹{Number(item.price)}</p>
                  </div>
                </div>
                <span className="font-bold text-amber-400 font-mono">
                  ₹{Number(item.price) * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-sm font-black text-slate-100 border-t border-slate-800 pt-3">
            <span>Grand Total</span>
            <span className="text-amber-400 font-mono text-base">₹{Number(order.totalAmount)}</span>
          </div>
        </div>

        {/* WhatsApp Help Button */}
        <div className="pt-2">
          <a
            href={whatsappQueryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#053520] hover:bg-[#064228] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-500/30"
          >
            <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
              <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
            </svg>
            <span>Ask a Question on WhatsApp</span>
          </a>
        </div>

      </div>

    </div>
  );
}
