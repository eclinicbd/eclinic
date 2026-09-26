import React, { useState, useEffect, useRef } from 'react';
import { TestPackage, BookingFormData, Language, LabPartner, BookingHistoryItem, PatientUser } from '../types';
import { getLabs } from '../constants';
import { TRANSLATIONS } from '../translations';
import { Button } from './Button';
import { 
  X, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle, 
  Clock, 
  Trash2, 
  ChevronRight, 
  Loader2, 
  ShoppingBag, 
  FileText, 
  Upload, 
  Stethoscope, 
  FlaskConical, 
  MessageSquare, 
  Search, 
  Plus, 
  Sparkles, 
  Building2,
  Tag,
  Check
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: TestPackage[];
  onRemoveItem: (id: string) => void;
  lang: Language;
  preSelectedLabId?: string;
  onClearCart?: () => void;
  allTests?: TestPackage[];
  onAddTest?: (test: TestPackage) => void;
  labsList?: LabPartner[];
  onBookingConfirmed?: (booking: BookingHistoryItem) => void;
  currentPatient?: PatientUser | null;
  onOpenAuthModal?: () => void;
}

// 1-hour ranges
const TIME_SLOTS = [
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM", 
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM"
];

// Helper to get next 7 days
const getNext7Days = (lang: Language) => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      fullDate: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' }),
      dayNumber: d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric' }),
      month: d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short' })
    });
  }
  return days;
};

// Helper to check if a slot is available
const isSlotAvailable = (dateStr: string, slotStr: string): boolean => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // If date is in the future, all slots are available
  if (dateStr !== todayStr) return true;

  const now = new Date();
  const minTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); 

  const startTimeStr = slotStr.split(' - ')[0];
  const [time, modifier] = startTimeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  let slotDate = new Date();
  let h = parseInt(hours, 10);
  
  if (h === 12) h = 0;
  if (modifier === 'PM') h += 12;
  
  slotDate.setHours(h, parseInt(minutes, 10), 0, 0);

  return slotDate > minTime;
};

