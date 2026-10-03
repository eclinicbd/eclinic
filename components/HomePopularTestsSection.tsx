import React, { useRef, useState, useEffect } from 'react';
import { TestPackage, Language, LabPartner } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Tag, 
  Clock, 
  ShoppingCart, 
  Check, 
  Building2, 
  ArrowRight,
  Flame,
  Pause,
  Play,
  Activity,
  Award
} from 'lucide-react';
import { Button } from './Button';

interface HomePopularTestsSectionProps {
  tests: TestPackage[];
  lang: Language;
  onToggleCart: (test: TestPackage) => void;
  onDirectBook?: (testId: string, labId?: string) => void;
  cart: string[];
  labs: LabPartner[];
  selectedLabId?: string;
  onNavigateToTests: (categoryId?: string, labId?: string, search?: string, highlightTestId?: string) => void;
  badge?: string;
  title?: string;
  description?: string;
  btnText?: string;
}

export const HomePopularTestsSection: React.FC<HomePopularTestsSectionProps> = ({
  tests,
  lang,
  onToggleCart,
  onDirectBook,
  cart,
  labs,
  selectedLabId,
  onNavigateToTests,
  badge,
  title,
  description,
  btnText
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Maximum 12 most ordered tests
  const popularTests = tests.filter(t => !t.isHidden).slice(0, 12);

  // Auto-scroll single row effect
  useEffect(() => {
    if (popularTests.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If reached end, reset to start smoothly
        if (scrollLeft + clientWidth >= scrollWidth - 25) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one card width (~320px)
          scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 3400);

    return () => clearInterval(interval);
  }, [popularTests.length, isPaused]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (popularTests.length === 0) return null;

  return (
    <section className="py-16 bg-white border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Flame size={13} className="text-rose-500 fill-rose-500 animate-pulse" />
              <span>{badge || (lang === 'bn' ? 'সবচেয়ে বেশি অর্ডারকৃত টেস্ট (সর্বোচ্চ ১২টি)' : 'Most Ordered Diagnostic Tests (Top 12)')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title || (lang === 'bn' ? 'জনপ্রিয় ডায়াগনস্টিক টেস্টসমূহ' : 'Most Popular & Ordered Tests')}
            </h2>
            
            <p className="text-slate-600 text-sm mt-1.5 max-w-2xl">
              {description || (lang === 'bn' 
                ? 'সবচেয়ে বেশি বুকিং হওয়া শীর্ষ ১২টি স্বাস্থ্য পরীক্ষা। পছন্দের ল্যাব নির্বাচন করে ঘরে বসেই দক্ষ টেকনোলজিস্টের মাধ্যমে রক্ত সংগ্রহ বুক করুন।' 
                : 'Browse our 12 most frequently ordered diagnostics with certified blood sample collection right at your home.')}
            </p>
          </div>

          {/* Controls: Nav buttons + View all button */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
            {/* Auto-scroll pause toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
              title={isPaused ? (lang === 'bn' ? 'স্ক্রোল চালু করুন' : 'Resume auto-scroll') : (lang === 'bn' ? 'স্ক্রোল থামান' : 'Pause auto-scroll')}
            >
              {isPaused ? <Play size={11} className="text-emerald-600 fill-emerald-600" /> : <Pause size={11} className="text-slate-600" />}
              <span>{isPaused ? (lang === 'bn' ? 'অটো-স্ক্রোল বন্ধ' : 'Paused') : (lang === 'bn' ? 'অটো-স্ক্রোল' : 'Auto-Scroll')}</span>
            </button>

            {/* Scroll buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleScroll('left')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-primary transition-all shadow-xs active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-primary transition-all shadow-xs active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <Button 
              onClick={onNavigateToTests} 
              variant="outline" 
              className="!text-xs py-2 px-3.5"
            >
              {btnText || (lang === 'bn' ? 'সকল টেস্ট দেখুন (১০০+)' : 'Browse All 100+ Tests')} &rarr;
            </Button>
          </div>
        </div>

        {/* Auto-Scrolling Single Row Carousel */}
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex flex-nowrap gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth no-scrollbar select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {popularTests.map((test, index) => {
            const isInCart = cart.includes(test.id);

            // Determine dynamic lab price
            const currentPrice = (selectedLabId && test.priceByLab && test.priceByLab[selectedLabId] !== undefined)
              ? test.priceByLab[selectedLabId]
              : test.price;

            const regularPrice = (selectedLabId && test.originalPriceByLab && test.originalPriceByLab[selectedLabId] !== undefined)
              ? test.originalPriceByLab[selectedLabId]
              : test.originalPrice;

            const hasDiscount = regularPrice !== undefined && regularPrice > currentPrice;
            const savings = hasDiscount ? regularPrice - currentPrice : 0;
            const discountPercent = hasDiscount
              ? (test.discountPercent || Math.round(((regularPrice - currentPrice) / regularPrice) * 100))
              : 0;

            const labDisplayName = selectedLabId 
              ? labs.find(l => l.id === selectedLabId)?.name 
              : (lang === 'bn' ? 'পপুলার, ল্যাবএইড, বারডেমসহ সব ল্যাব' : 'Popular, Labaid, BIRDEM & all labs');

            return (
              <div
                key={test.id}
                onClick={() => onNavigateToTests('All', selectedLabId, '', test.id)}
                className="w-72 sm:w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-200/90 hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden cursor-pointer active:scale-[0.99]"
              >
                {/* Ranking Tag on Top Left Corner */}
                <div className="absolute top-0 left-0 pointer-events-none">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-br-xl shadow-xs">
                    <span>#{index + 1}</span>
                    <span className="font-bold text-[9px] uppercase tracking-wider">
                      {index === 0 ? (lang === 'bn' ? 'টপ চয়েস' : 'Top Choice') : (lang === 'bn' ? 'জনপ্রিয়' : 'Popular')}
                    </span>
                  </span>
                </div>

                {/* Top Meta: Category & Turnaround */}
                <div className="p-4 pt-4 pb-2 flex justify-between items-center gap-2 pl-24">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {test.category}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex-shrink-0">
                    <Clock size={10} />
                    <span>{test.turnaroundTime}</span>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="px-4 flex flex-col flex-grow pt-1.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.75rem]">
                    {test.name}
                  </h3>

                  {/* Lab Availability Indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-2">
                    <Building2 size={12} className="text-primary/70 flex-shrink-0" />
                    <span className="truncate text-[11px] font-medium">{labDisplayName}</span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3 flex-grow">
                    {test.description}
                  </p>

                  {/* Discount / Savings Callout */}
                  {hasDiscount && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-md">
                        <Tag size={10} className="text-rose-600" />
                        <span>{discountPercent}% {lang === 'bn' ? 'ছাড়' : 'OFF'}</span>
                        <span className="text-slate-400 font-normal ml-0.5">({lang === 'bn' ? `সাশ্রয় ৳${savings}` : `Save ৳${savings}`})</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer / Price & Action Buttons */}
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2.5 mt-auto"
                >
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 font-semibold line-through leading-none mb-0.5">
                          ৳ {regularPrice}
                        </span>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900">৳ {currentPrice}</span>
                      </div>
                    </div>

                    {/* Quick 1-Click Direct Book Button if handler exists */}
                    {onDirectBook && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDirectBook(test.id, selectedLabId);
                        }}
                        className="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{lang === 'bn' ? 'ইনস্ট্যান্ট বুক' : 'Direct Book'}</span>
                        <ArrowRight size={11} />
                      </button>
                    )}
                  </div>

                  {/* Add to Booking / Added Toggle Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCart(test);
                    }}
                    variant={isInCart ? 'secondary' : 'primary'}
                    className={`w-full !py-2.5 !text-xs font-bold justify-center transition-all cursor-pointer ${
                      isInCart
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                        : 'shadow-sm shadow-sky-100 hover:shadow-md'
                    }`}
                  >
                    {isInCart ? (
                      <>
                        <Check size={14} className="mr-1.5 text-emerald-600" />
                        <span>{lang === 'bn' ? 'বুকিংয়ে যুক্ত রয়েছে' : 'Added to Booking'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} className="mr-1.5" />
                        <span>Add to Booking</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button - Show all 100+ tests */}
        <div className="mt-8 flex justify-center pt-3 border-t border-slate-100">
          <Button 
            onClick={() => onNavigateToTests('All', '', '')} 
            className="px-8 py-3 shadow-sm text-xs sm:text-sm font-bold cursor-pointer"
          >
            {btnText || (lang === 'bn' ? 'ডায়াগনস্টিক সেন্টারের সকল টেস্ট ক্যাটালগ দেখুন' : 'Browse All 100+ Tests')} &rarr;
          </Button>
        </div>

      </div>
    </section>
  );
};
