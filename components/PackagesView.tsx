import React, { useState, useMemo } from 'react';
import { HealthPackage, Language, LabPartner } from '../types';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Droplet, 
  Tag, 
  ShoppingCart, 
  Check, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  HeartHandshake, 
  Building2, 
  Calendar,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Button } from './Button';

interface PackagesViewProps {
  packages: HealthPackage[];
  lang: Language;
  onAddToCart: (pkgId: string) => void;
  onDirectBook: (pkgId: string, labId?: string) => void;
  cart: string[];
  onOpenDetailModal: (pkg: HealthPackage) => void;
  labs: LabPartner[];
  selectedLabId?: string;
  onSelectLab?: (labId: string) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  lang,
  onAddToCart,
  onDirectBook,
  cart,
  onOpenDetailModal,
  labs,
  selectedLabId,
  onSelectLab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filterOptions = [
    { id: 'All', labelBn: 'সকল প্যাকেজ', labelEn: 'All Packages' },
    { id: '4_tests', labelBn: '৪টি টেস্টের প্যাকেজ', labelEn: '4-Test Packages' },
    { id: '10_tests', labelBn: '১০টি টেস্টের ফুল বডি', labelEn: '10-Test Full Body' },
    { id: 'Full Body', labelBn: 'ফুল বডি চেকআপ', labelEn: 'Full Body' },
    { id: 'Diabetes', labelBn: 'ডায়াবেটিস স্পেশাল', labelEn: 'Diabetes' },
    { id: 'Heart', labelBn: 'কার্ডিয়াক ওয়েলনেস', labelEn: 'Cardiac' },
    { id: 'Women', labelBn: 'নারী স্বাস্থ্য', labelEn: 'Women Care' },
    { id: 'Senior', labelBn: 'সিনিয়র সিটিজেন', labelEn: 'Seniors' }
  ];

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      if (pkg.isHidden) return false;

      // Filter category or testCount
      if (activeFilter === '4_tests' && pkg.testCount !== 4) return false;
      if (activeFilter === '10_tests' && pkg.testCount !== 10) return false;
      if (activeFilter !== 'All' && activeFilter !== '4_tests' && activeFilter !== '10_tests' && pkg.category !== activeFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = pkg.name.toLowerCase().includes(term);
        const matchesDesc = pkg.description?.toLowerCase().includes(term);
        const matchesTagline = pkg.tagline?.toLowerCase().includes(term);
        const matchesTests = pkg.includededTests?.some(t => t.toLowerCase().includes(term));
        return matchesName || matchesDesc || matchesTagline || matchesTests;
      }

