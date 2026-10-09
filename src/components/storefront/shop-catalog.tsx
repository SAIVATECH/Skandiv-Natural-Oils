'use client';

import React, { useState, useMemo } from 'react';
import { ProductCard, ProductItemData } from './product-card';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  ShoppingBag,
  ArrowUpDown,
  Check,
  Grid3X3,
  List
} from 'lucide-react';

interface ShopCatalogProps {
  initialProducts: ProductItemData[];
  initialCategory?: string;
  initialSearch?: string;
  whatsappPhone?: string;
}

export function ShopCatalog({
  initialProducts,
  initialCategory = '',
  initialSearch = '',
  whatsappPhone = '919342365917'
}: ShopCatalogProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'newest' | 'discount'>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set(initialProducts.map(p => p.category));
    return Array.from(set).filter(Boolean);
  }, [initialProducts]);

  // Max price in catalog
  const highestCatalogPrice = useMemo(() => {
    return initialProducts.reduce((max, p) => {
      const price = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price);
      return Math.max(max, price);
    }, 1000);
  }, [initialProducts]);

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Stock filter
      if (inStockOnly && product.stock <= 0) {
        return false;
      }

      // Price filter
      const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
      if (priceNum > maxPrice) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price) : Number(a.price);
      const priceB = typeof b.price === 'string' ? parseFloat(b.price) : Number(b.price);

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'discount') {
        const mrpA = a.mrp ? (typeof a.mrp === 'string' ? parseFloat(a.mrp) : Number(a.mrp)) : priceA;
        const mrpB = b.mrp ? (typeof b.mrp === 'string' ? parseFloat(b.mrp) : Number(b.mrp)) : priceB;
        const discountA = mrpA - priceA;
        const discountB = mrpB - priceB;
        return discountB - discountA;
      }
      return 0; // Default featured / newest
    });
  }, [initialProducts, selectedCategory, inStockOnly, maxPrice, search, sortBy]);

  const hasActiveFilters = Boolean(search || selectedCategory || inStockOnly || maxPrice < highestCatalogPrice);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setInStockOnly(false);
    setMaxPrice(highestCatalogPrice);
    setSortBy('featured');
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Filter & Search Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        
        {/* Top Row: Search input + View Toggles + Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by oil name, seed type, or benefits..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Sorting & View Mode Controls */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-slate-950">Featured</option>
                <option value="price_asc" className="bg-slate-950">Price: Low to High</option>
                <option value="price_desc" className="bg-slate-950">Price: High to Low</option>
                <option value="discount" className="bg-slate-950">Highest Discount</option>
                <option value="newest" className="bg-slate-950">Newest First</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl text-xs font-bold transition-colors"
              >
                Reset
              </button>
            )}
          </div>

        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            All Oils ({initialProducts.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? '' : cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <div className="h-6 w-[1px] bg-slate-800 mx-2" />

          {/* In stock toggle */}
          <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer whitespace-nowrap bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded accent-amber-500 cursor-pointer"
            />
            <span>In Stock Only</span>
          </label>
        </div>

      </div>

      {/* 2. Results Header */}
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-400">
        <p>
          Showing <strong className="text-slate-100 font-bold">{filteredProducts.length}</strong> of{' '}
          <strong className="text-slate-100 font-bold">{initialProducts.length}</strong> Mara Chekku Oils
        </p>

        {selectedCategory && (
          <span className="text-amber-400 font-bold">
            Filtered by: {selectedCategory}
          </span>
        )}
      </div>

      {/* 3. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">No products match your filters</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms, resetting category filters, or browsing our full collection.
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              whatsappPhone={whatsappPhone}
              priority={idx < 4}
            />
          ))}
        </div>
      )}

    </div>
  );
}
