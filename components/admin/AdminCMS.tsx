import React, { useState, useRef } from 'react';
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
  ArrowUpDown,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Tag,
  Search,
  UserCheck,
  Award,
  Printer,
  ListChecks,
  FileCheck,
  Upload,
  Smartphone,
  Download,
  Star,
  QrCode
} from 'lucide-react';
import { Button } from '../Button';
import { 
  DEFAULT_SITE_SETTINGS_BN, 
  DEFAULT_SITE_SETTINGS_EN, 
  DEFAULT_HERO_IMAGES, 
  PRESET_GALLERY_IMAGES,
  DEFAULT_NURSING_SERVICES_BN,
  DEFAULT_NURSING_SERVICES_EN,
  DEFAULT_HOME_SECTIONS_ORDER
} from '../../constants';
import { printOrDownloadInvoice } from '../../services/invoiceService';

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
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'sections' | 'branding' | 'about' | 'contact' | 'services' | 'nursing' | 'invoice' | 'app'>('hero');
  const [formData, setFormData] = useState<SiteSettings>({ ...siteSettings });
  const [newHeroImageUrl, setNewHeroImageUrl] = useState('');
  const [previewHeroIndex, setPreviewHeroIndex] = useState(0);
  const [newGuidelineInput, setNewGuidelineInput] = useState('');
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const heroReplaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingHeroIndex, setReplacingHeroIndex] = useState<number | null>(null);

  // Preset medical favicons
  const PRESET_FAVICONS = [
    {
      name: lang === 'bn' ? 'মেডিকেল ফ্ল্যাঙ্ক (ডিফল্ট)' : 'Medical Flask (Default)',
      url: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png'
    },
    {
      name: lang === 'bn' ? 'রেড ক্রস সাইন' : 'Red Cross Sign',
      url: 'https://cdn-icons-png.flaticon.com/512/2966/2966486.png'
    },
    {
      name: lang === 'bn' ? 'স্টেথোস্কোপ ব্লু' : 'Stethoscope Blue',
      url: 'https://cdn-icons-png.flaticon.com/512/2966/2966338.png'
    },
    {
      name: lang === 'bn' ? 'হার্টবিট ও ইসিজি' : 'Heartbeat & ECG',
      url: 'https://cdn-icons-png.flaticon.com/512/2966/2966440.png'
    },
    {
      name: lang === 'bn' ? 'মেডিকেল শিল্ড ও সুরক্ষা' : 'Medical Shield & Care',
      url: 'https://cdn-icons-png.flaticon.com/512/2966/2966378.png'
    },
    {
      name: lang === 'bn' ? 'ব্লাড টেস্ট টিউব' : 'Blood Test Tube',
      url: 'https://cdn-icons-png.flaticon.com/512/2966/2966334.png'
    }
  ];

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'ফাইলের আকার ২ মেগাবাইট (2MB)-এর কম হতে হবে' : 'Favicon file size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData(prev => ({ ...prev, faviconUrl: dataUrl }));
        showToast(lang === 'bn' ? 'ব্রাউজার আইকন সফলভাবে আপলোড করা হয়েছে' : 'Browser icon uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

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
    setPreviewHeroIndex(updated.length - 1);
    showToast(lang === 'bn' ? 'নতুন হিরো ইমেজ যোগ করা হয়েছে' : 'New hero slider image added');
  };

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'ফাইলের আকার ৫ মেগাবাইট (5MB)-এর কম হতে হবে' : 'Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updated = [...heroImages, dataUrl];
        setFormData(prev => ({ ...prev, heroImages: updated }));
        setPreviewHeroIndex(updated.length - 1);
        showToast(lang === 'bn' ? 'কম্পিউটার থেকে ছবি সফলভাবে স্লাইডারে আপলোড করা হয়েছে' : 'Hero slider image uploaded successfully from device');
      }
    };
    reader.readAsDataURL(file);
    if (heroFileInputRef.current) heroFileInputRef.current.value = '';
  };

  const handleHeroFileReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replacingHeroIndex === null) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'ফাইলের আকার ৫ মেগাবাইট (5MB)-এর কম হতে হবে' : 'Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updated = [...heroImages];
        updated[replacingHeroIndex] = dataUrl;
        setFormData(prev => ({ ...prev, heroImages: updated }));
        setPreviewHeroIndex(replacingHeroIndex);
        showToast(lang === 'bn' ? 'ছবিটি সফলভাবে পরিবর্তন করা হয়েছে' : 'Hero slider image replaced successfully');
        setReplacingHeroIndex(null);
      }
    };
    reader.readAsDataURL(file);
    if (heroReplaceInputRef.current) heroReplaceInputRef.current.value = '';
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
  // HOMEPAGE SECTIONS REORDERING HANDLERS
  // ==========================================
  const getNormalizedSectionsOrder = (): string[] => {
    const current = (formData.homeSectionsOrder && Array.isArray(formData.homeSectionsOrder) && formData.homeSectionsOrder.length > 0)
      ? [...formData.homeSectionsOrder]
      : [...DEFAULT_HOME_SECTIONS_ORDER];

    DEFAULT_HOME_SECTIONS_ORDER.forEach(secKey => {
      if (!current.includes(secKey)) current.push(secKey);
    });
    return current;
  };

  const handleMoveSection = (sectionKey: string, direction: 'up' | 'down') => {
    const currentOrder = getNormalizedSectionsOrder();
    const index = currentOrder.indexOf(sectionKey);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    const updated = [...currentOrder];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setFormData(prev => ({ ...prev, homeSectionsOrder: updated }));
    showToast(
      lang === 'bn' 
        ? `সেকশনটি সফলভাবে ${direction === 'up' ? 'উপরে' : 'নিচে'} নেওয়া হয়েছে` 
        : `Section moved ${direction} successfully`
    );
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

  // ==========================================
  // INVOICE GUIDELINES HANDLERS
  // ==========================================
  const invoiceGuidelinesList = formData.invoiceGuidelines && formData.invoiceGuidelines.length > 0
    ? formData.invoiceGuidelines
    : (lang === 'en' ? DEFAULT_SITE_SETTINGS_EN.invoiceGuidelines! : DEFAULT_SITE_SETTINGS_BN.invoiceGuidelines!);

  const handleAddGuideline = () => {
    if (!newGuidelineInput.trim()) return;
    const updated = [...invoiceGuidelinesList, newGuidelineInput.trim()];
    setFormData({ ...formData, invoiceGuidelines: updated });
    setNewGuidelineInput('');
    showToast(lang === 'bn' ? 'নতুন নির্দেশিকা যোগ করা হয়েছে' : 'Guideline bullet added');
  };

  const handleRemoveGuideline = (index: number) => {
    const updated = invoiceGuidelinesList.filter((_, idx) => idx !== index);
    setFormData({ ...formData, invoiceGuidelines: updated });
    showToast(lang === 'bn' ? 'নির্দেশিকা মুছে ফেলা হয়েছে' : 'Guideline removed');
  };

  const handleMoveGuideline = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= invoiceGuidelinesList.length) return;
    const updated = [...invoiceGuidelinesList];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setFormData({ ...formData, invoiceGuidelines: updated });
  };

  const invoiceLogoInputRef = useRef<HTMLInputElement>(null);

  const handleInvoiceLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'লোগোর সাইজ ২ MB এর চেয়ে ছোট হতে হবে' : 'Logo size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setFormData({ ...formData, invoiceLogoUrl: base64Url });
        showToast(lang === 'bn' ? 'ইনভয়েস লোগো সফলভাবে আপলোড করা হয়েছে' : 'Invoice logo uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
    if (invoiceLogoInputRef.current) invoiceLogoInputRef.current.value = '';
  };

  const handleTestPrintInvoice = () => {
    const sampleOrder = {
      id: 'EC-9901',
      customerName: lang === 'bn' ? 'মোহাম্মদ করিম' : 'Mohammad Karim',
      customerPhone: '01711223344',
      customerAddress: lang === 'bn' ? 'বাড়ি ১৫, রোড ৭, ধানমন্ডি, ঢাকা' : 'House 15, Road 7, Dhanmondi, Dhaka',
      area: 'Dhanmondi',
      date: new Date().toISOString().slice(0, 10),
      time: '09:00 AM',
      labName: lang === 'bn' ? 'পপুলার ডায়াগনস্টিক সেন্টার' : 'Popular Diagnostic Centre',
      testNames: [
        lang === 'bn' ? 'কমপ্লিট ব্লাড কাউন্ট (CBC)' : 'Complete Blood Count (CBC)',
        lang === 'bn' ? 'ফাস্টিং ব্লাড সুগার (FBS)' : 'Fasting Blood Sugar (FBS)',
        lang === 'bn' ? 'লিপিড প্রোফাইল (Lipid Profile)' : 'Lipid Profile'
      ],
      totalCost: 2850,
      status: 'confirmed' as const,
      createdAt: new Date().toISOString(),
      doctorName: lang === 'bn' ? 'ডাঃ মোঃ রফিকুল ইসলাম' : 'Dr. Md. Rafiqul Islam'
    };

    printOrDownloadInvoice(sampleOrder, lang, formData);
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
          <span>{lang === 'bn' ? 'হোমপেজ সেকশন অ্যাক্টিভেশন ও পজিশন' : 'Homepage Section Activation & Order'}</span>
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

        <button
          onClick={() => setActiveSubTab('invoice')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'invoice'
              ? 'bg-white text-emerald-600 shadow-sm border border-emerald-200'
              : 'text-slate-600 hover:text-emerald-600'
          }`}
        >
          <Printer size={15} className={activeSubTab === 'invoice' ? 'text-emerald-600' : ''} />
          <span>{lang === 'bn' ? 'ইনভয়েস ও মানি রিসিপ্ট' : 'Invoice & Guidelines'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('app')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'app'
              ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
              : 'text-slate-600 hover:text-sky-700'
          }`}
        >
          <Smartphone size={15} className={activeSubTab === 'app' ? 'text-primary' : ''} />
          <span>{lang === 'bn' ? 'মোবাইল অ্যাপ ও লিংক (Play Store & App Store)' : 'Mobile App & Store Links'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
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

            {/* Hidden file inputs for uploading & replacing hero images */}
            <input 
              type="file" 
              ref={heroFileInputRef} 
              accept="image/png,image/jpeg,image/webp,image/svg+xml" 
              onChange={handleHeroFileUpload} 
              className="hidden" 
            />
            <input 
              type="file" 
              ref={heroReplaceInputRef} 
              accept="image/png,image/jpeg,image/webp,image/svg+xml" 
              onChange={handleHeroFileReplace} 
              className="hidden" 
            />

            {/* Add Image Options: URL & Upload from Computer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: URL input */}
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                    <Globe size={14} className="text-primary" />
                    <span>{lang === 'bn' ? '১. ইমেজ URL লিঙ্ক দিয়ে যুক্ত করুন:' : '1. Add via Image URL:'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {lang === 'bn' ? 'ইন্টারনেট বা ক্লাউড হোস্টেড ছবির সরাসরি লিংক দিন' : 'Enter direct image URL from web/cloud'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={newHeroImageUrl}
                    onChange={e => setNewHeroImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-primary outline-none"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddHeroImage} 
                    className="px-4 py-2 text-xs font-bold whitespace-nowrap flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> <span>{lang === 'bn' ? 'যোগ করুন' : 'Add URL'}</span>
                  </Button>
                </div>
              </div>

              {/* Option 2: Upload from Computer */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1">
                    <Upload size={14} className="text-emerald-600" />
                    <span>{lang === 'bn' ? '২. কম্পিউটার বা মোবাইল থেকে আপলোড করুন:' : '2. Upload Image from Computer:'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 mb-2">
                    {lang === 'bn' ? 'সরাসরি আপনার ডিভাইস থেকে PNG, JPG, WebP ছবি আপলোড করুন (সর্বোচ্চ ৫MB)' : 'Upload local PNG, JPG, WebP image (Max 5MB)'}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => heroFileInputRef.current?.click()}
                    className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Upload size={15} />
                    <span>{lang === 'bn' ? 'কম্পিউটার থেকে ছবি নির্বাচন করুন' : 'Choose & Upload from Device'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Active Slider Images Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-primary" />
                  <span>{lang === 'bn' ? 'বর্তমান সক্রিয় স্লাইডার ইমেজসমূহ (সাজান, পরিবর্তন ও ডিলিট করুন):' : 'Active Slider Images (Reorder, Replace & Remove):'}</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {heroImages.length} {lang === 'bn' ? 'টি স্লাইড' : 'slides'}
                </span>
              </div>

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

                    {/* Top Action Buttons (Replace & Delete) */}
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplacingHeroIndex(index);
                          heroReplaceInputRef.current?.click();
                        }}
                        className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-primary shadow-sm transition-colors backdrop-blur-xs"
                        title={lang === 'bn' ? 'এই ছবিটি কম্পিউটার থেকে পরিবর্তন করুন' : 'Replace with new image from computer'}
                      >
                        <Upload size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveHeroImage(index);
                        }}
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
      {activeSubTab === 'sections' && (() => {
        const sectionsOrder = getNormalizedSectionsOrder();
        const activeCount = [
          formData.showPartnerSection !== false,
          formData.showPopularTestsSection !== false,
          formData.showPackagesSection !== false,
          formData.showNursingSection !== false,
          formData.showAppDownloadSection !== false,
          formData.showHowItWorksSection !== false,
          formData.showServicesSection !== false
        ].filter(Boolean).length;

        const sectionNamesMap: Record<string, { bn: string; en: string; shortBn: string; shortEn: string }> = {
          partner: { bn: 'অনুমোদিত ডায়াগনস্টিক পার্টনার্স', en: 'Diagnostic Lab Partners', shortBn: 'পার্টনার ল্যাবস', shortEn: 'Lab Partners' },
          popularTests: { bn: 'জনপ্রিয় ডায়াগনস্টিক টেস্টসমূহ', en: 'Popular Diagnostic Tests', shortBn: 'জনপ্রিয় টেস্ট', shortEn: 'Popular Tests' },
          packages: { bn: 'হেলথ প্যাকেজ স্লাইডার', en: 'Essential Health Packages', shortBn: 'হেলথ প্যাকেজ', shortEn: 'Health Packages' },
          nursing: { bn: 'হোম নার্সিং ও পেশেন্ট কেয়ার', en: 'Home Nursing & Care', shortBn: 'নার্সিং কেয়ার', shortEn: 'Nursing Care' },
          appDownload: { bn: 'মোবাইল অ্যাপ ডাউনলোড (Play Store & App Store)', en: 'Mobile App Download (Play Store & iOS)', shortBn: 'মোবাইল অ্যাপ', shortEn: 'Mobile App' },
          services: { bn: 'স্বাস্থ্যসেবা সমূহ হেডার', en: 'Healthcare Services Header', shortBn: 'স্বাস্থ্যসেবা', shortEn: 'Healthcare Services' },
          howItWorks: { bn: 'কিভাবে সেবা নিবেন (৩টি ধাপ)', en: 'How It Works (3 Steps)', shortBn: 'কাজের ধাপসমূহ', shortEn: 'How It Works' }
        };

        return (
          <div className="space-y-6">
            {/* Quick Header Info Banner with Live Reorder Sequence Visualizer */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50 via-indigo-50/40 to-sky-50 rounded-2xl border border-sky-200/80 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                    <Sliders size={17} className="text-primary" />
                    <span>{lang === 'bn' ? 'হোমপেজ সেকশন অ্যাক্টিভেশন ও আপ/ডাউন পজিশন কন্ট্রোল' : 'Homepage Section Activation & Up/Down Position Reordering'}</span>
                  </h4>
                  <p className="text-xs text-sky-800/80 mt-1">
                    {lang === 'bn' 
                      ? 'প্রতিটি সেকশনের ডানদিকের ▲ (উপরে / Up) ও ▼ (নিচে / Down) বাটন ক্লিক করে সেকশনটির পজিশন পরিবর্তন করতে পারবেন এবং সুইচ দিয়ে চালু বা বন্ধ করতে পারবেন।' 
                      : 'Click ▲ (Up) or ▼ (Down) to reorder any section on the homepage, or toggle Active/Inactive to control visibility.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-300 shadow-2xs">
                    <Eye size={13} className="text-emerald-700" />
                    <span>
                      {activeCount} / 7 {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Order Flow Chips */}
              <div className="pt-2 border-t border-sky-200/60 flex items-center flex-wrap gap-1.5 text-xs">
                <span className="text-sky-900 font-bold flex items-center gap-1 shrink-0 mr-1">
                  <ArrowUpDown size={13} className="text-primary" />
                  <span>{lang === 'bn' ? 'হোমপেজ বর্তমান ক্রম:' : 'Current Homepage Order:'}</span>
                </span>
                {sectionsOrder.map((secKey, i) => {
                  const info = sectionNamesMap[secKey] || { bn: secKey, en: secKey, shortBn: secKey, shortEn: secKey };
                  const isSecActive = 
                    secKey === 'partner' ? formData.showPartnerSection !== false :
                    secKey === 'popularTests' ? formData.showPopularTestsSection !== false :
                    secKey === 'packages' ? formData.showPackagesSection !== false :
                    secKey === 'nursing' ? formData.showNursingSection !== false :
                    secKey === 'appDownload' ? formData.showAppDownloadSection !== false :
                    secKey === 'services' ? formData.showServicesSection !== false :
                    formData.showHowItWorksSection !== false;

                  return (
                    <div 
                      key={secKey} 
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                        isSecActive
                          ? 'bg-white text-slate-800 border-sky-200 shadow-2xs'
                          : 'bg-slate-100/90 text-slate-400 border-slate-200 line-through opacity-70'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{lang === 'bn' ? info.shortBn : info.shortEn}</span>
                      {i < sectionsOrder.length - 1 && (
                        <span className="text-slate-300 font-bold ml-0.5">&rarr;</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Render Sections in Dynamic Order */}
            <div className="space-y-5">
              {sectionsOrder.map((sectionKey, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === sectionsOrder.length - 1;

                if (sectionKey === 'partner') {
                  const isActive = formData.showPartnerSection !== false;
                  return (
                    <div 
                      key="partner"
                      className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-all ${
                        isActive ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-black rounded-lg shadow-2xs">
                            #{idx + 1}
                          </span>
                          <div className={`p-2 rounded-xl ${isActive ? 'bg-sky-100 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                            <Building2 size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{lang === 'bn' ? 'অনুমোদিত ডায়াগনস্টিক পার্টনার্স সেকশন' : 'Diagnostic Lab Partners Section'}</span>
                            </h3>
                            <span className="text-[11px] text-slate-400 font-medium">Home Page Section &bull; Pos #{idx + 1}</span>
                          </div>
                        </div>

                        {/* Controls: Up / Down Reorder & Active Toggle */}
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                          {/* Up Button */}
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveSection('partner', 'up')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isFirst 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ উপরে নিন' : 'Move section up'}
                          >
                            <ArrowUp size={14} className={isFirst ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'উপরে' : 'Up'}</span>
                          </button>

                          {/* Down Button */}
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveSection('partner', 'down')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isLast 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ নিচে নিন' : 'Move section down'}
                          >
                            <ArrowDown size={14} className={isLast ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'নিচে' : 'Down'}</span>
                          </button>

                          {/* Active / Inactive Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, showPartnerSection: !(prev.showPartnerSection !== false) }))}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs' 
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title={isActive ? 'Click to set Inactive (Hide from Homepage)' : 'Click to set Active (Show on Homepage)'}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <Eye size={13} className="text-emerald-600" />
                                <span>{lang === 'bn' ? 'Active (সক্রিয়)' : 'Active (Visible)'}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <EyeOff size={13} className="text-slate-400" />
                                <span>{lang === 'bn' ? 'Inactive (লুকানো)' : 'Inactive (Hidden)'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {!isActive && (
                        <div className="px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                          <EyeOff size={14} className="text-amber-600 shrink-0" />
                          <span>{lang === 'bn' ? '⚠️ এই সেকশনটি বর্তমানে হোমপেজে লুকানো রয়েছে (Inactive)। আপনি চাইলে টেক্সট এডিট করে রাখতে পারেন।' : '⚠️ This section is currently hidden from homepage (Inactive).'}</span>
                        </div>
                      )}

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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (sectionKey === 'popularTests') {
                  const isActive = formData.showPopularTestsSection !== false;
                  return (
                    <div 
                      key="popularTests"
                      className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-all ${
                        isActive ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-black rounded-lg shadow-2xs">
                            #{idx + 1}
                          </span>
                          <div className={`p-2 rounded-xl ${isActive ? 'bg-sky-100 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                            <FlaskConical size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{lang === 'bn' ? 'জনপ্রিয় ডায়াগনস্টিক টেস্ট সেকশন' : 'Popular Diagnostic Tests Section'}</span>
                            </h3>
                            <span className="text-[11px] text-slate-400 font-medium">Home Page Section &bull; Pos #{idx + 1}</span>
                          </div>
                        </div>

                        {/* Controls: Up / Down Reorder & Active Toggle */}
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                          {/* Up Button */}
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveSection('popularTests', 'up')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isFirst 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ উপরে নিন' : 'Move section up'}
                          >
                            <ArrowUp size={14} className={isFirst ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'উপরে' : 'Up'}</span>
                          </button>

                          {/* Down Button */}
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveSection('popularTests', 'down')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isLast 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ নিচে নিন' : 'Move section down'}
                          >
                            <ArrowDown size={14} className={isLast ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'নিচে' : 'Down'}</span>
                          </button>

                          {/* Active / Inactive Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, showPopularTestsSection: !(prev.showPopularTestsSection !== false) }))}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs' 
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title={isActive ? 'Click to set Inactive (Hide from Homepage)' : 'Click to set Active (Show on Homepage)'}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <Eye size={13} className="text-emerald-600" />
                                <span>{lang === 'bn' ? 'Active (সক্রিয়)' : 'Active (Visible)'}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <EyeOff size={13} className="text-slate-400" />
                                <span>{lang === 'bn' ? 'Inactive (লুকানো)' : 'Inactive (Hidden)'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {!isActive && (
                        <div className="px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                          <EyeOff size={14} className="text-amber-600 shrink-0" />
                          <span>{lang === 'bn' ? '⚠️ এই সেকশনটি বর্তমানে হোমপেজে লুকানো রয়েছে (Inactive)। আপনি চাইলে টেক্সট এডিট করে রাখতে পারেন।' : '⚠️ This section is currently hidden from homepage (Inactive).'}</span>
                        </div>
                      )}

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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (sectionKey === 'packages') {
                  const isActive = formData.showPackagesSection !== false;
                  return (
                    <div 
                      key="packages"
                      className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-all ${
                        isActive ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-black rounded-lg shadow-2xs">
                            #{idx + 1}
                          </span>
                          <div className={`p-2 rounded-xl ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                            <Tag size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{lang === 'bn' ? 'হেলথ প্যাকেজ স্লাইডার সেকশন' : 'Essential Health Packages Section'}</span>
                            </h3>
                            <span className="text-[11px] text-slate-400 font-medium">Home Page Section &bull; Pos #{idx + 1}</span>
                          </div>
                        </div>

                        {/* Controls: Up / Down Reorder & Active Toggle */}
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                          {/* Up Button */}
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveSection('packages', 'up')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isFirst 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ উপরে নিন' : 'Move section up'}
                          >
                            <ArrowUp size={14} className={isFirst ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'উপরে' : 'Up'}</span>
                          </button>

                          {/* Down Button */}
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveSection('packages', 'down')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isLast 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ নিচে নিন' : 'Move section down'}
                          >
                            <ArrowDown size={14} className={isLast ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'নিচে' : 'Down'}</span>
                          </button>

                          {/* Active / Inactive Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, showPackagesSection: !(prev.showPackagesSection !== false) }))}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs' 
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title={isActive ? 'Click to set Inactive (Hide from Homepage)' : 'Click to set Active (Show on Homepage)'}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <Eye size={13} className="text-emerald-600" />
                                <span>{lang === 'bn' ? 'Active (সক্রিয়)' : 'Active (Visible)'}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <EyeOff size={13} className="text-slate-400" />
                                <span>{lang === 'bn' ? 'Inactive (লুকানো)' : 'Inactive (Hidden)'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {!isActive && (
                        <div className="px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                          <EyeOff size={14} className="text-amber-600 shrink-0" />
                          <span>{lang === 'bn' ? '⚠️ এই সেকশনটি বর্তমানে হোমপেজে লুকানো রয়েছে (Inactive)। আপনি চাইলে টেক্সট এডিট করে রাখতে পারেন।' : '⚠️ This section is currently hidden from homepage (Inactive).'}</span>
                        </div>
                      )}

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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (sectionKey === 'nursing') {
                  const isActive = formData.showNursingSection !== false;
                  return (
                    <div 
                      key="nursing"
                      className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-all ${
                        isActive ? 'border-rose-100' : 'border-slate-200/60 bg-slate-50/50 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-50 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-black rounded-lg shadow-2xs">
                            #{idx + 1}
                          </span>
                          <div className={`p-2 rounded-xl ${isActive ? 'bg-rose-100 text-rose-500' : 'bg-slate-200 text-slate-500'}`}>
                            <HeartPulse size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{lang === 'bn' ? 'হোম নার্সিং ও পেশেন্ট কেয়ার সেকশন' : 'Home Nursing & Patient Care Section'}</span>
                            </h3>
                            <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">Pos #{idx + 1}</span>
                          </div>
                        </div>

                        {/* Controls: Up / Down Reorder & Active Toggle */}
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                          {/* Up Button */}
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveSection('nursing', 'up')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isFirst 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ উপরে নিন' : 'Move section up'}
                          >
                            <ArrowUp size={14} className={isFirst ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'উপরে' : 'Up'}</span>
                          </button>

                          {/* Down Button */}
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveSection('nursing', 'down')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isLast 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ নিচে নিন' : 'Move section down'}
                          >
                            <ArrowDown size={14} className={isLast ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'নিচে' : 'Down'}</span>
                          </button>

                          {/* Active / Inactive Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, showNursingSection: !(prev.showNursingSection !== false) }))}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs' 
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title={isActive ? 'Click to set Inactive (Hide from Homepage)' : 'Click to set Active (Show on Homepage)'}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <Eye size={13} className="text-emerald-600" />
                                <span>{lang === 'bn' ? 'Active (সক্রিয়)' : 'Active (Visible)'}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <EyeOff size={13} className="text-slate-400" />
                                <span>{lang === 'bn' ? 'Inactive (লুকানো)' : 'Inactive (Hidden)'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {!isActive && (
                        <div className="px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                          <EyeOff size={14} className="text-amber-600 shrink-0" />
                          <span>{lang === 'bn' ? '⚠️ এই সেকশনটি বর্তমানে হোমপেজে লুকানো রয়েছে (Inactive)। আপনি চাইলে টেক্সট এডিট করে রাখতে পারেন।' : '⚠️ This section is currently hidden from homepage (Inactive).'}</span>
                        </div>
                      )}

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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-rose-400 outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400 outline-none bg-white"
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
                  );
                }

                if (sectionKey === 'howItWorks') {
                  const isActive = formData.showHowItWorksSection !== false;
                  return (
                    <div 
                      key="howItWorks"
                      className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-all ${
                        isActive ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-black rounded-lg shadow-2xs">
                            #{idx + 1}
                          </span>
                          <div className={`p-2 rounded-xl ${isActive ? 'bg-sky-100 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{lang === 'bn' ? 'কিভাবে সেবা নিবেন (৩টি ধাপ)' : 'How It Works (3 Steps Workflow)'}</span>
                            </h3>
                            <span className="text-[11px] text-slate-400 font-medium">Home Page Section &bull; Pos #{idx + 1}</span>
                          </div>
                        </div>

                        {/* Controls: Up / Down Reorder & Active Toggle */}
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                          {/* Up Button */}
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveSection('howItWorks', 'up')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isFirst 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ উপরে নিন' : 'Move section up'}
                          >
                            <ArrowUp size={14} className={isFirst ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'উপরে' : 'Up'}</span>
                          </button>

                          {/* Down Button */}
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveSection('howItWorks', 'down')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isLast 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ নিচে নিন' : 'Move section down'}
                          >
                            <ArrowDown size={14} className={isLast ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'নিচে' : 'Down'}</span>
                          </button>

                          {/* Active / Inactive Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, showHowItWorksSection: !(prev.showHowItWorksSection !== false) }))}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs' 
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title={isActive ? 'Click to set Inactive (Hide from Homepage)' : 'Click to set Active (Show on Homepage)'}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <Eye size={13} className="text-emerald-600" />
                                <span>{lang === 'bn' ? 'Active (সক্রিয়)' : 'Active (Visible)'}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <EyeOff size={13} className="text-slate-400" />
                                <span>{lang === 'bn' ? 'Inactive (লুকানো)' : 'Inactive (Hidden)'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {!isActive && (
                        <div className="px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                          <EyeOff size={14} className="text-amber-600 shrink-0" />
                          <span>{lang === 'bn' ? '⚠️ এই সেকশনটি বর্তমানে হোমপেজে লুকানো রয়েছে (Inactive)। আপনি চাইলে ধাপগুলো এডিট করে রাখতে পারেন।' : '⚠️ This section is currently hidden from homepage (Inactive).'}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {lang === 'bn' ? 'সেকশন মূল শিরোনাম' : 'Section Main Heading'}
                        </label>
                        <input
                          type="text"
                          value={formData.howItWorksTitle || ''}
                          onChange={e => setFormData({ ...formData, howItWorksTitle: e.target.value })}
                          placeholder="e.g. সহজ ৩টি ধাপে ঘরে বসে ল্যাব টেস্ট"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {howItWorksSteps.map((step, sIdx) => (
                          <div key={sIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold">
                              Step {sIdx + 1}
                            </span>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                {lang === 'bn' ? 'ধাপের শিরোনাম (Title)' : 'Step Title'}
                              </label>
                              <input
                                type="text"
                                value={step.title}
                                onChange={e => handleUpdateStep(sIdx, 'title', e.target.value)}
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
                                onChange={e => handleUpdateStep(sIdx, 'desc', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white leading-relaxed"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (sectionKey === 'appDownload') {
                  const isActive = formData.showAppDownloadSection !== false;
                  return (
                    <div 
                      key="appDownload"
                      className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-all ${
                        isActive ? 'border-sky-200 ring-1 ring-sky-100' : 'border-slate-200/60 bg-slate-50/50 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-50 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-black rounded-lg shadow-2xs">
                            #{idx + 1}
                          </span>
                          <div className={`p-2 rounded-xl ${isActive ? 'bg-sky-100 text-sky-600' : 'bg-slate-200 text-slate-500'}`}>
                            <Smartphone size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{lang === 'bn' ? 'মোবাইল অ্যাপ ডাউনলোড সেকশন (Google Play & App Store)' : 'Mobile App Download Section'}</span>
                            </h3>
                            <span className="text-[11px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-md">Pos #{idx + 1} &bull; Store Links</span>
                          </div>
                        </div>

                        {/* Controls: Up / Down Reorder & Active Toggle */}
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                          {/* Up Button */}
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveSection('appDownload', 'up')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isFirst 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ উপরে নিন' : 'Move section up'}
                          >
                            <ArrowUp size={14} className={isFirst ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'উপরে' : 'Up'}</span>
                          </button>

                          {/* Down Button */}
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveSection('appDownload', 'down')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isLast 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ নিচে নিন' : 'Move section down'}
                          >
                            <ArrowDown size={14} className={isLast ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'নিচে' : 'Down'}</span>
                          </button>

                          {/* Active / Inactive Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, showAppDownloadSection: !(prev.showAppDownloadSection !== false) }))}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs' 
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title={isActive ? 'Click to set Inactive (Hide from Homepage)' : 'Click to set Active (Show on Homepage)'}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <Eye size={13} className="text-emerald-600" />
                                <span>{lang === 'bn' ? 'Active (সক্রিয়)' : 'Active (Visible)'}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <EyeOff size={13} className="text-slate-400" />
                                <span>{lang === 'bn' ? 'Inactive (লুকানো)' : 'Inactive (Hidden)'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {lang === 'bn' ? 'Android / Google Play Store লিংক' : 'Google Play Store URL'}
                          </label>
                          <input
                            type="text"
                            value={formData.androidAppUrl || ''}
                            onChange={e => setFormData({ ...formData, androidAppUrl: e.target.value })}
                            placeholder="https://play.google.com/store/apps/details?id=..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {lang === 'bn' ? 'Apple iOS / App Store লিংক' : 'Apple App Store URL'}
                          </label>
                          <input
                            type="text"
                            value={formData.iosAppUrl || ''}
                            onChange={e => setFormData({ ...formData, iosAppUrl: e.target.value })}
                            placeholder="https://apps.apple.com/app/..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveSubTab('app')}
                          className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer underline"
                        >
                          <span>{lang === 'bn' ? '📱 সম্পূর্ণ মোবাইল অ্যাপ সেটিংস ও লাইভ প্রিভিউ দেখুন' : 'View Full Mobile App Settings & Live Preview'} &rarr;</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                if (sectionKey === 'services') {
                  const isActive = formData.showServicesSection !== false;
                  return (
                    <div 
                      key="services"
                      className={`bg-white p-6 rounded-2xl border shadow-sm space-y-4 transition-all ${
                        isActive ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 bg-slate-900 text-white text-xs font-black rounded-lg shadow-2xs">
                            #{idx + 1}
                          </span>
                          <div className={`p-2 rounded-xl ${isActive ? 'bg-sky-100 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                            <Layers size={18} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{lang === 'bn' ? 'স্বাস্থ্যসেবা সমূহ সেকশন হেডার' : 'Healthcare Services Section Header'}</span>
                            </h3>
                            <span className="text-[11px] text-slate-400 font-medium">Home Page Section &bull; Pos #{idx + 1}</span>
                          </div>
                        </div>

                        {/* Controls: Up / Down Reorder & Active Toggle */}
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                          {/* Up Button */}
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveSection('services', 'up')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isFirst 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ উপরে নিন' : 'Move section up'}
                          >
                            <ArrowUp size={14} className={isFirst ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'উপরে' : 'Up'}</span>
                          </button>

                          {/* Down Button */}
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveSection('services', 'down')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              isLast 
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200' 
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-primary hover:border-sky-300 shadow-2xs cursor-pointer'
                            }`}
                            title={lang === 'bn' ? 'সেকশনটি ১ ধাপ নিচে নিন' : 'Move section down'}
                          >
                            <ArrowDown size={14} className={isLast ? '' : 'text-primary'} />
                            <span className="hidden sm:inline">{lang === 'bn' ? 'নিচে' : 'Down'}</span>
                          </button>

                          {/* Active / Inactive Toggle Button */}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, showServicesSection: !(prev.showServicesSection !== false) }))}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              isActive 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 shadow-xs' 
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                            title={isActive ? 'Click to set Inactive (Hide from Homepage)' : 'Click to set Active (Show on Homepage)'}
                          >
                            {isActive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <Eye size={13} className="text-emerald-600" />
                                <span>{lang === 'bn' ? 'Active (সক্রিয়)' : 'Active (Visible)'}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                <EyeOff size={13} className="text-slate-400" />
                                <span>{lang === 'bn' ? 'Inactive (লুকানো)' : 'Inactive (Hidden)'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {!isActive && (
                        <div className="px-3.5 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                          <EyeOff size={14} className="text-amber-600 shrink-0" />
                          <span>{lang === 'bn' ? '⚠️ এই সেকশনটি বর্তমানে হোমপেজে লুকানো রয়েছে (Inactive)। আপনি চাইলে টেক্সট এডিট করে রাখতে পারেন।' : '⚠️ This section is currently hidden from homepage (Inactive).'}</span>
                        </div>
                      )}

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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none bg-white"
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
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={() => handleSaveAll()} className="px-6 py-2.5 text-xs font-bold shadow-md shadow-sky-100">
                <Check size={14} className="mr-1.5 inline" /> {lang === 'bn' ? 'সকল সেকশন পজিশন ও সেটিংস সেভ করুন' : 'Save Section Order & Settings'}
              </Button>
            </div>
          </div>
        );
      })()}

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

              {/* ========================================================================= */}
              {/* BROWSER ICON / FAVICON CUSTOMIZATION & UPLOAD SECTION                     */}
              {/* ========================================================================= */}
              <div className="pt-4 border-t border-slate-100 space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe size={15} className="text-primary" />
                    <span>{lang === 'bn' ? 'ব্রাউজার ট্যাব আইকন / ফেভিকন (Browser Favicon)' : 'Browser Tab Icon / Favicon'}</span>
                  </label>
                  {formData.faviconUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, faviconUrl: '' })}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      {lang === 'bn' ? 'রিসেট' : 'Reset'}
                    </button>
                  )}
                </div>

                {/* Upload or Link Input */}
                <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
                  {/* Current Favicon Icon Preview Badge */}
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <img
                      src={formData.faviconUrl || 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png'}
                      alt="Browser Favicon"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png';
                      }}
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      ref={faviconInputRef}
                      onChange={handleFaviconUpload}
                      accept="image/png, image/jpeg, image/x-icon, image/svg+xml, image/webp"
                      className="hidden"
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => faviconInputRef.current?.click()}
                        variant="outline"
                        className="!text-xs !py-2 font-bold flex items-center gap-1.5 bg-white shadow-2xs"
                      >
                        <Upload size={14} className="text-primary" />
                        <span>{lang === 'bn' ? 'ডিভাইস থেকে আইকন আপলোড করুন' : 'Upload Icon from Device'}</span>
                      </Button>

                      <input
                        type="url"
                        value={formData.faviconUrl || ''}
                        onChange={e => setFormData({ ...formData, faviconUrl: e.target.value })}
                        placeholder={lang === 'bn' ? 'অথবা ফেভিকন ইমেজ URL লিখুন...' : 'Or enter direct Favicon image URL...'}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  {lang === 'bn' 
                    ? 'সাপোর্টেড ফরম্যাট: PNG, ICO, SVG, JPG, WEBP (সর্বোচ্চ ২ মেগাবাইট)। এটি ব্রাউজারের উপরে ট্যাব বারে আপনার ওয়েবসাইটের পরিচিতি হিসেবে শো করবে।' 
                    : 'Supported formats: PNG, ICO, SVG, JPG, WEBP (Max 2MB). This icon will appear on browser tabs and shortcuts.'}
                </p>

                {/* Quick Presets for Medical Favicons */}
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-600 block mb-2">
                    {lang === 'bn' ? '⚡ দ্রুত মেডিকেল প্রিসেট আইকন বেছে নিন:' : '⚡ Quick Medical Preset Favicons:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_FAVICONS.map((preset, pIdx) => {
                      const isSelected = formData.faviconUrl === preset.url;
                      return (
                        <button
                          type="button"
                          key={pIdx}
                          onClick={() => {
                            setFormData({ ...formData, faviconUrl: preset.url });
                            showToast(lang === 'bn' ? `${preset.name} আইকন নির্বাচন করা হয়েছে` : `${preset.name} selected as favicon`);
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 bg-white transition-all ${
                            isSelected 
                              ? 'border-primary ring-2 ring-primary/20 bg-sky-50 text-primary font-bold shadow-2xs' 
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-5 h-5 object-contain flex-shrink-0" />
                          <span className="text-[11px] truncate">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <Button onClick={() => handleSaveAll()} className="px-5 py-2.5 text-xs font-bold shadow-md shadow-sky-100">
                  <Check size={14} className="mr-1 inline" /> {lang === 'bn' ? 'ব্র্যান্ডিং ও ফেভিকন সেভ করুন' : 'Save Branding & Favicon'}
                </Button>
              </div>
            </div>

            {/* Live Preview Box (1 col) */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-4">
                  Live Previews
                </span>

                {/* Simulated Real Browser Tab Preview Mockup */}
                <div className="mb-5">
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                    <Globe size={13} className="text-sky-400" />
                    <span>{lang === 'bn' ? 'ব্রাউজার ট্যাব প্রিভিউ (Browser Tab)' : 'Live Browser Tab Simulation:'}</span>
                  </span>
                  
                  {/* Browser Top Window Simulation */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-2.5 shadow-inner">
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>

                    {/* The Active Browser Tab */}
                    <div className="bg-slate-800/95 rounded-lg px-3 py-1.5 border border-slate-700/80 flex items-center justify-between gap-2 max-w-[260px] shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <img 
                          src={formData.faviconUrl || 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png'} 
                          alt="Tab Favicon" 
                          className="w-4 h-4 object-contain flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png';
                          }}
                        />
                        <span className="text-xs font-semibold text-slate-100 truncate">
                          {formData.siteName || 'LabHome BD'} - {formData.siteTagline || 'Smart Healthcare'}
                        </span>
                      </div>
                      <span className="text-slate-400 hover:text-white text-[11px] font-bold cursor-pointer">×</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Header Card */}
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                    {lang === 'bn' ? 'ওয়েবসাইট হেডার লোগো প্রিভিউ:' : 'Website Header Logo Preview:'}
                  </span>
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
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <p className="font-semibold text-white">Contact Pill on Top Bar:</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                    <Phone size={13} />
                    <span>{formData.contactHotline || formData.contactPhone || '01700-000000'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                এই পরিবর্তনগুলো হোমপেজের হেডার, ব্রাউজার ফেভিকন (Tab Icon), ফুটার এবং ব্রাউজার মেটা তথ্যে তাৎক্ষণিকভাবে প্রতিফলিত হবে।
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

          {/* Social Media Links Section */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {lang === 'bn' ? 'সোশ্যাল মিডিয়া প্রোফাইল ও পেজ লিংক (Social Media Links)' : 'Social Media Links (Facebook, LinkedIn, YouTube)'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {lang === 'bn' ? 'হোমপেজ ও ফুটারে প্রদর্শিত হবে' : 'Shown in homepage & footer'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Facebook */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
                      f
                    </div>
                    <span>Facebook Page URL</span>
                  </label>
                  {formData.facebookUrl && (
                    <a
                      href={formData.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                    >
                      <span>Test</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.facebookUrl || ''}
                  onChange={e => setFormData({ ...formData, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* 2. LinkedIn */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs">
                      in
                    </div>
                    <span>LinkedIn Profile / Company URL</span>
                  </label>
                  {formData.linkedinUrl && (
                    <a
                      href={formData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                    >
                      <span>Test</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/yourbrand"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* 3. YouTube */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#FF0000] text-white flex items-center justify-center">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                    </div>
                    <span>YouTube Channel URL</span>
                  </label>
                  {formData.youtubeUrl && (
                    <a
                      href={formData.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                    >
                      <span>Test</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.youtubeUrl || ''}
                  onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/@yourchannel"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* 4. Instagram */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <span>Instagram Profile URL</span>
                  </label>
                  {formData.instagramUrl && (
                    <a
                      href={formData.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                    >
                      <span>Test</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.instagramUrl || ''}
                  onChange={e => setFormData({ ...formData, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/yourprofile"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
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
      {/* 8. INVOICE, MONEY RECEIPT & SAMPLE GUIDELINES MANAGEMENT                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'invoice' && (
        <div className="space-y-6">
          {/* Header & Quick Action Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  Official Money Receipt
                </span>
                <h2 className="text-xl font-bold text-white">
                  {lang === 'bn' ? 'ইনভয়েস, প্রতিষ্ঠানের নাম-ঠিকানা ও নির্দেশিকা' : 'Invoice, Header & Sample Guidelines'}
                </h2>
              </div>
              <p className="text-xs text-sky-200/80 mt-1 max-w-2xl leading-relaxed">
                {lang === 'bn'
                  ? 'গ্রাহকদের দেওয়া মানি রিসিপ্ট ও ইনভয়েসে প্রতিষ্ঠানের নাম, অফিস ঠিকানা, হেল্পলাইন, ওয়াটারমার্ক এবং স্যাম্পল কালেকশন ও রিপোর্ট নির্দেশিকা পরিবর্তন করুন।'
                  : 'Customize the organization header, address, hotline, watermark, and sample collection & report guidelines on all customer invoices.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTestPrintInvoice}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Printer size={15} />
                <span>{lang === 'bn' ? 'টেস্ট ইনভয়েস প্রিভিউ ও প্রিন্ট' : 'Test Print Invoice'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 Columns: Organization Details & Header */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 size={16} className="text-primary" />
                  <span>{lang === 'bn' ? 'ইনভয়েস হেডার, লোগো ও প্রতিষ্ঠানের তথ্য' : 'Organization & Header Information'}</span>
                </h3>
                <span className="text-[11px] text-slate-400">Header & Footer</span>
              </div>

              {/* Invoice Logo Customization & Upload */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-primary" />
                    <span>{lang === 'bn' ? 'ইনভয়েস ব্র্যান্ড লোগো (Invoice Logo)' : 'Invoice Brand Logo'}</span>
                  </label>
                  {formData.invoiceLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, invoiceLogoUrl: '' })}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      {lang === 'bn' ? 'লোগো মুছে ফেলুন' : 'Remove Logo'}
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Logo Preview Thumbnail */}
                  <div className="w-24 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                    {formData.invoiceLogoUrl ? (
                      <img
                        src={formData.invoiceLogoUrl}
                        alt="Invoice Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-primary font-black text-base leading-none block">+</span>
                        <span className="text-[9px] text-slate-400 font-medium">{lang === 'bn' ? 'ডিফল্ট ব্যাজ' : 'Default Icon'}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: File Upload & URL Input */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={invoiceLogoInputRef}
                        onChange={handleInvoiceLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => invoiceLogoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <ImageIcon size={13} className="text-primary" />
                        <span>{lang === 'bn' ? 'কম্পিউটার থেকে আপলোড' : 'Upload from Device'}</span>
                      </button>

                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, invoiceLogoUrl: formData.logoUrl })}
                          className="px-3 py-1.5 bg-sky-50 border border-sky-100 hover:bg-sky-100 text-primary rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          {lang === 'bn' ? 'সাইটের লোগো ব্যবহার করুন' : 'Use Website Logo'}
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={formData.invoiceLogoUrl || ''}
                      onChange={e => setFormData({ ...formData, invoiceLogoUrl: e.target.value })}
                      placeholder={lang === 'bn' ? 'অথবা লোগোর ইমেজ URL পেস্ট করুন (https://...)' : 'Or paste Logo Image URL (https://...)'}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>

                {/* Preset Health Logos */}
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                    {lang === 'bn' ? 'দ্রুত ব্যবহারের জন্য স্যাম্পল লোগো:' : 'Quick Sample Medical Logos:'}
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {[
                      'https://images.unsplash.com/photo-1579684385180-1647f26afacf?auto=format&fit=crop&q=80&w=200',
                      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=200',
                      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=200'
                    ].map((presetImg, pIdx) => (
                      <img
                        key={pIdx}
                        src={presetImg}
                        alt="Preset Logo"
                        onClick={() => setFormData({ ...formData, invoiceLogoUrl: presetImg })}
                        className={`w-10 h-7 object-cover rounded-lg border cursor-pointer transition-all ${
                          formData.invoiceLogoUrl === presetImg ? 'border-primary ring-2 ring-primary/30 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                        title="Click to use this logo"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Org Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'প্রতিষ্ঠানের পূর্ণ নাম (Organization Name)' : 'Organization Name on Invoice'} *
                </label>
                <input
                  type="text"
                  value={formData.invoiceOrgName || formData.siteName || ''}
                  onChange={e => setFormData({ ...formData, invoiceOrgName: e.target.value })}
                  placeholder="e.g. LabHome BD - Smart Healthcare Services"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Org Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সাবটাইটেল / স্লোগান (Subtitle / Tagline)' : 'Invoice Subtitle'}
                </label>
                <input
                  type="text"
                  value={formData.invoiceOrgSubtitle || formData.siteTagline || ''}
                  onChange={e => setFormData({ ...formData, invoiceOrgSubtitle: e.target.value })}
                  placeholder="e.g. বিশ্বস্ত হোম ডায়াগনস্টিক ও ডিজিটাল ল্যাব কেয়ার নেটওয়ার্ক"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              {/* Watermark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ইনভয়েস ব্যাকগ্রাউন্ড ওয়াটারমার্ক (Watermark Text)' : 'Background Watermark Text'}
                </label>
                <input
                  type="text"
                  value={formData.invoiceWatermark || formData.siteName || ''}
                  onChange={e => setFormData({ ...formData, invoiceWatermark: e.target.value })}
                  placeholder="e.g. LabHome BD"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none font-mono"
                />
              </div>

              {/* Office Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin size={12} className="text-primary" />
                  <span>{lang === 'bn' ? 'প্রতিষ্ঠানের অফিস ঠিকানা (Organization Address)' : 'Official Address'} *</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.invoiceAddress || formData.contactAddress || ''}
                  onChange={e => setFormData({ ...formData, invoiceAddress: e.target.value })}
                  placeholder="e.g. বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা - ১২০৫, বাংলাদেশ"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hotline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone size={12} className="text-emerald-600" />
                    <span>{lang === 'bn' ? 'হেল্পলাইন / হটলাইন' : 'Hotline Number'}</span>
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceHotline || formData.contactHotline || formData.contactPhone || ''}
                    onChange={e => setFormData({ ...formData, invoiceHotline: e.target.value })}
                    placeholder="e.g. +880 9613-828282"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail size={12} className="text-sky-600" />
                    <span>{lang === 'bn' ? 'সাপোর্ট ইমেইল' : 'Support Email'}</span>
                  </label>
                  <input
                    type="email"
                    value={formData.invoiceEmail || formData.contactEmail || ''}
                    onChange={e => setFormData({ ...formData, invoiceEmail: e.target.value })}
                    placeholder="support@labhomebd.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Website */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Globe size={12} className="text-indigo-600" />
                    <span>{lang === 'bn' ? 'ওয়েবসাইট ইউআরএল' : 'Website URL'}</span>
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceWebsite || 'www.labhomebd.com'}
                    onChange={e => setFormData({ ...formData, invoiceWebsite: e.target.value })}
                    placeholder="www.labhomebd.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none font-mono"
                  />
                </div>

                {/* Digital Seal Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>{lang === 'bn' ? 'ডিজিটাল সিল টেক্সট' : 'Digital Seal Note'}</span>
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceFooterNote || (lang === 'bn' ? '✓ ভেরিফাইড ডিজিটাল মানি রিসিপ্ট' : '✓ Verified Digital Money Receipt')}
                    onChange={e => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
                    placeholder="✓ Verified Digital Money Receipt"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Right 6 Columns: Sample Collection & Report Guidelines */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ListChecks size={16} className="text-emerald-600" />
                    <span>{lang === 'bn' ? 'স্যাম্পল কালেকশন ও রিপোর্ট নির্দেশিকা' : 'Sample Collection & Report Guidelines'}</span>
                  </h3>
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    {invoiceGuidelinesList.length} {lang === 'bn' ? 'টি পয়েন্ট' : 'Points'}
                  </span>
                </div>

                {/* Guidelines Section Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'নির্দেশিকা বক্সের শিরোনাম (Guidelines Header)' : 'Guidelines Section Title'} *
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceTermsTitle || (lang === 'bn' ? 'স্যাম্পল কালেকশন ও রিপোর্ট নির্দেশিকা (Important Guidelines):' : 'Sample Collection & Report Guidelines:')}
                    onChange={e => setFormData({ ...formData, invoiceTermsTitle: e.target.value })}
                    placeholder="e.g. স্যাম্পল কালেকশন ও রিপোর্ট নির্দেশিকা (Important Guidelines):"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>

                {/* Add New Guideline Point Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'নতুন নির্দেশিকা যোগ করুন' : 'Add New Guideline Bullet'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGuidelineInput}
                      onChange={e => setNewGuidelineInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGuideline();
                        }
                      }}
                      placeholder={lang === 'bn' ? 'যেমন: ফাস্টিং টেস্টের জন্য ৮-১০ ঘণ্টা খালি পেটে থাকুন...' : 'e.g. Ensure 8-10 hours fasting for blood sugar tests...'}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddGuideline}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Guidelines List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {invoiceGuidelinesList.map((guideline, gIdx) => (
                    <div
                      key={gIdx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5 flex-1">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {gIdx + 1}
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">{guideline}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={gIdx === 0}
                          onClick={() => handleMoveGuideline(gIdx, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer rounded"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={gIdx === invoiceGuidelinesList.length - 1}
                          onClick={() => handleMoveGuideline(gIdx, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer rounded"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGuideline(gIdx)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer rounded ml-1"
                          title="Remove Guideline"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Box of Guidelines */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 text-xs space-y-2 mt-4">
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <FileCheck size={14} />
                    <span>{lang === 'bn' ? 'ইনভয়েস লাইভ প্রিভিউ' : 'Live Invoice Box Preview'}</span>
                  </span>
                  <span className="text-slate-400 font-normal">Customer Receipt Box</span>
                </div>
                <h5 className="font-bold text-slate-200 text-xs">
                  {formData.invoiceTermsTitle || (lang === 'bn' ? 'স্যাম্পল কালেকশন ও রিপোর্ট নির্দেশিকা (Important Guidelines):' : 'Sample Collection & Report Guidelines:')}
                </h5>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300/90 leading-relaxed">
                  {invoiceGuidelinesList.slice(0, 3).map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                  {invoiceGuidelinesList.length > 3 && (
                    <li className="text-slate-400 italic font-mono">+ {invoiceGuidelinesList.length - 3} more guidelines...</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. MOBILE APP & STORE LINKS MANAGEMENT (Google Play & Apple iOS)         */}
      {/* ========================================================================= */}
      {activeSubTab === 'app' && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="p-5 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                <Smartphone size={26} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <span>{lang === 'bn' ? 'মোবাইল অ্যাপ ও স্টোর লিংক সেটিংস' : 'Mobile App & Store Links Settings'}</span>
                  <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-md text-[10px] font-black uppercase">
                    Play Store & iOS
                  </span>
                </h3>
                <p className="text-xs text-sky-200/80 mt-0.5 max-w-xl">
                  {lang === 'bn'
                    ? 'হোমপেজে গুগল প্লে স্টোর ও অ্যাপল অ্যাপ স্টোর ডাউনলোড অপশন প্রদর্শন করুন এবং আপনার অ্যাপের লাইভ লিংক যুক্ত করুন।'
                    : 'Configure Google Play Store and Apple App Store links for patient app downloads and homepage banner display.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <Button 
                onClick={() => handleSaveAll()}
                className="px-5 py-2.5 text-xs font-bold bg-primary hover:bg-sky-500 text-white shadow-lg shadow-sky-950/40"
              >
                <Save size={14} className="mr-1 inline" />
                <span>{lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save App Links'}</span>
              </Button>
            </div>
          </div>

          {/* Grid: Settings Form (8 Cols) vs Live Preview (4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Configuration Form */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Main Visibility & Placement Toggles */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={15} className="text-primary" />
                  <span>{lang === 'bn' ? 'অ্যাপ অপশন প্রদর্শন ও অবস্থান' : 'App Option Visibility & Placement'}</span>
                </h4>

                <div className="space-y-3">
                  {/* 1. Main Homepage App Download Section Toggle */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">
                        {lang === 'bn' ? '১. হোমপেজে মূল অ্যাপ ডাউনলোড সেকশন চালু রাখুন' : '1. Show Main App Download Section on Homepage'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {lang === 'bn' ? 'হোমপেজের চমৎকার অ্যাপ ব্যানার, স্মার্টফোন ফ্রেম ও ডাউনলোড বাটন।' : 'Attractive app showcase section with smartphone mockup and download buttons.'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showAppDownloadSection !== false}
                      onChange={e => setFormData({ ...formData, showAppDownloadSection: e.target.checked })}
                      className="w-5 h-5 text-primary rounded accent-primary cursor-pointer"
                    />
                  </div>

                  {/* 2. Hero Section App Buttons */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">
                        {lang === 'bn' ? '২. হিরো ব্যানারে অ্যাপ স্টোর ব্যাজ দেখান' : '2. Show App Store Badges in Hero Banner'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {lang === 'bn' ? 'হোমপেজের শীর্ষ হিরো ব্যানারের নিচে ছোট প্লে স্টোর ও আইওএস বাটন।' : 'Display mini Google Play & App Store buttons directly in the hero banner.'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showAppButtonsInHero !== false}
                      onChange={e => setFormData({ ...formData, showAppButtonsInHero: e.target.checked })}
                      className="w-5 h-5 text-primary rounded accent-primary cursor-pointer"
                    />
                  </div>

                  {/* 3. Footer App Buttons */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">
                        {lang === 'bn' ? '৩. ফুটার (Footer)-এ অ্যাপ লিংক দেখান' : '3. Show App Store Links in Footer'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {lang === 'bn' ? 'ওয়েবসাইটের নিচের ফুটারে ডাউনলোড বাটন প্রদর্শন করবে।' : 'Display Google Play and App Store links in the website footer.'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.showAppButtonsInFooter !== false}
                      onChange={e => setFormData({ ...formData, showAppButtonsInFooter: e.target.checked })}
                      className="w-5 h-5 text-primary rounded accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Store Links Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <ExternalLink size={15} className="text-emerald-600" />
                  <span>{lang === 'bn' ? 'স্টোর লিংকসমূহ (Store URLs)' : 'Store Download URLs'}</span>
                </h4>

                {/* 1. Android Google Play Store URL */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      {/* Google Play Icon */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M3.609 1.814L13.793 12 3.61 22.186a2.372 2.372 0 0 1-.61-.926V2.74c.15-.353.364-.67.61-.926z" fill="#00D2FF"/>
                        <path d="M17.186 8.607L13.793 12l3.393 3.393 3.82-2.183a1.41 1.41 0 0 0 0-2.42l-3.82-2.183z" fill="#FFCE00"/>
                        <path d="M3.609 22.186L13.793 12 17.186 15.393 6.012 21.78a2.38 2.38 0 0 1-2.403.406z" fill="#FF3A44"/>
                        <path d="M3.609 1.814a2.38 2.38 0 0 1 2.403.406l11.174 6.387L13.793 12 3.61 1.814z" fill="#00E676"/>
                      </svg>
                      <span>{lang === 'bn' ? 'Android / Google Play Store লিংক *' : 'Android / Google Play Store URL *'}</span>
                    </label>

                    {formData.androidAppUrl && (
                      <a
                        href={formData.androidAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                      >
                        <span>{lang === 'bn' ? 'লিংক টেস্ট করুন' : 'Test Link'}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <input
                    type="url"
                    value={formData.androidAppUrl || ''}
                    onChange={e => setFormData({ ...formData, androidAppUrl: e.target.value })}
                    placeholder="https://play.google.com/store/apps/details?id=com.eclinicbd.app"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-primary outline-none"
                  />

                  {/* Preset Helper */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'ডিফল্ট লিংক:' : 'Quick Sample:'}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, androidAppUrl: 'https://play.google.com/store/apps/details?id=com.eclinicbd.app' })}
                      className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 hover:border-primary hover:text-primary"
                    >
                      com.eclinicbd.app
                    </button>
                  </div>
                </div>

                {/* 2. Apple iOS App Store URL */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      {/* Apple Icon */}
                      <svg className="w-4 h-4 fill-current text-slate-800" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1 .08 2.05-.51 2.68-1.26z"/>
                      </svg>
                      <span>{lang === 'bn' ? 'Apple iOS / App Store লিংক *' : 'Apple iOS / App Store URL *'}</span>
                    </label>

                    {formData.iosAppUrl && (
                      <a
                        href={formData.iosAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                      >
                        <span>{lang === 'bn' ? 'লিংক টেস্ট করুন' : 'Test Link'}</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <input
                    type="url"
                    value={formData.iosAppUrl || ''}
                    onChange={e => setFormData({ ...formData, iosAppUrl: e.target.value })}
                    placeholder="https://apps.apple.com/app/eclinic-bd/id123456789"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-primary outline-none"
                  />

                  {/* Preset Helper */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'ডিফল্ট লিংক:' : 'Quick Sample:'}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, iosAppUrl: 'https://apps.apple.com/app/eclinic-bd/id123456789' })}
                      className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 hover:border-primary hover:text-primary"
                    >
                      apps.apple.com/app/eclinic-bd
                    </button>
                  </div>
                </div>

                {/* 3. Direct APK Download URL (Optional) */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Download size={14} className="text-amber-500" />
                    <span>{lang === 'bn' ? 'সরাসরি APK ডাউনলোড লিংক (অপশনাল)' : 'Direct APK Download URL (Optional)'}</span>
                  </label>

                  <input
                    type="url"
                    value={formData.apkDownloadUrl || ''}
                    onChange={e => setFormData({ ...formData, apkDownloadUrl: e.target.value })}
                    placeholder="https://eclinicbd.com/download/eclinic-latest.apk"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Section Texts Customization */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={15} className="text-primary" />
                  <span>{lang === 'bn' ? 'সেকশনের লেখা ও টেক্সট কাস্টমাইজেশন' : 'Section Texts & Content'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'bn' ? 'টপ ব্যাজ (Badge Text)' : 'Badge Text'}
                    </label>
                    <input
                      type="text"
                      value={formData.appSectionBadge || ''}
                      onChange={e => setFormData({ ...formData, appSectionBadge: e.target.value })}
                      placeholder="e.g. 📱 গুগল প্লে ও অ্যাপ স্টোর"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'bn' ? 'ডাউনলোড কাউন্ট ব্যাজ' : 'Download Count Badge'}
                    </label>
                    <input
                      type="text"
                      value={formData.appDownloadCount || ''}
                      onChange={e => setFormData({ ...formData, appDownloadCount: e.target.value })}
                      placeholder="e.g. ৫০,০০০+ সক্রিয় ডাউনলোড"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'মূল শিরোনাম (Section Title)' : 'Main Heading Title'} *
                  </label>
                  <input
                    type="text"
                    value={formData.appSectionTitle || ''}
                    onChange={e => setFormData({ ...formData, appSectionTitle: e.target.value })}
                    placeholder="e.g. স্মার্টফোনে eClinic মোবাইল অ্যাপ ডাউনলোড করুন"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'বিস্তারিত বিবরণ (Section Description)' : 'Section Description'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.appSectionDesc || ''}
                    onChange={e => setFormData({ ...formData, appSectionDesc: e.target.value })}
                    placeholder="e.g. এক ক্লিকে ঘরে বসেই ল্যাব টেস্ট অর্ডার করুন..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'রেটিং ও রিভিউ টেক্সট' : 'Rating & Review Text'}
                  </label>
                  <input
                    type="text"
                    value={formData.appRating || ''}
                    onChange={e => setFormData({ ...formData, appRating: e.target.value })}
                    placeholder="e.g. ৪.৮ ★ (৫,০০০+ রিভিউ)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Right: Live Visual Preview Card */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Card 1: Interactive Live Preview */}
              <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>{lang === 'bn' ? 'লাইভ ওয়েবসাইট প্রিভিউ' : 'Live Website Preview'}</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    {formData.showAppDownloadSection !== false ? 'Active' : 'Hidden'}
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[11px] font-bold">
                    {formData.appSectionBadge || (lang === 'bn' ? '📱 গুগল প্লে ও অ্যাপ স্টোর' : '📱 Mobile App')}
                  </span>

                  <h4 className="text-base font-extrabold text-white leading-snug">
                    {formData.appSectionTitle || (lang === 'bn' ? 'স্মার্টফোনে eClinic মোবাইল অ্যাপ ডাউনলোড করুন' : 'Download eClinic Mobile App')}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {formData.appSectionDesc || (lang === 'bn' ? 'এক ক্লিকে ঘরে বসেই ল্যাব টেস্ট অর্ডার করুন...' : 'Order home tests right from your phone...')}
                  </p>

                  {/* Badges preview */}
                  <div className="flex items-center gap-2 pt-1 text-[10px]">
                    <span className="px-2 py-1 rounded-lg bg-slate-800 text-amber-300 font-semibold flex items-center gap-1 border border-slate-700">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      {formData.appRating || '4.8 ★'}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-slate-800 text-emerald-300 font-semibold flex items-center gap-1 border border-slate-700">
                      <Download size={11} className="text-emerald-400" />
                      {formData.appDownloadCount || '50,000+ Downloads'}
                    </span>
                  </div>

                  {/* Live Interactive Buttons */}
                  <div className="space-y-2.5 pt-2">
                    {/* Google Play */}
                    <a
                      href={formData.androidAppUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-black border border-slate-700 hover:border-sky-400 transition-all text-left group"
                    >
                      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M3.609 1.814L13.793 12 3.61 22.186a2.372 2.372 0 0 1-.61-.926V2.74c.15-.353.364-.67.61-.926z" fill="#00D2FF"/>
                        <path d="M17.186 8.607L13.793 12l3.393 3.393 3.82-2.183a1.41 1.41 0 0 0 0-2.42l-3.82-2.183z" fill="#FFCE00"/>
                        <path d="M3.609 22.186L13.793 12 17.186 15.393 6.012 21.78a2.38 2.38 0 0 1-2.403.406z" fill="#FF3A44"/>
                        <path d="M3.609 1.814a2.38 2.38 0 0 1 2.403.406l11.174 6.387L13.793 12 3.61 1.814z" fill="#00E676"/>
                      </svg>
                      <div className="flex-1">
                        <div className="text-[9px] uppercase font-semibold text-slate-400 leading-none">GET IT ON</div>
                        <div className="text-sm font-extrabold text-white leading-tight">Google Play</div>
                      </div>
                      <ExternalLink size={13} className="text-slate-500 group-hover:text-white transition-colors" />
                    </a>

                    {/* Apple App Store */}
                    <a
                      href={formData.iosAppUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-black border border-slate-700 hover:border-sky-400 transition-all text-left group"
                    >
                      <svg className="w-6 h-6 shrink-0 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1 .08 2.05-.51 2.68-1.26z"/>
                      </svg>
                      <div className="flex-1">
                        <div className="text-[9px] uppercase font-semibold text-slate-400 leading-none">Download on the</div>
                        <div className="text-sm font-extrabold text-white leading-tight">App Store</div>
                      </div>
                      <ExternalLink size={13} className="text-slate-500 group-hover:text-white transition-colors" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Tips */}
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-900 space-y-2">
                <h5 className="font-bold flex items-center gap-1.5 text-sky-950">
                  <ShieldCheck size={15} className="text-primary" />
                  <span>{lang === 'bn' ? 'প্রয়োজনীয় টিপস:' : 'Helpful Tips:'}</span>
                </h5>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-sky-800 leading-relaxed">
                  <li>{lang === 'bn' ? 'গুগল প্লে স্টোরে আপনার অ্যাপ পাবলিশ হওয়ার পর সম্পূর্ণ URL এখানে পেস্ট করুন।' : 'Paste the full live URL once your app is published on the Play Store.'}</li>
                  <li>{lang === 'bn' ? 'iOS অ্যাপ স্টোর লিংক না থাকলে সাময়িকভাবে খালি রাখতে পারেন।' : 'You can leave iOS link blank or use default placeholder if only Android app is available.'}</li>
                  <li>{lang === 'bn' ? 'সেভ করার পর হোমপেজে গিয়ে সেকশনটির কার্যকারিতা যাচাই করুন।' : 'Click Save to immediately publish these links across all site banners and footer.'}</li>
                </ul>
              </div>

            </div>

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
