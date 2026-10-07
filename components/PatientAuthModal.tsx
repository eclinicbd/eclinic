import React, { useState, useEffect } from 'react';
import { Language, PatientUser } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  loginPatient, 
  registerPatient, 
  getStoredPatients 
} from '../services/dataStorage';
import { 
  loginWithEmail, 
  registerWithEmail,
  saveUserProfileToFirestore
} from '../services/firebase';
import { Button } from './Button';
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
  Activity
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
  const [signupAvatar, setSignupAvatar] = useState('');
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signupName.trim() || !signupPhone.trim() || !signupAddress.trim()) {
      setErrorMsg(t.authErrorFillRequired);
      return;
    }

    const cleanPhone = signupPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setErrorMsg(lang === 'bn' ? '১১ ডিজিটের কম মোবাইল নম্বর দিয়ে রেজিস্ট্রেশন হবে না (সঠিক ১১ ডিজিটের নম্বর দিন: যেমন 01712345678)।' : 'Mobile number must be at least 11 digits (e.g. 01712345678)');
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
        // Save to Firestore so customer immediately shows up in Admin Panel across all domains
        saveUserProfileToFirestore(result.patient);
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{t.phoneLabel} <span className="text-red-500">*</span></span>
                    <span className={`text-[10px] font-mono ${signupPhone.replace(/[^0-9]/g, '').length >= 11 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      {signupPhone.replace(/[^0-9]/g, '').length}/11 {lang === 'bn' ? 'ডিজিট' : 'digits'}
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      required
                      minLength={11}
                      maxLength={14}
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
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
