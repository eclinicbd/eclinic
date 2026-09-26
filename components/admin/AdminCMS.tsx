import React, { useState } from 'react';
import { Language, SiteSettings, ServiceItem, AboutStat, HowItWorksStep, NursingCareService } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  Building2, 
  Image as ImageIcon, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Eye, 
  EyeOff, 
  Globe, 
  MessageSquare, 
  ShieldCheck, 
  FlaskConical, 
  Activity, 
  HeartPulse, 
  Stethoscope, 
  Home, 
  Layers, 
  Save, 
  RotateCcw,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Tag,
  Search,
  UserCheck,
  Award
} from 'lucide-react';
import { Button } from '../Button';
import { 
  DEFAULT_SITE_SETTINGS_BN, 
  DEFAULT_SITE_SETTINGS_EN, 
  DEFAULT_HERO_IMAGES, 
  PRESET_GALLERY_IMAGES,
  DEFAULT_NURSING_SERVICES_BN,
  DEFAULT_NURSING_SERVICES_EN
} from '../../constants';

interface AdminCMSProps {
  lang: Language;
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
  onOpenAddService: () => void;
  onOpenEditService: (service: ServiceItem) => void;
  onDeleteService: (service: ServiceItem) => void;
  onToggleServiceActive: (serviceId: string) => void;
  showToast: (msg: string) => void;
}

const BRAND_ICONS = [
  { id: 'FlaskConical', label: 'Flask / Lab Tube', icon: FlaskConical },
  { id: 'Activity', label: 'Activity / Pulse', icon: Activity },
  { id: 'HeartPulse', label: 'Heart / Cardio', icon: HeartPulse },
  { id: 'ShieldCheck', label: 'Shield / Verified', icon: ShieldCheck },
  { id: 'Stethoscope', label: 'Stethoscope / Doctor', icon: Stethoscope }
];

