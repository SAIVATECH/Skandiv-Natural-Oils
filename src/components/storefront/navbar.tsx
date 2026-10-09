'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Phone,
  Droplet,
  Leaf,
  ChevronDown,
  User,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Package
} from 'lucide-react';

interface NavbarProps {
  categories?: string[];
  whatsappPhone?: string;
}

export function StoreNavbar({
  categories = ['Coconut Oil', 'Groundnut Oil', 'Sesame Oil', 'Castor Oil', 'Mustard Oil', 'Almond Oil'],
  whatsappPhone = '919342365917'
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { getItemCount, toggleCart } = useCartStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const whatsappSupportUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hi Skandiv Natural Oils, I would like to enquire about your products.')}`;
  const itemCount = mounted ? getItemCount() : 0;

  return (
    <>
      {/* 1. Announcement Bar */}
      <div className="bg-[#053520] text-white text-[11px] sm:text-xs font-semibold tracking-wide py-2 px-4 border-b border-[#042818] relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 mx-auto sm:mx-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            <span>
              🌱 <strong className="text-amber-300">100% Mara Chekku Cold Pressed</strong> &bull; Free Express Delivery on orders above ₹499 &bull; Instant WhatsApp Order
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-[11px] text-emerald-200">
            <Link href="/track" className="hover:text-white transition-colors flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </Link>
            <span>&bull;</span>
            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors flex items-center gap-1 text-amber-400 font-bold"
            >
              <span>WhatsApp Support: +91 93423 65917</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-slate-950/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-slate-800/80 py-3'
            : 'bg-slate-950/90 backdrop-blur-sm border-b border-slate-900 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 focus:outline-none transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-full overflow-hidden border-2 border-amber-500/40 p-0.5 shadow-md flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                  <img
                    src="/logo.jpg"
                    alt="Skandiv Natural Oils Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-[#053520] bg-white px-2 py-0.5 rounded shadow-sm leading-none inline-block">
                    SKANDÍV
                  </span>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="h-[1px] w-2 bg-amber-500" />
                    <span className="text-[9px] text-amber-500 font-bold tracking-[0.18em] uppercase leading-none">
                      Natural Oils
                    </span>
                    <span className="h-[1px] w-2 bg-amber-500" />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              <Link
                href="/"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  pathname === '/'
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Home
              </Link>

              <Link
                href="/shop"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  pathname === '/shop'
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Shop All
              </Link>

              {/* Categories Dropdown */}
              <div className="relative" onMouseLeave={() => setCategoriesOpen(false)}>
                <button
                  type="button"
                  onMouseEnter={() => setCategoriesOpen(true)}
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith('/category')
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {categoriesOpen && (
                  <div className="absolute left-0 mt-1 w-60 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-900">
                      Cold-Pressed Oils
                    </div>
                    <div className="py-1">
                      {categories.map((cat) => {
                        const slug = cat.toLowerCase().replace(/\s+/g, '-');
                        return (
                          <Link
                            key={cat}
                            href={`/category/${slug}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-900 transition-colors"
                          >
                            <Droplet className="w-3.5 h-3.5 text-amber-500" />
                            <span>{cat}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/about"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  pathname === '/about'
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Our Heritage
              </Link>

              <Link
                href="/contact"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                  pathname === '/contact'
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* Right Action Icons & WhatsApp Button */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Search Products"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Order Tracking / Account Link */}
              <Link
                href="/account/orders"
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors hidden sm:flex"
                title="My Orders & Tracking"
              >
                <Package className="w-4 h-4" />
              </Link>

              {/* Cart Drawer Trigger Button */}
              <button
                type="button"
                onClick={toggleCart}
                className="relative w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label={`Shopping Cart with ${itemCount} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center shadow-lg border border-slate-950 animate-in zoom-in-50 duration-200">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* WhatsApp Quick Order / Support CTA */}
              <a
                href={whatsappSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#053520] hover:bg-[#064228] text-white font-extrabold px-3.5 sm:px-4 py-2 rounded-xl border border-emerald-500/40 hover:border-emerald-400 text-xs flex items-center space-x-2 transition-all active:scale-95 shadow-md shadow-emerald-950/20"
              >
                <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
                  <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.16.7 4.21 2.02 5.87L2.01 22l4.25-1.23c1.61.88 3.47 1.34 5.75 1.34 5.49 0 9.99-4.5 9.99-10S17.49 2 12.004 2zm0 16.5c-1.92 0-3.69-.53-5.22-1.46l-.37-.23-2.58.75.76-2.51-.25-.4c-1.02-1.62-1.56-3.48-1.56-5.4 0-4.83 3.96-8.75 8.84-8.75 4.88 0 8.85 3.92 8.85 8.75-.01 4.83-3.97 8.75-8.85 8.75zm4.84-6.62c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.59.14-.18.27-.69.86-.85 1.05-.15.18-.31.2-.58.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.15-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.51-.01-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.99 2.67 1.13 2.85c.14.18 1.96 2.99 4.74 4.19.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.57-.64 1.79-1.27.22-.63.22-1.18.16-1.27-.07-.09-.25-.14-.52-.28z"/>
                </svg>
                <span className="hidden sm:inline">WhatsApp Order</span>
              </a>
            </div>

          </div>

          {/* 3. Dropdown Search Bar Modal */}
          {searchOpen && (
            <div className="pt-4 pb-2 border-t border-slate-900 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-2xl mx-auto">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pure cold-pressed coconut oil, groundnut oil, sesame..."
                  className="w-full bg-slate-900/90 border border-amber-500/40 focus:border-amber-500 text-slate-100 placeholder-slate-500 rounded-2xl px-5 py-3 text-sm focus:outline-none shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

        </div>

        {/* 4. Mobile Slide-Out Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-900 bg-slate-950 px-6 py-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="space-y-2">
              <Link
                href="/"
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900 hover:text-amber-400"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900 hover:text-amber-400"
              >
                Shop All Products
              </Link>
              <Link
                href="/cart"
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900 hover:text-amber-400 flex items-center justify-between"
              >
                <span>Shopping Cart</span>
                {itemCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-xs px-2 py-0.5 font-black rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link
                href="/account/orders"
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900 hover:text-amber-400"
              >
                Track Orders & History
              </Link>
              <Link
                href="/about"
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900 hover:text-amber-400"
              >
                Our Heritage (Mara Chekku)
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-200 hover:bg-slate-900 hover:text-amber-400"
              >
                Contact & Support
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-900">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const slug = cat.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link
                      key={cat}
                      href={`/category/${slug}`}
                      className="px-3 py-2 bg-slate-900/60 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-400"
                    >
                      {cat}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <a
                href={whatsappSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#053520] text-white font-extrabold py-3 rounded-xl text-center flex items-center justify-center gap-2 text-xs border border-emerald-500/30"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Instant Help (+91 93423 65917)</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
