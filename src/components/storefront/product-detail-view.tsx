'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ProductCard, ProductItemData } from './product-card';
import {
  ShoppingBag,
  Zap,
  Star,
  Check,
  Droplet,
  Leaf,
  ShieldCheck,
  Truck,
  RotateCcw,
  Clock,
  Heart,
  Share2,
  Minus,
  Plus,
  ChevronRight,
  Award,
  Lock
} from 'lucide-react';

interface ProductDetailViewProps {
  product: ProductItemData;
  relatedProducts: ProductItemData[];
  whatsappPhone?: string;
}

export function ProductDetailView({
  product,
  relatedProducts,
  whatsappPhone = '919342365917'
}: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.imageUrl || '/logo.jpg');
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'benefits' | 'specs' | 'shipping'>('benefits');

  const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
  const mrpNum = product.mrp ? (typeof product.mrp === 'string' ? parseFloat(product.mrp) : Number(product.mrp)) : undefined;
  const discountPercent = mrpNum && mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;
  const savings = mrpNum && mrpNum > priceNum ? (mrpNum - priceNum) * quantity : 0;

  const isOutOfStock = product.stock <= 0;
  const maxAvailable = Math.max(1, product.stock);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent('/cart')}`);
      return;
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }

    router.push('/checkout');
  };

  const whatsappOrderUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hi Skandiv Natural Oils! 🌿 I would like to order *${product.name}* (Qty: ${quantity}, Total: ₹${priceNum * quantity}). Please share payment details.`
  )}`;

  // Gallery images
  const images = [
    product.imageUrl || '/logo.jpg',
    '/slide-coconut-1.jpg',
    '/slide-coconut-2.jpg'
  ].filter(Boolean);

  return (
    <div className="space-y-16">
      
      {/* 1. Main Product Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-6 flex items-center justify-center shadow-2xl">
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
              {discountPercent > 0 && (
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md">
                  {discountPercent}% OFF
                </span>
              )}
              <span className="px-2.5 py-1 bg-[#053520] text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider rounded-lg backdrop-blur-md">
                Mara Chekku Wood-Pressed
              </span>
            </div>

            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Thumbnail Selector */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-2xl bg-slate-900 p-1 border-2 transition-all flex-shrink-0 ${
                  selectedImage === img ? 'border-amber-500 shadow-md shadow-amber-500/20' : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-contain rounded-xl" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Purchasing Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Category & Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-amber-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>4.9 (48+ Verified Reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">
              {product.description || 'Traditional Mara Chekku cold wood-pressed organic oil. Extracted below 45°C to preserve vital antioxidants and natural aroma.'}
            </p>
          </div>

          {/* Price & Savings Display */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-1.5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-100">
                ₹{priceNum}
              </span>
              {mrpNum && mrpNum > priceNum && (
                <span className="text-base text-slate-500 line-through font-semibold">
                  ₹{mrpNum}
                </span>
              )}
              {savings > 0 && (
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-lg">
                  Save ₹{savings}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              MRP Inclusive of all taxes &bull; <strong>Free Express Shipping</strong> on orders above ₹499
            </p>
          </div>

          {/* Stock & Quantity Selector */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Quantity</span>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-400">Out of Stock</span>
              ) : (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>In Stock ({product.stock} units available)</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-800 bg-slate-900 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-black text-slate-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                  disabled={quantity >= maxAvailable || isOutOfStock}
                  className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-30"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs font-bold text-slate-400">
                Subtotal: <strong className="text-amber-400 font-mono text-sm">₹{priceNum * quantity}</strong>
              </div>
            </div>
          </div>

          {/* Purchasing Actions */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
                  added
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-800 hover:border-slate-700'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Instant Buy Now</span>
              </button>
            </div>

            {/* Direct WhatsApp Ordering */}
            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#053520] hover:bg-[#064228] text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2.5 border border-emerald-500/40 shadow-lg shadow-emerald-950/30 active:scale-95"
            >
              <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
                <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
              </svg>
              <span>Order via WhatsApp (+91 93423 65917)</span>
            </a>
          </div>

          {/* Delivery & Purity Badges Row */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-6 text-center text-[10px] font-bold text-slate-400">
            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 space-y-1">
              <Truck className="w-4 h-4 text-amber-500 mx-auto" />
              <p className="text-slate-200">Express Delivery</p>
              <p className="text-slate-500">2-4 Business Days</p>
            </div>

            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 space-y-1">
              <Leaf className="w-4 h-4 text-emerald-400 mx-auto" />
              <p className="text-slate-200">100% Raw & Pure</p>
              <p className="text-slate-500">0% Chemicals</p>
            </div>

            <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 space-y-1">
              <ShieldCheck className="w-4 h-4 text-amber-500 mx-auto" />
              <p className="text-slate-200">Lab Certified</p>
              <p className="text-slate-500">Unadulterated</p>
            </div>
          </div>

        </div>

      </div>

      {/* 2. Nutritional, Usage, and Extraction Information Tabs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('benefits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'benefits'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Health & Cooking Benefits
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'specs'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Extraction & Specifications
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'shipping'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shipping & Return Policy
          </button>
        </div>

        {/* Tab 1: Benefits */}
        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-amber-400 text-sm">Culinary & Cooking</h4>
              <p>Ideal for daily sautéing, traditional tempering, and deep-frying due to high natural smoking tolerance and authentic nutty aroma.</p>
            </div>
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-emerald-400 text-sm">Heart & Metabolic Health</h4>
              <p>Rich in healthy monounsaturated and polyunsaturated fatty acids, natural plant sterols, and zero cholesterol trans-fats.</p>
            </div>
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <h4 className="font-bold text-amber-400 text-sm">Skin & Hair Nourishment</h4>
              <p>Deeply hydrating with Vitamin E and antioxidants. Apply directly as an organic scalp therapy or skin moisturizer.</p>
            </div>
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
              <span className="text-slate-500 font-semibold">Extraction Method:</span>
              <span className="font-bold text-slate-100">Traditional Vaagai Mara Chekku (Wood-Pressed)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
              <span className="text-slate-500 font-semibold">Processing Temperature:</span>
              <span className="font-bold text-emerald-400">Strictly below 45°C (True Cold-Pressed)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
              <span className="text-slate-500 font-semibold">Ingredients:</span>
              <span className="font-bold text-slate-100">100% Single-Origin Clean Seeds</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
              <span className="text-slate-500 font-semibold">Preservatives & Additives:</span>
              <span className="font-bold text-emerald-400">0% (Nil / Pure Unadulterated)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
              <span className="text-slate-500 font-semibold">Shelf Life:</span>
              <span className="font-bold text-slate-100">6 to 9 Months (Store away from direct light)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
              <span className="text-slate-500 font-semibold">Origin:</span>
              <span className="font-bold text-slate-100">Tamil Nadu, India</span>
            </div>
          </div>
        )}

        {/* Tab 3: Shipping */}
        {activeTab === 'shipping' && (
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-w-3xl">
            <p><strong>Express Shipping:</strong> Orders are dispatched within 24 hours of confirmation. Standard delivery timeline is 2 to 4 business days across India.</p>
            <p><strong>Safe Leak-Proof Packaging:</strong> Every bottle is sealed with food-grade safety induction seals and heavy-duty bubble padding to ensure zero leakage in transit.</p>
            <p><strong>Damage Protection Guarantee:</strong> In the rare event of transit damage, simply send a photo on WhatsApp and we will dispatch a replacement immediately with zero hassle.</p>
          </div>
        )}
      </div>

      {/* 3. Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              You May Also Like
            </h3>
            <Link href="/shop" className="text-xs font-bold text-amber-400 hover:text-amber-300">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                whatsappPhone={whatsappPhone}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
