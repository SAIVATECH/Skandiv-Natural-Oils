'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Smartphone, 
  Award, 
  Star, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: any;
  mrp: any;
  stock: number;
}

interface HeroSliderProps {
  products: Product[];
  whatsappPhone: string;
}

export function HeroSlider({ products, whatsappPhone }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null);

  const slides = [
    {
      tag: "Premium Natural Extracts",
      titleStart: "Pure Wood-",
      titleMiddle: "Pressed Oils",
      titleColor: "Coconut Oil",
      accentWord: "Purity",
      slug: "500ml-coconut-oil",
      description: "We extract our oils using traditional wooden wood-presses (Mara Chekku) to retain natural nutrients, aroma, and rich antioxidants — bringing purity straight to your kitchen!",
      image: "/slide-coconut-1.jpg",
      defaultPrice: 350,
      defaultMrp: 450,
    },
    {
      tag: "100% Organic & Raw",
      titleStart: "Rich Nutrient",
      titleMiddle: "Mara Chekku",
      titleColor: "Groundnut Oil",
      accentWord: "Health",
      slug: "500ml-groundnut-oil",
      description: "Crafted from handpicked premium groundnuts. Our cold-pressed groundnut oil is perfect for high-heat cooking while preserving natural vitamins and heart-healthy fats.",
      image: "/slide-groundnut.jpg",
      defaultPrice: 220,
      defaultMrp: 290,
    },
    {
      tag: "Premium Cold Pressed",
      titleStart: "Traditional",
      titleMiddle: "Wood Pressed",
      titleColor: "Virgin Copra",
      accentWord: "Freshness",
      slug: "200ml-coconut-oil",
      description: "Made from carefully selected fresh sulfur-free coconuts. Unrefined and unbleached — ideal for both culinary excellence and organic wellness beauty care.",
      image: "/slide-coconut-2.jpg",
      defaultPrice: 160,
      defaultMrp: 210,
    }
  ];

  // Helper to fetch live database price, mrp and stock
  const getProductData = (slug: string, defaultPrice: number, defaultMrp: number) => {
    const p = products.find(prod => prod.slug === slug);
    if (p) {
      return {
        price: Number(p.price),
        mrp: p.mrp ? Number(p.mrp) : null,
        stock: p.stock,
      };
    }
    return {
      price: defaultPrice,
      mrp: defaultMrp,
      stock: 30,
    };
  };

  // Autoplay functionality
  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds slide duration
  };

  const stopAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  // Slide navigation
  const nextSlide = () => {
    stopAutoplay();
    setActiveIndex((prev) => (prev + 1) % slides.length);
    startAutoplay();
  };

  const prevSlide = () => {
    stopAutoplay();
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    startAutoplay();
  };

  const goToSlide = (idx: number) => {
    stopAutoplay();
    setActiveIndex(idx);
    startAutoplay();
  };

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div 
      className="relative w-full overflow-hidden select-none group/slider"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides Inner Container */}
      <div 
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide, idx) => {
          const { price, mrp, stock } = getProductData(slide.slug, slide.defaultPrice, slide.defaultMrp);
          const clickToBuyUrl = `https://wa.me/${whatsappPhone}?text=buy_${slide.slug}`;
          const isOutOfStock = stock <= 0;

          return (
            <div 
              key={idx}
              className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center px-4 md:px-12 py-10 lg:py-16"
            >
              {/* Left Column: Product Contents */}
              <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-left z-10">
                <div className="inline-flex items-center space-x-2 bg-[#e3eae0] border border-[#d2ded0]/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#053520] animate-fade-in">
                  <Award className="w-4.5 h-4.5 text-emerald-700" />
                  <span>{slide.tag}</span>
                </div>
                
                <div className="space-y-4">
                  <h2 className="font-serif text-4xl sm:text-5xl md:text-[60px] font-black text-slate-100 leading-[1.05] tracking-tight flex flex-col uppercase transition-all duration-500">
                    <span className="text-slate-100">{slide.titleStart}</span>
                    <span className="text-slate-100">{slide.titleMiddle}</span>
                    <span className="text-[#053520]">{slide.titleColor}</span>
                    <span className="text-amber-500">{slide.accentWord}</span>
                  </h2>
                  <div className="w-48 h-[3px] bg-gradient-to-r from-[#caa023] via-amber-400 to-transparent rounded-full mt-2" />
                </div>
                
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {slide.description}
                </p>

                {/* Rating indicator */}
                <div className="flex items-center space-x-1.5 text-xs text-amber-500 font-extrabold py-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-slate-400 text-[10px] sm:text-xs">(5.0 / 48 Reviews)</span>
                </div>

                {/* Dynamic pricing details */}
                <div className="flex items-baseline space-x-3 py-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Featured Price:</span>
                  {mrp && mrp > price && (
                    <span className="text-base line-through text-slate-500 font-semibold">
                      ₹{mrp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-black text-slate-100">
                    ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  {mrp && mrp > price && (
                    <span className="bg-emerald-950/60 border border-emerald-900 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                      Save ₹{(mrp - price).toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Hero CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {isOutOfStock ? (
                    <button
                      disabled
                      className="inline-flex items-center justify-center space-x-2 bg-slate-850 text-slate-500 font-black px-8 py-4 rounded-2xl border border-slate-800 text-sm tracking-wide cursor-not-allowed"
                    >
                      <span>Out of Stock</span>
                    </button>
                  ) : (
                    <a
                      href={clickToBuyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center space-x-2 bg-[#053520] hover:bg-[#032013] text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-[#053520]/10 hover:shadow-[#053520]/20 text-sm tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Smartphone className="w-4 h-4 stroke-[2.5]" />
                      <span>Order on WhatsApp</span>
                    </a>
                  )}
                  
                  <a
                    href="#catalog"
                    className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-[#053520] font-black px-8 py-4 rounded-2xl border-2 border-amber-500/40 hover:border-amber-500/70 text-sm tracking-wide transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-amber-500/5"
                  >
                    <span>Browse All Oils</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </a>
                </div>
              </div>

              {/* Right Column: Premium Showcase Image Card */}
              <div className="lg:col-span-5 relative flex justify-center z-10">
                <div className="w-full max-w-sm sm:max-w-md bg-white border border-[#e3eae0] p-3.5 rounded-[40px] shadow-2xl relative overflow-hidden card-3d preserve-3d perspective-1000">
                  {/* Ambient organic glows */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
                  
                  <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden border border-[#e3eae0] relative shadow-inner bg-slate-950 preserve-3d">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={slide.image} 
                      alt={slide.titleColor} 
                      className="w-full h-full object-cover depth-image scale-100 group-hover/slider:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slider Left/Right Arrows (Desktop Only) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-950/60 backdrop-blur-md border border-slate-850 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 rounded-full items-center justify-center transition-all opacity-0 group-hover/slider:opacity-100 active:scale-90 hidden sm:flex z-30"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-slate-950/60 backdrop-blur-md border border-slate-850 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 rounded-full items-center justify-center transition-all opacity-0 group-hover/slider:opacity-100 active:scale-90 hidden sm:flex z-30"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Slider Bullets Navigation */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-2.5 z-30">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === idx ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
