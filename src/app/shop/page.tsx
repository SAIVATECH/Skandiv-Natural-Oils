import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ShopCatalog } from '@/components/storefront/shop-catalog';
import { Sparkles, Droplet, ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Shop All Products - SKANDÍV Mara Chekku Cold-Pressed Oils',
  description: 'Explore our complete catalog of 100% pure organic wood-pressed oils. Coconut oil, groundnut oil, sesame oil, and castor oil. Direct doorstep delivery across India.',
};

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialCategory = resolvedParams?.category || '';
  const initialSearch = resolvedParams?.search || '';

  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch shop products:', error);
  }

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
      
      {/* Page Title & Breadcrumb Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-amber-400">Shop Catalog</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
          Pure Mara Chekku Cold-Pressed Oils
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
          Traditional wooden expeller extraction under 45°C. Unrefined, chemical-free, and rich in natural vital nutrients.
        </p>
      </div>

      {/* Catalog Component */}
      <ShopCatalog
        initialProducts={products}
        initialCategory={initialCategory}
        initialSearch={initialSearch}
        whatsappPhone={whatsappPhone}
      />

    </div>
  );
}