export const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  lang, 
  preSelectedLabId, 
  onClearCart, 
  allTests = [], 
  onAddTest,
  labsList,
  onBookingConfirmed,
  currentPatient,
  onOpenAuthModal
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search and autocomplete suggestions state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];
  
  // Get all active labs
  const rawLabs = (labsList && labsList.length > 0 ? labsList : getLabs(lang)).filter(l => !l.isHidden);
  // Filter out labs that are hidden for any items in cart
  const availableLabsForCart = rawLabs.filter(l => !cartItems.some(item => item.hiddenLabs?.includes(l.id)));
  const labs = availableLabsForCart.length > 0 ? availableLabsForCart : rawLabs;
  const nextDays = getNext7Days(lang);

  const [formData, setFormData] = useState<BookingFormData>({
    fullName: currentPatient?.name || '',
    phoneNumber: currentPatient?.phone || '',
    address: currentPatient?.address || '',
    date: '',
    time: '',
    testIds: [],
    labId: preSelectedLabId || (labs[0]?.id || 'lab_popular'),
    doctorName: '',
    prescription: null
  });

  // Handle outside clicks to close search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect 1: Reset state ONLY when Modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchTerm('');
      setIsSearchFocused(false);
      
      const days = getNext7Days(lang);
      let bestDate = days[0].fullDate;

      for (const day of days) {
        const hasAvailableSlots = TIME_SLOTS.some(slot => isSlotAvailable(day.fullDate, slot));
        if (hasAvailableSlots) {
          bestDate = day.fullDate;
          break;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        fullName: currentPatient?.name || prev.fullName || '',
        phoneNumber: currentPatient?.phone || prev.phoneNumber || '',
        address: currentPatient?.address || prev.address || '',
        date: bestDate,
        testIds: cartItems.map(t => t.id),
        labId: prev.labId || preSelectedLabId || (labs[0]?.id || 'lab_popular'), 
      }));
      setIsSubmitting(false);
    }
  }, [isOpen, lang, currentPatient, preSelectedLabId]);

  // Effect 2: Sync cart items if they change
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        testIds: cartItems.map(t => t.id)
      }));
    }
  }, [cartItems, isOpen]);

  // Effect 3: Scroll to top when step changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [step]);

  // Reset time if selected date changes and time becomes invalid
  useEffect(() => {
    if (formData.date && formData.time) {
      if (!isSlotAvailable(formData.date, formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    }
  }, [formData.date]);

  if (!isOpen) return null;

  // Calculate bill based on selected lab
  const getItemPrice = (item: TestPackage, labId?: string) => {
    const targetLab = labId || formData.labId;
    if (targetLab && item.priceByLab && item.priceByLab[targetLab] !== undefined) {
      return item.priceByLab[targetLab];
    }
    return item.price;
  };

  const getItemRegularPrice = (item: TestPackage, labId?: string) => {
    const targetLab = labId || formData.labId;
    if (targetLab && item.originalPriceByLab && item.originalPriceByLab[targetLab] !== undefined) {
      return item.originalPriceByLab[targetLab];
    }
    return item.originalPrice;
  };

  const selectedLab = labs.find(l => l.id === formData.labId) || labs[0];
  const serviceCharge = selectedLab ? selectedLab.serviceCharge : 0;
  
  const subTotal = cartItems.reduce((sum, item) => sum + getItemPrice(item), 0);
  const regularSubTotal = cartItems.reduce((sum, item) => sum + (getItemRegularPrice(item) || getItemPrice(item)), 0);
  const totalSavings = regularSubTotal > subTotal ? regularSubTotal - subTotal : 0;
  const totalBill = subTotal + (cartItems.length > 0 ? serviceCharge : 0);

  // Suggestions search logic: matches name (en/bn), category, tags, or description
  const cleanSearch = searchTerm.trim().toLowerCase();
  const availableToAddTests = allTests.filter(test => !cartItems.some(item => item.id === test.id));

  const suggestedTests = cleanSearch 
    ? availableToAddTests.filter(test => {
        const nameMatch = (test.name || '').toLowerCase().includes(cleanSearch);
        const catMatch = (test.category || '').toLowerCase().includes(cleanSearch);
        const descMatch = (test.description || '').toLowerCase().includes(cleanSearch);
        return nameMatch || catMatch || descMatch;
      }).slice(0, 8)
    : availableToAddTests.slice(0, 6); // default popular recommendations when focused

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (onBookingConfirmed) {
      const newBooking: BookingHistoryItem = {
        id: "BK-" + Math.floor(1000 + Math.random() * 9000),
        customerName: formData.fullName || (lang === 'bn' ? 'কাস্টমার' : 'Customer'),
        customerPhone: formData.phoneNumber || 'N/A',
        customerAddress: formData.address || '',
        date: formData.date,
        time: formData.time,
        labId: formData.labId,
        labName: selectedLab?.name || 'Popular Diagnostic Centre',
        testNames: cartItems.map(t => t.name),
        totalCost: totalBill,
        status: 'pending',
        doctorName: formData.doctorName,
        createdAt: new Date().toISOString()
      };
      onBookingConfirmed(newBooking);
    }

    setIsSubmitting(false);
    setStep(3);
  };

  const handleClose = () => {
    onClose();
  };

  const handleBackToHome = () => {
    if (onClearCart) {
      onClearCart();
    }
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, prescription: e.target.files[0] });
    }
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return t.step1;
      case 2: return t.step2;
      case 3: return t.step3;
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] border border-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b flex justify-between items-center bg-slate-50/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              {step === 1 && <ShoppingBag size={18} className="text-primary" />}
              {step === 2 && <User size={18} className="text-primary" />}
              {step === 3 && <CheckCircle size={18} className="text-emerald-500" />}
              <span>{getStepTitle()}</span>
            </h2>
            <p className="text-[11px] text-slate-500">{t.step1.split(" ")[0]} {step} / 3</p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-grow space-y-5">
          
          {/* STEP 1: Cart Review, Lab Selection & Test Search Suggestions */}
          {step === 1 && (
            <div className="space-y-5">

              {/* 1. SELECT DIAGNOSTIC LAB (Always available & interactive) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 size={16} className="text-primary" />
                    <span>{t.selectLab || (lang === 'bn' ? 'ডায়াগনস্টিক ল্যাব নির্বাচন করুন' : 'Select Diagnostic Lab')}</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {labs.length} {lang === 'bn' ? 'টি অনুমোদিত ল্যাব' : 'Partner Labs'}
                  </span>
                </div>

                {/* Lab Selection Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {labs.map(lab => {
                    const isSelected = formData.labId === lab.id;
                    return (
                      <div 
                        key={lab.id}
                        onClick={() => setFormData(prev => ({ ...prev, labId: lab.id }))}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all select-none ${
                          isSelected 
                            ? 'border-primary bg-sky-50/80 ring-2 ring-primary/20 shadow-xs' 
                            : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={lab.logo} 
                            alt={lab.name} 
                            className="w-8 h-8 rounded-full object-cover bg-white border border-slate-200 shrink-0" 
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-800 truncate leading-tight">
                              {lab.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-amber-500 text-[10px]">⭐ {lab.rating}</span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-500">
                                {lab.serviceCharge === 0 ? (lang === 'bn' ? 'ফ্রি কালেকশন' : 'Free Home Visit') : `৳${lab.serviceCharge}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-1 ${
                          isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check size={10} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. SEARCH & ADD TEST AUTOCOMPLETE */}
              {onAddTest && allTests.length > 0 && (
                <div ref={searchContainerRef} className="space-y-1.5 pt-2 border-t border-slate-100 relative">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Search size={14} className="text-primary" />
                    <span>{t.searchAndAddPlaceholder || (lang === 'bn' ? 'টেস্ট খুঁজুন ও যোগ করুন' : 'Search & Add More Tests')}</span>
                  </label>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input 
                      type="text" 
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all focus:bg-white"
                      placeholder={lang === 'bn' ? 'টেস্টের নাম লিখুন (যেমন: CBC, Lipid, HbA1c, Thyroid...)' : 'Type test name (e.g. CBC, Sugar, Lipid Profile, TSH...)'}
                      value={searchTerm}
                      onFocus={() => setIsSearchFocused(true)}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsSearchFocused(true);
                      }}
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')} 
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Smart Suggestions Dropdown */}
                  {isSearchFocused && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150 custom-scrollbar">
                      
                      {/* Suggestion Header */}
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Sparkles size={12} className="text-primary" />
                          {searchTerm 
                            ? (lang === 'bn' ? `পাওয়া গেছে (${suggestedTests.length} টি)` : `Matching Tests (${suggestedTests.length})`)
                            : (lang === 'bn' ? 'জনপ্রিয় টেস্টসমূহ' : 'Popular Diagnostic Tests')}
                        </span>
                        <span className="text-[10px] text-slate-400">{selectedLab?.name.split(' ')[0]}</span>
                      </div>

                      {/* Suggestions List */}
                      {suggestedTests.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {suggestedTests.map(test => {
                            const testPrice = getItemPrice(test);
                            const regPrice = getItemRegularPrice(test);
                            const hasDiscount = regPrice && regPrice > testPrice;

                            return (
                              <div
                                key={test.id}
                                className="p-2.5 sm:p-3 hover:bg-sky-50/70 transition-colors flex items-center justify-between gap-3 group"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                                      {test.name}
                                    </p>
                                    {test.category && (
                                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium shrink-0">
                                        {test.category}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-xs font-black text-primary">৳{testPrice}</span>
                                    {hasDiscount && (
                                      <span className="text-[10px] line-through text-slate-400">৳{regPrice}</span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    onAddTest(test);
                                    setSearchTerm('');
                                    setIsSearchFocused(false);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-primary hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all shrink-0 cursor-pointer"
                                >
                                  <Plus size={13} />
                                  <span>{lang === 'bn' ? 'যোগ করুন' : 'Add'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400">
                          {lang === 'bn' ? 'কোনো টেস্ট পাওয়া যায়নি।' : 'No matching tests found.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. CART ITEMS LIST */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-800">
                    {t.selectTest || (lang === 'bn' ? 'নির্বাচিত টেস্টসমূহ' : 'Selected Tests')}
                  </label>
                  <span className="text-xs bg-sky-100 text-primary font-bold px-2 py-0.5 rounded-full">
                    {cartItems.length} {lang === 'bn' ? 'টি' : 'items'}
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <ShoppingBag size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500 text-xs font-medium">{t.cartEmpty}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {lang === 'bn' ? 'উপরের সার্চ বার থেকে টেস্ট যোগ করুন' : 'Search and add tests from above'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {cartItems.map((item) => {
                      const itemPrice = getItemPrice(item);
                      const itemRegularPrice = getItemRegularPrice(item);
                      const hasDiscount = itemRegularPrice !== undefined && itemRegularPrice > itemPrice;
                      const discountPercent = hasDiscount 
                        ? (item.discountPercent || Math.round(((itemRegularPrice - itemPrice) / itemRegularPrice) * 100))
                        : 0;

                      return (
                        <div 
                          key={item.id} 
                          className="bg-white border border-slate-200/90 p-2.5 sm:p-3 rounded-xl flex items-center gap-3 hover:border-sky-300 transition-colors shadow-2xs"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" 
                          />
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-slate-800 text-xs sm:text-sm truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {hasDiscount && (
                                <span className="line-through text-slate-400 text-[11px]">৳{itemRegularPrice}</span>
                              )}
                              <span className="text-primary font-black text-xs">৳{itemPrice}</span>
                              {hasDiscount && (
                                <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200/60">
                                  -{discountPercent}%
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                            title={t.removeItem}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bill Summary */}
                {cartItems.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{t.cartSubtotal}</span>
                      <span className="font-semibold">৳{subTotal}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/80 font-medium">
                        <span>{lang === 'bn' ? 'মোট ডিসকাউন্ট সাশ্রয়:' : 'Total Discount:'}</span>
                        <span className="font-bold">- ৳{totalSavings}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>{t.serviceCharge} ({selectedLab?.name.split(' ')[0]})</span>
                      <span className="font-semibold">
                        {serviceCharge === 0 ? (lang === 'bn' ? 'ফ্রি' : 'Free') : `৳${serviceCharge}`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-slate-900 font-bold">
                      <span className="text-xs">{t.cartTotal}</span>
                      <span className="text-base font-black text-primary">৳{totalBill}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 1 Actions */}
              <div className="pt-2">
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={cartItems.length === 0}
                  className="w-full py-3 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>{lang === 'bn' ? 'তারিখ ও সময় নির্বাচন করুন' : 'Continue to Schedule'}</span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Patient Info, Date & Time Selection */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Patient Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User size={14} className="text-primary" />
                    <span>{t.patientDetails || (lang === 'bn' ? 'রোগীর তথ্য' : 'Patient Information')}</span>
                  </label>
                  {!currentPatient && onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      {lang === 'bn' ? 'লগইন থাকলে অটো ফিল হবে' : 'Log in to auto-fill'}
                    </button>
                  )}
                </div>

                <div>
                  <input 
                    type="text" 
                    required
                    placeholder={lang === 'bn' ? 'রোগীর পুরো নাম *' : 'Full Name *'}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <input 
                    type="tel" 
                    required
                    placeholder={lang === 'bn' ? 'মোবাইল নম্বর * (০১৭XXXXXXXX)' : 'Phone Number *'}
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <textarea 
                    rows={2}
                    required
                    placeholder={lang === 'bn' ? 'স্যাম্পল কালেকশনের পূর্ণ ঠিকানা *' : 'Full Address for Sample Collection *'}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  <span>{t.selectDate || (lang === 'bn' ? 'তারিখ নির্বাচন করুন' : 'Select Date')}</span>
                </label>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {nextDays.map((d) => {
                    const isSelected = formData.date === d.fullDate;
                    return (
                      <button
                        key={d.fullDate}
                        type="button"
                        onClick={() => setFormData({ ...formData, date: d.fullDate })}
                        className={`p-2 rounded-xl text-center flex-1 min-w-[62px] border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50'
                        }`}
                      >
                        <p className="text-[10px] uppercase font-bold opacity-80">{d.dayName}</p>
                        <p className="text-base font-black leading-tight my-0.5">{d.dayNumber}</p>
                        <p className="text-[10px] opacity-80">{d.month}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock size={14} className="text-primary" />
                  <span>{t.selectTime || (lang === 'bn' ? 'সময়সূচি নির্বাচন করুন' : 'Select Time Slot')}</span>
                </label>

                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                  {TIME_SLOTS.map((slot) => {
                    const available = isSlotAvailable(formData.date, slot);
                    const isSelected = formData.time === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!available}
                        onClick={() => setFormData({ ...formData, time: slot })}
                        className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          !available
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-primary/50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Doctor / Prescription (Optional) */}
              <div className="pt-2 border-t border-slate-100">
                <input 
                  type="text"
                  placeholder={lang === 'bn' ? 'রেফারকারী চিকিৎসকের নাম (ঐচ্ছিক)' : 'Referring Doctor Name (Optional)'}
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              {/* Step 2 Actions */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  {lang === 'bn' ? 'পেছনে' : 'Back'}
                </button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.time || !formData.fullName || !formData.phoneNumber || !formData.address}
                  className="flex-1 py-2.5 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>{lang === 'bn' ? 'কনফার্ম হচ্ছে...' : 'Confirming...'}</span>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>{lang === 'bn' ? 'বুকিং নিশ্চিত করুন' : 'Confirm Booking'}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Booking Success State */}
          {step === 3 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle size={36} />
              </div>
              
              <h3 className="text-xl font-extrabold text-slate-900">
                {lang === 'bn' ? 'বুকিং সফলভাবে সম্পন্ন হয়েছে!' : 'Booking Confirmed!'}
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                {lang === 'bn' 
                  ? 'আপনার টেস্ট বুকিং গ্রহণ করা হয়েছে। ল্যাব টেকনিশিয়ান নির্ধারিত সময়ে আপনার ঠিকানায় উপস্থিত হবেন।'
                  : 'Your booking has been received. A certified phlebotomist will visit your address at the scheduled time.'}
              </p>

              {/* Booking Summary Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'bn' ? 'ডায়াগনস্টিক ল্যাব:' : 'Lab:'}</span>
                  <span className="font-bold text-slate-800">{selectedLab?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'bn' ? 'তারিখ ও সময়:' : 'Schedule:'}</span>
                  <span className="font-bold text-slate-800">{formData.date} ({formData.time})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{lang === 'bn' ? 'মোট বিল:' : 'Total Amount:'}</span>
                  <span className="font-black text-primary text-sm">৳{totalBill}</span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
                <Button onClick={handleBackToHome} className="w-full sm:w-auto">
                  {lang === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
