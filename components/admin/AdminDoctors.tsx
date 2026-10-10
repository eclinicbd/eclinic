import React, { useState, useRef, useEffect } from 'react';
import { Doctor, Language, DoctorAppointment, EPrescription } from '../../types';
import { 
  Stethoscope, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Eye, 
  EyeOff, 
  Search, 
  Star, 
  Video, 
  Clock, 
  Building2, 
  Filter, 
  CheckCircle2, 
  X, 
  Sparkles, 
  FileText, 
  Calendar,
  Phone,
  User,
  ShieldCheck,
  AlertCircle,
  Upload,
  Camera,
  Minus,
  Link,
  CalendarClock,
  CalendarOff,
  RotateCcw,
  Save,
  CheckCircle,
  XCircle,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  getStoredDoctors, 
  setStoredDoctors, 
  getStoredDoctorAppointments, 
  saveStoredDoctorAppointments,
  saveEPrescription 
} from '../../services/dataStorage';

interface AdminDoctorsProps {
  lang: Language;
  doctors: Doctor[];
  onUpdateDoctors: (doctors: Doctor[]) => void;
  onOpenPrescriptionViewer?: (prescription: EPrescription) => void;
  onJoinVideoAsDoctor?: (appointment: DoctorAppointment) => void;
}

export const toBnNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
};

