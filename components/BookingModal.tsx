import React, { useState, useEffect, useRef } from 'react';
import { TestPackage, HealthPackage, LabPartner, Language, BookingHistoryItem, BookingFormData, PatientUser } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  ShoppingBag, 
  CheckCircle, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Copy,
  Printer,
  Download,
  Stethoscope,
  Search,
  Upload,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from './Button';
import { getStoredDateSlotConfig, isSlotAvailable, DEFAULT_TIME_SLOTS } from '../services/dataStorage';
import { getLabs } from '../constants';
import { printOrDownloadInvoice } from '../services/invoiceService';

// Helper to generate unique human-readable order ID: LH-YYMMDD-XXXX
export const generateUniqueOrderId = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LH-${year}${month}${day}-${randomChars}`;
};

// Formats order ID display
export const formatOrderId = (id: string): string => {
  if (!id) return '#LH-0000';
  if (id.startsWith('LH-') || id.startsWith('#')) return id;
  return `#LH-${id.slice(-6).toUpperCase()}`;
};

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: TestPackage[];
  onRemoveItem: (id: string) => void;
  lang: Language;
  preSelectedLabId?: string;
  onSelectLab?: (labId: string) => void;
  onClearCart?: () => void;
  allTests?: TestPackage[];
  onAddTest?: (test: TestPackage) => void;
  labsList?: LabPartner[];
  onBookingConfirmed?: (booking: BookingHistoryItem) => void;
  currentPatient?: PatientUser | null;
  onOpenAuthModal?: () => void;
  onNavigateToTests?: () => void;
}

