import React, { useState } from 'react';
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
  AlertCircle,
  KeyRound,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Button } from './Button';
import { verifyStaffOrAdminLogin, setAdminSessionActive, getStoredAdminCredentials, getStoredStaffUsers } from '../services/dataStorage';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [selectedQuickRole, setSelectedQuickRole] = useState<'admin' | 'manager' | 'phleb' | 'nurse' | 'delivery'>('admin');

  if (!isOpen) return null;

  const currentCreds = getStoredAdminCredentials();
  const staffList = getStoredStaffUsers();

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

  const handleQuickFillRole = (roleKey: 'admin' | 'manager' | 'phleb' | 'nurse' | 'delivery') => {
    setSelectedQuickRole(roleKey);
    if (roleKey === 'admin') {
      setUsername(currentCreds.username);
      setPassword(currentCreds.password);
    } else if (roleKey === 'manager') {
      const mgr = staffList.find(s => s.role === 'manager') || { emailOrUsername: 'manager', password: 'manager123' };
      setUsername(mgr.emailOrUsername);
      setPassword(mgr.password);
    } else if (roleKey === 'phleb') {
      const phleb = staffList.find(s => s.role === 'phlebotomist') || { emailOrUsername: 'phleb', password: 'phleb123' };
      setUsername(phleb.emailOrUsername);
      setPassword(phleb.password);
    } else if (roleKey === 'nurse') {
      const nurse = staffList.find(s => s.role === 'nurse') || { emailOrUsername: 'nurse', password: 'nurse123' };
      setUsername(nurse.emailOrUsername);
      setPassword(nurse.password);
    } else if (roleKey === 'delivery') {
      const deliv = staffList.find(s => s.role === 'delivery') || { emailOrUsername: 'delivery', password: 'delivery123' };
      setUsername(deliv.emailOrUsername);
      setPassword(deliv.password);
    }
    setError(null);
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
                placeholder={lang === 'bn' ? 'admin অথবা admin@labhome.com' : 'admin or admin@labhome.com'}
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
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <KeyRound size={12} />
                {lang === 'bn' ? 'ডিফল্ট পাসওয়ার্ড?' : 'Default info?'}
              </button>
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

          {/* Default Credentials Hint Box */}
          {showHint && (
            <div className="bg-sky-50/90 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-950 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-sky-900">
                  <Info size={14} className="text-primary" />
                  {lang === 'bn' ? 'ডেমো অ্যাকাউন্ট ও রোল সমূহ:' : 'Demo Accounts & Roles:'}
                </span>
              </div>

              {/* Role Quick Selector Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'admin', label: lang === 'bn' ? 'Super Admin' : 'Super Admin' },
                  { key: 'manager', label: lang === 'bn' ? 'Manager' : 'Manager' },
                  { key: 'phleb', label: lang === 'bn' ? 'Phlebotomist' : 'Phlebotomist' },
                  { key: 'nurse', label: lang === 'bn' ? 'Nurse' : 'Nurse' },
                  { key: 'delivery', label: lang === 'bn' ? 'Delivery' : 'Delivery' },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleQuickFillRole(item.key as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      selectedQuickRole === item.key
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-sky-100 hover:bg-sky-100/70'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-slate-500">
                {lang === 'bn' 
                  ? 'বাটনটিতে ক্লিক করলে স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট রোলের ইউজারনেম ও পাসওয়ার্ড পূরণ হয়ে যাবে।' 
                  : 'Click any role button above to auto-fill its credentials.'}
              </p>
            </div>
          )}

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
