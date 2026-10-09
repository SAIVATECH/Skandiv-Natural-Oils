'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Truck,
  Droplet,
  Leaf,
  Award,
  Lock,
  ArrowRight,
  CheckCircle2,
  Package
} from 'lucide-react';

interface FooterProps {
  categories?: string[];
  whatsappPhone?: string;
}

export function StoreFooter({
  categories = ['Coconut Oil', 'Groundnut Oil', 'Sesame Oil', 'Castor Oil', 'Mustard Oil'],
  whatsappPhone = '919342365917'
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const whatsappSupportUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hi Skandiv Natural Oils, I would like to know more about your cold-pressed oils.')}`;

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs font-sans relative overflow-hidden">
      
      {/* Top Value Propositions Row */}
      <div className="border-b border-slate-900 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-100">100% Mara Chekku</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Wood-pressed at under 45°C</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-100">Fast Express Delivery</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Free on orders above ₹499</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-100">0% Chemicals or Heat</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Zero preservatives & additives</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-100">Secure Payments</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Razorpay 256-Bit encrypted</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full overflow-hidden border-2 border-amber-500/40 p-0.5 shadow-md flex items-center justify-center">
                <img
                  src="/logo.jpg"
                  alt="Skandiv Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-2xl font-black tracking-tight text-[#053520] bg-white px-2 py-0.5 rounded shadow-sm leading-none inline-block">
                  SKANDÍV
                </span>
                <span className="text-[10px] text-amber-500 font-bold tracking-[0.2em] uppercase mt-1">
                  Natural Oils &bull; Mara Chekku
                </span>
              </div>
            </Link>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              Skandiv Natural Oils brings you authentic, unrefined, and single-origin cold-pressed oils extracted using traditional wood-pressing (Mara Chekku) techniques to preserve natural aroma, essential nutrients, and therapeutic vitality.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Join our Wellness Circle
              </h5>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you for subscribing! Check your email for special offers.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 text-slate-100 placeholder-slate-400 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest border-b border-slate-900 pb-2">
              Explore Store
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-amber-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-amber-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-amber-400 transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  Our Mara Chekku Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Oil Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest border-b border-slate-900 pb-2">
              Cold-Pressed Oils
            </h4>
            <ul className="space-y-2 font-medium">
              {categories.map((cat) => {
                const slug = cat.toLowerCase().replace(/\s+/g, '-');
                return (
                  <li key={cat}>
                    <Link href={`/category/${slug}`} className="hover:text-amber-400 transition-colors">
                      {cat}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest border-b border-slate-900 pb-2">
              Direct Contact
            </h4>
            <ul className="space-y-3 font-medium">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Tamil Nadu, India &bull; Nationwide Express Dispatch</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href="tel:+919342365917" className="hover:text-white transition-colors">
                  +91 93423 65917
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="mailto:support@skandivnaturaloils.in" className="hover:text-white transition-colors">
                  support@skandivnaturaloils.in
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={whatsappSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#053520] hover:bg-[#064228] text-white font-bold px-4 py-2 rounded-xl text-xs border border-emerald-500/30 transition-all shadow-md shadow-emerald-950/20"
                >
                  <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
                    <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar & Copyright */}
      <div className="border-t border-slate-900 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} <strong>Skandiv Natural Oils</strong>. All rights reserved. Pure Mara Chekku Cold-Pressed Oils.
          </p>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Accepted: UPI, GooglePay, PhonePe, Cards, NetBanking</span>
            <span className="text-slate-700">&bull;</span>
            <Link href="/admin" className="text-slate-400 hover:text-amber-400 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
