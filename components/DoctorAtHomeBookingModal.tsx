import React, { useState, useEffect } from 'react';
import { 
  X, 
  Home, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Stethoscope, 
  Activity, 
  HeartPulse, 
  CreditCard, 
  Check, 
  Copy, 
  Printer, 
  MessageCircle,
  Banknote,
  Smartphone,
  Wallet,
  LogIn,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { DoctorAtHomeBooking, Language, PaymentMethod, PatientUser, PaymentGatewaysConfig, DoctorAtHomeSpecialty, DoctorAtHomeScheduleConfig } from '../types';
import { 
  DEFAULT_DOCTOR_AT_HOME_SPECIALTIES, 
  getStoredPaymentConfig, 
  getStoredCurrentPatient, 
  getStoredSiteSettings,
  getStoredDoctorAtHomeSpecialties,
  getStoredDoctorAtHomeSchedule 
} from '../services/dataStorage';
import { printOrDownloadDoctorAtHomeSlip, downloadDoctorAtHomeSlipHtml } from '../services/invoiceService';

interface DoctorAtHomeBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentPatient?: PatientUser | null;
  onBookingConfirmed: (booking: DoctorAtHomeBooking) => void;
  defaultSpecialty?: string;
  onOpenAuthModal?: () => void;
}

const DHAKA_AREAS = [
  'ধানমন্ডি (Dhanmondi)',
  'গুলশান-১ ও ২ (Gulshan)',
  'বনানী (Banani)',
  'উত্তরা (Uttara)',
  'মিরপুর (Mirpur)',
  'মোহাম্মদপুর (Mohammadpur)',
  'বসুন্ধরা আ/এ (Bashundhara R/A)',
  'বারিধারা (Baridhara)',
  'মতিঝিল ও পল্টন (Motijheel)',
  'মগবাজার ও বেইলি রোড (Moghbazar)',
  'খিলগাঁও ও মালিবাগ (Khilgaon)',
  'পুরান ঢাকা (Old Dhaka)',
  'শ্যামলী ও কল্যাণপুর (Shyamoli)',
  'লালমাটিয়া (Lalmatia)',
  'তেজগাঁও ও মহাখালী (Mohakhali)',
  'রামপুরা ও বাড্ডা (Badda/Rampura)',
  'অন্যান্য এলাকা (Other Dhaka Area)'
];

const TIME_SLOTS = [
  { id: 'morning_1', timeBn: 'সকাল ৯:০০ - ১২:০০ (Morning)', timeEn: 'Morning (09:00 AM - 12:00 PM)', label: 'Morning Slot' },
  { id: 'afternoon_1', timeBn: 'দুপুর ১২:০০ - ৩:০০ (Afternoon)', timeEn: 'Afternoon (12:00 PM - 03:00 PM)', label: 'Afternoon Slot' },
  { id: 'evening_1', timeBn: 'বিকাল ৩:০০ - সন্ধ্যা ৬:০০ (Evening)', timeEn: 'Evening (03:00 PM - 06:00 PM)', label: 'Evening Slot' },
  { id: 'night_1', timeBn: 'সন্ধ্যা ৬:০০ - রাত ৯:০০ (Night)', timeEn: 'Night (06:00 PM - 09:00 PM)', label: 'Night Slot' }
];

const QUICK_SYMPTOMS = [
  'জ্বর ও সর্দি-কাশি',
  'উচ্চ রক্তচাপ (High BP)',
  'ডায়াবেটিস নিয়ন্ত্রণহীন',
  'পেটব্যথা ও বমি',
  'শারীরিক দুর্বলতা ও ক্লান্তি',
  'শ্বাসকষ্ট বা বুকে অস্বস্তি',
  'শিশুর জ্বর ও কান্না',
  'হাড় ও জয়েন্টে তীব্র ব্যথা',
  'রুটিন হোম হেলথ চেকআপ'
];

