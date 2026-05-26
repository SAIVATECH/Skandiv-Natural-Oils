'use client';

import React, { use, useEffect, useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  trackingUrl: string | null;
  razorpayPaymentId: string | null;
  shippingAddress: string | null;
  createdAt: string;
  user: {
    name: string | null;
    whatsappNumber: string;
  };
  items: OrderItem[];
}

export default function OrderTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        // We query the api/orders search endpoint with our specific order uuid
        const res = await fetch(`/api/orders?search=${id}`);
        if (!res.ok) throw new Error('Order not found');
        
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Find the precise order matching our ID
          const foundOrder = data.find((o: Order) => o.id.toLowerCase() === id.toLowerCase());
          if (foundOrder) {
            setOrder(foundOrder);
            setError(null);
          } else {
            throw new Error('Order not found');
          }
        } else {
          throw new Error('No order found with this ID');
        }
      } catch (err: any) {
        console.error('Failed to fetch order tracking status:', err);
        setError(err.message || 'We could not load your order details. Please verify your link.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Stepper helper
  const getStepStatus = (step: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED') => {
    if (!order) return 'upcoming';
    
    if (order.orderStatus === 'CANCELLED') {
      return 'cancelled';
    }

    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(order.orderStatus);
    const stepIndex = statusOrder.indexOf(step);

    if (stepIndex === currentIndex) return 'active';
    if (stepIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  const getStepIcon = (step: string, status: string) => {
    const baseClass = "w-6 h-6";
    if (status === 'completed') return <CheckCircle className={`${baseClass} text-emerald-400`} />;
    if (status === 'cancelled') return <AlertCircle className={`${baseClass} text-rose-500`} />;
    
    switch (step) {
      case 'PENDING':
        return <Clock className={`${baseClass} ${status === 'active' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />;
      case 'PROCESSING':
        return <Package className={`${baseClass} ${status === 'active' ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />;
      case 'SHIPPED':
        return <Truck className={`${baseClass} ${status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`} />;
      case 'DELIVERED':
        return <CheckCircle className={`${baseClass} ${status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`} />;
      default:
        return <Package className={`${baseClass} text-slate-500`} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const steps: Array<'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'> = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED'
  ];

  const stepLabels = {
    PENDING: { title: 'Order Confirmed', desc: 'Awaiting shipping preparation' },
    PROCESSING: { title: 'Processing', desc: 'Packing your premium items' },
    SHIPPED: { title: 'Dispatched', desc: 'On its way to your destination' },
    DELIVERED: { title: 'Delivered', desc: 'Enjoy your new purchase!' }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-start py-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background visual gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl z-10 space-y-6">
        
        {/* Header navigation bar */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 border border-slate-850 px-4 py-2 rounded-2xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Store Front</span>
          </Link>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Tracking</span>
          </div>
        </div>

        {loading ? (
          <div className="bg-slate-900/50 border border-slate-850 p-20 rounded-[32px] backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving order details...</p>
          </div>
        ) : error || !order ? (
          <div className="bg-slate-900/50 border border-slate-850 p-12 rounded-[32px] backdrop-blur-xl shadow-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
            <div>
              <h3 className="font-extrabold text-white text-lg">Unable to locate order</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">{error || 'This order does not appear to exist. Please verify the URL link from your WhatsApp message.'}</p>
            </div>
            <Link 
              href="/" 
              className="inline-block bg-slate-950 border border-slate-800 hover:border-emerald-500/30 text-xs font-black px-6 py-3 rounded-2xl text-slate-300 hover:text-white transition-colors"
            >
              Back to Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. Main Tracking Summary Card */}
            <div className="bg-slate-900/50 border border-slate-850 rounded-[32px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
              
              {/* Order Reference Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-850">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Order Ledger</span>
                  <h2 className="font-black text-white text-xl flex items-center space-x-2">
                    <span>Order #{order.id.substring(0, 8).toUpperCase()}</span>
                  </h2>
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Spent</span>
                  <span className="text-xl font-black text-emerald-400">{formatCurrency(order.totalAmount)}</span>
                  <span className="text-[10px] text-emerald-500/80 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full block mt-1">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Cancelled Notification */}
              {order.orderStatus === 'CANCELLED' && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold text-rose-400 animate-pulse">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>This order has been cancelled. Please contact support if this is a mistake.</span>
                </div>
              )}

              {/* 2. Visual Stepper Tracker */}
              {order.orderStatus !== 'CANCELLED' && (
                <div className="space-y-6 pt-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipment Progress Tracker</h4>
                  
                  <div className="relative flex flex-col space-y-6">
                    {/* Vertical connector line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800 pointer-events-none" />
                    <div 
                      className="absolute left-[19px] top-4 w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-400 pointer-events-none transition-all duration-500" 
                      style={{
                        height: 
                          order.orderStatus === 'PENDING' ? '0%' :
                          order.orderStatus === 'PROCESSING' ? '33%' :
                          order.orderStatus === 'SHIPPED' ? '66%' : '100%'
                      }}
                    />

                    {/* Step details */}
                    {steps.map((step) => {
                      const status = getStepStatus(step);
                      const labels = stepLabels[step];
                      
                      return (
                        <div key={step} className="flex items-start space-x-4 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border z-10 transition-all duration-300 ${
                            status === 'completed' ? 'bg-slate-900 border-emerald-500/30' :
                            status === 'active' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' :
                            'bg-slate-950 border-slate-850'
                          }`}>
                            {getStepIcon(step, status)}
                          </div>
                          
                          <div className="pt-0.5 space-y-0.5 text-left">
                            <h5 className={`text-xs font-black transition-colors ${
                              status === 'active' ? 'text-emerald-400' :
                              status === 'completed' ? 'text-white' : 'text-slate-500'
                            }`}>
                              {labels.title}
                            </h5>
                            <p className="text-[11px] text-slate-400">{labels.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shipped External Tracking Link Call-Out */}
              {order.orderStatus === 'SHIPPED' && order.trackingUrl && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl text-xs space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                    <Truck className="w-4 h-4" />
                    <span>Your Shipment Has an External Tracking Link</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    The dispatch team has generated a tracking link for your delivery carrier. Click below to view live coordinates:
                  </p>
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-98"
                  >
                    <span>Track Live Carrier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

            </div>

            {/* 3. Items and Ledger Card */}
            <div className="bg-slate-900/50 border border-slate-850 rounded-[32px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-850">Items purchased</h4>
              
              <div className="divide-y divide-slate-850">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex justify-between items-center gap-4 text-xs first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <h5 className="font-bold text-white truncate">{item.product.name}</h5>
                        <span className="text-[10px] text-slate-500 font-bold bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-md mt-1 inline-block">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-black text-white">{formatCurrency(Number(item.price) * item.quantity)}</span>
                      <span className="text-[10px] text-slate-500 block">{formatCurrency(item.price)} each</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Financial Ledger */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-2.5 text-xs pt-4 mt-2">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-850/60">
                  <span>Shipping & Fulfillment</span>
                  <span className="font-semibold text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1">
                  <span className="text-white">Order Total</span>
                  <span className="text-emerald-400">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              {/* Shipping Address Display */}
              {order.shippingAddress && (
                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4 mt-4 space-y-1.5 text-left text-xs">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">📦 Delivery Details</span>
                  <div className="text-slate-300 leading-relaxed font-semibold">
                    {order.shippingAddress}
                  </div>
                </div>
              )}

              {/* Payment Details Reference */}
              {order.razorpayPaymentId && (
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-mono justify-center pt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Razorpay Transaction Reference: {order.razorpayPaymentId}</span>
                </div>
              )}
            </div>
             <div className="text-[10px] text-slate-500 font-semibold font-mono border-t border-slate-850 pt-3">
              © 2026 SaivaTech. All rights reserved.
            </div>

            {/* 4. Help & Support CTA */}
            <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-[32px] backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left relative overflow-hidden">
              <div className="space-y-1">
                <h4 className="font-black text-white text-xs uppercase tracking-wider">Need assistance with your package?</h4>
                <p className="text-[11px] text-slate-400">Have questions about shipping times or wish to modify delivery details?</p>
              </div>
              <a
                href={`https://wa.me/14155238886?text=Hi!%20I%20have%20a%20question%20regarding%20my%20Store%20Order%20%23${order.id.substring(0, 8).toUpperCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] active:scale-98 flex-shrink-0"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact WhatsApp Support</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
