import React, { useState, useEffect, useRef } from 'react';
import { Language, BookingHistoryItem, ReportItem, PatientUser } from '../types';
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
  Image as ImageIcon
} from 'lucide-react';
import { Button } from './Button';
import { ProfilePictureModal, PRESET_AVATARS } from './ProfilePictureModal';

interface UserDashboardProps {
  lang: Language;
  onLogout: () => void;
  currentPatient: PatientUser;
  onUpdateProfile: (updates: Partial<PatientUser>) => void;
  bookings: BookingHistoryItem[];
  onBookNewTest?: () => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
  lang, 
  onLogout,
  currentPatient,
  onUpdateProfile,
  bookings,
  onBookNewTest
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'reports' | 'profile'>('overview');
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
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
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
        
        {/* Sidebar */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 h-fit">
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
            <SidebarItem id="reports" icon={FileText} label={t.dashReports} count={userReports.length} />
            <SidebarItem id="profile" icon={User} label={t.dashProfile} />
            
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              {onBookNewTest && (
                <button
                  onClick={onBookNewTest}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 text-primary hover:bg-sky-100 transition-all font-bold text-xs"
                >
                  <PlusCircle size={15} />
                  <span>{t.navAppointment}</span>
                </button>
              )}

              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all text-xs font-bold"
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

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-semibold">{t.dashStatTests}</p>
                    <h4 className="text-2xl font-bold text-slate-800">{userBookings.length}</h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-semibold">{t.dashStatPending}</p>
                    <h4 className="text-2xl font-bold text-slate-800">
                      {userBookings.filter(b => b.status === 'pending').length}
                    </h4>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-semibold">{lang === 'bn' ? 'রিপোর্ট তৈরি' : 'Reports Ready'}</p>
                    <h4 className="text-2xl font-bold text-slate-800">{userReports.length}</h4>
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
                          <p className="font-bold text-slate-800 text-sm">{booking.labName}</p>
                          <p className="text-xs text-slate-500">{booking.date} • {booking.time}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{booking.testNames.join(', ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(booking.status)}
                        <p className="text-xs font-bold text-slate-800 mt-1.5">৳ {booking.totalCost}</p>
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Booking ID</th>
                      <th className="px-5 py-3.5">{lang === 'bn' ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                      <th className="px-5 py-3.5">{lang === 'bn' ? 'ডায়াগনস্টিক সেন্টার' : 'Diagnostic Center'}</th>
                      <th className="px-5 py-3.5">{lang === 'bn' ? 'টেস্টসমূহ' : 'Selected Tests'}</th>
                      <th className="px-5 py-3.5">{t.dashStatus}</th>
                      <th className="px-5 py-3.5 text-right">{lang === 'bn' ? 'বিল' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-primary text-xs">#{booking.id}</td>
                        <td className="px-5 py-4 text-slate-700 text-xs">
                          <span className="font-medium">{booking.date}</span><br/>
                          <span className="text-slate-400">{booking.time}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-800 font-semibold text-xs">{booking.labName}</td>
                        <td className="px-5 py-4 text-slate-600 text-xs max-w-xs">{booking.testNames.join(', ')}</td>
                        <td className="px-5 py-4">{getStatusBadge(booking.status)}</td>
                        <td className="px-5 py-4 text-right font-bold text-slate-800">৳ {booking.totalCost}</td>
                      </tr>
                    ))}
                    {userBookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                          {t.dashNoData}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                      className="flex items-center justify-center gap-2 text-xs font-bold"
                    >
                      <Download size={15} /> {t.dashDownload} PDF
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE EDIT TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{t.dashProfile}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'bn' ? 'আপনার ব্যক্তিগত তথ্য, যোগাযোগের ঠিকানা এবং নিরাপত্তা পাসওয়ার্ড আপডেট করুন' : 'Update your personal info, contact address, and security details'}
                  </p>
                </div>
                {saveSuccess && (
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in self-start sm:self-auto">
                    <CheckCircle size={15} /> {lang === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!'}
                  </span>
                )}
              </div>

              {saveError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <XCircle size={16} className="text-red-500 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-3xl">
                
                {/* 1. Personal Information */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-200/60 pb-2.5">
                    <User size={16} className="text-primary" />
                    <span>{lang === 'bn' ? '১. ব্যক্তিগত তথ্য (Personal Information)' : '1. Personal Information'}</span>
                  </div>

                  {/* Profile Picture Management Card */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          {lang === 'bn' ? 'প্রোফাইল ছবি ও অ্যাভাটার' : 'Profile Picture & Avatar'}
                        </label>
                        <p className="text-[11px] text-slate-500">
                          {lang === 'bn' ? 'কম্পিউটার বা মোবাইল থেকে ছবি আপলোড করুন, ক্যামেরা দিয়ে তুলুন অথবা অ্যাভাটার বাছুন' : 'Upload photo from device, snap with camera, or select an avatar'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
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

                        <Button
                          type="button"
                          onClick={() => setIsPictureModalOpen(true)}
                          className="text-xs !py-2 !px-3 font-bold flex items-center gap-1.5 shadow-sm"
                        >
                          <Camera size={14} />
                          <span>{lang === 'bn' ? 'ছবি যুক্ত / পরিবর্তন করুন' : 'Add / Change Picture'}</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 rounded-xl border border-slate-200 hover:border-primary hover:bg-sky-50 text-slate-600 hover:text-primary transition-all text-xs font-semibold flex items-center gap-1"
                          title={lang === 'bn' ? 'ডিভাইস থেকে দ্রুত আপলোড' : 'Quick File Upload'}
                        >
                          <Upload size={14} />
                        </button>

                        {(profileAvatar || currentPatient.avatar) && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileAvatar('');
                              onUpdateProfile({ avatar: '' });
                            }}
                            className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 transition-all text-xs font-semibold"
                            title={lang === 'bn' ? 'ছবি মুছে ডিফল্ট রাখুন' : 'Remove Photo'}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Avatar Strip */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-500 mr-1">
                        {lang === 'bn' ? 'দ্রুত নির্বাচন:' : 'Quick Select:'}
                      </span>
                      {PRESET_AVATARS.slice(0, 7).map((preset) => {
                        const isSelected = (profileAvatar === preset.url || (!profileAvatar && currentPatient.avatar === preset.url));
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setProfileAvatar(preset.url);
                              onUpdateProfile({ avatar: preset.url });
                            }}
                            className={`relative rounded-full p-0.5 border-2 transition-all ${
                              isSelected
                                ? 'border-primary ring-2 ring-primary/30 scale-105' 
                                : 'border-transparent hover:border-slate-300'
                            }`}
                            title={preset.label}
                          >
                            <img src={preset.url} alt={preset.label} className="w-9 h-9 rounded-full object-cover" />
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setIsPictureModalOpen(true)}
                        className="px-2.5 py-1.5 rounded-full border border-sky-200 bg-sky-50 hover:bg-sky-100 text-primary text-[11px] font-bold transition-all flex items-center gap-1"
                      >
                        <Sparkles size={12} />
                        <span>{lang === 'bn' ? 'আরও অ্যাভাটার...' : 'More Avatars...'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t.nameLabel} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder={lang === 'bn' ? 'যেমন: রাহিম আহমেদ' : 'e.g. Rahim Ahmed'}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          {t.authGender}
                        </label>
                        <select
                          value={profileGender}
                          onChange={(e) => setProfileGender(e.target.value as any)}
                          className="w-full px-2.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-primary outline-none"
                        >
                          <option value="male">{t.authMale}</option>
                          <option value="female">{t.authFemale}</option>
                          <option value="other">{t.authOther}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          {t.authAge}
                        </label>
                        <input 
                          type="number"
                          min="1"
                          max="120"
                          value={profileAge} 
                          onChange={(e) => setProfileAge(e.target.value)}
                          placeholder="32"
                          className="w-full px-2.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-primary outline-none" 
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          {t.authBloodGroup}
                        </label>
                        <select
                          value={profileBloodGroup}
                          onChange={(e) => setProfileBloodGroup(e.target.value)}
                          className="w-full px-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-primary outline-none"
                        >
                          {BLOOD_GROUPS.map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Contact & Address */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-200/60 pb-2.5">
                    <MapPin size={16} className="text-primary" />
                    <span>{lang === 'bn' ? '২. যোগাযোগ ও ঠিকানা (Contact & Address)' : '2. Contact & Address'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t.phoneLabel} <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={profilePhone} 
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="01712345678"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t.authEmail}
                      </label>
                      <input 
                        type="email" 
                        value={profileEmail} 
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {lang === 'bn' ? 'জরুরি ফোন নম্বর' : 'Emergency Contact'}
                      </label>
                      <input 
                        type="tel" 
                        value={profileEmergencyContact} 
                        onChange={(e) => setProfileEmergencyContact(e.target.value)}
                        placeholder="01800000000"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t.addrLabel} <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      rows={2} 
                      required
                      value={profileAddress} 
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder={lang === 'bn' ? 'বাড়ি নং, রোড নং, এলাকা, ঢাকা' : 'House No, Road No, Area, City'}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" 
                    />
                  </div>
                </div>

                {/* 3. Security Details */}
                <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-200/60 pb-2.5">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>{lang === 'bn' ? '৩. নিরাপত্তা ও পাসওয়ার্ড (Security Details)' : '3. Security Details'}</span>
                  </div>

                  <div className="max-w-md">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {lang === 'bn' ? 'একাউন্ট পাসওয়ার্ড' : 'Account Password'}
                    </label>
                    <input 
                      type="password" 
                      value={profilePassword} 
                      onChange={(e) => setProfilePassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করতে নতুন পাসওয়ার্ড লিখুন এবং সেভ করুন।' : 'Enter a new password to update your login security.'}
                    </p>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" className="px-8 py-3 text-xs sm:text-sm font-bold shadow-lg shadow-sky-100 flex items-center gap-2">
                    <ShieldCheck size={17} />
                    <span>{lang === 'bn' ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
                  </Button>

                  {saveSuccess && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle size={15} /> {lang === 'bn' ? 'সফলভাবে সংরক্ষিত!' : 'Saved successfully!'}
                    </span>
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
    </div>
  );
};
