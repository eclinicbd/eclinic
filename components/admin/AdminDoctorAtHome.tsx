import React, { useState, useEffect } from 'react';
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
  Download,
  Users,
  UserCheck,
  UserX,
  Award,
  Building,
  Check,
  RefreshCw,
  Sparkles,
  Send,
  FileText,
  BadgeCheck,
  PhoneCall,
  Navigation
} from 'lucide-react';
import { DoctorAtHomeBooking, DoctorAtHomeStatus, Language, PaymentMethod, HomeVisitDoctor } from '../../types';
import { 
  DEFAULT_DOCTOR_AT_HOME_SPECIALTIES, 
  getWhatsAppUrl, 
  getStoredHomeVisitDoctors, 
  saveStoredHomeVisitDoctors,
  DEFAULT_HOME_VISIT_DOCTORS
} from '../../services/dataStorage';
import { 
  saveHomeVisitDoctorsToFirestore, 
  subscribeToHomeVisitDoctors 
} from '../../services/firebase';
import { printOrDownloadDoctorAtHomeSlip, downloadDoctorAtHomeSlipHtml } from '../../services/invoiceService';

interface AdminDoctorAtHomeProps {
  lang: Language;
  bookings: DoctorAtHomeBooking[];
  onUpdateBookings: (bookings: DoctorAtHomeBooking[]) => void;
  showToast: (msg: string) => void;
  initialDoctors?: HomeVisitDoctor[];
  onUpdateDoctors?: (doctors: HomeVisitDoctor[]) => void;
}

