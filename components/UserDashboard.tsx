import React, { useState, useEffect, useRef } from 'react';
import { Language, BookingHistoryItem, ReportItem, PatientUser, DoctorAppointment, EPrescription } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileText, 
  User, 
  LogOut, 
  ChevronRight, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  Activity,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Printer,
  Receipt,
  Stethoscope,
  Video,
  Eye,
  EyeOff,
  Building2,
  Copy,
  Check,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Button } from './Button';
import { ProfilePictureModal, PRESET_AVATARS } from './ProfilePictureModal';
import { InvoiceModal } from './InvoiceModal';
import { printOrDownloadInvoice } from '../services/invoiceService';
import { formatOrderId } from './BookingModal';
import { getStoredDoctorAppointments } from '../services/dataStorage';

interface UserDashboardProps {
  lang: Language;
  onLogout: () => void;
  currentPatient: PatientUser;
  onUpdateProfile: (updates: Partial<PatientUser>) => void;
  bookings: BookingHistoryItem[];
  onBookNewTest?: () => void;
  onOpenVideoRoom?: (appointment: DoctorAppointment) => void;
  onOpenPrescription?: (prescription: EPrescription) => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
  lang, 
  onLogout,
  currentPatient,
  onUpdateProfile,
  bookings,
  onBookNewTest,
  onOpenVideoRoom,
  onOpenPrescription
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'consultations' | 'reports' | 'profile'>('overview');
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [doctorAppointments, setDoctorAppointments] = useState<DoctorAppointment[]>(() => {
    const all = getStoredDoctorAppointments();
    if (!currentPatient.phone) return all;
    return all.filter(a => a.patientPhone === currentPatient.phone || !a.patientPhone);
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const t = TRANSLATIONS[lang];

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentPatient.name || '');
  const [profilePhone, setProfilePhone] = useState(currentPatient.phone || '');
  const [profileEmail, setProfileEmail] = useState(currentPatient.email || '');
  const [profileAddress, setProfileAddress] = useState(currentPatient.address || '');
  const [profileGender, setProfileGender] = useState<'male' | 'female' | 'other'>(currentPatient.gender || 'male');
  const [profileAge, setProfileAge] = useState(currentPatient.age?.toString() || '');
  const [profileBloodGroup, setProfileBloodGroup] = useState(currentPatient.bloodGroup || 'B+');
  const [profileEmergencyContact, setProfileEmergencyContact] = useState(currentPatient.emergencyContact || '');
  const [profilePassword, setProfilePassword] = useState(currentPatient.password || '');
  const [profileAvatar, setProfileAvatar] = useState(currentPatient.avatar || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<BookingHistoryItem | null>(null);
  const [mobileProfileTab, setMobileProfileTab] = useState<'all' | 'personal' | 'contact' | 'security' | 'card'>('all');
  const [copiedPatientId, setCopiedPatientId] = useState(false);

  const patientDisplayId = currentPatient.id?.startsWith('PAT-') 
    ? currentPatient.id 
    : (currentPatient.phone ? `PAT-${currentPatient.phone.replace(/[^0-9]/g, '').slice(-6) || '849201'}` : 'PAT-849201');

  const handleCopyPatientId = () => {
    navigator.clipboard?.writeText(patientDisplayId);
    setCopiedPatientId(true);
    setTimeout(() => setCopiedPatientId(false), 2000);
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  useEffect(() => {
    setProfileName(currentPatient.name || '');
    setProfilePhone(currentPatient.phone || '');
    setProfileEmail(currentPatient.email || '');
    setProfileAddress(currentPatient.address || '');
    setProfileGender(currentPatient.gender || 'male');
    setProfileAge(currentPatient.age?.toString() || '');
    setProfileBloodGroup(currentPatient.bloodGroup || 'B+');
    setProfileEmergencyContact(currentPatient.emergencyContact || '');
    setProfilePassword(currentPatient.password || '');
    setProfileAvatar(currentPatient.avatar || '');
  }, [currentPatient]);

  // Quick avatar update handler
  const handleSaveAvatarFromModal = (newAvatarUrl: string) => {
    setProfileAvatar(newAvatarUrl);
    onUpdateProfile({ avatar: newAvatarUrl });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDirectFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        canvas.width = maxDim;
        canvas.height = maxDim;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, maxDim, maxDim);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        handleSaveAvatarFromModal(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const initials = (currentPatient.name || 'P')
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'P';

  // Filter bookings specifically for this patient
  const userPhoneClean = currentPatient.phone.replace(/[^0-9]/g, '');
  const userBookings = bookings.filter(b => {
    const bookingPhoneClean = (b.customerPhone || '').replace(/[^0-9]/g, '');
    const matchesPhone = userPhoneClean.length > 5 && bookingPhoneClean === userPhoneClean;
    const matchesName = b.customerName && currentPatient.name && 
      b.customerName.toLowerCase().includes(currentPatient.name.toLowerCase());
    return matchesPhone || matchesName;
  });

  // Derived simulated reports from completed bookings + mock samples
  const userReports: ReportItem[] = [
    ...userBookings.filter(b => b.status === 'completed').map((b, idx) => ({
      id: `RPT-${b.id || idx}`,
      testName: b.testNames.join(', '),
      date: b.date,
      labName: b.labName,
      downloadUrl: "#"
    })),
    {
      id: "RPT-DEMO-1",
      testName: lang === 'bn' ? "ডায়াবেটিস চেকআপ (HbA1c)" : "Diabetes Checkup (HbA1c)",
      date: "2024-03-16",
      labName: lang === 'bn' ? "ল্যাবএইড ডায়াগনস্টিক সেন্টার" : "Labaid Diagnostics Center",
      downloadUrl: "#"
    },
    {
      id: "RPT-DEMO-2",
      testName: lang === 'bn' ? "কমপ্লিট ব্লাড কাউন্ট (CBC)" : "Complete Blood Count (CBC)",
      date: "2024-01-10",
      labName: lang === 'bn' ? "পপুলার ডায়াগনস্টিক সেন্টার লিঃ" : "Popular Diagnostic Centre Ltd.",
      downloadUrl: "#"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': 
        return <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> {t.statusPending}</span>;
      case 'confirmed': 
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> {t.statusConfirmed}</span>;
      case 'collected': 
        return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold flex items-center gap-1"><HeartPulse size={12}/> {lang === 'bn' ? 'স্যাম্পল সংগৃহীত' : 'Sample Collected'}</span>;
      case 'completed': 
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> {t.statusCompleted}</span>;
      case 'cancelled': 
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> {t.statusCancelled}</span>;
      default: 
        return null;
    }
  };

  const AVATAR_OPTIONS = [
    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!profileName.trim() || !profilePhone.trim() || !profileAddress.trim()) {
      setSaveError(lang === 'bn' ? 'অনুগ্রহ করে নাম, ফোন নম্বর এবং ঠিকানা পূরণ করুন।' : 'Please fill in required fields (Name, Phone, Address).');
      return;
    }

    onUpdateProfile({
      name: profileName.trim(),
      phone: profilePhone.trim(),
      email: profileEmail.trim() || undefined,
      address: profileAddress.trim(),
      gender: profileGender,
      age: profileAge.trim() || undefined,
      bloodGroup: profileBloodGroup,
      emergencyContact: profileEmergencyContact.trim() || undefined,
      password: profilePassword.trim() || undefined,
      avatar: profileAvatar || currentPatient.avatar
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const SidebarItem = ({ id, icon: Icon, label, count }: { id: typeof activeTab, icon: any, label: string, count?: number }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
        activeTab === id 
          ? 'bg-primary text-white shadow-md shadow-sky-200' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={18} />
      <span className="font-semibold">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
          activeTab === id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
        }`}>
          {count}
        </span>
      )}
      {activeTab === id && !count && <ChevronRight size={16} className="ml-auto opacity-70" />}
    </button>
  );

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-6">
        
        {/* MOBILE TOP PROFILE HEADER & HORIZONTAL TABS (Mobile View Only) */}
        <div className="block md:hidden space-y-3">
          {/* Mobile Profile Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {currentPatient.avatar || profileAvatar ? (
                  <img 
                    src={profileAvatar || currentPatient.avatar} 
                    alt={currentPatient.name} 
                    className="w-13 h-13 rounded-full border-2 border-sky-100 object-cover shadow-2xs cursor-pointer"
                    onClick={() => setIsPictureModalOpen(true)} 
                  />
                ) : (
                  <div 
                    onClick={() => setIsPictureModalOpen(true)}
                    className="w-13 h-13 rounded-full bg-gradient-to-tr from-sky-600 to-primary text-white font-black text-lg flex items-center justify-center border-2 border-sky-100 shadow-2xs cursor-pointer"
                  >
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsPictureModalOpen(true)}
                  className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow border-2 border-white"
                  title={lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change Photo'}
                >
                  <Camera size={10} />
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm truncate leading-snug">{currentPatient.name}</h3>
                  <button
                    type="button"
                    onClick={handleCopyPatientId}
                    className="text-[10px] font-mono text-sky-700 bg-sky-50 hover:bg-sky-100 px-1.5 py-0.2 rounded border border-sky-100 font-bold flex items-center gap-1 cursor-pointer"
                    title="Copy Patient ID"
                  >
                    <span>{patientDisplayId}</span>
                    {copiedPatientId ? <Check size={10} className="text-emerald-600" /> : <Copy size={9} />}
                  </button>
                </div>
                <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5 truncate">
                  <Phone size={11} className="text-primary shrink-0" />
                  <span>{currentPatient.phone}</span>
                </p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {currentPatient.bloodGroup && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                      <HeartPulse size={10} />
                      <span>{currentPatient.bloodGroup}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle size={10} />
                    <span>{lang === 'bn' ? 'ভেরিফাইড' : 'Verified'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Mobile */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onBookNewTest && (
                <button
                  onClick={onBookNewTest}
                  className="p-2 rounded-xl bg-sky-50 text-primary border border-sky-200 hover:bg-sky-100 transition-all cursor-pointer"
                  title={lang === 'bn' ? 'নতুন টেস্ট বুক করুন' : 'Book New Test'}
                >
                  <PlusCircle size={16} />
                </button>
              )}
              <button 
                onClick={onLogout}
                className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all cursor-pointer"
                title={lang === 'bn' ? 'লগআউট' : 'Logout'}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          {/* Horizontal Scrolling Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {[
              { id: 'overview' as const, icon: LayoutDashboard, label: lang === 'bn' ? 'ওভারভিউ' : 'Overview' },
              { id: 'bookings' as const, icon: CalendarDays, label: lang === 'bn' ? 'বুকিং' : 'Bookings', count: userBookings.length },
              { id: 'consultations' as const, icon: Stethoscope, label: lang === 'bn' ? 'ডাক্তার' : 'Doctors', count: doctorAppointments.length },
              { id: 'reports' as const, icon: FileText, label: lang === 'bn' ? 'রিপোর্টস' : 'Reports', count: userReports.length },
              { id: 'profile' as const, icon: User, label: lang === 'bn' ? 'প্রোফাইল' : 'Profile' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-xs shadow-sky-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Sidebar (Hidden on mobile) */}
        <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 p-5 h-fit">
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-100 text-center">
            
            {/* Interactive Avatar with Change Picture Trigger */}
            <div className="relative mb-3 group">
              {currentPatient.avatar ? (
                <img 
                  src={currentPatient.avatar} 
                  alt={currentPatient.name} 
                  className="w-20 h-20 rounded-full border-4 border-sky-100 object-cover shadow-sm group-hover:brightness-90 transition-all cursor-pointer"
                  onClick={() => setIsPictureModalOpen(true)} 
                />
              ) : (
                <div 
                  onClick={() => setIsPictureModalOpen(true)}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-primary text-white font-black text-2xl flex items-center justify-center border-4 border-sky-100 shadow-sm group-hover:scale-105 transition-all cursor-pointer"
                >
                  {initials}
                </div>
              )}

              {/* Camera edit button on avatar */}
              <button
                type="button"
                onClick={() => setIsPictureModalOpen(true)}
                className="absolute -bottom-1 -right-1 bg-primary hover:bg-sky-600 text-white p-2 rounded-full shadow-md transition-all border-2 border-white hover:scale-110"
                title={lang === 'bn' ? 'প্রোফাইল ছবি পরিবর্তন করুন' : 'Change Profile Picture'}
              >
                <Camera size={13} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPictureModalOpen(true)}
              className="text-[11px] font-bold text-primary hover:text-sky-700 hover:underline mb-2 flex items-center gap-1"
            >
              <Camera size={12} />
              <span>{lang === 'bn' ? 'ছবি পরিবর্তন / আপলোড' : 'Change Profile Picture'}</span>
            </button>

            <h3 className="font-bold text-slate-800 text-lg leading-tight">{currentPatient.name}</h3>
            <p className="text-slate-500 text-xs mt-1 flex items-center justify-center gap-1">
              <Phone size={12} /> {currentPatient.phone}
            </p>
            {currentPatient.bloodGroup && (
              <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                <HeartPulse size={12} /> {lang === 'bn' ? 'রক্তের গ্রুপ:' : 'Blood Group:'} {currentPatient.bloodGroup}
              </span>
            )}
          </div>
          
          <nav className="space-y-1.5">
            <SidebarItem id="overview" icon={LayoutDashboard} label={t.dashOverview} />
            <SidebarItem id="bookings" icon={CalendarDays} label={t.dashBookings} count={userBookings.length} />
            <SidebarItem id="consultations" icon={Stethoscope} label={lang === 'bn' ? 'ডাক্তার ও ই-প্রেসক্রিপশন' : 'Doctor & Prescriptions'} count={doctorAppointments.length} />
            <SidebarItem id="reports" icon={FileText} label={t.dashReports} count={userReports.length} />
            <SidebarItem id="profile" icon={User} label={t.dashProfile} />
            
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              {onBookNewTest && (
                <button
                  onClick={onBookNewTest}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 text-primary hover:bg-sky-100 transition-all font-bold text-xs cursor-pointer"
                >
                  <PlusCircle size={15} />
                  <span>{t.navAppointment}</span>
                </button>
              )}

              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all text-xs font-bold cursor-pointer"
              >
                <LogOut size={16} />
                <span>{t.authLogout}</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-sky-600 to-primary text-white p-6 rounded-3xl shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {t.dashWelcome} {currentPatient.name.split(' ')[0]} 👋
                  </h2>
                  <p className="text-xs text-sky-100 mt-1">
                    {lang === 'bn' 
                      ? 'আপনার স্বাস্থ্য প্রোফাইল, ল্যাব টেস্ট বুকিং এবং রিপোর্টস ড্যাশবোর্ড।' 
                      : 'Manage your appointments, download medical reports, and track test statuses.'}
                  </p>
                </div>
                {onBookNewTest && (
                  <Button onClick={onBookNewTest} variant="secondary" className="!bg-white !text-primary hover:!bg-sky-50 text-xs font-bold flex-shrink-0 shadow-md">
                    <PlusCircle size={15} className="mr-1.5" />
                    {t.navAppointment}
                  </Button>
                )}
              </div>

              {/* Stats Cards - Compact 3-col on Mobile */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-white p-3 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mb-1.5 sm:mb-0">
                    <Activity size={18} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-500 text-[10px] sm:text-xs font-semibold truncate">{t.dashStatTests}</p>
                    <h4 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">{userBookings.length}</h4>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0 mb-1.5 sm:mb-0">
                    <Clock size={18} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-500 text-[10px] sm:text-xs font-semibold truncate">{t.dashStatPending}</p>
                    <h4 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">
                      {userBookings.filter(b => b.status === 'pending').length}
                    </h4>
                  </div>
                </div>

                <div className="bg-white p-3 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mb-1.5 sm:mb-0">
                    <FileText size={18} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-500 text-[10px] sm:text-xs font-semibold truncate">{lang === 'bn' ? 'রিপোর্ট রেডি' : 'Reports Ready'}</p>
                    <h4 className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">{userReports.length}</h4>
                  </div>
                </div>
              </div>

              {/* Patient Quick Address & Profile Card */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    {lang === 'bn' ? 'হোম কালেকশন ঠিকানা' : 'Saved Sample Collection Address'}
                  </h3>
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className="text-primary text-xs font-bold hover:underline"
                  >
                    {lang === 'bn' ? 'পরিবর্তন করুন' : 'Edit Address'}
                  </button>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {currentPatient.address || (lang === 'bn' ? 'কোনো ঠিকানা দেওয়া হয়নি।' : 'No address specified yet.')}
                </p>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm">{t.dashRecentActivity}</h3>
                  <button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-primary hover:underline">
                    {lang === 'bn' ? 'সবগুলো দেখুন' : 'View All'}
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {userBookings.slice(0, 4).map(booking => (
                    <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex gap-3.5 items-center">
                        <div className="bg-sky-50 p-2.5 rounded-xl text-primary">
                          <CalendarDays size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800 text-sm">{booking.labName}</p>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">{formatOrderId(booking.id)}</span>
                          </div>
                          <p className="text-xs text-slate-500">{booking.date} • {booking.time}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{booking.testNames.join(', ')}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          {getStatusBadge(booking.status)}
                          <p className="text-xs font-bold text-slate-800 mt-1.5">৳ {booking.totalCost}</p>
                        </div>
                        <button
                          onClick={() => setSelectedInvoiceBooking(booking)}
                          className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-primary rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-sky-100 cursor-pointer shadow-2xs"
                          title={lang === 'bn' ? 'ইনভয়েস দেখুন ও ডাউনলোড করুন' : 'View & Download Invoice'}
                        >
                          <Download size={13} />
                          <span className="hidden sm:inline">{lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {userBookings.length === 0 && (
                    <div className="p-8 text-center text-slate-400">
                      <CalendarDays size={36} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">{lang === 'bn' ? 'এখনো কোনো টেস্ট বুকিং করা হয়নি।' : 'No test bookings found.'}</p>
                      {onBookNewTest && (
                        <Button onClick={onBookNewTest} variant="outline" className="mt-3 text-xs">
                          {t.heroBtnBook}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{t.dashBookings}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'bn' ? 'আপনার সকল বুকিংয়ের বিস্তারিত ও বর্তমান অবস্থা' : 'Detailed history and real-time statuses of all your lab tests'}
                  </p>
                </div>
                {onBookNewTest && (
                  <Button onClick={onBookNewTest} variant="primary" className="!py-1.5 !px-3 text-xs">
                    <PlusCircle size={14} className="mr-1" />
                    {lang === 'bn' ? 'নতুন বুকিং' : 'New Booking'}
                  </Button>
                )}
              </div>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Booking ID</th>
                      <th className="px-5 py-3.5">{lang === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                      <th className="px-5 py-3.5">{lang === 'bn' ? 'ডায়াগনস্টিক সেন্টার' : 'Diagnostic Center'}</th>
                      <th className="px-5 py-3.5">{lang === 'bn' ? 'টেস্টসমূহ' : 'Selected Tests'}</th>
                      <th className="px-5 py-3.5">{t.dashStatus}</th>
                      <th className="px-5 py-3.5 text-right">{lang === 'bn' ? 'বিল' : 'Amount'}</th>
                      <th className="px-5 py-3.5 text-center">{lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-primary text-xs">{formatOrderId(booking.id)}</td>
                        <td className="px-5 py-4 text-slate-700 text-xs">
                          <span className="font-medium">{booking.date}</span><br/>
                          <span className="text-slate-400">{booking.time}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-800 font-semibold text-xs">{booking.labName}</td>
                        <td className="px-5 py-4 text-slate-600 text-xs max-w-xs">{booking.testNames.join(', ')}</td>
                        <td className="px-5 py-4">{getStatusBadge(booking.status)}</td>
                        <td className="px-5 py-4 text-right font-bold text-slate-800">৳ {booking.totalCost}</td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => setSelectedInvoiceBooking(booking)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all border border-sky-100 hover:border-primary cursor-pointer shadow-2xs"
                            title={lang === 'bn' ? 'ইনভয়েস ডাউনলোড বা প্রিন্ট করুন' : 'Download or Print Invoice'}
                          >
                            <Download size={13} />
                            <span>{lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {userBookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                          {t.dashNoData}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (Optimized for Mobile Screens) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {userBookings.map(booking => (
                  <div key={booking.id} className="p-4 space-y-3 bg-white">
                    {/* Header: Order ID & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-primary text-xs bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                          {formatOrderId(booking.id)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrderId(formatOrderId(booking.id))}
                          className="text-slate-400 hover:text-primary transition-colors p-0.5"
                          title="Copy ID"
                        >
                          {copiedOrderId === formatOrderId(booking.id) ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    {/* Diagnostic Center & Date/Time */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-900 text-xs font-bold">
                        <Building2 size={14} className="text-primary shrink-0" />
                        <span className="truncate">{booking.labName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>{booking.date} • {booking.time}</span>
                      </div>
                    </div>

                    {/* Selected Tests */}
                    <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'bn' ? 'নির্বাচিত টেস্টসমূহ:' : 'Selected Tests:'}
                      </p>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {booking.testNames.join(', ')}
                      </p>
                    </div>

                    {/* Footer: Amount & Download Invoice Button */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {lang === 'bn' ? 'মোট বিল' : 'Total Amount'}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          ৳ {booking.totalCost}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedInvoiceBooking(booking)}
                        className="px-3.5 py-2 bg-sky-50 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all border border-sky-200 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Download size={13} />
                        <span>{lang === 'bn' ? 'ইনভয়েস ডাউনলোড' : 'Invoice'}</span>
                      </button>
                    </div>
                  </div>
                ))}

                {userBookings.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs">{t.dashNoData}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOCTOR CONSULTATIONS & E-PRESCRIPTIONS TAB */}
          {activeTab === 'consultations' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {lang === 'bn' ? 'ডাক্তার অ্যাপয়েন্টমেন্ট ও ডিজিটাল ই-প্রেসক্রিপশন' : 'Doctor Appointments & E-Prescriptions'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lang === 'bn' ? 'আপনার ৩০ মিনিটের নির্ধারিত ভিডিও কনসালটেন্সি স্লট ও ভেরিফাইড প্রেসক্রিপশন' : 'Your scheduled 30-min video consults and verified prescriptions'}
                  </p>
                </div>
                {onBookNewTest && (
                  <button
                    onClick={onBookNewTest}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Stethoscope size={14} />
                    <span>{lang === 'bn' ? 'নতুন ডাক্তার বুক করুন' : 'Book Doctor'}</span>
                  </button>
                )}
              </div>

              {doctorAppointments.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
                  <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-sm">
                    {lang === 'bn' ? 'কোনো ডাক্তার অ্যাপয়েন্টমেন্টের রেকর্ড নেই' : 'No doctor consultation appointments yet'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {lang === 'bn' 
                      ? 'হোমপেজের ডাক্তার কন্সালটেন্সি সেকশন থেকে দেশসেরা বিশেষজ্ঞ চিকিৎসকদের সাথে অ্যাপয়েন্টমেন্ট ও ভিডিও কল বুক করুন।' 
                      : 'Book appointments and HD live video consultations with verified specialist doctors on the homepage.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {doctorAppointments.map(apt => (
                    <div key={apt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                      <div className="flex items-start sm:items-center gap-4">
                        <img
                          src={apt.doctorImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'}
                          alt={apt.doctorName}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                              {apt.id}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {apt.consultationType} Call
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{apt.doctorName}</h4>
                          <p className="text-xs text-slate-500 font-medium">{apt.doctorSpecialty} &bull; {apt.doctorHospital}</p>
                          <p className="text-[11px] text-slate-600 mt-1 font-semibold flex items-center gap-1.5">
                            <Clock size={12} className="text-sky-600" />
                            <span>{apt.appointmentDate} &bull; {apt.appointmentTimeSlot}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {apt.consultationType === 'video' && onOpenVideoRoom && (
                          <button
                            onClick={() => onOpenVideoRoom(apt)}
                            className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Video size={14} />
                            <span>{lang === 'bn' ? 'ভিডিও রুমে প্রবেশ' : 'Join Video'}</span>
                          </button>
                        )}

                        {apt.prescription && onOpenPrescription && (
                          <button
                            onClick={() => onOpenPrescription(apt.prescription!)}
                            className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-sky-200 cursor-pointer"
                          >
                            <FileText size={14} />
                            <span>{lang === 'bn' ? 'ই-প্রেসক্রিপশন' : 'Prescription'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 text-base">{t.dashReports}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'bn' ? 'অনলাইন টেস্ট রিপোর্টসমূহ ডাউনলোড করুন' : 'View and download verified PDF diagnostic reports'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {userReports.map(report => (
                  <div key={report.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{report.testName}</h4>
                        <p className="text-xs text-slate-500 font-medium">{report.labName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{lang === 'bn' ? 'তারিখ:' : 'Generated on:'} {report.date}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => alert(lang === 'bn' ? 'রিপোর্ট ডাউনলোড শুরু হচ্ছে...' : 'Downloading report PDF...')} 
                      variant="outline" 
                      className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold py-2.5 sm:py-2"
                    >
                      <Download size={15} /> {t.dashDownload} PDF
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE EDIT TAB - MOBILE-OPTIMIZED & ORGANIZED */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-3.5 sm:p-6 md:p-8 animate-in fade-in duration-300">
              
              {/* Profile Tab Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-100 gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-50 text-primary flex items-center justify-center shrink-0 border border-sky-100">
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-base sm:text-lg">{t.dashProfile}</h3>
                      <button
                        type="button"
                        onClick={handleCopyPatientId}
                        className="text-[10px] font-mono text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200 font-bold flex items-center gap-1 cursor-pointer"
                        title="Copy Patient ID"
                      >
                        <span>{patientDisplayId}</span>
                        {copiedPatientId ? <Check size={10} className="text-emerald-600" /> : <Copy size={9} />}
                      </button>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      {lang === 'bn' ? 'ব্যক্তিগত তথ্য, যোগাযোগ ঠিকানা, ডিজিটাল কার্ড ও সিকিউরিটি' : 'Personal info, contact address, digital card & security'}
                    </p>
                  </div>
                </div>

                {saveSuccess && (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in self-start sm:self-auto shrink-0 shadow-2xs">
                    <CheckCircle size={14} /> {lang === 'bn' ? 'প্রোফাইল সফলভাবে সংরক্ষিত!' : 'Profile updated successfully!'}
                  </span>
                )}
              </div>

              {/* Mobile Quick Option Navigator Pills (Mobile Only) */}
              <div className="block md:hidden mb-4">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 -mx-1">
                  {[
                    { id: 'all' as const, label: lang === 'bn' ? 'সব অপশন' : 'All Options', icon: Sparkles },
                    { id: 'personal' as const, label: lang === 'bn' ? 'ব্যক্তিগত' : 'Personal', icon: User },
                    { id: 'contact' as const, label: lang === 'bn' ? 'যোগাযোগ' : 'Contact', icon: MapPin },
                    { id: 'security' as const, label: lang === 'bn' ? 'পাসওয়ার্ড' : 'Password', icon: ShieldCheck },
                    { id: 'card' as const, label: lang === 'bn' ? 'আইডি কার্ড' : 'ID Card', icon: CreditCard }
                  ].map(sec => {
                    const Icon = sec.icon;
                    const isSecActive = mobileProfileTab === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setMobileProfileTab(sec.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                          isSecActive
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon size={12} className={isSecActive ? 'text-white' : 'text-slate-400'} />
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {saveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <XCircle size={16} className="text-red-500 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-5 max-w-3xl">
                
                {/* 1. Profile Picture & Avatar Option */}
                {(mobileProfileTab === 'all' || mobileProfileTab === 'personal') && (
                  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                        <Camera size={16} className="text-primary" />
                        <span>{lang === 'bn' ? '১. প্রোফাইল ছবি ও অ্যাভাটার' : '1. Profile Picture & Avatar'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {lang === 'bn' ? 'পেশেন্ট ফটো' : 'Patient Photo'}
                      </span>
                    </div>

                    {/* Mobile Avatar Visual Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {profileAvatar || currentPatient.avatar ? (
                            <img 
                              src={profileAvatar || currentPatient.avatar} 
                              alt={currentPatient.name} 
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-sky-200 object-cover shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setIsPictureModalOpen(true)}
                            />
                          ) : (
                            <div 
                              onClick={() => setIsPictureModalOpen(true)}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-sky-600 to-primary text-white font-black text-xl flex items-center justify-center border-2 border-sky-200 shadow-2xs cursor-pointer"
                            >
                              {initials}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsPictureModalOpen(true)}
                            className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow border-2 border-white cursor-pointer hover:bg-sky-600 transition-colors"
                            title={lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change Photo'}
                          >
                            <Camera size={11} />
                          </button>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-snug">
                            {lang === 'bn' ? 'বর্তমান প্রোফাইল ফটো' : 'Current Profile Photo'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {lang === 'bn' ? 'ছবি পরিবর্তন করুন বা গ্যালারি থেকে আপলোড করুন' : 'Change avatar or upload from device gallery'}
                          </p>
                        </div>
                      </div>

                      {/* Mobile Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap pt-1 sm:pt-0">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleDirectFileUpload(e.target.files[0]);
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => setIsPictureModalOpen(true)}
                          className="flex-1 sm:flex-initial px-3 py-2 bg-primary hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Camera size={13} />
                          <span>{lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change Photo'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-slate-200 hover:border-primary hover:bg-sky-50 text-slate-700 hover:text-primary transition-all text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                        >
                          <Upload size={13} />
                          <span>{lang === 'bn' ? 'আপলোড' : 'Upload'}</span>
                        </button>

                        {(profileAvatar || currentPatient.avatar) && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileAvatar('');
                              onUpdateProfile({ avatar: '' });
                            }}
                            className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 transition-all text-xs font-semibold cursor-pointer shrink-0"
                            title={lang === 'bn' ? 'ছবি মুছে ডিফল্ট রাখুন' : 'Remove Photo'}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Avatar Strip */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>{lang === 'bn' ? 'জনপ্রিয় অ্যাভাটার নির্বাচন:' : 'Quick Preset Avatars:'}</span>
                        <button
                          type="button"
                          onClick={() => setIsPictureModalOpen(true)}
                          className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={11} />
                          <span>{lang === 'bn' ? 'আরও অ্যাভাটার...' : 'More Avatars...'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        {PRESET_AVATARS.slice(0, 8).map((preset) => {
                          const isSelected = (profileAvatar === preset.url || (!profileAvatar && currentPatient.avatar === preset.url));
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                setProfileAvatar(preset.url);
                                onUpdateProfile({ avatar: preset.url });
                              }}
                              className={`relative rounded-full p-0.5 border-2 transition-all shrink-0 cursor-pointer ${
                                isSelected
                                  ? 'border-primary ring-2 ring-primary/40 scale-105' 
                                  : 'border-transparent hover:border-slate-300'
                              }`}
                              title={preset.label}
                            >
                              <img src={preset.url} alt={preset.label} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover" />
                              {isSelected && (
                                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-white rounded-full flex items-center justify-center text-[8px] font-black">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Personal Information Option */}
                {(mobileProfileTab === 'all' || mobileProfileTab === 'personal') && (
                  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                        <User size={16} className="text-primary" />
                        <span>{lang === 'bn' ? '২. ব্যক্তিগত তথ্য' : '2. Personal Information'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {lang === 'bn' ? 'নাম, লিঙ্গ ও বয়স' : 'Name, Gender & Age'}
                      </span>
                    </div>

                    {/* Patient Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t.nameLabel} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                          type="text" 
                          required
                          value={profileName} 
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder={lang === 'bn' ? 'যেমন: রাহিম আহমেদ' : 'e.g. Rahim Ahmed'}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                        />
                      </div>
                    </div>

                    {/* Gender Selection: 3-Column Mobile Tactile Cards */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t.authGender}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'male', labelBn: 'পুরুষ', labelEn: 'Male', emoji: '👨' },
                          { id: 'female', labelBn: 'মহিলা', labelEn: 'Female', emoji: '👩' },
                          { id: 'other', labelBn: 'অন্যান্য', labelEn: 'Other', emoji: '🧑' }
                        ].map(g => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setProfileGender(g.id as any)}
                            className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              profileGender === g.id
                                ? 'bg-sky-50 text-primary border-primary ring-2 ring-primary/20 font-black shadow-2xs'
                                : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-sm">{g.emoji}</span>
                            <span className="truncate">{lang === 'bn' ? g.labelBn : g.labelEn}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Age & Blood Group: Clean 2-Column Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-0.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          {t.authAge} ({lang === 'bn' ? 'বছর' : 'Yrs'})
                        </label>
                        <input 
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="120"
                          value={profileAge} 
                          onChange={(e) => setProfileAge(e.target.value)}
                          placeholder="30"
                          className="w-full px-3.5 py-2.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <HeartPulse size={12} className="text-rose-500" />
                            <span>{t.authBloodGroup}</span>
                          </span>
                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                            {profileBloodGroup}
                          </span>
                        </label>
                        <select
                          value={profileBloodGroup}
                          onChange={(e) => setProfileBloodGroup(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all"
                        >
                          {BLOOD_GROUPS.map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Contact & Address Option */}
                {(mobileProfileTab === 'all' || mobileProfileTab === 'contact') && (
                  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                        <MapPin size={16} className="text-primary" />
                        <span>{lang === 'bn' ? '৩. যোগাযোগ ও স্যাম্পল কালেকশন ঠিকানা' : '3. Contact & Address'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {lang === 'bn' ? 'ফোন ও ঠিকানা' : 'Phone & Location'}
                      </span>
                    </div>

                    {/* Primary Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>{t.phoneLabel} <span className="text-red-500">*</span></span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                          {lang === 'bn' ? 'লগইন নম্বর' : 'Login Phone'}
                        </span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                          type="tel" 
                          inputMode="tel"
                          required
                          value={profilePhone} 
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="01712345678"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" 
                        />
                      </div>
                    </div>

                    {/* Email & Emergency Phone (Stacked on Mobile, 2-Col on Desktop) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          {t.authEmail}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input 
                            type="email" 
                            inputMode="email"
                            value={profileEmail} 
                            onChange={(e) => setProfileEmail(e.target.value)}
                            placeholder="patient@example.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          {lang === 'bn' ? 'জরুরি ফোন নম্বর' : 'Emergency Contact'}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <input 
                            type="tel" 
                            inputMode="tel"
                            value={profileEmergencyContact} 
                            onChange={(e) => setProfileEmergencyContact(e.target.value)}
                            placeholder="01800000000"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Textarea */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>{t.addrLabel} <span className="text-red-500">*</span></span>
                        <span className="text-[10px] text-slate-400">
                          {lang === 'bn' ? 'হোম স্যাম্পল কালেকশন' : 'Home Sample Dispatch'}
                        </span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
                        <textarea 
                          rows={3} 
                          required
                          value={profileAddress} 
                          onChange={(e) => setProfileAddress(e.target.value)}
                          placeholder={lang === 'bn' ? 'বাড়ি নং, ফ্ল্যাট, রোড নং, এলাকা/থানা, জেলা (যেমন: ধানমন্ডি, ঢাকা)' : 'House No, Flat, Road No, Area, City (e.g. Dhanmondi, Dhaka)'}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed transition-all" 
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {lang === 'bn' ? '💡 ল্যাব টেস্টের হোম স্যাম্পল কালেকশনের জন্য আমাদের টেকনোলজিস্ট এই ঠিকানায় উপস্থিত হবেন।' : '💡 Certified phlebotomist will visit this address for safe home sample collection.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Security Details Option */}
                {(mobileProfileTab === 'all' || mobileProfileTab === 'security') && (
                  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                        <ShieldCheck size={16} className="text-primary" />
                        <span>{lang === 'bn' ? '৪. একাউন্ট নিরাপত্তা ও পাসওয়ার্ড' : '4. Security Details & Password'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {lang === 'bn' ? 'লগইন পাসওয়ার্ড' : 'Access Credentials'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'Account Password'}
                      </label>
                      <div className="relative max-w-md">
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          value={profilePassword} 
                          onChange={(e) => setProfilePassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-4 pr-11 py-2.5 bg-slate-50/60 focus:bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                          title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করতে নতুন পাসওয়ার্ড লিখুন এবং নিচের সেভ বাটনে চাপুন।' : 'Enter a new password to update your login security credentials.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. Digital Patient ID Card Option */}
                {(mobileProfileTab === 'all' || mobileProfileTab === 'card') && (
                  <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                        <CreditCard size={16} className="text-primary" />
                        <span>{lang === 'bn' ? '৫. ডিজিটাল পেশেন্ট কার্ড' : '5. Digital Patient ID Card'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPatientId}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={11} />
                        <span>{copiedPatientId ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'আইডি কপি' : 'Copy ID')}</span>
                      </button>
                    </div>

                    {/* Mobile Health Card Visual Presentation */}
                    <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-sky-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-sky-500/20 relative overflow-hidden">
                      {/* Decorative background glows */}
                      <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                            <Stethoscope size={15} />
                          </div>
                          <div>
                            <span className="text-[11px] font-black tracking-wider text-sky-200 uppercase block leading-tight">eClinic Bangladesh</span>
                            <span className="text-[9px] text-white/60 block">{lang === 'bn' ? 'ডিজিটাল মেডিকেল পেশেন্ট কার্ড' : 'Digital Medical Patient Card'}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                          <CheckCircle size={10} />
                          <span>VERIFIED</span>
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="py-3.5 flex items-center gap-3 relative z-10">
                        <div className="relative shrink-0">
                          {profileAvatar || currentPatient.avatar ? (
                            <img 
                              src={profileAvatar || currentPatient.avatar} 
                              alt={currentPatient.name} 
                              className="w-13 h-13 rounded-full border-2 border-sky-400/60 object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-13 h-13 rounded-full bg-sky-600 text-white font-black text-lg flex items-center justify-center border-2 border-sky-400/60 shadow-sm">
                              {initials}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-white text-sm sm:text-base leading-snug truncate">{currentPatient.name}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="font-mono text-[11px] text-sky-300 font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                              {patientDisplayId}
                            </span>
                            {currentPatient.bloodGroup && (
                              <span className="text-[11px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full shadow-2xs">
                                {currentPatient.bloodGroup}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/70 mt-1 flex items-center gap-1">
                            <Phone size={10} className="text-sky-300 shrink-0" />
                            <span>{currentPatient.phone}</span>
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60 relative z-10">
                        <div className="truncate max-w-[200px]">
                          <span>{currentPatient.address || (lang === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sky-300 font-mono font-bold shrink-0">
                          <QrCode size={13} />
                          <span>ID-SECURED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Quick Dashboard Shortcuts (When All is Selected) */}
                {mobileProfileTab === 'all' && (
                  <div className="block md:hidden bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                        <Sparkles size={14} className="text-amber-500" />
                        <span>{lang === 'bn' ? '৬. কুইক অপশন শর্টকাট' : '6. Quick Service Shortcuts'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('bookings')}
                        className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col items-center text-center cursor-pointer hover:bg-sky-100 transition-colors"
                      >
                        <CalendarDays size={18} className="text-primary mb-1" />
                        <span className="text-[11px] font-bold text-slate-800 leading-tight">{lang === 'bn' ? 'বুকিংস' : 'Bookings'}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{userBookings.length} {lang === 'bn' ? 'টি' : 'Items'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('consultations')}
                        className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex flex-col items-center text-center cursor-pointer hover:bg-emerald-100 transition-colors"
                      >
                        <Stethoscope size={18} className="text-emerald-600 mb-1" />
                        <span className="text-[11px] font-bold text-slate-800 leading-tight">{lang === 'bn' ? 'ডাক্তার' : 'Doctors'}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{doctorAppointments.length} {lang === 'bn' ? 'টি' : 'Appts'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('reports')}
                        className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 flex flex-col items-center text-center cursor-pointer hover:bg-purple-100 transition-colors"
                      >
                        <FileText size={18} className="text-purple-600 mb-1" />
                        <span className="text-[11px] font-bold text-slate-800 leading-tight">{lang === 'bn' ? 'রিপোর্টস' : 'Reports'}</span>
                        <span className="text-[9px] text-slate-500 mt-0.5">{userReports.length} {lang === 'bn' ? 'টি' : 'Ready'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit / Save Changes Button - Mobile-first Prominent Touch Target */}
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto px-8 py-3.5 sm:py-3 text-sm font-bold shadow-md shadow-sky-100 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <ShieldCheck size={18} />
                    <span>{lang === 'bn' ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
                  </Button>

                  {saveSuccess && (
                    <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                      <CheckCircle size={15} className="text-emerald-600" />
                      <span>{lang === 'bn' ? 'সকল তথ্য সফলভাবে আপডেট হয়েছে!' : 'All profile changes saved successfully!'}</span>
                    </div>
                  )}
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Profile Picture Management Modal */}
      <ProfilePictureModal 
        isOpen={isPictureModalOpen}
        onClose={() => setIsPictureModalOpen(false)}
        lang={lang}
        currentAvatar={profileAvatar || currentPatient.avatar}
        userName={currentPatient.name}
        onSaveAvatar={handleSaveAvatarFromModal}
      />

      {/* Official Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoiceBooking}
        onClose={() => setSelectedInvoiceBooking(null)}
        order={selectedInvoiceBooking}
        lang={lang}
      />
    </div>
  );
};
