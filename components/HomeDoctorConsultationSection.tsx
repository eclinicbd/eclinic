import React, { useState, useEffect, useRef } from 'react';
import { Doctor, Language } from '../types';
import { 
  Stethoscope, 
  Video, 
  Clock, 
  Calendar, 
  Star, 
  Award, 
  Building2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  PhoneCall, 
  FileText, 
  UserCheck, 
  Play, 
  Pause,
  Filter,
  ArrowRight,
  Zap,
  Activity
} from 'lucide-react';

interface HomeDoctorConsultationSectionProps {
  lang: Language;
  doctors: Doctor[];
  badge?: string;
  title?: string;
  description?: string;
  btnText?: string;
  emergencyHotline?: string;
  onBookDoctor: (doctor: Doctor) => void;
  onQuickVideoCall: (doctor: Doctor) => void;
  onViewDoctorProfile?: (doctor: Doctor) => void;
  onViewAllDoctors?: () => void;
}

export const HomeDoctorConsultationSection: React.FC<HomeDoctorConsultationSectionProps> = ({
  lang,
  doctors,
  badge,
  title,
  description,
  btnText,
  emergencyHotline = '09612-000000',
  onBookDoctor,
  onQuickVideoCall,
  onViewDoctorProfile,
  onViewAllDoctors
}) => {
  const isBn = lang === 'bn';
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Departments list
  const departments = [
    { id: 'all', nameBn: 'সকল বিশেষজ্ঞ', nameEn: 'All Specialists' },
    { id: 'Medicine', nameBn: 'মেডিসিন ও ডায়াবেটিস', nameEn: 'Medicine & Diabetes' },
    { id: 'Gynecology', nameBn: 'গাইনী ও প্রসূতিবিদ্যা', nameEn: 'Gynecology & Maternity' },
    { id: 'Cardiology', nameBn: 'কার্ডিওলজি ও হৃদরোগ', nameEn: 'Cardiology & Heart' },
    { id: 'Pediatrics', nameBn: 'শিশু ও কিশোর রোগ', nameEn: 'Pediatrics & Child Health' },
    { id: 'Dermatology', nameBn: 'চর্ম ও যৌন রোগ', nameEn: 'Dermatology & Skin' },
    { id: 'General Physician', nameBn: 'জেনারেল ফিজিশিয়ান', nameEn: 'General Physician' },
    { id: 'Neurology', nameBn: 'নিউরোলজি ও ব্রেইন', nameEn: 'Neurology & Brain' }
  ];

  // Filter active doctors
  const activeDoctors = doctors.filter(d => d.isActive !== false);

  const filteredDoctors = activeDoctors.filter(doctor => {
    const matchDept = selectedDept === 'all' || doctor.department === selectedDept;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchDept;

    const matchSearch = 
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialty.toLowerCase().includes(query) ||
      doctor.hospital.toLowerCase().includes(query) ||
      doctor.degrees.toLowerCase().includes(query) ||
      (doctor.bmdcRegNo && doctor.bmdcRegNo.toLowerCase().includes(query));

    return matchDept && matchSearch;
  });

  // Auto-scrolling ticker effect for doctor cards
  useEffect(() => {
    if (!isAutoScrolling) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: 340, behavior: 'smooth' });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoScrolling, filteredDoctors.length]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  return (
    <section id="doctors-consultation" className="py-20 bg-gradient-to-b from-sky-50/50 via-white to-slate-50 border-t border-sky-100/70 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs animate-pulse">
            <Stethoscope size={14} className="text-emerald-600" />
            <span>{badge || (isBn ? '👨‍⚕️ অনলাইন ডাক্তার কন্সালটেন্সি ও ভিডিও চ্যাট' : '👨‍⚕️ Online Doctor Consultation & Video Chat')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {title || (isBn ? 'দেশসেরা বিশেষজ্ঞ চিকিৎসকের অনলাইন কন্সালটেন্সি' : 'Consult Top Specialist Doctors Online')}
          </h2>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            {description || (isBn 
              ? 'ঘরে বসেই ৩০ মিনিট পর পর নির্ধারিত স্লটে বিশ্বস্ত ডাক্তার বুকিং, এইচডি ভিডিও চ্যাটিং, ইনস্ট্যান্ট ফি পেমেন্ট ও ভেরিফাইড ডিজিটাল ই-প্রেসক্রিপশন সেবা।' 
              : 'Book top verified doctors at 30-minute time slots, join HD video consultations, pay consultation fees securely and receive digital e-prescriptions with advised lab tests.')}
          </p>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10">
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{isBn ? '৩০ মিনিট স্লট' : '30-Min Time Slots'}</p>
              <p className="text-[11px] text-slate-500">{isBn ? 'নির্ধারিত সময়ে কল' : 'Scheduled punctual care'}</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Video size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{isBn ? 'এইচডি ভিডিও কনসালটেন্সি' : 'HD Video Consulting'}</p>
              <p className="text-[11px] text-slate-500">{isBn ? 'লাইভ চ্যাট ও শেয়ার' : 'Real-time room & chat'}</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{isBn ? 'ডিজিটাল ই-প্রেসক্রিপশন' : 'Digital E-Prescription'}</p>
              <p className="text-[11px] text-slate-500">{isBn ? 'প্রেসক্রাইবড টেস্ট অর্ডার' : 'Direct lab test advice'}</p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{isBn ? 'BMDC রেজিস্টার্ড' : 'BMDC Verified'}</p>
              <p className="text-[11px] text-slate-500">{isBn ? '১০০% ভেরিফাইড ডাক্তার' : 'Certified specialists'}</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-8 space-y-4">
          {/* Department Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1 pl-1">
              <Filter size={12} />
              {isBn ? 'বিভাগ:' : 'Dept:'}
            </span>
            {departments.map(dept => {
              const isActive = selectedDept === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isBn ? dept.nameBn : dept.nameEn}
                </button>
              );
            })}
          </div>

          {/* Search bar & Auto-scroll control */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'ডাক্তারের নাম, হাসপাতাল বা রোগ লিখে খুঁজুন...' : 'Search doctor name, hospital or symptom...'}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Navigation & Auto-scroll controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                  isAutoScrolling 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
                title={isAutoScrolling ? 'পজ করুন (Pause Auto Scroll)' : 'অটো স্ক্রল চালু করুন (Start Auto Scroll)'}
              >
                {isAutoScrolling ? <Pause size={12} /> : <Play size={12} />}
                <span>{isBn ? (isAutoScrolling ? 'অটো স্ক্রল চলছে' : 'অটো স্ক্রল বন্ধ') : (isAutoScrolling ? 'Auto-Scrolling' : 'Auto-Scroll Paused')}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleScrollLeft}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleScrollRight}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Auto-scrolling Carousel Container */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {isBn ? 'কোনো ডাক্তার পাওয়া যায়নি' : 'No doctors found'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isBn ? 'ভিন্ন ফিল্টার বা কিওয়ার্ড দিয়ে আবার চেষ্টা করুন।' : 'Try searching with different keywords or department filters.'}
            </p>
            <button
              onClick={() => { setSelectedDept('all'); setSearchQuery(''); }}
              className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700"
            >
              {isBn ? 'সব ডাক্তার দেখুন' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
            className="flex items-stretch gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x scrollbar-thin scrollbar-thumb-sky-200 hover:scrollbar-thumb-sky-400"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {filteredDoctors.map(doctor => {
              const hasDiscount = doctor.originalFee && doctor.originalFee > doctor.consultationFee;
              const discount = doctor.discountPercent || (hasDiscount ? Math.round(((doctor.originalFee! - doctor.consultationFee) / doctor.originalFee!) * 100) : 0);

              return (
                <div
                  key={doctor.id}
                  className="w-[320px] sm:w-[350px] shrink-0 bg-white rounded-2xl border border-slate-200/90 hover:border-sky-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group snap-start"
                >
                  {/* Card Top & Avatar Banner */}
                  <div className="p-5 pb-3 relative">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        {isBn ? 'অনলাইন চেম্বার' : 'Online Chamber'}
                      </span>

                      {doctor.bmdcRegNo && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200" title="BMDC Registration">
                          BMDC: {doctor.bmdcRegNo}
                        </span>
                      )}
                    </div>

                    {/* Doctor Header (Avatar + Details) */}
                    <div className="flex gap-4 items-start">
                      <div className="relative shrink-0">
                        <img 
                          src={doctor.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'} 
                          alt={doctor.name}
                          className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white" title="Online Verified">
                          <CheckCircle2 size={12} />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                          {doctor.name}
                        </h3>
                        <p className="text-xs font-semibold text-sky-700 line-clamp-1 mb-1">
                          {doctor.specialty}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight mb-2">
                          {doctor.degrees}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Building2 size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{doctor.hospital}</span>
                        </div>
                      </div>
                    </div>

                    {/* Experience, Ratings & Stats */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center bg-slate-50/80 rounded-xl p-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'অভিজ্ঞতা' : 'Exp.'}</span>
                        <span className="text-xs font-bold text-slate-800">
                          {doctor.experienceYears} {isBn ? 'বছর+' : 'Yrs+'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'রেটিং' : 'Rating'}</span>
                        <span className="text-xs font-bold text-amber-600 flex items-center justify-center gap-0.5">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          {doctor.rating}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isBn ? 'পরামর্শ' : 'Consults'}</span>
                        <span className="text-xs font-bold text-slate-800">
                          {doctor.orderCount !== undefined ? doctor.orderCount : (doctor.totalConsultations || 0)}+
                        </span>
                      </div>
                    </div>

                    {/* Timing & Slot info */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600 bg-sky-50/70 px-2.5 py-1.5 rounded-lg border border-sky-100">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock size={12} className="text-sky-600 shrink-0" />
                        <span className="truncate">{doctor.availableTimeText || (isBn ? 'প্রতিদিন সন্ধ্যা ৬:০০ - ৯:০০' : 'Daily 6:00 PM - 9:00 PM')}</span>
                      </div>
                      <span className="text-[10px] font-bold text-sky-700 bg-white px-1.5 py-0.5 rounded shrink-0 border border-sky-200">
                        {doctor.slotIntervalMinutes || 30}m {isBn ? 'স্লট' : 'slot'}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom / Pricing & Booking Actions */}
                  <div className="p-5 pt-3 bg-slate-50/70 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                          {isBn ? 'কন্সালটেন্সি ফি:' : 'Consultation Fee:'}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-extrabold text-slate-900">
                            ৳{doctor.consultationFee}
                          </span>
                          {doctor.originalFee && (
                            <span className="text-xs text-slate-400 line-through">
                              ৳{doctor.originalFee}
                            </span>
                          )}
                        </div>
                      </div>

                      {discount > 0 && (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          {discount}% {isBn ? 'ছাড়' : 'OFF'}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onBookDoctor(doctor)}
                        className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <Calendar size={14} />
                        <span>{isBn ? 'স্লট বুক করুন' : 'Book Slot'}</span>
                      </button>

                      <button
                        onClick={() => onQuickVideoCall(doctor)}
                        className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-300 hover:border-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Video size={14} className="text-emerald-600" />
                        <span>{isBn ? 'ভিডিও কল' : 'Video Call'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Doctor Consultation Emergency / Hotline Banner */}
        <div className="mt-12 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
              <Zap size={13} className="animate-bounce" />
              <span>{isBn ? 'জরুরি চিকিৎসা পরামর্শ ২৪/৭' : '24/7 Emergency Tele-Care'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              {isBn ? 'ডাক্তার অ্যাপয়েন্টমেন্ট বা ই-প্রেসক্রিপশনে তাৎক্ষণিক সহায়তা' : 'Instant Assistance for Doctor Appointments & E-Prescriptions'}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              {isBn 
                ? 'ভিডিও কনসালটেন্সি বা ল্যাব টেস্ট সংক্রান্ত যেকোনো প্রশ্নের জন্য সরাসরি যোগাযোগ করুন আমাদের মেডিক্যাল টিমের সাথে।' 
                : 'Connect directly with our 24/7 healthcare helpdesk for urgent doctor bookings, e-prescriptions, and home lab test coordination.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 z-10">
            <a
              href={`tel:${emergencyHotline}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              <PhoneCall size={18} />
              <span>{emergencyHotline}</span>
            </a>

            <button
              onClick={() => {
                if (onViewAllDoctors) {
                  onViewAllDoctors();
                } else if (filteredDoctors.length > 0) {
                  onBookDoctor(filteredDoctors[0]);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm backdrop-blur-sm transition-all cursor-pointer"
            >
              <span>{btnText || (isBn ? 'সকল ডাক্তার দেখুন' : 'Explore All Doctors')}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
