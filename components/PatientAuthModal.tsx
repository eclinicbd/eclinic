import React, { useState, useEffect } from 'react';
import { Language, PatientUser } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  loginPatient, 
  registerPatient, 
  getStoredPatients 
} from '../services/dataStorage';
import { 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail 
} from '../services/firebase';
import { Button } from './Button';
import { PRESET_AVATARS } from './ProfilePictureModal';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  HeartPulse, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Camera
} from 'lucide-react';

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: (patient: PatientUser) => void;
  initialTab?: 'login' | 'signup';
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const PatientAuthModal: React.FC<PatientAuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSuccess,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const t = TRANSLATIONS[lang];

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up form state
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupGender, setSignupGender] = useState<'male' | 'female' | 'other'>('male');
  const [signupAge, setSignupAge] = useState('');
  const [signupBloodGroup, setSignupBloodGroup] = useState('B+');
  const [signupAvatar, setSignupAvatar] = useState(PRESET_AVATARS[0]?.url || '');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      setIsLoading(false);
      if (res.success && res.user) {
        setSuccessMsg(lang === 'bn' ? 'গুগল একাউন্ট দিয়ে সফলভাবে লগইন হয়েছে!' : 'Logged in with Google successfully!');
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(res.error || (lang === 'bn' ? 'গুগল লগইন ব্যর্থ হয়েছে' : 'Google sign-in failed'));
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || (lang === 'bn' ? 'গুগল লগইন ব্যর্থ হয়েছে' : 'Google sign-in failed'));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginIdentifier.trim()) {
      setErrorMsg(t.authErrorFillRequired);
      return;
    }

    setIsLoading(true);

    // Check if input is email
    if (loginIdentifier.includes('@') && loginPassword) {
      try {
        const fbRes = await loginWithEmail(loginIdentifier.trim(), loginPassword);
        if (fbRes.success && fbRes.user) {
          setIsLoading(false);
          setSuccessMsg(t.authLoginSuccess);
          setTimeout(() => {
            onSuccess(fbRes.user!);
            onClose();
          }, 500);
          return;
        }
      } catch (e) {
        // Fallback to local
      }
    }

    // Local / Phone fallback
    setTimeout(() => {
      const result = loginPatient(loginIdentifier, loginPassword);
      setIsLoading(false);

      if (result.success && result.patient) {
        setSuccessMsg(t.authLoginSuccess);
        setTimeout(() => {
          onSuccess(result.patient!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(result.message || t.authErrorInvalid);
      }
    }, 300);
  };

  const handleDemoLogin = (phone: string, name: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      const result = loginPatient(phone, 'password123');
      setIsLoading(false);
      if (result.success && result.patient) {
        setSuccessMsg(`${t.authLoginSuccess} (${name})`);
        setTimeout(() => {
          onSuccess(result.patient!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(result.message || t.authErrorInvalid);
      }
    }, 300);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signupName.trim() || !signupPhone.trim() || !signupAddress.trim()) {
      setErrorMsg(t.authErrorFillRequired);
      return;
    }

    const cleanPhone = signupPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMsg(lang === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)' : 'Please enter a valid 11-digit mobile number (e.g. 01712345678)');
      return;
    }

    if (signupPassword && signupPassword.length < 6) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    if (signupPassword && signupPassword !== signupConfirmPassword) {
      setErrorMsg(t.authErrorPasswordMismatch);
      return;
    }

    setIsLoading(true);

    // If email provided, create in Firebase Auth & Firestore
    if (signupEmail.trim() && signupPassword) {
      try {
        const fbRes = await registerWithEmail(signupEmail.trim(), signupPassword, {
          name: signupName.trim(),
          phone: signupPhone.trim(),
          address: signupAddress.trim(),
          gender: signupGender,
          age: signupAge.trim() || undefined,
          bloodGroup: signupBloodGroup,
          avatar: signupAvatar || undefined
        });

        if (fbRes.success && fbRes.user) {
          setIsLoading(false);
          setSuccessMsg(t.authSignupSuccess);
          setTimeout(() => {
            onSuccess(fbRes.user!);
            onClose();
          }, 600);
          return;
        }
      } catch (e: any) {
        // Continue to local registration
      }
    }

    // Local registration fallback
    setTimeout(() => {
      const result = registerPatient({
        name: signupName.trim(),
        phone: signupPhone.trim(),
        email: signupEmail.trim() || undefined,
        password: signupPassword.trim() || 'password123',
        address: signupAddress.trim(),
        gender: signupGender,
        age: signupAge.trim() || undefined,
        bloodGroup: signupBloodGroup,
        avatar: signupAvatar || undefined
      });

      setIsLoading(false);
      if (result.success && result.patient) {
        setSuccessMsg(t.authSignupSuccess);
        setTimeout(() => {
          onSuccess(result.patient!);
          onClose();
        }, 700);
      } else {
        setErrorMsg(result.message || t.authErrorPhoneExists);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with decorative background */}
        <div className="relative bg-gradient-to-r from-primary to-sky-600 text-white p-6 pb-5 flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-xs">
              <HeartPulse size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {activeTab === 'login' ? t.authLoginTitle : t.authSignupTitle}
              </h2>
              <p className="text-xs text-sky-100">
                {activeTab === 'login' ? t.authLoginSubtitle : t.authSignupSubtitle}
              </p>
            </div>
          </div>

          {/* Tab Switcher Pills */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/15 rounded-xl mt-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'login' 
                  ? 'bg-white text-primary shadow-sm font-bold' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User size={14} />
              <span>{t.authLoginBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'signup' 
                  ? 'bg-white text-primary shadow-sm font-bold' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles size={14} />
              <span>{t.authSignupTitle.split(' ')[0]} / {lang === 'bn' ? 'সাইন আপ' : 'Sign Up'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2.5 animate-in shake">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google 1-Click Sign-In Button */}
          <div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{lang === 'bn' ? 'গুগল দিয়ে দ্রুত লগইন করুন' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative">
              {lang === 'bn' ? 'অথবা ইমেইল / ফোন নম্বর' : 'or Email / Phone'}
            </span>
          </div>

          {/* ======================= LOGIN VIEW ======================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.authPhoneOrEmail} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={lang === 'bn' ? '01712345678 অথবা rahim@example.com' : '01712345678 or rahim@example.com'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.authPassword}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'bn' ? '(ডিফল্ট ডেমো: password123)' : '(Default demo: password123)'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-sm font-bold shadow-lg shadow-sky-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t.authLoginBtn}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>

              {/* Fast 1-Click Demo Accounts */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-2 text-center">
                  {t.authQuickDemo}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('01712345678', 'Rahim Ahmed')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-left transition-all flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-sky-200 text-primary flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 leading-tight">Rahim Ahmed</p>
                      <p className="text-[10px] text-slate-500">01712345678</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('01912345678', 'Salma Begum')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-left transition-all flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 leading-tight">Salma Begum</p>
                      <p className="text-[10px] text-slate-500">01912345678</p>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ======================= SIGN UP VIEW ======================= */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.authFullName} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: আব্দুল করিম' : 'e.g. Abdul Karim'}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.phoneLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="01700-000000"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.authEmail}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="karim@email.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.authPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.authConfirmPassword}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t.authAddress} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-2.5 left-3 text-slate-400 pointer-events-none">
                    <MapPin size={16} />
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    placeholder={lang === 'bn' ? 'বাসা/ফ্ল্যাট নং, রোড নং, এলাকা (যেমন: বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা)' : 'House, Road, Area (e.g. House 12, Road 5, Dhanmondi, Dhaka)'}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Gender, Age & Blood Group */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.authGender}
                  </label>
                  <select
                    value={signupGender}
                    onChange={(e) => setSignupGender(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-primary outline-none"
                  >
                    <option value="male">{t.authMale}</option>
                    <option value="female">{t.authFemale}</option>
                    <option value="other">{t.authOther}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.authAge}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={signupAge}
                    onChange={(e) => setSignupAge(e.target.value)}
                    placeholder="30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {t.authBloodGroup}
                  </label>
                  <select
                    value={signupBloodGroup}
                    onChange={(e) => setSignupBloodGroup(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-primary outline-none"
                  >
                    {BLOOD_GROUPS.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Preset Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'প্রোফাইল ছবি নির্বাচন করুন' : 'Choose Profile Picture'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{lang === 'bn' ? '(পরে পরিবর্তনযোগ্য)' : '(Can change later)'}</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.slice(0, 6).map((preset) => {
                    const isSelected = signupAvatar === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSignupAvatar(preset.url)}
                        className={`relative rounded-full p-0.5 border-2 transition-all flex-shrink-0 ${
                          isSelected 
                            ? 'border-primary ring-2 ring-primary/30 scale-105' 
                            : 'border-transparent hover:border-slate-300'
                        }`}
                        title={preset.label}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          className="w-9 h-9 rounded-full object-cover" 
                        />
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[9px] shadow-xs">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-sm font-bold shadow-lg shadow-sky-100 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>{t.authSignupBtn}</span>
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Footer toggle prompt */}
          <div className="pt-3 text-center text-xs text-slate-500">
            {activeTab === 'login' ? (
              <p>
                {t.authNeedAccount}?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg(null);
                  }}
                  className="text-primary font-bold hover:underline ml-1"
                >
                  {lang === 'bn' ? 'রেজিস্ট্রেশন করুন' : 'Sign Up Now'}
                </button>
              </p>
            ) : (
              <p>
                {t.authHaveAccount}?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                  }}
                  className="text-primary font-bold hover:underline ml-1"
                >
                  {lang === 'bn' ? 'লগইন করুন' : 'Log In Here'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
