'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import {
  ShoppingBag,
  Zap,
  Star,
  Check,
  Droplet,
  ShieldCheck,
  Eye,
  AlertCircle
} from 'lucide-react';

export interface ProductItemData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number | string;
  mrp?: number | string | null;
  stock: number;
  imageUrl: string;
  category: string;
  isActive?: boolean;
}

interface ProductCardProps {
  product: ProductItemData;
  whatsappPhone?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  whatsappPhone = '919342365917',
  priority = false
}: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
  const mrpNum = product.mrp ? (typeof product.mrp === 'string' ? parseFloat(product.mrp) : Number(product.mrp)) : undefined;

  const discountPercent = mrpNum && mrpNum > priceNum ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;
  const savings = mrpNum && mrpNum > priceNum ? mrpNum - priceNum : 0;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);
    router.push('/checkout');
  };

  const whatsappOrderUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hi Skandiv Natural Oils! 🌿 I want to order *${product.name}* (Price: ₹${priceNum}). Please share stock & delivery details.`
  )}`;

  return (
    <div className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col shadow-lg shadow-black/20 hover:shadow-amber-500/5">
      
      {/* Product Image & Badges Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square w-full bg-slate-950/80 overflow-hidden flex items-center justify-center p-4">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-amber-500/10 transition-colors duration-500 rounded-2xl" />

        <img
          src={product.imageUrl || '/logo.jpg'}
          alt={product.name}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 relative z-10"
          loading={priority ? 'eager' : 'lazy'}
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg shadow-md shadow-amber-500/20">
              {discountPercent}% OFF
            </span>
          )}
          <span className="px-2 py-0.5 bg-[#053520] text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md">
            Mara Chekku
          </span>
        </div>

        {/* Stock Status Pill */}
        <div className="absolute top-3 right-3 z-20">
          {isOutOfStock ? (
            <span className="px-2 py-1 bg-rose-950/80 border border-rose-800/60 text-rose-300 text-[10px] font-black rounded-lg backdrop-blur-md">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-1 bg-amber-950/80 border border-amber-800/60 text-amber-300 text-[10px] font-black rounded-lg backdrop-blur-md animate-pulse">
              Only {product.stock} Left!
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-slate-950/70 border border-slate-800 text-emerald-400 text-[9px] font-bold rounded-md backdrop-blur-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>In Stock</span>
            </span>
          )}
        </div>
      </Link>

      {/* Product Content & Pricing */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
            <span className="text-amber-500/90 uppercase tracking-widest text-[10px] font-bold">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800 text-[10px] font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>4.9</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm sm:text-base font-black text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Description snippet */}
          {product.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-normal leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Savings */}
        <div className="pt-2 border-t border-slate-800/60">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-100">
              ₹{priceNum}
            </span>
            {mrpNum && mrpNum > priceNum && (
              <span className="text-xs text-slate-400 line-through font-semibold">
                ₹{mrpNum}
              </span>
            )}
            {savings > 0 && (
              <span className="text-[10px] font-bold text-emerald-400">
                Save ₹{savings}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Inclusive of all taxes &bull; 100% Pure
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Primary Quick Add & Buy Now Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
                added
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-800 hover:border-slate-700'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-500/10 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* WhatsApp Direct Order Button */}
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-[#053520]/80 hover:bg-[#053520] text-emerald-200 hover:text-white font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/30 active:scale-95"
          >
            <svg className="w-3.5 h-3.5 fill-[#25D366]" viewBox="0 0 24 24">
              <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
            </svg>
            <span>Order on WhatsApp</span>
          </a>
        </div>

      </div>

    </div>
  );
}
