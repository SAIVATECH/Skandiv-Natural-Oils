import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
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
  ExternalLink,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering to reflect inventory changes in real-time

export default async function HomeStorefront() {
  // Query all active products directly from our Supabase database using Prisma
  let products: any[] = [];
  let dbError = false;
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch storefront products:', error);
    dbError = true;
  }

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';
  const whatsappSupportUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hi! I have a general question about Skandiv Natural Oils.')}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Background ambient lighting glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-1/4 w-[600px] h-[600px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-10 w-[450px] h-[450px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Banner Message */}
      <div className="bg-emerald-950/80 border-b border-emerald-900/40 text-center py-2 px-4 text-xs font-medium tracking-wide text-emerald-300 flex items-center justify-center space-x-2 relative z-50">
        <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        <span>Grand Opening Sale! Instant checkout via WhatsApp. Real-time updates via SMS & chat.</span>
      </div>

      {/* Modern Premium Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-white rounded-2xl overflow-hidden border border-slate-800 p-0.5 shadow-md flex items-center justify-center hover:rotate-3 transition-transform duration-300">
            <img 
              src="/logo.jpg" 
              alt="Skandiv Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center space-x-1">
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent">SKANDÍV</span>
            </h1>
            <p className="text-[10px] text-amber-500 font-bold tracking-widest uppercase leading-none">Natural Oils</p>
          </div>
        </div>

        {/* Dynamic Badges / Shortcuts */}
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 text-slate-300">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">100% Cold-Pressed</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Meta API Verified</span>
          </div>
        </div>

        {/* Support Call To Action */}
        <a
          href={whatsappSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold px-4 py-2 rounded-2xl border border-emerald-500/20 text-xs flex items-center space-x-2 transition-all active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Customer Support</span>
        </a>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 text-left z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400">
            <Award className="w-4 h-4" />
            <span>Premium Natural Extracts</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.08] tracking-tight">
            Pure Wood-Pressed Oils <br/>
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-200 to-amber-400 bg-clip-text text-transparent">For Vibrant Health</span>
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
            We extract our oils using traditional wooden wood-presses (Mara Chekku) to prevent heat generation. This keeps natural nutrients, aroma, and rich antioxidants intact—bringing purity straight to your kitchen!
          </p>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-900/60 max-w-xl">
            <div>
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-xs text-slate-500 font-semibold">Raw & Organic</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">0%</p>
              <p className="text-xs text-slate-500 font-semibold">Chemical Additives</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">Real-Time</p>
              <p className="text-xs text-slate-500 font-semibold">WhatsApp Delivery</p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="#catalog"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black px-7 py-4 rounded-2xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 text-sm tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Premium Catalog</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </a>
          </div>
        </div>

        {/* Feature Visual Brand card */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="w-full max-w-md bg-slate-900/40 border border-slate-850 p-8 rounded-[36px] shadow-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col space-y-6">
              <div className="w-20 h-20 bg-white rounded-3xl p-1 border border-slate-850 shadow-xl self-center">
                <img 
                  src="/logo.jpg" 
                  alt="Skandiv Organic Logo" 
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="text-xl font-extrabold text-white">Skandiv Pure Guarantee</h4>
                <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                  Every batch is freshly extracted under stringent organic quality protocols. Bottled raw and unrefined.
                </p>
              </div>

              {/* List features with icons */}
              <div className="space-y-4 pt-4 border-t border-slate-850">
                <div className="flex items-start space-x-3 text-xs">
                  <div className="w-5 h-5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Droplet className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white">Traditional Wood Cold-Press</h5>
                    <p className="text-slate-400 mt-0.5 leading-normal">Extracted at low temperatures below 40°C to preserve key bio-active nutrients.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <div className="w-5 h-5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white">Razorpay Secured Webhooks</h5>
                    <p className="text-slate-400 mt-0.5 leading-normal">Encrypted sandboxed checkouts with dynamic inventory lock reservation.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <div className="w-5 h-5 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-400">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white">Real-Time Delivery Maps</h5>
                    <p className="text-slate-400 mt-0.5 leading-normal">Instant digital tracking invoices dispatched automatically via Meta WhatsApp.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Shopping Workflow Visualizer */}
      <section className="bg-slate-900/30 border-y border-slate-900/80 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white">How Conversational Checkout Works</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              We have automated shopping to reside right inside your favorite chat app. Buy in less than a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col space-y-4">
              <div className="w-10 h-10 bg-emerald-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-emerald-500/10">
                01
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-white text-sm">Select Product</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Explore our premium oil items below and click **Buy via WhatsApp** on your favorite selection.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col space-y-4">
              <div className="w-10 h-10 bg-emerald-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-emerald-500/10">
                02
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-white text-sm">Send Quantity</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  WhatsApp will open with a pre-filled buy code. Click send, and the bot will instantly reply asking for the quantity!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col space-y-4">
              <div className="w-10 h-10 bg-emerald-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-emerald-500/10">
                03
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-white text-sm">Submit Address</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Add more items or click checkout. Send your delivery address. The bot will render an itemized Invoice Summary.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col space-y-4">
              <div className="w-10 h-10 bg-emerald-500 text-slate-950 font-black rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-emerald-500/10">
                04
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-white text-sm">Pay & Track</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Confirm the order to receive your secure Razorpay payment link. Pay safely to unlock live WhatsApp package tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main E-Commerce Product Catalog Showcase */}
      <section id="catalog" className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-900 pb-8">
          <div className="space-y-3 text-left">
            <h3 className="text-3xl font-black text-white flex items-center space-x-2">
              <ShoppingBag className="w-7 h-7 text-emerald-400" />
              <span>Premium Wood-Pressed Catalog</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Authentic extracts, unfiltered, unheated. Connects in real-time to our live inventory database.
            </p>
          </div>

          {/* Catalog Count Indicator */}
          <div className="bg-slate-900/60 border border-slate-850 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-300 self-start flex items-center space-x-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>{products.length} Products Active in DB</span>
          </div>
        </div>

        {/* DB Connection Failure Safeguard */}
        {dbError && (
          <div className="bg-rose-950/30 border border-rose-900/40 text-rose-300 p-6 rounded-3xl max-w-2xl mx-auto text-center space-y-3">
            <h4 className="font-bold text-lg">⚠️ Database Connection Issue</h4>
            <p className="text-xs leading-normal">
              We could not connect to our live catalog database right now. Please reload the page or click below to chat with our team on WhatsApp immediately:
            </p>
            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-rose-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all hover:scale-102"
            >
              <span>Contact Live Chat Support</span>
            </a>
          </div>
        )}

        {/* Empty Catalog Safeguard */}
        {!dbError && products.length === 0 && (
          <div className="bg-slate-900/30 border border-slate-850 text-slate-400 p-12 rounded-3xl max-w-xl mx-auto text-center space-y-4">
            <Leaf className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="font-bold text-lg text-white">Catalog Currently Restocking</h4>
            <p className="text-xs leading-normal">
              Our traditional cold-press mills are currently working on a fresh batch of organic seeds! All items are undergoing filter maturation. Please click below to get notified once new bottles are seeded:
            </p>
            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-emerald-500 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all active:scale-95"
            >
              <span>🔔 Get WhatsApp Restock Notification</span>
            </a>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const clickToBuyUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`buy_${product.slug}`)}`;

            return (
              <div 
                key={product.id}
                className="group bg-slate-900/40 hover:bg-slate-900/70 border border-slate-900 hover:border-emerald-500/20 rounded-[32px] p-5 shadow-2xl flex flex-col space-y-4 transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm"
              >
                {/* Premium Product Image Container */}
                <div className="w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 relative shadow-inner">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                      <Droplet className="w-10 h-10 animate-bounce" />
                      <span className="text-[10px] font-mono">No Image Uploaded</span>
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    {isOutOfStock ? (
                      <span className="bg-rose-950/80 border border-rose-950 text-rose-400 text-[10px] font-extrabold px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wide">
                        🚫 Out of Stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="bg-amber-950/80 border border-amber-900 text-amber-400 text-[10px] font-extrabold px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wide animate-pulse">
                        ⚠️ Only {product.stock} Left!
                      </span>
                    ) : (
                      <span className="bg-emerald-950/80 border border-emerald-900 text-emerald-400 text-[10px] font-extrabold px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wide">
                        🟢 In Stock ({product.stock})
                      </span>
                    )}
                  </div>

                  {/* Category Indicator Tag */}
                  <div className="absolute bottom-3.5 left-3.5 z-10 bg-slate-950/90 border border-slate-850 px-3 py-1 rounded-xl text-[9px] font-bold text-slate-300 backdrop-blur-sm tracking-wider uppercase">
                    {product.category || 'Premium Oil'}
                  </div>
                </div>

                {/* Product Meta details */}
                <div className="flex-1 flex flex-col space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs text-amber-500 font-extrabold">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="font-semibold text-slate-400 text-[10px]">(5.0 / 48 Reviews)</span>
                    </div>
                    <h4 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-slate-400 leading-normal line-clamp-2 min-h-[36px]">{product.description}</p>
                  </div>

                  {/* Key product trust checkboxes */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-medium py-2 border-y border-slate-900/60">
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>Mara Chekku Press</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>Chemical-Free</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>Zero Heat Refined</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>Freshly Matured</span>
                    </div>
                  </div>

                  {/* Pricing and Action row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Price per bottle</span>
                      <p className="text-xl font-black text-white">
                        ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {isOutOfStock ? (
                      <button
                        disabled
                        className="bg-slate-850 text-slate-500 cursor-not-allowed font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center justify-center space-x-2 border border-slate-800"
                      >
                        <span>Out of Stock</span>
                      </button>
                    ) : (
                      <a
                        href={clickToBuyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.03] active:scale-98 shadow-xl shadow-emerald-500/5 hover:shadow-emerald-500/10"
                      >
                        <Smartphone className="w-4 h-4 stroke-[2.5]" />
                        <span>Buy via WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* Trust guarantees badge section */}
      <section className="bg-slate-900/20 py-16 px-6 md:px-12 border-t border-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-white text-base">Uncompromised Quality</h4>
            <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
              Sealed under vacuum filters. Bypasses standard commercial heating channels completely.
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-white text-base">Secured Payment Escrow</h4>
            <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
              Integrated Razorpay sandbox checkout. Complete peace of mind with 100% money-back rules.
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-white text-base">Instant Tracking Alerts</h4>
            <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
              Automated delivery tracking hooks. Receive updates and dynamic invoices via SMS.
            </p>
          </div>
        </div>
      </section>

      {/* Footer / Developer administration controls */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-10 px-6 md:px-12 text-center text-xs space-y-6 relative z-10">
        
        {/* Brand visual layout */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 bg-white rounded-xl p-0.5 border border-slate-800 shadow">
            <img 
              src="/logo.jpg" 
              alt="Skandiv Organic Logo" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-black tracking-widest uppercase text-white bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent leading-none">SKANDÍV</p>
            <p className="text-[8px] text-amber-500 font-bold tracking-widest uppercase mt-0.5 leading-none">Natural Oils Store</p>
          </div>
        </div>

        <p className="text-slate-500 max-w-md mx-auto leading-normal">
          © 2026 Skandiv Natural Oils. Handcrafted organic cold-pressed wellness extracts. Powered by Next.js & Meta WABA API.
        </p>

        {/* Subtle Administration Access for Developers */}
        <div className="pt-4 border-t border-slate-900/60 max-w-lg mx-auto flex items-center justify-center space-x-6 text-[10px] text-slate-400 font-mono">
          <span className="text-slate-600 font-semibold font-sans">ADMIN CONTROL:</span>
          
          <Link
            href="/login"
            className="hover:text-emerald-400 transition-colors flex items-center space-x-1"
          >
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>Dashboard Panel</span>
          </Link>
          
          <span className="text-slate-800">|</span>
          
          {/* <Link
            href="/admin/simulator"
            className="hover:text-indigo-400 transition-colors flex items-center space-x-1"
          >
            <Smartphone className="w-3 h-3 text-indigo-500" />
            <span>WABA Simulator</span>
          </Link>

          <span className="text-slate-800">|</span>

          <Link
            href="/checkout/mock"
            className="hover:text-amber-400 transition-colors flex items-center space-x-1"
          >
            <ExternalLink className="w-3 h-3 text-amber-500" />
            <span>Sandbox checkout</span>
          </Link> */}
        </div>
      </footer>

    </div>
  );
}
