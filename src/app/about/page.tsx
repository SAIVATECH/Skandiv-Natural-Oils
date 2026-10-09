import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Droplet,
  Leaf,
  ShieldCheck,
  Award,
  Truck,
  Heart,
  Sparkles,
  ArrowRight,
  Phone,
  CheckCircle2
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Heritage - SKANDÍV Mara Chekku Natural Oils',
  description: 'Learn about the ancient South Indian tradition of Vaagai wood-pressed organic oils. 100% Raw, single-origin, and chemical-free from farm to bottle.',
};

export default function AboutPage() {
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    'Hi Skandiv Natural Oils! 🌿 I would like to learn more about your traditional extraction process.'
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24 w-full">
      
      {/* 1. Hero Heritage Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block">
          Traditional Mara Chekku Heritage
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
          Purity in Every Drop, Rooted in Tradition
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
          At <strong>SKANDÍV Natural Oils</strong>, we revive the timeless South Indian practice of extracting unrefined oils using traditional Vaagai wood pestles (Mara Chekku). No industrial heating, no synthetic refining, no chemicals — just pure botanical vitality.
        </p>
      </div>

      {/* 2. Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 relative overflow-hidden shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-100">100% Single-Origin Seeds</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We ethically procure organically farmed sun-dried coconuts (Copra), non-GMO groundnuts, and native sesame seeds directly from certified local farmers in Tamil Nadu.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 relative overflow-hidden shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Droplet className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-100">Vaagai Wood Extraction</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our wooden crushers rotate at gentle speeds, maintaining temperature strictly under 45°C. This prevents nutrient breakdown and retains natural plant antioxidants.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4 relative overflow-hidden shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-100">Zero Refining or Chemicals</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unlike commercial supermarket brands that bleach and deodorize oils with toxic petroleum solvents like Hexane, our oils are naturally sedimentation-settled and bottled pure.
          </p>
        </div>

      </div>

      {/* 3. Farm to Bottle Story */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Our Journey</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mt-1">
            How We Bottle the Purest Mara Chekku Oil
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-amber-400 font-black text-xs font-mono">01. SOURCING</span>
            <h4 className="text-sm font-bold text-slate-200">Sun-Dried Quality Seeds</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Carefully sorted to eliminate broken or spoiled kernels before milling.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-emerald-400 font-black text-xs font-mono">02. WOOD CRUSHING</span>
            <h4 className="text-sm font-bold text-slate-200">Mara Chekku Pressing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cold pressed using traditional Vaagai wood mortar with palm jaggery.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-amber-400 font-black text-xs font-mono">03. SUN SEDIMENTATION</span>
            <h4 className="text-sm font-bold text-slate-200">Natural Sun Settling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Allowed to settle in stainless steel tanks under natural daylight without artificial filters.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
            <span className="text-emerald-400 font-black text-xs font-mono">04. PACKAGING</span>
            <h4 className="text-sm font-bold text-slate-200">Sealed Fresh Delivery</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bottled in food-grade, leak-proof containers for doorstep courier dispatch.
            </p>
          </div>

        </div>
      </div>

      {/* 4. Contact / WhatsApp CTA */}
      <div className="bg-[#053520]/60 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Ready to Taste the Traditional Difference?
        </h2>
        <p className="text-xs sm:text-sm text-emerald-200 max-w-lg mx-auto">
          Explore our complete range of cold-pressed oils or speak directly with our team on WhatsApp for wholesale or bulk orders.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link
            href="/shop"
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
          >
            Shop All Oils
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 bg-white hover:bg-slate-100 text-[#053520] font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

    </div>
  );
}