      return true;
    });
  }, [packages, activeFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-sky-900 via-primary to-cyan-900 text-white pt-14 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-200 text-xs font-bold mb-4">
              <Sparkles size={14} className="text-amber-300" />
              <span>{lang === 'bn' ? 'সাশ্রয়ী মূল্যে সম্পূর্ণ স্বাস্থ্য প্যাকেজ' : 'Affordable Full Diagnostic Health Panels'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              {lang === 'bn' ? 'এসেনশিয়াল হোম ডায়াগনস্টিক প্যাকেজ' : 'Essential Home Diagnostic Packages'}
            </h1>

            <p className="text-sm sm:text-base text-sky-100 max-w-2xl mx-auto leading-relaxed">
              {lang === 'bn' 
                ? 'একক টেস্টের চেয়ে প্যাকেজে খরচ বাঁচান ৪০% পর্যন্ত। ৪টি প্রাথমিক টেস্ট থেকে শুরু করে ১০টি টেস্টের এক্সিকিউটিভ ফুল বডি প্যানেল—ঘরে বসেই নিরাপদ স্যাম্পল কালেকশন।'
                : 'Save up to 40% on comprehensive diagnostic bundles. From 4-test routine screening to 10-test full body executive panels with free doorstep sample collection.'}
            </p>

            {/* Search Bar */}
            <div className="mt-8 mb-2 max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'প্যাকেজ বা যেকোনো টেস্টের নাম দিয়ে খুঁজুন (যেমন: CBC, Sugar, ৪টি টেস্ট)...' : 'Search by package name or tests (e.g. CBC, Lipid, 10 Tests)...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-800 placeholder-slate-400 text-sm shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-300/40"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-100 rounded-md"
                  >
                    {lang === 'bn' ? 'মুছুন' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20">
        {/* Filter Pills */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-slate-200/90 mb-10 sm:mb-12 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1">
              <Filter size={14} />
              {lang === 'bn' ? 'ফিল্টার:' : 'Filter:'}
            </span>

            {filterOptions.map((opt) => {
              const isActive = activeFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveFilter(opt.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-sky-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  }`}
                >
                  {lang === 'bn' ? opt.labelBn : opt.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-8 pt-2">
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            {lang === 'bn' 
              ? `মোট ${filteredPackages.length} টি প্যাকেজ পাওয়া গেছে` 
              : `Found ${filteredPackages.length} Health Packages`}
          </p>

          {/* Quick trust badges */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck size={16} />
              {lang === 'bn' ? '১০০% সার্টিফাইড ল্যাব' : 'ISO & CAP Labs'}
            </span>
            <span className="flex items-center gap-1.5 text-sky-700">
              <Clock size={16} />
              {lang === 'bn' ? '১২-২৪ ঘন্টায় রিপোর্ট' : 'Fast Online Reports'}
            </span>
          </div>
        </div>

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 max-w-md mx-auto my-12">
            <Layers size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {lang === 'bn' ? 'কোনো প্যাকেজ পাওয়া যায়নি' : 'No Packages Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {lang === 'bn' 
                ? 'অন্য কোনো নাম দিয়ে সার্চ করুন অথবা ফিল্টার পরিবর্তন করুন।' 
                : 'Try searching with different keywords or clear the category filters.'}
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setActiveFilter('All'); setSearchTerm(''); }}
              className="text-xs"
            >
              {lang === 'bn' ? 'সব ফিল্টার রিসেট করুন' : 'Reset All Filters'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-9 mb-12">
            {filteredPackages.map((pkg) => {
              const isInCart = cart.includes(pkg.id);
              const originalPrice = (selectedLabId && pkg.originalPriceByLab?.[selectedLabId]) || pkg.originalPrice;
              const price = (selectedLabId && pkg.priceByLab?.[selectedLabId]) || pkg.price;
              const discount = originalPrice && originalPrice > price 
                ? Math.round(((originalPrice - price) / originalPrice) * 100)
                : (pkg.discountPercent || 0);

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent"></div>

                    {/* Badge top-left: test count */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-sky-950/80 backdrop-blur-md text-white text-xs font-black border border-white/20 flex items-center gap-1 shadow-md">
                        <Sparkles size={12} className="text-amber-300" />
                        {lang === 'bn' ? `${pkg.testCount} টি টেস্ট` : `${pkg.testCount} Tests`}
                      </span>
                      {pkg.popularBadge && (
                        <span className={`px-2.5 py-1 rounded-lg text-white text-[11px] font-extrabold shadow-md ${pkg.badgeColor || 'bg-emerald-600'}`}>
                          {pkg.popularBadge}
                        </span>
                      )}
                    </div>

                    {/* Badge top-right: discount */}
                    {discount > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1">
                          <Tag size={12} />
                          {discount}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
                        </span>
                      </div>
                    )}

                    {/* Title inside banner */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base font-extrabold leading-snug line-clamp-2 drop-shadow-sm">
                        {pkg.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {pkg.tagline && (
                        <p className="text-xs font-medium text-slate-600 mb-3 line-clamp-2">
                          {pkg.tagline}
                        </p>
                      )}

                      {/* Included Tests Pill Preview */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {lang === 'bn' ? `অন্তর্ভুক্ত ${pkg.testCount} টি টেস্ট:` : `Included (${pkg.testCount}) Tests:`}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenDetailModal(pkg)}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            {lang === 'bn' ? 'বিস্তারিত' : 'View All'} &rarr;
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {pkg.includededTests?.slice(0, 4).map((testName, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                              <span className="truncate font-medium">{testName}</span>
                            </div>
                          ))}
                          {pkg.includededTests && pkg.includededTests.length > 4 && (
                            <button
                              type="button"
                              onClick={() => onOpenDetailModal(pkg)}
                              className="text-[11px] font-bold text-sky-700 hover:text-sky-900 pl-1 block text-left"
                            >
                              + {lang === 'bn' ? `আরও ${pkg.includededTests.length - 4} টি টেস্ট দেখুন...` : `and ${pkg.includededTests.length - 4} more tests...`}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quick Specs */}
                      <div className="flex items-center justify-between py-2 border-y border-slate-100 text-[11px] text-slate-500 mb-4">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock size={13} className="text-sky-600" />
                          {pkg.turnaroundTime}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Droplet size={13} className="text-rose-500" />
                          {pkg.sampleType || (lang === 'bn' ? 'ব্লাড স্যাম্পল' : 'Blood Sample')}
                        </span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div>
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            {lang === 'bn' ? 'প্যাকেজ মূল্য' : 'Total Price'}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                              ৳ {price.toLocaleString()}
                            </span>
                            {originalPrice && originalPrice > price && (
                              <span className="text-xs font-bold text-slate-400 line-through">
                                ৳ {originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {originalPrice && originalPrice > price && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {lang === 'bn' ? `সাশ্রয় ৳ ${originalPrice - price}` : `Save ৳${originalPrice - price}`}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => onOpenDetailModal(pkg)}
                          className="py-2.5 px-3 text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
                        >
                          <Info size={14} className="mr-1" />
                          {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                        </Button>

                        <Button
                          variant={isInCart ? "outline" : "primary"}
                          onClick={() => onAddToCart(pkg.id)}
                          className={`py-2.5 px-3 text-xs font-bold ${
                            isInCart 
                              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
                              : 'shadow-md shadow-sky-100'
                          }`}
                        >
                          {isInCart ? (
                            <span className="flex items-center justify-center gap-1">
                              <Check size={14} />
                              {lang === 'bn' ? 'কার্টে যুক্ত' : 'In Cart'}
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              <ShoppingCart size={14} />
                              {lang === 'bn' ? 'কার্টে যোগ' : 'Add to Cart'}
                            </span>
                          )}
                        </Button>
                      </div>

                      {/* Direct Book CTA */}
                      <button
                        type="button"
                        onClick={() => onDirectBook(pkg.id, selectedLabId)}
                        className="w-full mt-2 py-2 text-center text-xs font-bold text-primary hover:text-sky-800 hover:underline flex items-center justify-center gap-1"
                      >
                        <span>{lang === 'bn' ? 'সরাসরি এই প্যাকেজটি বুক করুন' : 'Quick Instant Booking'}</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Why Choose Packages Callout */}
        <section className="mt-16 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              {lang === 'bn' ? 'কেন ল্যাবহোম ডায়াগনস্টিক প্যাকেজ বেছে নেবেন?' : 'Why Choose LabHome Diagnostic Packages?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {lang === 'bn' ? 'সম্পূর্ণ নিরাপদ ও ঝামেলাহীন স্বাস্থ্যসেবা' : 'Hospital-standard safety and transparency right at your home'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-200">
                <Tag size={20} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                {lang === 'bn' ? '৪০% পর্যন্ত বড় সাশ্রয়' : 'Save Up to 40%'}
              </h4>
              <p className="text-xs text-slate-600">
                {lang === 'bn' ? 'আলাদা আলাদা টেস্ট করার চেয়ে প্যাকেজে অনেক বেশি সাশ্রয়ী।' : 'Bundled tests save substantial cost over individual diagnostics.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-200">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                {lang === 'bn' ? 'টপ-রেটেড ল্যাব পার্টনার' : 'Top Accredited Labs'}
              </h4>
              <p className="text-xs text-slate-600">
                {lang === 'bn' ? 'পপুলার, ল্যাবএইড, বারডেম এবং বিএসএমএমইউ ল্যাবে টেস্ট।' : 'High precision reports from CAP & ISO certified diagnostics.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-200">
                <Clock size={20} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                {lang === 'bn' ? 'দ্রুত ডিজিটাল রিপোর্ট' : 'Fast Online Report'}
              </h4>
              <p className="text-xs text-slate-600">
                {lang === 'bn' ? 'WhatsApp ও ড্যাশবোর্ডে সুরক্ষিত ডাউনলোডযোগ্য রিপোর্ট।' : 'Instant digital delivery to WhatsApp and customer dashboard.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200">
                <HeartHandshake size={20} />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                {lang === 'bn' ? 'প্রশিক্ষিত স্যাম্পল কালেক্টর' : 'Expert Phlebotomists'}
              </h4>
              <p className="text-xs text-slate-600">
                {lang === 'bn' ? 'ব্যথাহীন ও সম্পূর্ণ স্বাস্থ্যসম্মত স্যাম্পল কালেকশন।' : 'Hygienic, single-use vacuum tubes and certified personnel.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