// Helper to get active calendar booking days based on admin config
const getAvailableBookingDays = (lang: Language) => {
  const config = getStoredDateSlotConfig();
  const daysCount = config.advanceDays || 7;
  const weeklyHolidays = config.weeklyHolidays || [];
  const blockedDates = (config.blockedDates || []).map(b => b.date);

  const days = [];
  const today = new Date();
  
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    const year = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const fullDate = `${year}-${monthStr}-${dayStr}`;
    
    const dayOfWeek = d.getDay();
    const isWeeklyOff = weeklyHolidays.includes(dayOfWeek);
    const isBlocked = blockedDates.includes(fullDate);
    const isClosed = isWeeklyOff || isBlocked;
    
    let closedReason = '';
    if (isBlocked) {
      const blockedObj = (config.blockedDates || []).find(b => b.date === fullDate);
      closedReason = blockedObj?.reason || (lang === 'bn' ? 'ছুটি' : 'Holiday');
    } else if (isWeeklyOff) {
      closedReason = lang === 'bn' ? 'সাপ্তাহিক বন্ধ' : 'Weekly Off';
    }

    const dayNameEn = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthEn = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNumber = d.getDate();
    
    const bnDayNames: Record<string, string> = {
      Sun: 'রবি', Mon: 'সোম', Tue: 'মঙ্গল', Wed: 'বুধ', Thu: 'বৃহঃ', Fri: 'শুক্র', Sat: 'শনি'
    };
    const bnMonthNames: Record<string, string> = {
      Jan: 'জানু', Feb: 'ফেব্রু', Mar: 'মার্চ', Apr: 'এপ্রিল', May: 'মে', Jun: 'জুন',
      Jul: 'জুলাই', Aug: 'আগস্ট', Sep: 'সেপ্টে', Oct: 'অক্টো', Nov: 'নভে', Dec: 'ডিসে'
    };

    const dayName = lang === 'bn' ? (bnDayNames[dayNameEn] || dayNameEn) : dayNameEn;
    const month = lang === 'bn' ? (bnMonthNames[monthEn] || monthEn) : monthEn;

    days.push({
      fullDate,
      dayName,
      dayNumber,
      month,
      isClosed,
      closedReason
    });
  }
  return days;
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  lang, 
  preSelectedLabId, 
  onSelectLab,
  onClearCart, 
  allTests = [], 
  onAddTest,
  labsList,
  onBookingConfirmed,
  currentPatient,
  onOpenAuthModal,
  onNavigateToTests
}) => {
  const isBn = lang === 'bn';
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Search state for test suggestions in modal
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];
  
  // Active Labs list
  const rawLabs = (labsList && labsList.length > 0 ? labsList : getLabs(lang)).filter(l => !l.isHidden);
  const availableLabsForCart = rawLabs.filter(l => !cartItems.some(item => item.hiddenLabs?.includes(l.id)));
  const labs = availableLabsForCart.length > 0 ? availableLabsForCart : rawLabs;
  
  const slotConfig = getStoredDateSlotConfig();
  const availableBookingDays = getAvailableBookingDays(lang);
  const allTimeSlotItems = slotConfig.slots && slotConfig.slots.length > 0 ? slotConfig.slots : DEFAULT_TIME_SLOTS;
  const activeTimeSlots = allTimeSlotItems.filter(s => s.isActive);

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

  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize or reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchTerm('');
      setIsSearchFocused(false);
      setValidationError(null);
      
      const days = getAvailableBookingDays(lang);
      const currentActiveSlots = (getStoredDateSlotConfig().slots || DEFAULT_TIME_SLOTS).filter(s => s.isActive).map(s => s.time);
      
      let bestDate = '';
      for (const day of days) {
        if (!day.isClosed) {
          const hasAvailableSlots = currentActiveSlots.some(slot => isSlotAvailable(day.fullDate, slot));
          if (hasAvailableSlots) {
            bestDate = day.fullDate;
            break;
          }
        }
      }

      if (!bestDate && days.length > 0) {
        const firstOpenDay = days.find(d => !d.isClosed);
        bestDate = firstOpenDay ? firstOpenDay.fullDate : days[0].fullDate;
      }
      
      const effectiveLabId = preSelectedLabId || (labs.length > 0 ? labs[0].id : 'lab_popular');

      setFormData(prev => ({
        ...prev,
        fullName: currentPatient?.name || prev.fullName || '',
        phoneNumber: currentPatient?.phone || prev.phoneNumber || '',
        address: currentPatient?.address || prev.address || '',
        date: bestDate,
        time: '',
        testIds: cartItems.map(t => t.id),
        labId: effectiveLabId, 
      }));
      setIsSubmitting(false);
    }
  }, [isOpen, lang, currentPatient, preSelectedLabId]);

  // Sync when preSelectedLabId changes from parent
  useEffect(() => {
    if (preSelectedLabId) {
      setFormData(prev => ({
        ...prev,
        labId: preSelectedLabId
      }));
    }
  }, [preSelectedLabId]);

  // Sync cart items inside modal
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        testIds: cartItems.map(t => t.id)
      }));
    }
  }, [cartItems, isOpen]);

  // Scroll to top on step change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    setValidationError(null);
  }, [step]);

  // Reset time if selected date changes and current time is unavailable
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

  // Suggestions search logic
  const cleanSearch = searchTerm.trim().toLowerCase();
  const availableToAddTests = allTests.filter(test => !cartItems.some(item => item.id === test.id));

  const suggestedTests = cleanSearch 
    ? availableToAddTests.filter(test => {
        const nameMatch = (test.name || '').toLowerCase().includes(cleanSearch);
        const catMatch = (test.category || '').toLowerCase().includes(cleanSearch);
        const descMatch = (test.description || '').toLowerCase().includes(cleanSearch);
        return nameMatch || catMatch || descMatch;
      }).slice(0, 8)
    : availableToAddTests.slice(0, 6);

  const handleProceedToStep2 = () => {
    if (cartItems.length === 0) {
      setValidationError(isBn ? 'অনুগ্রহ করে অন্তত একটি টেস্ট কার্টে যোগ করুন।' : 'Please add at least one test to your cart.');
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || step === 3) return;

    // Friendly validation check
    if (!formData.fullName.trim()) {
      setValidationError(isBn ? 'অনুগ্রহ করে রোগীর পূর্ণ নাম লিখুন।' : 'Please enter patient full name.');
      return;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.replace(/[^0-9]/g, '').length < 10) {
      setValidationError(isBn ? 'অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন (১১ ডিজিট)।' : 'Please provide a valid 11-digit mobile number.');
      return;
    }
    if (!formData.address.trim()) {
      setValidationError(isBn ? 'স্যাম্পল কালেকশনের পূর্ণ ঠিকানা উল্লেখ করুন।' : 'Please enter full address for home sample collection.');
      return;
    }
    if (!formData.date) {
      setValidationError(isBn ? 'অনুগ্রহ করে অ্যাপয়েন্টমেন্টের তারিখ নির্বাচন করুন।' : 'Please select an appointment date.');
      return;
    }
    if (!formData.time) {
      setValidationError(isBn ? 'অনুগ্রহ করে একটি সময়সূচি (Time Slot) নির্বাচন করুন।' : 'Please select a preferred time slot.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const uniqueOrderId = generateUniqueOrderId();
    setConfirmedBookingId(uniqueOrderId);
    setCopiedId(false);

    if (onBookingConfirmed) {
      const newBooking: BookingHistoryItem = {
        id: uniqueOrderId,
        customerName: formData.fullName.trim(),
        customerPhone: formData.phoneNumber.trim(),
        customerAddress: formData.address.trim(),
        date: formData.date,
        time: formData.time,
        labId: formData.labId,
        labName: selectedLab?.name || 'Popular Diagnostic Centre',
        testNames: cartItems.map(t => t.name),
        totalCost: totalBill,
        status: 'pending',
        doctorName: formData.doctorName?.trim() || '',
        createdAt: new Date().toISOString()
      };
      onBookingConfirmed(newBooking);
    }

    setIsSubmitting(false);
    setStep(3);
  };

  const handleCopyOrderId = () => {
    if (confirmedBookingId) {
      navigator.clipboard.writeText(confirmedBookingId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handlePrint = () => {
    const orderObj: BookingHistoryItem = {
      id: confirmedBookingId || generateUniqueOrderId(),
      customerName: formData.fullName || 'Valued Patient',
      customerPhone: formData.phoneNumber || '017XXXXXXXX',
      customerAddress: formData.address || 'Dhaka, Bangladesh',
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
    printOrDownloadInvoice(orderObj, lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Container: Full-width bottom sheet on mobile, rounded card on desktop */}
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] border border-slate-100 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        
        {/* Top Header & Step Indicator */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5 flex-shrink-0 relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
                <Stethoscope size={18} className="text-sky-400" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white leading-none">
                  {isBn ? 'ল্যাব টেস্ট চেকআউট ও বুকিং' : 'Lab Test Booking & Checkout'}
                </h2>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {isBn ? 'সহজে ও দ্রুত হোম স্যাম্পল কালেকশন নিশ্চিত করুন' : 'Fast & reliable doorstep diagnostic service'}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Clean Step Progress Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { num: 1, title: isBn ? '১. ল্যাব ও টেস্ট' : '1. Lab & Tests' },
              { num: 2, title: isBn ? '২. রোগী ও সময়' : '2. Schedule' },
              { num: 3, title: isBn ? '৩. কনফার্মেশন' : '3. Confirmed' },
            ].map((sItem) => {
              const isCurrent = step === sItem.num;
              const isDone = step > sItem.num;
              return (
                <div 
                  key={sItem.num}
                  className={`py-1.5 px-2 rounded-xl text-center transition-all ${
                    isCurrent 
                      ? 'bg-primary text-white font-bold shadow-xs' 
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 font-medium'
                  }`}
                >
                  <span className="text-[11px] truncate block">{sItem.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="bg-rose-50 border-b border-rose-200 text-rose-800 px-4 py-2.5 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div ref={scrollRef} className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-grow space-y-5 bg-slate-50/50">
          
          {/* ==================================================== */}
          {/* STEP 1: CART, LAB SELECTION & INSTANT TEST SUGGESTIONS */}
          {/* ==================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* 1. Diagnostic Lab Selection */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 size={15} className="text-primary" />
                    <span>{isBn ? 'ডায়াগনস্টিক সেন্টার নির্বাচন করুন:' : 'Select Diagnostic Lab:'}</span>
                  </label>
                  <span className="text-[11px] text-primary font-bold">
                    {selectedLab?.name}
                  </span>
                </div>

                {/* Mobile Friendly Lab Selector Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {labs.map(lab => {
                    const isSelected = formData.labId === lab.id;
                    return (
                      <div 
                        key={lab.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, labId: lab.id }));
                          if (onSelectLab) onSelectLab(lab.id);
                        }}
                        className={`p-2 rounded-xl border cursor-pointer flex flex-col justify-between transition-all select-none ${
                          isSelected 
                            ? 'border-primary bg-sky-50/90 ring-2 ring-primary/20 shadow-xs' 
                            : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <img 
                            src={lab.logo} 
                            alt={lab.name} 
                            className="w-6 h-6 rounded-full object-cover bg-white border border-slate-200 shrink-0" 
                          />
                          <p className="font-bold text-[11px] text-slate-900 truncate leading-tight">
                            {lab.name.split(' ')[0]}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold border-t border-slate-100 pt-1">
                          <span className="text-amber-600">⭐ {lab.rating}</span>
                          <span className={lab.serviceCharge === 0 ? 'text-emerald-600 font-bold' : 'text-slate-600'}>
                            {lab.serviceCharge === 0 ? (isBn ? 'ফ্রি ভিজিট' : 'Free') : `+৳${lab.serviceCharge}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Search and Add Tests */}
              {onAddTest && allTests.length > 0 && (
                <div ref={searchContainerRef} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Search size={14} className="text-primary" />
                      <span>{isBn ? 'আরও টেস্ট যোগ করতে খুঁজুন:' : 'Search & Add More Tests:'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isBn ? 'যেমন: CBC, Thyroid, Sugar, Lipid' : 'e.g. CBC, Sugar, Lipid'}
                    </span>
                  </label>

                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input 
                      type="text" 
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all focus:bg-white"
                      placeholder={isBn ? 'টেস্টের নাম লিখুন (CBC, Lipid, TSH, Sugar...)' : 'Type test name (e.g. CBC, TSH, Glucose)...'}
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
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Smart Suggestions Dropdown */}
                  {isSearchFocused && (
                    <div className="absolute z-30 left-4 right-4 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150 custom-scrollbar">
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Sparkles size={12} className="text-primary" />
                          {searchTerm 
                            ? (isBn ? `পাওয়া গেছে (${suggestedTests.length} টি)` : `Matching Tests (${suggestedTests.length})`)
                            : (isBn ? 'জনপ্রিয় টেস্টসমূহ' : 'Popular Tests')}
                        </span>
                      </div>

                      {suggestedTests.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {suggestedTests.map(test => {
                            const testPrice = getItemPrice(test);
                            const regPrice = getItemRegularPrice(test);
                            const hasDiscount = regPrice && regPrice > testPrice;

                            return (
                              <div
                                key={test.id}
                                className="p-2.5 hover:bg-sky-50/70 transition-colors flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 truncate">{test.name}</p>
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
                                  className="px-2.5 py-1 rounded-lg bg-primary hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all shrink-0 cursor-pointer"
                                >
                                  <Plus size={13} />
                                  <span>{isBn ? 'যোগ করুন' : 'Add'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400">
                          {isBn ? 'কোনো টেস্ট পাওয়া যায়নি।' : 'No matching tests found.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Selected Cart Items */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShoppingBag size={15} className="text-primary" />
                    <span>{isBn ? 'নির্বাচিত টেস্টসমূহ:' : 'Selected Tests in Cart:'}</span>
                  </label>
                  <span className="text-xs bg-sky-100 text-primary font-bold px-2 py-0.5 rounded-full">
                    {cartItems.length} {isBn ? 'টি আইটেম' : 'items'}
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="space-y-3 pt-1">
                    <div className="text-center py-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <ShoppingBag size={26} className="mx-auto text-slate-300 mb-1.5" />
                      <p className="text-slate-700 text-xs font-bold">{t.cartEmpty}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {isBn ? 'নিচের জনপ্রিয় টেস্ট থেকে ১-ক্লিকে যোগ করুন অথবা ক্যাটালগ দেখুন' : 'Select a popular test below or browse test catalog'}
                      </p>
                    </div>

                    {/* Quick-Pick Popular Tests */}
                    {onAddTest && allTests.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-500" />
                          <span>{isBn ? 'জনপ্রিয় প্রয়োজনীয় টেস্টসমূহ:' : 'Quick Add Popular Tests:'}</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {allTests.slice(0, 4).map(test => {
                            const testPrice = getItemPrice(test);
                            return (
                              <div
                                key={test.id}
                                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-primary/50 transition-all flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 truncate">{test.name}</p>
                                  <span className="text-xs font-black text-primary">৳{testPrice}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onAddTest(test)}
                                  className="px-2.5 py-1 rounded-lg bg-primary hover:bg-sky-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                                >
                                  <Plus size={12} />
                                  <span>{isBn ? 'যোগ' : 'Add'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {onNavigateToTests && (
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToTests();
                          }}
                          className="text-xs text-primary hover:text-sky-700 font-bold underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <Stethoscope size={13} />
                          <span>{isBn ? 'বা সকল টেস্টের পূর্ণাঙ্গ তালিকা দেখুন' : 'Or Browse Complete Tests Catalog'} →</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
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
                          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center gap-2.5 hover:border-sky-300 transition-colors"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0" 
                          />
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-slate-900 text-xs truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {hasDiscount && (
                                <span className="line-through text-slate-400 text-[10px]">৳{itemRegularPrice}</span>
                              )}
                              <span className="text-primary font-black text-xs">৳{itemPrice}</span>
                              {hasDiscount && (
                                <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                                  -{discountPercent}%
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0 cursor-pointer"
                            title={t.removeItem}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Bill Summary Card */}
              {cartItems.length > 0 && (
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>{isBn ? 'টেস্টের মোট মূল্য (Subtotal):' : 'Tests Subtotal:'}</span>
                    <span className="font-bold text-white">৳{subTotal}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <span>{isBn ? 'মোট ডিসকাউন্ট সাশ্রয়:' : 'Total Discount Savings:'}</span>
                      <span className="font-black">- ৳{totalSavings}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300">
                    <span>{isBn ? 'হোম স্যাম্পল কালেকশন ফি:' : 'Home Collection Charge:'}</span>
                    <span className="font-bold text-emerald-400">
                      {serviceCharge === 0 ? (isBn ? 'ফ্রি (Free)' : 'Free') : `+ ৳${serviceCharge}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-700 pt-2 font-bold">
                    <span className="text-slate-200">{isBn ? 'সর্বমোট প্রদেয় বিল:' : 'Total Amount Payable:'}</span>
                    <span className="text-lg font-black text-emerald-400">৳{totalBill}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: PATIENT DETAILS, APPOINTMENT DATE & SLOTS   */}
          {/* ==================================================== */}
          {step === 2 && (
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Patient Information Section */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <User size={15} className="text-primary" />
                    <span>{isBn ? 'রোগীর তথ্য প্রদান করুন (Patient Info):' : 'Patient Information:'}</span>
                  </label>
                  {!currentPatient && onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
                    >
                      {isBn ? 'লগইন করুন' : 'Log in'}
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User size={15} />
                    </div>
                    <input 
                      type="text" 
                      required
                      placeholder={isBn ? 'রোগীর পুরো নাম * (e.g. মোঃ করিম হোসেন)' : 'Patient Full Name *'}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone size={15} />
                    </div>
                    <input 
                      type="tel" 
                      required
                      placeholder={isBn ? 'মোবাইল নম্বর * (০১৭XXXXXXXX)' : 'Mobile Phone Number *'}
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                      <MapPin size={15} />
                    </div>
                    <textarea 
                      rows={2}
                      required
                      placeholder={isBn ? 'স্যাম্পল কালেকশনের পূর্ণ ঠিকানা * (বাসা/ফ্ল্যাট, রোড, এলাকা)' : 'Sample Collection Full Address * (House, Road, Area)'}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Date Selection */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={15} className="text-primary" />
                    <span>{isBn ? 'অ্যাপয়েন্টমেন্টের তারিখ নির্বাচন করুন:' : 'Select Appointment Date:'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formData.date || (isBn ? 'তারিখ সিলেক্ট করুন' : 'Select Date')}
                  </span>
                </label>

                {/* Horizontal Date Picker Cards */}
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {availableBookingDays.map((d) => {
                    const isSelected = formData.date === d.fullDate;
                    const isClosed = d.isClosed;

                    return (
                      <button
                        key={d.fullDate}
                        type="button"
                        disabled={isClosed}
                        onClick={() => {
                          if (!isClosed) {
                            setFormData({ ...formData, date: d.fullDate, time: '' });
                          }
                        }}
                        className={`p-2 rounded-xl text-center flex-1 min-w-[64px] border transition-all ${
                          isClosed
                            ? 'bg-slate-100/70 text-slate-400 border-dashed border-slate-300 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/20 cursor-pointer font-bold'
                            : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:border-primary/50 cursor-pointer'
                        }`}
                      >
                        <p className="text-[10px] uppercase font-bold opacity-80">{d.dayName}</p>
                        <p className="text-base font-black leading-tight my-0.5">{d.dayNumber}</p>
                        <p className="text-[10px] opacity-80">{d.month}</p>
                        {isClosed && (
                          <span className="block text-[8px] font-bold text-rose-600 truncate mt-0.5">
                            {d.closedReason || 'Off'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} className="text-primary" />
                    <span>{isBn ? 'সময়সূচি (Time Slot) নির্বাচন করুন:' : 'Select Time Slot:'}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formData.time ? `Selected: ${formData.time}` : (isBn ? 'স্লট সিলেক্ট করুন' : 'Pick a slot')}
                  </span>
                </label>

                {activeTimeSlots.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    {isBn ? 'কোনো সক্রিয় সময়সূচি পাওয়া যায়নি' : 'No active time slots configured'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                    {activeTimeSlots.map((slotItem) => {
                      const slot = slotItem.time;
                      const available = isSlotAvailable(formData.date, slot);
                      const isSelected = formData.time === slot;

                      return (
                        <button
                          key={slotItem.id || slot}
                          type="button"
                          disabled={!available}
                          onClick={() => setFormData({ ...formData, time: slot })}
                          className={`p-2 rounded-xl text-[11px] font-semibold border transition-all text-center ${
                            !available
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-primary text-white border-primary shadow-sm font-bold ring-2 ring-primary/20'
                              : 'bg-slate-50/70 text-slate-800 border-slate-200 hover:border-primary/50 hover:bg-white cursor-pointer'
                          }`}
                        >
                          <span className="block truncate">{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Doctor Reference (Optional) */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  {isBn ? 'রেফারকারী চিকিৎসকের নাম (ঐচ্ছিক):' : 'Referring Doctor Name (Optional):'}
                </label>
                <input 
                  type="text"
                  placeholder={isBn ? 'e.g. ডাঃ এম এ বারী (ঐচ্ছিক)' : 'e.g. Dr. M A Bari (Optional)'}
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              {/* Order Summary & Payment Mode Reminder */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">{isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Mode'}</span>
                  <span className="font-bold text-emerald-950">{isBn ? 'ক্যাশ অন স্যাম্পল কালেকশন / অনলাইন' : 'Cash on Sample Collection / Online'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">{isBn ? 'মোট বিল' : 'Total Bill'}</span>
                  <span className="text-base font-black text-emerald-700">৳{totalBill}</span>
                </div>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* STEP 3: BOOKING CONFIRMED & INVOICE DOWNLOAD       */}
          {/* ==================================================== */}
          {step === 3 && (
            <div className="py-4 text-center space-y-5">
              
              {/* Success Icon */}
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle size={36} />
              </div>
              
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {isBn ? 'বুকিং সফলভাবে সম্পন্ন হয়েছে!' : 'Booking Confirmed Successfully!'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {isBn 
                    ? 'আমাদের প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করে স্যাম্পল কালেকশনের বিষয়টি নিশ্চিত করবেন।' 
                    : 'Our representative will call you shortly to confirm sample collection.'}
                </p>
              </div>

              {/* Order ID Badge */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl max-w-xs mx-auto flex items-center justify-between shadow-md">
                <div className="text-left">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">{isBn ? 'বুকিং অর্ডার আইডি' : 'Booking Order ID'}</span>
                  <span className="font-mono text-base font-extrabold text-emerald-400">{confirmedBookingId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedId ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                </button>
              </div>

              {/* Appointment Details Summary */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto shadow-2xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{isBn ? 'রোগীর নাম:' : 'Patient Name:'}</span>
                  <strong className="text-slate-900">{formData.fullName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{isBn ? 'মোবাইল নম্বর:' : 'Phone Number:'}</span>
                  <strong className="text-slate-900 font-mono">{formData.phoneNumber}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{isBn ? 'ডায়াগনস্টিক সেন্টার:' : 'Diagnostic Lab:'}</span>
                  <strong className="text-primary">{selectedLab?.name}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{isBn ? 'তারিখ ও সময়:' : 'Date & Time:'}</span>
                  <strong className="text-slate-900">{formData.date} ({formData.time})</strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{isBn ? 'ঠিকানা:' : 'Address:'}</span>
                  <span className="text-slate-800 text-right max-w-[200px] truncate">{formData.address}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-900 font-bold">{isBn ? 'মোট পরিশোধযোগ্য:' : 'Total Payable:'}</span>
                  <strong className="text-emerald-600 font-black text-sm">৳{totalBill}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-primary hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer size={15} />
                  <span>{isBn ? 'ইনভয়েস ডাউনলোড / প্রিন্ট' : 'Download Invoice'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onClearCart) onClearCart();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isBn ? 'সম্পন্ন করুন' : 'Done'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Actions (For Step 1 and Step 2) */}
        {step !== 3 && (
          <div className="bg-white border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg flex-shrink-0">
            {step === 1 ? (
              <>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'মোট প্রদেয়' : 'Total Bill'}</span>
                  <span className="text-base sm:text-lg font-black text-primary">৳{totalBill}</span>
                </div>
                <Button
                  onClick={handleProceedToStep2}
                  disabled={cartItems.length === 0}
                  className="px-5 py-3 text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isBn ? 'পরবর্তী: রোগী ও সময়সূচি' : 'Next: Schedule'}</span>
                  <ChevronRight size={16} />
                </Button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={15} />
                  <span>{isBn ? 'পেছনে' : 'Back'}</span>
                </button>

                <div className="hidden sm:block text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'মোট প্রদেয়' : 'Total Bill'}</span>
                  <span className="text-base font-black text-emerald-600">৳{totalBill}</span>
                </div>

                <Button
                  type="submit"
                  form="booking-form"
                  disabled={isSubmitting || !formData.time || !formData.fullName || !formData.phoneNumber || !formData.address}
                  className="px-5 py-3 text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? (
                    <span>{isBn ? 'কনফার্ম হচ্ছে...' : 'Processing...'}</span>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>{isBn ? 'বুকিং নিশ্চিত করুন' : 'Confirm Booking'}</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
