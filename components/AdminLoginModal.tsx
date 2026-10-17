import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  LogIn, 
  AlertCircle
} from 'lucide-react';
import { Button } from './Button';
import { verifyStaffOrAdminLogin, setAdminSessionActive, getStoredAdminCredentials } from '../services/dataStorage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang: Language;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lang
}) => {
  const currentCreds = getStoredAdminCredentials();

  const [username, setUsername] = useState(() => currentCreds.username || 'admin');
  const [password, setPassword] = useState(() => currentCreds.password || 'admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const freshCreds = getStoredAdminCredentials();
      setUsername(freshCreds.username || 'admin');
      setPassword(freshCreds.password || 'admin123');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError(lang === 'bn' ? 'ইউজারনেম, স্টাফ আইডি বা ইমেইল প্রদান করুন' : 'Please enter username, staff ID or email');
      return;
    }

    if (!password) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড প্রদান করুন' : 'Please enter password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = verifyStaffOrAdminLogin(username, password);
      if (result.success) {
        setAdminSessionActive(true);
        setIsLoading(false);
        setError(null);
        onSuccess();
      } else {
        setIsLoading(false);
        setError(
          result.message || (
            lang === 'bn' 
              ? 'ভুল ইউজারনেম অথবা পাসওয়ার্ড! সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।' 
              : 'Invalid username or password. Please try again.'
          )
        );
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Back to site"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{lang === 'bn' ? 'ওয়েবসাইটে ফিরুন' : 'Back'}</span>
          </button>

          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-primary to-indigo-500 rounded-2xl p-0.5 shadow-lg shadow-primary/30 flex items-center justify-center mb-3">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-primary">
              <ShieldCheck size={32} className="text-sky-400" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {lang === 'bn' ? 'অ্যাডমিন পোর্টাল লগইন' : 'Admin Portal Access'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {lang === 'bn' 
              ? 'নিরাপত্তা নিশ্চিত করতে শুধুমাত্র অনুমোদিত অ্যাডমিন এখানে প্রবেশ করতে পারবেন।' 
              : 'Restricted area. Please authenticate with administrator credentials.'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={17} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {lang === 'bn' ? 'ইউজারনেম বা ইমেইল' : 'Username or Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={lang === 'bn' ? 'admin অথবা admin@eclinicbd.com' : 'admin or admin@eclinicbd.com'}
                autoFocus
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium text-slate-900 bg-slate-50/50 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium text-slate-900 bg-slate-50/50 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                <span>{lang === 'bn' ? 'লগইন করে প্রবেশ করুন' : 'Log In as Administrator'}</span>
              </>
            )}
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'বাতিল করে হোমপেজে ফিরে যান' : 'Cancel and return to homepage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