export const AdminCMS: React.FC<AdminCMSProps> = ({
  lang,
  siteSettings,
  onUpdateSiteSettings,
  onOpenAddService,
  onOpenEditService,
  onDeleteService,
  onToggleServiceActive,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'sections' | 'branding' | 'about' | 'contact' | 'services' | 'nursing'>('hero');
  const [formData, setFormData] = useState<SiteSettings>({ ...siteSettings });
  const [newHeroImageUrl, setNewHeroImageUrl] = useState('');
  const [previewHeroIndex, setPreviewHeroIndex] = useState(0);

  // Nursing care modal & form state
  const [isNursingModalOpen, setIsNursingModalOpen] = useState(false);
  const [editingNursingService, setEditingNursingService] = useState<NursingCareService | null>(null);
  const [nursingFormData, setNursingFormData] = useState<Partial<NursingCareService>>({
    title: '',
    category: 'হোম নার্সিং',
    description: '',
    price: 1500,
    duration: '১২ ঘণ্টা / শিফট',
    badge: 'জনপ্রিয়',
    icon: 'HeartPulse',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
    features: [],
    isActive: true
  });
  const [nursingFeatureInput, setNursingFeatureInput] = useState('');

  const t = TRANSLATIONS[lang];

  // Sync if prop changes externally
  React.useEffect(() => {
    setFormData({ ...siteSettings });
  }, [siteSettings]);

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateSiteSettings(formData);
    showToast(t.adminSaveSiteSuccess);
  };

  // ==========================================
  // HERO IMAGE HANDLERS
  // ==========================================
  const heroImages = formData.heroImages && formData.heroImages.length > 0 
    ? formData.heroImages 
    : [...DEFAULT_HERO_IMAGES];

  const handleAddHeroImage = () => {
    if (!newHeroImageUrl.trim()) return;
    const updated = [...heroImages, newHeroImageUrl.trim()];
    setFormData({ ...formData, heroImages: updated });
    setNewHeroImageUrl('');
    showToast(lang === 'bn' ? 'নতুন হিরো ইমেজ যোগ করা হয়েছে' : 'New hero slider image added');
  };

  const handleAddPresetImage = (url: string) => {
    if (heroImages.includes(url)) {
      showToast(lang === 'bn' ? 'এই ছবিটি ইতিমধ্যে স্লাইডারে আছে' : 'This image is already in the slider');
      return;
    }
    const updated = [...heroImages, url];
    setFormData({ ...formData, heroImages: updated });
    showToast(lang === 'bn' ? 'ছবিটি স্লাইডারে যোগ করা হয়েছে' : 'Preset image added to slider');
  };

  const handleRemoveHeroImage = (index: number) => {
    if (heroImages.length <= 1) {
      showToast(lang === 'bn' ? 'কমপক্ষে একটি ইমেজ স্লাইডারে থাকতে হবে' : 'At least one slider image is required');
      return;
    }
    const updated = heroImages.filter((_, idx) => idx !== index);
    setFormData({ ...formData, heroImages: updated });
    if (previewHeroIndex >= updated.length) {
      setPreviewHeroIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleMoveHeroImage = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= heroImages.length) return;
    const updated = [...heroImages];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setFormData({ ...formData, heroImages: updated });
    setPreviewHeroIndex(newIdx);
  };

  const handleResetHeroImages = () => {
    setFormData({ ...formData, heroImages: [...DEFAULT_HERO_IMAGES] });
    setPreviewHeroIndex(0);
    showToast(lang === 'bn' ? 'ডিফল্ট হিরো ইমেজগুলো রিস্টোর করা হয়েছে' : 'Default hero images restored');
  };

  // ==========================================
  // HOW IT WORKS STEPS HANDLER
  // ==========================================
  const howItWorksSteps = formData.howItWorksSteps && formData.howItWorksSteps.length > 0
    ? formData.howItWorksSteps
    : (lang === 'en' ? DEFAULT_SITE_SETTINGS_EN.howItWorksSteps! : DEFAULT_SITE_SETTINGS_BN.howItWorksSteps!);

  const handleUpdateStep = (index: number, field: keyof HowItWorksStep, val: string) => {
    const updated = [...howItWorksSteps];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: val };
      setFormData({ ...formData, howItWorksSteps: updated });
    }
  };

  // ==========================================
  // ABOUT STAT HANDLERS
  // ==========================================
  const handleAddStat = () => {
    const currentStats = formData.aboutStats || [];
    const newStats: AboutStat[] = [...currentStats, { label: lang === 'bn' ? 'নতুন অর্জন' : 'New Milestone', value: '100+' }];
    setFormData({ ...formData, aboutStats: newStats });
  };

  const handleUpdateStat = (index: number, field: 'label' | 'value', val: string) => {
    const currentStats = [...(formData.aboutStats || [])];
    if (currentStats[index]) {
      currentStats[index] = { ...currentStats[index], [field]: val };
      setFormData({ ...formData, aboutStats: currentStats });
    }
  };

  const handleRemoveStat = (index: number) => {
    const currentStats = (formData.aboutStats || []).filter((_, i) => i !== index);
    setFormData({ ...formData, aboutStats: currentStats });
  };

  const handleResetToDefault = () => {
    const defaults = lang === 'en' ? DEFAULT_SITE_SETTINGS_EN : DEFAULT_SITE_SETTINGS_BN;
    setFormData({ ...defaults });
    onUpdateSiteSettings(defaults);
    showToast(t.adminResetSuccess);
  };

  // ==========================================
  // NURSING CARE SERVICES HANDLERS
  // ==========================================
  const nursingServicesList: NursingCareService[] = formData.nursingServices && formData.nursingServices.length > 0
    ? formData.nursingServices
    : (lang === 'en' ? DEFAULT_NURSING_SERVICES_EN : DEFAULT_NURSING_SERVICES_BN);

  const handleOpenAddNursing = () => {
    setEditingNursingService(null);
    setNursingFormData({
      title: '',
      category: lang === 'bn' ? 'হোম নার্সিং' : 'Home Nursing',
      description: '',
      price: 1500,
      duration: lang === 'bn' ? '১২ ঘণ্টা / শিফট' : '12 Hrs / Shift',
      badge: lang === 'bn' ? 'জনপ্রিয়' : 'Popular',
      icon: 'HeartPulse',
      imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
      features: [
        lang === 'bn' ? 'নিয়মিত ওষুধ সেবন ও ভাইটাল সাইন মনিটরিং' : 'Medication & vital signs monitoring',
        lang === 'bn' ? 'ক্যাথেটার, ইনজেকশন ও ড্রেসিং সেবা' : 'Catheter, injection & dressing care'
      ],
      isActive: true
    });
    setNursingFeatureInput('');
    setIsNursingModalOpen(true);
  };

  const handleOpenEditNursing = (service: NursingCareService) => {
    setEditingNursingService(service);
    setNursingFormData({
      ...service,
      features: service.features ? [...service.features] : []
    });
    setNursingFeatureInput('');
    setIsNursingModalOpen(true);
  };

  const handleSaveNursingService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nursingFormData.title?.trim()) {
      showToast(lang === 'bn' ? 'সার্ভিসের নাম দিন' : 'Service title is required');
      return;
    }

    let updatedList: NursingCareService[];
    if (editingNursingService) {
      updatedList = nursingServicesList.map(s => 
        s.id === editingNursingService.id 
          ? ({ ...s, ...nursingFormData, id: s.id } as NursingCareService)
          : s
      );
    } else {
      const newService: NursingCareService = {
        id: `nurs_${Date.now()}`,
        title: nursingFormData.title || '',
        category: nursingFormData.category || (lang === 'bn' ? 'হোম নার্সিং' : 'Home Nursing'),
        description: nursingFormData.description || '',
        price: Number(nursingFormData.price) || 0,
        duration: nursingFormData.duration || '',
        badge: nursingFormData.badge || '',
        icon: nursingFormData.icon || 'HeartPulse',
        imageUrl: nursingFormData.imageUrl || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
        features: nursingFormData.features || [],
        isActive: nursingFormData.isActive !== false
      };
      updatedList = [...nursingServicesList, newService];
    }

    const newSettings = { ...formData, nursingServices: updatedList };
    setFormData(newSettings);
    onUpdateSiteSettings(newSettings);
    setIsNursingModalOpen(false);
    showToast(editingNursingService 
      ? (lang === 'bn' ? 'নার্সিং সেবা আপডেট করা হয়েছে' : 'Nursing service updated')
      : (lang === 'bn' ? 'নতুন নার্সিং সেবা যুক্ত করা হয়েছে' : 'New nursing service added')
    );
  };

  const handleDeleteNursing = (id: string) => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে এই নার্সিং সেবাটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this nursing service?')) {
      const updatedList = nursingServicesList.filter(s => s.id !== id);
      const newSettings = { ...formData, nursingServices: updatedList };
      setFormData(newSettings);
      onUpdateSiteSettings(newSettings);
      showToast(lang === 'bn' ? 'নার্সিং সেবা মুছে ফেলা হয়েছে' : 'Nursing service removed');
    }
  };

  const handleToggleNursingActive = (id: string) => {
    const updatedList = nursingServicesList.map(s => 
      s.id === id ? { ...s, isActive: s.isActive === false ? true : false } : s
    );
    const newSettings = { ...formData, nursingServices: updatedList };
    setFormData(newSettings);
    onUpdateSiteSettings(newSettings);
    showToast(lang === 'bn' ? 'স্ট্যাটাস পরিবর্তন করা হয়েছে' : 'Status updated');
  };

  const handleMoveNursing = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= nursingServicesList.length) return;
    const updated = [...nursingServicesList];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    const newSettings = { ...formData, nursingServices: updated };
    setFormData(newSettings);
    onUpdateSiteSettings(newSettings);
  };

  const handleResetNursingDefaults = () => {
    const defaultNursing = lang === 'en' ? DEFAULT_NURSING_SERVICES_EN : DEFAULT_NURSING_SERVICES_BN;
    const newSettings = { ...formData, nursingServices: [...defaultNursing] };
    setFormData(newSettings);
    onUpdateSiteSettings(newSettings);
    showToast(lang === 'bn' ? 'ডিফল্ট নার্সিং সেবাগুলো রিস্টোর করা হয়েছে' : 'Default nursing services restored');
  };

  const handleAddNursingFeature = () => {
    if (!nursingFeatureInput.trim()) return;
    const currentFeats = nursingFormData.features || [];
    setNursingFormData({
      ...nursingFormData,
      features: [...currentFeats, nursingFeatureInput.trim()]
    });
    setNursingFeatureInput('');
  };

  const handleRemoveNursingFeature = (featIndex: number) => {
    const currentFeats = (nursingFormData.features || []).filter((_, idx) => idx !== featIndex);
    setNursingFormData({
      ...nursingFormData,
      features: currentFeats
    });
  };

  const SelectedBrandIcon = BRAND_ICONS.find(i => i.id === (formData.logoIcon || 'FlaskConical'))?.icon || FlaskConical;

  return (
    <div className="space-y-6">
      {/* CMS Header & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold uppercase tracking-wider">
              Website CMS
            </span>
            <h1 className="text-xl font-bold text-slate-900">{t.adminSiteCMS}</h1>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {lang === 'bn' 
              ? 'হোমপেজের ইমেজ স্লাইডার, হিরো ব্যানার, সকল সেকশনের টেক্সট, লোগো এবং যোগাযোগের তথ্য পরিবর্তন করুন।' 
              : 'Customize homepage hero slider images, all section texts, branding logo, and contact info.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reset site content to default"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <Button 
            onClick={() => handleSaveAll()}
            className="px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-100"
          >
            <Save size={14} />
            <span>Save All Changes</span>
          </Button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/70 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('hero')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'hero'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon size={15} className={activeSubTab === 'hero' ? 'text-primary' : ''} />
          <span>{lang === 'bn' ? 'হিরো ও ইমেজ স্লাইডার' : 'Hero & Images'}</span>
          <span className="px-1.5 py-0.2 bg-sky-100 text-primary rounded-full text-[10px]">{heroImages.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sections')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'sections'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders size={15} className={activeSubTab === 'sections' ? 'text-primary' : ''} />
          <span>{lang === 'bn' ? 'হোমপেজ সেকশন টেক্সট' : 'Homepage Section Texts'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('branding')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'branding'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles size={15} className={activeSubTab === 'branding' ? 'text-primary' : ''} />
          <span>{t.adminBrandingTitle}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('about')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'about'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={15} className={activeSubTab === 'about' ? 'text-primary' : ''} />
          <span>{t.adminAboutTitle}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('contact')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'contact'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Phone size={15} className={activeSubTab === 'contact' ? 'text-primary' : ''} />
          <span>{t.adminContactTitle}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('services')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'services'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers size={15} className={activeSubTab === 'services' ? 'text-primary' : ''} />
          <span>{t.adminServices} ({formData.services?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('nursing')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'nursing'
              ? 'bg-white text-rose-600 shadow-sm border border-rose-200'
              : 'text-slate-600 hover:text-rose-600'
          }`}
        >
          <HeartPulse size={15} className={activeSubTab === 'nursing' ? 'text-rose-600' : ''} />
          <span>{lang === 'bn' ? 'নার্সিং ও কেয়ার' : 'Nursing & Care'} ({nursingServicesList.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION & IMAGE SLIDER MANAGEMENT                                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'hero' && (
        <div className="space-y-6">
          {/* Main Hero Form & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Text & Image Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ImageIcon size={16} className="text-primary" />
                  <span>{lang === 'bn' ? 'হিরো ব্যানার টেক্সট ও সেটিংস' : 'Hero Banner Headline & Texts'}</span>
                </h2>
                <span className="text-[11px] text-slate-400">Home Page Top</span>
              </div>

              {/* Hero Badge */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'হিরো ব্যাজ টেক্সট (Badge)' : 'Top Badge Text'}
                </label>
                <input
                  type="text"
                  value={formData.heroBadge || ''}
                  onChange={e => setFormData({ ...formData, heroBadge: e.target.value })}
                  placeholder="e.g. 🚀 বাংলাদেশের বিশ্বস্ত হোম স্যাম্পল কালেকশন সার্ভিস"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Main Title & Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'প্রধান শিরোনাম ১ম অংশ (Title Part 1)' : 'Main Title Part 1'}
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitle || ''}
                    onChange={e => setFormData({ ...formData, heroTitle: e.target.value })}
                    placeholder="e.g. ঘরে বসেই বিশ্বস্ত ল্যাব টেস্ট ও"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'হাইলাইট শিরোনাম ২য় অংশ (Highlighted Color)' : 'Highlighted Title Part 2'}
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitleHighlight || ''}
                    onChange={e => setFormData({ ...formData, heroTitleHighlight: e.target.value })}
                    placeholder="e.g. হোম স্যাম্পল কালেকশন"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sky-300 bg-sky-50/40 text-xs font-bold text-primary focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Hero Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'হিরো বিস্তারিত বিবরণ (Hero Description)' : 'Hero Description / Subtitle'}
                </label>
                <textarea
                  rows={3}
                  value={formData.heroDesc || ''}
                  onChange={e => setFormData({ ...formData, heroDesc: e.target.value })}
                  placeholder="e.g. পপুলার, ল্যাবএইড, বারডেমসহ দেশের শীর্ষ ডায়াগনস্টিক সেন্টার থেকে..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none leading-relaxed"
                />
              </div>

              {/* Button Texts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'প্রধান বাটন টেক্সট (CTA Button)' : 'Primary Button CTA Text'}
                  </label>
                  <input
                    type="text"
                    value={formData.heroBtnBook || ''}
                    onChange={e => setFormData({ ...formData, heroBtnBook: e.target.value })}
                    placeholder="e.g. টেস্ট বুক করুন"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'হোয়াটসঅ্যাপ হেল্পলাইন নম্বর' : 'WhatsApp Number for Quick Chat'}
                  </label>
                  <input
                    type="text"
                    value={formData.contactWhatsApp || ''}
                    onChange={e => setFormData({ ...formData, contactWhatsApp: e.target.value })}
                    placeholder="01700000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={() => handleSaveAll()} className="px-5 py-2.5 text-xs font-bold">
                  <Check size={14} className="mr-1 inline" /> {lang === 'bn' ? 'হিরো টেক্সট সংরক্ষণ করুন' : 'Save Hero Texts'}
                </Button>
              </div>
            </div>

            {/* Right: Live Interactive Hero Preview (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={14} /> Live Hero Preview
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Slide {previewHeroIndex + 1} of {heroImages.length}
                  </span>
                </div>

                {/* Simulated Mini Hero Card */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                  {/* Badge */}
                  <span className="inline-block py-0.5 px-2 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-400/30">
                    {formData.heroBadge || '🚀 Trusted Home Diagnostics'}
                  </span>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-white leading-tight">
                    {formData.heroTitle || 'ঘরে বসেই বিশ্বস্ত ল্যাব টেস্ট'} <br />
                    <span className="text-sky-400">{formData.heroTitleHighlight || 'হোম স্যাম্পল কালেকশন'}</span>
                  </h3>

                  {/* Desc */}
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {formData.heroDesc || 'পপুলার, ল্যাবএইড, বারডেমসহ দেশের শীর্ষ ডায়াগনস্টিক সেন্টার থেকে রক্ত সংগ্রহ...'}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="px-3 py-1.5 bg-sky-500 text-white text-[11px] font-bold rounded-lg shadow-sm">
                      {formData.heroBtnBook || 'টেস্ট বুক করুন'}
                    </div>
                    {formData.contactWhatsApp && (
                      <div className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold rounded-lg flex items-center gap-1">
                        <MessageSquare size={11} /> WhatsApp
                      </div>
                    )}
                  </div>

                  {/* Active Hero Image Thumbnail Box */}
                  <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-600 mt-2 bg-slate-900">
                    <img 
                      src={heroImages[previewHeroIndex] || heroImages[0]} 
                      alt="Hero preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                      {heroImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPreviewHeroIndex(i)}
                          className={`h-1.5 rounded-full transition-all ${i === previewHeroIndex ? 'w-4 bg-sky-400' : 'w-1.5 bg-white/60'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/80 text-[11px] text-slate-400">
                {lang === 'bn' 
                  ? 'এই পরিবর্তনগুলো হোম পেজে রিয়েল-টাইমে আপডেট হবে এবং রোগী ও গ্রাহকরা দেখতে পাবেন।' 
                  : 'Changes are synced live to the homepage banner for all visiting patients.'}
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* HERO SLIDER IMAGES MANAGER                 */}
          {/* ========================================== */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ImageIcon size={16} className="text-primary" />
                  <span>{lang === 'bn' ? 'হোমপেজ ইমেজ স্লাইডার গ্যালারি' : 'Homepage Hero Slider Images'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {heroImages.length} {lang === 'bn' ? 'টি ছবি' : 'images'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {lang === 'bn' 
                    ? 'হোম পেজের হিরো ব্যানারে প্রদর্শিত স্লাইডার ছবিগুলো যোগ করুন, পরিবর্তন করুন বা ক্রম সাজান।' 
                    : 'Add, remove, reorder, or swap images cycling on the homepage hero section.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetHeroImages}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset to Default Images</span>
              </button>
            </div>

            {/* Add Custom Image URL Form */}
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                {lang === 'bn' ? 'নতুন ছবির লিঙ্ক (Image URL) যোগ করুন:' : 'Add Custom Hero Image URL:'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={newHeroImageUrl}
                  onChange={e => setNewHeroImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://your-server.com/banner.jpg"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-primary outline-none"
                />
                <Button 
                  type="button" 
                  onClick={handleAddHeroImage} 
                  className="px-4 py-2 text-xs font-bold whitespace-nowrap flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> <span>{lang === 'bn' ? 'স্লাইডারে যোগ করুন' : 'Add to Slider'}</span>
                </Button>
              </div>
            </div>

            {/* Current Active Slider Images Grid */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-3">
                {lang === 'bn' ? 'বর্তমান সক্রিয় স্লাইডার ইমেজসমূহ (সাজান ও ডিলিট করুন):' : 'Active Slider Images (Reorder & Remove):'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {heroImages.map((imgUrl, index) => (
                  <div 
                    key={index}
                    className={`relative rounded-2xl border overflow-hidden bg-slate-50 flex flex-col justify-between transition-all group ${
                      index === previewHeroIndex ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-slate-200'
                    }`}
                  >
                    {/* Index Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-extrabold backdrop-blur-xs">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        type="button"
                        onClick={() => handleRemoveHeroImage(index)}
                        className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 shadow-sm transition-colors"
                        title="Remove image from slider"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Image Thumbnail */}
                    <div 
                      onClick={() => setPreviewHeroIndex(index)}
                      className="h-32 w-full overflow-hidden cursor-pointer bg-slate-200 relative"
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Slide ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                    </div>

                    {/* Controls Footer */}
                    <div className="p-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setPreviewHeroIndex(index)}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        {index === previewHeroIndex ? '● Previewing' : 'Preview'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveHeroImage(index, 'up')}
                          className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                          title="Move Left / Earlier"
                        >
                          <ArrowUp size={13} className="-rotate-90" />
                        </button>
                        <button
                          type="button"
                          disabled={index === heroImages.length - 1}
                          onClick={() => handleMoveHeroImage(index, 'down')}
                          className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded"
                          title="Move Right / Later"
                        >
                          <ArrowDown size={13} className="-rotate-90" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick 1-Click Preset Medical Lab Images Gallery */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>{lang === 'bn' ? 'প্রিসেট মেডিকেল ও ল্যাব ইমেজ গ্যালারি (১-ক্লিক সিলেকশন)' : 'Curated Medical Lab Image Library (1-Click Add)'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'bn' 
                      ? 'নিচের যেকোনো স্ট্যান্ডার্ড মেডিকেল ছবিতে ক্লিক করে সহজেই স্লাইডারে যুক্ত করুন।' 
                      : 'Click any photo below to instantly add high-definition clinical visuals to your slider.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                {PRESET_GALLERY_IMAGES.map((preset, idx) => {
                  const isAlreadyAdded = heroImages.includes(preset.url);
                  return (
                    <div 
                      key={idx}
                      onClick={() => !isAlreadyAdded && handleAddPresetImage(preset.url)}
                      className={`relative rounded-xl overflow-hidden border p-1 cursor-pointer transition-all ${
                        isAlreadyAdded 
                          ? 'border-emerald-400 bg-emerald-50/40 opacity-75 cursor-default' 
                          : 'border-slate-200 hover:border-primary hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      title={preset.label}
                    >
                      <div className="h-16 w-full rounded-lg overflow-hidden relative">
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          className="w-full h-full object-cover"
                        />
                        {isAlreadyAdded && (
                          <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center text-white">
                            <CheckCircle2 size={16} className="text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      <span className="block text-[9px] font-semibold text-slate-700 truncate mt-1 text-center">
                        {preset.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button for Hero Tab */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button onClick={() => handleSaveAll()} className="px-6 py-2.5 text-xs font-bold shadow-md shadow-sky-100">
                <Check size={14} className="mr-1.5 inline" /> {lang === 'bn' ? 'সকল স্লাইডার ও ইমেজ পরিবর্তন সেভ করুন' : 'Save Slider & Image Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HOMEPAGE SECTIONS TEXT MANAGEMENT                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'sections' && (
        <div className="space-y-6">
          {/* Section 1: Partner Diagnostic Centers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building2 size={16} className="text-primary" />
                <span>{lang === 'bn' ? '১. অনুমোদিত ডায়াগনস্টিক পার্টনার্স সেকশন' : '1. Diagnostic Lab Partners Section'}</span>
              </h3>
              <span className="text-[11px] text-slate-400">Home Page Section 2</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ব্যাজ টেক্সট (Badge)' : 'Badge Text'}
                </label>
                <input
                  type="text"
                  value={formData.partnerBadge || ''}
                  onChange={e => setFormData({ ...formData, partnerBadge: e.target.value })}
                  placeholder="e.g. বিশ্বস্ত ডায়াগনস্টিক নেটওয়ার্ক"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন শিরোনাম (Title)' : 'Section Heading'}
                </label>
                <input
                  type="text"
                  value={formData.partnerTitle || ''}
                  onChange={e => setFormData({ ...formData, partnerTitle: e.target.value })}
                  placeholder="e.g. আমাদের অনুমোদিত ডায়াগনস্টিক পার্টনার্স"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন বিবরণ (Description)' : 'Subtitle / Description'}
                </label>
                <input
                  type="text"
                  value={formData.partnerDesc || ''}
                  onChange={e => setFormData({ ...formData, partnerDesc: e.target.value })}
                  placeholder="e.g. ল্যাব সিলেক্ট করে সহজেই টেস্ট ও ক্যাটালগ ব্রাউজ করুন"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বাটন টেক্সট (View All Button)' : 'View All Button Text'}
                </label>
                <input
                  type="text"
                  value={formData.partnerBtnText || ''}
                  onChange={e => setFormData({ ...formData, partnerBtnText: e.target.value })}
                  placeholder="e.g. সব দেখুন"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Popular Diagnostic Tests */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FlaskConical size={16} className="text-primary" />
                <span>{lang === 'bn' ? '২. জনপ্রিয় ডায়াগনস্টিক টেস্ট সেকশন' : '2. Popular Diagnostic Tests Section'}</span>
              </h3>
              <span className="text-[11px] text-slate-400">Home Page Section 3</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ব্যাজ টেক্সট (Badge)' : 'Badge Text'}
                </label>
                <input
                  type="text"
                  value={formData.popularTestsBadge || ''}
                  onChange={e => setFormData({ ...formData, popularTestsBadge: e.target.value })}
                  placeholder="e.g. জনপ্রিয় স্বাস্থ্য পরীক্ষা"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন শিরোনাম (Title)' : 'Section Heading'}
                </label>
                <input
                  type="text"
                  value={formData.popularTestsTitle || ''}
                  onChange={e => setFormData({ ...formData, popularTestsTitle: e.target.value })}
                  placeholder="e.g. জনপ্রিয় ডায়াগনস্টিক টেস্টসমূহ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন বিবরণ (Description)' : 'Subtitle / Description'}
                </label>
                <input
                  type="text"
                  value={formData.popularTestsDesc || ''}
                  onChange={e => setFormData({ ...formData, popularTestsDesc: e.target.value })}
                  placeholder="e.g. একক টেস্টের বিস্তারিত তালিকা। অর্ডার করুন এবং দক্ষ স্যাম্পল কালেক্টরকে বাসায় ডাকুন।"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বাটন টেক্সট (Browse Tests Button)' : 'Button Text'}
                </label>
                <input
                  type="text"
                  value={formData.popularTestsBtnText || ''}
                  onChange={e => setFormData({ ...formData, popularTestsBtnText: e.target.value })}
                  placeholder="e.g. সকল টেস্ট দেখুন (১০০+)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Essential Health Packages */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Tag size={16} className="text-amber-500" />
                <span>{lang === 'bn' ? '৩. হেলথ প্যাকেজ স্লাইডার সেকশন' : '3. Essential Health Packages Section'}</span>
              </h3>
              <span className="text-[11px] text-slate-400">Home Page Section 4</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ব্যাজ টেক্সট (Badge)' : 'Badge Text'}
                </label>
                <input
                  type="text"
                  value={formData.packagesBadge || ''}
                  onChange={e => setFormData({ ...formData, packagesBadge: e.target.value })}
                  placeholder="e.g. বিশেষ সাশ্রয়ী প্যাকেজ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন শিরোনাম (Title)' : 'Section Heading'}
                </label>
                <input
                  type="text"
                  value={formData.packagesTitle || ''}
                  onChange={e => setFormData({ ...formData, packagesTitle: e.target.value })}
                  placeholder="e.g. এসেনশিয়াল হোম ডায়াগনস্টিক প্যাকেজ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন বিবরণ (Description)' : 'Subtitle / Description'}
                </label>
                <input
                  type="text"
                  value={formData.packagesDesc || ''}
                  onChange={e => setFormData({ ...formData, packagesDesc: e.target.value })}
                  placeholder="e.g. একক টেস্টের চেয়ে প্যাকেজে খরচ বাঁচান ৪০% পর্যন্ত..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বাটন টেক্সট (View All Packages)' : 'View All Button Text'}
                </label>
                <input
                  type="text"
                  value={formData.packagesBtnText || ''}
                  onChange={e => setFormData({ ...formData, packagesBtnText: e.target.value })}
                  placeholder="e.g. সকল প্যাকেজ দেখুন"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Nursing & Care Services Section Texts */}
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-rose-50 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HeartPulse size={16} className="text-rose-500" />
                <span>{lang === 'bn' ? '৪. হোম নার্সিং ও পেশেন্ট কেয়ার সেকশন' : '4. Home Nursing & Patient Care Section'}</span>
              </h3>
              <span className="text-[11px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-md">Home Page (Below Packages)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ব্যাজ টেক্সট (Badge)' : 'Badge Text'}
                </label>
                <input
                  type="text"
                  value={formData.nursingBadge || ''}
                  onChange={e => setFormData({ ...formData, nursingBadge: e.target.value })}
                  placeholder="e.g. বিশেষ হোম কেয়ার সেবা"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন শিরোনাম (Title)' : 'Section Heading'}
                </label>
                <input
                  type="text"
                  value={formData.nursingTitle || ''}
                  onChange={e => setFormData({ ...formData, nursingTitle: e.target.value })}
                  placeholder="e.g. নার্সিং ও পেশেন্ট কেয়ার সার্ভিস"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-rose-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন বিবরণ (Description)' : 'Subtitle / Description'}
                </label>
                <input
                  type="text"
                  value={formData.nursingDesc || ''}
                  onChange={e => setFormData({ ...formData, nursingDesc: e.target.value })}
                  placeholder="e.g. রেজিস্টার্ড নার্স ও দক্ষ ব্রাদারদের সরাসরি আপনার বাসায়..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? '২৪/৭ নার্সিং হটলাইন নম্বর' : '24/7 Nursing Helpline Number'}
                </label>
                <input
                  type="text"
                  value={formData.nursingHotline || ''}
                  onChange={e => setFormData({ ...formData, nursingHotline: e.target.value })}
                  placeholder="e.g. 09612-889900"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'নার্সিং হোয়াটসঅ্যাপ নম্বর' : 'Nursing WhatsApp Number'}
                </label>
                <input
                  type="text"
                  value={formData.nursingWhatsApp || ''}
                  onChange={e => setFormData({ ...formData, nursingWhatsApp: e.target.value })}
                  placeholder="e.g. 01700-112233"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none"
                />
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => setActiveSubTab('nursing')}
                  variant="outline" 
                  className="w-full text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  <HeartPulse size={14} className="mr-1.5 inline" /> {lang === 'bn' ? 'নার্সিং সার্ভিসসমূহ ম্যানেজ করুন' : 'Manage Nursing Services List'} &rarr;
                </Button>
              </div>
            </div>
          </div>

          {/* Section 5: How It Works in 3 Steps */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span>{lang === 'bn' ? '৪. কিভাবে সেবা নিবেন (৩টি ধাপ)' : '4. How It Works (3 Steps Workflow)'}</span>
              </h3>
              <span className="text-[11px] text-slate-400">Home Page Steps</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'সেকশন মূল শিরোনাম' : 'Section Main Heading'}
              </label>
              <input
                type="text"
                value={formData.howItWorksTitle || ''}
                onChange={e => setFormData({ ...formData, howItWorksTitle: e.target.value })}
                placeholder="e.g. সহজ ৩টি ধাপে ঘরে বসে ল্যাব টেস্ট"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {howItWorksSteps.map((step, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold">
                    Step {idx + 1}
                  </span>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'bn' ? 'ধাপের শিরোনাম (Title)' : 'Step Title'}
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => handleUpdateStep(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'bn' ? 'ধাপের বিবরণ (Description)' : 'Step Description'}
                    </label>
                    <textarea
                      rows={2}
                      value={step.desc}
                      onChange={e => handleUpdateStep(idx, 'desc', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Services Header Texts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                <span>{lang === 'bn' ? '৫. স্বাস্থ্যসেবা সমূহ সেকশন হেডার' : '5. Healthcare Services Section Header'}</span>
              </h3>
              <span className="text-[11px] text-slate-400">Home Page Services Header</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ব্যাজ টেক্সট (Badge)' : 'Badge Text'}
                </label>
                <input
                  type="text"
                  value={formData.servicesBadge || ''}
                  onChange={e => setFormData({ ...formData, servicesBadge: e.target.value })}
                  placeholder="e.g. আমাদের সেবাসমূহ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন শিরোনাম (Title)' : 'Section Heading'}
                </label>
                <input
                  type="text"
                  value={formData.servicesTitle || ''}
                  onChange={e => setFormData({ ...formData, servicesTitle: e.target.value })}
                  placeholder="e.g. আমাদের স্বাস্থ্যসেবা সমূহ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেকশন বিবরণ (Description)' : 'Subtitle / Description'}
                </label>
                <input
                  type="text"
                  value={formData.servicesDesc || ''}
                  onChange={e => setFormData({ ...formData, servicesDesc: e.target.value })}
                  placeholder="e.g. ঘরে বসেই উন্নত মানের ডায়াগনস্টিক ও ল্যাব টেস্ট সেবা নিশ্চিত করতে..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={() => handleSaveAll()} className="px-6 py-2.5 text-xs font-bold shadow-md shadow-sky-100">
              <Check size={14} className="mr-1.5 inline" /> {lang === 'bn' ? 'সকল সেকশন টেক্সট সেভ করুন' : 'Save Section Texts'}
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BRANDING & LOGO TAB                                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'branding' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Editor form (2 cols) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles size={16} className="text-primary" />
                <span>{lang === 'bn' ? 'ব্র্যান্ডিং ও লোগো কনফিগারেশন' : 'Brand Identity & Logo Configuration'}</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ওয়েবসাইটের নাম (Website Title) *' : 'Website Name / Brand Title *'}
                </label>
                <input
                  type="text"
                  value={formData.siteName || ''}
                  onChange={e => setFormData({ ...formData, siteName: e.target.value })}
                  placeholder="e.g. LabHome BD"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ট্যাগলাইন বা স্লোগান (Tagline)' : 'Tagline / Slogan'}
                </label>
                <input
                  type="text"
                  value={formData.siteTagline || ''}
                  onChange={e => setFormData({ ...formData, siteTagline: e.target.value })}
                  placeholder="e.g. বাংলাদেশের বিশ্বস্ত হোম স্যাম্পল কালেকশন প্ল্যাটফর্ম"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Logo Options */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  {lang === 'bn' ? 'কাস্টম ইমেজ লোগো URL (ঐচ্ছিক)' : 'Custom Logo Image URL (Optional)'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.logoUrl || ''}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                  />
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: '' })}
                      className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs hover:bg-slate-200 font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'bn' 
                    ? 'ইমেজ লোগো খালি রাখলে নিচের নির্বাচিত মেডিকেল আইকনটি লোগো হিসেবে প্রদর্শিত হবে।' 
                    : 'If left empty, the selected medical icon below will be rendered as the official brand logo.'}
                </p>
              </div>

              {/* Medical Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {lang === 'bn' ? 'লোগো আইকন নির্বাচন করুন (যখন ইমেজ নেই)' : 'Choose Logo Icon (When image not provided)'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BRAND_ICONS.map(item => {
                    const IconComp = item.icon;
                    const isSelected = (formData.logoIcon || 'FlaskConical') === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setFormData({ ...formData, logoIcon: item.id })}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          isSelected 
                            ? 'border-primary bg-sky-50/70 text-primary font-bold shadow-xs' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                          <IconComp size={16} />
                        </div>
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3">
                <Button onClick={() => handleSaveAll()} className="px-5 py-2 text-xs font-bold">
                  <Check size={14} className="mr-1 inline" /> Save Branding
                </Button>
              </div>
            </div>

            {/* Live Preview Box (1 col) */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-4">
                  Live Header Preview
                </span>

                {/* Simulated Header Card */}
                <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex items-center gap-2.5">
                    {formData.logoUrl ? (
                      <img 
                        src={formData.logoUrl} 
                        alt="Logo" 
                        className="w-9 h-9 object-contain rounded-lg bg-white p-1"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="bg-primary p-2 rounded-xl text-white shadow-xs">
                        <SelectedBrandIcon size={20} />
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-base text-white block leading-tight">
                        {formData.siteName || 'LabHome BD'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                        {formData.siteTagline || 'Home Diagnostic Service'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2 text-xs text-slate-300">
                  <p className="font-semibold text-white">Contact Pill on Top Bar:</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    <Phone size={13} />
                    <span>{formData.contactHotline || formData.contactPhone || '01700-000000'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400">
                এই পরিবর্তনগুলো হোমপেজের হেডার, ফুটার এবং ব্রাউজার মেটা তথ্যে তাৎক্ষণিকভাবে প্রতিফলিত হবে।
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ABOUT US TAB                                                           */}
      {/* ========================================================================= */}
      {activeSubTab === 'about' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText size={16} className="text-primary" />
            <span>{lang === 'bn' ? 'আমাদের সম্পর্কে (About Us) কনটেন্ট' : 'About Us & Company Story Content'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'সেকশন শিরোনাম (Section Title)' : 'Section Heading'}
              </label>
              <input
                type="text"
                value={formData.aboutTitle || ''}
                onChange={e => setFormData({ ...formData, aboutTitle: e.target.value })}
                placeholder="আমাদের সম্পর্কে (About Us)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {lang === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (Short Description)' : 'Short Summary'}
              </label>
              <input
                type="text"
                value={formData.aboutDescription || ''}
                onChange={e => setFormData({ ...formData, aboutDescription: e.target.value })}
                placeholder="বাংলাদেশের সবচেয়ে নির্ভরযোগ্য ডিজিটাল হেলথকেয়ার প্ল্যাটফর্ম..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'bn' ? 'কোম্পানি মিশন ও গল্প (Company Mission / Story)' : 'Company Mission / Story Detailed'}
            </label>
            <textarea
              rows={4}
              value={formData.aboutStory || ''}
              onChange={e => setFormData({ ...formData, aboutStory: e.target.value })}
              placeholder="২০২৪ সাল থেকে আমাদের দক্ষ মেডিকেল টেকনোলজিস্ট ও শীর্ষ ডায়াগনস্টিক পার্টনারদের মাধ্যমে..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none leading-relaxed"
            />
          </div>

          {/* Achievement Statistics */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  {lang === 'bn' ? 'অর্জন ও পরিসংখ্যান (Statistics / Highlights)' : 'Key Achievements & Stats'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {lang === 'bn' ? 'হোমপেজে প্রদর্শিত মূল পরিসংখ্যানসমূহ' : 'Key statistics highlighted on the homepage'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStat}
                className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> <span>Add Stat</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {(formData.aboutStats || []).map((stat, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 relative group">
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove Stat"
                  >
                    <Trash2 size={13} />
                  </button>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Value (e.g. 50,000+)
                  </label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={e => handleUpdateStat(idx, 'value', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white mb-2"
                  />
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Label (e.g. টেস্ট সম্পন্ন)
                  </label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={e => handleUpdateStat(idx, 'label', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button onClick={() => handleSaveAll()} className="px-5 py-2 text-xs font-bold">
              <Check size={14} className="mr-1 inline" /> Save About Us
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONTACT & HELPLINES TAB                                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'contact' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone size={16} className="text-primary" />
            <span>{lang === 'bn' ? 'যোগাযোগ ও হেল্পলাইন তথ্য' : 'Contact Details, Helplines & Location'}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                <span>{lang === 'bn' ? 'অফিস / ল্যাব ঠিকানা (Address) *' : 'Contact / Office Address *'}</span>
              </label>
              <input
                type="text"
                value={formData.contactAddress || ''}
                onChange={e => setFormData({ ...formData, contactAddress: e.target.value })}
                placeholder="বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা - ১২০৫"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>{lang === 'bn' ? 'সাপোর্ট ইমেইল (Support Email) *' : 'Support Email *'}</span>
              </label>
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="support@labhomebd.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                <span>{lang === 'bn' ? 'প্রধান ফোন নম্বর (Primary Phone) *' : 'Primary Phone Number *'}</span>
              </label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="01700-000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone size={13} className="text-emerald-500" />
                <span>{lang === 'bn' ? 'হটলাইন নম্বর (Hotline)' : 'Hotline Number'}</span>
              </label>
              <input
                type="text"
                value={formData.contactHotline || ''}
                onChange={e => setFormData({ ...formData, contactHotline: e.target.value })}
                placeholder="09612-000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-emerald-600" />
                <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপ নম্বর (WhatsApp)' : 'WhatsApp Number (without +)'}</span>
              </label>
              <input
                type="text"
                value={formData.contactWhatsApp || ''}
                onChange={e => setFormData({ ...formData, contactWhatsApp: e.target.value })}
                placeholder="01700000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500" />
                <span>{lang === 'bn' ? 'সার্ভিস ও কল সেন্টারের সময়সূচী' : 'Working / Support Hours'}</span>
              </label>
              <input
                type="text"
                value={formData.workingHours || ''}
                onChange={e => setFormData({ ...formData, workingHours: e.target.value })}
                placeholder="সকাল ৭:০০ টা - রাত ১০:০০ টা (প্রতিদিন)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Quick Contact Test Actions */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-700 block mb-2">
              {lang === 'bn' ? 'সরাসরি টেস্ট করুন:' : 'Direct Link Testing:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {formData.contactPhone && (
                <a
                  href={`tel:${formData.contactPhone}`}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-primary text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone size={12} className="text-primary" /> Call {formData.contactPhone}
                </a>
              )}
              {formData.contactWhatsApp && (
                <a
                  href={`https://wa.me/88${formData.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageSquare size={12} className="text-emerald-600" /> WhatsApp Link <ExternalLink size={11} />
                </a>
              )}
              {formData.contactEmail && (
                <a
                  href={`mailto:${formData.contactEmail}`}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Mail size={12} className="text-slate-500" /> Email Support
                </a>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button onClick={() => handleSaveAll()} className="px-5 py-2 text-xs font-bold">
              <Check size={14} className="mr-1 inline" /> Save Contact Details
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SERVICES MANAGEMENT TAB                                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'services' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                {lang === 'bn' ? 'সকল স্বাস্থ্যসেবার তালিকা' : 'Manage Healthcare Services'}
              </h2>
              <p className="text-slate-500 text-xs">
                {lang === 'bn' 
                  ? 'হোমপেজের সার্ভিস সেকশনে নতুন সেবা যোগ করুন, সম্পাদনা করুন বা সাময়িকভাবে বন্ধ রাখুন।' 
                  : 'Add, edit, reorder or toggle services shown to patients on the website.'}
              </p>
            </div>

            <Button onClick={onOpenAddService} className="text-xs font-bold flex items-center gap-1.5">
              <Plus size={14} /> <span>{t.adminAddNewService}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(formData.services || []).map((service) => {
              const isActive = service.isActive !== false;
              return (
                <div 
                  key={service.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all ${
                    isActive ? 'border-slate-200 hover:border-sky-300' : 'border-slate-200/60 bg-slate-50/70 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-primary flex items-center justify-center font-bold">
                        {service.icon === 'Home' && <Home size={20} />}
                        {service.icon === 'FlaskConical' && <FlaskConical size={20} />}
                        {service.icon === 'FileText' && <FileText size={20} />}
                        {service.icon === 'Stethoscope' && <Stethoscope size={20} />}
                        {service.icon === 'HeartPulse' && <HeartPulse size={20} />}
                        {service.icon === 'ShieldCheck' && <ShieldCheck size={20} />}
                        {service.icon === 'Activity' && <Activity size={20} />}
                        {service.icon === 'PhoneCall' && <Phone size={20} />}
                        {service.icon === 'Clock' && <Clock size={20} />}
                        {!['Home', 'FlaskConical', 'FileText', 'Stethoscope', 'HeartPulse', 'ShieldCheck', 'Activity', 'PhoneCall', 'Clock'].includes(service.icon) && (
                          <Layers size={20} />
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {service.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {service.badge}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1">{service.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onToggleServiceActive(service.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                    >
                      {isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{isActive ? 'Hide' : 'Show'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenEditService(service)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit Service"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteService(service)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. NURSING & CARE MANAGEMENT TAB                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'nursing' && (
        <div className="space-y-6">
          {/* Header & Quick Action Bar */}
          <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
                <HeartPulse size={14} />
                <span>{lang === 'bn' ? 'হোম নার্সিং ও পেশেন্ট কেয়ার CMS' : 'Nursing & Home Care CMS'}</span>
              </div>
              <h2 className="font-extrabold text-xl sm:text-2xl text-white">
                {lang === 'bn' ? 'নার্সিং ও পেশেন্ট কেয়ার সার্ভিস ম্যানেজমেন্ট' : 'Nursing & Patient Care Management'}
              </h2>
              <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-2xl">
                {lang === 'bn'
                  ? 'হোমপেজের "Essential Packages"-এর নিচে থাকা নার্সিং সার্ভিস কার্ডসমূহ যোগ, সম্পাদনা, মূল্য পরিবর্তন ও সক্রিয়/নিষ্ক্রিয় করুন।'
                  : 'Manage nursing packages, shift rates, features checklist, active visibility, and hotline support shown on the homepage.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetNursingDefaults}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/20"
                title="Reset to default nursing services"
              >
                <RotateCcw size={13} /> {lang === 'bn' ? 'ডিফল্ট রিস্টোর' : 'Restore Defaults'}
              </button>

              <Button
                type="button"
                onClick={handleOpenAddNursing}
                className="px-4 py-2 text-xs font-bold bg-white text-rose-600 hover:bg-rose-50 shadow-md shadow-rose-900/20 flex items-center gap-1.5"
              >
                <Plus size={15} /> {lang === 'bn' ? 'নতুন নার্সিং সার্ভিস যোগ করুন' : 'Add Nursing Service'}
              </Button>
            </div>
          </div>

          {/* Nursing Section Texts Quick Editor Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                <Sliders size={16} className="text-rose-500" />
                <span>{lang === 'bn' ? 'হোমপেজ নার্সিং সেকশন টেক্সট ও কন্টাক্ট ইনফো' : 'Homepage Section Headers & Direct Contacts'}</span>
              </h3>
              <Button onClick={() => handleSaveAll()} className="!py-1.5 !px-3.5 !text-xs font-bold">
                <Check size={13} className="mr-1 inline" /> {lang === 'bn' ? 'হেডার সেভ করুন' : 'Save Headers'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ব্যাজ (Badge)' : 'Badge'}
                </label>
                <input
                  type="text"
                  value={formData.nursingBadge || ''}
                  onChange={e => setFormData({ ...formData, nursingBadge: e.target.value })}
                  placeholder="e.g. বিশেষ হোম কেয়ার সেবা"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'মূল শিরোনাম (Title)' : 'Main Heading'}
                </label>
                <input
                  type="text"
                  value={formData.nursingTitle || ''}
                  onChange={e => setFormData({ ...formData, nursingTitle: e.target.value })}
                  placeholder="e.g. নার্সিং ও পেশেন্ট কেয়ার সার্ভিস"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিবরণ (Description)' : 'Subtitle'}
                </label>
                <input
                  type="text"
                  value={formData.nursingDesc || ''}
                  onChange={e => setFormData({ ...formData, nursingDesc: e.target.value })}
                  placeholder="e.g. রেজিস্টার্ড নার্স ও দক্ষ ব্রাদারদের সরাসরি আপনার বাসায়..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? '২৪/৭ নার্সিং হটলাইন' : '24/7 Helpline'}
                </label>
                <input
                  type="text"
                  value={formData.nursingHotline || ''}
                  onChange={e => setFormData({ ...formData, nursingHotline: e.target.value })}
                  placeholder="e.g. 09612-889900"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'নার্সিং হোয়াটসঅ্যাপ' : 'WhatsApp Number'}
                </label>
                <input
                  type="text"
                  value={formData.nursingWhatsApp || ''}
                  onChange={e => setFormData({ ...formData, nursingWhatsApp: e.target.value })}
                  placeholder="e.g. 01700-112233"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>

          {/* Nursing Services Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {nursingServicesList.map((service, index) => {
              const isActive = service.isActive !== false;
              return (
                <div
                  key={service.id}
                  className={`bg-white rounded-2xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                    isActive
                      ? 'border-slate-200 hover:border-rose-300 hover:shadow-md'
                      : 'border-slate-200/60 bg-slate-50/70 opacity-60'
                  }`}
                >
                  <div>
                    {/* Card Cover Photo & Badges */}
                    <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                          {service.category}
                        </span>
                        {service.badge && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-xs">
                            {service.badge}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold backdrop-blur-md ${
                          isActive ? 'bg-emerald-500/90 text-white' : 'bg-slate-700/90 text-white'
                        }`}>
                          {isActive ? 'Active' : 'Hidden'}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                        <div>
                          <div className="text-lg font-black leading-none">
                            ৳{service.price.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-rose-200 font-medium mt-0.5">
                            {service.duration}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-3">
                      <h4 className="font-extrabold text-slate-900 text-sm">{service.title}</h4>
                      {service.description && (
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                      )}

                      {/* Checklist Features */}
                      {service.features && service.features.length > 0 && (
                        <ul className="space-y-1 pt-1 border-t border-slate-100">
                          {service.features.slice(0, 3).map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                              <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feat}</span>
                            </li>
                          ))}
                          {service.features.length > 3 && (
                            <li className="text-[10px] font-semibold text-rose-600">
                              +{service.features.length - 3} {lang === 'bn' ? 'আরও সুবিধা...' : 'more features...'}
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Controls (Active toggle, Re-order, Edit, Delete) */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleNursingActive(service.id)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      {isActive ? <EyeOff size={13} className="text-slate-400" /> : <Eye size={13} className="text-emerald-600" />}
                      <span>{isActive ? (lang === 'bn' ? 'হাইড' : 'Hide') : (lang === 'bn' ? 'দেখান' : 'Show')}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveNursing(index, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer rounded"
                        title="Move Earlier"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={index === nursingServicesList.length - 1}
                        onClick={() => handleMoveNursing(index, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer rounded"
                        title="Move Later"
                      >
                        <ArrowDown size={13} />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditNursing(service)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Service"
                      >
                        <Edit size={14} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteNursing(service.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NURSING SERVICE ADD / EDIT MODAL                                         */}
      {/* ========================================================================= */}
      {isNursingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingNursingService 
                      ? (lang === 'bn' ? 'নার্সিং সেবা সম্পাদনা করুন' : 'Edit Nursing Service')
                      : (lang === 'bn' ? 'নতুন নার্সিং সেবা যোগ করুন' : 'Add New Nursing Service')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'সার্ভিসের বিবরণ, রেট ও সুবিধাসমূহ প্রদান করুন' : 'Fill in service name, pricing, duration, features and cover photo'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNursingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNursingService} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'সার্ভিসের নাম *' : 'Service Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={nursingFormData.title || ''}
                    onChange={e => setNursingFormData({ ...nursingFormData, title: e.target.value })}
                    placeholder="e.g. হোম নার্সিং কেয়ার (১২ ঘণ্টা)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ক্যাটাগরি / ধরন' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={nursingFormData.category || ''}
                    onChange={e => setNursingFormData({ ...nursingFormData, category: e.target.value })}
                    placeholder="e.g. হোম নার্সিং / বয়স্ক সেবা / ফিজিওথেরাপি"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ফি / মূল্য (টাকায়)' : 'Price / Fee (BDT)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={nursingFormData.price || 0}
                    onChange={e => setNursingFormData({ ...nursingFormData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'সময়কাল / শিফট বিবরণ' : 'Duration / Shift Info'}
                  </label>
                  <input
                    type="text"
                    value={nursingFormData.duration || ''}
                    onChange={e => setNursingFormData({ ...nursingFormData, duration: e.target.value })}
                    placeholder="e.g. ১২ ঘণ্টা / শিফট অথবা ২৪ ঘণ্টা"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'হাইলাইট ব্যাজ (অপশনাল)' : 'Badge Label (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={nursingFormData.badge || ''}
                    onChange={e => setNursingFormData({ ...nursingFormData, badge: e.target.value })}
                    placeholder="e.g. জনপ্রিয় / সর্বাধিক বুকড / জরুরি"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'আইকন' : 'Service Icon'}
                  </label>
                  <select
                    value={nursingFormData.icon || 'HeartPulse'}
                    onChange={e => setNursingFormData({ ...nursingFormData, icon: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-rose-400 outline-none"
                  >
                    <option value="HeartPulse">HeartPulse (নার্সিং/হার্ট)</option>
                    <option value="Stethoscope">Stethoscope (ডাক্তার/ক্লিনিক্যাল)</option>
                    <option value="Activity">Activity (মনিটরিং/ভাইটাল)</option>
                    <option value="ShieldCheck">ShieldCheck (সার্টিফাইড/সুরক্ষা)</option>
                    <option value="UserCheck">UserCheck (বিশেষ যত্ন/কেয়ার)</option>
                    <option value="Home">Home (হোম সার্ভিস)</option>
                    <option value="Clock">Clock (২৪/৭ জরুরি শিফট)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সংক্ষিপ্ত বিবরণ' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={nursingFormData.description || ''}
                  onChange={e => setNursingFormData({ ...nursingFormData, description: e.target.value })}
                  placeholder="e.g. পেশাদার রেজিস্টার্ড নার্স দ্বারা সার্বক্ষণিক যত্ন ও চিকিৎসা..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none"
                />
              </div>

              {/* Cover Photo & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'কভার ছবি (Image URL)' : 'Cover Image URL'}
                </label>
                <input
                  type="text"
                  value={nursingFormData.imageUrl || ''}
                  onChange={e => setNursingFormData({ ...nursingFormData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none mb-2"
                />

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800',
                    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'
                  ].map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Preset"
                      onClick={() => setNursingFormData({ ...nursingFormData, imageUrl: img })}
                      className={`w-14 h-10 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                        nursingFormData.imageUrl === img ? 'border-rose-500 scale-105 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Service Features Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সেবার বৈশিষ্ট্যসমূহ ও সুবিধা (Checklist Features)' : 'Key Service Inclusions / Checklist'}
                </label>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nursingFeatureInput}
                    onChange={e => setNursingFeatureInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNursingFeature();
                      }
                    }}
                    placeholder={lang === 'bn' ? 'সুবিধা লিখুন এবং Add চাপুন...' : 'Type feature and click Add...'}
                    className="flex-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddNursingFeature}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  {(nursingFormData.features || []).map((feat, fIdx) => (
                    <span
                      key={fIdx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium flex items-center gap-1.5 border border-slate-200"
                    >
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNursingFeature(fIdx)}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">
                    {lang === 'bn' ? 'সার্ভিসটি ওয়েবসাইটে দৃশ্যমান রাখুন' : 'Keep Service Active & Visible'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'bn' ? 'আনচেক করলে রোগীরা এই সার্ভিসটি দেখতে পাবে না।' : 'Uncheck to temporarily hide from patients.'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={nursingFormData.isActive !== false}
                  onChange={e => setNursingFormData({ ...nursingFormData, isActive: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded accent-rose-600 cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNursingModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer">
                  <Check size={14} className="mr-1 inline" /> {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Service'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
