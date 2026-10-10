import React, { useState, useEffect, useRef } from 'react';
import { TestPackage, LabPartner, Language, BookingHistoryItem, BookingFormData, PatientUser, PaymentMethod, PaymentGatewaysConfig } from '../types';
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
  Stethoscope,
  Search,
  ShieldCheck,
  CreditCard,
  Wallet,
  Banknote,
  Smartphone,
  Lock,
  ArrowRight,
  Info,
  UploadCloud,
  FileUp,
  Image as ImageIcon,
  Eye,
  Paperclip,
  ZoomIn
} from 'lucide-react';
import { Button } from './Button';
import { getStoredDateSlotConfig, isSlotAvailable, DEFAULT_TIME_SLOTS, getStoredSiteSettings, getStoredPaymentConfig } from '../services/dataStorage';
import { getLabs } from '../constants';
import { printOrDownloadInvoice } from '../services/invoiceService';

// Helper to generate unique human-readable order ID with numeric suffix only: LH-YYMMDD-XXXX (e.g. LH-261001-8492)
export const generateUniqueOrderId = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  // Generate 4-digit random number (1000 - 9999) - digits only, no capital letters
  const randomNumeric = Math.floor(1000 + Math.random() * 9000).toString();
  return `LH-${year}${month}${day}-${randomNumeric}`;
};

// Formats order ID display (e.g. #LH-261001-8492)
export const formatOrderId = (id: string): string => {
  if (!id) return '#LH-0000';
  if (id.startsWith('LH-')) return `#${id}`;
  if (id.startsWith('#')) return id;
  return `#LH-${id}`;
};