export const AdminDoctorAtHome: React.FC<AdminDoctorAtHomeProps> = ({
  lang,
  bookings,
  onUpdateBookings,
  showToast,
  initialDoctors,
  onUpdateDoctors
}) => {
  // Navigation View: 'bookings' or 'doctors'
  const [activeTab, setActiveTab] = useState<'bookings' | 'doctors'>('bookings');

  // Home Visit Doctors Roster State
  const [doctors, setDoctors] = useState<HomeVisitDoctor[]>(() => {
    if (initialDoctors && initialDoctors.length > 0) return initialDoctors;
    return getStoredHomeVisitDoctors();
  });

  // Subscribe to live doctors from Firestore if available
  useEffect(() => {
    try {
      const unsub = subscribeToHomeVisitDoctors((liveDocs) => {
        if (liveDocs && liveDocs.length > 0) {
          setDoctors(liveDocs);
          saveStoredHomeVisitDoctors(liveDocs);
        }
      });
      return () => unsub();
    } catch {
      // Handled quietly
    }
  }, []);

  const handleUpdateDoctorsList = (updatedDocs: HomeVisitDoctor[]) => {
    setDoctors(updatedDocs);
    saveStoredHomeVisitDoctors(updatedDocs);
    if (onUpdateDoctors) {
      onUpdateDoctors(updatedDocs);
    }
    saveHomeVisitDoctorsToFirestore(updatedDocs).catch(() => {});
  };

  // ==========================================
  // BOOKINGS FILTERS & SEARCH
  // ==========================================
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DoctorAtHomeStatus>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Modals state for Bookings
  const [editingBooking, setEditingBooking] = useState<DoctorAtHomeBooking | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [viewingSlipBooking, setViewingSlipBooking] = useState<DoctorAtHomeBooking | null>(null);

  // Dedicated Doctor Assignment Modal
  const [assigningBooking, setAssigningBooking] = useState<DoctorAtHomeBooking | null>(null);
  const [selectedDoctorIdToAssign, setSelectedDoctorIdToAssign] = useState<string>('');
  const [customAssignNotes, setCustomAssignNotes] = useState<string>('');
  const [autoNotifyDoctorWhatsApp, setAutoNotifyDoctorWhatsApp] = useState<boolean>(true);

  // Form state for edit/add booking
  const [formData, setFormData] = useState<Partial<DoctorAtHomeBooking>>({});

  // ==========================================
  // DOCTORS ROSTER STATE & FILTERS
  // ==========================================
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState('all');
  const [doctorAvailabilityFilter, setDoctorAvailabilityFilter] = useState<'all' | 'available' | 'busy'>('all');
  
  // Modals state for Doctors
  const [editingDoctor, setEditingDoctor] = useState<HomeVisitDoctor | null>(null);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [deletingDoctorId, setDeletingDoctorId] = useState<string | null>(null);
  const [doctorFormData, setDoctorFormData] = useState<Partial<HomeVisitDoctor>>({});

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

  // Filtered doctors
  const filteredDoctors = doctors.filter(d => {
    if (doctorSpecialtyFilter !== 'all' && d.specialty !== doctorSpecialtyFilter) return false;
    if (doctorAvailabilityFilter === 'available' && !d.isAvailable) return false;
    if (doctorAvailabilityFilter === 'busy' && d.isAvailable) return false;

    if (doctorSearchTerm.trim()) {
      const q = doctorSearchTerm.toLowerCase();
      const matchName = (d.name || '').toLowerCase().includes(q);
      const matchNameEn = (d.nameEn || '').toLowerCase().includes(q);
      const matchPhone = (d.phone || '').toLowerCase().includes(q);
      const matchArea = (d.area || '').toLowerCase().includes(q);
      const matchHospital = (d.hospital || '').toLowerCase().includes(q);
      const matchSpec = (d.specialtyLabel || '').toLowerCase().includes(q);
      const matchDegrees = (d.degrees || '').toLowerCase().includes(q);
      return matchName || matchNameEn || matchPhone || matchArea || matchHospital || matchSpec || matchDegrees;
    }
    return true;
  });

  // Statistics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const assignedCount = bookings.filter(b => b.status === 'assigned').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
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
            <Stethoscope size={11} className="text-purple-600" />
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

  // ==========================================
  // DOCTOR ASSIGNMENT FLOW
  // ==========================================
  const handleOpenAssignDoctor = (booking: DoctorAtHomeBooking) => {
    setAssigningBooking(booking);
    // Auto-select matching doctor if available
    const matchingDoctor = doctors.find(d => d.specialty === booking.doctorType && d.isAvailable) 
      || doctors.find(d => d.isAvailable) 
      || doctors[0];
    
    setSelectedDoctorIdToAssign(booking.assignedDoctorId || matchingDoctor?.id || '');
    setCustomAssignNotes(booking.adminNotes || '');
    setAutoNotifyDoctorWhatsApp(true);
  };

  const handleConfirmAssignDoctor = () => {
    if (!assigningBooking || !selectedDoctorIdToAssign) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে একজন ডাক্তার নির্বাচন করুন।' : 'Please select a doctor to assign.');
      return;
    }

    const doctor = doctors.find(d => d.id === selectedDoctorIdToAssign);
    if (!doctor) return;

    // Update booking
    const updatedBooking: DoctorAtHomeBooking = {
      ...assigningBooking,
      assignedDoctorId: doctor.id,
      assignedDoctorName: doctor.name,
      assignedDoctorPhone: doctor.phone,
      assignedDoctorSpecialty: doctor.specialtyLabel || doctor.specialty,
      assignedDoctorDesignation: doctor.designation,
      assignedAt: new Date().toISOString(),
      status: 'assigned',
      adminNotes: customAssignNotes.trim() || assigningBooking.adminNotes,
      updatedAt: new Date().toISOString()
    };

    const updatedBookings = bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b);
    onUpdateBookings(updatedBookings);

    // Increment doctor's total visits
    const updatedDoctors = doctors.map(d => {
      if (d.id === doctor.id) {
        return {
          ...d,
          totalVisits: (d.totalVisits || 0) + 1,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });
    handleUpdateDoctorsList(updatedDoctors);

    // Optional WhatsApp dispatch notification
    if (autoNotifyDoctorWhatsApp && doctor.phone) {
      const msg = `আসসালামু আলাইকুম ${doctor.name}, eClinic Bangladesh থেকে আপনার জন্য একটি নতুন Doctor at Home ভিজিট অ্যাসাইন করা হয়েছে।\n\n📌 বুকিং আইডি: ${assigningBooking.id}\n👤 রোগীর নাম: ${assigningBooking.patientName} (${assigningBooking.patientPhone})\n📍 ঠিকানা: ${assigningBooking.address}\n📅 তারিখ ও সময়: ${assigningBooking.date} (${assigningBooking.timeSlot})\n🩺 অভিযোগ/উপসর্গ: ${assigningBooking.symptoms}\n💰 ভিজিট ফি: ৳${assigningBooking.consultationFee} (${assigningBooking.paymentStatus.toUpperCase()})\n${customAssignNotes ? `📝 এডমিন নোট: ${customAssignNotes}\n` : ''}\nঅনুগ্রহ করে সময়মতো রোগীর বাসায় উপস্থিত হয়ে সেবা প্রদান করুন। ধন্যবাদ!`;
      
      const whatsappUrl = getWhatsAppUrl(doctor.phone, msg);
      window.open(whatsappUrl, '_blank');
    }

    setAssigningBooking(null);
    showToast(lang === 'bn' 
      ? `সফলভাবে ${doctor.name}-কে বুকিং #${assigningBooking.id}-এ অ্যাসাইন করা হয়েছে!` 
      : `Dr. ${doctor.name} successfully assigned to booking #${assigningBooking.id}!`);
  };

  // Save Booking Edit / Add
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName?.trim() || !formData.patientPhone?.trim()) {
      alert(lang === 'bn' ? 'রোগীর নাম ও ফোন নম্বর আবশ্যক।' : 'Patient name and phone are required.');
      return;
    }

    const currentSpecObj = DEFAULT_DOCTOR_AT_HOME_SPECIALTIES.find(s => s.id === formData.doctorType)
      || DEFAULT_DOCTOR_AT_HOME_SPECIALTIES[0];

    // Check if an assigned doctor was selected from the list
    let assignedDocName = formData.assignedDoctorName?.trim();
    let assignedDocPhone = formData.assignedDoctorPhone?.trim();
    let assignedDocId = formData.assignedDoctorId;
    let assignedDocSpecialty = formData.assignedDoctorSpecialty;
    let assignedDocDesignation = formData.assignedDoctorDesignation;

    if (formData.assignedDoctorId) {
      const matchedDoc = doctors.find(d => d.id === formData.assignedDoctorId);
      if (matchedDoc) {
        assignedDocName = matchedDoc.name;
        assignedDocPhone = matchedDoc.phone;
        assignedDocSpecialty = matchedDoc.specialtyLabel;
        assignedDocDesignation = matchedDoc.designation;
      }
    }

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
        status: formData.status || (assignedDocName ? 'assigned' : editingBooking.status),
        assignedDoctorId: assignedDocId || editingBooking.assignedDoctorId,
        assignedDoctorName: assignedDocName || undefined,
        assignedDoctorPhone: assignedDocPhone || undefined,
        assignedDoctorSpecialty: assignedDocSpecialty || editingBooking.assignedDoctorSpecialty,
        assignedDoctorDesignation: assignedDocDesignation || editingBooking.assignedDoctorDesignation,
        assignedAt: assignedDocName && !editingBooking.assignedDoctorName ? new Date().toISOString() : editingBooking.assignedAt,
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
        status: formData.status || (assignedDocName ? 'assigned' : 'pending'),
        assignedDoctorId: assignedDocId || undefined,
        assignedDoctorName: assignedDocName || undefined,
        assignedDoctorPhone: assignedDocPhone || undefined,
        assignedDoctorSpecialty: assignedDocSpecialty || undefined,
        assignedDoctorDesignation: assignedDocDesignation || undefined,
        assignedAt: assignedDocName ? new Date().toISOString() : undefined,
        adminNotes: formData.adminNotes?.trim() || undefined,
        emergencyInstructions: formData.emergencyInstructions?.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      onUpdateBookings([newItem, ...bookings]);
      setIsAddModalOpen(false);
      showToast(lang === 'bn' ? 'নতুন হোম ডক্টর বুকিং তৈরি করা হয়েছে!' : 'New Doctor at Home booking created!');
    }
  };

  // ==========================================
  // DOCTORS ROSTER MANAGEMENT ACTIONS
  // ==========================================
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorFormData({
      name: '',
      nameEn: '',
      phone: '',
      altPhone: '',
      specialty: 'general_physician',
      degrees: 'MBBS',
      designation: 'মেডিকেল অফিসার',
      hospital: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
      area: 'ধানমন্ডি, মোহাম্মদপুর, লালমাটিয়া',
      gender: 'male',
      isAvailable: true,
      totalVisits: 0
    });
    setIsAddDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: HomeVisitDoctor) => {
    setEditingDoctor(doc);
    setDoctorFormData({ ...doc });
    setIsAddDoctorModalOpen(true);
  };

  const handleToggleDoctorAvailability = (docId: string) => {
    const updated = doctors.map(d => {
      if (d.id === docId) {
        const nextState = !d.isAvailable;
        return { ...d, isAvailable: nextState, updatedAt: new Date().toISOString() };
      }
      return d;
    });
    handleUpdateDoctorsList(updated);
    showToast(lang === 'bn' ? 'ডাক্তারের উপস্থিতি স্ট্যাটাস আপডেট করা হয়েছে!' : 'Doctor availability updated!');
  };

  const handleConfirmDeleteDoctor = () => {
    if (!deletingDoctorId) return;
    const updated = doctors.filter(d => d.id !== deletingDoctorId);
    handleUpdateDoctorsList(updated);
    setDeletingDoctorId(null);
    showToast(lang === 'bn' ? 'ডাক্তার তালিকা থেকে মুছে ফেলা হয়েছে।' : 'Doctor deleted from roster.');
  };

  const handleResetDefaultDoctors = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি ডিফল্ট হোম ভিজিট ডাক্তারদের তালিকা রিস্টোর করতে চান?' : 'Restore default home visit doctors roster?')) {
      handleUpdateDoctorsList(DEFAULT_HOME_VISIT_DOCTORS);
      showToast(lang === 'bn' ? 'ডিফল্ট ডাক্তার তালিকা রিস্টোর করা হয়েছে!' : 'Default doctor roster restored!');
    }
  };

  const handleSaveDoctorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorFormData.name?.trim() || !doctorFormData.phone?.trim() || !doctorFormData.degrees?.trim()) {
      alert(lang === 'bn' ? 'ডাক্তারের নাম, মোবাইল ও ডিগ্রি আবশ্যক।' : 'Doctor name, phone and degrees are required.');
      return;
    }

    const currentSpecObj = DEFAULT_DOCTOR_AT_HOME_SPECIALTIES.find(s => s.id === doctorFormData.specialty);
    const specLabel = currentSpecObj ? (lang === 'bn' ? currentSpecObj.nameBn : currentSpecObj.nameEn) : 'জেনারেল ফিজিশিয়ান';

    if (editingDoctor) {
      // Update existing doctor
      const updatedDoc: HomeVisitDoctor = {
        ...editingDoctor,
        name: doctorFormData.name.trim(),
        nameEn: doctorFormData.nameEn?.trim() || undefined,
        phone: doctorFormData.phone.trim(),
        altPhone: doctorFormData.altPhone?.trim() || undefined,
        email: doctorFormData.email?.trim() || undefined,
        specialty: doctorFormData.specialty || 'general_physician',
        specialtyLabel: specLabel,
        degrees: doctorFormData.degrees.trim(),
        designation: doctorFormData.designation?.trim() || 'মেডিকেল অফিসার',
        hospital: doctorFormData.hospital?.trim() || undefined,
        area: doctorFormData.area?.trim() || 'ঢাকা সিটি',
        gender: doctorFormData.gender || 'male',
        isAvailable: doctorFormData.isAvailable ?? true,
        notes: doctorFormData.notes?.trim() || undefined,
        updatedAt: new Date().toISOString()
      };

      const updatedList = doctors.map(d => d.id === updatedDoc.id ? updatedDoc : d);
      handleUpdateDoctorsList(updatedList);
      setIsAddDoctorModalOpen(false);
      setEditingDoctor(null);
      showToast(lang === 'bn' ? `"${updatedDoc.name}" এর তথ্য আপডেট করা হয়েছে!` : `Dr. ${updatedDoc.name} updated successfully!`);
    } else {
      // Add new doctor
      const newDocId = `HVD-${Date.now().toString().slice(-4)}`;
      const newDoc: HomeVisitDoctor = {
        id: newDocId,
        name: doctorFormData.name.trim(),
        nameEn: doctorFormData.nameEn?.trim() || undefined,
        phone: doctorFormData.phone.trim(),
        altPhone: doctorFormData.altPhone?.trim() || undefined,
        email: doctorFormData.email?.trim() || undefined,
        specialty: doctorFormData.specialty || 'general_physician',
        specialtyLabel: specLabel,
        degrees: doctorFormData.degrees.trim(),
        designation: doctorFormData.designation?.trim() || 'মেডিকেল অফিসার',
        hospital: doctorFormData.hospital?.trim() || undefined,
        area: doctorFormData.area?.trim() || 'ঢাকা সিটি',
        gender: doctorFormData.gender || 'male',
        isAvailable: doctorFormData.isAvailable ?? true,
        notes: doctorFormData.notes?.trim() || undefined,
        totalVisits: Number(doctorFormData.totalVisits) || 0,
        createdAt: new Date().toISOString()
      };

      handleUpdateDoctorsList([newDoc, ...doctors]);
      setIsAddDoctorModalOpen(false);
      showToast(lang === 'bn' ? `নতুন ডাক্তার "${newDoc.name}" রোস্টারে যোগ করা হয়েছে!` : `Dr. ${newDoc.name} added to home roster!`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
            <Home size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/30">
                {lang === 'bn' ? 'বাসায় ডাক্তার সার্ভিস' : 'Doctor at Home Service'}
              </span>
              <span className="text-xs text-emerald-300 font-semibold">
                {lang === 'bn' ? 'মোট বুকিং:' : 'Total Bookings:'} {totalCount} | {lang === 'bn' ? 'রেজিস্টার্ড ডাক্তার:' : 'Registered Doctors:'} {doctors.length}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              {lang === 'bn' ? 'Doctor at Home (হোম ডক্টর বুকিং ও ডাক্তার রোস্টার)' : 'Doctor at Home Bookings & Doctor Roster'}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              {lang === 'bn'
                ? 'বাসায় রোগী দেখার জন্য বুকিং ব্যবস্থাপনা, অনুমোদিত ডাক্তারদের তালিকা ও সরাসরি ডাক্তার অ্যাসাইন করুন।'
                : 'Manage home visiting bookings, doctor rosters, assign visiting doctors, and track dispatches.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {activeTab === 'bookings' ? (
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
          ) : (
            <button
              type="button"
              onClick={handleOpenAddDoctor}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Plus size={16} />
              <span>{lang === 'bn' ? '+ নতুন ডাক্তার যোগ করুন' : '+ Add Home Doctor'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View Switcher Tabs (Bookings vs Doctors Roster) */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Calendar size={15} className={activeTab === 'bookings' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>{lang === 'bn' ? 'হোম ডক্টর বুকিংস' : 'Home Doctor Bookings'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'bookings' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'doctors'
                ? 'bg-white text-purple-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Stethoscope size={15} className={activeTab === 'doctors' ? 'text-purple-600' : 'text-slate-400'} />
            <span>{lang === 'bn' ? 'ডাক্তারদের তালিকা ও রোস্টার (Doctor Roster)' : 'Doctor Roster Directory'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'doctors' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {doctors.length}
            </span>
          </button>
        </div>

        {activeTab === 'doctors' && (
          <button
            type="button"
            onClick={handleResetDefaultDoctors}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={13} />
            <span>{lang === 'bn' ? 'ডিফল্ট ডাক্তার রোস্টার রিস্টোর' : 'Restore Default Roster'}</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BOOKINGS MANAGEMENT                                                */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
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

            <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 shadow-2xs">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
                {lang === 'bn' ? 'ডাক্তার বরাদ্দ' : 'Assigned'}
              </span>
              <span className="text-2xl font-black text-purple-900 mt-1 block">{assignedCount}</span>
            </div>

            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 shadow-2xs">
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                {lang === 'bn' ? 'কনফার্ম' : 'Confirmed'}
              </span>
              <span className="text-2xl font-black text-sky-900 mt-1 block">{confirmedCount}</span>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                {lang === 'bn' ? 'সম্পন্ন' : 'Completed'}
              </span>
              <span className="text-2xl font-black text-emerald-900 mt-1 block">{completedCount}</span>
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
                placeholder={lang === 'bn' ? 'রোগী, ফোন, এলাকা বা ডাক্তার...' : 'Search by patient, phone, doctor...'}
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
                <option value="assigned">{lang === 'bn' ? 'ডাক্তার বরাদ্দ (Assigned)' : 'Doctor Assigned'}</option>
                <option value="confirmed">{lang === 'bn' ? 'নিশ্চিত (Confirmed)' : 'Confirmed'}</option>
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

          {/* Bookings List Cards */}
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
              {filteredBookings.map(booking => {
                const isAssigned = !!booking.assignedDoctorName;

                return (
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

                      {/* Assigned Doctor Box OR Direct Assign Button */}
                      {isAssigned ? (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50/70 p-3 rounded-2xl border border-purple-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              <Stethoscope size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                                  {lang === 'bn' ? 'অ্যাসাইনকৃত ডাক্তার:' : 'Assigned Doctor:'}
                                </span>
                                <span className="text-purple-950 font-black text-sm">
                                  {booking.assignedDoctorName}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-purple-800 text-[11px] font-semibold mt-0.5">
                                {booking.assignedDoctorPhone && (
                                  <a href={`tel:${booking.assignedDoctorPhone}`} className="hover:underline flex items-center gap-1">
                                    <Phone size={11} /> {booking.assignedDoctorPhone}
                                  </a>
                                )}
                                {booking.assignedDoctorSpecialty && (
                                  <span>• {booking.assignedDoctorSpecialty}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Notify Doctor WhatsApp */}
                            {booking.assignedDoctorPhone && (
                              <a
                                href={getWhatsAppUrl(
                                  booking.assignedDoctorPhone,
                                  `আসসালামু আলাইকুম ${booking.assignedDoctorName}, eClinic Bangladesh থেকে আপনার জন্য হোম ভিজিট অ্যাসাইনমেন্ট (#${booking.id}):\n\nরোগী: ${booking.patientName} (${booking.patientPhone})\nঠিকানা: ${booking.address}\nতারিখ: ${booking.date} (${booking.timeSlot})\nউপসর্গ: ${booking.symptoms}\nফি: ৳${booking.consultationFee}`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs transition-colors"
                                title={lang === 'bn' ? 'ডাক্তারের হোয়াটসঅ্যাপে নোটিফিকেশন পাঠান' : 'Notify Doctor via WhatsApp'}
                              >
                                <MessageCircle size={13} />
                                <span>{lang === 'bn' ? 'ডাক্তারকে নোটিফাই' : 'WhatsApp'}</span>
                              </a>
                            )}

                            {/* Reassign Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenAssignDoctor(booking)}
                              className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title={lang === 'bn' ? 'ডাক্তার পরিবর্তন করুন' : 'Change Doctor'}
                            >
                              <RefreshCw size={12} />
                              <span>{lang === 'bn' ? 'পরিবর্তন' : 'Reassign'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-amber-600 shrink-0" />
                            <div>
                              <span className="font-extrabold text-amber-950 block">
                                {lang === 'bn' ? 'কোনো ডাক্তার অ্যাসাইন করা হয়নি' : 'No Doctor Assigned Yet'}
                              </span>
                              <span className="text-[11px] text-amber-800">
                                {lang === 'bn' ? 'হোম ভিজিট নিশ্চিত করতে তালিকা থেকে একজন ডাক্তার নিয়োগ দিন।' : 'Assign a certified doctor from your roster to dispatch.'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenAssignDoctor(booking)}
                            className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
                          >
                            <Stethoscope size={14} />
                            <span>{lang === 'bn' ? '🩺 ডাক্তার অ্যাসাইন করুন' : 'Assign Doctor'}</span>
                          </button>
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
                          <option value="assigned">Assigned</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="flex items-center gap-1.5">
                        {/* WhatsApp Direct to Patient */}
                        <a
                          href={getWhatsAppUrl(
                            booking.patientPhone,
                            `আসসালামু আলাইকুম ${booking.patientName}, eClinic Bangladesh থেকে আপনার Doctor Home বুকিং (ID: ${booking.id}) এর জন্য যোগাযোগ করছি। তারিখ: ${booking.date}, সময়: ${booking.timeSlot}।`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-200"
                          title="Send Patient WhatsApp Message"
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
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DOCTOR ROSTER MANAGEMENT (ডাক্তারদের তালিকা ব্যবস্থাপনা)          */}
      {/* ========================================================================= */}
      {activeTab === 'doctors' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Sub-bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-purple-600" />
                <span>{lang === 'bn' ? 'হোম ভিজিট ডাক্তারদের নামের তালিকা ও প্রোফাইল' : 'Home Visiting Doctors Roster & Profiles'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn'
                  ? 'হোম ভিজিটের জন্য রেজিস্টার্ড ডাক্তার যোগ করুন, এডিট করুন, ফোন নম্বর ও স্পেশালিটি ম্যানেজ করুন।'
                  : 'Manage certified visiting doctors, specializations, phone numbers, and home visit availability.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddDoctor}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus size={15} />
              <span>{lang === 'bn' ? 'নতুন ডাক্তার যুক্ত করুন' : 'Add New Doctor'}</span>
            </button>
          </div>

          {/* Quick Stats for Doctors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {lang === 'bn' ? 'মোট ডাক্তার' : 'Total Doctors'}
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{doctors.length}</span>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                {lang === 'bn' ? 'উপলব্ধ / ডিউটিতে প্রস্তুত' : 'Available on Duty'}
              </span>
              <span className="text-xl font-black text-emerald-900 mt-1 block">
                {doctors.filter(d => d.isAvailable).length}
              </span>
            </div>

            <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                {lang === 'bn' ? 'জেনারেল ফিজিশিয়ান' : 'General Physicians'}
              </span>
              <span className="text-xl font-black text-purple-900 mt-1 block">
                {doctors.filter(d => d.specialty === 'general_physician').length}
              </span>
            </div>

            <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                {lang === 'bn' ? 'মোট সম্পন্ন হোম ভিজিট' : 'Completed Home Visits'}
              </span>
              <span className="text-xl font-black text-teal-900 mt-1 block">
                {doctors.reduce((sum, d) => sum + (d.totalVisits || 0), 0)}
              </span>
            </div>
          </div>

          {/* Doctors Filter & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'ডাক্তারের নাম, মোবাইল, এরিয়া, ডিগ্রি...' : 'Search doctor by name, phone, area, degree...'}
                value={doctorSearchTerm}
                onChange={e => setDoctorSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <select
                value={doctorSpecialtyFilter}
                onChange={e => setDoctorSpecialtyFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer font-semibold"
              >
                <option value="all">{lang === 'bn' ? 'সব স্পেশালিটি (All Specialties)' : 'All Specialties'}</option>
                {DEFAULT_DOCTOR_AT_HOME_SPECIALTIES.map(s => (
                  <option key={s.id} value={s.id}>
                    {lang === 'bn' ? s.nameBn : s.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={doctorAvailabilityFilter}
                onChange={e => setDoctorAvailabilityFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none cursor-pointer font-semibold"
              >
                <option value="all">{lang === 'bn' ? 'সব উপস্থিতি স্ট্যাটাস' : 'All Availability'}</option>
                <option value="available">{lang === 'bn' ? '🟢 শুধুমাত্র উপলব্ধ (Available Only)' : '🟢 Available Only'}</option>
                <option value="busy">{lang === 'bn' ? '⚪ সাময়িক অনুপলব্ধ (Unavailable)' : '⚪ Unavailable'}</option>
              </select>
            </div>
          </div>

          {/* Doctors Grid Cards */}
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-6">
              <Stethoscope size={40} className="mx-auto text-slate-300 mb-2" />
              <h3 className="font-bold text-slate-700 text-sm">
                {lang === 'bn' ? 'কোনো ডাক্তার পাওয়া যায়নি।' : 'No Doctors Found in Roster.'}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                {lang === 'bn' ? 'সার্চ ফিল্টার পরিবর্তন করুন বা নতুন ডাক্তার যোগ করুন।' : 'Try changing search filters or add a new doctor.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map(doctor => (
                <div
                  key={doctor.id}
                  className={`bg-white rounded-2xl border p-4.5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-3.5 ${
                    doctor.isAvailable ? 'border-slate-200 hover:border-purple-300' : 'border-slate-200/60 opacity-80 bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Card Header: Avatar, Name, Availability */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                          doctor.gender === 'female'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {doctor.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-black text-slate-900 text-sm leading-tight">
                              {doctor.name}
                            </h3>
                            {doctor.nameEn && (
                              <span className="text-[10px] text-slate-400 font-medium">({doctor.nameEn})</span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-purple-800 mt-0.5">{doctor.degrees}</p>
                        </div>
                      </div>

                      {/* 1-Click Availability Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleDoctorAvailability(doctor.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer shrink-0 ${
                          doctor.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                        }`}
                        title={lang === 'bn' ? 'উপস্থিতি পরিবর্তন করুন' : 'Toggle availability'}
                      >
                        {doctor.isAvailable ? (lang === 'bn' ? '🟢 প্রস্তুত' : 'Available') : (lang === 'bn' ? '⚪ বন্ধ' : 'Busy')}
                      </button>
                    </div>

                    {/* Designation & Hospital */}
                    {(doctor.designation || doctor.hospital) && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-0.5">
                        {doctor.designation && <div className="font-semibold text-slate-800">{doctor.designation}</div>}
                        {doctor.hospital && <div className="text-slate-500 flex items-center gap-1"><Building size={11} /> {doctor.hospital}</div>}
                      </div>
                    )}

                    {/* Specialty & Area */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-800 font-bold rounded-lg border border-purple-200/60 text-[10px] flex items-center gap-1">
                          <Stethoscope size={11} />
                          <span>{doctor.specialtyLabel || doctor.specialty}</span>
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-lg border border-amber-200/60 text-[10px]">
                          🔥 {doctor.totalVisits || 0} {lang === 'bn' ? 'হোম ভিজিট সম্পন্ন' : 'Visits'}
                        </span>
                      </div>

                      <div className="flex items-start gap-1 text-[11px] text-slate-600">
                        <MapPin size={12} className="text-rose-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{doctor.area}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Phone, WhatsApp, Edit & Delete */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${doctor.phone}`}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                        title="Call Doctor"
                      >
                        <PhoneCall size={12} className="text-emerald-600" />
                        <span>{doctor.phone}</span>
                      </a>

                      <a
                        href={getWhatsAppUrl(doctor.phone, `আসসালামু আলাইকুম ${doctor.name}, eClinic Bangladesh থেকে যোগাযোগ করছি।`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl border border-emerald-200 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDoctor(doctor)}
                        className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-xl border border-sky-100 transition-colors cursor-pointer"
                        title={lang === 'bn' ? 'এডিট করুন' : 'Edit Doctor'}
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingDoctorId(doctor.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                        title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Doctor'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN VISITING DOCTOR TO A BOOKING                                */}
      {/* ========================================================================= */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden my-4 max-h-[92vh] flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-purple-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {lang === 'bn' ? `হোম ডাক্তার অ্যাসাইন করুন (#${assigningBooking.id})` : `Assign Visiting Doctor (#${assigningBooking.id})`}
                  </h3>
                  <span className="text-[11px] text-purple-200">
                    {lang === 'bn' ? 'ডাক্তার নির্বাচন করুন ও স্বয়ংক্রিয়ভাবে নোটিফাই করুন' : 'Choose a certified doctor from roster to dispatch'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setAssigningBooking(null)}
                className="p-1.5 text-purple-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-xs flex-1">
              {/* Patient & Booking Summary Card */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">{assigningBooking.patientName}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px]">
                    {assigningBooking.doctorTypeLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                  <div>📞 {assigningBooking.patientPhone}</div>
                  <div>📅 {assigningBooking.date} ({assigningBooking.timeSlot})</div>
                </div>

                <div className="text-[11px] text-slate-700 flex items-start gap-1">
                  <MapPin size={12} className="text-rose-500 shrink-0 mt-0.5" />
                  <span>{assigningBooking.address}</span>
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">{lang === 'bn' ? 'উপসর্গ:' : 'Symptoms:'}</span> {assigningBooking.symptoms}
                </div>
              </div>

              {/* Doctor Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800 text-xs">
                  {lang === 'bn' ? 'ডাক্তার নির্বাচন করুন (Select Doctor from Roster) *' : 'Select Doctor from Roster *'}
                </label>
                <select
                  value={selectedDoctorIdToAssign}
                  onChange={e => setSelectedDoctorIdToAssign(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-purple-300 rounded-xl text-xs font-bold text-purple-950 outline-none focus:ring-2 focus:ring-purple-600 shadow-2xs cursor-pointer"
                >
                  <option value="">{lang === 'bn' ? '-- ডাক্তার নির্বাচন করুন --' : '-- Select a Doctor --'}</option>
                  {doctors.map(doc => {
                    const matchesSpec = doc.specialty === assigningBooking.doctorType;
                    return (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.degrees} ({doc.specialtyLabel || doc.specialty}) {matchesSpec ? '⭐ (Matched Specialty)' : ''} {doc.isAvailable ? '🟢' : '⚪'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Selected Doctor Preview */}
              {selectedDoctorIdToAssign && (() => {
                const doc = doctors.find(d => d.id === selectedDoctorIdToAssign);
                if (!doc) return null;
                return (
                  <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 space-y-2 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-purple-950">{doc.name}</span>
                        <span className="text-[10px] font-bold text-purple-700">({doc.degrees})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {doc.isAvailable ? (lang === 'bn' ? '🟢 প্রস্তুত' : 'Available') : (lang === 'bn' ? '⚪ বন্ধ' : 'Unavailable')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-900 font-medium">
                      <div>📱 {doc.phone}</div>
                      <div>🏥 {doc.hospital || 'eClinic Home Team'}</div>
                      <div className="col-span-2">📍 {lang === 'bn' ? 'কভারেজ এলাকা:' : 'Area:'} {doc.area}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Special Instructions / Notes for Doctor */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 text-xs">
                  {lang === 'bn' ? 'ডাক্তারের জন্য বিশেষ নির্দেশনা বা নোট (ঐচ্ছিক)' : 'Instructions for Doctor (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. রোগীর প্রেসার অনেক বেশি, দ্রুত ইসিজি ও ব্লাড সুগার দেখতে হবে..."
                  value={customAssignNotes}
                  onChange={e => setCustomAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none text-xs resize-none"
                />
              </div>

              {/* WhatsApp Notification Toggle */}
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200">
                <input
                  type="checkbox"
                  id="notifyWhatsapp"
                  checked={autoNotifyDoctorWhatsApp}
                  onChange={e => setAutoNotifyDoctorWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="notifyWhatsapp" className="text-xs font-bold text-emerald-900 cursor-pointer select-none flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-emerald-700" />
                  <span>{lang === 'bn' ? 'ডাক্তারের হোয়াটসঅ্যাপে রোগীর ঠিকানা ও বুকিং ডিটেইলস পাঠান' : 'Send WhatsApp Dispatch Message to Doctor'}</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningBooking(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssignDoctor}
                  className="px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>{lang === 'bn' ? 'অ্যাসাইন নিশ্চিত করুন' : 'Confirm Assignment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT HOME VISITING DOCTOR                                    */}
      {/* ========================================================================= */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden my-4 max-h-[92vh] flex flex-col animate-scaleUp">
            <div className="bg-purple-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/30 text-purple-300 flex items-center justify-center font-bold">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {editingDoctor 
                      ? (lang === 'bn' ? `ডাক্তার প্রোফাইল এডিট (#${editingDoctor.id})` : `Edit Doctor Profile (#${editingDoctor.id})`)
                      : (lang === 'bn' ? 'নতুন হোম ভিজিট ডাক্তার যুক্ত করুন' : 'Add New Home Visiting Doctor')}
                  </h3>
                  <span className="text-[11px] text-purple-200">
                    {lang === 'bn' ? 'ডাক্তারের প্রয়োজনীয় তথ্য ও কভারেজ এলাকা দিন' : 'Enter doctor profile and coverage area'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsAddDoctorModalOpen(false);
                  setEditingDoctor(null);
                }}
                className="p-1.5 text-purple-200 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDoctorForm} className="overflow-y-auto p-5 space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name Bangla */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ডাক্তারের নাম (বাংলা) *' : 'Doctor Name (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ডাঃ তানভীর হাসান"
                    value={doctorFormData.name || ''}
                    onChange={e => setDoctorFormData({ ...doctorFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Name English */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ডাক্তারের নাম (English)' : 'Doctor Name (English)'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Tanvir Hasan"
                    value={doctorFormData.nameEn || ''}
                    onChange={e => setDoctorFormData({ ...doctorFormData, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Mobile Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01711-223344"
                    value={doctorFormData.phone || ''}
                    onChange={e => setDoctorFormData({ ...doctorFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Alternate Phone */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'বিকল্প নম্বর (ঐচ্ছিক)' : 'Alternate Phone'}
                  </label>
                  <input
                    type="tel"
                    placeholder="01911-000000"
                    value={doctorFormData.altPhone || ''}
                    onChange={e => setDoctorFormData({ ...doctorFormData, altPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Specialty */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'স্পেশালিটি *' : 'Specialty *'}
                  </label>
                  <select
                    value={doctorFormData.specialty || 'general_physician'}
                    onChange={e => setDoctorFormData({ ...doctorFormData, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                  >
                    {DEFAULT_DOCTOR_AT_HOME_SPECIALTIES.map(s => (
                      <option key={s.id} value={s.id}>
                        {lang === 'bn' ? s.nameBn : s.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'লিঙ্গ' : 'Gender'}
                  </label>
                  <select
                    value={doctorFormData.gender || 'male'}
                    onChange={e => setDoctorFormData({ ...doctorFormData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none cursor-pointer"
                  >
                    <option value="male">{lang === 'bn' ? 'পুরুষ (Male)' : 'Male'}</option>
                    <option value="female">{lang === 'bn' ? 'মহিলা (Female)' : 'Female'}</option>
                  </select>
                </div>
              </div>

              {/* Degrees / Qualification */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'ডিগ্রি ও শিক্ষাগত যোগ্যতা *' : 'Degrees & Qualification *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBBS, BCS (Health), FCPS (Medicine-FP), CCD (BIRDEM)"
                  value={doctorFormData.degrees || ''}
                  onChange={e => setDoctorFormData({ ...doctorFormData, degrees: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Designation & Hospital */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'পদবী / ডেজিগনেশন' : 'Designation'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. রেসিডেন্ট ফিজিশিয়ান / মেডিকেল অফিসার"
                    value={doctorFormData.designation || ''}
                    onChange={e => setDoctorFormData({ ...doctorFormData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'কর্মস্থল / হাসপাতাল' : 'Hospital / Workplace'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ঢাকা মেডিকেল কলেজ হাসপাতাল"
                    value={doctorFormData.hospital || ''}
                    onChange={e => setDoctorFormData({ ...doctorFormData, hospital: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none"
                  />
                </div>
              </div>

              {/* Coverage Area */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'হোম সার্ভিস কভারেজ এলাকা *' : 'Home Visit Coverage Areas *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ধানমন্ডি, মোহাম্মদপুর, লালমাটিয়া, কলাবাগান, পান্থপথ"
                  value={doctorFormData.area || ''}
                  onChange={e => setDoctorFormData({ ...doctorFormData, area: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Availability & Initial Visits Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50/70 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="doctorAvailable"
                    checked={doctorFormData.isAvailable ?? true}
                    onChange={e => setDoctorFormData({ ...doctorFormData, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="doctorAvailable" className="font-bold text-purple-950 cursor-pointer select-none">
                    {lang === 'bn' ? 'হোম ভিজিটের জন্য বর্তমানে প্রস্তুত (Available)' : 'Currently Available for Visits'}
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-purple-900 mb-0.5">
                    {lang === 'bn' ? 'সম্পন্ন হোম ভিজিট সংখ্যা' : 'Completed Visits Count'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={doctorFormData.totalVisits ?? 0}
                    onChange={e => setDoctorFormData({ ...doctorFormData, totalVisits: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-xl font-bold outline-none text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'বিশেষ দক্ষতা বা অতিরিক্ত মন্তব্য' : 'Specialization Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. বয়স্ক রোগীদের দীর্ঘস্থায়ী রোগ, স্ট্রোক ফলোআপ ও বেডরিডেন পেশেন্ট কেয়ার।"
                  value={doctorFormData.notes || ''}
                  onChange={e => setDoctorFormData({ ...doctorFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDoctorModalOpen(false);
                    setEditingDoctor(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Save size={15} />
                  <span>{lang === 'bn' ? 'ডাক্তার সংরক্ষণ করুন' : 'Save Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT BOOKING                                                 */}
      {/* ========================================================================= */}
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

              {/* Assign Visiting Doctor from Roster */}
              <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200 space-y-2.5">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-purple-700" />
                  <span>{lang === 'bn' ? 'ডাক্তার বরাদ্দকরণ (Assign Doctor from Roster)' : 'Assign Doctor from Roster'}</span>
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 mb-0.5">
                    {lang === 'bn' ? 'তালিকা থেকে ডাক্তার বাছাই করুন:' : 'Select Registered Doctor:'}
                  </label>
                  <select
                    value={formData.assignedDoctorId || ''}
                    onChange={e => {
                      const selectedId = e.target.value;
                      const matched = doctors.find(d => d.id === selectedId);
                      if (matched) {
                        setFormData({
                          ...formData,
                          assignedDoctorId: matched.id,
                          assignedDoctorName: matched.name,
                          assignedDoctorPhone: matched.phone,
                          assignedDoctorSpecialty: matched.specialtyLabel,
                          assignedDoctorDesignation: matched.designation,
                          status: 'assigned'
                        });
                      } else {
                        setFormData({
                          ...formData,
                          assignedDoctorId: undefined,
                          assignedDoctorName: '',
                          assignedDoctorPhone: ''
                        });
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold outline-none text-xs text-purple-950"
                  >
                    <option value="">{lang === 'bn' ? '-- ডাক্তার নির্বাচন করুন বা ম্যানুয়ালি লিখুন --' : '-- Choose Doctor or Type Manually --'}</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.degrees}) - {d.phone} [{d.area}]
                      </option>
                    ))}
                  </select>
                </div>

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
                    <option value="assigned">Assigned</option>
                    <option value="confirmed">Confirmed</option>
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

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION (BOOKING & DOCTOR)                              */}
      {/* ========================================================================= */}
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

      {deletingDoctorId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 size={26} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {lang === 'bn' ? 'ডাক্তারটি মুছে ফেলতে চান?' : 'Delete Doctor?'}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {lang === 'bn'
                  ? 'এই ডাক্তারকে রোস্টার থেকে স্থায়ীভাবে মুছে ফেলা হবে।'
                  : 'This doctor will be permanently removed from roster.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDoctorId(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'না, রাখুন' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDoctor}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINT SLIP                                                         */}
      {/* ========================================================================= */}
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
