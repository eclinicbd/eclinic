import React, { useState } from 'react';
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
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  PhoneCall, 
  FileText, 
  UserCheck, 
  Filter, 
  ArrowUpDown, 
  ArrowLeft,
  Zap,
  Phone,
  Check
} from 'lucide-react';
import { Button } from './Button';

interface DoctorsViewProps {
  doctors: Doctor[];
  lang: Language;
  onBookDoctor: (doctor: Doctor) => void;
  onQuickVideoCall: (doctor: Doctor) => void;
  onBackToHome: () => void;
  emergencyHotline?: string;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  doctors,
  lang,
  onBookDoctor,
  onQuickVideoCall,
  onBackToHome,
  emergencyHotline = '09612-000000'
}) => {
  const isBn = lang === 'bn';
  const toBnNumber = (n: number | string): string => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).replace(/[0-9]/g, d => bnDigits[Number(d)]);
  };
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recommended' | 'fee_asc' | 'fee_desc' | 'rating' | 'experience'>('recommended');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

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

  const filteredDoctors = activeDoctors
    .filter(doctor => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !query ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.department.toLowerCase().includes(query) ||
        doctor.hospital.toLowerCase().includes(query) ||
        doctor.degrees.toLowerCase().includes(query) ||
        (doctor.bmdcRegNo && doctor.bmdcRegNo.toLowerCase().includes(query));

      const matchDept = selectedDept === 'all' || doctor.department === selectedDept;
      const matchGender = genderFilter === 'all' || doctor.gender === genderFilter;

      // On mobile view, show all active doctors filtered purely by doctor search
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      return matchSearch && (isMobile ? true : (matchDept && matchGender));
    })
    .sort((a, b) => {
      if (sortBy === 'fee_asc') return a.consultationFee - b.consultationFee;
      if (sortBy === 'fee_desc') return b.consultationFee - a.consultationFee;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'experience') return (Number(b.experienceYears) || 0) - (Number(a.experienceYears) || 0);
      return (b.orderCount || 0) - (a.orderCount || 0);
    });

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-8 pb-24 md:pb-12 px-3 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Mobile View: ONLY Doctor Search bar & Back to Home */}
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToHome}
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-sky-600 shadow-2xs active:scale-95 transition-all cursor-pointer"
              aria-label={isBn ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
            >
              <ArrowLeft size={18} />
            </button>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'ডাক্তারের নাম বা স্পেশালিটি খুঁজুন...' : 'Search doctor or specialty...'}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm font-medium shadow-2xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Breadcrumb & Emergency Banner - Hidden on Mobile */}
        <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs self-start cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>{isBn ? 'হোমপেজে ফিরে যান' : 'Back to Home'}</span>
          </button>

          {emergencyHotline && (
            <a
              href={`tel:${emergencyHotline}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-2xs self-start sm:self-auto"
            >
              <Phone size={14} className="text-emerald-600 animate-bounce" />
              <span>{isBn ? `জরুরি ডক্টর হেল্পলাইন: ${emergencyHotline}` : `Doctor Helpline: ${emergencyHotline}`}</span>
            </a>
          )}
        </div>

        {/* Desktop Page Header - Hidden on Mobile */}
        <div className="hidden md:block bg-gradient-to-r from-sky-800 via-sky-700 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-bold uppercase tracking-wider border border-sky-300/30">
              <Stethoscope size={14} />
              <span>{isBn ? 'দেশসেরা বিশেষজ্ঞ চিকিৎসকদের তালিকা' : 'Top Verified Specialists'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              {isBn ? 'অনলাইন ডাক্তার কন্সালটেন্সি ও ভিডিও চ্যাট' : 'Online Doctor Consultation & Video Chat'}
            </h1>

            <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
              {isBn 
                ? 'ঘরে বসেই ৩০ মিনিট পর পর সুবিধাজনক সময়ে বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন, এইচডি ভিডিও কলে যুক্ত হোন এবং ডিজিটাল ই-প্রেসক্রিপশন গ্রহণ করুন।' 
                : 'Book virtual appointments at 30-minute intervals, consult with top BMDC-registered specialist doctors over HD video calls, and get instant digital e-prescriptions.'}
            </p>

            {/* Desktop Search Bar */}
            <div className="pt-2">
              <div className="relative max-w-xl">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isBn ? 'ডাক্তারের নাম, বিশেষজ্ঞ বিভাগ, হাসপাতাল বা ডিগ্রি দিয়ে খুঁজুন...' : 'Search by doctor name, specialty, hospital or degree...'}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 text-sm font-medium shadow-lg focus:ring-4 focus:ring-sky-400 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Department Filter Tabs - Hidden on Mobile */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {departments.map(dept => {
            const isSelected = selectedDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-200 ring-2 ring-sky-300'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {isBn ? dept.nameBn : dept.nameEn}
              </button>
            );
          })}
        </div>

        {/* Desktop Filters and Sorting Bar - Hidden on Mobile */}
        <div className="hidden md:flex bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-900">{filteredDoctors.length}</span>
            <span>{isBn ? 'জন চিকিৎসক পাওয়া গেছে' : 'Specialist Doctors available'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Gender Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setGenderFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  genderFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {isBn ? 'সকল' : 'All'}
              </button>
              <button
                onClick={() => setGenderFilter('male')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  genderFilter === 'male' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {isBn ? 'পুরুষ' : 'Male'}
              </button>
              <button
                onClick={() => setGenderFilter('female')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                  genderFilter === 'female' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                {isBn ? 'মহিলা' : 'Female'}
              </button>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="recommended">{isBn ? 'জনপ্রিয়তা অনুযায়ী' : 'Recommended'}</option>
                <option value="fee_asc">{isBn ? 'ফি: কম থেকে বেশি' : 'Fee: Low to High'}</option>
                <option value="fee_desc">{isBn ? 'ফি: বেশি থেকে কম' : 'Fee: High to Low'}</option>
                <option value="rating">{isBn ? 'রেটিং অনুযায়ী' : 'Highest Rated'}</option>
                <option value="experience">{isBn ? 'অভিজ্ঞতা অনুযায়ী' : 'Most Experienced'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <Stethoscope className="w-16 h-16 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              {isBn ? 'কোনো ডাক্তার পাওয়া যায়নি' : 'No doctors found matching your criteria'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {isBn ? 'অন্য কোনো বিভাগ নির্বাচন করুন বা সার্চ কীওয়ার্ড পরিবর্তন করে আবার চেষ্টা করুন।' : 'Try selecting a different specialty department or clearing your search filter.'}
            </p>
            <Button
              onClick={() => {
                setSelectedDept('all');
                setSearchQuery('');
                setGenderFilter('all');
              }}
              variant="outline"
              className="text-xs"
            >
              {isBn ? 'সকল ফিল্টার রিসেট করুন' : 'Reset All Filters'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => {
              const consultCount = doctor.orderCount !== undefined ? doctor.orderCount : (doctor.totalConsultations || 0);

              return (
                <div 
                  key={doctor.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Doctor Top Header Card */}
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <img 
                            src={doctor.image} 
                            alt={doctor.name}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-103 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                            }}
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Online Telemedicine Available" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                              {doctor.department}
                            </span>
                            {doctor.bmdcRegNo && (
                              <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                BMDC: {doctor.bmdcRegNo}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition-colors line-clamp-1">
                            {doctor.name}
                          </h3>
                          <p className="text-xs text-sky-600 font-semibold line-clamp-1 mt-0.5">
                            {doctor.specialty}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                            <Building2 size={12} className="shrink-0 text-slate-400" />
                            <span>{doctor.hospital}</span>
                          </p>
                        </div>
                      </div>

                      {/* Degrees / Qualifications */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100">
                        <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed">
                          🎓 {doctor.degrees}
                        </p>
                      </div>
                    </div>

                    {/* Stats & Schedule Pills */}
                    <div className="px-6 py-4 space-y-3 bg-white">
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">{isBn ? 'অভিজ্ঞতা' : 'Experience'}</span>
                          <span className="font-bold text-slate-800">{doctor.experienceYears} {isBn ? 'বছর' : 'Yrs'}</span>
                        </div>
                        <div className="border-x border-slate-200/80">
                          <span className="text-slate-400 block text-[10px]">{isBn ? 'রেটিং' : 'Rating'}</span>
                          <span className="font-bold text-amber-600 flex items-center justify-center gap-0.5">
                            <Star size={11} className="fill-current text-amber-500" />
                            <span>{doctor.rating}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">{isBn ? 'কন্সালটেন্সি' : 'Consults'}</span>
                          <span className="font-bold text-sky-700">{consultCount}+</span>
                        </div>
                      </div>

                      {/* 30-min Availability Slot Info */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                        <Clock size={14} className="text-sky-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-sky-900 block">{isBn ? '৩০ মিনিট সময়সূচি:' : '30-Min Schedule:'}</span>
                          <span className="text-[11px] text-slate-700 font-medium truncate block">{doctor.availableTimeText || (isBn ? 'প্রতিদিন সন্ধ্যা ৬:০০ - রাত ৯:০০' : 'Daily 6:00 PM - 9:00 PM')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Booking Buttons */}
                  <div className="p-6 pt-0 bg-white">
                    <div className="flex items-baseline justify-between mb-4 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {isBn ? 'ভিডিও কন্সালটেন্সি ফি' : 'Consultation Fee'}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">৳ {doctor.consultationFee}</span>
                          {doctor.originalFee && doctor.originalFee > doctor.consultationFee && (
                            <span className="text-xs text-slate-400 line-through">৳ {doctor.originalFee}</span>
                          )}
                        </div>
                      </div>

                      {doctor.discountPercent && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          {doctor.discountPercent}% {isBn ? 'ছাড়' : 'Off'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onQuickVideoCall(doctor)}
                        className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer"
                      >
                        <Video size={14} className="text-emerald-600" />
                        <span>{isBn ? 'ভিডিও কল' : 'Video Call'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onBookDoctor(doctor)}
                        className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-200 transition-all hover:scale-102 cursor-pointer"
                      >
                        <Calendar size={14} />
                        <span>{isBn ? 'স্লট বুক করুন' : 'Book 30-Min'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
