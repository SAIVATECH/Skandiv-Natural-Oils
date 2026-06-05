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

      {/* Decorative organic leaf branches from mockup */}
      <div className="absolute top-16 right-0 w-64 md:w-[350px] pointer-events-none select-none z-30 mix-blend-multiply opacity-95">
        <img 
          src="/leaves-branch.png" 
          alt="Decorative Organic Leaves Branch" 
          className="w-full h-auto object-contain transform origin-top-right rotate-[-5deg]" 
        />
      </div>

      {/* Top Banner Message */}
      <div className="bg-[#053520] border-b border-[#042818] text-center py-2.5 px-4 text-xs font-bold tracking-wide text-white flex items-center justify-center space-x-2 relative z-50">
        <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
        <span>Grand Opening Sale! <span className="text-amber-400">Instant checkout</span> via WhatsApp. Real-time updates via SMS & Chat.</span>
      </div>

      {/* Modern Premium Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-850 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 bg-white rounded-full overflow-hidden border-2 border-amber-600/30 p-0.5 shadow-md flex items-center justify-center hover:rotate-6 transition-transform duration-300">
            <img 
              src="/logo.jpg" 
              alt="Skandiv Logo" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-black tracking-tight flex items-center space-x-1.5 leading-none">
              <span className="font-serif text-[#053520] tracking-wide">SKANDÍV</span>
            </h1>
            <div className="flex items-center space-x-1 mt-1">
              <span className="h-[1px] w-2 bg-amber-505 bg-amber-500" />
              <span className="text-[9px] text-amber-600 font-bold tracking-[0.16em] uppercase leading-none">Natural Oils</span>
              <span className="h-[1px] w-2 bg-amber-500" />
            </div>
          </div>
        </div>

        {/* Support Call To Action */}
        <a
          href={whatsappSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white hover:bg-slate-50 text-[#053520] font-extrabold px-5 py-2.5 rounded-full border border-amber-500/40 hover:border-amber-500 text-xs flex items-center space-x-2 transition-all active:scale-95 shadow-md shadow-amber-500/5"
        >
          <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
            <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
          </svg>
          <span className="font-sans">Customer Support</span>
        </a>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 text-left z-10">
          <div className="inline-flex items-center space-x-2 bg-[#e3eae0] border border-[#d2ded0]/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#053520]">
            <Award className="w-4.5 h-4.5 text-emerald-700" />
            <span>Premium Natural Extracts</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="font-serif text-5xl sm:text-6xl md:text-[68px] font-black text-slate-100 leading-[1.05] tracking-tight flex flex-col uppercase">
              <span className="text-slate-100">Pure Wood-</span>
              <span className="text-slate-100">Pressed Oils</span>
              <span className="text-[#053520]">For Vibrant</span>
              <span className="text-amber-500">Health</span>
            </h2>
            {/* Elegant horizontal gold accent underline separator */}
            <div className="w-48 h-[3px] bg-gradient-to-r from-[#caa023] via-amber-400 to-transparent rounded-full mt-2" />
          </div>
          
          <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
            We extract our oils using traditional wooden wood-presses (Mara Chekku) to retain natural nutrients, aroma, and rich antioxidants — bringing purity straight to your kitchen!
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a
              href="#catalog"
              className="inline-flex items-center justify-center space-x-2 bg-[#053520] hover:bg-[#032013] text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-[#053520]/10 hover:shadow-[#053520]/20 text-sm tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 animate-pulse-slow"
            >
              <span>Shop Our Oils</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </a>
            
            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-[#053520] font-black px-8 py-4 rounded-2xl border-2 border-amber-500/40 hover:border-amber-500/70 text-sm tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-amber-500/5"
            >
              <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
              </svg>
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Mockup-Matched Hero Showcase Image */}
        <div className="lg:col-span-5 relative flex justify-center z-10">
          <div className="w-full max-w-md bg-white border border-[#e3eae0] p-3.5 rounded-[40px] shadow-2xl relative overflow-hidden card-3d preserve-3d perspective-1000">
            {/* Ambient organic glows */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden border border-[#e3eae0] relative shadow-inner bg-slate-950 preserve-3d">
              <img 
                src="/hero-showcase.png" 
                alt="Skandiv Premium Oils Showcase" 
                className="w-full h-full object-cover depth-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Premium Trust Badges Grid (Mockup-matched) */}
      <section className="px-6 md:px-12 max-w-7xl mx-auto -mt-6 mb-12">
        <div className="bg-white border border-[#e3eae0] rounded-[32px] p-6 shadow-xl shadow-emerald-950/[0.01]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#e3eae0]">
            
            {/* Badge 1: 100% Raw & Organic */}
            <div className="flex flex-col items-center text-center p-3 space-y-3 justify-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-100 leading-none">100%</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Raw & Organic</p>
              </div>
            </div>

            {/* Badge 2: 0% Chemical Additives */}
            <div className="flex flex-col items-center text-center p-3 pt-6 md:pt-3 space-y-3 justify-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 19c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V8h14v11zM10.22 6h3.56l.72 1.44c.15.3.46.56.78.56h.72V6h-1v-.5c0-.83-.67-1.5-1.5-1.5h-1c-.83 0-1.5.67-1.5 1.5V6h-1v2h.72c.32 0 .63-.26.78-.56L10.22 6zM18.8 16.7c-.5-.8-1.4-1.3-2.4-1.3H16v-4.5c0-.6-.2-1.1-.6-1.5l-2.4-2.4c-.2-.2-.5-.3-.8-.3s-.6.1-.8.3L9 9.8c-.4.4-.6.9-.6 1.5V15.4H7.6c-1 0-1.9.5-2.4 1.3-.5.8-.6 1.8-.2 2.7.4.8 1.3 1.4 2.3 1.4h9.4c1 0 1.9-.6 2.3-1.4.4-.9.3-1.9-.2-2.7zM11 9.4c.2-.2.5-.2.7 0l1.7 1.7V15H11V9.4zM7.7 19.3c-.4 0-.8-.2-1-.6-.2-.4-.2-.8 0-1.2.2-.4.6-.6 1-.6H11V18H7.7v1.3zm8.6 0H13v-3h3.3c.4 0 .8.2 1 .6.2.4.2.8 0 1.2-.2.4-.6.6-1 .6z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-black text-slate-100 leading-none">0%</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Chemical Additives</p>
              </div>
            </div>

            {/* Badge 3: Traditional Mara Chekku */}
            <div className="flex flex-col items-center text-center p-3 pt-6 md:pt-3 space-y-3 justify-center">
              <div className="w-12 h-12 bg-amber-100/50 rounded-full flex items-center justify-center text-amber-800 shadow-sm border border-amber-200">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h12v2H6zm6-17c-2.76 0-5 2.24-5 5v3c0 2.21 1.79 4 4 4h2c2.21 0 4-1.79 4-4V7c0-2.76-2.24-5-5-5zm-1 8H9V7h2v3zm4 0h-2V7h2v3z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-slate-100 leading-tight">Traditional</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Mara Chekku Method</p>
              </div>
            </div>

            {/* Badge 4: Rich in Nutrients */}
            <div className="flex flex-col items-center text-center p-3 pt-6 md:pt-3 space-y-3 justify-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-100">
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-slate-100 leading-tight">Rich in</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Nutrients & Antioxidants</p>
              </div>
            </div>

            {/* Badge 5: Real-Time WhatsApp Support */}
            <div className="flex flex-col items-center text-center p-3 pt-6 md:pt-3 space-y-3 justify-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-slate-100 leading-tight">Real-Time</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">WhatsApp Support</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Step-by-Step Shopping Workflow Visualizer */}
      <section className="bg-slate-900/30 border-y border-slate-900/80 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-100">How Conversational Checkout Works</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              We have automated shopping to reside right inside your favorite chat app. Buy in less than a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col space-y-4">
              <div className="w-10 h-10 bg-amber-500 text-slate-100 font-black rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-amber-500/20">
                01
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-slate-100 text-sm">Select Product</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Explore our premium oil items below and click **Buy via WhatsApp** on your favorite selection.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col space-y-4">
              <div className="w-10 h-10 bg-amber-500 text-slate-100 font-black rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-amber-500/20">
                02
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-slate-100 text-sm">Send Quantity</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  WhatsApp will open with a pre-filled buy code. Click send, and the bot will instantly reply asking for the quantity!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col space-y-4">
              <div className="w-10 h-10 bg-amber-500 text-slate-100 font-black rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-amber-500/20">
                03
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-slate-100 text-sm">Submit Address</h4>
                <p className="text-xs text-slate-400 leading-normal">
                  Add more items or click checkout. Send your delivery address. The bot will render an itemized Invoice Summary.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl flex flex-col space-y-4">
              <div className="w-10 h-10 bg-amber-500 text-slate-100 font-black rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-amber-500/20">
                04
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="font-bold text-slate-100 text-sm">Pay & Track</h4>
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
            <h3 className="text-3xl font-black text-slate-100 flex items-center space-x-2">
              <ShoppingBag className="w-7 h-7 text-emerald-600" />
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
            <h4 className="font-bold text-lg text-slate-100">Catalog Currently Restocking</h4>
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
                className="group bg-slate-900/40 hover:bg-slate-900/70 border border-slate-900 hover:border-emerald-500/20 rounded-[32px] p-5 shadow-2xl flex flex-col space-y-4 backdrop-blur-sm card-3d preserve-3d perspective-1000 relative"
              >
                {/* Premium Product Image Container */}
                <div className="w-full aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 relative shadow-inner preserve-3d">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover depth-image"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                      <Droplet className="w-10 h-10 animate-bounce" />
                      <span className="text-[10px] font-mono">No Image Uploaded</span>
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div className="absolute top-3.5 right-3.5 z-10 depth-badge">
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
                    <h4 className="font-serif text-lg font-black text-slate-100 group-hover:text-primary transition-all duration-500 depth-text line-clamp-1">{product.name}</h4>
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
                      <div className="flex items-baseline space-x-2">
                        {product.mrp && Number(product.mrp) > Number(product.price) && (
                          <span className="text-sm line-through text-slate-500 font-medium">
                            ₹{Number(product.mrp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        <p className="text-xl font-black text-slate-100">
                          ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
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
                        className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-100 font-black px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all hover:scale-[1.03] active:scale-98 shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20"
                      >
                        <Smartphone className="w-4 h-4 stroke-[2.5] text-slate-100" />
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

      {/* Secondary Mockup-Matched Trust Showcase Card */}
      <section className="px-6 md:px-12 max-w-6xl mx-auto py-12 relative overflow-visible">
        {/* Left overlapping leaf branch */}
        <div className="absolute -bottom-6 -left-8 w-24 md:w-32 pointer-events-none select-none z-20 mix-blend-multiply opacity-90">
          <img 
            src="/leaves-corner.png" 
            alt="Decorative Organic Leaf Bottom Left" 
            className="w-full h-auto object-contain transform -rotate-12" 
          />
        </div>
        
        {/* Right overlapping leaf branch */}
        <div className="absolute -bottom-8 -right-8 w-24 md:w-32 pointer-events-none select-none z-20 mix-blend-multiply opacity-90">
          <img 
            src="/leaves-corner.png" 
            alt="Decorative Organic Leaf Bottom Right" 
            className="w-full h-auto object-contain transform scale-x-[-1] rotate-12" 
          />
        </div>

        <div className="bg-[#f5f8f3] border-2 border-emerald-100/30 rounded-[36px] p-8 shadow-xl shadow-[#053520]/[0.01]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-emerald-200/40">
            
            {/* Card Column 1: 100% Raw & Organic */}
            <div className="flex flex-col items-center text-center p-4 space-y-2 justify-center">
              <div className="relative">
                <span className="text-[56px] font-black text-[#053520] font-serif leading-none tracking-tight">100%</span>
                <span className="absolute -top-1 -right-4 text-emerald-600 font-serif text-xl">🌿</span>
              </div>
              <div className="w-24 h-[2px] bg-emerald-500/30 mx-auto" />
              <p className="text-xs text-[#053520] font-black uppercase tracking-widest mt-1">Raw & Organic</p>
            </div>

            {/* Card Column 2: 0% Chemical Additives */}
            <div className="flex flex-col items-center text-center p-4 pt-8 md:pt-4 space-y-2 justify-center">
              <span className="text-[56px] font-black text-[#caa023] font-serif leading-none tracking-tight">0%</span>
              <div className="w-24 h-[2px] bg-amber-500/30 mx-auto" />
              <p className="text-xs text-amber-700 font-black uppercase tracking-widest mt-1">Chemical Additives</p>
            </div>

            {/* Card Column 3: Real-Time WhatsApp Support */}
            <div className="flex flex-col items-center text-center p-4 pt-8 md:pt-4 space-y-3 justify-center">
              <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/20 border border-[#1ebd59] hover:scale-105 transition-transform duration-300">
                <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
                  <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
                </svg>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-black text-[#053520]">Real-Time</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-none">WhatsApp Support</p>
              </div>
            </div>

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
            <p className="font-serif text-sm font-black tracking-widest uppercase bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent leading-none">SKANDÍV</p>
            <p className="text-[8px] text-amber-600 font-bold tracking-widest uppercase mt-0.5 leading-none">Natural Oils Store</p>
          </div>
        </div>

        <p className="text-slate-550 max-w-md mx-auto leading-normal">
          © 2026 Skandiv Natural Oils. Handcrafted organic cold-pressed wellness extracts. Designed by<Link href="https://saivatech.in" className="text-emerald-600 font-semibold hover:text-emerald-500 transition-colors ml-1" target="_blank" rel="noopener noreferrer">
          Saivatech</Link>.
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