// Helper to calculate Tube, Needle & Accessories Charge based on test count:
// 1 to 2 tests: 45 TK, 3 to 4 tests: 65 TK, 4 to More tests (5 or more): 85 TK
export const calculateAccessoriesFee = (testCount: number): number => {
  if (testCount <= 0) return 0;
  if (testCount <= 2) return 45;
  if (testCount <= 4) return 65;
  return 85;
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
  // 4 Steps: 1 = Lab & Tests, 2 = Schedule, 3 = Payment, 4 = Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Search state for test suggestions in modal
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];
  const siteSettings = getStoredSiteSettings(lang);
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewaysConfig>(getStoredPaymentConfig);
  
  // Sync latest payment config whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentConfig(getStoredPaymentConfig());
    }
  }, [isOpen]);
  
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
    prescription: null,
    paymentMethod: 'cod',
    transactionId: '',
    senderPhone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolder: ''
  });

  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [prescriptionPreviewModal, setPrescriptionPreviewModal] = useState<string | null>(null);
  const [isUploadingPrescription, setIsUploadingPrescription] = useState(false);
  const prescriptionFileInputRef = useRef<HTMLInputElement>(null);

  const handlePrescriptionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setValidationError(isBn ? 'প্রেসক্রিপশন ফাইলের সাইজ সর্বোচ্চ ১০MB হতে পারবে।' : 'Prescription file size must be within 10MB.');
      return;
    }

    setIsUploadingPrescription(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({
        ...prev,
        prescription: file,
        prescriptionUrl: base64,
        prescriptionName: file.name
      }));
      setIsUploadingPrescription(false);
      setValidationError(null);

      // Auto advance to Step 2 (Schedule) if currently in Step 1
      if (step === 1) {
        setTimeout(() => {
          setStep(2);
        }, 350);
      }
    };
    reader.onerror = () => {
      setValidationError(isBn ? 'ফাইল পড়তে সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।' : 'Failed to read file. Please try again.');
      setIsUploadingPrescription(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescription: null,
      prescriptionUrl: undefined,
      prescriptionName: undefined
    }));
    if (prescriptionFileInputRef.current) {
      prescriptionFileInputRef.current.value = '';
    }
  };

  const handleCopyPaymentNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

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
        paymentMethod: prev.paymentMethod || 'cod',
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

  // Reset time if selected date changes and current time is unavailable (e.g. minimum 3 hours lead time)
  useEffect(() => {
    if (formData.date && formData.time) {
      if (!isSlotAvailable(formData.date, formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    }
  }, [formData.date]);

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
  const accessoriesFee = calculateAccessoriesFee(cartItems.length);
  const totalBill = subTotal + (cartItems.length > 0 ? serviceCharge : 0) + accessoriesFee;

  // When prescription is uploaded without tests in cart (or booking is made based on doctor's prescription)
  const isPrescriptionBooking = Boolean(formData.prescriptionUrl && cartItems.length === 0);

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

  // Step 1 -> Step 2 validation (Either tests in cart or prescription uploaded)
  const handleProceedToStep2 = () => {
    if (cartItems.length === 0 && !formData.prescriptionUrl) {
      setValidationError(isBn ? 'অনুগ্রহ করে অন্তত একটি টেস্ট সিলেক্ট করুন অথবা প্রেসক্রিপশন আপলোড করুন।' : 'Please select at least one test or upload a doctor prescription.');
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  // Step 2 -> Step 3 validation
  const handleProceedToStep3 = () => {
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
    if (!isSlotAvailable(formData.date, formData.time)) {
      setValidationError(isBn ? 'নির্বাচিত সময়সূচিটি নূন্যতম ৩ ঘণ্টা আগের নিয়ম বা বুকিং সীমার কারণে অনুপলব্ধ। অন্য স্লট বেছে নিন।' : 'The selected slot is unavailable due to the 3-hour advance notice rule. Please choose another slot.');
      return;
    }

    setValidationError(null);
    setStep(3);
  };

  // Step 3 -> Step 4 Final Booking Confirmation
  const handleSubmitBooking = async () => {
    if (isSubmitting || step === 4) return;

    // Validate payment method details (Mandatory for bKash, Nagad, Rocket, Card only when not prescription-only review)
    if (!isPrescriptionBooking && (formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad' || formData.paymentMethod === 'rocket')) {
      const methodName = formData.paymentMethod === 'bkash' 
        ? (isBn ? 'বিকাশ' : 'bKash') 
        : formData.paymentMethod === 'nagad' 
        ? (isBn ? 'নগদ' : 'Nagad') 
        : (isBn ? 'রকেট' : 'Rocket');

      const rawSender = (formData.senderPhone || '').trim();
      const cleanSender = rawSender.replace(/[^0-9]/g, '');
      if (!rawSender) {
        setValidationError(isBn ? `অনুগ্রহ করে আপনার ${methodName} প্রেরক মোবাইল নম্বর (Sender Phone) প্রদান করুন।` : `Please provide your ${methodName} sender phone number.`);
        return;
      }
      if (cleanSender.length < 11) {
        setValidationError(isBn ? `অনুগ্রহ করে সঠিক ১১ ডিজিটের ${methodName} প্রেরক মোবাইল নম্বর লিখুন (e.g. 017XXXXXXXX)।` : `Please enter a valid 11-digit ${methodName} sender phone number.`);
        return;
      }

      const rawTrx = (formData.transactionId || '').trim();
      if (!rawTrx) {
        setValidationError(isBn ? `অনুগ্রহ করে ${methodName} পেমেন্টের ট্রানজেকশন আইডি (TrxID) প্রদান করুন।` : `Please provide the ${methodName} Transaction ID (TrxID).`);
        return;
      }
      if (rawTrx.length < 4) {
        setValidationError(isBn ? `অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন।` : `Please enter a valid Transaction ID (TrxID).`);
        return;
      }
    }

    if (!isPrescriptionBooking && formData.paymentMethod === 'card') {
      const cleanCardNum = (formData.cardNumber || '').replace(/\s/g, '');
      if (!cleanCardNum || cleanCardNum.length < 15) {
        setValidationError(isBn ? 'অনুগ্রহ করে সঠিক ১৬ ডিজিট কার্ড নম্বর লিখুন।' : 'Please enter a valid 16-digit card number.');
        return;
      }
      if (!formData.cardExpiry || !formData.cardExpiry.includes('/') || formData.cardExpiry.trim().length < 5) {
        setValidationError(isBn ? 'কার্ডের মেয়াদ (MM/YY) সঠিকভাবে উল্লেখ করুন।' : 'Please enter valid card expiry date (MM/YY).');
        return;
      }
      if (!formData.cardCvv || formData.cardCvv.trim().length < 3) {
        setValidationError(isBn ? 'অনুগ্রহ করে ৩ বা ৪ ডিজিট CVV কোড লিখুন।' : 'Please enter 3 or 4 digit CVV code.');
        return;
      }
      if (!formData.cardHolder || !formData.cardHolder.trim()) {
        setValidationError(isBn ? 'অনুগ্রহ করে কার্ডধারীর নাম (Cardholder Name) লিখুন।' : 'Please enter the Cardholder Name.');
        return;
      }
    }

    setValidationError(null);
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const uniqueOrderId = generateUniqueOrderId();
    setConfirmedBookingId(uniqueOrderId);
    setCopiedId(false);

    let paymentStatus: 'unpaid' | 'paid' | 'pending_verification' = 'unpaid';
    if (!isPrescriptionBooking && formData.paymentMethod === 'card') {
      paymentStatus = 'paid';
    } else if (!isPrescriptionBooking && (formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad' || formData.paymentMethod === 'rocket')) {
      paymentStatus = formData.transactionId ? 'pending_verification' : 'unpaid';
    } else {
      paymentStatus = 'unpaid';
    }

    const bookingItemDetails = cartItems.map(item => {
      const itemFinalPrice = getItemPrice(item);
      const itemRegularPrice = getItemRegularPrice(item) || itemFinalPrice;
      const itemDiscount = Math.max(0, itemRegularPrice - itemFinalPrice);
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        originalPrice: itemRegularPrice,
        discountAmount: itemDiscount,
        finalPrice: itemFinalPrice
      };
    });

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
        items: bookingItemDetails,
        subtotal: isPrescriptionBooking ? 0 : regularSubTotal,
        totalDiscount: isPrescriptionBooking ? 0 : totalSavings,
        collectionFee: isPrescriptionBooking ? 0 : serviceCharge,
        accessoriesFee: isPrescriptionBooking ? 0 : accessoriesFee,
        serviceCharge: isPrescriptionBooking ? 0 : serviceCharge,
        totalCost: isPrescriptionBooking ? 0 : totalBill,
        status: 'pending',
        doctorName: formData.doctorName?.trim() || '',
        prescriptionUrl: formData.prescriptionUrl,
        prescriptionName: formData.prescriptionName,
        paymentMethod: formData.paymentMethod || 'cod',
        paymentStatus,
        transactionId: formData.transactionId?.trim() || undefined,
        senderPhone: formData.senderPhone?.trim() || undefined,
        createdAt: new Date().toISOString()
      };
      onBookingConfirmed(newBooking);
    }

    setIsSubmitting(false);
    setStep(4);
  };

  const handleCopyOrderId = () => {
    if (confirmedBookingId) {
      navigator.clipboard.writeText(confirmedBookingId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handlePrint = () => {
    const bookingItemDetails = cartItems.map(item => {
      const itemFinalPrice = getItemPrice(item);
      const itemRegularPrice = getItemRegularPrice(item) || itemFinalPrice;
      const itemDiscount = Math.max(0, itemRegularPrice - itemFinalPrice);
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        originalPrice: itemRegularPrice,
        discountAmount: itemDiscount,
        finalPrice: itemFinalPrice
      };
    });

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
      items: bookingItemDetails,
      subtotal: regularSubTotal,
      totalDiscount: totalSavings,
      collectionFee: serviceCharge,
      accessoriesFee: accessoriesFee,
      serviceCharge: serviceCharge,
      totalCost: totalBill,
      status: 'pending',
      doctorName: formData.doctorName,
      prescriptionUrl: formData.prescriptionUrl,
      prescriptionName: formData.prescriptionName,
      paymentMethod: formData.paymentMethod || 'cod',
      paymentStatus: formData.paymentMethod === 'card' ? 'paid' : formData.transactionId ? 'pending_verification' : 'unpaid',
      transactionId: formData.transactionId,
      senderPhone: formData.senderPhone,
      createdAt: new Date().toISOString()
    };
    printOrDownloadInvoice(orderObj, lang);
  };

  // Payment method options data - filtered to only active payment gateways enabled in Admin Settings
  const allPaymentOptions: { id: PaymentMethod; title: string; subtitle: string; icon: any; color: string; badge?: string }[] = [
    {
      id: 'cod',
      title: paymentConfig?.cod?.title || (isBn ? 'ক্যাশ অন কালেকশন (Cash on Delivery)' : 'Cash on Sample Collection'),
      subtitle: isBn ? 'স্যাম্পল সংগ্রহের সময় ফ্লেবোটোমিস্টকে ক্যাশ পরিশোধ' : 'Pay cash to technician during home visit',
      icon: Banknote,
      color: 'emerald',
      badge: isBn ? 'সর্বাধিক জনপ্রিয়' : 'Most Popular'
    },
    {
      id: 'bkash',
      title: isBn ? 'বিকাশ (bKash Payment)' : 'bKash Mobile Banking',
      subtitle: isBn ? 'বিকাশ অ্যাপ অথবা ডায়াল করে ইনস্ট্যান্ট পেমেন্ট' : 'Direct Send Money / Merchant Payment',
      icon: Smartphone,
      color: 'pink',
      badge: paymentConfig?.bkash?.merchantNumber || '01712-345678'
    },
    {
      id: 'nagad',
      title: isBn ? 'নগদ (Nagad Payment)' : 'Nagad Mobile Banking',
      subtitle: isBn ? 'নগদ অ্যাপ অথবা ইউএসএসডি কোডে সহজ পেমেন্ট' : 'Fast payment via Nagad app',
      icon: Smartphone,
      color: 'orange',
      badge: paymentConfig?.nagad?.merchantNumber || '01812-345678'
    },
    {
      id: 'rocket',
      title: isBn ? 'রকেট (Rocket / DBBL)' : 'DBBL Rocket Payment',
      subtitle: isBn ? 'ডাচ-বাংলা রকেট একাউন্ট থেকে নিরাপদ পেমেন্ট' : 'DBBL Rocket Mobile Payment',
      icon: Wallet,
      color: 'purple',
      badge: paymentConfig?.rocket?.accountNumber || '01912-345678-9'
    },
    {
      id: 'card',
      title: isBn ? 'কার্ড / অনলাইন পেমেন্ট (Debit/Credit Card)' : 'Debit / Credit Card (Online)',
      subtitle: isBn ? 'ভিসা, মাস্টারকার্ড, এমেক্স ও নেক্সাস পে সুরক্ষিত গেটওয়ে' : 'Visa, MasterCard, AMEX, NexusPay',
      icon: CreditCard,
      color: 'sky',
      badge: paymentConfig?.card?.provider?.toUpperCase() || 'Instant SSL'
    }
  ];

  // Strictly filter out any payment method disabled in Admin Settings
  const paymentOptions = allPaymentOptions.filter(opt => {
    const gateway = paymentConfig?.[opt.id];
    return gateway ? gateway.isActive !== false : true;
  });

  // Ensure formData.paymentMethod always stays on an enabled payment method
  useEffect(() => {
    if (paymentOptions.length > 0) {
      if (!paymentOptions.some(opt => opt.id === formData.paymentMethod)) {
        setFormData(prev => ({ ...prev, paymentMethod: paymentOptions[0].id }));
      }
    }
  }, [paymentOptions, formData.paymentMethod]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Container: Full-width bottom sheet on mobile, rounded card on desktop */}
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] border border-slate-100 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
        
        {/* Top Header & 4-Step Indicator */}
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

          {/* Clean 4-Step Progress Bar: 1. Lab & Tests -> 2. Schedule -> 3. Payment -> 4. Confirmed */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[
              { num: 1, title: isBn ? '১. ল্যাব ও টেস্ট' : '1. Lab & Tests' },
              { num: 2, title: isBn ? '২. শিডিউল' : '2. Schedule' },
              { num: 3, title: isBn ? '৩. পেমেন্ট' : '3. Payment' },
              { num: 4, title: isBn ? '৪. নিশ্চিত' : '4. Confirmed' },
            ].map((sItem) => {
              const isCurrent = step === sItem.num;
              const isDone = step > sItem.num;
              return (
                <div 
                  key={sItem.num}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all ${
                    isCurrent 
                      ? 'bg-primary text-white font-bold shadow-xs ring-1 ring-white/30' 
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 font-medium'
                  }`}
                >
                  <span className="text-[10px] sm:text-[11px] truncate block">{sItem.title}</span>
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
                          <span className="text-slate-500 truncate">{lab.location?.split(',')[0] || (isBn ? 'ঢাকা' : 'Dhaka')}</span>
                          <span className={lab.serviceCharge === 0 ? 'text-emerald-600 font-bold' : 'text-slate-700 font-bold'}>
                            {lab.serviceCharge === 0 ? (isBn ? 'ফ্রি হোম সার্ভিস' : 'Free') : `+৳${lab.serviceCharge}`}
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

              {/* 4. Prescription Upload Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileUp size={15} className="text-primary" />
                    <span>{isBn ? 'ডাক্তারের প্রেসক্রিপশন আপলোড (ঐচ্ছিক):' : 'Upload Doctor Prescription (Optional):'}</span>
                  </label>
                  {formData.prescriptionUrl && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check size={11} /> {isBn ? 'সংযুক্ত' : 'Attached'}
                    </span>
                  )}
                </div>

                {/* Hidden File Input */}
                <input 
                  type="file"
                  ref={prescriptionFileInputRef}
                  accept="image/*,.pdf"
                  onChange={handlePrescriptionFileChange}
                  className="hidden"
                />

                {!formData.prescriptionUrl ? (
                  <div 
                    onClick={() => prescriptionFileInputRef.current?.click()}
                    className="border-2 border-dashed border-sky-200 hover:border-primary bg-sky-50/40 hover:bg-sky-50/80 rounded-2xl p-4 text-center transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-sky-200 text-primary flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform mb-1.5">
                      <UploadCloud size={20} className="text-primary" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors">
                      {isBn ? 'মোবাইল বা কম্পিউটার থেকে প্রেসক্রিপশন আপলোড করুন' : 'Upload Prescription from Mobile or Computer'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isBn ? 'ক্যামেরা দিয়ে ছবি তুলুন অথবা গ্যালারি/ফাইল থেকে JPG, PNG বা PDF নির্বাচন করুন' : 'Capture photo with camera or choose JPG, PNG, PDF'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg shadow-2xs group-hover:border-primary">
                      <Paperclip size={12} className="text-primary" />
                      <span>{isBn ? 'ফাইল সিলেক্ট করুন (সর্বোচ্চ ১০MB)' : 'Select File (Max 10MB)'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {formData.prescriptionUrl.startsWith('data:image/') || formData.prescriptionUrl.startsWith('http') ? (
                        <div 
                          onClick={() => setPrescriptionPreviewModal(formData.prescriptionUrl || null)}
                          className="relative group w-11 h-11 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300 cursor-pointer"
                          title={isBn ? 'বড় করে দেখতে ক্লিক করুন' : 'Click to enlarge'}
                        >
                          <img 
                            src={formData.prescriptionUrl} 
                            alt="Prescription" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ZoomIn size={13} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 font-bold text-xs">
                          PDF
                        </div>
                      )}
                      
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {formData.prescriptionName || (isBn ? 'প্রেসক্রিপশন ফাইল' : 'Prescription File')}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle size={12} /> {isBn ? 'সফলভাবে আপলোড হয়েছে' : 'Uploaded successfully'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {formData.prescriptionUrl.startsWith('data:image/') && (
                        <button
                          type="button"
                          onClick={() => setPrescriptionPreviewModal(formData.prescriptionUrl || null)}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                          title={isBn ? 'বড় করে দেখুন' : 'Preview'}
                        >
                          <Eye size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => prescriptionFileInputRef.current?.click()}
                        className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                        title={isBn ? 'পরিবর্তন করুন' : 'Change file'}
                      >
                        <UploadCloud size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePrescription}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title={isBn ? 'মুছে ফেলুন' : 'Remove'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Prescription Review Notice or Bill Summary Card */}
              {isPrescriptionBooking ? (
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-sm space-y-2 text-xs border border-indigo-800/40">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Sparkles size={16} className="text-emerald-400 shrink-0" />
                    <span>{isBn ? 'প্রেসক্রিপশন পর্যালোচনার পর চূড়ান্ত বিল নির্ধারিত হবে' : 'Bill will be finalized upon prescription review'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isBn 
                      ? 'আমাদের মেডিকেল স্পেশালিস্ট আপনার আপলোডকৃত প্রেসক্রিপশন দেখে প্রয়োজনীয় টেস্টসমূহ যুক্ত করবেন এবং সর্বোচ্চ ডিসকাউন্টে মোট বিল চূড়ান্ত করবেন। কোনো অগ্রিম ফি দিতে হবে না।' 
                      : 'Our medical specialists will analyze your prescription, add required tests, and apply maximal laboratory discounts. No advance fee required.'}
                  </p>
                  <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{isBn ? 'অগ্রিম প্রদেয় বিল:' : 'Upfront Payable:'}</span>
                    <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      {isBn ? '৳০ (বিল পরবর্তীতে নির্ধারণ হবে)' : '৳0 (Calculated later)'}
                    </span>
                  </div>
                </div>
              ) : cartItems.length > 0 ? (
                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>{isBn ? 'টেস্টের মোট মূল্য (Tests Subtotal):' : 'Tests Subtotal:'}</span>
                    <span className="font-bold text-white">৳{subTotal}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <span>{isBn ? 'মোট ডিসকাউন্ট সাশ্রয় (Total Discount Savings):' : 'Total Discount Savings:'}</span>
                      <span className="font-black">- ৳{totalSavings}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span>{isBn ? 'টিউব, নিডল ও এক্সেসরিজ:' : 'Tube, Needle & Accessories:'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({cartItems.length <= 2 ? (isBn ? '১-২ টেস্ট: ৳৪৫' : '1-2 tests: ৳45') : cartItems.length <= 4 ? (isBn ? '৩-৪ টেস্ট: ৳৬৫' : '3-4 tests: ৳65') : (isBn ? '৪+ টেস্ট: ৳৮৫' : '4+ tests: ৳85')})
                      </span>
                    </span>
                    <span className="font-bold text-white">+ ৳{accessoriesFee}</span>
                  </div>

                  <div className="flex justify-between text-slate-300">
                    <span>{isBn ? 'হোম স্যাম্পল কালেকশন ফি:' : 'Home Sample Collection Fee:'}</span>
                    <span className="font-bold text-emerald-400">
                      {serviceCharge === 0 ? (isBn ? 'ফ্রি (Free)' : 'Free') : `+ ৳${serviceCharge}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-700 pt-2 font-bold">
                    <span className="text-slate-200">{isBn ? 'সর্বমোট প্রদেয় বিল:' : 'Total Amount Payable:'}</span>
                    <span className="text-lg font-black text-emerald-400">৳{totalBill}</span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: PATIENT DETAILS, APPOINTMENT DATE & SLOTS   */}
          {/* ==================================================== */}
          {step === 2 && (
            <div className="space-y-4">
              
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

              {/* Time Slot Selection with Minimum 3-Hour Notice Rule */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock size={15} className="text-primary" />
                    <span>{isBn ? 'সময়সূচি (Time Slot) নির্বাচন করুন:' : 'Select Time Slot:'}</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formData.time ? `Selected: ${formData.time}` : (isBn ? 'স্লট সিলেক্ট করুন' : 'Pick a slot')}
                  </span>
                </div>

                {/* 3-Hour Advance Notice Guidance Banner (Hidden on mobile) */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-amber-50/90 border border-amber-200/80 rounded-xl text-[11px] text-amber-900">
                  <Info size={14} className="text-amber-600 shrink-0" />
                  <span>
                    {isBn 
                      ? 'নিয়মাবলী: স্যাম্পল কালেকশন কিট প্রস্তুতি ও টেকনোলজিস্ট পৌঁছানোর জন্য নূন্যতম ৩ ঘণ্টা আগে শিডিউল নির্বাচন করতে হবে।'
                      : 'Notice: A minimum 3 hours advance notice is required for phlebotomist dispatch and sterile kit preparation.'}
                  </span>
                </div>

                {activeTimeSlots.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    {isBn ? 'কোনো সক্রিয় সময়সূচি পাওয়া যায়নি' : 'No active time slots configured'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {activeTimeSlots.map((slotItem) => {
                      const slot = slotItem.time;
                      const available = isSlotAvailable(formData.date, slot);
                      const isSelected = formData.time === slot;

                      return (
                        <button
                          key={slotItem.id || slot}
                          type="button"
                          disabled={!available}
                          onClick={() => {
                            if (available) {
                              setFormData({ ...formData, time: slot });
                              setValidationError(null);
                            }
                          }}
                          className={`p-2 rounded-xl text-[11px] font-semibold border transition-all text-center relative ${
                            !available
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                              : isSelected
                              ? 'bg-primary text-white border-primary shadow-sm font-bold ring-2 ring-primary/20'
                              : 'bg-slate-50/70 text-slate-800 border-slate-200 hover:border-primary/50 hover:bg-white cursor-pointer'
                          }`}
                        >
                          <span className="block truncate">{slot}</span>
                          {!available && (
                            <span className="text-[9px] text-rose-500 font-bold block mt-0.5">
                              {isBn ? '< ৩ ঘণ্টা / বন্ধ' : 'Unavailable'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Doctor Reference & Prescription (Optional) */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
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

                {/* Prescription Status / Upload in Step 2 */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileUp size={14} className="text-primary" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block leading-tight">
                        {isBn ? 'প্রেসক্রিপশন সংযুক্তি' : 'Prescription Attachment'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formData.prescriptionUrl 
                          ? (formData.prescriptionName || (isBn ? 'ফাইল সংযুক্ত আছে' : 'File attached'))
                          : (isBn ? 'কোনো প্রেসক্রিপশন সংযুক্ত নেই' : 'No prescription attached')}
                      </span>
                    </div>
                  </div>

                  {formData.prescriptionUrl ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPrescriptionPreviewModal(formData.prescriptionUrl || null)}
                        className="px-2.5 py-1 bg-sky-50 text-primary hover:bg-sky-100 rounded-lg text-xs font-bold border border-sky-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>{isBn ? 'দেখুন' : 'View'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePrescription}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title={isBn ? 'মুছে ফেলুন' : 'Remove'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => prescriptionFileInputRef.current?.click()}
                      className="px-3 py-1 bg-white hover:bg-sky-50 text-primary hover:text-sky-700 rounded-lg text-xs font-bold border border-sky-200 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <UploadCloud size={13} />
                      <span>{isBn ? 'ছবি/ফাইল আপলোড' : 'Upload File'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bill Preview Banner */}
              {isPrescriptionBooking ? (
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-sky-800 font-bold uppercase block">{isBn ? 'বুকিংয়ের ধরন' : 'Booking Type'}</span>
                    <span className="font-bold text-sky-950 flex items-center gap-1 truncate">
                      <FileUp size={13} className="text-primary shrink-0" />
                      <span className="truncate">{formData.prescriptionName || (isBn ? 'প্রেসক্রিপশন আপলোড' : 'Prescription Upload')}</span>
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-sky-800 font-bold uppercase block">{isBn ? 'প্রদেয় বিল' : 'Payable'}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300">
                      {isBn ? 'প্রেসক্রিপশন যাচাই সাপেক্ষে' : 'Under Review'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">{isBn ? 'নির্বাচিত টেস্ট' : 'Selected Tests'}</span>
                    <span className="font-bold text-emerald-950">{cartItems.length} {isBn ? 'টি টেস্ট' : 'Tests'} ({selectedLab?.name})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">{isBn ? 'মোট প্রদেয় বিল' : 'Total Payable'}</span>
                    <span className="text-base font-black text-emerald-700">৳{totalBill}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 3: PAYMENT METHOD (COD / BKASH / ROCKET / NAGAD / CARD) */}
          {/* ==================================================== */}
          {step === 3 && (
            <div className="space-y-4">
              
              {/* Payment Header Total */}
              {isPrescriptionBooking ? (
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">{isBn ? 'পেমেন্ট ও বিলিং পদ্ধতি' : 'Billing & Payment Method'}</span>
                    <p className="text-sm sm:text-base font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck size={16} />
                      <span>{isBn ? 'প্রেসক্রিপশন পর্যালোচনার পর বিল পরিশোধ' : 'Pay After Prescription Review'}</span>
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {isBn ? 'স্যাম্পল সংগ্রহের সময় নির্ধারিত বিল পরিশোধ করতে পারবেন' : 'Pay final bill to technician during home sample collection'}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-300 shrink-0">
                    <span className="block font-semibold">{formData.fullName}</span>
                    <span className="text-[10px] text-slate-400">{formData.date} • {formData.time}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">{isBn ? 'সর্বমোট পরিশোধযোগ্য বিল' : 'Total Amount Payable'}</span>
                    <p className="text-xl font-black text-emerald-400">৳{totalBill}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-300">
                    <span className="block font-semibold">{formData.fullName}</span>
                    <span className="text-[10px] text-slate-400">{formData.date} • {formData.time}</span>
                  </div>
                </div>
              )}

              {/* Payment Methods Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Wallet size={15} className="text-primary" />
                  <span>{isBn ? 'পেমেন্ট মাধ্যম নির্বাচন করুন (Payment Option):' : 'Select Payment Method:'}</span>
                </label>

                <div className="space-y-2">
                  {paymentOptions.map((opt) => {
                    const isSelected = formData.paymentMethod === opt.id;
                    const IconComp = opt.icon;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setFormData({ ...formData, paymentMethod: opt.id })}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-sky-50/70 ring-2 ring-primary/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              <IconComp size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black text-slate-900 leading-tight">{opt.title}</h4>
                                {opt.badge && !isPrescriptionBooking && (
                                  <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                                    {opt.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">{opt.subtitle}</p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>

                        {/* Expandable Details based on selection */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-slate-200/80 animate-in fade-in space-y-3 text-xs">
                            
                            {/* COD Instructions */}
                            {opt.id === 'cod' && (
                              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                                  <ShieldCheck size={15} />
                                  <span>{isBn ? 'ক্যাশ অন স্যাম্পল কালেকশন নিশ্চিতকরণ' : 'Cash on Sample Collection'}</span>
                                </p>
                                <p className="text-[11px] text-emerald-800">
                                  {isPrescriptionBooking
                                    ? (isBn 
                                        ? 'আমাদের মেডিকেল স্পেশালিস্ট প্রেসক্রিপশন দেখে আপনাকে মোট ডিসকাউন্টেড বিল জানাবেন। স্যাম্পল সংগ্রহের সময় ফ্লেবোটোমিস্টকে নগদ অর্থ বা ডিজিটাল মাধ্যমে পরিশোধ করতে পারবেন।'
                                        : 'Our medical specialist will inform you of the final discounted bill after reviewing your prescription. You can pay cash or via digital wallet during home sample collection.')
                                    : (isBn 
                                        ? 'আমাদের মেডিকেল টেকনোলজিস্ট আপনার বাসায় স্যাম্পল কালেকশন শেষ করার পর আপনি সরাসরি ৳' + totalBill + ' টাকা ক্যাশ প্রদান করবেন।'
                                        : 'Please pay ৳' + totalBill + ' in cash to our technician upon successful doorstep sample collection.')}
                                </p>
                              </div>
                            )}

                            {/* bKash Instructions & Inputs */}
                            {opt.id === 'bkash' && (
                              <div className="space-y-2.5">
                                <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-pink-950 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-pink-900">
                                      {isBn ? 'বিকাশ পেমেন্ট / সেন্ড মানি নম্বর:' : 'bKash Number:'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-mono font-black text-xs text-pink-900">
                                        {paymentConfig.bkash.merchantNumber || '01712-345678'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPaymentNumber((paymentConfig.bkash.merchantNumber || '01712345678').replace(/[^0-9]/g, ''))}
                                        className="px-2 py-0.5 bg-pink-200/80 hover:bg-pink-300 text-pink-900 rounded-md text-[10px] font-bold cursor-pointer"
                                      >
                                        {copiedNumber === (paymentConfig.bkash.merchantNumber || '01712345678').replace(/[^0-9]/g, '') ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}
                                      </button>
                                    </div>
                                  </div>
                                  <ol className="list-decimal list-inside text-[11px] text-pink-800 space-y-0.5">
                                    <li>{isBn ? 'বিকাশ অ্যাপে যান বা *247# ডায়াল করুন।' : 'Open bKash App or dial *247#.'}</li>
                                    <li>
                                      {isPrescriptionBooking 
                                        ? (isBn ? `প্রেসক্রিপশন পর্যালোচনার পর নির্ধারিত বিল নম্বর ${paymentConfig.bkash.merchantNumber || '01712-345678'} এ পরিশোধ করতে পারবেন।` : `You can send payment to ${paymentConfig.bkash.merchantNumber || '01712-345678'} after bill finalization.`)
                                        : (isBn ? `নম্বর ${paymentConfig.bkash.merchantNumber || '01712-345678'} এ মোট ৳${totalBill} টাকা Send Money / Payment করুন।` : `Send Money / Pay ৳${totalBill} to ${paymentConfig.bkash.merchantNumber || '01712-345678'}.`)}
                                    </li>
                                    {!isPrescriptionBooking && <li>{isBn ? 'নিচে আপনার বিকাশ প্রেরক নম্বর ও TrxID প্রদান করুন।' : 'Enter your sender phone number and TrxID below.'}</li>}
                                  </ol>
                                </div>

                                {!isPrescriptionBooking && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                                        <span>{isBn ? 'বিকাশ মোবাইল নম্বর (Sender Phone):' : 'bKash Sender Phone:'}</span>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* বাধ্যতামূলক' : '* Required'}</span>
                                      </label>
                                      <input 
                                        type="tel"
                                        required
                                        placeholder="017XXXXXXXX"
                                        value={formData.senderPhone || ''}
                                        onChange={(e) => {
                                          setFormData({ ...formData, senderPhone: e.target.value });
                                          if (validationError) setValidationError(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                                        <span>{isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID (TrxID):'}</span>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* বাধ্যতামূলক' : '* Required'}</span>
                                      </label>
                                      <input 
                                        type="text"
                                        required
                                        placeholder="e.g. 9J87AKL9"
                                        value={formData.transactionId || ''}
                                        onChange={(e) => {
                                          setFormData({ ...formData, transactionId: e.target.value });
                                          if (validationError) setValidationError(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Nagad Instructions & Inputs */}
                            {opt.id === 'nagad' && (
                              <div className="space-y-2.5">
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-950 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-orange-900">
                                      {isBn ? 'নগদ পেমেন্ট / সেন্ড মানি নম্বর:' : 'Nagad Number:'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-mono font-black text-xs text-orange-900">
                                        {paymentConfig.nagad.merchantNumber || '01812-345678'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPaymentNumber((paymentConfig.nagad.merchantNumber || '01812345678').replace(/[^0-9]/g, ''))}
                                        className="px-2 py-0.5 bg-orange-200/80 hover:bg-orange-300 text-orange-900 rounded-md text-[10px] font-bold cursor-pointer"
                                      >
                                        {copiedNumber === (paymentConfig.nagad.merchantNumber || '01812345678').replace(/[^0-9]/g, '') ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}
                                      </button>
                                    </div>
                                  </div>
                                  <ol className="list-decimal list-inside text-[11px] text-orange-800 space-y-0.5">
                                    <li>{isBn ? 'নগদ অ্যাপ খুলুন বা *167# ডায়াল করুন।' : 'Open Nagad App or dial *167#.'}</li>
                                    <li>
                                      {isPrescriptionBooking
                                        ? (isBn ? `প্রেসক্রিপশন পর্যালোচনার পর নির্ধারিত বিল নম্বর ${paymentConfig.nagad.merchantNumber || '01812-345678'} এ সেন্ড মানি করতে পারবেন।` : `Pay to ${paymentConfig.nagad.merchantNumber || '01812-345678'} upon review.`)
                                        : (isBn ? `নম্বর ${paymentConfig.nagad.merchantNumber || '01812-345678'} এ মোট ৳${totalBill} টাকা Send Money / Payment করুন।` : `Send ৳${totalBill} to ${paymentConfig.nagad.merchantNumber || '01812-345678'}.`)}
                                    </li>
                                    {!isPrescriptionBooking && <li>{isBn ? 'নিচে আপনার প্রেরক নম্বর ও TrxID লিখুন।' : 'Enter sender phone and TrxID below.'}</li>}
                                  </ol>
                                </div>

                                {!isPrescriptionBooking && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                                        <span>{isBn ? 'নগদ মোবাইল নম্বর (Sender Phone):' : 'Nagad Sender Phone:'}</span>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* বাধ্যতামূলক' : '* Required'}</span>
                                      </label>
                                      <input 
                                        type="tel"
                                        required
                                        placeholder="018XXXXXXXX"
                                        value={formData.senderPhone || ''}
                                        onChange={(e) => {
                                          setFormData({ ...formData, senderPhone: e.target.value });
                                          if (validationError) setValidationError(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                                        <span>{isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID (TrxID):'}</span>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* বাধ্যতামূলক' : '* Required'}</span>
                                      </label>
                                      <input 
                                        type="text"
                                        required
                                        placeholder="e.g. 7K99NGD1"
                                        value={formData.transactionId || ''}
                                        onChange={(e) => {
                                          setFormData({ ...formData, transactionId: e.target.value });
                                          if (validationError) setValidationError(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Rocket Instructions & Inputs */}
                            {opt.id === 'rocket' && (
                              <div className="space-y-2.5">
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-purple-900">
                                      {isBn ? 'রকেট একাউন্ট নম্বর:' : 'DBBL Rocket Number:'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-mono font-black text-xs text-purple-900">
                                        {paymentConfig.rocket.accountNumber || '01912-345678-9'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPaymentNumber((paymentConfig.rocket.accountNumber || '019123456789').replace(/[^0-9]/g, ''))}
                                        className="px-2 py-0.5 bg-purple-200/80 hover:bg-purple-300 text-purple-900 rounded-md text-[10px] font-bold cursor-pointer"
                                      >
                                        {copiedNumber === (paymentConfig.rocket.accountNumber || '019123456789').replace(/[^0-9]/g, '') ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}
                                      </button>
                                    </div>
                                  </div>
                                  <ol className="list-decimal list-inside text-[11px] text-purple-800 space-y-0.5">
                                    <li>{isBn ? 'রকেট অ্যাপ খুলুন বা *322# ডায়াল করুন।' : 'Open Rocket App or dial *322#.'}</li>
                                    <li>
                                      {isPrescriptionBooking
                                        ? (isBn ? `প্রেসক্রিপশন পর্যালোচনার পর নির্ধারিত বিল ${paymentConfig.rocket.accountNumber || '01912-345678-9'} এ সেন্ড মানি করতে পারবেন।` : `Pay to ${paymentConfig.rocket.accountNumber || '01912-345678-9'} upon review.`)
                                        : (isBn ? `রকেট একাউন্ট ${paymentConfig.rocket.accountNumber || '01912-345678-9'} এ মোট ৳${totalBill} টাকা সেন্ড মানি করুন।` : `Send ৳${totalBill} to ${paymentConfig.rocket.accountNumber || '01912-345678-9'}.`)}
                                    </li>
                                    {!isPrescriptionBooking && <li>{isBn ? 'নিচে আপনার রকেট প্রেরক নম্বর ও TrxID প্রদান করুন।' : 'Enter sender phone and TrxID below.'}</li>}
                                  </ol>
                                </div>

                                {!isPrescriptionBooking && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                                        <span>{isBn ? 'রকেট মোবাইল নম্বর (Sender Phone):' : 'Rocket Sender Phone:'}</span>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* বাধ্যতামূলক' : '* Required'}</span>
                                      </label>
                                      <input 
                                        type="tel"
                                        required
                                        placeholder="019XXXXXXXX"
                                        value={formData.senderPhone || ''}
                                        onChange={(e) => {
                                          setFormData({ ...formData, senderPhone: e.target.value });
                                          if (validationError) setValidationError(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                                        <span>{isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID (TrxID):'}</span>
                                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* বাধ্যতামূলক' : '* Required'}</span>
                                      </label>
                                      <input 
                                        type="text"
                                        required
                                        placeholder="e.g. 8ROC7712"
                                        value={formData.transactionId || ''}
                                        onChange={(e) => {
                                          setFormData({ ...formData, transactionId: e.target.value });
                                          if (validationError) setValidationError(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Debit / Credit Card Form */}
                            {opt.id === 'card' && (
                              <div className="space-y-2.5">
                                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                                  <div className="flex items-center justify-between text-xs text-sky-950 font-bold">
                                    <span>{isBn ? 'নিরাপদ কার্ড পেমেন্ট (Visa / MasterCard / AMEX)' : 'Secure Card Payment'}</span>
                                    <span className="flex items-center gap-1 text-[10px] text-sky-700">
                                      <Lock size={12} /> 256-bit SSL
                                    </span>
                                  </div>

                                  {!isPrescriptionBooking ? (
                                    <div className="space-y-2 pt-1">
                                      <div>
                                        <label className="text-[10px] font-bold text-slate-700 flex items-center justify-between mb-0.5">
                                          <span>{isBn ? 'কার্ড নম্বর (১৬ ডিজিট):' : 'Card Number (16-digit):'}</span>
                                          <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* বাধ্যতামূলক' : '* Required'}</span>
                                        </label>
                                        <input 
                                          type="text" 
                                          required
                                          maxLength={19}
                                          placeholder="4123 •••• •••• 9876"
                                          value={formData.cardNumber || ''}
                                          onChange={(e) => {
                                            const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                            const matches = v.match(/\d{4,16}/g);
                                            const match = matches && matches[0] || '';
                                            const parts = [];
                                            for (let i = 0, len = match.length; i < len; i += 4) {
                                              parts.push(match.substring(i, i + 4));
                                            }
                                            const formatted = parts.length ? parts.join(' ') : v;
                                            setFormData({ ...formData, cardNumber: formatted });
                                            if (validationError) setValidationError(null);
                                          }}
                                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-[10px] font-bold text-slate-700 flex items-center justify-between mb-0.5">
                                            <span>{isBn ? 'মেয়াদ (MM/YY):' : 'Expiry (MM/YY):'}</span>
                                            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* আবশ্যক' : '* Required'}</span>
                                          </label>
                                          <input 
                                            type="text" 
                                            required
                                            maxLength={5}
                                            placeholder="12/28"
                                            value={formData.cardExpiry || ''}
                                            onChange={(e) => {
                                              let v = e.target.value.replace(/[^0-9]/g, '');
                                              if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                              setFormData({ ...formData, cardExpiry: v });
                                              if (validationError) setValidationError(null);
                                            }}
                                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[10px] font-bold text-slate-700 flex items-center justify-between mb-0.5">
                                            <span>{isBn ? 'সিভিভি (CVV/CVC):' : 'CVV / CVC:'}</span>
                                            <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* আবশ্যক' : '* Required'}</span>
                                          </label>
                                          <input 
                                            type="password" 
                                            required
                                            maxLength={4}
                                            placeholder="•••"
                                            value={formData.cardCvv || ''}
                                            onChange={(e) => {
                                              setFormData({ ...formData, cardCvv: e.target.value.replace(/[^0-9]/g, '') });
                                              if (validationError) setValidationError(null);
                                            }}
                                            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-mono focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-[10px] font-bold text-slate-700 flex items-center justify-between mb-0.5">
                                          <span>{isBn ? 'কার্ডধারীর নাম:' : 'Cardholder Name:'}</span>
                                          <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">{isBn ? '* আবশ্যক' : '* Required'}</span>
                                        </label>
                                        <input 
                                          type="text" 
                                          required
                                          placeholder="e.g. MOHAMMAD RAHIM"
                                          value={formData.cardHolder || ''}
                                          onChange={(e) => {
                                            setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() });
                                            if (validationError) setValidationError(null);
                                          }}
                                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs uppercase focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none"
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-sky-800">
                                      {isBn ? 'প্রেসক্রিপশন পর্যালোচনার পর আপনি অনলাইনে কার্ডের মাধ্যমে নিরাপদ পেমেন্ট সম্পন্ন করতে পারবেন।' : 'You can pay online with card after prescription review.'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 4: BOOKING CONFIRMED & INVOICE DOWNLOAD       */}
          {/* ==================================================== */}
          {step === 4 && (
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
                  {isPrescriptionBooking
                    ? (isBn 
                        ? 'আমাদের মেডিকেল স্পেশালিস্ট দ্রুত প্রেসক্রিপশন পর্যালোচনা করে টেস্ট ও চূড়ান্ত বিল নিশ্চিত করতে যোগাযোগ করবেন।' 
                        : 'Our medical specialist will review your prescription and contact you shortly to confirm tests and discounted bill.')
                    : (isBn 
                        ? 'আমাদের মেডিকেল প্রতিনিধি দ্রুত আপনার সাথে যোগাযোগ করে স্যাম্পল কালেকশন নিশ্চিত করবেন।' 
                        : 'Our medical representative will call you shortly to confirm sample collection.')}
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
                  <span className="text-slate-500">{isBn ? 'পেমেন্ট পদ্ধতি:' : 'Payment Method:'}</span>
                  <strong className="text-slate-900 capitalize">
                    {isPrescriptionBooking
                      ? (isBn ? 'প্রেসক্রিপশন যাচাই সাপেক্ষে (স্যাম্পল সংগ্রহের সময় পরিশোধ)' : 'Pay on Sample Collection')
                      : formData.paymentMethod === 'cod' 
                      ? (isBn ? 'ক্যাশ অন কালেকশন' : 'Cash on Delivery')
                      : formData.paymentMethod === 'bkash'
                      ? `bKash ${formData.transactionId ? `(Trx: ${formData.transactionId})` : ''}`
                      : formData.paymentMethod === 'nagad'
                      ? `Nagad ${formData.transactionId ? `(Trx: ${formData.transactionId})` : ''}`
                      : formData.paymentMethod === 'rocket'
                      ? `Rocket ${formData.transactionId ? `(Trx: ${formData.transactionId})` : ''}`
                      : (isBn ? 'অনলাইন কার্ড পেমেন্ট' : 'Credit/Debit Card')}
                  </strong>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">{isBn ? 'ঠিকানা:' : 'Address:'}</span>
                  <span className="text-slate-800 text-right max-w-[200px] truncate">{formData.address}</span>
                </div>
                <div className="flex justify-between pt-1 items-center">
                  <span className="text-slate-900 font-bold">{isBn ? 'মোট বিল:' : 'Total Bill:'}</span>
                  {isPrescriptionBooking ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {isBn ? 'প্রেসক্রিপশন পর্যালোচনার পর নির্ধারিত হবে' : 'Subject to prescription review'}
                    </span>
                  ) : (
                    <strong className="text-emerald-600 font-black text-sm">৳{totalBill}</strong>
                  )}
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

        {/* Modal Sticky Bottom Actions (For Step 1, Step 2, and Step 3) */}
        {step !== 4 && (
          <div className="bg-white border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg flex-shrink-0">
            
            {/* Step 1 Actions: Proceed to Step 2 */}
            {step === 1 && (
              <>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'মোট প্রদেয় বিল' : 'Total Bill'}</span>
                  {isPrescriptionBooking ? (
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck size={14} className="shrink-0" />
                      <span>{isBn ? 'প্রেসক্রিপশন যাচাই সাপেক্ষে' : 'Under Review'}</span>
                    </span>
                  ) : (
                    <span className="text-base sm:text-lg font-black text-primary">৳{totalBill}</span>
                  )}
                </div>
                <Button
                  onClick={handleProceedToStep2}
                  disabled={cartItems.length === 0 && !formData.prescriptionUrl}
                  className="px-5 py-3 text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isBn ? 'পরবর্তী: শিডিউল ও সময়' : 'Next: Schedule'}</span>
                  <ChevronRight size={16} />
                </Button>
              </>
            )}

            {/* Step 2 Actions: Back to Step 1 or Proceed to Step 3 */}
            {step === 2 && (
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
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'বিলিং' : 'Billing'}</span>
                  {isPrescriptionBooking ? (
                    <span className="text-xs font-bold text-emerald-600">{isBn ? 'প্রেসক্রিপশন সাপেক্ষে' : 'Under Review'}</span>
                  ) : (
                    <span className="text-base font-black text-emerald-600">৳{totalBill}</span>
                  )}
                </div>

                <Button
                  onClick={handleProceedToStep3}
                  disabled={!formData.time || !formData.fullName || !formData.phoneNumber || !formData.address}
                  className="px-5 py-3 text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 cursor-pointer bg-primary hover:bg-sky-600 text-white"
                >
                  <span>{isBn ? 'পরবর্তী: পেমেন্ট পদ্ধতি' : 'Next: Payment'}</span>
                  <ChevronRight size={16} />
                </Button>
              </>
            )}

            {/* Step 3 Actions: Back to Step 2 or Confirm Booking */}
            {step === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={15} />
                  <span>{isBn ? 'পেছনে' : 'Back'}</span>
                </button>

                <div className="hidden sm:block text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'পেমেন্ট মেথড' : 'Payment'}</span>
                  <span className="text-xs font-bold text-slate-800 capitalize">
                    {isPrescriptionBooking ? (isBn ? 'স্যাম্পল কালেকশনের পর' : 'Pay on Collection') : `${formData.paymentMethod} (৳${totalBill})`}
                  </span>
                </div>

                <Button
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
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
        {/* Prescription Full Image Zoom Modal */}
        {prescriptionPreviewModal && (
          <div 
            onClick={() => setPrescriptionPreviewModal(null)}
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95"
            >
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <FileUp size={15} className="text-primary" />
                  <span>{isBn ? 'প্রেসক্রিপশন প্রিভিউ' : 'Prescription Preview'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPrescriptionPreviewModal(null)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-2 overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-950/90">
                <img 
                  src={prescriptionPreviewModal} 
                  alt="Prescription Full View" 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" 
                />
              </div>

              <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {formData.prescriptionName || (isBn ? 'সংযুক্ত প্রেসক্রিপশন' : 'Attached Prescription')}
                </span>
                <button
                  type="button"
                  onClick={() => setPrescriptionPreviewModal(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isBn ? 'ঠিক আছে' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
