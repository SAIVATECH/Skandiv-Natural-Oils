import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShopCatalog } from '@/components/storefront/shop-catalog';
import { Droplet, Leaf, ShieldCheck, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.slug;
  const categoryName = rawSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return {
    title: `${categoryName} - SKANDÍV Mara Chekku Cold-Pressed`,
    description: `Buy pure organic ${categoryName} extracted using traditional wood-pressing (Mara Chekku). 100% Raw, unrefined, zero chemical additives with fast doorstep shipping.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  let allProducts: any[] = [];
  try {
    allProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch category products:', error);
  }

  // Find products belonging to this category
  const matchingProducts = allProducts.filter(
    p => p.category.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
         p.category.toLowerCase() === categoryName.toLowerCase()
  );

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
      
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-amber-400">{categoryName}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
            Mara Chekku {categoryName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            100% Traditional Wood-Pressed {categoryName}. Extracted below 45°C without chemicals or bleaching agents.
          </p>
        </div>

        <Link
          href="/shop"
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Categories</span>
        </Link>
      </div>

      {/* Products Catalog */}
      <ShopCatalog
        initialProducts={matchingProducts.length > 0 ? matchingProducts : allProducts}
        initialCategory={matchingProducts.length > 0 ? categoryName : ''}
        whatsappPhone={whatsappPhone}
      />

    </div>
  );
}
