import React, { useState, useEffect, useRef } from 'react';
import { NursingCareService, Language } from '../types';
import { 
  HeartPulse, 
  Stethoscope, 
  Activity, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  Home, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  X, 
  MessageSquare,
  Sparkles,
  Award,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  Phone
} from 'lucide-react';
import { Button } from './Button';

interface NursingCareSectionProps {
  services?: NursingCareService[];
  lang: Language;
  badge?: string;
  title?: string;
  description?: string;
  hotline?: string;
  whatsapp?: string;
}

export const NursingCareSection: React.FC<NursingCareSectionProps> = ({
  services = [],
  lang,
  badge,
  title,
  hotline = '09612-000000',
  whatsapp = '01700000000'
}) => {
  const [bookingService, setBookingService] = useState<NursingCareService | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Modal form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [preferredShift, setPreferredShift] = useState('12_day');
  const [patientNotes, setPatientNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeServices = services.filter(s => s.isActive !== false);

  // Auto-scroll logic for single line horizontal carousel
  useEffect(() => {
    if (activeServices.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        // If reached end, smoothly reset to beginning
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one card width (~340px)
          scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [activeServices.length, isPaused]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'UserCheck': return <UserCheck className="w-4 h-4" />;
      case 'Clock': return <Clock className="w-4 h-4" />;
      case 'Home': return <Home className="w-4 h-4" />;
      case 'HeartPulse':
      default:
        return <HeartPulse className="w-4 h-4" />;
    }
  };

  const handleOpenBooking = (service: NursingCareService) => {
    setBookingService(service);
    setBookingSuccess(false);
  };

  const handleCloseBooking = () => {
    setBookingService(null);
    setBookingSuccess(false);
    setPatientName('');
    setPatientPhone('');
    setPatientAddress('');
    setPatientNotes('');
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !patientAddress.trim()) {
      alert(lang === 'bn' ? 'দয়া করে আপনার নাম, মোবাইল নম্বর এবং ঠিকানা লিখুন।' : 'Please fill in your name, phone number, and address.');
      return;
    }

    setBookingSubmitting(true);
    setTimeout(() => {
      setBookingSubmitting(false);
      setBookingSuccess(true);
    }, 600);
  };

  const handleWhatsAppChat = (service?: NursingCareService) => {
    const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
    const text = service 
      ? encodeURIComponent(
          lang === 'bn'
            ? `হ্যালো LabHome BD, আমি "${service.title}" নার্সিং সেবাটি সম্পর্কে বিস্তারিত জানতে এবং বুক করতে চাই।`
            : `Hello LabHome BD, I would like to inquire about and book "${service.title}" nursing service.`
        )
      : encodeURIComponent(
          lang === 'bn'
            ? 'হ্যালো LabHome BD, আমি বাসায় হোম নার্সিং ও কেয়ারগিভার সার্ভিস সম্পর্কে জানতে চাই।'
            : 'Hello LabHome BD, I would like to know about your Home Nursing & Caregiver services.'
        );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  if (activeServices.length === 0) {
    return null;
  }

  return (
    <section 
      id="nursing-care" 
      className="py-12 lg:py-16 bg-gradient-to-b from-slate-50 via-sky-50/30 to-white relative overflow-hidden border-b border-slate-200"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Flex Layout: Left Title & Right Auto-scrolling Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* LEFT SIDE: Title & Controls (As requested: Professional Nursing & Home Care Services বাম পাশে থাকবে) */}
          <div className="lg:col-span-4 xl:col-span-3.5 space-y-4">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-wider border border-rose-200/80 shadow-2xs">
              <Sparkles size={13} className="text-rose-500 animate-pulse" />
              <span>
                {badge || (lang === 'bn' ? 'হোম নার্সিং ও কেয়ার' : 'Home Nursing & Care')}
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {title || (lang === 'bn' ? 'প্রফেশনাল নার্সিং ও হোম কেয়ার সার্ভিস' : 'Professional Nursing & Home Care Services')}
            </h2>

            {/* Shift Highlights & 24/7 Assurance */}
            <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>{lang === 'bn' ? '১২ ও ২৪ ঘণ্টার শিফটে রেজিস্টার্ড নার্স' : '12 & 24 Hrs Certified Shift Nurses'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>{lang === 'bn' ? 'ইনজেকশন, ক্যানুলা ও স্যালাইন পুশ' : 'Injections, Cannula & Saline Support'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span>{lang === 'bn' ? 'বয়স্ক ও প্যারালাইজড পেশেন্ট কেয়ার' : 'Elderly & Stroke Patient Care'}</span>
              </div>
            </div>

            {/* Carousel Controls (Prev / Next & Pause / Play) */}
            <div className="pt-3 flex items-center gap-2.5">
              <button
                onClick={() => handleManualScroll('left')}
                aria-label="Previous service"
                className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary hover:bg-sky-50 flex items-center justify-center shadow-xs transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => handleManualScroll('right')}
                aria-label="Next service"
                className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary hover:bg-sky-50 flex items-center justify-center shadow-xs transition-all cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
              
              <button
                onClick={() => setIsPaused(prev => !prev)}
                title={isPaused ? "Resume Auto Scroll" : "Pause Auto Scroll"}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isPaused 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isPaused ? <Play size={12} className="fill-amber-700" /> : <Pause size={12} />}
                <span>{isPaused ? (lang === 'bn' ? 'চালু করুন' : 'Resume') : (lang === 'bn' ? 'অটো-স্ক্রোল' : 'Auto Scroll')}</span>
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Single Row Auto-Scrolling Services Track (সব সেবা একই লাইনে থাকবে কিন্তু auto scolling হবে) */}
          <div 
            className="lg:col-span-8 xl:col-span-8.5 relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Scroll Container */}
            <div 
              ref={scrollContainerRef}
              className="flex flex-row flex-nowrap gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {activeServices.map((service) => (
                <div 
                  key={service.id}
                  style={{ scrollSnapAlign: 'start' }}
                  className="w-[290px] sm:w-[320px] md:w-[330px] shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Card Image Banner */}
                  <div className="relative h-40 w-full bg-slate-100 overflow-hidden shrink-0">
                    <img 
                      src={service.imageUrl || "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800"} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                    
                    {/* Badge top left */}
                    {service.badge && (
                      <div className="absolute top-2.5 left-2.5 bg-rose-600/95 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Award size={11} />
                        <span>{service.badge}</span>
                      </div>
                    )}

                    {/* Category top right */}
                    {service.category && (
                      <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {service.category}
                      </div>
                    )}

                    {/* Price & Duration Bottom Tag */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
                      <div className="flex items-center gap-1.5 font-black text-sm drop-shadow-md">
                        <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                          {renderIcon(service.icon)}
                        </div>
                        <span>
                          {typeof service.price === 'number' 
                            ? (lang === 'bn' ? `৳${service.price.toLocaleString('bn-BD')}` : `৳${service.price.toLocaleString('en-US')}`)
                            : (service.price || '')}
                        </span>
                      </div>
                      {service.duration && (
                        <span className="text-[10px] font-semibold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20">
                          {service.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
                        {service.description}
                      </p>

                      {/* Key Features List */}
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-1.5 mb-4 pt-2.5 border-t border-slate-100">
                          {service.features.slice(0, 3).map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2 border-t border-slate-50">
                      <Button 
                        onClick={() => handleOpenBooking(service)}
                        className="flex-1 py-2 text-xs font-bold shadow-2xs flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        <span>{lang === 'bn' ? 'নার্স বুক করুন' : 'Book Nursing'}</span>
                        <ChevronRight size={13} />
                      </Button>

                      <button
                        onClick={() => handleWhatsAppChat(service)}
                        title="Chat on WhatsApp"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer shrink-0"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {bookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-rose-50/80 via-sky-50/50 to-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {lang === 'bn' ? 'নার্সিং সেবা বুকিং' : 'Nursing Care Booking'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {bookingService.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCloseBooking}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {bookingSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-900">
                    {lang === 'bn' ? 'বুকিং অনুরোধ সফল হয়েছে!' : 'Booking Request Submitted!'}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    {lang === 'bn'
                      ? 'আমাদের নার্সিং কো-অর্ডিনেটর খুব শীঘ্রই আপনার সাথে যোগাযোগ করে শিফট ও নার্স কনফার্ম করবেন।'
                      : 'Our clinical nursing coordinator will call you shortly to confirm shift schedule and nurse assignment.'}
                  </p>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{lang === 'bn' ? 'সেবা:' : 'Service:'}</span>
                      <span className="font-bold text-slate-800">{bookingService.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{lang === 'bn' ? 'তারিখ:' : 'Date:'}</span>
                      <span className="font-bold text-slate-800">{preferredDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{lang === 'bn' ? 'ফি:' : 'Estimated Fee:'}</span>
                      <span className="font-bold text-rose-600">
                        {typeof bookingService.price === 'number' ? `৳${bookingService.price}` : bookingService.price}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleCloseBooking} className="w-full sm:w-auto">
                      {lang === 'bn' ? 'ঠিক আছে' : 'Done'}
                    </Button>
                    <button
                      onClick={() => handleWhatsAppChat(bookingService)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <MessageSquare size={16} />
                      <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে নিশ্চিত করুন' : 'Confirm on WhatsApp'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  {/* Selected service summary pill */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Selected Service</span>
                      <h4 className="text-sm font-bold text-slate-800">{bookingService.title}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-rose-600">
                        {typeof bookingService.price === 'number' ? `৳${bookingService.price}` : bookingService.price}
                      </span>
                      {bookingService.duration && (
                        <p className="text-[10px] text-slate-400">{bookingService.duration}</p>
                      )}
                    </div>
                  </div>

                  {/* Patient Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <User size={14} className="text-slate-400" />
                      <span>{lang === 'bn' ? 'রোগী / অভিভাবকের নাম *' : 'Patient / Guardian Name *'}</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ রহিম' : 'e.g. John Doe'}
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                    />
                  </div>

                  {/* Patient Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone size={14} className="text-slate-400" />
                      <span>{lang === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}</span>
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder={lang === 'bn' ? '০১৭XXXXXXXX' : '017XXXXXXXX'}
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                    />
                  </div>

                  {/* Shift Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{lang === 'bn' ? 'শুরুর তারিখ *' : 'Start Date *'}</span>
                      </label>
                      <input 
                        type="date" 
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span>{lang === 'bn' ? 'শিফট নির্বাচন' : 'Preferred Shift'}</span>
                      </label>
                      <select
                        value={preferredShift}
                        onChange={(e) => setPreferredShift(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all bg-white"
                      >
                        <option value="12_day">{lang === 'bn' ? '১২ ঘণ্টা (দিন)' : '12 Hours (Day)'}</option>
                        <option value="12_night">{lang === 'bn' ? '১২ ঘণ্টা (রাত)' : '12 Hours (Night)'}</option>
                        <option value="24_hours">{lang === 'bn' ? '২৪ ঘণ্টা (সার্বক্ষণিক)' : '24 Hours (Full-time)'}</option>
                        <option value="per_visit">{lang === 'bn' ? 'শর্ট ভিজিট (ইনজেকশন/ড্রেসিং)' : 'Per Visit (Procedure)'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{lang === 'bn' ? 'বাসার পূর্ণ ঠিকানা (ঢাকা ও আশেপাশের এলাকা) *' : 'Home Address (Dhaka & Surrounding) *'}</span>
                    </label>
                    <textarea 
                      rows={2}
                      required
                      placeholder={lang === 'bn' ? 'বাড়ি নম্বর, রোড, এলাকা, থানা...' : 'House, Road, Area, Landmark...'}
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Notes / Clinical condition */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'bn' ? 'রোগীর বিশেষ অবস্থা বা নির্দেশনা (ঐচ্ছিক)' : 'Patient Condition / Special Notes (Optional)'}
                    </label>
                    <input 
                      type="text"
                      placeholder={lang === 'bn' ? 'যেমন: ট্র্যাকিওস্টমি, স্ট্রোক পেশেন্ট, ক্যাথেটার...' : 'e.g. Stroke patient, Tracheostomy, Oxygen...'}
                      value={patientNotes}
                      onChange={(e) => setPatientNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={bookingSubmitting}
                      className="w-full py-3 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center justify-center gap-2"
                    >
                      {bookingSubmitting ? (
                        <span>{lang === 'bn' ? 'বুকিং সাবমিট হচ্ছে...' : 'Submitting...'}</span>
                      ) : (
                        <>
                          <HeartPulse size={16} />
                          <span>{lang === 'bn' ? 'বুকিং নিশ্চিত করতে রিকোয়েস্ট পাঠান' : 'Submit Nursing Request'}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
