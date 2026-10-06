import React, { useState, useRef } from 'react';
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
  Link
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

export const AdminDoctors: React.FC<AdminDoctorsProps> = ({
  lang,
  doctors,
  onUpdateDoctors,
  onOpenPrescriptionViewer,
  onJoinVideoAsDoctor
}) => {
  const isBn = lang === 'bn';
  const [activeSubTab, setActiveSubTab] = useState<'doctors' | 'appointments'>('doctors');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Modals state
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Appointments state
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(getStoredDoctorAppointments);
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
    isActive: true
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

  // Toggle Doctor Active / Inactive
  const handleToggleDoctorStatus = (doctor: Doctor) => {
    const updated = doctors.map(d => {
      if (d.id === doctor.id) {
        return { ...d, isActive: d.isActive === false ? true : false };
      }
      return d;
    });
    onUpdateDoctors(updated);
    setStoredDoctors(updated, lang);
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
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('doctors')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'doctors' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? `ডাক্তার তালিকা (${doctors.length})` : `Doctors (${doctors.length})`}
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title={isActive ? 'সক্রিয় (Click to make Inactive)' : 'নিষ্ক্রিয় (Click to make Active)'}
                          >
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{isActive ? (isBn ? 'একটিভ' : 'Active') : (isBn ? 'ইনএকটিভ' : 'Inactive')}</span>
                          </button>
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

      {/* SUBTAB 2: APPOINTMENTS & VIDEO ROOMS */}
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

              {/* Schedule timing and photo URL / upload */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'পরামর্শের সময় টেক্সট (৩০ মিনিট স্লট)' : 'Schedule Timing Text'}
                  </label>
                  <input
                    type="text"
                    value={formData.availableTimeText || ''}
                    onChange={e => setFormData({ ...formData, availableTimeText: e.target.value })}
                    placeholder="প্রতিদিন বিকাল ৫:০০ - রাত ৯:০০"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>

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
