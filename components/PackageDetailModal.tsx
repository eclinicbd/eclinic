import React, { useState } from 'react';
import { HealthPackage, Language, LabPartner } from '../types';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Droplet, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  ShoppingCart, 
  Check, 
  Building2, 
  Calendar, 
  Tag, 
  AlertCircle,
  Stethoscope,
  Info
} from 'lucide-react';
import { Button } from './Button';
import { LabLogo } from './LabLogo';

interface PackageDetailModalProps {
  packageData: HealthPackage | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAddToCart: (pkgId: string) => void;
  onDirectBook: (pkgId: string, labId?: string) => void;
  isInCart: boolean;
  labs: LabPartner[];
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  packageData,
  isOpen,
  onClose,
  lang,
  onAddToCart,
  onDirectBook,
  isInCart,
  labs
}) => {
  const [selectedLabId, setSelectedLabId] = useState<string>('');

  if (!isOpen || !packageData) return null;

  // Lab price calculation
  const getPackagePrice = () => {
    if (selectedLabId && packageData.priceByLab && packageData.priceByLab[selectedLabId]) {
      return packageData.priceByLab[selectedLabId];
    }
    return packageData.price;
  };

  const getPackageOriginalPrice = () => {
    if (selectedLabId && packageData.originalPriceByLab && packageData.originalPriceByLab[selectedLabId]) {
      return packageData.originalPriceByLab[selectedLabId];
    }
    return packageData.originalPrice;
  };

  const currentPrice = getPackagePrice();
  const currentOriginalPrice = getPackageOriginalPrice();
  const savings = currentOriginalPrice && currentOriginalPrice > currentPrice 
    ? currentOriginalPrice - currentPrice 
    : 0;

  const discountPercent = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : (packageData.discountPercent || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[92vh] flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-sky-900 via-primary to-cyan-800 text-white p-6 pb-7">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/20">
              <Sparkles size={13} className="text-yellow-300" />
              {lang === 'bn' ? `${packageData.testCount} টি টেস্টের প্যাকেজ` : `${packageData.testCount} Tests Package`}
            </span>
            {packageData.category && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-400/20 text-sky-100 border border-sky-300/30">
                {packageData.category}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-slate-900 shadow-sm flex items-center gap-1">
                <Tag size={12} />
                {discountPercent}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {packageData.name}
          </h2>
          {packageData.tagline && (
            <p className="text-sky-100 text-sm mt-1 font-medium">
              {packageData.tagline}
            </p>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center">
              <Clock size={18} className="text-sky-600 mb-1" />
              <span className="text-[11px] text-slate-500 font-medium">{lang === 'bn' ? 'রিপোর্ট ডেলিভারি' : 'Turnaround'}</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5">{packageData.turnaroundTime}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center">
              <Droplet size={18} className="text-rose-500 mb-1" />
              <span className="text-[11px] text-slate-500 font-medium">{lang === 'bn' ? 'স্যাম্পল টাইপ' : 'Sample Type'}</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5">{packageData.sampleType || (lang === 'bn' ? 'রক্ত ও প্রস্রাব' : 'Blood & Urine')}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center">
              <AlertCircle size={18} className="text-amber-500 mb-1" />
              <span className="text-[11px] text-slate-500 font-medium">{lang === 'bn' ? 'খালি পেটে থাকা' : 'Fasting'}</span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1">{packageData.fastingRequirement || (lang === 'bn' ? 'প্রযোজ্য' : 'Required')}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center">
              <ShieldCheck size={18} className="text-emerald-600 mb-1" />
              <span className="text-[11px] text-slate-500 font-medium">{lang === 'bn' ? 'হোম কালেকশন' : 'Home Sample'}</span>
              <span className="text-xs font-bold text-emerald-700 mt-0.5">{lang === 'bn' ? 'ফ্রি সার্ভিস' : 'Included'}</span>
            </div>
          </div>

          {/* Description */}
          {packageData.description && (
            <div className="bg-sky-50/60 rounded-xl p-4 border border-sky-100">
              <div className="flex items-start gap-2.5">
                <Info size={18} className="text-primary mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {packageData.description}
                </p>
              </div>
            </div>
          )}

          {/* Included Tests List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope size={18} className="text-primary" />
                <span>{lang === 'bn' ? `প্যাকেজে অন্তর্ভুক্ত ${packageData.testCount} টি টেস্ট:` : `Included Tests (${packageData.testCount}):`}</span>
              </h3>
              <span className="text-xs font-semibold text-primary bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                {lang === 'bn' ? '১০০% নির্ভুল ডায়াগনস্টিক' : 'Certified Labs'}
              </span>
            </div>

            <div className="space-y-2.5">
              {packageData.testDetails && packageData.testDetails.length > 0 ? (
                packageData.testDetails.map((td, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50/40 border border-slate-100 transition-colors flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">{td.name}</h4>
                        {td.sample && (
                          <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                            {td.sample}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">{td.purpose}</p>
                    </div>
                  </div>
                ))
              ) : (
                packageData.includededTests?.map((testName, index) => (
                  <div 
                    key={index}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{testName}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended For & Preparation */}
          {(packageData.recommendedFor || packageData.fastingRequirement) && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              {packageData.recommendedFor && (
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="font-bold">{lang === 'bn' ? 'যাদের জন্য উপযুক্ত: ' : 'Recommended For: '}</strong>
                  {packageData.recommendedFor}
                </div>
              )}
              {packageData.fastingRequirement && (
                <div className="text-xs text-amber-800 leading-relaxed flex items-center gap-1.5 pt-1 border-t border-amber-200/60">
                  <AlertCircle size={14} className="text-amber-700 shrink-0" />
                  <span><strong>{lang === 'bn' ? 'প্রস্তুতি: ' : 'Preparation: '}</strong>{packageData.fastingRequirement}</span>
                </div>
              )}
            </div>
          )}

          {/* Lab Selection & Price Comparison */}
          {labs && labs.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                <Building2 size={15} className="text-primary" />
                <span>{lang === 'bn' ? 'ল্যাব নির্বাচন করুন (ল্যাব অনুযায়ী মূল্য দেখতে ক্লিক করুন):' : 'Select Partner Lab (View lab-specific price):'}</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLabId('')}
                  className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                    selectedLabId === ''
                      ? 'border-primary bg-sky-50/80 font-bold text-primary ring-2 ring-primary/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold truncate">{lang === 'bn' ? 'স্ট্যান্ডার্ড ল্যাব' : 'Standard Labs'}</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">৳ {packageData.price}</div>
                </button>

                {labs.filter(l => !l.isHidden && !packageData.hiddenLabs?.includes(l.id)).slice(0, 7).map(lab => {
                  const labPrice = packageData.priceByLab?.[lab.id] || packageData.price;
                  const isSelected = selectedLabId === lab.id;

                  return (
                    <button
                      key={lab.id}
                      type="button"
                      onClick={() => setSelectedLabId(lab.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-sky-50/80 font-bold text-primary ring-2 ring-primary/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold truncate" title={lab.name}>{lab.name}</div>
                      <div className="text-[11px] text-slate-600 font-semibold mt-0.5">৳ {labPrice}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Price & Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {lang === 'bn' ? 'সর্বমোট প্যাকেজ মূল্য' : 'Package Price'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  ৳ {currentPrice.toLocaleString()}
                </span>
                {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                  <span className="text-sm font-bold text-slate-400 line-through">
                    ৳ {currentOriginalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {savings > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                {lang === 'bn' ? `সাশ্রয় ৳ ${savings}` : `Save ৳${savings}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant={isInCart ? "outline" : "secondary"}
              onClick={() => onAddToCart(packageData.id)}
              className="flex-1 sm:flex-initial py-2.5 px-4 text-xs font-bold"
            >
              {isInCart ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Check size={15} />
                  {lang === 'bn' ? 'কার্টে যুক্ত' : 'In Cart'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <ShoppingCart size={15} />
                  {lang === 'bn' ? 'কার্ট এ রাখুন' : 'Add to Cart'}
                </span>
              )}
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                onClose();
                onDirectBook(packageData.id, selectedLabId || undefined);
              }}
              className="flex-1 sm:flex-initial py-2.5 px-6 text-xs font-bold shadow-md shadow-sky-200"
            >
              <span className="flex items-center gap-1.5">
                <Calendar size={15} />
                {lang === 'bn' ? 'এখনই বুক করুন' : 'Book Package'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
