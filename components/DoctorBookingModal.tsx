import React, { useState, useEffect } from 'react';
import { Doctor, Language, PaymentMethod, DoctorAppointment, PaymentGatewaysConfig, PatientUser } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  Video, 
  CreditCard, 
  ShieldCheck, 
  User, 
  PhoneCall, 
  Sparkles, 
  AlertCircle,
  Copy,
  Printer,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Info,
  Check,
  Building2,
  Wallet,
  Smartphone
} from 'lucide-react';
import { saveDoctorAppointment, getStoredPaymentConfig, getStoredSiteSettings, getStoredCurrentPatient } from '../services/dataStorage';

interface DoctorBookingModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onBookingSuccess: (appointment: DoctorAppointment) => void;
  onStartVideoCall?: (appointment: DoctorAppointment) => void;
  currentPatient?: PatientUser | null;
}

export const DoctorBookingModal: React.FC<DoctorBookingModalProps> = ({
  doctor,
  isOpen,
  onClose,
  lang,
  onBookingSuccess,
  onStartVideoCall,
  currentPatient
}) => {
  if (!isOpen || !doctor) return null;

  const isBn = lang === 'bn';
  // 4 Steps: 1 = Date & 30-min Slot, 2 = Patient Details, 3 = Payment (Same as test booking), 4 = Confirmed & Instant Video Connect
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Booking Form State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [selectedSlot, setSelectedSlot] = useState<string>('06:00 PM - 06:30 PM');
  const [consultationType, setConsultationType] = useState<'video' | 'audio'>('video');

  // Patient Details - Auto-initialized from logged-in patient
  const initialPatient = currentPatient || getStoredCurrentPatient();
  const [patientName, setPatientName] = useState<string>(() => initialPatient?.name || '');
  const [patientPhone, setPatientPhone] = useState<string>(() => initialPatient?.phone || '');
  const [patientEmail, setPatientEmail] = useState<string>(() => initialPatient?.email || '');
  const [patientAge, setPatientAge] = useState<string>(() => initialPatient?.age ? String(initialPatient.age) : '');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>(() => 
    (initialPatient?.gender === 'female' || initialPatient?.gender === 'other') ? initialPatient.gender : 'male'
  );
  const [problemDescription, setProblemDescription] = useState<string>('');

  // Payment Options matching Test Booking
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewaysConfig>(getStoredPaymentConfig);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [senderPhone, setSenderPhone] = useState<string>(() => initialPatient?.phone || '');
  const [transactionId, setTransactionId] = useState<string>('');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(() => initialPatient?.name || '');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedAppointment, setCompletedAppointment] = useState<DoctorAppointment | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-populate patient details whenever modal opens or currentPatient changes
  useEffect(() => {
    if (isOpen) {
      setPaymentConfig(getStoredPaymentConfig());
      setValidationError(null);

      const pat = currentPatient || getStoredCurrentPatient();
      if (pat) {
        if (pat.name) {
          setPatientName(pat.name);
          setCardHolder(pat.name);
        }
        if (pat.phone) {
          setPatientPhone(pat.phone);
          setSenderPhone(prev => prev || pat.phone);
        }
        if (pat.email) setPatientEmail(pat.email);
        if (pat.age) setPatientAge(String(pat.age));
        if (pat.gender && (pat.gender === 'male' || pat.gender === 'female' || pat.gender === 'other')) {
          setPatientGender(pat.gender);
        }
      }
    }
  }, [isOpen, currentPatient]);

  // 30-Minute Interval Time Slots
  const morningSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM',
    '11:30 AM - 12:00 PM'
  ];

  const afternoonSlots = [
    '03:00 PM - 03:30 PM',
    '03:30 PM - 04:00 PM',
    '04:00 PM - 04:30 PM',
    '04:30 PM - 05:00 PM'
  ];

  const eveningSlots = [
    '05:00 PM - 05:30 PM',
    '05:30 PM - 06:00 PM',
    '06:00 PM - 06:30 PM',
    '06:30 PM - 07:00 PM',
    '07:00 PM - 07:30 PM',
    '07:30 PM - 08:00 PM',
    '08:00 PM - 08:30 PM',
    '08:30 PM - 09:00 PM'
  ];

  const nightSlots = [
    '09:00 PM - 09:30 PM',
    '09:30 PM - 10:00 PM',
    '10:00 PM - 10:30 PM'
  ];

  // Generate Next 7 Days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = isBn 
      ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'][d.getDay()]
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const monthName = isBn
      ? ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'][d.getMonth()]
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
    
    return {
      date: dateStr,
      day: dayName,
      dateNum: d.getDate(),
      month: monthName,
      isToday: i === 0
    };
  });

  const handleProceedToDetails = () => {
    if (!selectedDate || !selectedSlot) {
      setValidationError(isBn ? 'অনুগ্রহ করে তারিখ ও ৩০ মিনিটের সময় স্লট নির্বাচন করুন।' : 'Please select appointment date and 30-minute time slot.');
      return;
    }
    setValidationError(null);
    setStep(2);
  };

  const handleProceedToPayment = () => {
    if (!patientName.trim()) {
      setValidationError(isBn ? 'অনুগ্রহ করে রোগীর নাম লিখুন।' : 'Please enter patient name.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.replace(/[^0-9]/g, '').length < 11) {
      setValidationError(isBn ? 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (e.g. 017XXXXXXXX)।' : 'Please enter a valid 11-digit mobile number.');
      return;
    }
    if (!patientAge || parseInt(patientAge) <= 0) {
      setValidationError(isBn ? 'রোগীর সঠিক বয়স লিখুন।' : 'Please enter valid patient age.');
      return;
    }
    setValidationError(null);
    setStep(3);
  };

  const handleConfirmAppointment = () => {
    if (isProcessing) return;

    // Validate payment method details matching Test Booking
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') {
      const methodName = paymentMethod === 'bkash' 
        ? (isBn ? 'বিকাশ' : 'bKash') 
        : paymentMethod === 'nagad' 
        ? (isBn ? 'নগদ' : 'Nagad') 
        : (isBn ? 'রকেট' : 'Rocket');

      const rawSender = senderPhone.trim().replace(/[^0-9]/g, '');
      if (!senderPhone.trim()) {
        setValidationError(isBn ? `অনুগ্রহ করে আপনার ${methodName} প্রেরক নম্বর (Sender Phone) প্রদান করুন।` : `Please provide your ${methodName} sender phone number.`);
        return;
      }
      if (rawSender.length < 11) {
        setValidationError(isBn ? `সঠিক ১১ ডিজিট ${methodName} নম্বর লিখুন।` : `Enter valid 11-digit ${methodName} number.`);
        return;
      }

      if (!transactionId.trim()) {
        setValidationError(isBn ? `অনুগ্রহ করে ${methodName} ট্রানজেকশন আইডি (TrxID) প্রদান করুন।` : `Please provide the ${methodName} Transaction ID.`);
        return;
      }
      if (transactionId.trim().length < 4) {
        setValidationError(isBn ? 'অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি লিখুন।' : 'Please enter a valid Transaction ID.');
        return;
      }
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        setValidationError(isBn ? 'সঠিক ১৬ ডিজিট কার্ড নম্বর লিখুন।' : 'Enter valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/') || cardExpiry.length < 5) {
        setValidationError(isBn ? 'কার্ডের মেয়াদ (MM/YY) সঠিকভাবে দিন।' : 'Enter valid expiry (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setValidationError(isBn ? 'সঠিক ৩ ডিজিট CVV কোড লিখুন।' : 'Enter valid 3-digit CVV.');
        return;
      }
      if (!cardHolder.trim()) {
        setValidationError(isBn ? 'কার্ডধারীর নাম লিখুন।' : 'Enter cardholder name.');
        return;
      }
    }

    setValidationError(null);
    setIsProcessing(true);

    setTimeout(() => {
      const roomId = `LH-ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
      const appointmentId = `APT-${Date.now().toString().slice(-6)}`;
      
      const newAppointment: DoctorAppointment = {
        id: appointmentId,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctorHospital: doctor.hospital,
        doctorImage: doctor.image,
        doctorFee: doctor.consultationFee,
        patientName,
        patientPhone,
        patientEmail,
        patientAge,
        patientGender,
        problemDescription: problemDescription || (isBn ? 'সাধারণ ভিডিও কনসালটেন্সি' : 'Online Video Consultation'),
        appointmentDate: selectedDate,
        appointmentTimeSlot: selectedSlot,
        consultationType,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        transactionId: transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        senderPhone: senderPhone || patientPhone,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        videoRoomId: roomId
      };

      saveDoctorAppointment(newAppointment);
      setCompletedAppointment(newAppointment);
      setIsProcessing(false);
      setStep(4);
      onBookingSuccess(newAppointment);
    }, 700);
  };

  const handleCopyMeetingLink = (roomId: string) => {
    const meetingUrl = `${window.location.origin}/#room=${roomId}`;
    navigator.clipboard.writeText(meetingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white p-4 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 sm:top-5 right-3.5 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 sm:gap-4 pr-8">
            <img 
              src={doctor.image} 
              alt={doctor.name} 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/40 shadow-md shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
              }}
            />
            <div className="min-w-0 flex-1">
              <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-200 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5 truncate max-w-full">
                {isBn ? 'ডাক্তার বুকিং ও টেলিমেডিসিন' : 'Doctor Booking & Telemedicine'}
              </span>
              <h3 className="text-base sm:text-xl font-bold truncate">{doctor.name}</h3>
              <p className="text-xs text-sky-200 truncate">{doctor.specialty}</p>
              <p className="text-[11px] text-white/70 truncate">{doctor.hospital}</p>
            </div>
          </div>

          {/* Stepper progress - Responsive labels to prevent broken multi-line wraps on mobile */}
          <div className="mt-3.5 sm:mt-5 grid grid-cols-4 gap-1 sm:gap-2 pt-2.5 sm:pt-3 border-t border-white/15 text-[10px] sm:text-[11px] font-semibold text-center">
            <div className={`pb-1 border-b-2 transition-all ${step >= 1 ? 'border-sky-300 text-white font-bold' : 'border-white/20 text-white/50'}`}>
              <span className="sm:hidden">১. স্লট</span>
              <span className="hidden sm:inline">1. {isBn ? 'তারিখ ও স্লট' : 'Date & Slot'}</span>
            </div>
            <div className={`pb-1 border-b-2 transition-all ${step >= 2 ? 'border-sky-300 text-white font-bold' : 'border-white/20 text-white/50'}`}>
              <span className="sm:hidden">২. তথ্য</span>
              <span className="hidden sm:inline">2. {isBn ? 'রোগীর তথ্য' : 'Patient Info'}</span>
            </div>
            <div className={`pb-1 border-b-2 transition-all ${step >= 3 ? 'border-sky-300 text-white font-bold' : 'border-white/20 text-white/50'}`}>
              <span className="sm:hidden">৩. পেমেন্ট</span>
              <span className="hidden sm:inline">3. {isBn ? 'ফি পেমেন্ট' : 'Payment'}</span>
            </div>
            <div className={`pb-1 border-b-2 transition-all ${step >= 4 ? 'border-sky-300 text-white font-bold' : 'border-white/20 text-white/50'}`}>
              <span className="sm:hidden">৪. ভিডিও</span>
              <span className="hidden sm:inline">4. {isBn ? 'ভিডিও কানেক্ট' : 'Video Connect'}</span>
            </div>
          </div>
        </div>

        {/* Validation error banner */}
        {validationError && (
          <div className="bg-red-50 border-b border-red-200 px-4 sm:px-5 py-2.5 flex items-center gap-2 text-red-700 text-xs font-semibold shrink-0">
            <AlertCircle size={15} className="shrink-0 text-red-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* STEP 1: DATE & 30-MINUTE SLOT SELECTION */}
          {step === 1 && (
            <div className="space-y-5 sm:space-y-6">
              {/* Date Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={14} className="text-sky-600 shrink-0" />
                  <span>{isBn ? 'অ্যাপয়েন্টমেন্টের তারিখ নির্বাচন করুন:' : 'Select Appointment Date:'}</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
                  {availableDates.map(item => {
                    const isSelected = selectedDate === item.date;
                    return (
                      <button
                        key={item.date}
                        type="button"
                        onClick={() => setSelectedDate(item.date)}
                        className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-200 ring-2 ring-sky-300 scale-102'
                            : 'bg-white hover:bg-sky-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`block text-[9px] sm:text-[10px] font-medium uppercase ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                          {item.day}
                        </span>
                        <span className="block text-sm sm:text-base font-extrabold my-0.5">
                          {item.dateNum}
                        </span>
                        <span className={`block text-[8px] sm:text-[9px] font-semibold ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                          {item.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 30-Minute Interval Time Slots */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-sky-600 shrink-0" />
                    <span>{isBn ? '৩০ মিনিট স্লট নির্বাচন করুন (Time Slot):' : 'Select 30-Min Time Slot:'}</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 self-start sm:self-auto">
                    ⏱️ {isBn ? 'প্রতি স্লট ৩০ মিনিট' : '30-Minute Slots'}
                  </span>
                </div>

                {/* Evening Slots */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    🌆 {isBn ? 'সন্ধ্যা ও রাত' : 'Evening & Night'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {eveningSlots.map(slot => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between whitespace-nowrap ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                              : 'bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{slot}</span>
                          {isSelected && <Check size={14} className="text-white shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Morning Slots */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    ☀️ {isBn ? 'সকাল' : 'Morning'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {morningSlots.slice(0, 4).map(slot => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between whitespace-nowrap ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                              : 'bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{slot}</span>
                          {isSelected && <Check size={14} className="text-white shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Consultation Type Selector (Online Telemedicine Only) */}
              <div className="p-3.5 sm:p-4 bg-sky-50/70 rounded-2xl border border-sky-200/80 space-y-2.5 sm:space-y-3">
                <label className="block text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Video size={14} className="text-sky-700 shrink-0" />
                  <span>{isBn ? 'কন্সালটেন্সির মাধ্যম (Online Telemedicine):' : 'Consultation Mode:'}</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultationType('video')}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      consultationType === 'video'
                        ? 'bg-white border-sky-600 shadow-md ring-2 ring-sky-300 text-sky-900'
                        : 'bg-white/60 hover:bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Video size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{isBn ? 'এইচডি ভিডিও কল' : 'HD Video Call'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{isBn ? 'ক্যামেরা ও লাইভ চ্যাট' : 'Camera & chat'}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultationType('audio')}
                    className={`p-3 sm:p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      consultationType === 'audio'
                        ? 'bg-white border-sky-600 shadow-md ring-2 ring-sky-300 text-sky-900'
                        : 'bg-white/60 hover:bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                      <PhoneCall size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{isBn ? 'অডিও কল' : 'Audio Call'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{isBn ? 'ভয়েস কন্সালটেন্সি' : 'Voice consult'}</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Consultation Fee Summary */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block">{isBn ? 'কন্সালটেন্সি ফি (Consultation Fee):' : 'Consultation Fee:'}</span>
                  <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                    <span className="text-xl sm:text-2xl font-black text-slate-900">৳ {doctor.consultationFee}</span>
                    {doctor.originalFee && doctor.originalFee > doctor.consultationFee && (
                      <span className="text-xs text-slate-400 line-through">৳ {doctor.originalFee}</span>
                    )}
                    {doctor.discountPercent && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {doctor.discountPercent}% {isBn ? 'ছাড়' : 'Off'}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToDetails}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-200 transition-all cursor-pointer"
                >
                  <span>{isBn ? 'রোগীর তথ্য দিন (পরবর্তী ধাপ)' : 'Next: Patient Info'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PATIENT DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Logged-in Patient Profile Auto-fill Badge */}
              {((currentPatient || getStoredCurrentPatient())) && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold block text-emerald-900 truncate">
                        {isBn ? 'লগইনকৃত রোগী প্রোফাইল' : 'Logged-in Patient'}
                      </span>
                      <span className="text-[11px] text-emerald-700 truncate block">
                        {(currentPatient || getStoredCurrentPatient())?.name} &bull; {(currentPatient || getStoredCurrentPatient())?.phone}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full shrink-0">
                    {isBn ? 'স্বয়ংক্রিয় পূরণ' : 'Auto-filled'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Patient Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'রোগীর পূর্ণ নাম *' : 'Patient Full Name *'}
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder={isBn ? 'e.g. মোঃ করিম হোসেন' : 'e.g. Md. Karim Hossain'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 outline-none"
                    required
                  />
                </div>

                {/* Patient Mobile */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Mobile Number (11-digit) *'}
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    maxLength={11}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 outline-none font-mono"
                    required
                  />
                </div>

                {/* Patient Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'বয়স (বছর) *' : 'Age (Years) *'}
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={e => setPatientAge(e.target.value)}
                    placeholder="e.g. 32"
                    min="1"
                    max="120"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 outline-none"
                    required
                  />
                </div>

                {/* Patient Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'লিঙ্গ (Gender) *' : 'Gender *'}
                  </label>
                  <select
                    value={patientGender}
                    onChange={e => setPatientGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 outline-none bg-white"
                  >
                    <option value="male">{isBn ? 'পুরুষ (Male)' : 'Male'}</option>
                    <option value="female">{isBn ? 'মহিলা (Female)' : 'Female'}</option>
                    <option value="other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
                  </select>
                </div>
              </div>

              {/* Patient Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'ইমেইল (প্রেসক্রিপশন পাওয়ার জন্য ঐচ্ছিক)' : 'Email (Optional, for e-prescription)'}
                </label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={e => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 outline-none"
                />
              </div>

              {/* Problem Symptoms Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'শারীরিক সমস্যা বা লক্ষণসমূহ (Problem Description)' : 'Symptoms / Problem Description'}
                </label>
                <textarea
                  value={problemDescription}
                  onChange={e => setProblemDescription(e.target.value)}
                  placeholder={isBn ? 'আপনার শারীরিক সমস্যা বা উপসর্গের বিবরণ লিখুন (যেমন: ৩ দিন ধরে জ্বর ও কাশি)...' : 'Describe your symptoms, fever, pain, or existing health conditions...'}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 outline-none resize-none"
                />
              </div>

              {/* Appointment summary info badge */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="truncate">
                  <span className="font-bold">{doctor.name}</span> &bull; {selectedDate} ({selectedSlot})
                </div>
                <span className="font-black text-sky-800 text-sm">৳ {doctor.consultationFee}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {isBn ? 'পূর্ববর্তী' : 'Back'}
                </button>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-200 cursor-pointer"
                >
                  <span>{isBn ? 'পেমেন্ট ধাপে যান' : 'Proceed to Payment'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT FLOW IDENTICAL TO LAB TEST BOOKING */}
          {step === 3 && (
            <div className="space-y-4 sm:space-y-5">
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {isBn ? 'মোট প্রদেয় কনসালটেন্সি ফি' : 'Total Payable Consultation Fee'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900">৳ {doctor.consultationFee}</span>
                </div>
                <div className="sm:text-right text-xs">
                  <span className="font-bold text-slate-700 block truncate">{doctor.name}</span>
                  <span className="text-slate-500 text-[11px]">{selectedDate} &bull; {selectedSlot}</span>
                </div>
              </div>

              {/* Payment Method Selector matching Test Booking */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-sky-600 shrink-0" />
                  <span>{isBn ? 'পেমেন্ট মাধ্যম নির্বাচন করুন:' : 'Select Payment Method:'}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {/* bKash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      paymentMethod === 'bkash'
                        ? 'bg-pink-50/80 border-[#D12053] text-[#D12053] ring-2 ring-pink-300 font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#D12053] text-white flex items-center justify-center font-black text-xs mb-1">
                      ব
                    </div>
                    <span className="text-xs font-bold">bKash</span>
                  </button>

                  {/* Nagad */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      paymentMethod === 'nagad'
                        ? 'bg-orange-50/80 border-[#F7931E] text-[#F7931E] ring-2 ring-orange-300 font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F7931E] text-white flex items-center justify-center font-black text-xs mb-1">
                      ন
                    </div>
                    <span className="text-xs font-bold">Nagad</span>
                  </button>

                  {/* Rocket */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('rocket')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      paymentMethod === 'rocket'
                        ? 'bg-purple-50/80 border-[#8C3494] text-[#8C3494] ring-2 ring-purple-300 font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#8C3494] text-white flex items-center justify-center font-black text-xs mb-1">
                      র
                    </div>
                    <span className="text-xs font-bold">Rocket</span>
                  </button>

                  {/* Credit / Debit Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      paymentMethod === 'card'
                        ? 'bg-blue-50/80 border-blue-600 text-blue-700 ring-2 ring-blue-300 font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-1">
                      <CreditCard size={16} />
                    </div>
                    <span className="text-xs font-bold">{isBn ? 'কার্ড' : 'Card'}</span>
                  </button>
                </div>
              </div>

              {/* Mobile Banking Instructions & Inputs (bKash / Nagad / Rocket) */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') && (
                <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-slate-800">
                      {paymentMethod === 'bkash' ? 'bKash Merchant / Personal No:' : paymentMethod === 'nagad' ? 'Nagad Account No:' : 'Rocket Account No:'}
                    </span>
                    <span className="font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded self-start sm:self-auto">
                      {paymentMethod === 'bkash' 
                        ? (paymentConfig.bkashNumber || '01712-345678')
                        : paymentMethod === 'nagad'
                        ? (paymentConfig.nagadNumber || '01812-345678')
                        : (paymentConfig.rocketNumber || '01912-345678-9')}
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                    {isBn 
                      ? `অনুগ্রহ করে উপরের নম্বরে ৳${doctor.consultationFee} ফি 'Send Money' বা 'Payment' করুন এবং আপনার প্রেরক নম্বর ও TrxID নিচে লিখুন:`
                      : `Please send ৳${doctor.consultationFee} to the number above and enter your Sender Phone & TrxID below:`}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isBn ? 'আপনার প্রেরক নম্বর (Sender Phone) *' : 'Sender Phone Number *'}
                      </label>
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={e => setSenderPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        maxLength={11}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-sky-600 outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {isBn ? 'ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value.toUpperCase())}
                        placeholder="e.g. 9B87F2K3"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-sky-600 outline-none bg-white uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{isBn ? 'কার্ডের তথ্য দিন (Visa / Mastercard)' : 'Debit / Credit Card Details'}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">256-Bit SSL Encrypted</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{isBn ? 'কার্ডধারীর নাম' : 'Cardholder Name'}</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value)}
                      placeholder="e.g. MD KARIM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-600 outline-none bg-white uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">{isBn ? 'কার্ড নম্বর' : 'Card Number'}</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4123 4567 8901 2345"
                        maxLength={19}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-sky-600 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">MM/YY &bull; CVV</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          maxLength={5}
                          className="w-1/2 px-2 py-2 rounded-xl border border-slate-200 text-xs font-mono text-center focus:ring-2 focus:ring-sky-600 outline-none bg-white"
                        />
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          placeholder="CVV"
                          maxLength={4}
                          className="w-1/2 px-2 py-2 rounded-xl border border-slate-200 text-xs font-mono text-center focus:ring-2 focus:ring-sky-600 outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer shrink-0"
                >
                  {isBn ? 'পূর্ববর্তী' : 'Back'}
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmAppointment}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-emerald-200 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>{isBn ? 'প্রসেসিং...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} className="shrink-0" />
                      <span className="sm:hidden">{isBn ? `পেমেন্ট সম্পন্ন (৳${doctor.consultationFee})` : `Pay (৳${doctor.consultationFee})`}</span>
                      <span className="hidden sm:inline">{isBn ? `পেমেন্ট ও বুকিং কনফার্ম (৳${doctor.consultationFee})` : `Confirm & Pay ৳${doctor.consultationFee}`}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION & DIRECT INSTANT VIDEO CONNECT */}
          {step === 4 && completedAppointment && (
            <div className="text-center py-4 space-y-5 sm:space-y-6 animate-fadeIn">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
                <CheckCircle2 size={32} className="sm:size-[36px]" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">
                  {isBn ? 'ডাক্তার অ্যাপয়েন্টমেন্ট কনফার্মড!' : 'Appointment Confirmed!'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn 
                    ? 'আপনার ৩০ মিনিটের ভিডিও কনসালটেন্সি স্লট বুকিং ও পেমেন্ট সফল হয়েছে।' 
                    : 'Your 30-minute virtual consultation slot and fee payment are confirmed.'}
                </p>
              </div>

              {/* Instant Join Video Call Button */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-emerald-600/20 space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-100">
                  <Sparkles size={15} className="animate-pulse" />
                  <span>{isBn ? 'লাইভ এইচডি ভিডিও কনসালটেন্সি' : 'Live HD Video Consultation'}</span>
                </div>
                
                <h4 className="text-base sm:text-lg font-bold">
                  {isBn ? 'এখনই চিকিৎসকের সাথে ভিডিও কলে যুক্ত হোন' : 'Join Video Call with Doctor Now'}
                </h4>
                
                <p className="text-xs text-white/80 max-w-md mx-auto">
                  {isBn 
                    ? 'ডাক্তার ও রোগী উভয়েই নিচের বাটনে ক্লিক করে সরাসরি ভিডিও পরামর্শ কক্ষে যুক্ত হতে পারবেন।' 
                    : 'Both Doctor & Patient can join this private video room instantly.'}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartVideoCall?.(completedAppointment);
                    }}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Video size={18} className="text-emerald-600 shrink-0" />
                    <span>{isBn ? 'ভিডিও কল শুরু করুন' : 'Start Video Consultation'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyMeetingLink(completedAppointment.videoRoomId || completedAppointment.id)}
                    className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                    <span>{copiedLink ? (isBn ? 'লিঙ্ক কপি হয়েছে' : 'Link Copied') : (isBn ? 'রুম লিঙ্ক কপি করুন' : 'Copy Room Link')}</span>
                  </button>
                </div>
              </div>

              {/* Appointment Receipt Details */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">{isBn ? 'অ্যাপয়েন্টমেন্ট আইডি:' : 'Appointment ID:'}</span>
                  <span className="font-mono font-bold text-sky-700">{completedAppointment.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">{isBn ? 'চিকিৎসক:' : 'Doctor:'}</span>
                  <span className="font-bold text-slate-800">{completedAppointment.doctorName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">{isBn ? 'রোগীর নাম:' : 'Patient Name:'}</span>
                  <span className="font-semibold text-slate-800">{completedAppointment.patientName} ({completedAppointment.patientAge} Y)</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between border-b border-slate-200/80 pb-2 gap-0.5">
                  <span className="text-slate-500">{isBn ? 'তারিখ ও সময়সূচি:' : 'Date & Slot:'}</span>
                  <span className="font-semibold text-slate-800">{completedAppointment.appointmentDate} &bull; {completedAppointment.appointmentTimeSlot}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">{isBn ? 'পরিশোধিত ফি:' : 'Paid Fee:'}</span>
                  <span className="font-black text-emerald-700">৳ {completedAppointment.doctorFee} ({completedAppointment.paymentMethod.toUpperCase()})</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {isBn ? 'উইন্ডো বন্ধ করুন' : 'Close Window'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