export const parseTimeToMinutes = (timeStr: string): number => {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const formatMinutesToTime = (totalMinutes: number): string => {
  let hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)} ${period}`;
};

export const generateSlotsByInterval = (startStr: string, endStr: string, intervalMin: number): string[] => {
  const startMin = parseTimeToMinutes(startStr);
  const endMin = parseTimeToMinutes(endStr);
  if (endMin <= startMin || intervalMin <= 0) return [];
  const slots: string[] = [];
  let cur = startMin;
  while (cur + intervalMin <= endMin) {
    const sTime = formatMinutesToTime(cur);
    const eTime = formatMinutesToTime(cur + intervalMin);
    slots.push(`${sTime} - ${eTime}`);
    cur += intervalMin;
  }
  return slots;
};

export const WEEKLY_DAYS_MAP = [
  { id: 'Friday', bn: 'শুক্রবার', shortBn: 'শুক্র', en: 'Friday' },
  { id: 'Saturday', bn: 'শনিবার', shortBn: 'শনি', en: 'Saturday' },
  { id: 'Sunday', bn: 'রবিবার', shortBn: 'রবি', en: 'Sunday' },
  { id: 'Monday', bn: 'সোমবার', shortBn: 'সোম', en: 'Monday' },
  { id: 'Tuesday', bn: 'মঙ্গলবার', shortBn: 'মঙ্গল', en: 'Tuesday' },
  { id: 'Wednesday', bn: 'বুধবার', shortBn: 'বুধ', en: 'Wednesday' },
  { id: 'Thursday', bn: 'বৃহস্পতিবার', shortBn: 'বৃহঃ', en: 'Thursday' }
];

export const AdminDoctors: React.FC<AdminDoctorsProps> = ({
  lang,
  doctors,
  onUpdateDoctors,
  onOpenPrescriptionViewer,
  onJoinVideoAsDoctor
}) => {
  const isBn = lang === 'bn';
  const [activeSubTab, setActiveSubTab] = useState<'doctors' | 'slots' | 'appointments'>('doctors');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals state
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Appointments state
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(getStoredDoctorAppointments);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ==========================================
  // DATE, SLOT & OFF-DAYS MANAGEMENT STATE
  // ==========================================
  const [slotDoctorId, setSlotDoctorId] = useState<string>('all');
  const [slotInterval, setSlotInterval] = useState<number>(30);
  const [weeklyOffDays, setWeeklyOffDays] = useState<string[]>(['Friday']);
  const [specificOffDates, setSpecificOffDates] = useState<string[]>([]);
  const [newOffDateInput, setNewOffDateInput] = useState<string>('');
  const [customSlotList, setCustomSlotList] = useState<string[]>([
    '05:00 PM - 05:30 PM',
    '05:30 PM - 06:00 PM',
    '06:00 PM - 06:30 PM',
    '06:30 PM - 07:00 PM',
    '07:00 PM - 07:30 PM',
    '07:30 PM - 08:00 PM',
    '08:00 PM - 08:30 PM',
    '08:30 PM - 09:00 PM'
  ]);
  const [newCustomSlotInput, setNewCustomSlotInput] = useState<string>('');
  const [editingSlotIdx, setEditingSlotIdx] = useState<number | null>(null);
  const [editingSlotVal, setEditingSlotVal] = useState<string>('');
  const [autoGenStart, setAutoGenStart] = useState<string>('05:00 PM');
  const [autoGenEnd, setAutoGenEnd] = useState<string>('09:00 PM');

  // Load slot config when selected doctor changes
  useEffect(() => {
    if (slotDoctorId === 'all') {
      const firstDoc = doctors[0];
      const interval = firstDoc?.slotIntervalMinutes || 30;
      setSlotInterval(interval);
      if (firstDoc?.customSlots && firstDoc.customSlots.length > 0) {
        setCustomSlotList(firstDoc.customSlots);
      } else {
        setCustomSlotList(generateSlotsByInterval('05:00 PM', '09:00 PM', interval));
      }
      if (firstDoc?.offDays && firstDoc.offDays.length > 0) {
        const weekly = firstDoc.offDays.filter(d => !d.includes('-'));
        const dates = firstDoc.offDays.filter(d => d.includes('-'));
        setWeeklyOffDays(weekly.length > 0 ? weekly : ['Friday']);
        setSpecificOffDates(dates);
      }
    } else {
      const doc = doctors.find(d => d.id === slotDoctorId);
      if (doc) {
        const interval = doc.slotIntervalMinutes || 30;
        setSlotInterval(interval);
        if (doc.customSlots && doc.customSlots.length > 0) {
          setCustomSlotList(doc.customSlots);
        } else {
          setCustomSlotList(generateSlotsByInterval('05:00 PM', '09:00 PM', interval));
        }
        if (doc.offDays && doc.offDays.length > 0) {
          const weekly = doc.offDays.filter(d => !d.includes('-'));
          const dates = doc.offDays.filter(d => d.includes('-'));
          setWeeklyOffDays(weekly);
          setSpecificOffDates(dates);
        } else {
          setWeeklyOffDays(['Friday']);
          setSpecificOffDates([]);
        }
      }
    }
  }, [slotDoctorId, doctors]);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    title: 'ডাঃ',
    specialty: '',
    department: 'Medicine',
    degrees: '',
    bmdcRegNo: '',
    hospital: '',
    experienceYears: 10,
    rating: 4.9,
    reviewCount: 0,
    totalConsultations: 0,
    orderCount: 0,
    consultationFee: 500,
    originalFee: 800,
    discountPercent: 37,
    followupFee: 300,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    gender: 'male',
    availableTimeText: 'প্রতিদিন সন্ধ্যা ৬:০০ - রাত ৯:০০',
    slotIntervalMinutes: 30,
    consultationTypes: ['video', 'audio'],
    about: '',
    isActive: true,
    offDays: ['Friday']
  });

  const departments = [
    { id: 'all', label: isBn ? 'সকল বিভাগ' : 'All Departments' },
    { id: 'Medicine', label: isBn ? 'মেডিসিন ও ডায়াবেটিস' : 'Medicine & Diabetes' },
    { id: 'Gynecology', label: isBn ? 'গাইনী ও প্রসূতিবিদ্যা' : 'Gynecology & OBGYN' },
    { id: 'Cardiology', label: isBn ? 'কার্ডিওলজি ও হৃদরোগ' : 'Cardiology' },
    { id: 'Pediatrics', label: isBn ? 'শিশু ও কিশোর রোগ' : 'Pediatrics' },
    { id: 'Dermatology', label: isBn ? 'চর্ম ও যৌন রোগ' : 'Dermatology' },
    { id: 'General Physician', label: isBn ? 'জেনারেল ফিজিশিয়ান' : 'General Physician' },
    { id: 'Neurology', label: isBn ? 'নিউরোলজি ও ব্রেইন' : 'Neurology' }
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchDept = departmentFilter === 'all' || doctor.department === departmentFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchDept;

    const matchSearch =
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialty.toLowerCase().includes(query) ||
      doctor.hospital.toLowerCase().includes(query) ||
      (doctor.bmdcRegNo && doctor.bmdcRegNo.toLowerCase().includes(query));

    return matchDept && matchSearch;
  });

  // Toggle Doctor Active / Inactive with Instant Toast & Global Sync
  const handleToggleDoctorStatus = (doctor: Doctor) => {
    const nextStatus = doctor.isActive === false ? true : false;
    const updated = doctors.map(d => {
      if (d.id === doctor.id) {
        return { ...d, isActive: nextStatus };
      }
      return d;
    });
    onUpdateDoctors(updated);
    setStoredDoctors(updated, lang);
    showToast(nextStatus 
      ? (isBn ? `✓ ${doctor.name} সক্রিয় (Active) করা হয়েছে - হোমপেজে প্রদর্শিত হবে` : `✓ ${doctor.name} is now Active (visible on homepage)`)
      : (isBn ? `✕ ${doctor.name} নিষ্ক্রিয় (Inactive) করা হয়েছে - হোমপেজ থেকে লুকানো হয়েছে` : `✕ ${doctor.name} is now Inactive (hidden from homepage)`)
    );
  };

  // Quick adjust consult count (+ / -)
  const handleQuickAdjustConsults = (doctor: Doctor, delta: number) => {
    const current = doctor.orderCount !== undefined ? doctor.orderCount : (doctor.totalConsultations || 0);
    const nextVal = Math.max(0, current + delta);
    const updated = doctors.map(d => {
      if (d.id === doctor.id) {
        return { ...d, orderCount: nextVal, totalConsultations: nextVal };
      }
      return d;
    });
    onUpdateDoctors(updated);
    setStoredDoctors(updated, lang);
  };

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      id: `doc_${Date.now().toString().slice(-4)}`,
      name: '',
      title: isBn ? 'ডাঃ' : 'Dr.',
      specialty: '',
      department: 'Medicine',
      degrees: 'MBBS, FCPS',
      bmdcRegNo: `A-${Math.floor(10000 + Math.random() * 90000)}`,
      hospital: 'ঢাকা মেডিকেল কলেজ ও হাসপাতাল',
      experienceYears: 10,
      rating: 4.9,
      reviewCount: 0,
      totalConsultations: 0,
      orderCount: 0,
      consultationFee: 500,
      originalFee: 800,
      discountPercent: 37,
      followupFee: 300,
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
      gender: 'male',
      availableTimeText: 'প্রতিদিন বিকাল ৫:০০ - রাত ৯:০০',
      slotIntervalMinutes: 30,
      consultationTypes: ['video', 'audio'],
      about: '',
      isActive: true
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({ 
      ...doctor,
      orderCount: doctor.orderCount !== undefined ? doctor.orderCount : (doctor.totalConsultations || 0),
      totalConsultations: doctor.orderCount !== undefined ? doctor.orderCount : (doctor.totalConsultations || 0)
    });
    setIsFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setFormData(prev => ({ ...prev, image: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.specialty?.trim()) {
      alert(isBn ? 'অনুগ্রহ করে ডাক্তারের নাম ও স্পেশালিটি পূরণ করুন।' : 'Please enter doctor name and specialty.');
      return;
    }

    const consultsCount = Number(formData.orderCount ?? formData.totalConsultations ?? 0);

    let updated: Doctor[];
    if (editingDoctor) {
      updated = doctors.map(d => (d.id === editingDoctor.id ? ({ 
        ...d, 
        ...formData,
        orderCount: consultsCount,
        totalConsultations: consultsCount
      } as Doctor) : d));
    } else {
      const newDoc: Doctor = {
        id: formData.id || `doc_${Date.now().toString().slice(-4)}`,
        name: formData.name || '',
        title: formData.title || (isBn ? 'ডাঃ' : 'Dr.'),
        specialty: formData.specialty || '',
        department: formData.department || 'Medicine',
        degrees: formData.degrees || '',
        bmdcRegNo: formData.bmdcRegNo || '',
        hospital: formData.hospital || '',
        experienceYears: Number(formData.experienceYears) || 10,
        rating: Number(formData.rating) || 4.9,
        reviewCount: Number(formData.reviewCount) || 0,
        totalConsultations: consultsCount,
        orderCount: consultsCount,
        consultationFee: Number(formData.consultationFee) || 500,
        originalFee: Number(formData.originalFee) || 800,
        discountPercent: Number(formData.discountPercent) || 37,
        followupFee: Number(formData.followupFee) || 300,
        image: formData.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
        gender: formData.gender || 'male',
        availableTimeText: formData.availableTimeText || 'প্রতিদিন সন্ধ্যা ৬:০০ - রাত ৯:০০',
        slotIntervalMinutes: Number(formData.slotIntervalMinutes) || 30,
        consultationTypes: ['video', 'audio'],
        about: formData.about || '',
        isActive: formData.isActive !== false
      };
      updated = [newDoc, ...doctors];
    }

    onUpdateDoctors(updated);
    setStoredDoctors(updated, lang);
    setIsFormOpen(false);
  };

  const handleDeleteDoctor = () => {
    if (!doctorToDelete) return;
    const updated = doctors.filter(d => d.id !== doctorToDelete.id);
    onUpdateDoctors(updated);
    setStoredDoctors(updated, lang);
    setDoctorToDelete(null);
  };

  const handleUpdateAppointmentStatus = (aptId: string, newStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => {
    const updated = appointments.map(a => a.id === aptId ? { ...a, status: newStatus } : a);
    setAppointments(updated);
    saveStoredDoctorAppointments(updated);
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Header & Subtabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="text-sky-600" />
            <span>{isBn ? 'ডাক্তার কন্সালটেন্সি ও টেলিমেডিসিন প্যানেল' : 'Doctor Consultation & Telemedicine Panel'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isBn 
              ? 'ডাক্তার যোগ, এডিট, ডিলিট, সক্রিয়/নিষ্ক্রিয় ও কন্সালটেন্সি সংখ্যা নিয়ন্ত্রণ করুন।' 
              : 'Add, edit, delete, toggle active/inactive, adjust consults count and manage video rooms.'}
          </p>
        </div>

        {/* Subtabs Switch */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs font-bold flex-wrap">
            <button
              onClick={() => setActiveSubTab('doctors')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'doctors' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? `ডাক্তার তালিকা (${doctors.length})` : `Doctors (${doctors.length})`}
            </button>
            <button
              onClick={() => setActiveSubTab('slots')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'slots' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarClock size={14} className="text-sky-600" />
              <span>{isBn ? 'তারিখ, স্লট ও অফ ডে' : 'Date, Slots & Off Days'}</span>
            </button>
            <button
              onClick={() => {
                setAppointments(getStoredDoctorAppointments());
                setActiveSubTab('appointments');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'appointments' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? `ভিডিও কল ও অ্যাপয়েন্টমেন্ট (${appointments.length})` : `Appointments (${appointments.length})`}
            </button>
          </div>

          {activeSubTab === 'doctors' && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>{isBn ? 'নতুন ডাক্তার যুক্ত করুন' : 'Add New Doctor'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-sky-400 text-xs font-bold animate-slideDown flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SUBTAB 1: DOCTOR PROFILES LIST */}
      {activeSubTab === 'doctors' && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">{isBn ? 'মোট ডাক্তার' : 'Total Doctors'}</span>
              <span className="text-xl font-extrabold text-slate-900">{doctors.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">{isBn ? 'সক্রিয় (Active)' : 'Active Doctors'}</span>
              <span className="text-xl font-extrabold text-emerald-600">
                {doctors.filter(d => d.isActive !== false).length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">{isBn ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive Doctors'}</span>
              <span className="text-xl font-extrabold text-slate-400">
                {doctors.filter(d => d.isActive === false).length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">{isBn ? 'মোট কন্সালটেন্সি' : 'Total Consultations'}</span>
              <span className="text-xl font-extrabold text-sky-700">
                {doctors.reduce((acc, d) => acc + (d.orderCount ?? d.totalConsultations ?? 0), 0)}+
              </span>
            </div>
          </div>

          {/* Search & Department Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'ডাক্তারের নাম বা বিএমডিসি দিয়ে খুঁজুন...' : 'Search doctor or BMDC reg...'}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-slate-400 shrink-0" />
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{isBn ? 'ডাক্তার বিবরণ' : 'Doctor Details'}</th>
                    <th className="py-3 px-4">{isBn ? 'বিভাগ ও ডিগ্রি' : 'Dept & Degrees'}</th>
                    <th className="py-3 px-4">{isBn ? 'ফি (৳)' : 'Fee'}</th>
                    <th className="py-3 px-4 text-center">{isBn ? 'কন্সালটেন্সি সংখ্যা' : 'Consults Count'}</th>
                    <th className="py-3 px-4 text-center">{isBn ? 'স্ট্যাটাস (Active/Inactive)' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map(doctor => {
                    const isActive = doctor.isActive !== false;
                    const consults = doctor.orderCount ?? doctor.totalConsultations ?? 0;

                    return (
                      <tr key={doctor.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Doctor Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={doctor.image}
                              alt={doctor.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400';
                              }}
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">{doctor.name}</span>
                              <span className="text-[11px] text-slate-500 block truncate">{doctor.hospital}</span>
                              {doctor.bmdcRegNo && (
                                <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                                  BMDC: {doctor.bmdcRegNo}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Dept & Degrees */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">{doctor.specialty}</span>
                          <span className="text-[11px] text-slate-500 block">{doctor.degrees}</span>
                        </td>

                        {/* Fee & Discount */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">৳{doctor.consultationFee}</div>
                          {doctor.originalFee && doctor.originalFee > doctor.consultationFee && (
                            <div className="text-[11px] text-slate-400 line-through">৳{doctor.originalFee}</div>
                          )}
                        </td>

                        {/* Consults Count with quick adjust steppers (+ / -) */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustConsults(doctor, -1)}
                              className="w-5 h-5 rounded-md bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                              title="Decrease consults count"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="font-mono font-bold text-slate-900 min-w-[28px] text-center">
                              {consults}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustConsults(doctor, 1)}
                              className="w-5 h-5 rounded-md bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                              title="Increase consults count"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </td>

                        {/* Active / Inactive Status Switch Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleDoctorStatus(doctor)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-300'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-300'
                            }`}
                            title={isActive ? 'সক্রিয় (Click to make Inactive - hide from website)' : 'নিষ্ক্রিয় (Click to make Active - show on website)'}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <span>{isActive ? (isBn ? 'একটিভ' : 'Active') : (isBn ? 'ইনএকটিভ' : 'Inactive')}</span>
                          </button>
                          <span className="block text-[10px] text-sky-700 font-semibold mt-1">
                            ⏱️ {doctor.slotIntervalMinutes || 30}m
                          </span>
                        </td>

                        {/* Actions (Edit & Delete) */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(doctor)}
                              className="p-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors cursor-pointer"
                              title="Edit Doctor Profile"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDoctorToDelete(doctor)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Delete Doctor"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DATE, SLOTS & OFF-DAYS MANAGER */}
      {activeSubTab === 'slots' && (
        <div className="space-y-6">
          {/* Top Banner & Quick Explanation */}
          <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold">
                <CalendarClock size={14} />
                <span>{isBn ? 'ডাক্তার সিডিউল, স্লট ও অফ ডে ম্যানেজার' : 'Doctor Schedule, Slots & Off Days'}</span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">
                {isBn 
                  ? 'তারিখ ও স্লট কাস্টমাইজেশন (৩০ মিনিট এর কম/বেশি)' 
                  : 'Date & Slot Customization (< / > 30 Minutes)'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isBn 
                  ? 'এখানে ডাক্তারের সময় স্লটের দৈর্ঘ্য (যেমন: ১৫, ২০, ৩০, ৪৫ বা ৬০ মিনিট) পরিবর্তন করতে পারবেন। স্লট ২০ মিনিট নির্ধারণ করলে হোমপেজ ও কার্ডে "20-Min Schedule" ও "Book 20-Min" হিসেবে শো করবে। এছাড়া সাপ্তাহিক অফ ডে ও নির্দিষ্ট ছুটির দিন নির্ধারণ করা যায়।' 
                  : 'Customize slot durations (< or > 30 minutes, e.g. 20-Min). Setting 20 minutes dynamically shows "20-Min Schedule" and "Book 20-Min" on home page cards and booking modals. Configure weekly off-days and leave dates easily.'}
              </p>
            </div>
          </div>

          {/* Doctor Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {isBn ? 'ডাক্তার নির্বাচন করুন (Select Doctor):' : 'Select Doctor:'}
              </label>
              <select
                value={slotDoctorId}
                onChange={e => setSlotDoctorId(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="all">
                  {isBn ? '⭐ সকল ডাক্তার (All Doctors - Global Setup)' : '⭐ All Doctors (Global Setup)'}
                </option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty}) - {d.slotIntervalMinutes || 30}m
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 bg-sky-50 text-sky-800 rounded-xl font-bold border border-sky-200">
                {slotDoctorId === 'all' 
                  ? (isBn ? `সকল ${doctors.length} জন ডাক্তারের উপর প্রযোজ্য` : `Applies to all ${doctors.length} doctors`)
                  : (isBn ? `নির্বাচিত: ${doctors.find(d => d.id === slotDoctorId)?.name}` : `Selected: ${doctors.find(d => d.id === slotDoctorId)?.name}`)}
              </span>
            </div>
          </div>

          {/* Slot Interval Settings & Live Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Slot Interval & Off-Days Configuration */}
            <div className="lg:col-span-2 space-y-6">
              {/* SECTION A: SLOT INTERVAL (MINUTES) */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {isBn ? '১. সময় স্লটের দৈর্ঘ্য (Slot Duration)' : '1. Slot Duration (Minutes)'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isBn ? '৩০ মিনিট এর কম বা বেশি করতে নিচের বোতামে চাপুন' : 'Select or type minutes (< or > 30-min)'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                    {slotInterval} {isBn ? 'মিনিট' : 'Mins'}
                  </span>
                </div>

                {/* Preset Interval Buttons */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    {isBn ? 'কুইক প্রিসেট (Quick Presets):' : 'Quick Presets:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[15, 20, 30, 45, 60].map(mins => {
                      const isSelected = slotInterval === mins;
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            setSlotInterval(mins);
                            setCustomSlotList(generateSlotsByInterval(autoGenStart, autoGenEnd, mins));
                          }}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-200 ring-2 ring-sky-300'
                              : 'bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-sm">{mins}m</span>
                          <span className={`text-[10px] ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                            {mins === 20 ? (isBn ? '২০ মিনিট' : '20-Min') : mins === 30 ? (isBn ? 'ডিফল্ট ৩০' : '30-Min') : `${mins} min`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Minutes Input */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    {isBn ? 'অথবা কাস্টম মিনিট লিখুন:' : 'Or Enter Custom Minutes:'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={slotInterval}
                      onChange={e => {
                        const val = Math.max(5, Math.min(180, Number(e.target.value) || 30));
                        setSlotInterval(val);
                        setCustomSlotList(generateSlotsByInterval(autoGenStart, autoGenEnd, val));
                      }}
                      className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                    <span className="text-xs text-slate-500 font-semibold">{isBn ? 'মিনিট' : 'minutes'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION B: WEEKLY OFF DAYS (সাপ্তাহিক ছুটির দিন) */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                      <CalendarOff size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {isBn ? '২. সাপ্তাহিক অফ ডে (Weekly Off Days)' : '2. Weekly Off Days'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isBn ? 'যে যে বারে ডাক্তার চেম্বার বা অনলাইন কন্সালটেন্সিতে বসবেন না তা সিলেক্ট করুন' : 'Select days when the doctor is off / unavailable'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {WEEKLY_DAYS_MAP.map(dayItem => {
                    const isOff = weeklyOffDays.includes(dayItem.id) || weeklyOffDays.includes(dayItem.bn) || weeklyOffDays.includes(dayItem.shortBn);
                    return (
                      <button
                        key={dayItem.id}
                        type="button"
                        onClick={() => {
                          if (isOff) {
                            setWeeklyOffDays(weeklyOffDays.filter(d => d !== dayItem.id && d !== dayItem.bn && d !== dayItem.shortBn));
                          } else {
                            setWeeklyOffDays([...weeklyOffDays, dayItem.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          isOff
                            ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs font-extrabold ring-1 ring-rose-300'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 font-medium'
                        }`}
                      >
                        <span className="block text-xs">{isBn ? dayItem.bn : dayItem.en}</span>
                        <span className={`block text-[10px] mt-0.5 ${isOff ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                          {isOff ? (isBn ? '🚫 অফ ডে' : '🚫 Off Day') : (isBn ? '✓ চালু' : 'Active')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION C: SPECIFIC VACATION / LEAVE DATES */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {isBn ? '৩. নির্দিষ্ট ছুটির তারিখ (Specific Vacation / Leave Dates)' : '3. Specific Vacation / Leave Dates'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isBn ? 'ছুটির নির্দিষ্ট তারিখ যোগ করুন (ঐ তারিখে বুকিং বন্ধ থাকবে)' : 'Add specific dates when appointments are blocked'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="date"
                    value={newOffDateInput}
                    onChange={e => setNewOffDateInput(e.target.value)}
                    className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newOffDateInput) return;
                      if (!specificOffDates.includes(newOffDateInput)) {
                        setSpecificOffDates([...specificOffDates, newOffDateInput]);
                      }
                      setNewOffDateInput('');
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>{isBn ? 'ছুটির তারিখ যোগ করুন' : 'Add Leave Date'}</span>
                  </button>
                </div>

                {specificOffDates.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {specificOffDates.map(dateStr => (
                      <span
                        key={dateStr}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold shadow-2xs"
                      >
                        <CalendarOff size={12} className="text-amber-700" />
                        <span>{dateStr}</span>
                        <button
                          type="button"
                          onClick={() => setSpecificOffDates(specificOffDates.filter(d => d !== dateStr))}
                          className="hover:text-rose-600 ml-1 text-slate-400 font-bold"
                          title="Remove leave date"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    {isBn ? 'কোনো নির্দিষ্ট ছুটির তারিখ যোগ করা হয়নি।' : 'No specific vacation dates added.'}
                  </p>
                )}
              </div>
            </div>

            {/* Right Col: Live Preview Banner & Active Time Slots Generator */}
            <div className="space-y-6">
              {/* LIVE PREVIEW BOX */}
              <div className="bg-gradient-to-b from-sky-50 to-indigo-50/40 p-5 rounded-2xl border border-sky-200 space-y-4">
                <div className="flex items-center gap-2 text-sky-900 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles size={14} className="text-sky-600" />
                  <span>{isBn ? 'লাইভ প্রিভিউ (হোমপেজ ও কার্ডে প্রদর্শন)' : 'Live Preview on Cards'}</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Doctor Card Pill</span>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      ⏱️ {slotInterval}-Min Schedule
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Booking Button</span>
                    <span className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                      <Calendar size={12} />
                      <span>Book {slotInterval}-Min</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">বাংলায় বাটন</span>
                    <span className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                      <Calendar size={12} />
                      <span>{toBnNumber(slotInterval)}-মি. স্লট বুক</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">মডাল স্টেপ</span>
                    <span className="text-xs font-bold text-slate-800">
                      Date & {slotInterval}-Min Slot
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-sky-100 text-[11px] text-sky-900 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Info size={13} className="text-sky-600" />
                    <span>ইউজার রিকুয়েস্ট অনুযায়ী:</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    স্লট {slotInterval} মিনিট সেভ করার পর ইউজার হোমপেজে ডাক্তার কার্ডে <span className="font-bold text-sky-700">{slotInterval}-Min Schedule</span> এবং বুকিং বাটনে <span className="font-bold text-sky-700">Book {slotInterval}-Min</span> দেখতে পাবেন।
                  </p>
                </div>
              </div>

              {/* SAVE CONFIGURATION BUTTON */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    const combinedOffDays = [...weeklyOffDays, ...specificOffDates];
                    let updated: Doctor[];

                    if (slotDoctorId === 'all') {
                      updated = doctors.map(d => ({
                        ...d,
                        slotIntervalMinutes: slotInterval,
                        customSlots: customSlotList,
                        offDays: combinedOffDays,
                        availableTimeText: `প্রতিদিন ${autoGenStart} - ${autoGenEnd} (${slotInterval} মিনিট স্লট)`
                      }));
                    } else {
                      updated = doctors.map(d => d.id === slotDoctorId ? ({
                        ...d,
                        slotIntervalMinutes: slotInterval,
                        customSlots: customSlotList,
                        offDays: combinedOffDays,
                        availableTimeText: `প্রতিদিন ${autoGenStart} - ${autoGenEnd} (${slotInterval} মিনিট স্লট)`
                      }) : d);
                    }

                    onUpdateDoctors(updated);
                    setStoredDoctors(updated, lang);
                    showToast(isBn 
                      ? `✓ ${slotInterval} মিনিট স্লট ও অফ ডে সফলভাবে সংরক্ষণ করা হয়েছে!` 
                      : `✓ ${slotInterval}-min slot schedule saved successfully!`);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-200 transition-all cursor-pointer"
                >
                  <Save size={16} />
                  <span>{isBn ? 'স্লট সেটিংস সংরক্ষণ করুন' : 'Save Slot & Schedule Settings'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSlotInterval(30);
                    setWeeklyOffDays(['Friday']);
                    setSpecificOffDates([]);
                    setAutoGenStart('05:00 PM');
                    setAutoGenEnd('09:00 PM');
                    setCustomSlotList(generateSlotsByInterval('05:00 PM', '09:00 PM', 30));
                    showToast(isBn ? 'ডিফল্ট ৩০ মিনিট স্লটে রিসেট করা হয়েছে' : 'Reset to default 30-min slots');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>{isBn ? 'ডিফল্ট ৩০-মিনিটে রিসেট' : 'Reset to Default 30-Min'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION D: TIME SLOTS MANAGER (ইডিট, ডিলেট ও নতুন স্লট যোগ) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock size={16} className="text-sky-600" />
                  <span>{isBn ? '৪. সময় স্লট তালিকা (Time Slots Manager - Edit, Delete, Add)' : '4. Time Slots Manager (Edit, Delete, Add)'}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isBn 
                    ? `বর্তমান মোট স্লট: ${customSlotList.length}টি (প্রতিটি ${slotInterval} মিনিট)` 
                    : `Active Slots: ${customSlotList.length} (${slotInterval}-min interval each)`}
                </p>
              </div>

              {/* Auto Generator Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-semibold">{isBn ? 'শুরু:' : 'Start:'}</span>
                  <input
                    type="text"
                    value={autoGenStart}
                    onChange={e => setAutoGenStart(e.target.value)}
                    placeholder="05:00 PM"
                    className="w-20 px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-center"
                  />
                  <span className="text-slate-500 font-semibold">{isBn ? 'শেষ:' : 'End:'}</span>
                  <input
                    type="text"
                    value={autoGenEnd}
                    onChange={e => setAutoGenEnd(e.target.value)}
                    placeholder="09:00 PM"
                    className="w-20 px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const generated = generateSlotsByInterval(autoGenStart, autoGenEnd, slotInterval);
                    if (generated.length > 0) {
                      setCustomSlotList(generated);
                      showToast(isBn ? `${generated.length}টি নতুন স্লট তৈরি করা হয়েছে!` : `Generated ${generated.length} new slots!`);
                    } else {
                      showToast(isBn ? 'সময় ফরম্যাট সঠিক নয় (যেমন: 05:00 PM ও 09:00 PM)' : 'Invalid time format (e.g. 05:00 PM & 09:00 PM)');
                    }
                  }}
                  className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>{isBn ? `${slotInterval}মিনিট স্লট অটো তৈরি` : `Auto Generate`}</span>
                </button>
              </div>
            </div>

            {/* Add Custom Slot Input Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                {isBn ? 'নতুন কাস্টম স্লট যোগ:' : 'Add Custom Slot:'}
              </span>
              <input
                type="text"
                value={newCustomSlotInput}
                onChange={e => setNewCustomSlotInput(e.target.value)}
                placeholder="e.g. 09:00 PM - 09:20 PM"
                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newCustomSlotInput.trim()) return;
                  setCustomSlotList([...customSlotList, newCustomSlotInput.trim()]);
                  setNewCustomSlotInput('');
                }}
                className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                <span>{isBn ? 'স্লট যুক্ত করুন' : 'Add Slot'}</span>
              </button>
            </div>

            {/* Slots Grid with Edit and Delete */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {customSlotList.map((slot, index) => {
                const isEditing = editingSlotIdx === index;
                return (
                  <div
                    key={`${slot}-${index}`}
                    className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-sky-300 transition-all shadow-2xs flex items-center justify-between gap-2"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="text"
                          value={editingSlotVal}
                          onChange={e => setEditingSlotVal(e.target.value)}
                          className="flex-1 px-2 py-1 bg-white border border-sky-400 rounded-lg text-xs font-mono outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editingSlotVal.trim()) {
                              const updated = [...customSlotList];
                              updated[index] = editingSlotVal.trim();
                              setCustomSlotList(updated);
                            }
                            setEditingSlotIdx(null);
                          }}
                          className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                          title="Save slot time"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSlotIdx(null)}
                          className="p-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 cursor-pointer"
                          title="Cancel edit"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Clock size={13} className="text-sky-600 shrink-0" />
                          <span className="font-mono text-xs font-bold text-slate-800 truncate">
                            {slot}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSlotIdx(index);
                              setEditingSlotVal(slot);
                            }}
                            className="p-1 text-sky-600 hover:bg-sky-100 rounded-md transition-colors cursor-pointer"
                            title="Edit slot time"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomSlotList(customSlotList.filter((_, i) => i !== index));
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                            title="Delete slot"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: APPOINTMENTS & VIDEO ROOMS */}
      {activeSubTab === 'appointments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {isBn ? 'ডাক্তার অ্যাপয়েন্টমেন্ট ও লাইভ ভিডিও রুম' : 'Doctor Appointments & Video Room Manager'}
                </h3>
                <p className="text-xs text-slate-400">Total: {appointments.length} Appointments</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">{isBn ? 'ফিল্টার:' : 'Filter:'}</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="all">{isBn ? 'সকল' : 'All'}</option>
                  <option value="scheduled">{isBn ? 'শিডিউল্ড' : 'Scheduled'}</option>
                  <option value="completed">{isBn ? 'সম্পন্ন' : 'Completed'}</option>
                  <option value="cancelled">{isBn ? 'বাতিল' : 'Cancelled'}</option>
                </select>
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 p-4 text-slate-400 text-xs">
                {isBn ? 'কোনো অ্যাপয়েন্টমেন্ট রেকর্ড পাওয়া যায়নি।' : 'No appointment records found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Appt ID & Date</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Patient Details</th>
                      <th className="py-3 px-4">Schedule Slot</th>
                      <th className="py-3 px-4">Fee & Status</th>
                      <th className="py-3 px-4 text-right">Video Call & Rx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map(apt => (
                      <tr key={apt.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-sky-700 block">{apt.id}</span>
                          <span className="text-[11px] text-slate-500">{apt.appointmentDate}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{apt.doctorName}</span>
                          <span className="text-[11px] text-slate-500">{apt.doctorSpecialty}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{apt.patientName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{apt.patientPhone} • {apt.patientAge} Y</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-emerald-700 block uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-0.5">
                            {apt.consultationType} Call
                          </span>
                          <span className="text-slate-700 block font-medium">{apt.appointmentTimeSlot}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">৳{apt.doctorFee}</span>
                          <select
                            value={apt.status}
                            onChange={e => handleUpdateAppointmentStatus(apt.id, e.target.value as any)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 mt-1 uppercase"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onJoinVideoAsDoctor && (
                              <button
                                type="button"
                                onClick={() => onJoinVideoAsDoctor(apt)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Join Video Room as Doctor"
                              >
                                <Video size={12} />
                                <span>{isBn ? 'ভিডিও কল' : 'Join Video'}</span>
                              </button>
                            )}

                            {apt.prescription ? (
                              <button
                                onClick={() => onOpenPrescriptionViewer && onOpenPrescriptionViewer(apt.prescription!)}
                                className="px-2.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <FileText size={12} />
                                <span>Rx</span>
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT DOCTOR MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Stethoscope className="text-sky-400" />
                <span>{editingDoctor ? (isBn ? 'ডাক্তার তথ্য এডিট করুন' : 'Edit Doctor Profile') : (isBn ? 'নতুন ডাক্তার যুক্ত করুন' : 'Add New Doctor')}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'ডাক্তারের নাম *' : 'Doctor Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isBn ? 'যেমন: অধ্যাপক ডাঃ মোঃ রফিকুল ইসলাম' : 'e.g. Prof. Dr. Rafiqul Islam'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'বিভাগ (Department) *' : 'Department *'}
                  </label>
                  <select
                    value={formData.department || 'Medicine'}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="Medicine">Medicine & Diabetes</option>
                    <option value="Gynecology">Gynecology & OBGYN</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'স্পেশালিটি / পদবী *' : 'Specialty *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialty || ''}
                    onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder={isBn ? 'যেমন: মেডিসিন ও ডায়াবেটিস বিশেষজ্ঞ' : 'e.g. Medicine & Diabetes Specialist'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'ডিগ্রি (Degrees)' : 'Degrees'}
                  </label>
                  <input
                    type="text"
                    value={formData.degrees || ''}
                    onChange={e => setFormData({ ...formData, degrees: e.target.value })}
                    placeholder="MBBS (DMC), FCPS, MD"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'BMDC রেজি. নম্বর' : 'BMDC Reg No'}
                  </label>
                  <input
                    type="text"
                    value={formData.bmdcRegNo || ''}
                    onChange={e => setFormData({ ...formData, bmdcRegNo: e.target.value })}
                    placeholder="A-28491"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'বর্তমান হাসপাতাল / চেম্বার' : 'Hospital / Clinic'}
                  </label>
                  <input
                    type="text"
                    value={formData.hospital || ''}
                    onChange={e => setFormData({ ...formData, hospital: e.target.value })}
                    placeholder={isBn ? 'ঢাকা মেডিকেল কলেজ ও হাসপাতাল' : 'Dhaka Medical College & Hospital'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Fee, Experience, and Editable Consults Count */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'কন্সালটেন্সি ফি (৳) *' : 'Consult Fee (৳) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.consultationFee || 500}
                    onChange={e => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'রেগুলার ফি (৳)' : 'Regular Fee (৳)'}
                  </label>
                  <input
                    type="number"
                    value={formData.originalFee || 800}
                    onChange={e => setFormData({ ...formData, originalFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'অভিজ্ঞতা (বছর)' : 'Experience (Yrs)'}
                  </label>
                  <input
                    type="number"
                    value={formData.experienceYears || 10}
                    onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

                {/* Consults Count (Default 0, Admin can increase/decrease) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'কন্সালটেন্সি সংখ্যা' : 'Consults Count'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.orderCount ?? 0}
                    onChange={e => {
                      const val = Math.max(0, Number(e.target.value));
                      setFormData({ ...formData, orderCount: val, totalConsultations: val });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Slot Interval and Timing Text */}
              <div className="grid sm:grid-cols-2 gap-3 p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
                <div>
                  <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>{isBn ? 'স্লটের দৈর্ঘ্য (মিনিট)' : 'Slot Duration (Minutes)'}</span>
                    <span className="text-sky-700 font-extrabold text-[11px] bg-white px-2 py-0.5 rounded border border-sky-200">
                      {formData.slotIntervalMinutes || 30} {isBn ? 'মিনিট' : 'min'}
                    </span>
                  </label>
                  <div className="grid grid-cols-5 gap-1 mb-1.5">
                    {[15, 20, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setFormData({ ...formData, slotIntervalMinutes: mins })}
                        className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          (formData.slotIntervalMinutes || 30) === mins
                            ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
                            : 'bg-white hover:bg-sky-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={formData.slotIntervalMinutes || 30}
                    onChange={e => setFormData({ ...formData, slotIntervalMinutes: Number(e.target.value) || 30 })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-xs font-bold"
                  />
                  <p className="text-[10px] text-sky-800 font-medium mt-1">
                    💡 প্রিভিউ: <span className="font-bold">{formData.slotIntervalMinutes || 30}-Min Schedule</span> ও <span className="font-bold">Book {formData.slotIntervalMinutes || 30}-Min</span>
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {isBn ? 'পরামর্শের সময় টেক্সট' : 'Schedule Timing Text'}
                  </label>
                  <input
                    type="text"
                    value={formData.availableTimeText || ''}
                    onChange={e => setFormData({ ...formData, availableTimeText: e.target.value })}
                    placeholder="প্রতিদিন বিকাল ৫:০০ - রাত ৯:০০"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-xs"
                  />
                  
                  {/* Weekly Off Days Selection */}
                  <label className="block font-bold text-slate-800 mt-2 mb-1">
                    {isBn ? 'সাপ্তাহিক ছুটির দিন (Off Days)' : 'Weekly Off Days'}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {WEEKLY_DAYS_MAP.map(dayItem => {
                      const currentOff = formData.offDays || [];
                      const isOff = currentOff.includes(dayItem.id) || currentOff.includes(dayItem.bn) || currentOff.includes(dayItem.shortBn);
                      return (
                        <button
                          key={dayItem.id}
                          type="button"
                          onClick={() => {
                            if (isOff) {
                              setFormData({
                                ...formData,
                                offDays: currentOff.filter(d => d !== dayItem.id && d !== dayItem.bn && d !== dayItem.shortBn)
                              });
                            } else {
                              setFormData({
                                ...formData,
                                offDays: [...currentOff, dayItem.id]
                              });
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isOff
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {isBn ? dayItem.shortBn : dayItem.en.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Photo URL / upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isBn ? 'ডাক্তারের ছবির URL বা ফাইল আপলোড' : 'Doctor Photo URL / Upload'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                    title="Upload Image from Device"
                  >
                    <Upload size={14} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Active Toggle in Modal */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <label className="font-bold text-slate-800 block">{isBn ? 'ডাক্তার স্ট্যাটাস' : 'Doctor Status'}</label>
                  <span className="text-[11px] text-slate-500">{isBn ? 'ওয়েবসাইটে দৃশ্যমান রাখতে Active রাখুন' : 'Keep active to display in doctor list'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: formData.isActive === false ? true : false })}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    formData.isActive !== false ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {formData.isActive !== false ? (isBn ? '✓ সক্রিয় (Active)' : '✓ Active') : (isBn ? '✕ নিষ্ক্রিয় (Inactive)' : '✕ Inactive')}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {doctorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? 'ডাক্তার প্রোফাইল ডিলিট করবেন?' : 'Delete Doctor Profile?'}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn ? `আপনি কি নিশ্চিত যে "${doctorToDelete.name}" ডিলিট করতে চান?` : `Are you sure you want to delete "${doctorToDelete.name}"?`}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDoctorToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                {isBn ? 'না, বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteDoctor}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                {isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
