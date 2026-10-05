
import React from 'react';
import { TestPackage, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { ShoppingCart, Check, Building2, Clock, Tag } from 'lucide-react';

interface TestCardProps {
  test: TestPackage;
  onToggleCart: (test: TestPackage) => void;
  isInCart: boolean;
  lang: Language;
  labName?: string;
  selectedLabId?: string;
  isHighlighted?: boolean;
  orderCount?: number;
}

export const TestCard: React.FC<TestCardProps> = ({ 
  test, 
  onToggleCart, 
  isInCart, 
  lang, 
  labName, 
  selectedLabId, 
  isHighlighted,
  orderCount 
}) => {
  const t = TRANSLATIONS[lang];

  const totalOrders = orderCount ?? test.orderCount;

  // Determine current discounted selling price
  const currentPrice = (selectedLabId && test.priceByLab && test.priceByLab[selectedLabId] !== undefined) 
    ? test.priceByLab[selectedLabId] 
    : test.price;

  // Determine original regular price before discount
  const regularPrice = (selectedLabId && test.originalPriceByLab && test.originalPriceByLab[selectedLabId] !== undefined)
    ? test.originalPriceByLab[selectedLabId]
    : test.originalPrice;

  // Discount calculation
  const hasDiscount = regularPrice !== undefined && regularPrice > currentPrice;
  const savings = hasDiscount ? regularPrice - currentPrice : 0;
  const discountPercent = hasDiscount 
    ? (test.discountPercent || Math.round(((regularPrice - currentPrice) / regularPrice) * 100))
    : 0;

  return (
    <div 
      id={`test-card-${test.id}`}
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col h-full group relative ${
        isHighlighted
          ? 'border-primary ring-4 ring-primary/30 shadow-xl scale-[1.01] bg-gradient-to-b from-sky-50/40 via-white to-white'
          : 'border-slate-200/80 hover:border-primary hover:shadow-lg'
      }`}
    >
      {/* Prominent Highlight Badge if selected from popular diagnostics */}
      {isHighlighted && (
        <div className="absolute top-0 right-0 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-sky-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-bl-xl shadow-xs animate-pulse">
            <span>✨</span>
            <span>{lang === 'bn' ? 'বাছাইকৃত টেস্ট' : 'Selected Test'}</span>
          </span>
        </div>
      )}
      
      {/* Top Row: Category, Discount Badge, Order Count & Turnaround Time */}
      <div className="p-4 pb-2 flex justify-between items-center gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
            {test.category}
          </span>
          {typeof totalOrders === 'number' && totalOrders > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-md shadow-2xs">
              <span>🔥</span>
              <span>{totalOrders > 999 ? `${(totalOrders / 1000).toFixed(1)}k` : totalOrders}+ {lang === 'bn' ? 'সম্পন্ন' : 'Done'}</span>
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-md shadow-2xs">
              <Tag size={10} className="text-rose-600" />
              <span>{discountPercent}% {lang === 'bn' ? 'ছাড়' : 'OFF'}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex-shrink-0">
          <Clock size={11} />
          <span>{test.turnaroundTime}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 flex flex-col flex-grow pt-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug mb-1">
          {test.name}
        </h3>
        
        {/* Lab Info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
          <Building2 size={12} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{labName}</span>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">
          {test.description}
        </p>
      </div>

      {/* Footer: Price (Regular Strikethrough + Discount Price) & Button */}
      <div className="p-4 pt-2.5 mt-auto border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
        <div className="flex flex-col">
          {hasDiscount ? (
            <>
              <div className="flex items-center gap-1.5 leading-none mb-0.5">
                <span className="text-xs text-slate-400 font-semibold line-through">
                  ৳ {regularPrice}
                </span>
                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200/60">
                  -{discountPercent}%
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-black text-slate-900">৳ {currentPrice}</span>
                <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">
                  ({lang === 'bn' ? `সাশ্রয় ৳${savings}` : `Save ৳${savings}`})
                </span>
              </div>
            </>
          ) : (
            <div>
              <span className="text-[10px] text-slate-400 block font-medium leading-none mb-0.5">
                {lang === 'bn' ? 'মূল্য' : 'Price'}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900">৳ {currentPrice}</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => onToggleCart(test)} 
          className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 shadow-xs active:scale-95 whitespace-nowrap ${
              isInCart 
              ? 'bg-slate-900 text-white hover:bg-slate-800' 
              : 'bg-primary text-white hover:bg-sky-600'
          }`}
        >
          {isInCart ? (
            <>
              <Check size={15} />
              <span>{t.addedBtn}</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} />
              <span>{t.bookBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
