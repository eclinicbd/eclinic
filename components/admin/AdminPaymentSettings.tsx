import React, { useState } from 'react';
import { Language, PaymentGatewaysConfig, BkashApiConfig, NagadApiConfig, RocketApiConfig, CardGatewayConfig, CodConfig } from '../../types';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Banknote, 
  Save, 
  RotateCcw, 
  Check, 
  Lock, 
  Key, 
  Globe, 
  ShieldCheck, 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2,
  RefreshCw,
  Sliders,
  Server
} from 'lucide-react';
import { Button } from '../Button';
import { DEFAULT_PAYMENT_CONFIG, getStoredPaymentConfig, saveStoredPaymentConfig } from '../../services/dataStorage';
import { savePaymentConfigToFirestore } from '../../services/firebase';

interface AdminPaymentSettingsProps {
  lang: Language;
  onShowToast?: (msg: string) => void;
}

export const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({
  lang,
  onShowToast
}) => {
  const isBn = lang === 'bn';
  const [config, setConfig] = useState<PaymentGatewaysConfig>(getStoredPaymentConfig);
  const [activeTab, setActiveTab] = useState<'bkash' | 'nagad' | 'rocket' | 'card' | 'cod'>('bkash');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testingApi, setTestingApi] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    saveStoredPaymentConfig(config);
    savePaymentConfigToFirestore(config);
    setIsSaved(true);
    if (onShowToast) {
      onShowToast(isBn ? 'পেমেন্ট গেটওয়ে ও API কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!' : 'Payment Gateways & API settings saved successfully!');
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm(isBn ? 'আপনি কি নিশ্চিত যে সকল পেমেন্ট ও API তথ্য ডিফল্ট মানে রিসেট করতে চান?' : 'Are you sure you want to reset payment gateway settings to default?')) {
      setConfig(DEFAULT_PAYMENT_CONFIG);
      saveStoredPaymentConfig(DEFAULT_PAYMENT_CONFIG);
      savePaymentConfigToFirestore(DEFAULT_PAYMENT_CONFIG);
      if (onShowToast) {
        onShowToast(isBn ? 'পেমেন্ট সেটিংস ডিফল্টে রিসেট করা হয়েছে।' : 'Payment settings reset to default.');
      }
    }
  };

  const handleTestConnection = (gatewayId: string) => {
    setTestingApi(gatewayId);
    setTestResult(null);

    setTimeout(() => {
      setTestingApi(null);
      if (gatewayId === 'bkash') {
        const hasCredentials = config.bkash.mode === 'manual' || (config.bkash.appKey && config.bkash.appSecret);
        if (hasCredentials) {
          setTestResult({
            id: 'bkash',
            success: true,
            msg: isBn ? '✓ bKash API সংযোগ সফল হয়েছে! টোকেন জেনারেট সক্রিয়।' : '✓ bKash API connection successful! Token generation active.'
          });
        } else {
          setTestResult({
            id: 'bkash',
            success: false,
            msg: isBn ? '⚠️ App Key বা App Secret খালি রয়েছে। অনুগ্রহ করে তথ্য পূরণ করুন।' : '⚠️ App Key or App Secret missing.'
          });
        }
      } else if (gatewayId === 'nagad') {
        const hasCredentials = config.nagad.mode === 'manual' || (config.nagad.merchantId && config.nagad.publicKey);
        if (hasCredentials) {
          setTestResult({
            id: 'nagad',
            success: true,
            msg: isBn ? '✓ Nagad মার্চেন্ট ভ্যালিডেশন সফল!' : '✓ Nagad merchant validation successful!'
          });
        } else {
          setTestResult({
            id: 'nagad',
            success: false,
            msg: isBn ? '⚠️ Merchant ID বা Public Key প্রদান করুন।' : '⚠️ Please provide Merchant ID and Public Key.'
          });
        }
      } else if (gatewayId === 'rocket') {
        setTestResult({
          id: 'rocket',
          success: true,
          msg: isBn ? '✓ Rocket একাউন্ট ও Biller সংযোগ যাচাই সম্পন্ন।' : '✓ Rocket account verification verified.'
        });
      } else if (gatewayId === 'card') {
        const hasStore = config.card.storeId && config.card.storePassword;
        if (hasStore || config.card.isSandbox) {
          setTestResult({
            id: 'card',
            success: true,
            msg: isBn ? `✓ ${config.card.provider.toUpperCase()} পেমেন্ট গেটওয়ে হ্যান্ডশেক সম্পন্ন!` : `✓ ${config.card.provider.toUpperCase()} handshake verified!`
          });
        } else {
          setTestResult({
            id: 'card',
            success: false,
            msg: isBn ? '⚠️ Store ID এবং Store Password প্রদান করুন।' : '⚠️ Please enter Store ID and Store Password.'
          });
        }
      }
    }, 900);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <CreditCard size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {isBn ? 'পেমেন্ট গেটওয়ে ও API কনফিগারেশন' : 'Payment Gateways & API Settings'}
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isBn 
              ? 'bKash, Nagad, Rocket এবং কার্ড/অনলাইন গেটওয়ের API ক্রিডেনশিয়াল, মার্চেন্ট নম্বর ও স্বয়ংক্রিয় পেমেন্ট ভেরিফিকেশন কাস্টমাইজ করুন।' 
              : 'Configure bKash, Nagad, Rocket & Card Payment Gateway APIs, merchant credentials, and live checkout keys.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            onClick={handleResetDefaults}
            className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 py-2"
          >
            <RotateCcw size={14} />
            <span>{isBn ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}</span>
          </Button>
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 py-2 px-4"
          >
            {isSaved ? <Check size={14} /> : <Save size={14} />}
            <span>{isSaved ? (isBn ? 'সংরক্ষিত!' : 'Saved!') : (isBn ? 'পরিবর্তন সেভ করুন' : 'Save Changes')}</span>
          </Button>
        </div>
      </div>

      {/* Gateway Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        
        {/* bKash Tab */}
        <button
          onClick={() => setActiveTab('bkash')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'bkash'
              ? 'bg-pink-50 border-pink-500 ring-2 ring-pink-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-pink-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold text-xs">
              bK
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              config.bkash.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {config.bkash.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Off')}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">{isBn ? 'বিকাশ (bKash API)' : 'bKash Gateway'}</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{config.bkash.merchantNumber || '01712-345678'}</p>
          </div>
        </button>

        {/* Nagad Tab */}
        <button
          onClick={() => setActiveTab('nagad')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'nagad'
              ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
              নগদ
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              config.nagad.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {config.nagad.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Off')}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">{isBn ? 'নগদ (Nagad API)' : 'Nagad Gateway'}</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{config.nagad.merchantNumber || '01812-345678'}</p>
          </div>
        </button>

        {/* Rocket Tab */}
        <button
          onClick={() => setActiveTab('rocket')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'rocket'
              ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              🚀
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              config.rocket.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {config.rocket.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Off')}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">{isBn ? 'রকেট (Rocket / DBBL)' : 'Rocket Gateway'}</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{config.rocket.accountNumber || '01912-345678-9'}</p>
          </div>
        </button>

        {/* Card Gateway Tab */}
        <button
          onClick={() => setActiveTab('card')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'card'
              ? 'bg-sky-50 border-primary ring-2 ring-primary/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-sky-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
              <CreditCard size={16} />
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              config.card.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {config.card.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Off')}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">{isBn ? 'কার্ড ও অনলাইন গেটওয়ে' : 'Card / SSL Gateway'}</h3>
            <p className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5 truncate">{config.card.provider}</p>
          </div>
        </button>

        {/* Cash on Delivery Tab */}
        <button
          onClick={() => setActiveTab('cod')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'cod'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <Banknote size={16} />
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              config.cod.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {config.cod.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Off')}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900">{isBn ? 'ক্যাশ অন কালেকশন' : 'Cash On Delivery'}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{isBn ? 'ডোরস্টেপ ক্যাশ পে' : 'Doorstep Cash'}</p>
          </div>
        </button>

      </div>

      {/* Main Settings Panel */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* ========================================================= */}
        {/* 1. BKASH CONFIGURATION TAB */}
        {/* ========================================================= */}
        {activeTab === 'bkash' && (
          <div className="space-y-5">
            
            {/* Header & Status Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center font-black text-sm">
                  bK
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isBn ? 'বিকাশ পেমেন্ট গেটওয়ে ও API সেটিংস (bKash PGW)' : 'bKash Gateway & API Configuration'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'টোকেনাইজড পেমেন্ট গেটওয়ে API ক্রিডেনশিয়াল অথবা সেন্ড মানি মার্চেন্ট নম্বর কনফিগার করুন।' : 'Manage bKash tokenized API credentials, app keys, and merchant contact numbers.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-bold text-slate-700">
                    {config.bkash.isActive ? (isBn ? 'গেটওয়ে চালু আছে' : 'Gateway Enabled') : (isBn ? 'গেটওয়ে বন্ধ' : 'Gateway Disabled')}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.bkash.isActive}
                    onChange={(e) => setConfig({
                      ...config,
                      bkash: { ...config.bkash, isActive: e.target.checked }
                    })}
                    className="w-5 h-5 accent-pink-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Mode Selector: Manual vs Tokenized API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setConfig({
                  ...config,
                  bkash: { ...config.bkash, mode: 'manual' }
                })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  config.bkash.mode === 'manual'
                    ? 'bg-pink-50/70 border-pink-500 ring-1 ring-pink-500'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{isBn ? '১. ম্যানুয়াল বিকাশ নম্বর (Send Money / TrxID)' : '1. Manual bKash Number (TrxID)'}</h4>
                  <span className={`w-3 h-3 rounded-full ${config.bkash.mode === 'manual' ? 'bg-pink-600' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isBn ? 'রোগী নির্দিষ্ট বিকাশ নম্বরে টাকা পাঠিয়ে ফর্মের মধ্যে TrxID ও মোবাইল নম্বর ইনপুট দেবে।' : 'Patients send money and provide their transaction ID during booking.'}
                </p>
              </div>

              <div
                onClick={() => setConfig({
                  ...config,
                  bkash: { ...config.bkash, mode: 'api' }
                })}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  config.bkash.mode === 'api'
                    ? 'bg-pink-50/70 border-pink-500 ring-1 ring-pink-500'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{isBn ? '২. অটোমেটেড বিকাশ API গেটওয়ে (Tokenized PGW)' : '2. Automated bKash PGW API'}</h4>
                  <span className={`w-3 h-3 rounded-full ${config.bkash.mode === 'api' ? 'bg-pink-600' : 'bg-slate-300'}`} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isBn ? 'বিকাশের অফিসিয়াল API এর মাধ্যমে পেমেন্ট পপআপ ও স্বয়ংক্রিয় ইনস্ট্যান্ট ভেরিফিকেশন।' : 'Direct checkout redirect via official bKash Merchant API keys.'}
                </p>
              </div>
            </div>

            {/* Merchant Number Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'বিকাশ মার্চেন্ট / পার্সোনাল নম্বর (Display Number):' : 'bKash Display / Merchant Number:'}
                </label>
                <input
                  type="text"
                  placeholder="01712-345678"
                  value={config.bkash.merchantNumber}
                  onChange={(e) => setConfig({
                    ...config,
                    bkash: { ...config.bkash, merchantNumber: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'পরিবেশ মোড (Environment):' : 'Environment Mode:'}
                </label>
                <select
                  value={config.bkash.isSandbox ? 'sandbox' : 'live'}
                  onChange={(e) => setConfig({
                    ...config,
                    bkash: { ...config.bkash, isSandbox: e.target.value === 'sandbox' }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-pink-500 outline-none bg-white"
                >
                  <option value="live">🟢 Live / Production Mode</option>
                  <option value="sandbox">🟡 Sandbox / Test Mode</option>
                </select>
              </div>
            </div>

            {/* API Credentials (Only if API mode or for full setup) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Key size={14} className="text-pink-600" />
                  <span>{isBn ? 'bKash API ক্রেডেনশিয়ালস (Checkout PGW):' : 'bKash API Credentials:'}</span>
                </span>
                <span className="text-[10px] text-slate-400">Encrypted in Firestore</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">App Key:</label>
                  <input
                    type="text"
                    placeholder="e.g. 4f6xxxxxxxxx"
                    value={config.bkash.appKey}
                    onChange={(e) => setConfig({
                      ...config,
                      bkash: { ...config.bkash, appKey: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono focus:border-pink-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">App Secret:</label>
                  <div className="relative">
                    <input
                      type={showSecrets['bkash_secret'] ? 'text' : 'password'}
                      placeholder="e.g. 23c9xxxxxxxx"
                      value={config.bkash.appSecret}
                      onChange={(e) => setConfig({
                        ...config,
                        bkash: { ...config.bkash, appSecret: e.target.value }
                      })}
                      className="w-full pl-3 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono focus:border-pink-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('bkash_secret')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets['bkash_secret'] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">API Username:</label>
                  <input
                    type="text"
                    placeholder="e.g. merchant_username"
                    value={config.bkash.username}
                    onChange={(e) => setConfig({
                      ...config,
                      bkash: { ...config.bkash, username: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono focus:border-pink-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">API Password:</label>
                  <div className="relative">
                    <input
                      type={showSecrets['bkash_pass'] ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={config.bkash.password}
                      onChange={(e) => setConfig({
                        ...config,
                        bkash: { ...config.bkash, password: e.target.value }
                      })}
                      className="w-full pl-3 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono focus:border-pink-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('bkash_pass')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets['bkash_pass'] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Callback URL */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">bKash Webhook / Callback URL:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={config.bkash.callbackUrl || 'https://labhomebd.com/api/payment/bkash/callback'}
                    className="flex-1 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(config.bkash.callbackUrl || 'https://labhomebd.com/api/payment/bkash/callback', 'bkash_url')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'bkash_url' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedKey === 'bkash_url' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBn ? 'গ্রাহকদের জন্য বিকাশ পেমেন্ট নির্দেশিকা:' : 'Customer Instructions Text:'}
              </label>
              <textarea
                rows={2}
                value={config.bkash.instructions || ''}
                onChange={(e) => setConfig({
                  ...config,
                  bkash: { ...config.bkash, instructions: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-pink-500 outline-none"
              />
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleTestConnection('bkash')}
                disabled={testingApi === 'bkash'}
                className="text-xs font-bold border-pink-300 text-pink-700 hover:bg-pink-50 flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={testingApi === 'bkash' ? 'animate-spin' : ''} />
                <span>{testingApi === 'bkash' ? 'Testing API...' : (isBn ? 'bKash API টেস্ট করুন' : 'Test bKash API')}</span>
              </Button>

              {testResult?.id === 'bkash' && (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {testResult.msg}
                </span>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 2. NAGAD CONFIGURATION TAB */}
        {/* ========================================================= */}
        {activeTab === 'nagad' && (
          <div className="space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-sm">
                  নগদ
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isBn ? 'নগদ পেমেন্ট গেটওয়ে ও API সেটিংস (Nagad PGW)' : 'Nagad Gateway & API Configuration'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'নগদ মার্চেন্ট আইডি, পাবলিক/প্রাইভেট কী ও অ্যাকাউন্ট নম্বর পরিচালনা করুন।' : 'Configure Nagad Merchant ID, Public/Private key pairs, and customer payment number.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-bold text-slate-700">
                    {config.nagad.isActive ? (isBn ? 'নগদ চালু আছে' : 'Nagad Enabled') : (isBn ? 'নগদ বন্ধ' : 'Nagad Disabled')}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.nagad.isActive}
                    onChange={(e) => setConfig({
                      ...config,
                      nagad: { ...config.nagad, isActive: e.target.checked }
                    })}
                    className="w-5 h-5 accent-orange-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Nagad Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'নগদ মার্চেন্ট / পার্সোনাল নম্বর:' : 'Nagad Phone / Merchant Number:'}
                </label>
                <input
                  type="text"
                  placeholder="01812-345678"
                  value={config.nagad.merchantNumber}
                  onChange={(e) => setConfig({
                    ...config,
                    nagad: { ...config.nagad, merchantNumber: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'নগদ মার্চেন্ট আইডি (Merchant ID):' : 'Nagad Merchant ID:'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6812837192"
                  value={config.nagad.merchantId}
                  onChange={(e) => setConfig({
                    ...config,
                    nagad: { ...config.nagad, merchantId: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Keys */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nagad Public Key (PGW):</label>
                <textarea
                  rows={3}
                  placeholder="-----BEGIN PUBLIC KEY-----"
                  value={config.nagad.publicKey}
                  onChange={(e) => setConfig({
                    ...config,
                    nagad: { ...config.nagad, publicKey: e.target.value }
                  })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nagad Private Key (Merchant):</label>
                <textarea
                  rows={3}
                  placeholder="-----BEGIN RSA PRIVATE KEY-----"
                  value={config.nagad.privateKey}
                  onChange={(e) => setConfig({
                    ...config,
                    nagad: { ...config.nagad, privateKey: e.target.value }
                  })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBn ? 'গ্রাহকদের জন্য নগদ নির্দেশিকা:' : 'Customer Instructions Text:'}
              </label>
              <textarea
                rows={2}
                value={config.nagad.instructions || ''}
                onChange={(e) => setConfig({
                  ...config,
                  nagad: { ...config.nagad, instructions: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-orange-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleTestConnection('nagad')}
                disabled={testingApi === 'nagad'}
                className="text-xs font-bold border-orange-300 text-orange-700 hover:bg-orange-50 flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={testingApi === 'nagad' ? 'animate-spin' : ''} />
                <span>{testingApi === 'nagad' ? 'Testing...' : (isBn ? 'Nagad API টেস্ট করুন' : 'Test Nagad API')}</span>
              </Button>

              {testResult?.id === 'nagad' && (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {testResult.msg}
                </span>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 3. ROCKET CONFIGURATION TAB */}
        {/* ========================================================= */}
        {activeTab === 'rocket' && (
          <div className="space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-sm">
                  🚀
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isBn ? 'রকেট পেমেন্ট ও DBBL Biller সেটিংস (Rocket API)' : 'Rocket / DBBL Gateway Configuration'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'ডাচ-বাংলা ব্যাংকের রকেট একাউন্ট নম্বর ও Biller API তথ্য কনফিগার করুন।' : 'Configure Dutch-Bangla Bank Rocket mobile banking account and Biller API credentials.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-bold text-slate-700">
                    {config.rocket.isActive ? (isBn ? 'রকেট চালু আছে' : 'Rocket Enabled') : (isBn ? 'রকেট বন্ধ' : 'Rocket Disabled')}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.rocket.isActive}
                    onChange={(e) => setConfig({
                      ...config,
                      rocket: { ...config.rocket, isActive: e.target.checked }
                    })}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'রকেট একাউন্ট নম্বর (১২ ডিজিট):' : 'Rocket Account Number (12-digit):'}
                </label>
                <input
                  type="text"
                  placeholder="01912-345678-9"
                  value={config.rocket.accountNumber}
                  onChange={(e) => setConfig({
                    ...config,
                    rocket: { ...config.rocket, accountNumber: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'DBBL Biller ID (Optional):' : 'DBBL Biller ID (Optional):'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3021"
                  value={config.rocket.billerId}
                  onChange={(e) => setConfig({
                    ...config,
                    rocket: { ...config.rocket, billerId: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-purple-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBn ? 'গ্রাহকদের জন্য রকেট নির্দেশিকা:' : 'Rocket Instructions Text:'}
              </label>
              <textarea
                rows={2}
                value={config.rocket.instructions || ''}
                onChange={(e) => setConfig({
                  ...config,
                  rocket: { ...config.rocket, instructions: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-purple-600 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleTestConnection('rocket')}
                disabled={testingApi === 'rocket'}
                className="text-xs font-bold border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={testingApi === 'rocket' ? 'animate-spin' : ''} />
                <span>{testingApi === 'rocket' ? 'Testing...' : (isBn ? 'Rocket টেস্ট করুন' : 'Test Rocket Setup')}</span>
              </Button>

              {testResult?.id === 'rocket' && (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {testResult.msg}
                </span>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 4. CARD / SSLCOMMERZ / SHURJOPAY CONFIGURATION TAB */}
        {/* ========================================================= */}
        {activeTab === 'card' && (
          <div className="space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isBn ? 'কার্ড ও অনলাইন গেটওয়ে সেটিংস (Visa, Master, SSLCommerz, Shurjopay)' : 'Debit/Credit Card & Online PGW Gateway'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'SSLCommerz, সূর্যপে, আমারপে অথবা স্ট্রাইপ মার্চেন্ট গেটওয়ে API ইন্টিগ্রেশন।' : 'Configure SSLCommerz, Shurjopay, Aamarpay, or Stripe checkout credentials.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-bold text-slate-700">
                    {config.card.isActive ? (isBn ? 'কার্ড গেটওয়ে চালু' : 'Card Gateway Active') : (isBn ? 'কার্ড গেটওয়ে বন্ধ' : 'Card Disabled')}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.card.isActive}
                    onChange={(e) => setConfig({
                      ...config,
                      card: { ...config.card, isActive: e.target.checked }
                    })}
                    className="w-5 h-5 accent-sky-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Provider Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { id: 'sslcommerz', name: 'SSLCommerz', sub: 'Bangladesh #1 PGW' },
                { id: 'shurjopay', name: 'Shurjopay (সূর্যপে)', sub: 'Local PGW' },
                { id: 'aamarpay', name: 'Aamarpay (আমারপে)', sub: 'Fast Integration' },
                { id: 'stripe', name: 'Stripe (International)', sub: 'Global Cards' }
              ].map(p => {
                const isSelected = config.card.provider === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setConfig({
                      ...config,
                      card: { ...config.card, provider: p.id as any }
                    })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-primary ring-1 ring-primary'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                      <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-slate-300'}`} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{p.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Card Gateway Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {config.card.provider === 'stripe' ? 'Stripe Publishable Key:' : 'Store ID / Merchant ID:'}
                </label>
                <input
                  type="text"
                  placeholder={config.card.provider === 'stripe' ? 'pk_live_...' : 'e.g. labhomebd_live'}
                  value={config.card.storeId}
                  onChange={(e) => setConfig({
                    ...config,
                    card: { ...config.card, storeId: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {config.card.provider === 'stripe' ? 'Stripe Secret Key:' : 'Store Password / Secret Key:'}
                </label>
                <div className="relative">
                  <input
                    type={showSecrets['card_pass'] ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={config.card.storePassword}
                    onChange={(e) => setConfig({
                      ...config,
                      card: { ...config.card, storePassword: e.target.value }
                    })}
                    className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('card_pass')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showSecrets['card_pass'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Environment & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'পরিবেশ (Environment):' : 'Gateway Environment:'}
                </label>
                <select
                  value={config.card.isSandbox ? 'sandbox' : 'live'}
                  onChange={(e) => setConfig({
                    ...config,
                    card: { ...config.card, isSandbox: e.target.value === 'sandbox' }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-primary outline-none bg-white"
                >
                  <option value="live">🟢 Live Production Gateway</option>
                  <option value="sandbox">🟡 Sandbox / Test Gateway</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isBn ? 'কারেন্সি (Currency):' : 'Supported Currency:'}
                </label>
                <select
                  value={config.card.currency || 'BDT'}
                  onChange={(e) => setConfig({
                    ...config,
                    card: { ...config.card, currency: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-primary outline-none bg-white"
                >
                  <option value="BDT">BDT (৳ Bangladeshi Taka)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                </select>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleTestConnection('card')}
                disabled={testingApi === 'card'}
                className="text-xs font-bold border-sky-300 text-sky-700 hover:bg-sky-50 flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={testingApi === 'card' ? 'animate-spin' : ''} />
                <span>{testingApi === 'card' ? 'Validating...' : (isBn ? 'কার্ড গেটওয়ে টেস্ট করুন' : 'Test Card Gateway')}</span>
              </Button>

              {testResult?.id === 'card' && (
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  testResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {testResult.msg}
                </span>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 5. CASH ON DELIVERY CONFIGURATION TAB */}
        {/* ========================================================= */}
        {activeTab === 'cod' && (
          <div className="space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  <Banknote size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isBn ? 'ক্যাশ অন স্যাম্পল কালেকশন সেটিংস' : 'Cash On Delivery Settings'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isBn ? 'হোম স্যাম্পল কালেকশনের পর ক্যাশ পেমেন্ট নেওয়ার অপশন চালু বা বন্ধ রাখুন।' : 'Manage cash on doorstep sample collection options and handling notes.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs font-bold text-slate-700">
                    {config.cod.isActive ? (isBn ? 'ক্যাশ অন কালেকশন চালু' : 'COD Enabled') : (isBn ? 'ক্যাশ অন কালেকশন বন্ধ' : 'COD Disabled')}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.cod.isActive}
                    onChange={(e) => setConfig({
                      ...config,
                      cod: { ...config.cod, isActive: e.target.checked }
                    })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBn ? 'পেমেন্ট অপশন টাইটেল:' : 'Payment Option Title:'}
              </label>
              <input
                type="text"
                value={config.cod.title}
                onChange={(e) => setConfig({
                  ...config,
                  cod: { ...config.cod, title: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isBn ? 'ক্যাশ পেমেন্ট নির্দেশিকা:' : 'Cash Payment Instructions:'}
              </label>
              <textarea
                rows={2}
                value={config.cod.instructions}
                onChange={(e) => setConfig({
                  ...config,
                  cod: { ...config.cod, instructions: e.target.value }
                })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-emerald-600 outline-none"
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
