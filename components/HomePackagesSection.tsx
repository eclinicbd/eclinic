import React, { useRef, useState, useEffect } from 'react';
import { HealthPackage, Language, LabPartner } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Droplet, 
  ShoppingCart, 
  Check, 
  Info, 
  ArrowRight,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { Button } from './Button';

interface HomePackagesSectionProps {
  packages: HealthPackage[];
  lang: Language;
  onAddToCart: (pkgId: string) => void;
  onDirectBook: (pkgId: string, labId?: string) => void;
  cart: string[];
  onOpenDetailModal: (pkg: HealthPackage) => void;
  onNavigateToPackages: () => void;
  labs: LabPartner[];
  selectedLabId?: string;
  badge?: string;
  title?: string;
  description?: string;
  btnText?: string;
}

export const HomePackagesSection: React.FC<HomePackagesSectionProps> = ({
  packages,
  lang,
  onAddToCart,
  onDirectBook,
  cart,
  onOpenDetailModal,
  onNavigateToPackages,
  labs,
  selectedLabId,
  badge,
  title,
  description,
  btnText
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 360;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused]);

  const activePackages = packages.filter(p => !p.isHidden && (!selectedLabId || !p.hiddenLabs?.includes(selectedLabId)));

  if (activePackages.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 via-sky-50/30 to-white border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-amber-500" />
              <span>{badge || (lang === 'bn' ? 'বিশেষ সাশ্রয়ী প্যাকেজ' : 'Special Value Bundles')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title || (lang === 'bn' ? 'এসেনশিয়াল হোম ডায়াগনস্টিক প্যাকেজ' : 'Essential Home Diagnostic Packages')}
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
              {description || (lang === 'bn' 
                ? 'একক টেস্টের চেয়ে প্যাকেজে খরচ বাঁচান ৪০% পর্যন্ত। ৪টি টেস্টের প্রাথমিক স্ক্রিনিং থেকে ১০টি টেস্টের সম্পূর্ণ ফুল বডি চেকআপ।' 
                : 'Save up to 40% on standard packages. From 4-test routine screenings to 10-test full body diagnostic panels.')}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Scroll Navigation Arrows */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title={lang === 'bn' ? 'বামে স্ক্রোল করুন' : 'Scroll Left'}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title={lang === 'bn' ? 'ডানে স্ক্রোল করুন' : 'Scroll Right'}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <Button 
              onClick={onNavigateToPackages} 
              variant="outline" 
              className="!text-xs py-2 px-3.5 bg-white border-slate-200 hover:bg-slate-50 font-bold"
            >
              {btnText || (lang === 'bn' ? 'সকল প্যাকেজ দেখুন' : 'Explore All Packages')} &rarr;
            </Button>
          </div>
        </div>

        {/* Auto-scrolling Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div 
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar"
            style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activePackages.map((pkg) => {
              const isInCart = cart.includes(pkg.id);
              const originalPrice = (selectedLabId && pkg.originalPriceByLab?.[selectedLabId]) || pkg.originalPrice;
              const price = (selectedLabId && pkg.priceByLab?.[selectedLabId]) || pkg.price;
              const discount = originalPrice && originalPrice > price 
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : (pkg.discountPercent || 0);

              return (
                <div
                  key={pkg.id}
                  className="w-[300px] sm:w-[340px] flex-shrink-0 bg-white rounded-2xl border border-slate-200/90 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group snap-start"
                >
                  {/* Image Card Header */}
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-sky-950/90 backdrop-blur-md text-white text-[11px] font-black border border-white/20 flex items-center gap-1 shadow">
                        <Sparkles size={11} className="text-amber-300" />
                        {lang === 'bn' ? `${pkg.testCount} টি টেস্ট অন্তর্ভুক্ত` : `${pkg.testCount} Tests Bundle`}
                      </span>
                      {pkg.popularBadge && (
                        <span className={`px-2 py-0.5 rounded-lg text-white text-[10px] font-extrabold shadow ${pkg.badgeColor || 'bg-emerald-600'}`}>
                          {pkg.popularBadge}
                        </span>
                      )}
                    </div>

                    {discount > 0 && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-black shadow-md flex items-center gap-0.5">
                          <Tag size={11} />
                          {discount}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
                        </span>
                      </div>
                    )}

                    {/* Package Name */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h3 className="text-sm font-extrabold line-clamp-2 leading-snug drop-shadow-sm">
                        {pkg.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {pkg.tagline && (
                        <p className="text-[11px] font-medium text-slate-600 mb-2.5 line-clamp-2">
                          {pkg.tagline}
                        </p>
                      )}

                      {/* Included Tests Preview */}
                      <div className="mb-3">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">
                          {lang === 'bn' ? `অন্তর্ভুক্ত ${pkg.testCount} টি পরীক্ষা:` : `Included Tests (${pkg.testCount}):`}
                        </span>
                        <div className="space-y-1">
                          {pkg.includededTests?.slice(0, 3).map((testName, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                              <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                              <span className="truncate font-medium">{testName}</span>
                            </div>
                          ))}
                          {pkg.includededTests && pkg.includededTests.length > 3 && (
                            <button
                              type="button"
                              onClick={() => onOpenDetailModal(pkg)}
                              className="text-[10px] font-bold text-primary hover:underline pt-0.5 pl-1"
                            >
                              + {lang === 'bn' ? `আরও ${pkg.includededTests.length - 3} টি টেস্ট দেখুন` : `+${pkg.includededTests.length - 3} more tests`} &rarr;
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quick Meta */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 py-1.5 border-t border-slate-100 mb-3">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={11} className="text-sky-600" />
                          {pkg.turnaroundTime}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Droplet size={11} className="text-rose-500" />
                          {pkg.sampleType || (lang === 'bn' ? 'ব্লাড স্যাম্পল' : 'Blood')}
                        </span>
                      </div>
                    </div>

                    {/* Price & Cart Actions */}
                    <div>
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">
                            {lang === 'bn' ? 'প্যাকেজ মূল্য' : 'Special Price'}
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-black text-slate-900">
                              ৳ {price.toLocaleString()}
                            </span>
                            {originalPrice && originalPrice > price && (
                              <span className="text-[11px] font-bold text-slate-400 line-through">
                                ৳ {originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {originalPrice && originalPrice > price && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {lang === 'bn' ? `সাশ্রয় ৳${originalPrice - price}` : `Save ৳${originalPrice - price}`}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => onOpenDetailModal(pkg)}
                          className="py-2 px-2 text-[11px] font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
                        >
                          <Info size={13} className="mr-1" />
                          {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                        </Button>

                        <Button
                          variant={isInCart ? "outline" : "primary"}
                          onClick={() => onAddToCart(pkg.id)}
                          className={`py-2 px-2 text-[11px] font-bold ${
                            isInCart 
                              ? 'border-emerald-600 text-emerald-700 bg-emerald-50' 
                              : 'shadow-sm shadow-sky-100'
                          }`}
                        >
                          {isInCart ? (
                            <span className="flex items-center justify-center gap-1">
                              <Check size={13} />
                              {lang === 'bn' ? 'যুক্ত' : 'Added'}
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              <ShoppingCart size={13} />
                              <span>Add to Booking</span>
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
