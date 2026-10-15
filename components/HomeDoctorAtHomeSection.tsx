import React, { useMemo } from 'react';
import { 
  Home, 
  Stethoscope, 
  HeartPulse, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Phone, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  User, 
  UserCheck,
  Zap, 
  Calendar 
} from 'lucide-react';
import { Language, DoctorAtHomeSpecialty } from '../types';
import { getStoredDoctorAtHomeSpecialties, getDoctorSpecialtyDefaultImage, MALE_DOCTOR_VECTOR_ICON } from '../services/dataStorage';

interface HomeDoctorAtHomeSectionProps {
  lang: Language;
  onOpenBookingModal: (specialtyId?: string) => void;
  badge?: string;
  title?: string;
  description?: string;
  hotline?: string;
  specialties?: DoctorAtHomeSpecialty[];
}

export const HomeDoctorAtHomeSection: React.FC<HomeDoctorAtHomeSectionProps> = ({
  lang,
  onOpenBookingModal,
  badge,
  title,
  description,
  hotline = '01700-000000',
  specialties
}) => {
  const activeSpecialties = useMemo(() => {
    const list = (specialties && specialties.length > 0)
      ? specialties
      : getStoredDoctorAtHomeSpecialties();
    return list.filter(s => s.isActive === true || (s.isActive !== false && (s.isActive as any) !== 'false'));
  }, [specialties]);

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Activity': return <Activity size={20} />;
      case 'HeartPulse': return <HeartPulse size={20} />;
      case 'User': return <User size={20} />;
      case 'UserCheck': return <UserCheck size={20} />;
      case 'ShieldCheck': return <ShieldCheck size={20} />;
      case 'Clock': return <Clock size={20} />;
      case 'Zap': return <Zap size={20} />;
      case 'Calendar': return <Calendar size={20} />;
      default: return <Stethoscope size={20} />;
    }
  };
  return (
    <section id="doctor-at-home" className="py-20 bg-gradient-to-b from-slate-50 via-teal-50/20 to-white relative overflow-hidden border-b border-slate-200/80">
      {/* Background ambient blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Home size={14} className="text-emerald-700" />
            <span>{badge || (lang === 'bn' ? '🚑 Doctor at Home সেবা' : '🚑 Doctor at Home Service')}</span>
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            {title || (lang === 'bn' 
              ? 'হাসপাতালে লাইন না ধরে ঘরে বসেই বিশেষজ্ঞ ডাক্তার দেখান' 
              : 'Consult Specialist Doctors Directly at Your Home')}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {description || (lang === 'bn' 
              ? 'প্রবীণ সদস্য, অসুস্থ শিশু কিংবা তীব্র শারীরিক জটিলতায় বিএমডিসি রেজিস্টার্ড অভিজ্ঞ চিকিৎসকরা সরাসরি আপনার বাড়ি বা অফিসে গিয়ে সম্পূর্ণ শারীরিক পরীক্ষা ও চিকিৎসা প্রদান করেন।' 
              : 'Certified BMDC registered doctors visit your residence for comprehensive physical checkups, vitals monitoring, and authorized medical prescriptions.')}
          </p>
        </div>

        {/* Doctor Specialties Cards Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {lang === 'bn' ? 'কি ধরনের ডাক্তার প্রয়োজন?' : 'Available Doctor Specialties'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {lang === 'bn' 
                  ? 'আপনার প্রয়োজন অনুযায়ী স্পেশালিটি নির্বাচন করে সহজেই বাসায় ডাক্তার কল করুন' 
                  : 'Select specialty according to patient condition and book home visit'}
              </p>
            </div>
            <button
              onClick={() => onOpenBookingModal()}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Home size={14} />
              <span>{lang === 'bn' ? 'সব ধরণের ডাক্তার' : 'All Doctors'}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSpecialties.map(spec => (
              <div 
                key={spec.id} 
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center font-bold shadow-2xs">
                      {renderIcon(spec.icon)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {spec.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/80">
                          {spec.badge}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200/80">
                        ৳ {spec.fee}
                      </span>
                    </div>
                  </div>

                  {/* Circular Male Doctor Vector Icon in the Middle */}
                  <div className="flex justify-center my-3">
                    <div className="relative group/avatar">
                      <img
                        src={(!spec.imageUrl || spec.imageUrl.includes('unsplash.com')) ? MALE_DOCTOR_VECTOR_ICON : spec.imageUrl}
                        alt={lang === 'bn' ? spec.nameBn : spec.nameEn}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-3 border-emerald-400 shadow-md ring-4 ring-emerald-50 group-hover:ring-emerald-100 group-hover:scale-105 transition-all duration-300 bg-sky-50"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = MALE_DOCTOR_VECTOR_ICON;
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs border-2 border-white">
                        <Stethoscope size={12} />
                      </div>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-base mb-1.5 text-center group-hover:text-emerald-700 transition-colors">
                    {lang === 'bn' ? spec.nameBn : spec.nameEn}
                  </h4>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4 text-center line-clamp-2">
                    {lang === 'bn' 
                      ? (spec.descriptionBn || 'অভিজ্ঞ চিকিৎসকের ফিজিক্যাল হোম ভিজিট ও প্রেসক্রিপশন।') 
                      : (spec.descriptionEn || 'Specialist doctor doorstep consultation and digital prescription.')}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    {spec.duration 
                      ? (lang === 'bn' ? `${spec.duration} ভিজিট` : `${spec.duration} visit`) 
                      : (lang === 'bn' ? 'প্রেসক্রিপশন অন্তর্ভুক্ত' : 'Prescription included')}
                  </span>

                  <button
                    type="button"
                    onClick={() => onOpenBookingModal(spec.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs group-hover:bg-emerald-600 group-hover:text-white"
                  >
                    <span>{lang === 'bn' ? 'বুক করুন' : 'Book Now'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Big Action CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/50 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left z-10">
            <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider inline-block">
              {lang === 'bn' ? '★ নির্ভরযোগ্য হোম ভিজিট' : '★ Trusted Doorstep Service'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {lang === 'bn' ? 'জরুরি ডাক্তারের হোম ভিজিট বুক করতে চান?' : 'Need a Doctor at Your Home Today?'}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              {lang === 'bn' 
                ? 'অনলাইনে এখনই ফর্ম পূরণ করে সুবিধাজনক স্লট নির্বাচন করুন অথবা আমাদের হেল্পলাইনে সরাসরি ফোন করুন।' 
                : 'Fill out the simple form online to schedule a convenient slot or call our medical helpline directly.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 z-10 shrink-0">
            <button
              type="button"
              onClick={() => onOpenBookingModal()}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Home size={18} />
              <span>{lang === 'bn' ? 'বাসায় ডাক্তার বুক করুন' : 'Book Doctor at Home'}</span>
              <ChevronRight size={16} />
            </button>

            {hotline && (
              <a
                href={`tel:${hotline}`}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center gap-2 transition-all"
              >
                <Phone size={16} className="text-emerald-400" />
                <span>{hotline}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
