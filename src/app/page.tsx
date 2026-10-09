import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { HeroSlider } from '@/components/hero-slider';
import { ProductCard } from '@/components/storefront/product-card';
import {
  ShoppingBag,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Droplet,
  Leaf,
  ArrowRight,
  Lock,
  Shield,
  Star,
  Award,
  Truck,
  Sparkles,
  Heart,
  ChevronRight,
  Check,
  HelpCircle,
  Zap,
  Clock,
  ThumbsUp
} from 'lucide-react';

export const revalidate = 0; // Ensure fresh inventory from Supabase

export default async function HomeStorefront() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch storefront products:', error);
  }

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';
  const whatsappChatUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    'Hi Skandiv Natural Oils! 🌿 I would like to order pure cold-pressed oils.'
  )}`;

  // Distinct categories
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  const featuredProducts = products.slice(0, 4);
  const allProducts = products;

  return (
    <div className="flex flex-col space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. Hero Showcase Section */}
      <section className="relative pt-6 sm:pt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-[30%] right-1/4 w-[600px] h-[600px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />

        <HeroSlider products={products} whatsappPhone={whatsappPhone} />
      </section>

      {/* 2. Premium Mara Chekku Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-6 sm:-mt-10">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
            
            <div className="flex flex-col items-center text-center p-3 space-y-2.5 justify-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-slate-100 leading-none">100% Raw</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">Single-Origin Seeds</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-3 pt-6 md:pt-3 space-y-2.5 justify-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-slate-100 leading-none">Mara Chekku</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">Traditional Wood-Pressed</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-3 pt-6 md:pt-3 space-y-2.5 justify-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-slate-100 leading-none">0% Chemicals</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">No Preservatives</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-3 pt-6 md:pt-3 space-y-2.5 justify-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-slate-100 leading-none">Lab Tested</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">Nutrient Rich & Pure</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center p-3 pt-6 md:pt-3 space-y-2.5 justify-center col-span-2 md:col-span-1">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-slate-100 leading-none">Express Delivery</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">Insured Pan-India Shipping</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authentic Varieties</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Explore By Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cold-pressed organic oils tailored for cooking, dietary health, skin, and hair wellness.
            </p>
          </div>

          <Link
            href="/shop"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {(categories.length > 0 ? categories : ['Coconut Oil', 'Groundnut Oil', 'Sesame Oil', 'Castor Oil']).map((cat) => {
            const slug = cat.toLowerCase().replace(/\s+/g, '-');
            const catProducts = products.filter(p => p.category === cat);
            const count = catProducts.length;

            return (
              <Link
                key={cat}
                href={`/category/${slug}`}
                className="group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg shadow-black/20"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 group-hover:bg-amber-500/10 rounded-full blur-xl transition-all" />
                
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300 mb-4">
                  <Droplet className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-100 group-hover:text-amber-400 transition-colors">
                    {cat}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">
                    {count > 0 ? `${count} ${count === 1 ? 'Product' : 'Products'}` : 'Mara Chekku Oil'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
                  <span>Browse Category</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Best Sellers / Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Best Selling Mara Chekku Oils
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Freshly pressed, unadulterated, and packaged in food-grade hygiene bottles.
            </p>
          </div>

          <Link
            href="/shop"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Browse All ({allProducts.length})</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

        {allProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-bold">No products currently available</p>
            <p className="text-slate-500 text-xs mt-1">Please check back soon or add products via admin dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsappPhone={whatsappPhone}
                priority={idx < 2}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Why Choose Mara Chekku (Comparison Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              The Purity Difference
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight mt-3">
              Mara Chekku vs Industrial Refined Oils
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Why traditional cold wood-pressed oil is the gold standard for your family&apos;s health and wellness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Skandiv Mara Chekku Card */}
            <div className="bg-[#053520]/50 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-5 relative">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white">SKANDÍV Mara Chekku</h3>
                  <p className="text-xs text-emerald-300 font-semibold">100% Traditional Wood-Pressed</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Cold Extracted under 45°C:</strong> Preserves 100% natural vitamins E, K, and antioxidants.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Zero Chemical Solvents:</strong> No hexane, bleaching agents, or synthetic stabilizers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Authentic Aroma & Color:</strong> Unfiltered density with genuine rich taste.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Cholesterol & Heart Friendly:</strong> Natural good fatty acids with zero trans fats.</span>
                </li>
              </ul>
            </div>

            {/* Industrial Refined Oil Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 opacity-80">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-300">Commercial Refined Oils</h3>
                  <p className="text-xs text-slate-400">High-Heat Factory Processed</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <span className="font-bold text-sm">✕</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Heated to 200°C+:</strong> Strips vital nutrients and degrades natural antioxidants.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Chemical Deodorizing:</strong> Treated with synthetic bleaching agents and deodorizers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Artificial Preservatives:</strong> Added BHA/BHT to artificially extend shelf life.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>High Trans Fats:</strong> Processing alters oil structure into oxidized unhealthy lipids.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Promotional Special Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-3xl p-8 sm:p-12 text-slate-950 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
              Limited Time Welcome Offer
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Get 10% OFF on your First Order
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-900/90 leading-relaxed">
              Use code <strong className="bg-slate-950 text-white px-2 py-0.5 rounded font-mono">SKANDIV10</strong> at checkout for instant 10% discount on Mara Chekku pure oils.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/shop"
              className="px-8 py-4 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all text-center shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy Now (10% OFF)</span>
            </Link>

            <Link
              href="/shop"
              className="px-8 py-4 bg-white hover:bg-slate-100 text-[#053520] font-black text-xs uppercase tracking-wider rounded-2xl transition-all text-center shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Explore All Oils</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 7. WhatsApp Shopping Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#053520] border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart Commerce Innovation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
              Order via WhatsApp in 3 Simple Taps
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              No account passwords or app downloads required. Simply message our verified WhatsApp bot to browse cold-pressed oils, choose quantities, pay via Razorpay UPI, and receive live delivery tracking directly in your chat!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center">1</span>
                <p className="text-xs font-bold text-slate-200">Send &quot;Hi&quot;</p>
                <p className="text-[10px] text-slate-400">View real-time catalog & live stock</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center">2</span>
                <p className="text-xs font-bold text-slate-200">Select & Pay</p>
                <p className="text-[10px] text-slate-400">Instant UPI / Razorpay payment link</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center">3</span>
                <p className="text-xs font-bold text-slate-200">Live Tracking</p>
                <p className="text-[10px] text-slate-400">Delivery status updates in chat</p>
              </div>
            </div>
          </div>

          {/* Interactive Mock preview */}
          <div className="w-full lg:w-96 bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-3">
              <div className="w-9 h-9 rounded-full bg-[#053520] border border-emerald-500/30 flex items-center justify-center text-white font-bold text-xs">
                SO
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  <span>Skandiv WhatsApp Bot</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 text-slate-950" />
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold">Official Business Account</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl rounded-tl-none text-slate-300 space-y-1">
                <p className="font-bold text-emerald-400">🌿 Welcome to Skandiv Natural Oils!</p>
                <p className="text-[11px] text-slate-400">Pure Mara Chekku cold-pressed oils. Select an option:</p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-2xl rounded-tr-none text-emerald-200 text-[11px] font-semibold text-right ml-auto max-w-[80%]">
                1x Mara Chekku Coconut Oil 500ml
              </div>

              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl rounded-tl-none text-slate-300 space-y-2">
                <p className="text-[11px]">🎉 Order created! Total: <strong>₹250</strong></p>
                <div className="bg-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-center text-[10px] uppercase tracking-wider">
                  Pay with UPI / Razorpay
                </div>
              </div>
            </div>

            <a
              href={whatsappChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
            >
              <span>Start WhatsApp Shopping</span>
            </a>
          </div>

        </div>
      </section>

      {/* 8. Customer Testimonials & Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Real Customer Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mt-3">
            Trusted by 5,000+ Families Across India
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &quot;The Mara Chekku Coconut Oil has the purest aroma I have experienced since my childhood. You can immediately feel that it is unrefined and chemical-free. Ordering via WhatsApp was super fast!&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-800/60 pt-4">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center">
                AK
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Ananya Krishnan</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Verified Buyer &bull; Chennai</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &quot;We switched to Skandiv Groundnut Oil for our daily cooking 3 months ago. The food tastes noticeably lighter and richer. Razorpay payment was seamless and delivery was done in 2 days.&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-800/60 pt-4">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                RS
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Ramesh Sundaram</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Verified Buyer &bull; Bangalore</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                &quot;Top tier Mara Chekku Sesame &amp; Castor oil. Authentic density, rich golden color, and zero synthetic fragrance. Truly traditional South Indian wood-pressed purity.&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-800/60 pt-4">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center">
                PV
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Priya Venkat</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Verified Buyer &bull; Coimbatore</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Everything you need to know about our wood-pressed organic oils and ordering process.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>What is Mara Chekku (Wood-Pressed) Oil?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed pl-6">
              Mara Chekku is an ancient extraction method using a pestle made of traditional Vaagai wood. The slow wooden rotation generates zero friction heat (stays under 45°C), ensuring natural enzymes, vitamins, minerals, and healthy fats remain 100% intact.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>How long do cold-pressed oils stay fresh?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed pl-6">
              Because our oils contain zero synthetic preservatives or chemicals, they have a natural shelf life of 6 to 9 months when stored in a cool, dark place away from direct sunlight.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>What payment methods are supported?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed pl-6">
              We support all major payment options via 256-Bit Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, and NetBanking.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>How do I track my order once dispatched?</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed pl-6">
              As soon as your order is packed and dispatched, you will receive real-time tracking links via WhatsApp and SMS. You can also visit the <Link href="/track" className="text-amber-400 underline">Order Tracking</Link> page at any time with your Order ID.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
