import React, { useState, useMemo, useEffect } from 'react';
import { TestPackage, LabPartner, Language, CategoryItem, BookingHistoryItem } from '../types';
import { TRANSLATIONS } from '../translations';
import { calculateAccessoriesFee } from './BookingModal';
import { TestCard } from './TestCard';
import { LabLogo } from './LabLogo';
import { Button } from './Button';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ShoppingBag, 
  Trash2, 
  FlaskConical, 
  ChevronRight,
  Home,
  CheckCircle2,
  Building2,
  X,
  Flame,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface TestsViewProps {
  tests: TestPackage[];
  labs: LabPartner[];
  categories?: CategoryItem[];
  cart: string[];
  toggleCart: (test: TestPackage) => void;
  removeFromCart: (id: string) => void;
  openCartModal: () => void;
  lang: Language;
  selectedLabId: string;
  setSelectedLabId: (id: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onBackToHome: () => void;
  highlightedTestId?: string | null;
  setHighlightedTestId?: (id: string | null) => void;
  bookings?: BookingHistoryItem[];
}

export const TestsView: React.FC<TestsViewProps> = ({
  tests,
  labs,
  categories = [],
  cart,
  toggleCart,
  removeFromCart,
  openCartModal,
  lang,
  selectedLabId,
  setSelectedLabId,
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  onBackToHome,
  highlightedTestId,
  setHighlightedTestId,
  bookings = []
}) => {
  const t = TRANSLATIONS[lang];
  const [sortBy, setSortBy] = useState<'most_ordered' | 'price_low' | 'price_high' | 'name_asc'>('most_ordered');

  // Auto-scroll to highlighted test smoothly
  useEffect(() => {
    if (highlightedTestId) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`test-card-${highlightedTestId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [highlightedTestId]);

  // Calculate total completed/ordered count for each test (combining test order count + live bookings)
  const getTestTotalOrders = useMemo(() => {
    const defaultPopularityMap: Record<string, number> = {
      '1': 1420, // CBC
      '2': 1180, // HbA1c
      '3': 950,  // Lipid Profile
      '4': 840,  // Thyroid Profile
      '5': 790,  // Vitamin D
      '6': 720,  // Serum Creatinine
      '7': 680,  // SGPT / ALT
      '8': 650,  // FBS
      '9': 590,  // Urine R/E
      '10': 510, // Serum Electrolytes
      '11': 470, // Uric Acid
      '12': 430, // Bilirubin
    };

    return (test: TestPackage): number => {
      let count = test.orderCount !== undefined ? test.orderCount : (defaultPopularityMap[test.id] || 120);
      
      if (bookings && bookings.length > 0) {
        bookings.forEach(b => {
          if (b.items && Array.isArray(b.items)) {
            const matched = b.items.filter(item => 
              (item.id && item.id === test.id) ||
              (item.name && (item.name.toLowerCase().includes(test.name.toLowerCase()) || test.name.toLowerCase().includes(item.name.toLowerCase())))
            );
            count += matched.length;
          } else if (b.testNames && Array.isArray(b.testNames)) {
            const matched = b.testNames.filter(tn => 
              tn.toLowerCase().includes(test.name.toLowerCase()) || test.name.toLowerCase().includes(tn.toLowerCase())
            );
            count += matched.length;
          }
        });
      }

      return count;
    };
  }, [bookings]);

  // Derive visible categories list
  const activeCategoriesList = ['All', ...Array.from(new Set([
    ...categories.filter(c => !c.isHidden).map(c => c.name),
    ...tests.filter(t => !t.isHidden).map(t => t.category).filter(Boolean)
  ]))];

  // Filter and sort tests (Default: Most ordered / popular tests first)
  const filteredTests = useMemo(() => {
    return tests
      .filter(test => {
        if (test.isHidden) return false;
        if (selectedLabId && test.hiddenLabs?.includes(selectedLabId)) return false;
        const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = activeCategory === 'All' || test.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'most_ordered') {
          return getTestTotalOrders(b) - getTestTotalOrders(a);
        }
        const priceA = (selectedLabId && a.priceByLab?.[selectedLabId] !== undefined) ? a.priceByLab[selectedLabId] : a.price;
        const priceB = (selectedLabId && b.priceByLab?.[selectedLabId] !== undefined) ? b.priceByLab[selectedLabId] : b.price;
        
        if (sortBy === 'price_low') {
          return priceA - priceB;
        }
        if (sortBy === 'price_high') {
          return priceB - priceA;
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return getTestTotalOrders(b) - getTestTotalOrders(a);
      });
  }, [tests, selectedLabId, searchTerm, activeCategory, sortBy, getTestTotalOrders]);

  const cartItems = tests.filter(test => cart.includes(test.id));
  
  const selectedLab = labs.find(l => l.id === selectedLabId);
  const serviceCharge = selectedLab ? selectedLab.serviceCharge : 0;

  const subTotal = cartItems.reduce((sum, item) => {
    if (selectedLabId && item.priceByLab && item.priceByLab[selectedLabId]) {
      return sum + item.priceByLab[selectedLabId];
    }
    return sum + item.price;
  }, 0);

  const accessoriesFee = calculateAccessoriesFee(cartItems.length);
  const totalBill = subTotal + (cartItems.length > 0 ? serviceCharge : 0) + accessoriesFee;
  const visibleLabs = labs.filter(l => !l.isHidden);

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <button 
              onClick={onBackToHome}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Home size={14} />
              <span>{t.navHome}</span>
            </button>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="text-slate-800 font-semibold">{t.sectionTestsTitle}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {t.sectionTestsTitle}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
                {lang === 'bn' 
                  ? 'আপনার পছন্দের ডায়াগনস্টিক ল্যাব নির্বাচন করুন, প্রয়োজনীয় টেস্ট বাছাই করুন এবং হোম কালেকশন বুক করুন।'
                  : 'Compare prices across top accredited diagnostic labs, add your required tests to cart, and schedule home sample collection.'}
              </p>
            </div>

            {/* Quick Lab Switcher Pill Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Building2 size={14} /> {lang === 'bn' ? 'সেন্টার:' : 'Partner:'}
              </span>
              <button
                onClick={() => setSelectedLabId('')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !selectedLabId 
                    ? 'bg-primary text-white shadow-xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {t.allCenters}
              </button>
              {visibleLabs.map(lab => (
                <button
                  key={lab.id}
                  onClick={() => setSelectedLabId(lab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedLabId === lab.id 
                      ? 'bg-primary text-white shadow-xs' 
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <LabLogo name={lab.name} logo={lab.logo} size="xs" accentColor={lab.accentColor} className="!w-4 !h-4 !rounded-sm !p-0 border-none" />
                  <span>{lab.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDEBAR: FILTERS (Hidden on mobile, visible on desktop/laptop) */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0 space-y-6">
            
            {/* Lab Partner Filter */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Building2 size={16} className="text-primary" /> {t.filterByCenter}
                </h3>
                {selectedLabId && (
                  <button 
                    onClick={() => setSelectedLabId('')} 
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-colors ${!selectedLabId ? 'border-primary' : 'border-slate-300'}`}>
                    {!selectedLabId && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <input type="radio" className="hidden" checked={!selectedLabId} onChange={() => setSelectedLabId('')} />
                  <span className={`text-xs ${!selectedLabId ? 'text-slate-900 font-bold' : 'text-slate-600 group-hover:text-primary'}`}>
                    {t.allCenters}
                  </span>
                </label>

                {visibleLabs.map(lab => (
                  <label key={lab.id} className="flex items-center gap-2.5 cursor-pointer group p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${selectedLabId === lab.id ? 'border-primary' : 'border-slate-300'}`}>
                      {selectedLabId === lab.id && <div className="w-2 h-2 bg-primary rounded-full" />}
                    </div>
                    <input type="radio" className="hidden" checked={selectedLabId === lab.id} onChange={() => setSelectedLabId(lab.id)} />
                    <LabLogo name={lab.name} logo={lab.logo} size="xs" accentColor={lab.accentColor} className="!w-6 !h-6 !rounded-md" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${selectedLabId === lab.id ? 'text-slate-900 font-bold' : 'text-slate-600 group-hover:text-primary'}`}>
                        {lab.name}
                      </p>
                      {lab.discountBadge && (
                        <span className="text-[10px] text-emerald-600 font-semibold">{lab.discountBadge}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Filter size={16} className="text-teal-600" /> {t.filterByCategory}
                </h3>
                {activeCategory !== 'All' && (
                  <button 
                    onClick={() => setActiveCategory('All')} 
                    className="text-[11px] text-teal-600 hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {activeCategoriesList.map(cat => {
                  const catObj = categories.find(c => c.name.toLowerCase() === cat.toLowerCase());
                  const displayName = lang === 'bn' 
                    ? (catObj?.nameBn || t.categories[cat as keyof typeof t.categories] || cat)
                    : (t.categories[cat as keyof typeof t.categories] || cat);

                  return (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-colors ${activeCategory === cat ? 'border-teal-500' : 'border-slate-300'}`}>
                        {activeCategory === cat && <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />}
                      </div>
                      <input type="radio" className="hidden" checked={activeCategory === cat} onChange={() => setActiveCategory(cat)} />
                      <span className={`text-xs ${activeCategory === cat ? 'text-slate-900 font-bold' : 'text-slate-600 group-hover:text-teal-600'}`}>
                        {displayName}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* CENTER: SEARCH BAR & TESTS GRID */}
          <div className="flex-1">
            
            {/* Search & Sort Controls Row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 shadow-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-slate-800 text-sm bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
                    <ArrowUpDown size={14} className="text-primary flex-shrink-0" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent border-none outline-none font-semibold text-slate-800 cursor-pointer pr-2"
                    >
                      <option value="most_ordered">🔥 {lang === 'bn' ? 'সর্বাধিক টেস্ট সম্পন্ন (জনপ্রিয়)' : 'Most Ordered (Popular)'}</option>
                      <option value="price_low">৳ {lang === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}</option>
                      <option value="price_high">৳ {lang === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}</option>
                      <option value="name_asc">🔤 {lang === 'bn' ? 'নাম অনুসারে (A-Z)' : 'Name (A to Z)'}</option>
                    </select>
                  </div>
                </div>

                <div className="hidden sm:flex items-center px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex-shrink-0">
                  <span>{filteredTests.length} {lang === 'bn' ? 'টি টেস্ট' : 'tests'}</span>
                </div>
              </div>
            </div>

            {/* Sub-header info bar: Sorted by most popular / completed */}
            {sortBy === 'most_ordered' && (
              <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-amber-50/80 border border-amber-200/70 rounded-xl mb-5 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Flame size={15} className="text-amber-600 flex-shrink-0 animate-bounce" />
                  <span className="font-semibold">
                    {lang === 'bn' 
                      ? 'সর্বাধিক সম্পন্ন হওয়া টেস্টগুলো ক্রমান্বয়ে সবার উপরে সাজানো রয়েছে' 
                      : 'Tests are sorted by highest completed orders first'}
                  </span>
                </div>
                <span className="hidden md:inline-block text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  {lang === 'bn' ? 'জনপ্রিয় ক্রম' : 'Top Booked'}
                </span>
              </div>
            )}

            {/* Test Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTests.map(test => (
                <div key={test.id} className="h-full">
                  <TestCard 
                    test={test} 
                    onToggleCart={toggleCart} 
                    isInCart={cart.includes(test.id)}
                    lang={lang} 
                    labName={selectedLabId ? labs.find(l => l.id === selectedLabId)?.name : t.allCenters}
                    selectedLabId={selectedLabId}
                    isHighlighted={highlightedTestId === test.id}
                    orderCount={getTestTotalOrders(test)}
                  />
                </div>
              ))}
            </div>

            {filteredTests.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                <FlaskConical size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-semibold mb-1">{t.noTestsFound}</p>
                <p className="text-xs text-slate-400 mb-4">
                  {lang === 'bn' 
                    ? 'ভিন্ন কীওয়ার্ড দিয়ে খুঁজুন অথবা ফিল্টার রিসেট করুন।' 
                    : 'Try searching with a different keyword or reset filters.'}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchTerm(''); setActiveCategory('All'); setSelectedLabId(''); }}
                  className="!text-xs"
                >
                  {lang === 'bn' ? 'সকল ফিল্টার রিসেট করুন' : 'Reset All Filters'}
                </Button>
              </div>
            )}

          </div>

          {/* RIGHT: SELECTED TESTS (CART SUMMARY) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <ShoppingBag size={18} className="text-primary" /> 
                  <span>{t.selectedTests}</span>
                </h3>
                <span className="bg-sky-100 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              </div>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                  <FlaskConical size={40} className="mx-auto text-slate-300 mb-2 opacity-60" />
                  <p className="text-xs text-slate-500 font-medium">{t.noTestsSelected}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'bn' ? 'টেস্ট কার্ড থেকে Add to Booking করুন' : 'Click Add to Booking on any test'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5 mb-5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-sky-200 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {selectedLabId ? (item.priceByLab?.[selectedLabId] || item.price) : item.price} ৳
                          </p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                          title="Remove test"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{t.cartSubtotal}</span>
                      <span className="font-semibold text-slate-800">৳ {subTotal}</span>
                    </div>
                    {accessoriesFee > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>{t.accessoriesFee || (lang === 'bn' ? 'টিউব, নিডল ও এক্সেসরিজ' : 'Tube, Needle & Accessories')}</span>
                        <span className="font-semibold text-slate-800">৳ {accessoriesFee}</span>
                      </div>
                    )}
                    {serviceCharge > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>{t.serviceCharge}</span>
                        <span className="font-semibold text-slate-800">৳ {serviceCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                      <span>{t.cartTotal}</span>
                      <span className="text-primary text-base">৳ {totalBill}</span>
                    </div>
                    
                    <Button onClick={openCartModal} fullWidth className="mt-4 !rounded-xl !py-2.5 font-bold shadow-xs">
                      {t.checkoutBtn}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
