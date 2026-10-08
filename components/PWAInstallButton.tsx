import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share2, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface PWAInstallButtonProps {
  lang?: Language;
  variant?: 'header' | 'floating' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  lang = 'bn',
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running inside installed standalone PWA app, hide button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else {
      // If browser doesn't support beforeinstallprompt yet or already triggered
      setShowIOSGuide(true);
    }
  };

  const isBn = lang === 'bn';

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-primary hover:from-sky-600 hover:to-sky-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer ${className}`}
          title={isBn ? 'মোবাইল অ্যাপ ইনস্টল করুন' : 'Install Mobile App'}
        >
          <Download size={14} className="shrink-0 animate-bounce" />
          <span>{isBn ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className={`bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-3.5 sm:p-4 rounded-2xl border border-sky-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
              <Smartphone size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {isBn ? 'eClinic BD মোবাইল অ্যাপ ইনস্টল করুন' : 'Install eClinic BD Mobile App'}
              </h4>
              <p className="text-xs text-sky-200 mt-0.5">
                {isBn ? 'সরাসরি হোমস্ক্রিন থেকে দ্রুত ল্যাব টেস্ট বুকিং ও অফলাইন এক্সেস' : 'Fast booking & instant access directly from home screen'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download size={14} />
            <span>{isBn ? 'এখনই ইনস্টল করুন' : 'Install Now'}</span>
          </button>
        </div>
      )}

      {/* iOS Installation Guidance Modal */}
      {showIOSGuide && (
        <div 
          onClick={() => setShowIOSGuide(false)}
          className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-primary flex items-center justify-center">
                  <Smartphone size={18} />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {isBn ? 'মোবাইল হোমস্ক্রিনে ইনস্টল' : 'Add to Home Screen'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="leading-relaxed">
                {isBn 
                  ? 'আপনার মোবাইল বা ব্রাউজার থেকে নিচের ২ টি সহজ ধাপে অ্যাপটি হোমস্ক্রিনে যুক্ত করুন:' 
                  : 'Follow these 2 simple steps to install the app on your mobile home screen:'}
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {isBn ? 'Safari বা Chrome মেনু' : 'Tap Browser Menu'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Share2 size={13} className="text-primary inline shrink-0" />
                      {isBn ? 'ব্রাউজারের "Share" অথবা ৩-ডট মেনুতে চাপ দিন।' : 'Tap Share button or browser menu.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {isBn ? '"Add to Home Screen" নির্বাচন করুন' : 'Select "Add to Home Screen"'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <PlusSquare size={13} className="text-primary inline shrink-0" />
                      {isBn ? 'তালিকায় স্ক্রল করে "Add to Home Screen" চাপুন।' : 'Scroll down and tap "Add to Home Screen".'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                <span>{isBn ? 'ইনস্টল হলে সরাসরি ফুলস্ক্রিন অ্যাপ হিসেবে চলবে।' : 'App opens in standalone native mode.'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isBn ? 'বুঝেছি (বন্ধ করুন)' : 'Got it (Close)'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
