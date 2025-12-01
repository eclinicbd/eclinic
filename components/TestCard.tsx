
import React from 'react';
import { TestPackage, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { ShoppingCart, Check, Building2, Clock } from 'lucide-react';

interface TestCardProps {
  test: TestPackage;
  onToggleCart: (test: TestPackage) => void;
  isInCart: boolean;
  lang: Language;
  labName?: string;
  selectedLabId?: string;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onToggleCart, isInCart, lang, labName, selectedLabId }) => {
  const t = TRANSLATIONS[lang];

  // Determine Price
  const currentPrice = (selectedLabId && test.priceByLab && test.priceByLab[selectedLabId]) 
    ? test.priceByLab[selectedLabId] 
    : test.price;

  return (
    <div className="bg-white rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full">
      
      {/* Top Row: Category & Time */}
      <div className="p-4 pb-2 flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-500 rounded-sm">
          {test.category}
        </span>
        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <Clock size={12} />
          <span>{test.turnaroundTime}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">
          {test.name}
        </h3>
        
        {/* Lab Info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <Building2 size={12} />
          <span className="truncate">{labName}</span>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">
          {test.description}
        </p>
      </div>

      {/* Footer: Price & Button */}
      <div className="p-4 pt-2 mt-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
           <span className="text-lg font-bold text-slate-800">৳ {currentPrice}</span>
        </div>
        
        <button 
          onClick={() => onToggleCart(test)} 
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-sm active:scale-95 ${
              isInCart 
              ? 'bg-slate-800 text-white' 
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {isInCart ? (
            <>
              <Check size={16} />
              <span>{t.addedBtn}</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>{t.bookBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
