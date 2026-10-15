import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Phone, 
  MapPin, 
  User, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Eye, 
  Printer, 
  MessageCircle, 
  X, 
  Stethoscope, 
  Activity, 
  HeartPulse, 
  CreditCard, 
  Tag, 
  Save,
  Download 
} from 'lucide-react';
import { DoctorAtHomeBooking, DoctorAtHomeStatus, Language, PaymentMethod } from '../../types';
import { DEFAULT_DOCTOR_AT_HOME_SPECIALTIES } from '../../services/dataStorage';
import { printOrDownloadDoctorAtHomeSlip, downloadDoctorAtHomeSlipHtml } from '../../services/invoiceService';

interface AdminDoctorAtHomeProps {
  lang: Language;
  bookings: DoctorAtHomeBooking[];
  onUpdateBookings: (bookings: DoctorAtHomeBooking[]) => void;
  showToast: (msg: string) => void;
}

export const AdminDoctorAtHome: React.FC<AdminDoctorAtHomeProps> = ({
  lang,
  bookings,
  onUpdateBookings,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DoctorAtHomeStatus>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Modals state
  const [editingBooking, setEditingBooking] = useState<DoctorAtHomeBooking | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [viewingSlipBooking, setViewingSlipBooking] = useState<DoctorAtHomeBooking | null>(null);

  // Form state for edit/add
  const [formData, setFormData] = useState<Partial<DoctorAtHomeBooking>>({});

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (specialtyFilter !== 'all' && b.doctorType !== specialtyFilter) return false;
    if (selectedDateFilter && b.date !== selectedDateFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = (b.patientName || '').toLowerCase().includes(q);
      const matchPhone = (b.patientPhone || '').toLowerCase().includes(q);
      const matchId = (b.id || '').toLowerCase().includes(q);
      const matchAddress = (b.address || '').toLowerCase().includes(q);
      const matchSpec = (b.doctorTypeLabel || '').toLowerCase().includes(q);
      const matchDoc = (b.assignedDoctorName || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchId || matchAddress || matchSpec || matchDoc;
    }
    return true;
  });

  // Statistics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'assigned').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed' || b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.consultationFee || 0), 0);

  // Status Badge Helper
  const renderStatusBadge = (status: DoctorAtHomeStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{lang === 'bn' ? 'অপেক্ষমাণ (Pending)' : 'Pending'}</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-bold border border-sky-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>{lang === 'bn' ? 'নিশ্চিত (Confirmed)' : 'Confirmed'}</span>
          </span>
        );
      case 'assigned':
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>{lang === 'bn' ? 'ডাক্তার বরাদ্দ (Assigned)' : 'Doctor Assigned'}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>{lang === 'bn' ? 'সম্পন্ন (Completed)' : 'Completed'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold border border-rose-200 flex items-center gap-1">
            <X size={12} className="text-rose-600" />
            <span>{lang === 'bn' ? 'বাতিল (Cancelled)' : 'Cancelled'}</span>
          </span>
        );
    }
  };

  // Quick Status Change
  const handleQuickStatusChange = (bookingId: string, newStatus: DoctorAtHomeStatus) => {
    const updated = bookings.map(b => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
    });
    onUpdateBookings(updated);
    showToast(lang === 'bn' ? 'বুকিং স্ট্যাটাস পরিবর্তন করা হয়েছে!' : 'Booking status updated!');
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (!deletingBookingId) return;
    const updated = bookings.filter(b => b.id !== deletingBookingId);
    onUpdateBookings(updated);
    setDeletingBookingId(null);
    showToast(lang === 'bn' ? 'বুকিং সফলভাবে মুছে ফেলা হয়েছে।' : 'Booking deleted successfully.');
  };

  // Open Edit Modal
  const handleOpenEdit = (b: DoctorAtHomeBooking) => {
    setEditingBooking(b);
    setFormData({ ...b });
  };

  // Save Edit / Add
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName?.trim() || !formData.patientPhone?.trim()) {
      alert(lang === 'bn' ? 'রোগীর নাম ও ফোন নম্বর আবশ্যক।' : 'Patient name and phone are required.');
      return;
    }

    const currentSpecObj = DEFAULT_DOCTOR_AT_HOME_SPECIALTIES.find(s => s.id === formData.doctorType)
      || DEFAULT_DOCTOR_AT_HOME_SPECIALTIES[0];

    if (editingBooking) {
      // Update
      const updatedItem: DoctorAtHomeBooking = {
        ...editingBooking,
        patientName: formData.patientName.trim(),
        patientPhone: formData.patientPhone.trim(),
        altPhone: formData.altPhone?.trim() || undefined,
        patientAge: formData.patientAge || undefined,
        patientGender: formData.patientGender || 'male',
        address: formData.address?.trim() || editingBooking.address,
        area: formData.area || editingBooking.area,
        date: formData.date || editingBooking.date,
        timeSlot: formData.timeSlot || editingBooking.timeSlot,
        doctorType: formData.doctorType || editingBooking.doctorType,
        doctorTypeLabel: lang === 'bn' ? currentSpecObj.nameBn : currentSpecObj.nameEn,
        symptoms: formData.symptoms?.trim() || editingBooking.symptoms,
        consultationFee: Number(formData.consultationFee) || currentSpecObj.fee,
        paymentMethod: (formData.paymentMethod as PaymentMethod) || editingBooking.paymentMethod,
        paymentStatus: formData.paymentStatus || editingBooking.paymentStatus,
        status: formData.status || editingBooking.status,
        assignedDoctorName: formData.assignedDoctorName?.trim() || undefined,
        assignedDoctorPhone: formData.assignedDoctorPhone?.trim() || undefined,
        adminNotes: formData.adminNotes?.trim() || undefined,
        emergencyInstructions: formData.emergencyInstructions?.trim() || undefined,
        updatedAt: new Date().toISOString()
      };

      const updatedList = bookings.map(b => b.id === updatedItem.id ? updatedItem : b);
      onUpdateBookings(updatedList);
      setEditingBooking(null);
      showToast(lang === 'bn' ? 'বুকিং তথ্য সফলভাবে আপডেট করা হয়েছে!' : 'Booking updated successfully!');
    } else {
      // Add New
      const newBookingId = `DAH-${Math.floor(100000 + Math.random() * 900000)}`;
      const newItem: DoctorAtHomeBooking = {
        id: newBookingId,
        patientName: formData.patientName.trim(),
        patientPhone: formData.patientPhone.trim(),
        altPhone: formData.altPhone?.trim() || undefined,
        patientAge: formData.patientAge || undefined,
        patientGender: formData.patientGender || 'male',
        address: formData.address?.trim() || 'Dhaka',
        area: formData.area || 'Dhanmondi',
        date: formData.date || new Date().toISOString().split('T')[0],
        timeSlot: formData.timeSlot || 'সকাল ১০:০০ - ০১:০০',
        doctorType: formData.doctorType || 'general_physician',
        doctorTypeLabel: lang === 'bn' ? currentSpecObj.nameBn : currentSpecObj.nameEn,
        symptoms: formData.symptoms?.trim() || 'General health consultation',
        consultationFee: Number(formData.consultationFee) || currentSpecObj.fee,
        paymentMethod: (formData.paymentMethod as PaymentMethod) || 'cod',
        paymentStatus: formData.paymentStatus || 'unpaid',
        status: formData.status || 'pending',
        assignedDoctorName: formData.assignedDoctorName?.trim() || undefined,
        assignedDoctorPhone: formData.assignedDoctorPhone?.trim() || undefined,
        adminNotes: formData.adminNotes?.trim() || undefined,
        emergencyInstructions: formData.emergencyInstructions?.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      onUpdateBookings([newItem, ...bookings]);
      setIsAddModalOpen(false);
      showToast(lang === 'bn' ? 'নতুন হোম ডক্টর বুকিং তৈরি করা হয়েছে!' : 'New Doctor at Home booking created!');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
            <Home size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/30">
                {lang === 'bn' ? 'বাসায় ডাক্তার সার্ভিস' : 'Home Doctor Service'}
              </span>
              <span className="text-xs text-emerald-300 font-semibold">
                {lang === 'bn' ? 'মোট বুকিং:' : 'Total Bookings:'} {totalCount}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              {lang === 'bn' ? 'Doctor at Home (হোম ডক্টর বুকিং ব্যবস্থাপনা)' : 'Doctor at Home Bookings'}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              {lang === 'bn'
                ? 'বাসায় রোগী দেখার জন্য আসা সমস্ত বুকিং পর্যালোচনা, ডাক্তার অ্যাসাইন, পরিবর্তন, এডিট ও ডিলিট করুন।'
                : 'Manage, edit, reassign, update status, and track all home visiting doctor appointments.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBooking(null);
            setFormData({
              date: new Date().toISOString().split('T')[0],
              timeSlot: 'সকাল ১০:০০ - ০১:০০',
              doctorType: 'general_physician',
              consultationFee: 1200,
              paymentMethod: 'cod',
              paymentStatus: 'unpaid',
              status: 'pending',
              patientGender: 'male'
            });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <Plus size={16} />
          <span>{lang === 'bn' ? '+ নতুন বুকিং যোগ করুন' : '+ Add New Booking'}</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {lang === 'bn' ? 'মোট বুকিং' : 'Total'}
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            {lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
          </span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">{pendingCount}</span>
        </div>

        <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 shadow-2xs">
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
            {lang === 'bn' ? 'কনফার্ম/বরাদ্দ' : 'Confirmed'}
          </span>
          <span className="text-2xl font-black text-sky-900 mt-1 block">{confirmedCount}</span>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            {lang === 'bn' ? 'সম্পন্ন' : 'Completed'}
          </span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">{completedCount}</span>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
            {lang === 'bn' ? 'বাতিল' : 'Cancelled'}
          </span>
          <span className="text-2xl font-black text-rose-900 mt-1 block">{cancelledCount}</span>
        </div>

        <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 shadow-2xs">
          <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
            {lang === 'bn' ? 'মোট আয়' : 'Revenue'}
          </span>
          <span className="text-2xl font-black text-teal-900 mt-1 block">৳{totalRevenue}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'রোগীর নাম, ফোন, এলাকা বা আইডি...' : 'Search by name, phone, area, ID...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer font-semibold"
          >
            <option value="all">{lang === 'bn' ? 'সব স্ট্যাটাস (All Status)' : 'All Status'}</option>
            <option value="pending">{lang === 'bn' ? 'অপেক্ষমাণ (Pending)' : 'Pending'}</option>
            <option value="confirmed">{lang === 'bn' ? 'নিশ্চিত (Confirmed)' : 'Confirmed'}</option>
            <option value="assigned">{lang === 'bn' ? 'ডাক্তার বরাদ্দ (Assigned)' : 'Doctor Assigned'}</option>
            <option value="completed">{lang === 'bn' ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
            <option value="cancelled">{lang === 'bn' ? 'বাতিল (Cancelled)' : 'Cancelled'}</option>
          </select>
        </div>

        {/* Doctor Specialty Filter */}
        <div>
          <select
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer font-semibold"
          >
            <option value="all">{lang === 'bn' ? 'সব ডাক্তার স্পেশালিটি' : 'All Doctor Specialties'}</option>
            {DEFAULT_DOCTOR_AT_HOME_SPECIALTIES.map(s => (
              <option key={s.id} value={s.id}>
                {lang === 'bn' ? s.nameBn : s.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={selectedDateFilter}
            onChange={e => setSelectedDateFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold cursor-pointer"
          />
          {selectedDateFilter && (
            <button
              onClick={() => setSelectedDateFilter('')}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-100"
              title="Clear date"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Bookings List Cards / Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-6">
          <Home size={40} className="mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-700 text-sm">
            {lang === 'bn' ? 'কোনো হোম ডক্টর বুকিং পাওয়া যায়নি।' : 'No Doctor at Home bookings found.'}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {lang === 'bn' ? 'ফিল্টার পরিবর্তন করুন বা নতুন বুকিং যোগ করুন।' : 'Try changing filters or add a new booking.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Column: ID, Patient & Specialty Info */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-100 text-primary rounded-lg border border-slate-200">
                    {booking.id}
                  </span>
                  {renderStatusBadge(booking.status)}

                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-black border border-emerald-200/60 flex items-center gap-1">
                    <Stethoscope size={13} className="text-emerald-600" />
                    <span>{booking.doctorTypeLabel}</span>
                  </span>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                {/* Patient Name & Details */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="text-slate-900 font-extrabold text-base flex items-center gap-1.5">
                    <User size={15} className="text-slate-400" />
                    <span>{booking.patientName}</span>
                    {booking.patientAge && (
                      <span className="text-xs text-slate-500 font-normal">
                        ({booking.patientAge}y, {booking.patientGender === 'female' ? (lang === 'bn' ? 'মহিলা' : 'Female') : (lang === 'bn' ? 'পুরুষ' : 'Male')})
                      </span>
                    )}
                  </span>

                  <a 
                    href={`tel:${booking.patientPhone}`}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Phone size={13} />
                    <span>{booking.patientPhone}</span>
                  </a>

                  {booking.altPhone && (
                    <span className="text-slate-400 text-[11px]">Alt: {booking.altPhone}</span>
                  )}
                </div>

                {/* Address & Date/Time */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin size={13} className="text-rose-500 shrink-0" />
                    <span className="text-slate-800">{booking.address}</span>
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Calendar size={13} className="text-primary shrink-0" />
                    <span>{booking.date}</span>
                    <Clock size={13} className="text-amber-500 shrink-0 ml-1" />
                    <span>{booking.timeSlot}</span>
                  </span>
                </div>

                {/* Symptoms / Complaints Preview */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    {lang === 'bn' ? 'উপসর্গ / অভিযোগ:' : 'Symptoms:'}
                  </span>
                  <p className="text-slate-700 font-medium line-clamp-2">
                    {booking.symptoms}
                  </p>
                  {booking.emergencyInstructions && (
                    <p className="text-amber-800 font-semibold text-[11px] mt-1">
                      ⚠️ {booking.emergencyInstructions}
                    </p>
                  )}
                </div>

                {/* Assigned Doctor Box */}
                {booking.assignedDoctorName && (
                  <div className="bg-purple-50/70 p-2.5 rounded-xl border border-purple-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={14} className="text-purple-700" />
                      <span className="text-purple-950 font-bold">
                        {lang === 'bn' ? 'নিযুক্ত ডাক্তার:' : 'Visiting Doctor:'} {booking.assignedDoctorName}
                      </span>
                      {booking.assignedDoctorPhone && (
                        <span className="text-purple-700 font-semibold">({booking.assignedDoctorPhone})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Fee, Status Quick Picker & Actions */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'ভিজিট ফি' : 'Visiting Fee'}
                  </span>
                  <span className="text-xl font-black text-slate-900">৳ {booking.consultationFee}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${
                      booking.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {booking.paymentStatus === 'paid' ? 'PAID' : 'DUE / COD'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">({booking.paymentMethod})</span>
                  </div>
                </div>

                {/* Quick Status Dropdown */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={booking.status}
                    onChange={e => handleQuickStatusChange(booking.id, e.target.value as DoctorAtHomeStatus)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="assigned">Assigned</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-1.5">
                  {/* WhatsApp Direct */}
                  <a
                    href={`https://wa.me/88${booking.patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `আসসালামু আলাইকুম ${booking.patientName}, LabHome BD থেকে আপনার Doctor at Home বুকিং (ID: ${booking.id}) এর জন্য যোগাযোগ করছি। তারিখ: ${booking.date}, সময়: ${booking.timeSlot}।`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-200"
                    title="Send WhatsApp Message"
                  >
                    <MessageCircle size={15} />
                  </a>

                  {/* Print Slip */}
                  <button
                    type="button"
                    onClick={() => setViewingSlipBooking(booking)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                    title={lang === 'bn' ? 'ভিজিটিং স্লিপ প্রিন্ট' : 'Print Visiting Slip'}
                  >
                    <Printer size={15} />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(booking)}
                    className="p-2 text-sky-700 hover:bg-sky-50 rounded-xl transition-colors border border-sky-200 cursor-pointer"
                    title={lang === 'bn' ? 'এডিট করুন' : 'Edit Booking'}
                  >
                    <Edit2 size={15} />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => setDeletingBookingId(booking.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Booking'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {(editingBooking || isAddModalOpen) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden my-4 max-h-[92vh] flex flex-col animate-scaleUp">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Home size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {editingBooking 
                      ? (lang === 'bn' ? `বুকিং এডিট করুন (#${editingBooking.id})` : `Edit Booking (#${editingBooking.id})`)
                      : (lang === 'bn' ? 'নতুন হোম ডক্টর বুকিং তৈরি' : 'Create New Home Doctor Booking')}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'সব তথ্য যত্নসহকারে পূরণ করুন' : 'Update visiting details accurately'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setEditingBooking(null);
                  setIsAddModalOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="overflow-y-auto p-5 space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Patient Name */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'রোগীর নাম *' : 'Patient Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patientName || ''}
                    onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.patientPhone || ''}
                    onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Alt Phone */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'বিকল্প মোবাইল' : 'Alt Phone'}
                  </label>
                  <input
                    type="tel"
                    value={formData.altPhone || ''}
                    onChange={e => setFormData({ ...formData, altPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Age & Gender */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'বয়স' : 'Age'}
                  </label>
                  <input
                    type="number"
                    value={formData.patientAge || ''}
                    onChange={e => setFormData({ ...formData, patientAge: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'লিঙ্গ' : 'Gender'}
                  </label>
                  <select
                    value={formData.patientGender || 'male'}
                    onChange={e => setFormData({ ...formData, patientGender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none cursor-pointer"
                  >
                    <option value="male">{lang === 'bn' ? 'পুরুষ (Male)' : 'Male'}</option>
                    <option value="female">{lang === 'bn' ? 'মহিলা (Female)' : 'Female'}</option>
                    <option value="other">{lang === 'bn' ? 'অন্যান্য (Other)' : 'Other'}</option>
                  </select>
                </div>
              </div>

              {/* Specialty & Visiting Fee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ডাক্তারের ধরন (Specialty) *' : 'Doctor Specialty *'}
                  </label>
                  <select
                    value={formData.doctorType || 'general_physician'}
                    onChange={e => {
                      const sp = DEFAULT_DOCTOR_AT_HOME_SPECIALTIES.find(s => s.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        doctorType: e.target.value,
                        consultationFee: sp?.fee || formData.consultationFee
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none cursor-pointer"
                  >
                    {DEFAULT_DOCTOR_AT_HOME_SPECIALTIES.map(s => (
                      <option key={s.id} value={s.id}>
                        {lang === 'bn' ? s.nameBn : s.nameEn} (৳{s.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ভিজিট ফি (৳) *' : 'Visiting Fee (৳) *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.consultationFee || 1200}
                    onChange={e => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'সম্পূর্ণ ঠিকানা *' : 'Full Address *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House, road, flat, area..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'তারিখ *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date || ''}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'সময় স্লট *' : 'Time Slot *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.timeSlot || ''}
                    onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                    placeholder="e.g. সকাল ১০:০০ - ০১:০০"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none"
                  />
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'উপসর্গ ও রোগের বিবরণ *' : 'Symptoms & Condition *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.symptoms || ''}
                  onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Assign Visiting Doctor (Admin feature!) */}
              <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200 space-y-2.5">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-purple-700" />
                  <span>{lang === 'bn' ? 'ডাক্তার বরাদ্দকরণ (Assign Visiting Doctor)' : 'Assign Visiting Doctor'}</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-900 mb-0.5">
                      {lang === 'bn' ? 'ডাক্তারের নাম' : 'Doctor Name'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ডাঃ তানভীর হাসান"
                      value={formData.assignedDoctorName || ''}
                      onChange={e => setFormData({ ...formData, assignedDoctorName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl font-semibold outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-900 mb-0.5">
                      {lang === 'bn' ? 'ডাক্তারের মোবাইল' : 'Doctor Phone'}
                    </label>
                    <input
                      type="tel"
                      placeholder="01711-223344"
                      value={formData.assignedDoctorPhone || ''}
                      onChange={e => setFormData({ ...formData, assignedDoctorPhone: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl font-semibold outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Payment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'বুকিং স্ট্যাটাস' : 'Booking Status'}
                  </label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="assigned">Assigned</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'পেমেন্ট স্ট্যাটাস' : 'Payment Status'}
                  </label>
                  <select
                    value={formData.paymentStatus || 'unpaid'}
                    onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                  >
                    <option value="unpaid">Unpaid / Cash on Visit</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending Verification</option>
                  </select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'এডমিন নোটস / মন্তব্য' : 'Admin Notes'}
                </label>
                <input
                  type="text"
                  value={formData.adminNotes || ''}
                  onChange={e => setFormData({ ...formData, adminNotes: e.target.value })}
                  placeholder="Doctor dispatched, follow-up needed, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBooking(null);
                    setIsAddModalOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Save size={15} />
                  <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 size={26} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {lang === 'bn' ? 'বুকিংটি মুছে ফেলতে চান?' : 'Delete Booking?'}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {lang === 'bn'
                  ? 'এই বুকিং স্থায়ীভাবে মুছে যাবে এবং পুনরুদ্ধার করা যাবে না।'
                  : 'This booking record will be permanently deleted.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBookingId(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'না, রাখুন' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Slip Modal */}
      {viewingSlipBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <Home size={20} className="text-emerald-600" />
                <span className="font-black text-slate-900 text-sm">Doctor at Home Visit Slip</span>
              </div>
              <button onClick={() => setViewingSlipBooking(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-800" id="print-area">
              <div className="text-center pb-2 border-b border-dashed border-slate-200">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <img 
                    src="/icon.svg" 
                    alt="eClinic Bangladesh" 
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/icon.svg';
                    }}
                  />
                  <h4 className="font-black text-base text-slate-900">eClinic Bangladesh</h4>
                </div>
                <p className="text-[11px] text-slate-500">{lang === 'bn' ? 'হোম ডক্টর সার্ভিস - ভিজিটিং ডক্টর স্লিপ' : 'Doctor at Home Service - Visiting Doctor Slip'}</p>
                <span className="font-mono font-bold text-xs text-emerald-700 mt-1 inline-block">ID: {viewingSlipBooking.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Patient Name:</span>
                  <strong className="text-slate-900">{viewingSlipBooking.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Contact Phone:</span>
                  <strong className="text-slate-900">{viewingSlipBooking.patientPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Doctor Specialty:</span>
                  <strong className="text-emerald-700">{viewingSlipBooking.doctorTypeLabel}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Visit Date & Time:</span>
                  <strong className="text-slate-900">{viewingSlipBooking.date} ({viewingSlipBooking.timeSlot})</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Address:</span>
                <p className="font-semibold text-slate-900">{viewingSlipBooking.address}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">Symptoms / Complaints:</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">{viewingSlipBooking.symptoms}</p>
              </div>

              {viewingSlipBooking.assignedDoctorName && (
                <div className="p-2 bg-purple-50 rounded-lg text-purple-900 font-bold border border-purple-100">
                  Assigned Doctor: {viewingSlipBooking.assignedDoctorName} ({viewingSlipBooking.assignedDoctorPhone || 'N/A'})
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200 text-sm">
                <span className="font-bold text-slate-700">Visiting Fee:</span>
                <strong className="text-lg font-black text-emerald-800">৳ {viewingSlipBooking.consultationFee} ({viewingSlipBooking.paymentStatus.toUpperCase()})</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (viewingSlipBooking) {
                    printOrDownloadDoctorAtHomeSlip(viewingSlipBooking, lang);
                  }
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Printer size={15} />
                <span>{lang === 'bn' ? 'স্লিপ প্রিন্ট' : 'Print Slip'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (viewingSlipBooking) {
                    downloadDoctorAtHomeSlipHtml(viewingSlipBooking, lang);
                  }
                }}
                className="py-2.5 px-3 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Download HTML file"
              >
                <Download size={14} />
                <span>{lang === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingSlipBooking(null)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
