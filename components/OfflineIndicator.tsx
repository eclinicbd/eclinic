import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { Language } from '../types';

interface OfflineIndicatorProps {
  lang?: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang = 'bn' }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  const isBn = lang === 'bn';

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 text-white px-3.5 py-2 text-xs font-medium shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      <WifiOff size={14} className="text-amber-400 shrink-0" />
      <span>
        {isBn ? 'ইন্টারনেট সংযোগ বিচ্ছিন্ন — অফলাইন ক্যাশ ডেটা ব্যবহৃত হচ্ছে' : 'Offline Mode — Using cached data'}
      </span>
    </div>
  );
};
