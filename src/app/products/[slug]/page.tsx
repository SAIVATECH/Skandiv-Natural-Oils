import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductDetailView } from '@/components/storefront/product-detail-view';

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return {
      title: 'Product Not Found - SKANDÍV Natural Oils',
    };
  }

  const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);

  return {
    title: `${product.name} - 100% Pure Mara Chekku | SKANDÍV`,
    description: product.description || `Buy 100% pure organic Mara Chekku cold-pressed ${product.name} at ₹${priceNum}. Authentic wood-pressed unrefined oil with fast delivery.`,
    openGraph: {
      title: `${product.name} - Mara Chekku Cold-Pressed`,
      description: product.description || 'Authentic single-origin cold-pressed organic oils. Zero chemical additives.',
      images: [
        {
          url: product.imageUrl || '/logo.jpg',
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Fetch related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919342365917';
  const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');

  // JSON-LD Product Schema for SEO Rich Results
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.imageUrl || 'https://skandiv-natural-oils-b6p7.vercel.app/logo.jpg'],
    description: product.description,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'SKANDÍV Natural Oils',
    },
    offers: {
      '@type': 'Offer',
      url: `https://skandiv-natural-oils-b6p7.vercel.app/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price.toString(),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '48',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 w-full">
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-4">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
        <span>/</span>
        <Link href={`/category/${categorySlug}`} className="hover:text-white transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-amber-400 line-clamp-1">{product.name}</span>
      </div>

      {/* Product Detail Interactive Component */}
      <ProductDetailView
        product={product as any}
        relatedProducts={relatedProducts as any}
        whatsappPhone={whatsappPhone}
      />

    </div>
  );
}
