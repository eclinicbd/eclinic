import React, { useState, useEffect } from 'react';
import { TestPackage, HealthPackage, LabPartner, BookingHistoryItem, BookingStatus, Language, ServiceItem, CategoryItem } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { generateUniqueOrderId, formatOrderId } from '../BookingModal';
import { getStoredDateSlotConfig, DEFAULT_TIME_SLOTS, getStoredStaffUsers } from '../../services/dataStorage';
import { LabLogo } from '../LabLogo';
import { 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Building2, 
  DollarSign, 
  Clock, 
  Printer, 
  Phone, 
  MapPin, 
  User, 
  Calendar, 
  FlaskConical, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Stethoscope,
  Receipt,
  Tag,
  CheckCircle2,
  Layers,
  Percent,
  Edit2,
  Search,
  Droplet,
  Zap,
  HeartPulse,
  Activity,
  ShieldCheck,
  Award,
  Pill,
  Flame,
  Download
} from 'lucide-react';
import { printOrDownloadInvoice } from '../../services/invoiceService';
import { Button } from '../Button';
import { CATEGORY_ICON_MAP, CATEGORY_COLOR_MAP } from './AdminCategories';

const PRESET_IMAGES = [
  { label: 'Blood/Tube', url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=400' },
  { label: 'Lab Equipment', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=400' },
  { label: 'Heart/Cardio', url: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=400' },
  { label: 'Microscope', url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=400' },
  { label: 'Medicine', url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400' }
];

const PRESET_CATEGORIES = ['General', 'Diabetes', 'Heart', 'Thyroid', 'Vitamin', 'Kidney', 'Liver', 'Infection', 'Women Health'];

// ==========================================
// 1. TEST FORM MODAL (Add & Edit)
// ==========================================
interface TestModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSave: (test: TestPackage) => void;
  editingTest: TestPackage | null;
  labs: LabPartner[];
  categories?: CategoryItem[];
  onAddNewCategory?: (category: CategoryItem) => void;
}

export const TestFormModal: React.FC<TestModalProps> = ({
  lang,
  isOpen,
  onClose,
  onSave,
  editingTest,
  labs,
  categories = [],
  onAddNewCategory
}) => {
  const [formData, setFormData] = useState<Partial<TestPackage>>({
    name: '',
    description: '',
    category: 'General',
    originalPrice: 600,
    price: 500,
    discountPercent: 17,
    turnaroundTime: '24 Hours',
    image: PRESET_IMAGES[0].url,
    originalPriceByLab: {},
    priceByLab: {},
    hiddenLabs: [],
    isHidden: false
  });
  const [targetLabForPricing, setTargetLabForPricing] = useState<string>('ALL');
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  // Quick Add Category State
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('FlaskConical');
  const [newCatColor, setNewCatColor] = useState('blue');
  const [catError, setCatError] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (editingTest) {
      const origPrice = editingTest.originalPrice !== undefined ? editingTest.originalPrice : editingTest.price;
      const discPct = editingTest.discountPercent !== undefined 
        ? editingTest.discountPercent 
        : (origPrice > editingTest.price ? Math.round(((origPrice - editingTest.price) / origPrice) * 100) : 0);

      setFormData({
        ...editingTest,
        originalPrice: origPrice,
        price: editingTest.price,
        discountPercent: discPct,
        originalPriceByLab: editingTest.originalPriceByLab ? { ...editingTest.originalPriceByLab } : {},
        priceByLab: editingTest.priceByLab ? { ...editingTest.priceByLab } : {},
        hiddenLabs: editingTest.hiddenLabs ? [...editingTest.hiddenLabs] : [],
        isHidden: !!editingTest.isHidden
      });
    } else {
      const initialPrices: Record<string, number> = {};
      const initialOrigPrices: Record<string, number> = {};
      labs.forEach(l => { 
        initialOrigPrices[l.id] = 600;
        initialPrices[l.id] = 500; 
      });
      setFormData({
        name: '',
        description: '',
        category: 'General',
        originalPrice: 600,
        price: 500,
        discountPercent: 17,
        turnaroundTime: '24 Hours',
        image: PRESET_IMAGES[0].url,
        originalPriceByLab: initialOrigPrices,
        priceByLab: initialPrices,
        hiddenLabs: [],
        isHidden: false
      });
    }
  }, [editingTest, isOpen, labs]);

  if (!isOpen) return null;

  // Handlers for base pricing
  const handleOriginalPriceChange = (orig: number) => {
    const origVal = Math.max(0, orig);
    const discPct = formData.discountPercent || 0;
    const newPrice = discPct > 0 ? Math.round(origVal * (1 - discPct / 100)) : origVal;
    setFormData(prev => ({
      ...prev,
      originalPrice: origVal,
      price: newPrice
    }));
  };

  const handleDiscountPercentChange = (pct: number) => {
    const safePct = Math.min(100, Math.max(0, pct));
    const origVal = formData.originalPrice !== undefined ? formData.originalPrice : (formData.price || 0);
    const newPrice = Math.round(origVal * (1 - safePct / 100));
    setFormData(prev => ({
      ...prev,
      discountPercent: safePct,
      price: newPrice
    }));
  };

  const handlePriceChange = (sellingPrice: number) => {
    const saleVal = Math.max(0, sellingPrice);
    const origVal = formData.originalPrice !== undefined && formData.originalPrice > 0 ? formData.originalPrice : saleVal;
    const calculatedPct = origVal > saleVal ? Math.round(((origVal - saleVal) / origVal) * 100) : 0;
    setFormData(prev => ({
      ...prev,
      price: saleVal,
      originalPrice: origVal < saleVal ? saleVal : origVal,
      discountPercent: calculatedPct
    }));
  };

  const handleApplyBaseToSelected = () => {
    const baseOriginal = Number(formData.originalPrice) || Number(formData.price) || 0;
    const baseSelling = Number(formData.price) || 0;

    if (targetLabForPricing === 'ALL') {
      const updatedSelling: Record<string, number> = {};
      const updatedOriginal: Record<string, number> = {};
      labs.forEach(l => {
        updatedOriginal[l.id] = baseOriginal;
        updatedSelling[l.id] = baseSelling;
      });
      setFormData(prev => ({ 
        ...prev, 
        originalPriceByLab: updatedOriginal,
        priceByLab: updatedSelling 
      }));
      setApplySuccessMsg(lang === 'bn' ? 'সকল ল্যাবে এই রেট সফলভাবে সেট করা হয়েছে!' : 'Applied base rate to all partner labs!');
    } else {
      setFormData(prev => ({
        ...prev,
        originalPriceByLab: {
          ...(prev.originalPriceByLab || {}),
          [targetLabForPricing]: baseOriginal
        },
        priceByLab: {
          ...(prev.priceByLab || {}),
          [targetLabForPricing]: baseSelling
        }
      }));
      const targetLabObj = labs.find(l => l.id === targetLabForPricing);
      const labName = targetLabObj ? targetLabObj.name : targetLabForPricing;
      setApplySuccessMsg(lang === 'bn' ? `${labName} এ এই রেট সফলভাবে সেট করা হয়েছে!` : `Applied base rate to ${labName}!`);
    }

    setTimeout(() => {
      setApplySuccessMsg(null);
    }, 3000);
  };

  const handleLabSellingPriceChange = (labId: string, val: number) => {
    setFormData(prev => ({
      ...prev,
      priceByLab: {
        ...(prev.priceByLab || {}),
        [labId]: val
      }
    }));
  };

  const handleLabOriginalPriceChange = (labId: string, val: number) => {
    setFormData(prev => ({
      ...prev,
      originalPriceByLab: {
        ...(prev.originalPriceByLab || {}),
        [labId]: val
      }
    }));
  };

  const handleToggleLabHidden = (labId: string) => {
    setFormData(prev => {
      const currentHidden = prev.hiddenLabs || [];
      const isHidden = currentHidden.includes(labId);
      const updated = isHidden 
        ? currentHidden.filter(id => id !== labId)
        : [...currentHidden, labId];
      return { ...prev, hiddenLabs: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const baseOriginal = Number(formData.originalPrice) || Number(formData.price) || 0;
    const baseSelling = Number(formData.price) || 0;
    const discountPct = baseOriginal > baseSelling 
      ? (formData.discountPercent || Math.round(((baseOriginal - baseSelling) / baseOriginal) * 100))
      : 0;

    const finalSellingPrices: Record<string, number> = { ...(formData.priceByLab || {}) };
    const finalOriginalPrices: Record<string, number> = { ...(formData.originalPriceByLab || {}) };

    labs.forEach(l => {
      if (finalSellingPrices[l.id] === undefined || isNaN(finalSellingPrices[l.id])) {
        finalSellingPrices[l.id] = baseSelling;
      }
      if (finalOriginalPrices[l.id] === undefined || isNaN(finalOriginalPrices[l.id])) {
        finalOriginalPrices[l.id] = baseOriginal;
      }
    });

    const testToSave: TestPackage = {
      id: editingTest ? editingTest.id : `test_${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description || '',
      category: formData.category || 'General',
      originalPrice: baseOriginal,
      price: baseSelling,
      discountPercent: discountPct,
      turnaroundTime: formData.turnaroundTime || '24 Hours',
      image: formData.image || PRESET_IMAGES[0].url,
      originalPriceByLab: finalOriginalPrices,
      priceByLab: finalSellingPrices,
      hiddenLabs: formData.hiddenLabs || [],
      isHidden: !!formData.isHidden
    };

    onSave(testToSave);
  };

  const currentOriginal = formData.originalPrice !== undefined ? formData.originalPrice : (formData.price || 0);
  const currentSelling = formData.price !== undefined ? formData.price : currentOriginal;
  const currentSavings = currentOriginal > currentSelling ? currentOriginal - currentSelling : 0;
  const currentDiscountPct = currentOriginal > currentSelling 
    ? Math.round(((currentOriginal - currentSelling) / currentOriginal) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FlaskConical className="text-sky-600" size={20} />
            <h2 className="text-lg font-bold text-slate-900">
              {editingTest ? t.adminEditTest : t.adminAddNewTest}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Test Name (বাংলা বা English) *</label>
              <input 
                type="text" 
                required 
                value={formData.name || ''} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Complete Blood Count (CBC)" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  {lang === 'bn' ? 'ক্যাটেগরি (Category) *' : 'Category *'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewCat(!isAddingNewCat);
                    setCatError(null);
                  }}
                  className="text-[11px] font-bold text-primary hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                  <span>{isAddingNewCat ? (lang === 'bn' ? 'তালিকা দেখুন' : 'Select from list') : (lang === 'bn' ? '+ নতুন ক্যাটেগরি' : '+ New Category')}</span>
                </button>
              </div>

              {!isAddingNewCat ? (
                <div className="space-y-1">
                  <select 
                    value={formData.category || 'General'}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsAddingNewCat(true);
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs bg-white font-semibold cursor-pointer"
                  >
                    {(categories.length > 0 ? categories : PRESET_CATEGORIES.map(c => ({ id: c, name: c }))).map(c => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name} {c.nameBn ? `(${c.nameBn})` : ''}
                      </option>
                    ))}
                    {formData.category && !(categories.length > 0 ? categories : PRESET_CATEGORIES.map(c => ({ name: c }))).some(c => c.name.toLowerCase() === formData.category?.toLowerCase()) && (
                      <option value={formData.category}>{formData.category} (Custom)</option>
                    )}
                    <option value="__add_new__" className="text-primary font-bold">
                      ➕ {lang === 'bn' ? '+ নতুন ক্যাটেগরি তৈরি করুন...' : '+ Create New Category...'}
                    </option>
                  </select>
                </div>
              ) : (
                /* Inline Quick Category Creator */
                <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                      <Tag size={12} className="text-primary" />
                      {lang === 'bn' ? 'নতুন ক্যাটেগরি তৈরি ও নির্বাচন করুন' : 'Create & Select New Category'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {catError && (
                    <div className="text-[10px] text-red-600 font-bold bg-red-50 p-1.5 rounded-lg border border-red-200">
                      {catError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Name (e.g. Vitamin)" 
                      value={newCatName}
                      onChange={e => {
                        setNewCatName(e.target.value);
                        setCatError(null);
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-bold outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input 
                      type="text" 
                      placeholder="বাংলা নাম (অপশনাল)" 
                      value={newCatNameBn}
                      onChange={e => setNewCatNameBn(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(false)}
                      className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-200/60 rounded-lg font-semibold"
                    >
                      {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newCatName.trim();
                        if (!trimmed) {
                          setCatError(lang === 'bn' ? 'ক্যাটেগরির ইংরেজি নাম দিন' : 'Enter category name');
                          return;
                        }
                        const newCatItem: CategoryItem = {
                          id: `cat_${Date.now()}`,
                          name: trimmed,
                          nameBn: newCatNameBn.trim() || undefined,
                          icon: newCatIcon,
                          color: newCatColor,
                          order: (categories?.length || 0) + 1,
                          isHidden: false
                        };
                        if (onAddNewCategory) {
                          onAddNewCategory(newCatItem);
                        }
                        setFormData(prev => ({ ...prev, category: trimmed }));
                        setNewCatName('');
                        setNewCatNameBn('');
                        setIsAddingNewCat(false);
                      }}
                      className="px-3 py-1 bg-primary hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      <span>{lang === 'bn' ? 'যুক্ত করুন' : 'Save & Select'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Base Pricing & Discount Options */}
          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Tag size={14} className="text-primary" /> {lang === 'bn' ? 'মূল্য ও ডিসকাউন্ট সেটিংস' : 'Pricing & Discount Settings'}
              </span>
              {currentDiscountPct > 0 && (
                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-md font-extrabold text-[11px] flex items-center gap-1">
                  <Tag size={11} /> {currentDiscountPct}% {lang === 'bn' ? 'ছাড় সক্রিয়' : 'Discount Active'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Regular Original Price */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'মূল রেগুলার প্রাইস (৳) *' : 'Regular Price (৳) *'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  required 
                  value={formData.originalPrice !== undefined ? formData.originalPrice : (formData.price || '')} 
                  onChange={(e) => handleOriginalPriceChange(Number(e.target.value))}
                  placeholder="e.g. 600"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{lang === 'bn' ? 'ছাড়ের পূর্বের আসল মূল্য' : 'Original price before discount'}</span>
              </div>

              {/* Discount Percent */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ডিসকাউন্ট ছাড় (%)' : 'Discount (%)'}
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.discountPercent !== undefined ? formData.discountPercent : ''} 
                    onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                    placeholder="0"
                    className="w-full pl-3 pr-7 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold bg-white text-rose-600"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold text-xs">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{lang === 'bn' ? 'শতাংশ ছাড় (যেমন: ২০%)' : 'e.g. 15%, 20% off'}</span>
              </div>

              {/* Final Selling Price */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিক্রয় মূল্য / অফার প্রাইস (৳) *' : 'Selling / Discounted Price (৳) *'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  required 
                  value={formData.price !== undefined ? formData.price : ''} 
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none text-xs font-bold bg-white text-emerald-700"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{lang === 'bn' ? 'কাস্টমার যা পরিশোধ করবে' : 'Customer payable amount'}</span>
              </div>
            </div>

            {/* Live Discount Calculator Preview */}
            <div className="p-2.5 bg-white rounded-lg border border-sky-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">
                {lang === 'bn' ? 'লাইভ প্রিভিউ:' : 'Live Calculation:'}
              </span>
              {currentSavings > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="line-through text-slate-400 font-medium">৳ {currentOriginal}</span>
                  <span className="text-slate-800 font-extrabold text-xs">৳ {currentSelling}</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                    {lang === 'bn' ? `সাশ্রয় ৳${currentSavings} (${currentDiscountPct}% ছাড়)` : `Save ৳${currentSavings} (${currentDiscountPct}% OFF)`}
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 font-semibold">{lang === 'bn' ? `বর্তমান মূল্য ৳${currentSelling} (কোনো ছাড় নেই)` : `Standard Price: ৳${currentSelling} (No discount)`}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Turnaround Time</label>
              <input 
                type="text" 
                value={formData.turnaroundTime || ''} 
                onChange={(e) => setFormData({ ...formData, turnaroundTime: e.target.value })}
                placeholder="e.g. 12 Hours, 24 Hours, ১২ ঘন্টা" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Description / Preparation Instructions</label>
              <input 
                type="text"
                value={formData.description || ''} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Fasting instructions or test details..." 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
              />
            </div>
          </div>

          {/* Diagnostic Centers Pricing Matrix */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Building2 size={14} className="text-sky-600" /> {t.adminLabRates}
              </span>

              {/* Lab Selector for Applying Base Pricing */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <label className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
                  {lang === 'bn' ? 'প্রযোজ্য ল্যাব:' : 'Apply to:'}
                </label>
                <select
                  value={targetLabForPricing}
                  onChange={e => setTargetLabForPricing(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-primary cursor-pointer max-w-[190px] shadow-2xs"
                >
                  <option value="ALL">
                    {lang === 'bn' ? '🌟 সকল ল্যাব (All Labs)' : '🌟 All Labs'}
                  </option>
                  {labs.map(lab => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name}
                    </option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={handleApplyBaseToSelected}
                  className="text-[11px] font-bold text-white bg-primary hover:bg-sky-600 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  title={lang === 'bn' ? 'নির্বাচিত ল্যাবে এই রেট সেট করুন' : 'Apply rate to selected lab(s)'}
                >
                  <Check size={12} />
                  {lang === 'bn' ? 'সেট করুন' : 'Apply'}
                </button>
              </div>
            </div>

            {applySuccessMsg && (
              <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{applySuccessMsg}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
              {labs.map(lab => {
                const isLabHidden = formData.hiddenLabs?.includes(lab.id);
                const labSelling = formData.priceByLab?.[lab.id] ?? formData.price ?? 500;
                const labOrig = formData.originalPriceByLab?.[lab.id] ?? formData.originalPrice ?? labSelling;
                const hasLabDisc = labOrig > labSelling;
                return (
                  <div 
                    key={lab.id} 
                    className={`p-2.5 rounded-xl border transition-all space-y-1.5 ${
                      isLabHidden 
                        ? 'bg-rose-50/50 border-rose-200 opacity-75' 
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className={`truncate font-bold text-[11px] ${isLabHidden ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                          {lab.name}
                        </span>
                        {hasLabDisc && !isLabHidden && (
                          <span className="text-[9px] text-rose-600 font-extrabold bg-rose-50 px-1 rounded border border-rose-200/50 shrink-0">
                            -{Math.round(((labOrig - labSelling) / labOrig) * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Lab-Wise Hide/Show Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleLabHidden(lab.id)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                          isLabHidden
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                        title={isLabHidden ? (lang === 'bn' ? 'ল্যাবে এই টেস্ট দৃশ্যমান করুন' : 'Make visible for this lab') : (lang === 'bn' ? 'ল্যাবে এই টেস্ট হাইড করুন' : 'Hide from this lab')}
                      >
                        {isLabHidden ? (
                          <>
                            <EyeOff size={11} className="text-rose-600" />
                            <span>{lang === 'bn' ? 'হাইড' : 'Hidden'}</span>
                          </>
                        ) : (
                          <>
                            <Eye size={11} className="text-slate-500" />
                            <span>{lang === 'bn' ? 'দৃশ্যমান' : 'Visible'}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">{lang === 'bn' ? 'মূল (৳)' : 'Regular (৳)'}</span>
                        <input 
                          type="number" 
                          min="0"
                          disabled={isLabHidden}
                          value={labOrig}
                          onChange={(e) => handleLabOriginalPriceChange(lab.id, Number(e.target.value))}
                          className={`w-full px-1.5 py-1 border rounded text-right text-xs font-medium outline-none ${
                            isLabHidden ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-500 border-slate-200'
                          }`}
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-700 font-bold block">{lang === 'bn' ? 'বিক্রয় (৳)' : 'Selling (৳)'}</span>
                        <input 
                          type="number" 
                          min="0"
                          disabled={isLabHidden}
                          value={labSelling}
                          onChange={(e) => handleLabSellingPriceChange(lab.id, Number(e.target.value))}
                          className={`w-full px-1.5 py-1 border rounded text-right text-xs font-bold outline-none ${
                            isLabHidden ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-200 focus:border-primary'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preset Images */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Preset Image or Image URL</label>
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="text" 
                value={formData.image || ''} 
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..." 
                className="flex-grow px-3 py-1.5 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, image: img.url })}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                    formData.image === img.url ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {img.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hide / Unhide Option */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
            <input 
              type="checkbox" 
              id="hide_test_checkbox" 
              checked={!!formData.isHidden}
              onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="hide_test_checkbox" className="cursor-pointer select-none">
              <span className="font-bold text-slate-900 block">{t.adminHideOptionLabel}</span>
              <span className="text-[11px] text-slate-600 block mt-0.5">{t.adminHideOptionDesc}</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-4 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="!py-2 !px-5 text-xs font-semibold">
              Save Test
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. DIAGNOSTIC CENTER MODAL (Add & Edit)
// ==========================================
interface LabModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lab: LabPartner) => void;
  editingLab: LabPartner | null;
}

export const LabFormModal: React.FC<LabModalProps> = ({
  lang,
  isOpen,
  onClose,
  onSave,
  editingLab
}) => {
  const [formData, setFormData] = useState<Partial<LabPartner>>({
    name: '',
    serviceCharge: 150,
    rating: 4.8,
    location: 'Dhaka, Bangladesh',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=150',
    discountBadge: '',
    accreditation: '',
    accentColor: '#0284c7',
    isHidden: false
  });

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (editingLab) {
      setFormData({ ...editingLab, isHidden: !!editingLab.isHidden });
    } else {
      setFormData({
        name: '',
        serviceCharge: 150,
        rating: 4.8,
        location: 'Dhaka, Bangladesh',
        logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=150',
        discountBadge: '',
        accreditation: '',
        accentColor: '#0284c7',
        isHidden: false
      });
    }
  }, [editingLab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const labToSave: LabPartner = {
      id: editingLab ? editingLab.id : `lab_${Date.now()}`,
      name: formData.name.trim(),
      serviceCharge: Number(formData.serviceCharge) || 0,
      rating: Number(formData.rating) || 4.8,
      location: formData.location || 'Dhaka, Bangladesh',
      logo: formData.logo || '',
      discountBadge: formData.discountBadge?.trim() || undefined,
      accreditation: formData.accreditation?.trim() || undefined,
      accentColor: formData.accentColor || '#0284c7',
      isHidden: !!formData.isHidden
    };

    onSave(labToSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="text-sky-600" size={20} />
            <h2 className="text-lg font-bold text-slate-900">
              {editingLab ? t.adminEditLab : t.adminAddNewLab}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* Live Logo Preview Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5">
            <LabLogo 
              name={formData.name || 'Lab'} 
              logo={formData.logo} 
              size="md" 
              accentColor={formData.accentColor} 
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">লোগো প্রিভিউ</span>
              <p className="font-bold text-slate-900 text-sm truncate">{formData.name || 'Center Name'}</p>
              <span className="text-[11px] text-slate-500 block truncate">{formData.location || 'Dhaka, Bangladesh'}</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Center Name *</label>
            <input 
              type="text" 
              required 
              value={formData.name || ''} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Popular Diagnostic Centre Ltd." 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Home Service Charge (৳) *</label>
              <input 
                type="number" 
                min="0"
                required 
                value={formData.serviceCharge !== undefined ? formData.serviceCharge : ''} 
                onChange={(e) => setFormData({ ...formData, serviceCharge: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rating (1.0 - 5.0)</label>
              <input 
                type="number" 
                step="0.1" 
                min="1" 
                max="5"
                value={formData.rating || 4.8} 
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount Badge (Optional)</label>
              <input 
                type="text" 
                value={formData.discountBadge || ''} 
                onChange={(e) => setFormData({ ...formData, discountBadge: e.target.value })}
                placeholder="e.g. ১০% ছাড় / 10% OFF" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Accreditation (Optional)</label>
              <input 
                type="text" 
                value={formData.accreditation || ''} 
                onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                placeholder="e.g. ISO 15189 / JCI Standard" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Location / Branches</label>
            <input 
              type="text" 
              value={formData.location || ''} 
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Dhanmondi, Shantinagar, Uttara, Dhaka" 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Logo URL or SVG Data URI</label>
            <input 
              type="text" 
              value={formData.logo || ''} 
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://... or data:image/svg+xml;..." 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs font-mono"
            />
          </div>

          {/* Hide / Unhide Option */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
            <input 
              type="checkbox" 
              id="hide_lab_checkbox" 
              checked={!!formData.isHidden}
              onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
              className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="hide_lab_checkbox" className="cursor-pointer select-none">
              <span className="font-bold text-slate-900 block">{t.adminHideLabOption}</span>
              <span className="text-[11px] text-slate-600 block mt-0.5">{t.adminHideLabDesc}</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-4 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="!py-2 !px-5 text-xs font-semibold">
              Save Center
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. ORDER / MANUAL BOOKING MODAL (Add & Edit)
// ==========================================
interface OrderModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: BookingHistoryItem) => void;
  editingOrder: BookingHistoryItem | null;
  labs: LabPartner[];
  tests: TestPackage[];
}

export const OrderFormModal: React.FC<OrderModalProps> = ({
  lang,
  isOpen,
  onClose,
  onSave,
  editingOrder,
  labs,
  tests
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 11:00 AM');
  const [selectedLabId, setSelectedLabId] = useState('');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [doctorName, setDoctorName] = useState('');
  const [status, setStatus] = useState<BookingStatus>('pending');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName || '');
      setCustomerPhone(editingOrder.customerPhone || '');
      setCustomerAddress(editingOrder.customerAddress || '');
      setDate(editingOrder.date || new Date().toISOString().slice(0, 10));
      setTime(editingOrder.time || '10:00 AM - 11:00 AM');
      setSelectedLabId(editingOrder.labId || labs[0]?.id || '');
      
      // Match test names to test IDs
      const matchingIds = tests
        .filter(t => editingOrder.testNames.includes(t.name))
        .map(t => t.id);
      setSelectedTestIds(matchingIds.length > 0 ? matchingIds : [tests[0]?.id]);
      setDoctorName(editingOrder.doctorName || '');
      setStatus(editingOrder.status || 'pending');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setDate(new Date().toISOString().slice(0, 10));
      setTime('10:00 AM - 11:00 AM');
      setSelectedLabId(labs[0]?.id || '');
      setSelectedTestIds(tests[0] ? [tests[0].id] : []);
      setDoctorName('');
      setStatus('pending');
    }
  }, [editingOrder, isOpen, labs, tests]);

  if (!isOpen) return null;

  const currentLab = labs.find(l => l.id === selectedLabId) || labs[0];
  const serviceCharge = currentLab?.serviceCharge || 0;

  // Calculate total
  const testsCost = selectedTestIds.reduce((sum, tid) => {
    const test = tests.find(t => t.id === tid);
    if (!test) return sum;
    const price = test.priceByLab?.[selectedLabId] ?? test.price;
    return sum + price;
  }, 0);
  const totalCost = testsCost + serviceCharge;

  const handleToggleTest = (tid: string) => {
    if (selectedTestIds.includes(tid)) {
      if (selectedTestIds.length > 1) {
        setSelectedTestIds(selectedTestIds.filter(id => id !== tid));
      }
    } else {
      setSelectedTestIds([...selectedTestIds, tid]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || selectedTestIds.length === 0) return;

    const selectedTestsList = tests.filter(t => selectedTestIds.includes(t.id));
    const bookingItems = selectedTestsList.map(t => {
      const finalPrice = t.priceByLab?.[selectedLabId] ?? t.price;
      const originalPrice = t.originalPriceByLab?.[selectedLabId] ?? t.originalPrice ?? finalPrice;
      const discount = Math.max(0, originalPrice - finalPrice);
      return {
        id: t.id,
        name: t.name,
        category: t.category,
        originalPrice,
        discountAmount: discount,
        finalPrice
      };
    });

    const mainRateSum = bookingItems.reduce((sum, item) => sum + item.originalPrice, 0);
    const discountSum = bookingItems.reduce((sum, item) => sum + item.discountAmount, 0);

    const orderToSave: BookingHistoryItem = {
      id: editingOrder ? editingOrder.id : generateUniqueOrderId(),
      customerName: customerName.trim() || 'Anonymous Patient',
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim() || 'Dhaka, Bangladesh',
      date: date || new Date().toISOString().slice(0, 10),
      time: time || '10:00 AM - 11:00 AM',
      labId: currentLab?.id,
      labName: currentLab?.name || 'Selected Diagnostic Center',
      testNames: selectedTestsList.map(t => t.name),
      items: bookingItems,
      subtotal: mainRateSum,
      totalDiscount: discountSum,
      collectionFee: serviceCharge,
      serviceCharge: serviceCharge,
      totalCost: totalCost,
      status: status,
      doctorName: doctorName.trim() || undefined,
      createdAt: editingOrder?.createdAt || new Date().toISOString()
    };

    onSave(orderToSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Receipt className="text-emerald-600" size={20} />
            <h2 className="text-lg font-bold text-slate-900">
              {editingOrder ? t.adminEditOrder : t.adminAddNewOrder}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Patient / Customer Name</label>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahim Ahmed" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
              <input 
                type="tel" 
                required 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="017XXXXXXXX" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Sample Collection Address</label>
            <input 
              type="text" 
              value={customerAddress} 
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="House, Road, Area, Dhaka" 
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Collection Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
              <select 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-white"
              >
                {(getStoredDateSlotConfig().slots || DEFAULT_TIME_SLOTS).map(slot => (
                  <option key={slot.id || slot.time} value={slot.time}>
                    {slot.time} {!slot.isActive ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Diagnostic Center Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Diagnostic Center</label>
            <select 
              value={selectedLabId} 
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-white font-semibold"
            >
              {labs.map(lab => (
                <option key={lab.id} value={lab.id}>
                  {lab.name} (Service Charge: ৳{lab.serviceCharge})
                </option>
              ))}
            </select>
          </div>

          {/* Tests Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Tests ({selectedTestIds.length} chosen)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
              {tests.map(test => {
                const isChecked = selectedTestIds.includes(test.id);
                const price = test.priceByLab?.[selectedLabId] ?? test.price;
                return (
                  <label 
                    key={test.id} 
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isChecked ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleToggleTest(test.id)}
                        className="rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="truncate">{test.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 flex-shrink-0">৳{price}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Doctor Reference</label>
              <input 
                type="text" 
                value={doctorName} 
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. Name (Optional)" 
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Order Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none bg-white font-semibold"
              >
                <option value="pending">⏳ Pending</option>
                <option value="confirmed">✓ Confirmed</option>
                <option value="collected">🩸 Sample Collected</option>
                <option value="processing">🔬 Lab Processing</option>
                <option value="completed">🎉 Completed</option>
                <option value="cancelled">✕ Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bill Calculation Box */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Calculated Bill (Tests + Home Fee)</span>
              <span className="text-xs text-slate-300">{selectedTestIds.length} tests + ৳{serviceCharge} home fee</span>
            </div>
            <span className="text-xl font-extrabold text-emerald-400">৳ {totalCost}</span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="!py-2 !px-4 text-xs font-semibold">
              Cancel
            </Button>
            <Button type="submit" className="!py-2 !px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700">
              Save Booking
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. ORDER DETAILS & INVOICE MODAL
// ==========================================
interface OrderDetailsModalProps {
  lang: Language;
  order: BookingHistoryItem | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: BookingStatus) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  lang,
  order,
  onClose,
  onUpdateStatus
}) => {
  if (!order) return null;

  const t = TRANSLATIONS[lang];

  const handlePrint = () => {
    printOrDownloadInvoice(order, lang);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invoice & Booking Details</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5 font-mono">Order {formatOrderId(order.id)}</h2>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 bg-primary hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Download / Print Official PDF Invoice"
            >
              <Download size={14} /> Official Invoice
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Patient Details */}
        <div className="py-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{order.customerName || 'Anonymous'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone Number</span>
              <span className="font-bold text-slate-900 text-sm">{order.customerPhone}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Sample Address</span>
              <span className="text-slate-700 font-medium">{order.customerAddress || 'Dhaka, Bangladesh'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Appointment Slot</span>
              <span className="text-slate-800 font-bold">{order.date} ({order.time})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Doctor Reference</span>
              <span className="text-slate-800 font-medium">{order.doctorName || 'Self / Not Specified'}</span>
            </div>
          </div>

          {/* Diagnostic Center */}
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-sky-600" />
              <div>
                <span className="text-[10px] text-sky-800 font-bold uppercase block">Diagnostic Center</span>
                <span className="font-bold text-slate-900">{order.labName}</span>
              </div>
            </div>
          </div>

          {/* Tests List & Itemized Breakdown */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold">
                {lang === 'bn' ? 'বুকিংকৃত টেস্ট ও ফি বিভাজন' : 'Booked Tests & Price Breakdown'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                {order.testNames.length} {lang === 'bn' ? 'টি টেস্ট' : 'Items'}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="grid grid-cols-12 bg-slate-100 text-slate-700 font-bold text-[10px] uppercase p-2 border-b border-slate-200">
                <div className="col-span-6">{lang === 'bn' ? 'টেস্টের বিবরণ' : 'Test Name'}</div>
                <div className="col-span-2 text-right">{lang === 'bn' ? 'মূল রেট' : 'Main Rate'}</div>
                <div className="col-span-2 text-right">{lang === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</div>
                <div className="col-span-2 text-right">{lang === 'bn' ? 'চূড়ান্ত রেট' : 'Final Rate'}</div>
              </div>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {(order.items && order.items.length > 0 ? order.items : order.testNames.map(tName => ({
                  name: tName,
                  originalPrice: Math.round(order.totalCost / (order.testNames.length || 1)),
                  discountAmount: 0,
                  finalPrice: Math.round(order.totalCost / (order.testNames.length || 1))
                }))).map((item, i) => (
                  <div key={i} className="grid grid-cols-12 p-2.5 items-center text-xs hover:bg-slate-50">
                    <div className="col-span-6 font-bold text-slate-800 truncate pr-1">
                      {item.name}
                    </div>
                    <div className="col-span-2 text-right text-slate-500 font-medium">
                      ৳ {item.originalPrice}
                    </div>
                    <div className="col-span-2 text-right">
                      {item.discountAmount > 0 ? (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-bold border border-amber-200">
                          -৳ {item.discountAmount}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px]">৳ ০</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right font-black text-slate-900">
                      ৳ {item.finalPrice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Home Sample Collection Fee & Total */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
              <span>{lang === 'bn' ? 'হোম স্যাম্পল কালেকশন ফি:' : 'Home Sample Collection Fee:'}</span>
              <span className={(order.collectionFee ?? order.serviceCharge ?? 0) === 0 ? 'text-emerald-400 font-bold' : 'text-white font-bold'}>
                {(order.collectionFee ?? order.serviceCharge ?? 0) === 0 ? (lang === 'bn' ? '৳ ০ (ফ্রি / Free)' : '৳ 0 (FREE)') : `৳ ${order.collectionFee ?? order.serviceCharge}`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  {lang === 'bn' ? 'সর্বমোট প্রদেয় বিল' : 'Total Payable Amount'}
                </span>
                <span className="text-xs text-slate-400">
                  {order.paymentMethod ? `Payment: ${order.paymentMethod.toUpperCase()}` : 'Cash on Sample Collection'}
                </span>
              </div>
              <span className="text-2xl font-black text-emerald-400">৳ {order.totalCost}</span>
            </div>
          </div>

          {/* Quick Status & Assigned Staff */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Staff</span>
              <span className="font-bold text-slate-800 text-xs">
                {order.assignedStaffName ? `${order.assignedStaffName} (${order.assignedStaffRole || 'Staff'})` : (lang === 'bn' ? 'অ্যাসাইন করা হয়নি' : 'Not assigned yet')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 text-xs">Status:</span>
              <select 
                value={order.status} 
                onChange={(e) => onUpdateStatus(order.id, e.target.value as BookingStatus)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-xs focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
              >
                <option value="pending">⏳ Pending</option>
                <option value="confirmed">✓ Confirmed</option>
                <option value="collected">🩸 Sample Collected</option>
                <option value="processing">🔬 Lab Processing</option>
                <option value="completed">🎉 Completed</option>
                <option value="cancelled">✕ Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. DELETE CONFIRMATION MODAL
// ==========================================
interface DeleteConfirmModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  lang,
  isOpen,
  onClose,
  onConfirm,
  title,
  description
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <Trash2 size={24} />
        </div>
        <h3 className="font-bold text-slate-900 text-lg mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{description}</p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. SERVICE FORM MODAL (Add & Edit Services)
// ==========================================

interface ServiceFormModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceItem) => void;
  editingService: ServiceItem | null;
}

const SERVICE_ICONS = [
  { id: 'Home', label: 'Home / Doorstep' },
  { id: 'FlaskConical', label: 'Lab Tube / Flask' },
  { id: 'FileText', label: 'Report / Prescription' },
  { id: 'Stethoscope', label: 'Doctor / Consultation' },
  { id: 'HeartPulse', label: 'ECG / Heart' },
  { id: 'ShieldCheck', label: 'Safety / Verified' },
  { id: 'Activity', label: 'Health / Monitor' },
  { id: 'PhoneCall', label: '24/7 Helpline' },
  { id: 'Clock', label: 'Fast / Express' }
];

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  lang,
  isOpen,
  onClose,
  onSave,
  editingService
}) => {
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    title: '',
    description: '',
    icon: 'Home',
    badge: '',
    isActive: true
  });

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (editingService) {
      setFormData({
        ...editingService,
        isActive: editingService.isActive !== false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        icon: 'Home',
        badge: '',
        isActive: true
      });
    }
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.description?.trim()) return;

    const serviceToSave: ServiceItem = {
      id: editingService ? editingService.id : `srv_${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      icon: formData.icon || 'Home',
      badge: formData.badge?.trim() || undefined,
      isActive: formData.isActive !== false
    };

    onSave(serviceToSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingService ? t.adminEditService : t.adminAddNewService}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'bn' ? 'হোমপেজ ও সার্ভিস সেকশনে প্রদর্শিত সেবা যোগ বা সম্পাদনা করুন' : 'Add or edit services shown on homepage & services section'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'সেবার নাম / শিরোনাম *' : 'Service Title *'}
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. হোম স্যাম্পল কালেকশন / Home Sample Collection" 
              value={formData.title || ''} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'সেবার বিবরণ *' : 'Service Description *'}
            </label>
            <textarea 
              rows={3}
              required
              placeholder="e.g. আমাদের দক্ষ মেডিকেল টেকনোলজিস্ট আপনার বাসায় এসে রক্ত পরীক্ষা ও স্যাম্পল কালেকশন করবেন..." 
              value={formData.description || ''} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'আইকন নির্বাচন করুন' : 'Select Icon'}
              </label>
              <select 
                value={formData.icon || 'Home'}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none bg-white"
              >
                {SERVICE_ICONS.map(ic => (
                  <option key={ic.id} value={ic.id}>{ic.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'স্পেশাল ব্যাজ (অপশনাল)' : 'Special Badge (Optional)'}
              </label>
              <input 
                type="text" 
                placeholder="e.g. মোস্ট পপুলার / 24/7" 
                value={formData.badge || ''} 
                onChange={e => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Active status checkbox */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                {lang === 'bn' ? 'সেবাটি হোমপেজে সক্রিয় রাখুন' : 'Keep Service Active on Website'}
              </span>
              <span className="text-[11px] text-slate-500">
                {lang === 'bn' ? 'আনচেক করলে এই সেবাটি গ্রাহকদের কাছে সাময়িকভাবে লুকানো থাকবে।' : 'Uncheck to temporarily hide this service from public view.'}
              </span>
            </div>
            <input 
              type="checkbox" 
              checked={formData.isActive !== false}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <Button type="submit" className="px-5 py-2 text-xs font-bold shadow-sm">
              <Check size={14} className="mr-1 inline" /> Save Service
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 7. PACKAGE FORM MODAL (Add & Edit)
// ==========================================
interface PackageModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: HealthPackage) => void;
  editingPackage: HealthPackage | null;
  labs: LabPartner[];
  tests?: TestPackage[];
  categories?: CategoryItem[];
  onAddNewCategory?: (category: CategoryItem) => void;
}

const PACKAGE_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600'
];

const BADGE_COLORS = [
  { label: 'Emerald Green', value: 'bg-emerald-600' },
  { label: 'Sky Blue', value: 'bg-sky-600' },
  { label: 'Amber Orange', value: 'bg-amber-600' },
  { label: 'Rose Red', value: 'bg-rose-600' },
  { label: 'Purple', value: 'bg-purple-600' },
  { label: 'Dark Slate', value: 'bg-slate-800' }
];

export const PackageFormModal: React.FC<PackageModalProps> = ({
  lang,
  isOpen,
  onClose,
  onSave,
  editingPackage,
  labs,
  tests = [],
  categories = [],
  onAddNewCategory
}) => {
  const [formData, setFormData] = useState<Partial<HealthPackage>>({
    name: '',
    tagline: '',
    description: '',
    category: 'Full Body',
    testCount: 4,
    includededTests: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar (FBS)', 'Lipid Profile', 'Serum Creatinine'],
    sampleType: 'Blood & Urine',
    fastingRequirement: '10-12 Hours Fasting',
    popularBadge: '',
    badgeColor: 'bg-emerald-600',
    turnaroundTime: '24 Hours',
    originalPrice: 2000,
    price: 1400,
    discountPercent: 30,
    image: PACKAGE_PRESET_IMAGES[0],
    priceByLab: {},
    originalPriceByLab: {},
    hiddenLabs: [],
    isHidden: false
  });

  const [testInput, setTestInput] = useState('');
  const [showLabPricing, setShowLabPricing] = useState(false);
  const [targetLabForPricing, setTargetLabForPricing] = useState<string>('ALL');
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null);

  // Quick Add Category State
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingPackage) {
      const origPrice = editingPackage.originalPrice !== undefined ? editingPackage.originalPrice : editingPackage.price;
      const discPct = editingPackage.discountPercent !== undefined 
        ? editingPackage.discountPercent 
        : (origPrice > editingPackage.price ? Math.round(((origPrice - editingPackage.price) / origPrice) * 100) : 0);

      setFormData({
        ...editingPackage,
        originalPrice: origPrice,
        price: editingPackage.price,
        discountPercent: discPct,
        testCount: editingPackage.testCount || editingPackage.includededTests?.length || 4,
        includededTests: editingPackage.includededTests ? [...editingPackage.includededTests] : [],
        priceByLab: editingPackage.priceByLab ? { ...editingPackage.priceByLab } : {},
        originalPriceByLab: editingPackage.originalPriceByLab ? { ...editingPackage.originalPriceByLab } : {},
        hiddenLabs: editingPackage.hiddenLabs ? [...editingPackage.hiddenLabs] : [],
        isHidden: !!editingPackage.isHidden
      });
    } else {
      const initialPrices: Record<string, number> = {};
      const initialOrigPrices: Record<string, number> = {};
      labs.forEach(l => {
        initialOrigPrices[l.id] = 2000;
        initialPrices[l.id] = 1400;
      });
      setFormData({
        name: '',
        tagline: '',
        description: '',
        category: 'Full Body',
        testCount: 4,
        includededTests: ['Complete Blood Count (CBC)', 'Fasting Blood Sugar (FBS)', 'Lipid Profile', 'Serum Creatinine'],
        sampleType: 'Blood & Urine',
        fastingRequirement: '10-12 Hours Fasting',
        popularBadge: '',
        badgeColor: 'bg-emerald-600',
        turnaroundTime: '24 Hours',
        originalPrice: 2000,
        price: 1400,
        discountPercent: 30,
        image: PACKAGE_PRESET_IMAGES[0],
        priceByLab: initialPrices,
        originalPriceByLab: initialOrigPrices,
        hiddenLabs: [],
        isHidden: false
      });
    }
  }, [editingPackage, isOpen]);

  if (!isOpen) return null;

  // Handlers for base pricing
  const handleOriginalPriceChange = (orig: number) => {
    const origVal = Math.max(0, orig);
    const discPct = formData.discountPercent || 0;
    const newPrice = discPct > 0 ? Math.round(origVal * (1 - discPct / 100)) : origVal;
    setFormData(prev => ({
      ...prev,
      originalPrice: origVal,
      price: newPrice
    }));
  };

  const handleDiscountPercentChange = (pct: number) => {
    const safePct = Math.min(100, Math.max(0, pct));
    const origVal = formData.originalPrice !== undefined ? formData.originalPrice : (formData.price || 0);
    const newPrice = Math.round(origVal * (1 - safePct / 100));
    setFormData(prev => ({
      ...prev,
      discountPercent: safePct,
      price: newPrice
    }));
  };

  const handlePriceChange = (sellingPrice: number) => {
    const saleVal = Math.max(0, sellingPrice);
    const origVal = formData.originalPrice !== undefined && formData.originalPrice > 0 ? formData.originalPrice : saleVal;
    const calculatedPct = origVal > saleVal ? Math.round(((origVal - saleVal) / origVal) * 100) : 0;
    setFormData(prev => ({
      ...prev,
      price: saleVal,
      originalPrice: origVal < saleVal ? saleVal : origVal,
      discountPercent: calculatedPct
    }));
  };

  const handleApplyBaseToSelected = () => {
    const baseOriginal = Number(formData.originalPrice) || Number(formData.price) || 0;
    const baseSelling = Number(formData.price) || 0;

    if (targetLabForPricing === 'ALL') {
      const updatedSelling: Record<string, number> = {};
      const updatedOriginal: Record<string, number> = {};
      labs.forEach(l => {
        updatedOriginal[l.id] = baseOriginal;
        updatedSelling[l.id] = baseSelling;
      });
      setFormData(prev => ({ 
        ...prev, 
        originalPriceByLab: updatedOriginal,
        priceByLab: updatedSelling 
      }));
      setApplySuccessMsg(lang === 'bn' ? 'সকল ল্যাবে এই রেট সফলভাবে সেট করা হয়েছে!' : 'Applied base rate to all partner labs!');
    } else {
      setFormData(prev => ({
        ...prev,
        originalPriceByLab: {
          ...(prev.originalPriceByLab || {}),
          [targetLabForPricing]: baseOriginal
        },
        priceByLab: {
          ...(prev.priceByLab || {}),
          [targetLabForPricing]: baseSelling
        }
      }));
      const targetLabObj = labs.find(l => l.id === targetLabForPricing);
      const labName = targetLabObj ? targetLabObj.name : targetLabForPricing;
      setApplySuccessMsg(lang === 'bn' ? `${labName} এ এই রেট সফলভাবে সেট করা হয়েছে!` : `Applied base rate to ${labName}!`);
    }

    setTimeout(() => {
      setApplySuccessMsg(null);
    }, 3000);
  };

  const handleLabSellingPriceChange = (labId: string, val: number) => {
    setFormData(prev => ({
      ...prev,
      priceByLab: {
        ...(prev.priceByLab || {}),
        [labId]: val
      }
    }));
  };

  const handleLabOriginalPriceChange = (labId: string, val: number) => {
    setFormData(prev => ({
      ...prev,
      originalPriceByLab: {
        ...(prev.originalPriceByLab || {}),
        [labId]: val
      }
    }));
  };

  const handleToggleLabHidden = (labId: string) => {
    setFormData(prev => {
      const currentHidden = prev.hiddenLabs || [];
      const isHidden = currentHidden.includes(labId);
      const updated = isHidden 
        ? currentHidden.filter(id => id !== labId)
        : [...currentHidden, labId];
      return { ...prev, hiddenLabs: updated };
    });
  };

  const handleAddIncludedTest = (testName?: string) => {
    const nameToAdd = (testName || testInput).trim();
    if (!nameToAdd) return;
    if (formData.includededTests?.includes(nameToAdd)) {
      setTestInput('');
      return;
    }
    const updated = [...(formData.includededTests || []), nameToAdd];
    setFormData(prev => ({
      ...prev,
      includededTests: updated,
      testCount: updated.length
    }));
    setTestInput('');
  };

  const handleRemoveIncludedTest = (index: number) => {
    const updated = (formData.includededTests || []).filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      includededTests: updated,
      testCount: updated.length
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert(lang === 'bn' ? 'দয়া করে প্যাকেজের নাম লিখুন' : 'Please enter package name');
      return;
    }

    const included = formData.includededTests || [];
    const count = formData.testCount || included.length || 1;
    const origPrice = Number(formData.originalPrice) || Number(formData.price) || 1000;
    const currentPrice = Number(formData.price) || 1000;
    const discount = origPrice > currentPrice ? Math.round(((origPrice - currentPrice) / origPrice) * 100) : (formData.discountPercent || 0);

    // Make sure lab prices exist or inherit base price
    const finalPriceByLab = { ...(formData.priceByLab || {}) };
    const finalOrigPriceByLab = { ...(formData.originalPriceByLab || {}) };
    labs.forEach(l => {
      if (finalPriceByLab[l.id] === undefined) finalPriceByLab[l.id] = currentPrice;
      if (finalOrigPriceByLab[l.id] === undefined) finalOrigPriceByLab[l.id] = origPrice;
    });

    const pkgToSave: HealthPackage = {
      id: editingPackage ? editingPackage.id : `pkg_${Date.now()}`,
      name: formData.name.trim(),
      tagline: formData.tagline?.trim() || '',
      description: formData.description?.trim() || `${count}টি গুরুত্বপূর্ণ স্বাস্থ্য পরীক্ষা অন্তর্ভুক্ত। হোম কালেকশন ও দ্রুত ডিজিটাল রিপোর্ট ডেলিভারি।`,
      category: formData.category || 'Full Body',
      testCount: count,
      includededTests: included,
      sampleType: formData.sampleType || 'Blood & Urine',
      fastingRequirement: formData.fastingRequirement || 'No Fasting Required',
      popularBadge: formData.popularBadge?.trim() || undefined,
      badgeColor: formData.badgeColor || 'bg-emerald-600',
      turnaroundTime: formData.turnaroundTime || '24 Hours',
      originalPrice: origPrice,
      price: currentPrice,
      discountPercent: discount,
      image: formData.image || PACKAGE_PRESET_IMAGES[0],
      priceByLab: finalPriceByLab,
      originalPriceByLab: finalOrigPriceByLab,
      hiddenLabs: formData.hiddenLabs || [],
      isHidden: !!formData.isHidden
    };

    onSave(pkgToSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="text-primary" size={20} />
              {editingPackage 
                ? (lang === 'bn' ? 'ডায়াগনস্টিক প্যাকেজ সম্পাদনা' : 'Edit Diagnostic Package') 
                : (lang === 'bn' ? 'নতুন ডায়াগনস্টিক প্যাকেজ তৈরি করুন' : 'Create New Diagnostic Package')}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'bn' ? 'প্যাকেজের টেস্ট সমূহ, মূল্য, ডিসকাউন্ট ও ডায়াগনস্টিক সেন্টারের রেট কনফিগার করুন' : 'Configure included tests, pricing, discount, and partner lab rates'}
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Package Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'প্যাকেজের নাম *' : 'Package Name *'}
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. কম্প্রিহেনসিভ মাস্টার হেলথ চেকআপ (১০টি টেস্ট)"
                value={formData.name || ''} 
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {lang === 'bn' ? 'ক্যাটাগরি (Category) *' : 'Category *'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewCat(!isAddingNewCat);
                    setCatError(null);
                  }}
                  className="text-[11px] font-bold text-primary hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                  <span>{isAddingNewCat ? (lang === 'bn' ? 'তালিকা দেখুন' : 'Select from list') : (lang === 'bn' ? '+ নতুন ক্যাটেগরি' : '+ New Category')}</span>
                </button>
              </div>

              {!isAddingNewCat ? (
                <select 
                  value={formData.category || 'Full Body'}
                  onChange={e => {
                    if (e.target.value === '__add_new__') {
                      setIsAddingNewCat(true);
                    } else {
                      setFormData(prev => ({ ...prev, category: e.target.value }));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none bg-white cursor-pointer"
                >
                  {categories.length > 0 ? (
                    categories.map(c => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name} {c.nameBn ? `(${c.nameBn})` : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Full Body">Full Body (সম্পূর্ণ শরীর)</option>
                      <option value="General">General (সাধারণ)</option>
                      <option value="Diabetes">Diabetes (ডায়াবেটিস)</option>
                      <option value="Heart">Heart (হার্ট ও কার্ডিয়াক)</option>
                      <option value="Thyroid">Thyroid (থাইরয়েড)</option>
                      <option value="Vitamin">Vitamin (ভিটামিন)</option>
                      <option value="Kidney">Kidney (কিডনি)</option>
                      <option value="Liver">Liver (লিভার)</option>
                      <option value="Women Health">Women Health (নারী স্বাস্থ্য)</option>
                      <option value="Senior">Senior (প্রবীণ স্বাস্থ্য)</option>
                    </>
                  )}
                  {formData.category && categories.length > 0 && !categories.some(c => c.name.toLowerCase() === formData.category?.toLowerCase()) && (
                    <option value={formData.category}>{formData.category} (Custom)</option>
                  )}
                  <option value="__add_new__" className="text-primary font-bold">
                    ➕ {lang === 'bn' ? '+ নতুন ক্যাটেগরি তৈরি করুন...' : '+ Create New Category...'}
                  </option>
                </select>
              ) : (
                /* Inline Quick Category Creator */
                <div className="p-3 bg-sky-50/80 rounded-xl border border-sky-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                      <Tag size={12} className="text-primary" />
                      {lang === 'bn' ? 'নতুন ক্যাটেগরি তৈরি ও নির্বাচন' : 'Create & Select Category'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(false)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {catError && (
                    <div className="text-[10px] text-red-600 font-bold bg-red-50 p-1.5 rounded-lg border border-red-200">
                      {catError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Name (e.g. Executive)" 
                      value={newCatName}
                      onChange={e => {
                        setNewCatName(e.target.value);
                        setCatError(null);
                      }}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-bold outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input 
                      type="text" 
                      placeholder="বাংলা নাম (অপশনাল)" 
                      value={newCatNameBn}
                      onChange={e => setNewCatNameBn(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(false)}
                      className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-200/60 rounded-lg font-semibold"
                    >
                      {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = newCatName.trim();
                        if (!trimmed) {
                          setCatError(lang === 'bn' ? 'ক্যাটেগরির ইংরেজি নাম দিন' : 'Enter category name');
                          return;
                        }
                        const newCatItem: CategoryItem = {
                          id: `cat_${Date.now()}`,
                          name: trimmed,
                          nameBn: newCatNameBn.trim() || undefined,
                          icon: 'Award',
                          color: 'teal',
                          order: (categories?.length || 0) + 1,
                          isHidden: false
                        };
                        if (onAddNewCategory) {
                          onAddNewCategory(newCatItem);
                        }
                        setFormData(prev => ({ ...prev, category: trimmed }));
                        setNewCatName('');
                        setNewCatNameBn('');
                        setIsAddingNewCat(false);
                      }}
                      className="px-3 py-1 bg-primary hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      <span>{lang === 'bn' ? 'যুক্ত করুন' : 'Save & Select'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tagline & Turnaround */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'ট্যাগলাইন / সাবটাইটেল' : 'Tagline / Short Summary'}
              </label>
              <input 
                type="text" 
                placeholder="e.g. হার্ট, লিভার, কিডনি ও ডায়াবেটিসের সামগ্রিক পরীক্ষা"
                value={formData.tagline || ''} 
                onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'রিপোর্ট ডেলিভারি সময়' : 'Turnaround Time'}
              </label>
              <input 
                type="text" 
                placeholder="e.g. 24 Hours / 12-24 Hours"
                value={formData.turnaroundTime || ''} 
                onChange={e => setFormData(prev => ({ ...prev, turnaroundTime: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'প্যাকেজের বিস্তারিত বিবরণ' : 'Package Full Description'}
            </label>
            <textarea 
              rows={2}
              placeholder="e.g. এই প্যাকেজটিতে শরীরের গুরুত্বপূর্ণ অঙ্গপ্রত্যঙ্গের কার্যকরী অবস্থা যাচাই করার জন্য প্রয়োজনীয় সকল রক্ত ও মূত্র পরীক্ষা অন্তর্ভুক্ত রয়েছে।"
              value={formData.description || ''} 
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {/* Included Tests Builder */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="text-emerald-600" size={15} />
                {lang === 'bn' ? `প্যাকেজের অন্তর্ভুক্ত টেস্টসমূহ (${formData.includededTests?.length || 0} টি)` : `Included Tests (${formData.includededTests?.length || 0})`}
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">
                {lang === 'bn' ? 'টেস্টের নাম লিখে যোগ করুন বা নিচের তালিকায় ক্লিক করুন' : 'Type or click below to add tests'}
              </span>
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={lang === 'bn' ? 'টেস্টের নাম লিখুন (যেমন: CBC, HbA1c, Serum Creatinine...)' : 'Enter test name (e.g. CBC, HbA1c...)'}
                value={testInput} 
                onChange={e => setTestInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddIncludedTest(); }}}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
              />
              <button
                type="button"
                onClick={() => handleAddIncludedTest()}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-sky-600 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> {lang === 'bn' ? 'যোগ করুন' : 'Add Test'}
              </button>
            </div>

            {/* Quick-add chips from existing tests if available */}
            {tests.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">
                  {lang === 'bn' ? 'জনপ্রিয় টেস্ট থেকে দ্রুত যুক্ত করুন:' : 'Quick add from available tests:'}
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                  {tests.slice(0, 15).map(t => {
                    const isAlreadyAdded = formData.includededTests?.includes(t.name);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={isAlreadyAdded}
                        onClick={() => handleAddIncludedTest(t.name)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                          isAlreadyAdded
                            ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary hover:bg-sky-50 cursor-pointer'
                        }`}
                      >
                        <Plus size={10} />
                        <span className="truncate max-w-[150px]">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List of Included Tests */}
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 bg-white/70 rounded-xl border border-slate-200/80">
              {formData.includededTests && formData.includededTests.length > 0 ? (
                formData.includededTests.map((testName, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs group hover:border-rose-200"
                  >
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>{testName}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveIncludedTest(idx)} 
                      className="ml-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 w-full">
                  {lang === 'bn' ? 'কোন টেস্ট যোগ করা হয়নি। উপরের বক্সে টেস্টের নাম লিখে যোগ করুন।' : 'No tests added yet. Type a test name above to include it in this package.'}
                </div>
              )}
            </div>
          </div>

          {/* Sample Type & Fasting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'নমুনা সংগ্রহের ধরন' : 'Sample Type'}
              </label>
              <input 
                type="text" 
                placeholder="Blood & Urine / Blood Sample"
                value={formData.sampleType || ''} 
                onChange={e => setFormData(prev => ({ ...prev, sampleType: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'ফাস্টিং নির্দেশিকা' : 'Fasting Requirement'}
              </label>
              <input 
                type="text" 
                placeholder="10-12 Hours Fasting / No Fasting"
                value={formData.fastingRequirement || ''} 
                onChange={e => setFormData(prev => ({ ...prev, fastingRequirement: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>
          </div>

          {/* BASE PRICING SECTION */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Percent size={14} className="text-primary" />
                {lang === 'bn' ? 'প্যাকেজের মূল মূল্য ও অফার রেট' : 'Base Package Pricing & Discount'}
              </span>

              {/* Lab Selector for Applying Base Pricing */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <label className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
                  {lang === 'bn' ? 'প্রযোজ্য ল্যাব:' : 'Apply to:'}
                </label>
                <select
                  value={targetLabForPricing}
                  onChange={e => setTargetLabForPricing(e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-primary cursor-pointer max-w-[190px] shadow-2xs"
                >
                  <option value="ALL">
                    {lang === 'bn' ? '🌟 সকল ল্যাব (All Labs)' : '🌟 All Labs'}
                  </option>
                  {labs.map(lab => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name}
                    </option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={handleApplyBaseToSelected}
                  className="text-[11px] font-bold text-white bg-primary hover:bg-sky-600 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  title={lang === 'bn' ? 'নির্বাচিত ল্যাবে এই রেট সেট করুন' : 'Apply rate to selected lab(s)'}
                >
                  <Check size={12} />
                  {lang === 'bn' ? 'সেট করুন' : 'Apply'}
                </button>
              </div>
            </div>

            {applySuccessMsg && (
              <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>{applySuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {lang === 'bn' ? 'অরিজিনাল রেগুলার মূল্য (৳)' : 'Original Regular Price (৳)'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.originalPrice ?? ''} 
                  onChange={e => handleOriginalPriceChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  {lang === 'bn' ? 'ছাড়ের শতাংশ (%)' : 'Discount (%)'}
                </label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={formData.discountPercent ?? ''} 
                  onChange={e => handleDiscountPercentChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-emerald-700 outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'প্যাকেজ অফার মূল্য (৳) *' : 'Discounted Package Price (৳) *'}
                </label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={formData.price ?? ''} 
                  onChange={e => handlePriceChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-black text-emerald-800 outline-none bg-white focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* DIAGNOSTIC CENTER SPECIFIC PRICING (LAB-WISE) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {lang === 'bn' ? 'ডায়াগনস্টিক সেন্টার অনুযায়ী প্যাকেজ মূল্য (Lab Rates)' : 'Diagnostic Center Rates (Lab-Wise Pricing)'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {lang === 'bn' ? 'নির্দিষ্ট ডায়াগনস্টিক সেন্টারের জন্য আলাদা প্যাকেজ মূল্য নির্ধারণ করুন' : 'Customize package offer rate per diagnostic partner'}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setShowLabPricing(!showLabPricing)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 cursor-pointer"
              >
                {showLabPricing ? (lang === 'bn' ? 'সংকোচন করুন' : 'Hide') : (lang === 'bn' ? 'বিস্তৃত করুন' : 'Expand')}
              </button>
            </div>

            {showLabPricing && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {labs.map(lab => {
                  const isLabHidden = formData.hiddenLabs?.includes(lab.id);
                  const labOriginal = formData.originalPriceByLab?.[lab.id] ?? formData.originalPrice ?? formData.price ?? 0;
                  const labSelling = formData.priceByLab?.[lab.id] ?? formData.price ?? 0;
                  const labDiscount = labOriginal > labSelling ? Math.round(((labOriginal - labSelling) / labOriginal) * 100) : 0;

                  return (
                    <div 
                      key={lab.id} 
                      className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                        isLabHidden 
                          ? 'bg-rose-50/50 border-rose-200 opacity-80' 
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-[160px]">
                        <span className={`text-xs font-bold ${isLabHidden ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                          {lab.name}
                        </span>
                        {labDiscount > 0 && !isLabHidden && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            {labDiscount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">Regular:</span>
                          <input 
                            type="number"
                            min="0"
                            disabled={isLabHidden}
                            value={labOriginal}
                            onChange={e => handleLabOriginalPriceChange(lab.id, Number(e.target.value))}
                            className={`w-20 px-2 py-1 rounded-lg border text-xs font-bold outline-none ${
                              isLabHidden ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-emerald-600 font-bold">Offer:</span>
                          <input 
                            type="number"
                            min="0"
                            disabled={isLabHidden}
                            value={labSelling}
                            onChange={e => handleLabSellingPriceChange(lab.id, Number(e.target.value))}
                            className={`w-20 px-2 py-1 rounded-lg border text-xs font-black outline-none ${
                              isLabHidden ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white border-emerald-300 text-emerald-800 focus:ring-1 focus:ring-emerald-500'
                            }`}
                          />
                        </div>

                        {/* Lab-Wise Hide/Show Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleLabHidden(lab.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                            isLabHidden
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                          title={isLabHidden ? (lang === 'bn' ? 'ল্যাবে এই প্যাকেজ দৃশ্যমান করুন' : 'Make visible for this lab') : (lang === 'bn' ? 'ল্যাবে এই প্যাকেজ হাইড করুন' : 'Hide from this lab')}
                        >
                          {isLabHidden ? (
                            <>
                              <EyeOff size={13} className="text-rose-600" />
                              <span>{lang === 'bn' ? 'হাইড' : 'Hidden'}</span>
                            </>
                          ) : (
                            <>
                              <Eye size={13} className="text-slate-500" />
                              <span>{lang === 'bn' ? 'দৃশ্যমান' : 'Visible'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Badges & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'হাইলাইট ব্যাজ (অপশনাল)' : 'Highlight Badge (Optional)'}
              </label>
              <input 
                type="text" 
                placeholder="e.g. Popular / 40% OFF / Best Seller"
                value={formData.popularBadge || ''} 
                onChange={e => setFormData(prev => ({ ...prev, popularBadge: e.target.value }))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'ব্যাজের রঙ' : 'Badge Color'}
              </label>
              <div className="flex items-center gap-2 pt-1">
                {BADGE_COLORS.map(col => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, badgeColor: col.value }))}
                    className={`w-6 h-6 rounded-full ${col.value} transition-transform cursor-pointer ${
                      formData.badgeColor === col.value ? 'scale-125 ring-2 ring-offset-2 ring-primary shadow-xs' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={col.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'প্যাকেজ কভার ছবি' : 'Package Cover Image URL'}
            </label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={formData.image || ''} 
                onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {PACKAGE_PRESET_IMAGES.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt="Preset" 
                  onClick={() => setFormData(prev => ({ ...prev, image: img }))}
                  className={`w-14 h-10 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                    formData.image === img ? 'border-primary scale-105 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Visibility status */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                {lang === 'bn' ? 'প্যাকেজটি গ্রাহকদের কাছে দৃশ্যমান রাখুন' : 'Keep Package Active & Visible'}
              </span>
              <span className="text-[11px] text-slate-500">
                {lang === 'bn' ? 'আনচেক করলে এই প্যাকেজটি ওয়েবসাইট ও অ্যাপে লুকানো থাকবে।' : 'Uncheck to temporarily hide this package from the customer catalog.'}
              </span>
            </div>
            <input 
              type="checkbox" 
              checked={!formData.isHidden}
              onChange={e => setFormData(prev => ({ ...prev, isHidden: !e.target.checked }))}
              className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button type="submit" className="px-5 py-2 text-xs font-bold shadow-sm cursor-pointer">
              <Check size={14} className="mr-1 inline" /> {lang === 'bn' ? 'প্যাকেজ সংরক্ষণ করুন' : 'Save Package'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 8. CATEGORY FORM MODAL (Add & Edit Categories)
// ==========================================
export interface CategoryFormModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CategoryItem, oldName?: string) => void;
  editingCategory: CategoryItem | null;
  existingCategoriesCount?: number;
}

const AVAILABLE_CATEGORY_ICONS = [
  { id: 'FlaskConical', label: 'Lab Flask / Tests' },
  { id: 'Droplet', label: 'Blood Drop / Diabetes' },
  { id: 'HeartPulse', label: 'Heart / Cardio' },
  { id: 'Activity', label: 'Activity / Thyroid' },
  { id: 'Zap', label: 'Energy / Vitamin' },
  { id: 'ShieldCheck', label: 'Shield / Kidney' },
  { id: 'Layers', label: 'Layers / Liver (LFT)' },
  { id: 'AlertCircle', label: 'Infection / Fever' },
  { id: 'Sparkles', label: 'Sparkles / Women Health' },
  { id: 'User', label: 'User / Senior Citizen' },
  { id: 'Award', label: 'Award / Full Body' },
  { id: 'Stethoscope', label: 'Stethoscope / Doctor' },
  { id: 'Pill', label: 'Pill / Medicine' },
  { id: 'Flame', label: 'Flame / Hormones' },
  { id: 'Tag', label: 'Tag / General' }
];

const AVAILABLE_CATEGORY_COLORS = [
  { id: 'blue', label: 'Sky Blue', hex: '#0284c7' },
  { id: 'rose', label: 'Rose Pink', hex: '#e11d48' },
  { id: 'red', label: 'Crimson Red', hex: '#dc2626' },
  { id: 'purple', label: 'Purple', hex: '#9333ea' },
  { id: 'amber', label: 'Amber Yellow', hex: '#d97706' },
  { id: 'cyan', label: 'Cyan Teal', hex: '#0891b2' },
  { id: 'emerald', label: 'Emerald Green', hex: '#059669' },
  { id: 'orange', label: 'Orange', hex: '#ea580c' },
  { id: 'pink', label: 'Pink', hex: '#db2777' },
  { id: 'indigo', label: 'Indigo', hex: '#4f46e5' },
  { id: 'teal', label: 'Teal', hex: '#0d9488' }
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  lang,
  isOpen,
  onClose,
  onSave,
  editingCategory,
  existingCategoriesCount = 0
}) => {
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('FlaskConical');
  const [color, setColor] = useState('blue');
  const [order, setOrder] = useState<number>(1);
  const [isHidden, setIsHidden] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || '');
      setNameBn(editingCategory.nameBn || '');
      setDescription(editingCategory.description || '');
      setIcon(editingCategory.icon || 'FlaskConical');
      setColor(editingCategory.color || 'blue');
      setOrder(editingCategory.order || 1);
      setIsHidden(!!editingCategory.isHidden);
      setErrorMsg(null);
    } else {
      setName('');
      setNameBn('');
      setDescription('');
      setIcon('FlaskConical');
      setColor('blue');
      setOrder(existingCategoriesCount + 1);
      setIsHidden(false);
      setErrorMsg(null);
    }
  }, [editingCategory, isOpen, existingCategoriesCount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে ক্যাটেগরির ইংরেজি নাম দিন।' : 'Please enter category name.');
      return;
    }

    const categoryToSave: CategoryItem = {
      id: editingCategory ? editingCategory.id : `cat_${Date.now()}`,
      name: cleanName,
      nameBn: nameBn.trim() || undefined,
      description: description.trim() || undefined,
      icon,
      color,
      order: Number(order) || 1,
      isHidden
    };

    onSave(categoryToSave, editingCategory ? editingCategory.name : undefined);
    onClose();
  };

  const SelectedIcon = CATEGORY_ICON_MAP[icon] || Tag;
  const selectedColorScheme = CATEGORY_COLOR_MAP[color] || CATEGORY_COLOR_MAP.blue;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${selectedColorScheme.bg} ${selectedColorScheme.text} border ${selectedColorScheme.border} flex items-center justify-center font-bold shadow-xs`}>
              <SelectedIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingCategory 
                  ? (lang === 'bn' ? 'ক্যাটেগরি সম্পাদনা (Edit Category)' : 'Edit Test Category') 
                  : (lang === 'bn' ? 'নতুন ক্যাটেগরি যোগ করুন (New Category)' : 'Add New Test Category')}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'bn' ? 'টেস্ট ও প্যাকেজের ক্যাটেগরি নাম, আইকন ও কালার কনফিগার করুন' : 'Configure category name, icon badge, description, and color theme'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl ${selectedColorScheme.bg} ${selectedColorScheme.text} border ${selectedColorScheme.border} flex items-center justify-center font-bold shadow-xs`}>
                <SelectedIcon size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {name || 'Category Name'} {nameBn ? `(${nameBn})` : ''}
                </span>
                <span className="text-[11px] text-slate-500 line-clamp-1">
                  {description || 'Category description will appear here...'}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-2xs">
              Preview
            </span>
          </div>

          {/* Name English & Bangla */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'ক্যাটেগরির নাম (English) *' : 'Category Name (English) *'}
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. Diabetes, Heart, Vitamin, Kidney" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Used for test/package filtering and URLs</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'ক্যাটেগরির নাম (বাংলা)' : 'Category Name (Bangla)'}
              </label>
              <input 
                type="text" 
                placeholder="যেমন: ডায়াবেটিস, হার্ট, ভিটামিন" 
                value={nameBn} 
                onChange={e => setNameBn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Displayed on Bengali customer interface</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'ক্যাটেগরির বিবরণ' : 'Description'}
            </label>
            <textarea 
              rows={2}
              placeholder="e.g. Fasting blood sugar, HbA1c, oral glucose tolerance, and insulin sensitivity profiles" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-white"
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {lang === 'bn' ? 'আইকন নির্বাচন করুন (Icon)' : 'Select Category Icon'}
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
              {AVAILABLE_CATEGORY_ICONS.map((item) => {
                const ItemIcon = CATEGORY_ICON_MAP[item.id] || Tag;
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'border-primary bg-sky-50 text-primary ring-2 ring-primary/20 scale-105 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                    title={item.label}
                  >
                    <ItemIcon size={18} />
                    <span className="text-[9px] truncate max-w-[55px]">{item.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Theme */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {lang === 'bn' ? 'কালার থিম (Color Theme)' : 'Badge Color Theme'}
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVAILABLE_CATEGORY_COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                    color === c.id 
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs scale-105' 
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Order & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'প্রদর্শনের ক্রম (Order / Priority)' : 'Display Order'}
              </label>
              <input 
                type="number" 
                min="1"
                max="99"
                value={order} 
                onChange={e => setOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-primary outline-none bg-white"
              />
            </div>

            <div className="flex items-center">
              <label className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between w-full cursor-pointer transition-colors mt-4">
                <span className="font-bold text-slate-700">
                  {lang === 'bn' ? 'ক্যাটেগরি সক্রিয় রাখুন' : 'Active & Visible'}
                </span>
                <input 
                  type="checkbox" 
                  checked={!isHidden}
                  onChange={e => setIsHidden(!e.target.checked)}
                  className="w-4 h-4 text-primary rounded accent-primary cursor-pointer"
                />
              </label>
            </div>
          </div>

          {editingCategory && (
            <div className="p-3 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl text-[11px] flex items-center gap-2">
              <CheckCircle2 size={15} className="flex-shrink-0 text-primary" />
              <span>
                {lang === 'bn' 
                  ? 'ক্যাটেগরির নাম পরিবর্তন করলে সম্পর্কিত টেস্ট ও প্যাকেজসমূহের ক্যাটেগরি স্বয়ংক্রিয়ভাবে আপডেট হবে।' 
                  : 'Updating this category name will automatically update all existing tests and packages under it.'}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" className="px-5 py-2 text-xs font-bold shadow-sm">
              <Check size={14} className="mr-1 inline" /> 
              <span>{editingCategory ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Category') : (lang === 'bn' ? 'ক্যাটেগরি সংরক্ষণ করুন' : 'Save Category')}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

