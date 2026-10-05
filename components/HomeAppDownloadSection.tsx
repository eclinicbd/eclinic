import React, { useState } from 'react';
import { Language } from '../types';
import { 
  Smartphone, 
  Download, 
  Star, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Bell, 
  CheckCircle2, 
  ExternalLink,
  QrCode,
  Sparkles,
  ArrowRight,
  HeartPulse
} from 'lucide-react';

interface HomeAppDownloadSectionProps {
  lang: Language;
  badge?: string;
  title?: string;
  description?: string;
  androidAppUrl?: string;
  iosAppUrl?: string;
  apkDownloadUrl?: string;
  downloadCount?: string;
  rating?: string;
  appMockupImage?: string;
  onBookClick?: () => void;
}

export const HomeAppDownloadSection: React.FC<HomeAppDownloadSectionProps> = ({
  lang,
  badge,
  title,
  description,
  androidAppUrl = 'https://play.google.com/store/apps/details?id=com.eclinicbd.app',
  iosAppUrl = 'https://apps.apple.com/app/eclinic-bd/id123456789',
  apkDownloadUrl = 'https://eclinicbd.com/download/eclinic-latest.apk',
  downloadCount,
  rating,
  appMockupImage,
  onBookClick
}) => {
  const [showQrModal, setShowQrModal] = useState(false);

  const defaultBadge = lang === 'bn' ? '📱 গুগল প্লে ও অ্যাপ স্টোর' : '📱 Mobile App Available';
  const defaultTitle = lang === 'bn' 
    ? 'স্মার্টফোনে eClinic মোবাইল অ্যাপ ডাউনলোড করুন' 
    : 'Download the Official eClinic Mobile App';
  const defaultDesc = lang === 'bn'
    ? 'এক ক্লিকে ঘরে বসেই ল্যাব টেস্ট অর্ডার করুন, প্রেসক্রিপশন আপলোড করে স্যাম্পল কালেক্টরকে ট্র্যাক করুন এবং সাথে সাথে ডিজিটাল রিপোর্ট ডাউনলোড করুন।'
    : 'Order home diagnostic tests in seconds, upload doctor prescriptions, track phlebotomist live arrival and download verified test reports right on your smartphone.';

  const displayBadge = badge || defaultBadge;
  const displayTitle = title || defaultTitle;
  const displayDesc = description || defaultDesc;
  const displayDownloads = downloadCount || (lang === 'bn' ? '৫০,০০০+ সক্রিয় ডাউনলোড' : '50,000+ Active Downloads');
  const displayRating = rating || (lang === 'bn' ? '৪.৮ ★ (৫,০০০+ রিভিউ)' : '4.8 ★ (5,000+ Reviews)');

  const features = lang === 'bn' ? [
    { icon: Clock, title: 'দ্রুত স্যাম্পল বুকিং', desc: 'মাত্র ৩০ সেকেন্ডে পছন্দের ল্যাব ও টেস্ট বেছে নিন' },
    { icon: Bell, title: 'লাইভ নোটিফিকেশন', desc: 'কালেকশন স্ট্যাটাস ও রিপোর্ট রেডি হওয়ার অ্যালার্ট' },
    { icon: FileText, title: 'লাইফটাইম ডিজিটাল রিপোর্ট', desc: 'যে কোনো সময় পিডিএফ রিপোর্ট ডাউনলোড ও শেয়ার' },
    { icon: ShieldCheck, title: '১০০% নিরাপদ ও ভেরিফাইড', desc: 'শীর্ষ ডায়াগনস্টিক ল্যাব পার্টনারদের নির্ভুল ফলাফল' }
  ] : [
    { icon: Clock, title: 'Fast 30s Booking', desc: 'Select tests and favorite lab within seconds' },
    { icon: Bell, title: 'Instant Notifications', desc: 'Live alerts for sample collection & report readiness' },
    { icon: FileText, title: 'Lifetime Report Vault', desc: 'Download and share verified PDF reports anytime' },
    { icon: ShieldCheck, title: '100% Secure & Verified', desc: 'Accurate clinical results from top accredited labs' }
  ];

  return (
    <section id="app-download" className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white relative overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none translate-y-1/3"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Information, Store Buttons & Badges */}
          <div className="lg:col-span-7 space-y-7 text-left">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs sm:text-sm font-bold backdrop-blur-md shadow-xs">
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>{displayBadge}</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {displayTitle}
            </h2>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
              {displayDesc}
            </p>

            {/* Ratings & Downloads Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-amber-300">
                <Star size={15} className="fill-amber-400 text-amber-400" />
                <span>{displayRating}</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-emerald-300">
                <Download size={14} className="text-emerald-400" />
                <span>{displayDownloads}</span>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {features.map((feat, idx) => {
                const IconComp = feat.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs hover:border-sky-500/40 transition-colors">
                    <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300 shrink-0">
                      <IconComp size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{feat.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-snug">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* App Store Download Badges Row */}
            <div className="pt-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {lang === 'bn' ? 'ডাউনলোড অপশনসমূহ:' : 'Available Platforms:'}
              </p>
              
              <div className="flex flex-wrap items-center gap-3.5">
                
                {/* 1. Google Play Store Button */}
                <a
                  href={androidAppUrl || 'https://play.google.com/store/apps'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/90 hover:bg-black text-white border border-slate-700 hover:border-sky-400 transition-all duration-200 shadow-lg hover:shadow-sky-500/20 hover:-translate-y-0.5 cursor-pointer"
                >
                  {/* Google Play Vector Icon */}
                  <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186a2.372 2.372 0 0 1-.61-.926V2.74c.15-.353.364-.67.61-.926z" fill="#00D2FF"/>
                    <path d="M17.186 8.607L13.793 12l3.393 3.393 3.82-2.183a1.41 1.41 0 0 0 0-2.42l-3.82-2.183z" fill="#FFCE00"/>
                    <path d="M3.609 22.186L13.793 12 17.186 15.393 6.012 21.78a2.38 2.38 0 0 1-2.403.406z" fill="#FF3A44"/>
                    <path d="M3.609 1.814a2.38 2.38 0 0 1 2.403.406l11.174 6.387L13.793 12 3.61 1.814z" fill="#00E676"/>
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider leading-none">
                      {lang === 'bn' ? 'গেট ইট অন' : 'GET IT ON'}
                    </span>
                    <span className="block text-base sm:text-lg font-extrabold text-white leading-tight">
                      Google Play
                    </span>
                  </div>
                </a>

                {/* 2. Apple App Store Button */}
                <a
                  href={iosAppUrl || 'https://apps.apple.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/90 hover:bg-black text-white border border-slate-700 hover:border-sky-400 transition-all duration-200 shadow-lg hover:shadow-sky-500/20 hover:-translate-y-0.5 cursor-pointer"
                >
                  {/* Apple Icon */}
                  <svg className="w-7 h-7 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1 .08 2.05-.51 2.68-1.26z"/>
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider leading-none">
                      {lang === 'bn' ? 'ডাউনলোড করুন' : 'Download on the'}
                    </span>
                    <span className="block text-base sm:text-lg font-extrabold text-white leading-tight">
                      App Store
                    </span>
                  </div>
                </a>

                {/* 3. Direct APK or QR Code Button */}
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all hover:text-white cursor-pointer"
                  title="Scan QR Code to install"
                >
                  <QrCode size={18} className="text-sky-400" />
                  <span>{lang === 'bn' ? 'QR স্ক্যান করুন' : 'Scan QR Code'}</span>
                </button>

              </div>
            </div>

          </div>

          {/* Right Column: Smartphone UI Mockup & Visual */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
              
              {/* Outer Decorative Ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-[48px] blur-xl opacity-30 animate-pulse"></div>

              {/* Smartphone Frame */}
              <div className="relative bg-slate-950 border-[6px] border-slate-800 rounded-[40px] shadow-2xl overflow-hidden p-3 pt-5">
                
                {/* Phone Speaker & Notch */}
                <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                  <div className="w-10 h-1.5 rounded-full bg-slate-800"></div>
                </div>

                {/* Smartphone Screen Content */}
                <div className="bg-slate-50 text-slate-800 rounded-[28px] overflow-hidden shadow-inner border border-slate-200">
                  
                  {/* Mock App Header */}
                  <div className="bg-gradient-to-r from-primary to-sky-600 text-white p-4 pb-5 rounded-b-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-xs">
                          <HeartPulse size={16} />
                        </div>
                        <span className="font-bold text-sm tracking-tight">eClinic BD</span>
                      </div>
                      <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                        24/7 Home Care
                      </span>
                    </div>

                    <div className="bg-white/15 p-2.5 rounded-xl backdrop-blur-xs flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-sky-100">
                          {lang === 'bn' ? 'হোম স্যাম্পল বুকিং' : 'Doorstep Sample Collection'}
                        </div>
                        <div className="text-xs font-bold text-white">
                          {lang === 'bn' ? '১০% ফ্ল্যাট ডিসকাউন্ট' : 'Flat 10% Off on App Orders'}
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-1 rounded-lg">
                        APP10
                      </span>
                    </div>
                  </div>

                  {/* Mock App Body Content */}
                  <div className="p-3.5 space-y-3 bg-white">
                    
                    {/* Quick Test Cards Mockup */}
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {lang === 'bn' ? 'জনপ্রিয় টেস্টসমূহ' : 'Popular Diagnostics'}
                    </div>

                    {/* Test Row 1 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                          CBC
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">CBC with ESR</div>
                          <div className="text-[10px] text-slate-500">Popular Diagnostic</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-primary">৳৩৫০</div>
                        <div className="text-[9px] text-emerald-600 font-semibold">🔥 1420+ Done</div>
                      </div>
                    </div>

                    {/* Test Row 2 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-primary flex items-center justify-center font-bold text-xs">
                          HbA1c
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">HbA1c Glycated Hb</div>
                          <div className="text-[10px] text-slate-500">Labaid Diagnostic</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-primary">৳৯৫০</div>
                        <div className="text-[9px] text-emerald-600 font-semibold">🔥 1180+ Done</div>
                      </div>
                    </div>

                    {/* Test Row 3 - Report Ready Notification Mock */}
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 size={15} />
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-emerald-950 leading-tight">
                          {lang === 'bn' ? 'রিপোর্ট রেডি হয়েছে!' : 'Report Ready for Download!'}
                        </div>
                        <div className="text-[9px] text-emerald-700">
                          {lang === 'bn' ? 'ইনভয়েস #EC-8910 • ভেরিফাইড পিডিএফ' : 'Invoice #EC-8910 • Verified PDF'}
                        </div>
                      </div>
                    </div>

                    {/* App CTA Button inside screen */}
                    <button
                      type="button"
                      onClick={() => {
                        window.open(androidAppUrl || 'https://play.google.com/store', '_blank');
                      }}
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Download size={13} />
                      <span>{lang === 'bn' ? 'অ্যাপ থেকে টেস্ট বুক করুন' : 'Instant App Booking'}</span>
                    </button>

                  </div>

                </div>

                {/* Bottom Home Indicator */}
                <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-3"></div>

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* QR Code Modal for Scanning from Phone */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-primary flex items-center justify-center mx-auto">
              <QrCode size={26} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {lang === 'bn' ? 'মোবাইল দিয়ে কিউআর স্ক্যান করুন' : 'Scan to Download eClinic App'}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'bn' 
                ? 'আপনার ফোনের ক্যামেরা দিয়ে নিচের QR কোডটি স্ক্যান করে গুগল প্লে স্টোর অথবা অ্যাপল স্টোর থেকে সহজে অ্যাপটি ডাউনলোড করুন।'
                : 'Point your smartphone camera at the QR code below to download the official eClinic app directly from the store.'}
            </p>

            {/* Generated QR Code Mockup / Visual */}
            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(androidAppUrl || 'https://play.google.com/store')}`} 
                alt="eClinic App Download QR"
                className="w-40 h-40 rounded-xl shadow-xs"
              />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Google Play & App Store
              </span>
            </div>

            {/* Direct Links in Modal */}
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={androidAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Google Play Store</span>
                <ExternalLink size={13} />
              </a>

              {apkDownloadUrl && (
                <a
                  href={apkDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download size={13} />
                  <span>{lang === 'bn' ? 'সরাসরি APK ডাউনলোড' : 'Direct APK Download'}</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