export const DoctorAtHomeBookingModal: React.FC<DoctorAtHomeBookingModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentPatient,
  onBookingConfirmed,
  defaultSpecialty,
  onOpenAuthModal
}) => {
  const isBn = lang === 'bn';
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const siteSettings = getStoredSiteSettings(lang);
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewaysConfig>(getStoredPaymentConfig);

  // Dynamic Specialties & Schedule Config from Admin Settings
  const [specialtiesList, setSpecialtiesList] = useState<DoctorAtHomeSpecialty[]>(() => {
    const all = getStoredDoctorAtHomeSpecialties();
    const active = all.filter(s => s.isActive !== false);
    return active.length > 0 ? active : all;
  });
  const [scheduleConfig, setScheduleConfig] = useState<DoctorAtHomeScheduleConfig>(() => getStoredDoctorAtHomeSchedule());

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(defaultSpecialty || 'general_physician');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [selectedArea, setSelectedArea] = useState(DHAKA_AREAS[0]);
  const [address, setAddress] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0].timeBn);
  const [symptoms, setSymptoms] = useState('');
  const [emergencyInstructions, setEmergencyInstructions] = useState('');

  // Payment Options unified with Test & Doctor Booking
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<DoctorAtHomeBooking | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [hasAutoFilledProfile, setHasAutoFilledProfile] = useState(false);
  const [showSlipPreview, setShowSlipPreview] = useState(false);

  // 7 Days advance booking calculation (Admin panel & booking requirement)
  const maxAdvanceDays = Math.min(7, Math.max(1, scheduleConfig.maxAdvanceDays || 7));
  const maxBookingDate = new Date();
  maxBookingDate.setDate(maxBookingDate.getDate() + maxAdvanceDays);
  const maxBookingDateStr = maxBookingDate.toISOString().split('T')[0];

  // Active Time Slots from Schedule Config
  const activeTimeSlots = (scheduleConfig.timeSlots || []).filter(s => s.isActive !== false);
  const availableTimeSlots = activeTimeSlots.length > 0 ? activeTimeSlots : TIME_SLOTS;

  // Holiday checks for selected date
  const selectedDateObj = new Date(appointmentDate + 'T00:00:00');
  const selectedDayOfWeek = selectedDateObj.getDay();
  const isWeeklyHoliday = (scheduleConfig.weeklyHolidays || []).includes(selectedDayOfWeek);
  const isSpecialHoliday = (scheduleConfig.holidayDates || []).includes(appointmentDate);
  const isHolidayDate = isWeeklyHoliday || isSpecialHoliday;

  // Auto-populate patient details whenever modal opens or currentPatient changes
  useEffect(() => {
    if (isOpen) {
      setPaymentConfig(getStoredPaymentConfig());
      const loadedSpecs = getStoredDoctorAtHomeSpecialties();
      const activeSpecs = loadedSpecs.filter(s => s.isActive !== false);
      const effectiveSpecs = activeSpecs.length > 0 ? activeSpecs : loadedSpecs;
      setSpecialtiesList(effectiveSpecs);

      const loadedSchedule = getStoredDoctorAtHomeSchedule();
      setScheduleConfig(loadedSchedule);

      setErrorMsg(null);
      setConfirmedBooking(null);
      setCopiedId(false);
      setShowSlipPreview(false);

      if (defaultSpecialty && effectiveSpecs.some(s => s.id === defaultSpecialty)) {
        setSelectedSpecialty(defaultSpecialty);
      } else if (effectiveSpecs.length > 0 && !effectiveSpecs.some(s => s.id === selectedSpecialty)) {
        setSelectedSpecialty(effectiveSpecs[0].id);
      }

      // Check logged-in user profile
      const pat = currentPatient || getStoredCurrentPatient();
      if (pat) {
        setHasAutoFilledProfile(true);
        if (pat.name) setPatientName(pat.name);
        if (pat.phone) {
          setPatientPhone(pat.phone);
          setSenderPhone(pat.phone);
        }
        if (pat.age) setPatientAge(String(pat.age));
        if (pat.gender) setPatientGender(pat.gender as any);
        if (pat.address) {
          setAddress(pat.address);

          // Auto-match area from patient address if found
          const lowerAddr = pat.address.toLowerCase();
          const matched = DHAKA_AREAS.find(a => {
            const raw = a.split('(')[0].trim().toLowerCase();
            return lowerAddr.includes(raw);
          });
          if (matched) {
            setSelectedArea(matched);
          }
        }
      } else {
        setHasAutoFilledProfile(false);
      }
    }
  }, [isOpen, currentPatient, defaultSpecialty]);

  if (!isOpen) return null;

  const currentSpecialtyObj = specialtiesList.find(s => s.id === selectedSpecialty) 
    || specialtiesList[0] 
    || DEFAULT_DOCTOR_AT_HOME_SPECIALTIES[0];

  const visitingFee = currentSpecialtyObj.fee;

  // Unified Payment options matching Test & Doctor Consultations
  const allPaymentOptions: { id: PaymentMethod; title: string; subtitle: string; icon: any; color: string; badge?: string }[] = [
    {
      id: 'cod',
      title: isBn ? 'ভিজিটের সময় নগদ (Cash on Visit)' : 'Cash on Doctor Visit',
      subtitle: isBn ? 'ডাক্তার বাসায় এসে চেকআপ ও সেবা প্রদানের পর সরাসরি ক্যাশ পরিশোধ' : 'Pay cash to doctor after home consultation & checkup',
      icon: Banknote,
      color: 'emerald',
      badge: isBn ? 'সবচেয়ে জনপ্রিয়' : 'Most Popular'
    },
    {
      id: 'bkash',
      title: isBn ? 'বিকাশ (bKash Payment)' : 'bKash Mobile Banking',
      subtitle: isBn ? 'বিকাশ অ্যাপ অথবা ডায়াল করে মার্চেন্ট পেমেন্ট / সেন্ড মানি' : 'Direct Send Money / Merchant Payment',
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
      title: isBn ? 'রকেট (Rocket Payment)' : 'DBBL Rocket Payment',
      subtitle: isBn ? 'ডাচ-বাংলা রকেট অ্যাকাউন্টে পেমেন্ট করুন' : 'Payment via Rocket account',
      icon: Smartphone,
      color: 'purple',
      badge: paymentConfig?.rocket?.merchantNumber || '01912-345678'
    },
    {
      id: 'card',
      title: isBn ? 'ভিসা / মাস্টারকার্ড (Cards & Net Banking)' : 'Credit / Debit Card',
      subtitle: isBn ? 'ভিসা, মাস্টারকার্ড বা অনলাইন ব্যাংকিং পেমেন্ট' : 'Visa, MasterCard or Internet Banking',
      icon: CreditCard,
      color: 'indigo',
      badge: isBn ? 'ইনস্ট্যান্ট ভেরিফাই' : 'Instant'
    }
  ];

  // Filter payment methods based on Admin CMS Gateways configuration
  const paymentOptions = allPaymentOptions.filter(opt => {
    const gateway = paymentConfig?.[opt.id];
    return gateway ? gateway.isActive !== false : true;
  });

  const handleCopyPaymentNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleQuickSymptom = (sym: string) => {
    setSymptoms(prev => {
      if (!prev.trim()) return sym;
      if (prev.includes(sym)) return prev;
      return `${prev}, ${sym}`;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Basic Field Validations
    if (!patientName.trim()) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে রোগীর নাম প্রদান করুন।' : 'Please enter the patient name.');
      return;
    }
    const cleanPhone = patientPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 11) {
      setErrorMsg(isBn ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)।' : 'Please enter a valid 11-digit phone number (e.g. 017XXXXXXXX).');
      return;
    }
    if (!address.trim()) {
      setErrorMsg(isBn ? 'বাসা/রোড নম্বর সহ সম্পূর্ণ ঠিকানা প্রদান করুন।' : 'Please enter complete home address including house/road.');
      return;
    }
    if (!symptoms.trim()) {
      setErrorMsg(isBn ? 'রোগীর প্রধান লক্ষণ বা সমস্যাটি লিখুন।' : 'Please describe symptoms or reason for doctor visit.');
      return;
    }

    // Advance Booking Window: User explicitly requested maximum 7 days advance booking limit
    const chosenDate = new Date(appointmentDate + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = chosenDate.getTime() - todayDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 7) {
      setErrorMsg(isBn 
        ? 'দুঃখিত, "Doctor at Home" সার্ভিসে সর্বোচ্চ ৭ দিনের বেশি অগ্রীম বুকিং করা যাবে না।' 
        : 'Sorry, Doctor at Home appointments cannot be booked more than 7 days in advance.');
      return;
    }

    if (diffDays < 0) {
      setErrorMsg(isBn 
        ? 'অনুগ্রহ করে আজকের বা আগামী ৭ দিনের মধ্যের একটি সঠিক তারিখ নির্বাচন করুন।' 
        : 'Please select today or a date within the next 7 days.');
      return;
    }

    // 2. Payment Method Validations matching Test & Doctor Consultations
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      const cleanSender = senderPhone.trim().replace(/\D/g, '');
      if (!cleanSender || cleanSender.length !== 11) {
        setErrorMsg(isBn 
          ? `সঠিক ১১ ডিজিটের ${paymentMethod.toUpperCase()} প্রেরক (Sender) নম্বর প্রদান করুন।` 
          : `Please enter a valid 11-digit ${paymentMethod.toUpperCase()} sender phone number.`);
        return;
      }
      if (!transactionId.trim() || transactionId.trim().length < 4) {
        setErrorMsg(isBn 
          ? `অনুগ্রহ করে সঠিক ${paymentMethod.toUpperCase()} ট্রানজেকশন আইডি (TrxID) প্রদান করুন।` 
          : `Please enter a valid ${paymentMethod.toUpperCase()} transaction ID.`);
        return;
      }
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        setErrorMsg(isBn ? 'অনুগ্রহ করে সঠিক ১৬ ডিজিটের কার্ড নম্বর লিখুন।' : 'Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/') || cardExpiry.length < 5) {
        setErrorMsg(isBn ? 'কার্ডের মেয়াদ (MM/YY) সঠিকভাবে উল্লেখ করুন।' : 'Please enter card expiry date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMsg(isBn ? 'কার্ডের ৩ বা ৪ ডিজিটের সিভিভি (CVV) কোড প্রদান করুন।' : 'Please enter valid 3 or 4-digit CVV code.');
        return;
      }
    }

    setIsSubmitting(true);

    const bookingId = `DAH-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentStatus: 'unpaid' | 'paid' | 'pending_verification' = 
      paymentMethod === 'card' 
        ? 'paid' 
        : (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket')
        ? (transactionId.trim() ? 'pending_verification' : 'unpaid')
        : 'unpaid';

    const newBooking: DoctorAtHomeBooking = {
      id: bookingId,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      altPhone: altPhone.trim() || undefined,
      patientAge: patientAge.trim() || undefined,
      patientGender,
      address: `${address.trim()} (${selectedArea})`,
      area: selectedArea,
      date: appointmentDate,
      timeSlot,
      doctorType: selectedSpecialty,
      doctorTypeLabel: isBn ? currentSpecialtyObj.nameBn : currentSpecialtyObj.nameEn,
      symptoms: symptoms.trim(),
      consultationFee: visitingFee,
      paymentMethod,
      paymentStatus,
      transactionId: transactionId.trim() || (paymentMethod === 'card' ? `CARD-${Date.now().toString().slice(-6)}` : undefined),
      status: 'pending',
      emergencyInstructions: emergencyInstructions.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onBookingConfirmed(newBooking);
      setConfirmedBooking(newBooking);
    }, 500);
  };

  const copyBookingId = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handlePrintSlip = () => {
    if (confirmedBooking) {
      printOrDownloadDoctorAtHomeSlip(confirmedBooking, lang, siteSettings);
    }
  };

  const handleDownloadSlipHtml = () => {
    if (confirmedBooking) {
      downloadDoctorAtHomeSlipHtml(confirmedBooking, lang, siteSettings);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Home size={26} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
                  {isBn ? 'হোম হেলথকেয়ার' : 'Home Visit Service'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider">
                  ★ Specialist
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1">
                {isBn ? 'Doctor at Home (বাসায় ডাক্তার সেবা)' : 'Doctor at Home Service'}
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                {isBn 
                  ? 'আপনার বাসা বা অফিসে অভিজ্ঞ বিশেষজ্ঞ ডাক্তারের ফিজিক্যাল ভিজিট ও চিকিৎসা' 
                  : 'Qualified specialist doctor visits your residence for full clinical checkup'}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {confirmedBooking ? (
            /* Confirmation Success State with Reliable Print Slip */
            <div className="text-center py-4 space-y-5 animate-scaleUp">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border-4 border-emerald-50 shadow-inner">
                <CheckCircle2 size={44} />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold mb-2">
                  {isBn ? '✓ বুকিং সফলভাবে গ্রহণ করা হয়েছে!' : '✓ Booking Received Successfully!'}
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  {isBn ? 'আপনার হোম ডক্টর বুকিং সম্পন্ন হয়েছে' : 'Your Home Doctor Visit is Scheduled'}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mt-1">
                  {isBn 
                    ? 'আমাদের মেডিকেল কো-অর্ডিনেটর শীঘ্রই আপনার নম্বরে কল করে ডাক্তারের সময় ও ভিজিট নিশ্চিত করবেন।' 
                    : 'Our medical coordinator will call your phone shortly to confirm the visiting doctor.'}
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold">{isBn ? 'বুকিং ট্র্যাকিং আইডি:' : 'Tracking ID:'}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-primary text-base">{confirmedBooking.id}</span>
                    <button 
                      type="button"
                      onClick={copyBookingId}
                      className="p-1 text-slate-500 hover:text-primary rounded transition-colors cursor-pointer"
                      title="Copy ID"
                    >
                      {copiedId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{isBn ? 'ডাক্তারের ধরন:' : 'Doctor Specialty:'}</span>
                    <strong className="text-slate-900">{confirmedBooking.doctorTypeLabel}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{isBn ? 'রোগীর নাম:' : 'Patient Name:'}</span>
                    <strong className="text-slate-900">{confirmedBooking.patientName} {confirmedBooking.patientAge ? `(${confirmedBooking.patientAge}y)` : ''}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{isBn ? 'তারিখ ও স্লট:' : 'Date & Slot:'}</span>
                    <strong className="text-slate-900">{confirmedBooking.date} • {confirmedBooking.timeSlot}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">{isBn ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                    <strong className="text-slate-900">{confirmedBooking.patientPhone}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[11px] text-slate-400 block">{isBn ? 'ভিজিট ঠিকানা:' : 'Visiting Address:'}</span>
                    <strong className="text-slate-900">{confirmedBooking.address}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-500 block">{isBn ? 'পেমেন্ট মেথড:' : 'Payment:'}</span>
                    <strong className="text-slate-900 uppercase">{confirmedBooking.paymentMethod} {confirmedBooking.paymentStatus === 'paid' ? '(PAID)' : '(DUE)'}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">{isBn ? 'ভিজিট ফি:' : 'Visiting Fee:'}</span>
                    <span className="text-lg font-black text-emerald-800">৳ {confirmedBooking.consultationFee}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Print Slip, Download Slip, Preview, WhatsApp, Close */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={handlePrintSlip}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                  title="Print Doctor at Home receipt slip"
                >
                  <Printer size={15} />
                  <span>{isBn ? 'স্লিপ প্রিন্ট করুন' : 'Print Slip'}</span>
                </button>

                <button 
                  type="button"
                  onClick={handleDownloadSlipHtml}
                  className="px-4 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Download slip as offline HTML file"
                >
                  <Download size={14} className="text-emerald-600" />
                  <span>{isBn ? 'স্লিপ ডাউনলোড (.html)' : 'Download Slip'}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setShowSlipPreview(!showSlipPreview)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {showSlipPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showSlipPreview ? (isBn ? 'প্রিভিউ লুকান' : 'Hide Preview') : (isBn ? 'স্লিপ প্রিভিউ' : 'View Receipt')}</span>
                </button>

                <a 
                  href={`https://wa.me/88${(siteSettings.contactWhatsApp || siteSettings.contactPhone || '01700000000').replace(/\D/g, '')}?text=${encodeURIComponent(
                    `আসসালামু আলাইকুম, আমি Doctor at Home বুকিং করেছি। ট্র্যাকিং আইডি: ${confirmedBooking.id}, রোগী: ${confirmedBooking.patientName}, স্পেশালিটি: ${confirmedBooking.doctorTypeLabel}।`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageCircle size={15} className="text-emerald-600" />
                  <span>{isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
                </a>

                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isBn ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>

              {/* Embedded Official Slip Preview Card */}
              {showSlipPreview && (
                <div className="mt-4 p-5 bg-white border-2 border-emerald-400 rounded-2xl shadow-lg text-left text-slate-800 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                        <Home size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {siteSettings.siteName || 'ই-ক্লিনিক বিডি'} &bull; অফিসিয়াল হোম ডক্টর স্লিপ
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">ID: {confirmedBooking.id} &bull; Generated: {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePrintSlip}
                      className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-emerald-700"
                    >
                      <Printer size={13} /> {isBn ? 'প্রিন্ট' : 'Print'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">রোগীর নাম</span>
                      <strong className="text-slate-900">{confirmedBooking.patientName} ({confirmedBooking.patientGender === 'female' ? 'মহিলা' : confirmedBooking.patientGender === 'male' ? 'পুরুষ' : 'অন্যান্য'})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">মোবাইল নম্বর</span>
                      <strong className="text-slate-900 font-mono">{confirmedBooking.patientPhone}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">ডাক্তার স্পেশালিটি</span>
                      <strong className="text-emerald-700">{confirmedBooking.doctorTypeLabel}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">ভিজিটের তারিখ ও স্লট</span>
                      <strong className="text-slate-900">{confirmedBooking.date} • {confirmedBooking.timeSlot}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">রোগীর পূর্ণ ঠিকানা</span>
                      <p className="text-slate-800 font-medium">{confirmedBooking.address}</p>
                    </div>
                    {confirmedBooking.symptoms && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 font-semibold block uppercase">রোগের লক্ষণ / সমস্যা</span>
                        <p className="text-slate-700 italic">{confirmedBooking.symptoms}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-emerald-800 block uppercase font-semibold">পেমেন্ট মেথড ও স্ট্যাটাস</span>
                      <strong className="text-slate-900 uppercase">{confirmedBooking.paymentMethod} &bull; {confirmedBooking.paymentStatus}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-800 block uppercase font-semibold">মোট ভিজিট ফি</span>
                      <strong className="text-base font-black text-emerald-800">৳{confirmedBooking.consultationFee}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Profile Auto-fill banner or Login CTA */}
              {hasAutoFilledProfile ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{isBn ? '✓ আপনার পেশেন্ট প্রোফাইল থেকে নাম, ফোন ও ঠিকানা স্বয়ংক্রিয়ভাবে লোড হয়েছে।' : '✓ Auto-populated from your patient profile.'}</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full shrink-0">
                    {isBn ? 'প্রোফাইল সিঙ্কড' : 'Synced'}
                  </span>
                </div>
              ) : onOpenAuthModal ? (
                <div className="p-3 bg-sky-50 border border-sky-200/80 rounded-2xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-sky-900">
                    <User size={15} className="text-sky-600 shrink-0" />
                    <span className="font-medium">{isBn ? 'দ্রুত বুকিং করতে আপনার প্রোফাইলে লগইন করুন।' : 'Log in to auto-fill patient profile details.'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="px-3 py-1 bg-primary hover:bg-sky-600 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    <LogIn size={13} />
                    <span>{isBn ? 'লগইন' : 'Log In'}</span>
                  </button>
                </div>
              ) : null}

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2 animate-shake">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Doctor Specialty / Category Selection (No doctor name as requested) */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope size={15} className="text-primary" />
                  <span>{isBn ? 'কী ধরনের ডাক্তার প্রয়োজন? (Select Doctor Category) *' : 'Select Doctor Category *'}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {specialtiesList.filter(s => s.isActive !== false).map((spec) => {
                    const isSelected = selectedSpecialty === spec.id;
                    return (
                      <div
                        key={spec.id}
                        onClick={() => setSelectedSpecialty(spec.id)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`w-2 h-2 rounded-full mt-1 ${isSelected ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                          <div className="flex items-center gap-1">
                            {spec.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                                {spec.badge}
                              </span>
                            )}
                            <span className="font-extrabold text-xs text-emerald-800">৳{spec.fee}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-2 leading-tight">
                          {isBn ? spec.nameBn : spec.nameEn}
                        </h4>
                        {spec.duration && (
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {spec.duration}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Patient Personal Information (Auto-populated from Profile) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <User size={15} className="text-primary" />
                    <span>{isBn ? 'রোগীর বিবরণ (Patient Details) *' : 'Patient Information *'}</span>
                  </label>
                  {hasAutoFilledProfile && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      ✓ Auto-Filled
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      {isBn ? 'রোগীর পুরো নাম *' : 'Patient Full Name *'}
                    </label>
                    <input 
                      type="text"
                      required
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder={isBn ? 'যেমনঃ মোঃ রফিকুল ইসলাম' : 'e.g. John Doe'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Primary Phone */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      {isBn ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Mobile Phone (11 digits) *'}
                    </label>
                    <input 
                      type="tel"
                      required
                      maxLength={11}
                      value={patientPhone}
                      onChange={e => {
                        setPatientPhone(e.target.value);
                        if (!senderPhone) setSenderPhone(e.target.value);
                      }}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                    />
                  </div>

                  {/* Age & Gender */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        {isBn ? 'বয়স (বছর)' : 'Age (Years)'}
                      </label>
                      <input 
                        type="number"
                        min="0"
                        max="120"
                        value={patientAge}
                        onChange={e => setPatientAge(e.target.value)}
                        placeholder="e.g. 45"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        {isBn ? 'লিঙ্গ' : 'Gender'}
                      </label>
                      <select
                        value={patientGender}
                        onChange={e => setPatientGender(e.target.value as any)}
                        className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                        <option value="female">{isBn ? 'মহিলা (Female)' : 'Female'}</option>
                        <option value="other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Alternate Phone */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      {isBn ? 'বিকল্প যোগাযোগের নম্বর (ঐচ্ছিক)' : 'Alternate Phone (Optional)'}
                    </label>
                    <input 
                      type="tel"
                      value={altPhone}
                      onChange={e => setAltPhone(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Address & Area (Auto-populated from Profile) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin size={15} className="text-rose-500" />
                    <span>{isBn ? 'বাসা/অফিসের সম্পূর্ণ ঠিকানা *' : 'Visiting Home Address *'}</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {isBn ? 'ঢাকাসহ সকল এলাকা প্রযোজ্য' : 'All Dhaka Areas Supported'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      {isBn ? 'এলাকা (Area) *' : 'Select Area *'}
                    </label>
                    <select
                      value={selectedArea}
                      onChange={e => setSelectedArea(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {DHAKA_AREAS.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      {isBn ? 'বাড়ি ও রোড নম্বর, ফ্ল্যাট/ফ্লোর *' : 'House/Flat, Road & Landmark *'}
                    </label>
                    <input 
                      type="text"
                      required
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder={isBn ? 'বাড়ি নম্বর, ফ্ল্যাট/ফ্লোর, রোড নং ও নিকটবর্তী ল্যান্ডমার্ক...' : 'House no, flat/floor, road & nearby landmark...'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Appointment Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" />
                      <span>{isBn ? 'ভিজিট তারিখ (সর্বোচ্চ ৭ দিন) *' : 'Visit Date (Max 7 Days) *'}</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button 
                        type="button" 
                        onClick={() => setAppointmentDate(todayStr)} 
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${appointmentDate === todayStr ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {isBn ? 'আজ' : 'Today'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setAppointmentDate(tomorrowStr)} 
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${appointmentDate === tomorrowStr ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {isBn ? 'কাল' : 'Tomorrow'}
                      </button>
                    </div>
                  </div>

                  <input 
                    type="date"
                    required
                    min={todayStr}
                    max={maxBookingDateStr}
                    value={appointmentDate}
                    onChange={e => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                  />

                  <div className="flex items-center justify-between mt-1 px-1">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isBn ? `সীমা: ${todayStr} থেকে ${maxBookingDateStr}` : `Window: ${todayStr} to ${maxBookingDateStr}`}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                      {isBn ? 'সর্বোচ্চ ৭ দিন' : 'Max 7 Days'}
                    </span>
                  </div>

                  {isHolidayDate && (
                    <div className="mt-1.5 p-2.5 bg-amber-50 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
                      <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        {isBn 
                          ? (scheduleConfig.holidayNoticeBn || '⚠️ এই তারিখে নিয়মিত ক্লিনিক্যাল সময়সূচি সীমিত বা বন্ধ (ছুটি)। তবে বিশেষ জরুরি প্রয়োজনে অন-কল ডাক্তার ভিজিট প্রদান করা হবে।') 
                          : (scheduleConfig.holidayNoticeEn || '⚠️ Routine visit hours are off on this holiday. Emergency on-call doctor is available.')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Time Slot */}
                <div>
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Clock size={14} className="text-amber-500" />
                    <span>{isBn ? 'পছন্দের সময় স্লট *' : 'Preferred Time Slot *'}</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {availableTimeSlots.map(s => (
                      <option key={s.id} value={isBn ? s.timeBn : s.timeEn}>
                        {isBn ? s.timeBn : s.timeEn}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block px-1">
                    {isBn ? 'অ্যাডমিন নির্ধারিত সক্রিয় স্লটসমূহ প্রদর্শিত হচ্ছে' : 'Active admin slots shown'}
                  </span>
                </div>
              </div>

              {/* 5. Symptoms & Health Condition */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText size={14} className="text-primary" />
                    <span>{isBn ? 'রোগীর উপসর্গ বা শারীরিক সমস্যা *' : 'Patient Symptoms & Problem *'}</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {isBn ? 'ট্যাগ স্পর্শ করে যোগ করুন' : 'Tap tags to add'}
                  </span>
                </div>

                {/* Quick Symptom Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SYMPTOMS.map(sym => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => handleQuickSymptom(sym)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        symptoms.includes(sym)
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      + {sym}
                    </button>
                  ))}
                </div>

                <textarea 
                  rows={2}
                  required
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder={isBn ? 'রোগীর কী সমস্যা হচ্ছে, কতদিন ধরে, কোনো ঔষধ চললে তার বিবরণ লিখুন...' : 'Describe symptoms, duration, current medicines, etc.'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                />
              </div>

              {/* Emergency / Special Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  {isBn ? 'জরুরি নির্দেশনা বা বিশেষ কোনো অনুরোধ (ঐচ্ছিক)' : 'Emergency or Special Notes (Optional)'}
                </label>
                <input 
                  type="text"
                  value={emergencyInstructions}
                  onChange={e => setEmergencyInstructions(e.target.value)}
                  placeholder={isBn ? 'যেমনঃ রোগী বিছানা ছেড়ে উঠতে পারেন না, লিফট নেই ইত্যাদি' : 'e.g. Bedridden patient, call before arrival, no elevator'}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* 6. Payment Selection & Fee Summary (Unified with Test & Doctor Booking) */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      {isBn ? 'ডাক্তার হোম ভিজিট ফি' : 'Doctor Home Visit Consultation Fee'}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {isBn ? 'ডাক্তারের ভিজিট, চেকআপ ও ডিজিটাল প্রেসক্রিপশন অন্তর্ভুক্ত' : 'Includes physical visit, checkup & prescription'}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-emerald-900">৳ {visitingFee}</span>
                </div>

                {/* Payment Methods Selector */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Wallet size={15} className="text-primary" />
                    <span>{isBn ? 'পেমেন্ট মাধ্যম নির্বাচন করুন (Payment Option):' : 'Select Payment Method:'}</span>
                  </label>

                  <div className="space-y-2">
                    {paymentOptions.map((opt) => {
                      const isSelected = paymentMethod === opt.id;
                      const IconComp = opt.icon;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => setPaymentMethod(opt.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                <IconComp size={18} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-black text-slate-900 leading-tight">{opt.title}</h4>
                                  {opt.badge && (
                                    <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">{opt.subtitle}</p>
                              </div>
                            </div>

                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>

                          {/* Expandable Details based on selection */}
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-slate-200/80 animate-in fade-in space-y-3 text-xs">
                              {/* COD Instructions */}
                              {opt.id === 'cod' && (
                                <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                                    <ShieldCheck size={15} />
                                    <span>{isBn ? 'ভিজিটের সময় সরাসরি ক্যাশ প্রদান' : 'Cash on Doctor Visit'}</span>
                                  </p>
                                  <p className="text-[11px] text-emerald-800">
                                    {isBn 
                                      ? `কোন অগ্রিম ফি দিতে হবে না। ডাক্তার আপনার বাসায় পৌঁছে রোগীকে পরীক্ষা ও প্রেসক্রিপশন প্রদান শেষে আপনি সরাসরি ৳${visitingFee} টাকা ক্যাশ পরিশোধ করবেন।` 
                                      : `No advance payment required. You will pay ৳${visitingFee} in cash directly to the visiting doctor after completion of home checkup.`}
                                  </p>
                                </div>
                              )}

                              {/* bKash / Nagad / Rocket Instructions & Inputs */}
                              {(opt.id === 'bkash' || opt.id === 'nagad' || opt.id === 'rocket') && (
                                <div className="space-y-2.5">
                                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-slate-800">
                                        {opt.title} {isBn ? 'নম্বর:' : 'Number:'}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-mono font-black text-xs text-emerald-700">
                                          {paymentConfig[opt.id]?.merchantNumber || '01712-345678'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyPaymentNumber((paymentConfig[opt.id]?.merchantNumber || '01712345678').replace(/[^0-9]/g, ''));
                                          }}
                                          className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-md text-[10px] font-bold cursor-pointer"
                                        >
                                          {copiedNumber === (paymentConfig[opt.id]?.merchantNumber || '01712345678').replace(/[^0-9]/g, '') ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-slate-600">
                                      {isBn 
                                        ? `উপরে প্রদত্ত ${opt.id.toUpperCase()} নম্বরে মোট ৳${visitingFee} টাকা Send Money / Payment করুন এবং নিচে আপনার প্রেরক নম্বর ও TrxID লিখুন:` 
                                        : `Send Money / Pay ৳${visitingFee} to above ${opt.id.toUpperCase()} number and enter sender phone & TrxID below:`}
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        {opt.id.toUpperCase()} {isBn ? 'প্রেরক নম্বর (Sender Phone) *' : 'Sender Phone *'}
                                      </label>
                                      <input 
                                        type="tel"
                                        required
                                        maxLength={11}
                                        value={senderPhone}
                                        onChange={e => setSenderPhone(e.target.value)}
                                        placeholder="017XXXXXXXX"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        {isBn ? 'ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}
                                      </label>
                                      <input 
                                        type="text"
                                        required
                                        value={transactionId}
                                        onChange={e => setTransactionId(e.target.value)}
                                        placeholder="e.g. 9J8K7L6M"
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Card Inputs */}
                              {opt.id === 'card' && (
                                <div className="space-y-2.5 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                  <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                      {isBn ? 'কার্ড নম্বর *' : 'Card Number *'}
                                    </label>
                                    <input 
                                      type="text"
                                      maxLength={19}
                                      value={cardNumber}
                                      onChange={e => setCardNumber(e.target.value)}
                                      placeholder="XXXX XXXX XXXX XXXX"
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-1">
                                      <label className="text-[10px] font-bold text-slate-700 block mb-1">
                                        {isBn ? 'মেয়াদ (MM/YY)' : 'Expiry'}
                                      </label>
                                      <input 
                                        type="text"
                                        maxLength={5}
                                        value={cardExpiry}
                                        onChange={e => setCardExpiry(e.target.value)}
                                        placeholder="MM/YY"
                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-center outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>

                                    <div className="col-span-1">
                                      <label className="text-[10px] font-bold text-slate-700 block mb-1">
                                        CVV
                                      </label>
                                      <input 
                                        type="password"
                                        maxLength={4}
                                        value={cardCvv}
                                        onChange={e => setCardCvv(e.target.value)}
                                        placeholder="123"
                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-center outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>

                                    <div className="col-span-1">
                                      <label className="text-[10px] font-bold text-slate-700 block mb-1">
                                        {isBn ? 'নাম' : 'Holder'}
                                      </label>
                                      <input 
                                        type="text"
                                        value={cardHolder}
                                        onChange={e => setCardHolder(e.target.value)}
                                        placeholder="Name"
                                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Home size={18} />
                      <span>{isBn ? 'বাসায় ডাক্তার বুকিং নিশ্চিত করুন' : 'Confirm Doctor at Home Booking'}</span>
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  {isBn ? '🔒 শতভাগ নিরাপদ ও বিশ্বস্ত হোম হেলথকেয়ার সেবা' : '🔒 100% Secure & Trusted Home Healthcare'}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
