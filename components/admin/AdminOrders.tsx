import React, { useState, useMemo, useEffect } from 'react';
import { BookingHistoryItem, LabPartner, Language, BookingStatus, Phlebotomist } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  Search, 
  Plus, 
  Download, 
  Eye, 
  Trash2, 
  Phone, 
  MapPin, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FlaskConical, 
  Sparkles,
  Edit2,
  Filter,
  Printer,
  Calendar,
  CalendarDays,
  RotateCcw,
  X,
  FileText,
  FileUp,
  Syringe,
  Send,
  MessageSquare,
  Share2,
  CheckCircle2,
  UserPlus,
  ChevronRight,
  Star,
  Bike,
  Users,
  Check,
  CheckSquare,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Button } from '../Button';
import { printOrDownloadInvoice } from '../../services/invoiceService';
import { printOrdersListReport } from '../../services/reportService';
import { formatOrderId } from '../BookingModal';
import { 
  getStoredCurrentStaff, 
  getStoredStaffUsers, 
  getStoredPhlebotomists, 
  saveStoredPhlebotomists, 
  generatePhlebotomistDispatchWhatsAppText, 
  getWhatsAppUrl, 
  POPULAR_AREAS 
} from '../../services/dataStorage';
import { 
  savePhlebotomistsToFirestore, 
  subscribeToPhlebotomists, 
  saveBookingToFirestore 
} from '../../services/firebase';

interface AdminOrdersProps {
  lang: Language;
  bookings: BookingHistoryItem[];
  labs: LabPartner[];
  onUpdateStatus: (orderId: string, status: BookingStatus) => void;
  onSelectOrder: (order: BookingHistoryItem) => void;
  onOpenEditOrder: (order: BookingHistoryItem) => void;
  onOpenAddOrder: () => void;
  onOpenDeleteOrder: (order: BookingHistoryItem) => void;
  phlebotomists?: Phlebotomist[];
  onUpdatePhlebotomists?: (phlebotomists: Phlebotomist[]) => void;
  onUpdateBookings?: (bookings: BookingHistoryItem[]) => void;
  showToast?: (msg: string) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  lang,
  bookings,
  labs,
  onUpdateStatus,
  onSelectOrder,
  onOpenEditOrder,
  onOpenAddOrder,
  onOpenDeleteOrder,
  phlebotomists: initialPhlebotomists,
  onUpdatePhlebotomists,
  onUpdateBookings,
  showToast
}) => {
  const isBn = lang === 'bn';
  const currentStaff = getStoredCurrentStaff();
  const isSuperAdmin = !currentStaff;

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [labFilter, setLabFilter] = useState('All');
  const [phlebotomistFilter, setPhlebotomistFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');
  const [previewPrescriptionBooking, setPreviewPrescriptionBooking] = useState<BookingHistoryItem | null>(null);

  // Phlebotomist Roster State
  const [phlebotomists, setPhlebotomists] = useState<Phlebotomist[]>(() => {
    if (initialPhlebotomists && initialPhlebotomists.length > 0) return initialPhlebotomists;
    return getStoredPhlebotomists();
  });

  useEffect(() => {
    if (initialPhlebotomists && initialPhlebotomists.length > 0) {
      setPhlebotomists(initialPhlebotomists);
    }
  }, [initialPhlebotomists]);

  useEffect(() => {
    try {
      const unsub = subscribeToPhlebotomists((livePhlebs) => {
        if (livePhlebs && livePhlebs.length > 0) {
          setPhlebotomists(livePhlebs);
          saveStoredPhlebotomists(livePhlebs);
        }
      });
      return () => unsub();
    } catch {
      // Handled quietly
    }
  }, []);

  const handleUpdatePhlebotomistsList = (updated: Phlebotomist[]) => {
    setPhlebotomists(updated);
    saveStoredPhlebotomists(updated);
    if (onUpdatePhlebotomists) {
      onUpdatePhlebotomists(updated);
    }
    savePhlebotomistsToFirestore(updated).catch(() => {});
  };

  // Modals state
  const [isPhlebotomistRosterModalOpen, setIsPhlebotomistRosterModalOpen] = useState(false);
  const [isAddPhlebotomistModalOpen, setIsAddPhlebotomistModalOpen] = useState(false);
  const [editingPhlebotomist, setEditingPhlebotomist] = useState<Phlebotomist | null>(null);

  // Assignment Modal State
  const [assigningBooking, setAssigningBooking] = useState<BookingHistoryItem | null>(null);
  const [selectedPhlebotomistId, setSelectedPhlebotomistId] = useState<string>('');
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [autoConfirmOnAssign, setAutoConfirmOnAssign] = useState<boolean>(true);

  // Phlebotomist Form State
  const [phlebName, setPhlebName] = useState('');
  const [phlebPhone, setPhlebPhone] = useState('');
  const [phlebAltPhone, setPhlebAltPhone] = useState('');
  const [phlebEmail, setPhlebEmail] = useState('');
  const [phlebArea, setPhlebArea] = useState('');
  const [phlebVehicle, setPhlebVehicle] = useState<'bike' | 'bicycle' | 'public' | 'other'>('bike');
  const [phlebExperience, setPhlebExperience] = useState<number>(3);
  const [phlebCertifications, setPhlebCertifications] = useState('');
  const [phlebIsAvailable, setPhlebIsAvailable] = useState(true);
  const [phlebNotes, setPhlebNotes] = useState('');

  const t = TRANSLATIONS[lang];

  // Today's Scheduled Tests Metrics
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todayBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const bDate = b.date || (b.createdAt ? b.createdAt.slice(0, 10) : '');
      return bDate.startsWith(todayStr);
    });
  }, [bookings, todayStr]);

  const todayTestsCount = useMemo(() => {
    return todayBookings.reduce((sum, b) => sum + (b.testNames?.length || 1), 0);
  }, [todayBookings]);

  // Phlebotomist Statistics
  const activePhlebotomistsCount = useMemo(() => {
    return phlebotomists.filter(p => p.isAvailable).length;
  }, [phlebotomists]);

  const totalPhlebCollections = useMemo(() => {
    return phlebotomists.reduce((sum, p) => sum + (p.totalCollections || 0), 0);
  }, [phlebotomists]);

  const unassignedOrdersCount = useMemo(() => {
    return bookings.filter(b => b.status !== 'cancelled' && !b.assignedPhlebotomistId && !b.assignedPhlebotomistName).length;
  }, [bookings]);

  // Helper date boundaries
  const getPresetDateRange = (preset: typeof datePreset) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (preset === 'today') {
      return { start: todayStr, end: todayStr };
    } else if (preset === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      return { start: yStr, end: yStr };
    } else if (preset === 'week') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      return { start: sevenDaysAgo.toISOString().slice(0, 10), end: todayStr };
    } else if (preset === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return { start: thirtyDaysAgo.toISOString().slice(0, 10), end: todayStr };
    }
    return { start: '', end: '' };
  };

  const handleDatePresetChange = (preset: typeof datePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom' && preset !== 'all') {
      const range = getPresetDateRange(preset);
      setStartDate(range.start);
      setEndDate(range.end);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setLabFilter('All');
    setPhlebotomistFilter('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  // Filtering
  const filtered = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      b.id.toLowerCase().includes(term) ||
      (b.customerName && b.customerName.toLowerCase().includes(term)) ||
      (b.customerPhone && b.customerPhone.includes(term)) ||
      (b.customerAddress && b.customerAddress.toLowerCase().includes(term)) ||
      b.labName.toLowerCase().includes(term) ||
      b.testNames.some(t => t.toLowerCase().includes(term)) ||
      (b.assignedPhlebotomistName && b.assignedPhlebotomistName.toLowerCase().includes(term));

    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchLab = labFilter === 'All' || b.labId === labFilter || b.labName === labFilter;

    // Phlebotomist Filter
    const matchPhleb = phlebotomistFilter === 'all'
      ? true
      : phlebotomistFilter === 'unassigned'
      ? (!b.assignedPhlebotomistId && !b.assignedPhlebotomistName)
      : (b.assignedPhlebotomistId === phlebotomistFilter || b.assignedPhlebotomistName?.toLowerCase() === phlebotomistFilter.toLowerCase());

    // Date Filtering
    const bookingDate = b.createdAt ? b.createdAt.slice(0, 10) : b.date;
    let matchDate = true;
    if (startDate && bookingDate) {
      matchDate = matchDate && (bookingDate >= startDate);
    }
    if (endDate && bookingDate) {
      matchDate = matchDate && (bookingDate <= endDate);
    }

    return matchSearch && matchStatus && matchLab && matchPhleb && matchDate;
  });

  // Total filtered revenue
  const filteredRevenue = filtered.reduce((sum, b) => b.status !== 'cancelled' ? sum + (b.totalCost || 0) : sum, 0);

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return (b.createdAt || b.date) > (a.createdAt || a.date) ? 1 : -1;
    if (sortBy === 'oldest') return (a.createdAt || a.date) > (b.createdAt || b.date) ? 1 : -1;
    if (sortBy === 'amount_high') return b.totalCost - a.totalCost;
    if (sortBy === 'amount_low') return a.totalCost - b.totalCost;
    return 0;
  });

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Time', 'Customer Name', 'Phone', 'Address', 'Diagnostic Center', 'Tests Booked', 'Assigned Phlebotomist', 'Status', 'Total Bill (BDT)'];
    const rows = sorted.map(b => [
      formatOrderId(b.id),
      b.date,
      b.time,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.customerPhone || ''}"`,
      `"${(b.customerAddress || '').replace(/"/g, '""')}"`,
      `"${b.labName.replace(/"/g, '""')}"`,
      `"${b.testNames.join('; ').replace(/"/g, '""')}"`,
      `"${(b.assignedPhlebotomistName || 'Unassigned').replace(/"/g, '""')}"`,
      b.status,
      b.totalCost
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `labhome_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // WhatsApp Dispatch Helper
  const handleSendWhatsAppDispatch = (booking: BookingHistoryItem, customPhleb?: Phlebotomist, customNotes?: string) => {
    const phleb = customPhleb || phlebotomists.find(p => p.id === booking.assignedPhlebotomistId || p.phone === booking.assignedPhlebotomistPhone) || {
      id: booking.assignedPhlebotomistId || 'PHLEB',
      name: booking.assignedPhlebotomistName || 'Phlebotomist',
      phone: booking.assignedPhlebotomistPhone || '01822334455',
      assignedArea: 'Dhaka',
      isAvailable: true
    };
    const message = generatePhlebotomistDispatchWhatsAppText(booking, phleb, customNotes || booking.notes);
    const url = getWhatsAppUrl(phleb.phone, message);
    window.open(url, '_blank');
    if (showToast) {
      showToast(isBn ? `${phleb.name} এর হোয়াটসঅ্যাপে ডিসপ্যাচ প্রস্তুত করা হয়েছে!` : `WhatsApp dispatch opened for ${phleb.name}!`);
    }
  };

  // Open Assignment Modal
  const handleOpenAssignModal = (booking: BookingHistoryItem) => {
    setAssigningBooking(booking);
    // Find pre-assigned or best area match
    if (booking.assignedPhlebotomistId) {
      setSelectedPhlebotomistId(booking.assignedPhlebotomistId);
    } else {
      const match = phlebotomists.find(p => p.isAvailable && isAreaMatching(p.assignedArea, booking.customerAddress));
      setSelectedPhlebotomistId(match ? match.id : (phlebotomists[0]?.id || ''));
    }
    setAssignNotes(booking.notes || '');
    setAutoConfirmOnAssign(booking.status === 'pending');
  };

  // Confirm Phlebotomist Assignment
  const handleConfirmAssignment = (sendWhatsApp: boolean = false) => {
    if (!assigningBooking || !selectedPhlebotomistId) {
      if (showToast) showToast(isBn ? 'অনুগ্রহ করে একজন ফ্লেবোটোমিস্ট সিলেক্ট করুন!' : 'Please select a phlebotomist!');
      return;
    }

    const phleb = phlebotomists.find(p => p.id === selectedPhlebotomistId);
    if (!phleb) return;

    const newStatus: BookingStatus = (autoConfirmOnAssign && assigningBooking.status === 'pending') 
      ? 'confirmed' 
      : assigningBooking.status;

    const updatedBooking: BookingHistoryItem = {
      ...assigningBooking,
      assignedPhlebotomistId: phleb.id,
      assignedPhlebotomistName: phleb.name,
      assignedPhlebotomistPhone: phleb.phone,
      assignedPhlebotomistAt: new Date().toISOString(),
      status: newStatus,
      notes: assignNotes.trim() ? assignNotes.trim() : assigningBooking.notes
    };

    // Update in parent bookings list
    const updatedBookings = bookings.map(b => b.id === assigningBooking.id ? updatedBooking : b);
    if (onUpdateBookings) {
      onUpdateBookings(updatedBookings);
    }
    saveBookingToFirestore(updatedBooking).catch(() => {});

    // Increment phlebotomist collections counter
    const updatedPhlebs = phlebotomists.map(p => p.id === phleb.id ? { ...p, totalCollections: (p.totalCollections || 0) + 1 } : p);
    handleUpdatePhlebotomistsList(updatedPhlebs);

    if (sendWhatsApp) {
      handleSendWhatsAppDispatch(updatedBooking, phleb, assignNotes.trim());
    }

    if (showToast) {
      showToast(isBn 
        ? `${phleb.name} কে সফলভাবে অর্ডারে (#${formatOrderId(assigningBooking.id)}) অ্যাসাইন করা হয়েছে!` 
        : `${phleb.name} assigned to Order #${formatOrderId(assigningBooking.id)}!`);
    }

    setAssigningBooking(null);
    setSelectedPhlebotomistId('');
    setAssignNotes('');
  };

  // Helper: Area matching score
  const isAreaMatching = (phlebArea?: string, customerAddr?: string): boolean => {
    if (!phlebArea || !customerAddr) return false;
    const addr = customerAddr.toLowerCase();
    const tokens = phlebArea.toLowerCase().split(/[,|/.\s]+/).filter(t => t.length > 2);
    return tokens.some(token => addr.includes(token));
  };

  // Add / Edit Phlebotomist Modal Handlers
  const handleOpenAddPhlebModal = () => {
    setEditingPhlebotomist(null);
    setPhlebName('');
    setPhlebPhone('01700-000000');
    setPhlebAltPhone('');
    setPhlebEmail('');
    setPhlebArea('ধানমন্ডি, মোহাম্মদপুর');
    setPhlebVehicle('bike');
    setPhlebExperience(3);
    setPhlebCertifications('Certified Phlebotomist, Medical Technologist (Lab)');
    setPhlebIsAvailable(true);
    setPhlebNotes('');
    setIsAddPhlebotomistModalOpen(true);
  };

  const handleOpenEditPhlebModal = (phleb: Phlebotomist) => {
    setEditingPhlebotomist(phleb);
    setPhlebName(phleb.name);
    setPhlebPhone(phleb.phone);
    setPhlebAltPhone(phleb.altPhone || '');
    setPhlebEmail(phleb.email || '');
    setPhlebArea(phleb.assignedArea);
    setPhlebVehicle(phleb.vehicleType || 'bike');
    setPhlebExperience(phleb.experienceYears || 3);
    setPhlebCertifications(phleb.certifications || '');
    setPhlebIsAvailable(phleb.isAvailable !== false);
    setPhlebNotes(phleb.notes || '');
    setIsAddPhlebotomistModalOpen(true);
  };

  const handleSavePhlebotomist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phlebName.trim() || !phlebPhone.trim() || !phlebArea.trim()) {
      if (showToast) showToast(isBn ? 'অনুগ্রহ করে নাম, ফোন নম্বর ও নির্ধারিত এলাকা পূরণ করুন!' : 'Please fill name, phone, and assigned area!');
      return;
    }

    const cleanPhone = phlebPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      if (showToast) showToast(isBn ? 'ফোন নম্বরটি অন্তত ১১ ডিজিট হতে হবে!' : 'Phone number must be at least 11 digits!');
      return;
    }

    if (editingPhlebotomist) {
      const updatedList = phlebotomists.map(p => p.id === editingPhlebotomist.id ? {
        ...p,
        name: phlebName.trim(),
        phone: phlebPhone.trim(),
        altPhone: phlebAltPhone.trim() || undefined,
        email: phlebEmail.trim() || undefined,
        assignedArea: phlebArea.trim(),
        vehicleType: phlebVehicle,
        experienceYears: Number(phlebExperience) || 1,
        certifications: phlebCertifications.trim() || undefined,
        isAvailable: phlebIsAvailable,
        notes: phlebNotes.trim() || undefined,
        updatedAt: new Date().toISOString()
      } : p);
      handleUpdatePhlebotomistsList(updatedList);
      if (showToast) showToast(isBn ? `ফ্লেবোটোমিস্ট "${phlebName}" আপডেট করা হয়েছে!` : `Phlebotomist "${phlebName}" updated!`);
    } else {
      const newId = `PHLEB-${Math.floor(200 + Math.random() * 800)}`;
      const newPhleb: Phlebotomist = {
        id: newId,
        name: phlebName.trim(),
        phone: phlebPhone.trim(),
        altPhone: phlebAltPhone.trim() || undefined,
        email: phlebEmail.trim() || undefined,
        assignedArea: phlebArea.trim(),
        vehicleType: phlebVehicle,
        experienceYears: Number(phlebExperience) || 1,
        certifications: phlebCertifications.trim() || undefined,
        isAvailable: phlebIsAvailable,
        totalCollections: 0,
        rating: 4.9,
        notes: phlebNotes.trim() || undefined,
        createdAt: new Date().toISOString()
      };
      handleUpdatePhlebotomistsList([newPhleb, ...phlebotomists]);
      if (showToast) showToast(isBn ? `নতুন ফ্লেবোটোমিস্ট (${newId}) যোগ করা হয়েছে!` : `New phlebotomist (${newId}) added!`);
    }

    setIsAddPhlebotomistModalOpen(false);
  };

  const handleTogglePhlebAvailability = (phlebId: string) => {
    const updated = phlebotomists.map(p => p.id === phlebId ? { ...p, isAvailable: !p.isAvailable } : p);
    handleUpdatePhlebotomistsList(updated);
    if (showToast) showToast(isBn ? 'ডিউটি স্ট্যাটাস পরিবর্তিত হয়েছে!' : 'Phlebotomist duty status toggled!');
  };

  const handleDeletePhlebotomist = (phlebId: string, name: string) => {
    if (window.confirm(isBn ? `আপনি কি নিশ্চিত যে ফ্লেবোটোমিস্ট "${name}" কে মুছে ফেলতে চান?` : `Are you sure you want to delete phlebotomist "${name}"?`)) {
      const updated = phlebotomists.filter(p => p.id !== phlebId);
      handleUpdatePhlebotomistsList(updated);
      if (showToast) showToast(isBn ? 'ফ্লেবোটোমিস্ট ডিলিট করা হয়েছে!' : 'Phlebotomist removed!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Area Indicator Banner */}
      {!isSuperAdmin && currentStaff?.assignedArea && currentStaff.assignedArea !== 'All Areas' && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-sky-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
              📍
            </div>
            <div>
              <span className="font-bold block text-primary">
                {isBn ? `নির্ধারিত এরিয়া: ${currentStaff.assignedArea}` : `Assigned Area: ${currentStaff.assignedArea}`}
              </span>
              <span className="text-[11px] text-slate-600">
                {isBn 
                  ? `আপনি শুধুমাত্র "${currentStaff.assignedArea}" এলাকার গ্রাহকদের স্যাম্পল কালেকশন ও ডেলিভারি অর্ডার দেখতে পাচ্ছেন।` 
                  : `You are viewing orders exclusively within "${currentStaff.assignedArea}" area.`}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white border border-sky-200 text-primary font-black rounded-lg text-xs shrink-0">
            {filtered.length} {isBn ? 'টি অর্ডার' : 'Orders'}
          </span>
        </div>
      )}

      {/* Today's Scheduled Tests Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-emerald-800/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <FlaskConical size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-white">
                {isBn ? 'আজকে কতগুলো টেস্ট করতে হবে:' : 'Tests Scheduled for Today:'}
              </h2>
              <span className="text-[11px] bg-emerald-400 text-emerald-950 font-black px-2.5 py-0.5 rounded-full uppercase shadow-2xs">
                {todayTestsCount} {isBn ? 'টি টেস্ট' : 'Tests'}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              {isBn 
                ? `আজকের দিনে মোট ${todayBookings.length} টি বুকিং এর বিপরীতে সর্বমোট ${todayTestsCount} টি প্যাথলজি/ডায়াগনস্টিক টেস্ট সম্পন্ন করতে হবে।` 
                : `${todayTestsCount} individual tests to be performed across ${todayBookings.length} orders today.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleDatePresetChange('today')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              datePreset === 'today'
                ? 'bg-emerald-400 text-emerald-950 ring-2 ring-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <CalendarDays size={15} />
            <span>{isBn ? 'আজকের টেস্ট বুকিংসমূহ ফিল্টার করুন' : "Filter Today's Test Bookings"}</span>
          </button>
        </div>
      </div>

      {/* Phlebotomist Operations & Quick Dispatch Summary Bar */}
      <div className="bg-gradient-to-r from-rose-950/90 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-rose-900/40 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <Syringe size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-extrabold text-base text-white">
                {isBn ? 'হোম স্যাম্পল কালেকশন ও ফ্লেবোটোমিস্ট টিম' : 'Home Phlebotomy & Sample Dispatch Team'}
              </h2>
              <span className="text-[10px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                {phlebotomists.length} {isBn ? 'জন টিম মেম্বার' : 'Roster'}
              </span>
            </div>
            <p className="text-xs text-rose-200/80 mt-0.5">
              {isBn 
                ? 'বুকিং আসা মাত্রই সরাসরি ফ্লেবোটোমিস্ট অ্যাসাইন করুন এবং এক ক্লিকে রোগীর ঠিকানা সহ বিস্তারিত হোয়াটসঅ্যাপে পাঠিয়ে দিন।' 
                : 'Directly assign trained phlebotomists to home orders and dispatch full patient details via 1-click WhatsApp.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPhlebotomistRosterModalOpen(true)}
            className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Users size={15} />
            <span>{isBn ? 'ফ্লেবোটোমিস্ট তালিকা ও ম্যানেজমেন্ট' : 'Phlebotomists List & Roster'}</span>
          </button>

          <button
            onClick={handleOpenAddPhlebModal}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus size={15} />
            <span>{isBn ? 'নতুন ফ্লেবোটোমিস্ট যোগ' : '+ Add Phlebotomist'}</span>
          </button>
        </div>
      </div>

      {/* Phlebotomy Metrics Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setPhlebotomistFilter('all')}
          className={`p-3.5 bg-white rounded-xl border transition-all cursor-pointer shadow-2xs ${
            phlebotomistFilter === 'all' ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">{isBn ? 'মোট ফ্লেবোটোমিস্ট' : 'Total Phlebotomists'}</span>
            <Users size={14} className="text-primary" />
          </div>
          <div className="text-lg font-black text-slate-900">{phlebotomists.length} {isBn ? 'জন' : ''}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">{activePhlebotomistsCount} {isBn ? 'জন অন-ডিউটি' : 'On-Duty'}</p>
        </div>

        <div 
          onClick={() => setPhlebotomistFilter('unassigned')}
          className={`p-3.5 bg-white rounded-xl border transition-all cursor-pointer shadow-2xs ${
            phlebotomistFilter === 'unassigned' ? 'border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/30' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold text-amber-700">{isBn ? 'অ্যাসাইন বাকি' : 'Unassigned Orders'}</span>
            <AlertCircle size={14} className="text-amber-500" />
          </div>
          <div className="text-lg font-black text-amber-600">{unassignedOrdersCount} {isBn ? 'টি' : ''}</div>
          <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{isBn ? 'ক্লিক করে ফিল্টার করুন' : 'Click to filter'}</p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">{isBn ? 'মোট সংগৃহীত স্যাম্পল' : 'Total Samples Drawn'}</span>
            <Syringe size={14} className="text-rose-500" />
          </div>
          <div className="text-lg font-black text-rose-600">{totalPhlebCollections}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">{isBn ? 'টিম কালেকশন রেকর্ড' : 'Lifetime collections'}</p>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">{isBn ? 'অ্যাক্টিভ সার্ভিস এরিয়া' : 'Coverage Areas'}</span>
            <MapPin size={14} className="text-teal-600" />
          </div>
          <div className="text-sm font-bold text-slate-800 truncate" title="ঢাকা মহানগরীর সকল প্রধান জোন">
            {isBn ? 'ঢাকা মহানগর' : 'Dhaka Metro'}
          </div>
          <p className="text-[10px] text-teal-600 font-semibold mt-0.5">৮+ টি জোন কাভারেজ</p>
        </div>
      </div>

      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{t.adminTotalOrders}</h1>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {bookings.length}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            {isBn ? 'কাস্টমার টেস্ট বুকিং পর্যবেক্ষণ, স্ট্যাটাস পরিবর্তন, ফ্লেবোটোমিস্ট অ্যাসাইন ও রিসিপ্ট প্রিন্ট।' : 'Manage customer test appointments, assign phlebotomists, update status, and print receipts.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Button onClick={onOpenAddOrder} className="!py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={15} /> {t.adminAddNewOrder}
          </Button>

          <button 
            onClick={() => printOrdersListReport({
              orders: sorted,
              filterLabel: datePreset,
              startDate,
              endDate,
              statusFilter,
              labFilter,
              totalRevenue: filteredRevenue,
              lang
            })}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title={isBn ? 'ফিল্টারকৃত অর্ডার তালিকা প্রিন্ট বা PDF রিপোর্ট ডাউনলোড করুন' : 'Print or Download filtered orders PDF report'}
          >
            <Printer size={14} />
            <span>{isBn ? 'রিপোর্ট প্রিন্ট / PDF' : 'Print / PDF Report'}</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
            title="Export orders as CSV"
          >
            <Download size={14} /> {t.adminExportCsv}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by ID, Name, Phone, Area..." 
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none w-full bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Phlebotomist filter */}
        <div>
          <select 
            value={phlebotomistFilter} 
            onChange={(e) => setPhlebotomistFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 outline-none cursor-pointer"
          >
            <option value="all">{isBn ? 'সকল ফ্লেবোটোমিস্ট (All)' : 'All Phlebotomists'}</option>
            <option value="unassigned" className="text-amber-700 font-bold">
              {isBn ? `⚠️ অ্যাসাইন বাকি (${unassignedOrdersCount}টি)` : `⚠️ Unassigned (${unassignedOrdersCount})`}
            </option>
            {phlebotomists.map(p => (
              <option key={p.id} value={p.id}>
                🩸 {p.name} ({p.assignedArea.slice(0, 15)}...)
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none cursor-pointer"
          >
            <option value="All">All Statuses ({bookings.length})</option>
            <option value="pending">⏳ Pending ({bookings.filter(b => b.status === 'pending').length})</option>
            <option value="confirmed">✓ Confirmed ({bookings.filter(b => b.status === 'confirmed').length})</option>
            <option value="collected">🩸 Sample Collected ({bookings.filter(b => b.status === 'collected').length})</option>
            <option value="processing">🔬 Lab Processing ({bookings.filter(b => b.status === 'processing').length})</option>
            <option value="completed">🎉 Completed ({bookings.filter(b => b.status === 'completed').length})</option>
            <option value="cancelled">✕ Cancelled ({bookings.filter(b => b.status === 'cancelled').length})</option>
          </select>
        </div>

        {/* Center filter */}
        <div>
          <select 
            value={labFilter} 
            onChange={(e) => setLabFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none cursor-pointer"
          >
            <option value="All">All Diagnostic Centers</option>
            {labs.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Sort by */}
        <div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none cursor-pointer"
          >
            <option value="newest">📅 Newest Bookings First</option>
            <option value="oldest">📅 Oldest Bookings First</option>
            <option value="amount_high">৳ Bill: High to Low</option>
            <option value="amount_low">৳ Bill: Low to High</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range & Quick Presets Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Quick Preset Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
              <Calendar size={13} /> {isBn ? 'তারিখ ফিল্টার:' : 'Date Filter:'}
            </span>
            {[
              { id: 'all', label: isBn ? 'সকল সময়' : 'All Time' },
              { id: 'today', label: isBn ? 'আজকে' : 'Today' },
              { id: 'yesterday', label: isBn ? 'গতকাল' : 'Yesterday' },
              { id: 'week', label: isBn ? 'গত ৭ দিন' : 'Last 7 Days' },
              { id: 'month', label: isBn ? 'গত ৩০ দিন' : 'Last 30 Days' },
              { id: 'custom', label: isBn ? 'কাস্টম তারিখ' : 'Custom Range' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleDatePresetChange(preset.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  datePreset === preset.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Reset Filters Button */}
          {(searchTerm || statusFilter !== 'All' || labFilter !== 'All' || phlebotomistFilter !== 'all' || datePreset !== 'all' || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
            >
              <RotateCcw size={13} />
              <span>{isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}</span>
            </button>
          )}
        </div>

        {/* Custom Start / End Date pickers */}
        {datePreset === 'custom' && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">{isBn ? 'শুরু:' : 'From:'}</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">{isBn ? 'শেষ:' : 'To:'}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        )}

        {/* Filter Results Summary Banner */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold">
              {isBn ? 'ফিল্টারকৃত অর্ডার:' : 'Filtered Orders:'} <strong className="text-slate-900 font-bold">{sorted.length}</strong> {isBn ? 'টি' : 'orders'}
            </span>
            <span>•</span>
            <span className="font-semibold text-emerald-700">
              {isBn ? 'মোট বিল:' : 'Total Amount:'} <strong>৳ {filteredRevenue.toLocaleString()}</strong>
            </span>
            {phlebotomistFilter !== 'all' && (
              <span className="bg-rose-50 text-rose-800 px-2.5 py-0.5 rounded-lg font-bold border border-rose-100 text-[11px]">
                🩸 {phlebotomistFilter === 'unassigned' ? (isBn ? 'অ্যাসাইন বাকি' : 'Unassigned') : phlebotomists.find(p => p.id === phlebotomistFilter)?.name || phlebotomistFilter}
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400">
            {isBn ? 'সর্বমোট রেকর্ড:' : 'Total Records:'} {bookings.length}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-2.5 py-3 text-center w-10 text-slate-500 font-bold">{isBn ? 'নং' : 'SL'}</th>
                <th className="px-2.5 py-3 w-28 whitespace-nowrap">Order ID</th>
                <th className="px-2.5 py-3 w-24 whitespace-nowrap">Date & Slot</th>
                <th className="px-3 py-3 min-w-[130px]">Customer Details</th>
                <th className="px-3 py-3 min-w-[140px]">Diagnostic Center & Tests</th>
                <th className="px-3 py-3 min-w-[170px] whitespace-nowrap bg-rose-50/50 text-rose-900 border-x border-rose-100/60">
                  {isBn ? '🩸 ফ্লেবোটোমিস্ট ও ডিসপ্যাচ' : '🩸 Phlebotomist & Dispatch'}
                </th>
                <th className="px-2.5 py-3 w-32 whitespace-nowrap">Status</th>
                <th className="px-2.5 py-3 text-right w-20 whitespace-nowrap">Bill</th>
                <th className="px-2.5 py-3 text-center w-20 whitespace-nowrap">{lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}</th>
                <th className="px-2 py-3 text-center w-20 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-slate-400 text-xs">
                    {isBn ? 'কোনো অর্ডার পাওয়া যায়নি।' : 'No orders matching your filters.'}
                  </td>
                </tr>
              ) : (
                sorted.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-2.5 py-3 text-center font-extrabold text-slate-400 text-xs">
                      {index + 1}
                    </td>
                    <td className="px-2.5 py-3 font-bold text-slate-900 whitespace-nowrap font-mono text-xs">
                      {formatOrderId(booking.id)}
                    </td>
                    <td className="px-2.5 py-3 text-slate-700 whitespace-nowrap">
                      <span className="font-semibold block text-slate-800 text-xs">{booking.date}</span>
                      <span className="text-slate-400 text-[11px]">{booking.time}</span>
                    </td>
                    <td className="px-3 py-3 max-w-[160px]">
                      <p className="font-semibold text-slate-900 text-xs truncate" title={booking.customerName || 'Anonymous'}>
                        {booking.customerName || 'Anonymous'}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <Phone size={10} className="shrink-0" /> {booking.customerPhone}
                      </p>
                      {booking.customerAddress && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5" title={booking.customerAddress}>
                          <MapPin size={9} className="inline mr-0.5 shrink-0" />{booking.customerAddress}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 max-w-[170px]">
                      <p className="font-bold text-xs text-sky-700 truncate" title={booking.labName}>
                        {booking.labName}
                      </p>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5" title={booking.testNames.join(', ')}>
                        {booking.testNames.join(', ')}
                      </p>
                      {booking.prescriptionUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewPrescriptionBooking(booking)}
                          className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold cursor-pointer transition-colors"
                          title="View uploaded prescription"
                        >
                          <FileText size={11} className="text-amber-600" />
                          <span>{isBn ? 'প্রেসক্রিপশন ফাইল' : 'Prescription File'}</span>
                        </button>
                      )}
                    </td>

                    {/* Phlebotomist Column */}
                    <td className="px-3 py-3 max-w-[190px] bg-rose-50/20 border-x border-rose-100/40">
                      {booking.assignedPhlebotomistName ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                              🩸
                            </span>
                            <span className="font-bold text-slate-900 text-xs truncate" title={booking.assignedPhlebotomistName}>
                              {booking.assignedPhlebotomistName}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone size={10} className="text-slate-400" />
                            <span>{booking.assignedPhlebotomistPhone || 'No Phone'}</span>
                          </p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppDispatch(booking)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                              title="Send full assignment details to Phlebotomist via WhatsApp"
                            >
                              <span>🟢 WhatsApp</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(booking)}
                              className="text-[10px] text-slate-500 hover:text-slate-900 underline font-semibold cursor-pointer"
                              title="Change / Reassign Phlebotomist"
                            >
                              {isBn ? 'পরিবর্তন' : 'Reassign'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(booking)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[11px] font-bold shadow-2xs transition-all cursor-pointer hover:border-rose-300"
                          title="Assign a Phlebotomist for Home Sample Collection"
                        >
                          <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">+</span>
                          <span>{isBn ? 'ফ্লেবোটোমিস্ট অ্যাসাইন' : 'Assign Phleb'}</span>
                        </button>
                      )}
                    </td>

                    <td className="px-2.5 py-3 whitespace-nowrap">
                      <select 
                        value={booking.status} 
                        onChange={(e) => onUpdateStatus(booking.id, e.target.value as BookingStatus)}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white shadow-2xs focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer w-full max-w-[125px]"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="confirmed">✓ Confirmed</option>
                        <option value="collected">🩸 Sample Collected</option>
                        <option value="processing">🔬 Processing</option>
                        <option value="completed">🎉 Completed</option>
                        <option value="cancelled">✕ Cancelled</option>
                      </select>
                    </td>
                    <td className="px-2.5 py-3 text-right whitespace-nowrap text-xs">
                      <div className="font-black text-slate-900">৳ {booking.totalCost}</div>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${
                        booking.paymentMethod === 'bkash'
                          ? 'bg-pink-100 text-pink-700'
                          : booking.paymentMethod === 'nagad'
                          ? 'bg-orange-100 text-orange-700'
                          : booking.paymentMethod === 'rocket'
                          ? 'bg-purple-100 text-purple-700'
                          : booking.paymentMethod === 'card'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {booking.paymentMethod === 'bkash'
                          ? (booking.transactionId ? `bKash • ${booking.transactionId.slice(-4)}` : 'bKash')
                          : booking.paymentMethod === 'nagad'
                          ? (booking.transactionId ? `Nagad • ${booking.transactionId.slice(-4)}` : 'Nagad')
                          : booking.paymentMethod === 'rocket'
                          ? (booking.transactionId ? `Rocket • ${booking.transactionId.slice(-4)}` : 'Rocket')
                          : booking.paymentMethod === 'card'
                          ? 'Card Paid'
                          : (isBn ? 'ক্যাশ অন ডেলিভারি' : 'COD')}
                      </span>
                    </td>
                    <td className="px-2.5 py-3 text-center whitespace-nowrap">
                      <button 
                        onClick={() => printOrDownloadInvoice(booking, lang)}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-primary text-primary hover:text-white rounded-lg text-[11px] font-bold transition-all border border-sky-200 hover:border-primary shadow-2xs cursor-pointer" 
                        title="Download or Print Official PDF Invoice"
                      >
                        <Printer size={12} />
                        <span>{lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}</span>
                      </button>
                    </td>
                    <td className="px-2 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">
                        <button 
                          onClick={() => onSelectOrder(booking)}
                          className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors cursor-pointer" 
                          title="View order details"
                        >
                          <Eye size={15} />
                        </button>
                        
                        {/* Only Super Admin can edit or delete */}
                        {isSuperAdmin && (
                          <>
                            <button 
                              onClick={() => onOpenEditOrder(booking)}
                              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer" 
                              title="Edit order"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => onOpenDeleteOrder(booking)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer" 
                              title="Delete order"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DEDICATED PHLEBOTOMIST ASSIGNMENT MODAL                */}
      {/* ========================================================= */}
      {assigningBooking && (
        <div 
          onClick={() => setAssigningBooking(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-rose-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Syringe size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">
                    {isBn ? 'অর্ডারে ফ্লেবোটোমিস্ট অ্যাসাইন ও হোয়াটসঅ্যাপ ডিসপ্যাচ' : 'Assign Phlebotomist & WhatsApp Dispatch'}
                  </h3>
                  <p className="text-[11px] text-rose-200/80 mt-0.5">
                    Order ID: #{formatOrderId(assigningBooking.id)} • {assigningBooking.customerName || 'Patient'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
              {/* Order Quick Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[9px] block">Patient Details</span>
                  <span className="font-bold text-slate-800">{assigningBooking.customerName || 'Patient'}</span>
                  <span className="text-slate-500 block">{assigningBooking.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[9px] block">Date & Time Slot</span>
                  <span className="font-bold text-slate-800">{assigningBooking.date}</span>
                  <span className="text-slate-500 block">{assigningBooking.time}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 uppercase font-bold text-[9px] block">Sample Collection Address</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <MapPin size={11} className="text-rose-500 shrink-0" />
                    <span>{assigningBooking.customerAddress || 'Dhaka, Bangladesh'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[9px] block">Diagnostic Partner</span>
                  <span className="font-bold text-sky-700">{assigningBooking.labName}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[9px] block">Tests & Bill</span>
                  <span className="font-bold text-slate-800">{assigningBooking.testNames.length} tests • ৳{assigningBooking.totalCost}</span>
                </div>
              </div>

              {/* Phlebotomists Selection List */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>{isBn ? 'ফ্লেবোটোমিস্ট নির্বাচন করুন:' : 'Select Phlebotomist:'}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {phlebotomists.length} {isBn ? 'জন রেজিস্টার্ড' : 'registered'}
                  </span>
                </label>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {phlebotomists.map((phleb) => {
                    const isSelected = selectedPhlebotomistId === phleb.id;
                    const isMatched = isAreaMatching(phleb.assignedArea, assigningBooking.customerAddress);

                    return (
                      <div
                        key={phleb.id}
                        onClick={() => setSelectedPhlebotomistId(phleb.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected 
                            ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-400/20' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input 
                            type="radio" 
                            name="assign_phleb" 
                            checked={isSelected}
                            onChange={() => setSelectedPhlebotomistId(phleb.id)}
                            className="rounded-full text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {phleb.name}
                              </span>
                              {isMatched && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                                  📍 {isBn ? 'এরিয়া ম্যাচিং' : 'Area Match'}
                                </span>
                              )}
                              {!phleb.isAvailable && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-slate-100 text-slate-500 rounded-md">
                                  {isBn ? 'ছুটিতে' : 'Off-Duty'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>📞 {phleb.phone}</span>
                              <span>•</span>
                              <span>📍 {phleb.assignedArea.slice(0, 24)}...</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500 block">
                            {phleb.totalCollections || 0} {isBn ? 'টি কালেকশন' : 'done'}
                          </span>
                          <span className="text-[10px] font-bold text-amber-600">
                            ⭐ {phleb.rating || 4.9}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dispatch Custom Instructions / Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isBn ? 'ফ্লেবোটোমিস্টের জন্য বিশেষ নির্দেশনা (Optional WhatsApp Note):' : 'Special Collection Instructions (Optional):'}
                </label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder={isBn ? 'যেমন: সকালে ১২ ঘণ্টা খালি পেটে রক্তের স্যাম্পল নিতে হবে, রোগী বয়োবৃদ্ধ।' : 'e.g. 12 hours fasting required, elderly patient.'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
                />
              </div>

              {/* Status Update Checkbox */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer p-2 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  checked={autoConfirmOnAssign}
                  onChange={(e) => setAutoConfirmOnAssign(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span>
                  {isBn ? 'ফ্লেবোটোমিস্ট অ্যাসাইনের সাথে বুকিং স্ট্যাটাস "Confirmed" করুন' : 'Automatically update order status to "Confirmed" upon assignment'}
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setAssigningBooking(null)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmAssignment(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  {isBn ? '✓ শুধু অ্যাসাইন করুন' : 'Assign Only'}
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmAssignment(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send size={14} />
                  <span>{isBn ? 'অ্যাসাইন ও হোয়াটসঅ্যাপ ডিসপ্যাচ' : 'Assign & WhatsApp Dispatch'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PHLEBOTOMISTS ROSTER & TEAM MANAGEMENT MODAL           */}
      {/* ========================================================= */}
      {isPhlebotomistRosterModalOpen && (
        <div 
          onClick={() => setIsPhlebotomistRosterModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">
                    {isBn ? 'ফ্লেবোটোমিস্ট টিম ও রোস্টার তালিকা' : 'Phlebotomists Roster & Field Team'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {phlebotomists.length} {isBn ? 'জন রেজিস্টার্ড স্যাম্পল কালেকশন স্পেশালিস্ট' : 'registered sample collection specialists'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddPhlebModal}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{isBn ? 'নতুন ফ্লেবোটোমিস্ট যোগ' : 'Add Phlebotomist'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPhlebotomistRosterModalOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {phlebotomists.map((phleb) => (
                  <div 
                    key={phleb.id} 
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm">{phleb.name}</h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                            {phleb.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {phleb.certifications || 'Certified Clinical Phlebotomist'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTogglePhlebAvailability(phleb.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          phleb.isAvailable 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        {phleb.isAvailable ? '🟢 On-Duty' : '⚪ Off-Duty'}
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2.5 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">{isBn ? 'মোবাইল:' : 'Phone:'}</span>
                        <a href={`tel:${phleb.phone}`} className="font-mono font-bold text-slate-900 hover:text-primary">
                          📞 {phleb.phone}
                        </a>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-500 shrink-0">{isBn ? 'এরিয়া:' : 'Area:'}</span>
                        <span className="font-medium text-slate-800 text-right truncate" title={phleb.assignedArea}>
                          📍 {phleb.assignedArea}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">{isBn ? 'যানবাহন ও অভিজ্ঞতা:' : 'Vehicle & Exp:'}</span>
                        <span className="font-semibold text-slate-700 capitalize">
                          {phleb.vehicleType || 'bike'} • {phleb.experienceYears || 3} yrs
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">{isBn ? 'মোট স্যাম্পল কালেকশন:' : 'Collections:'}</span>
                        <span className="font-bold text-rose-600">{phleb.totalCollections || 0} টি</span>
                      </div>
                    </div>

                    {phleb.notes && (
                      <p className="text-[10px] text-slate-400 italic line-clamp-1">
                        Note: {phleb.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={getWhatsAppUrl(phleb.phone, isBn ? `হ্যালো ${phleb.name}, eClinic থেকে মেসেজ করছি।` : `Hello ${phleb.name}, contacting from eClinic.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                        >
                          <span>💬 WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${phleb.phone}`}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold transition-colors"
                        >
                          📞 Call
                        </a>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPhlebModal(phleb)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Phlebotomist details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePhlebotomist(phleb.id, phleb.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Phlebotomist"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ADD / EDIT PHLEBOTOMIST MODAL                          */}
      {/* ========================================================= */}
      {isAddPhlebotomistModalOpen && (
        <div 
          onClick={() => setIsAddPhlebotomistModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95"
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe size={18} className="text-rose-400" />
                <h3 className="font-bold text-sm">
                  {editingPhlebotomist 
                    ? (isBn ? 'ফ্লেবোটোমিস্ট তথ্য সম্পাদন করুন' : 'Edit Phlebotomist Profile') 
                    : (isBn ? 'নতুন ফ্লেবোটোমিস্ট যোগ করুন' : 'Add New Phlebotomist')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPhlebotomistModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePhlebotomist} className="p-5 space-y-3.5 overflow-y-auto max-h-[75vh] text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'নাম *' : 'Full Name *'}</label>
                  <input
                    type="text"
                    required
                    value={phlebName}
                    onChange={(e) => setPhlebName(e.target.value)}
                    placeholder="e.g. মোঃ তানভীর হাসান"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}</label>
                  <input
                    type="tel"
                    required
                    value={phlebPhone}
                    onChange={(e) => setPhlebPhone(e.target.value)}
                    placeholder="01711223344"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'বিকল্প মোবাইল (ঐচ্ছিক)' : 'Alt Phone (Optional)'}</label>
                  <input
                    type="tel"
                    value={phlebAltPhone}
                    onChange={(e) => setPhlebAltPhone(e.target.value)}
                    placeholder="018XXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</label>
                  <input
                    type="email"
                    value={phlebEmail}
                    onChange={(e) => setPhlebEmail(e.target.value)}
                    placeholder="phleb@eclinic.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Coverage Area with Clickable Chips */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isBn ? 'নির্ধারিত কভারেজ এরিয়া / অঞ্চল *' : 'Assigned Coverage Area *'}
                </label>
                <input
                  type="text"
                  required
                  value={phlebArea}
                  onChange={(e) => setPhlebArea(e.target.value)}
                  placeholder="ধানমন্ডি, মোহাম্মদপুর, লালমাটিয়া"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold mr-1">Quick Select:</span>
                  {['ধানমন্ডি', 'মিরপুর', 'উত্তরা', 'গুলশান', 'বনানী', 'মোহাম্মদপুর', 'মতিঝিল', 'বাড্ডা'].map(areaName => (
                    <button
                      type="button"
                      key={areaName}
                      onClick={() => {
                        if (!phlebArea.includes(areaName)) {
                          setPhlebArea(prev => prev ? `${prev}, ${areaName}` : areaName);
                        }
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-semibold cursor-pointer"
                    >
                      + {areaName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'যানবাহন' : 'Vehicle Type'}</label>
                  <select
                    value={phlebVehicle}
                    onChange={(e) => setPhlebVehicle(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
                  >
                    <option value="bike">🏍️ Motorcycle / Bike</option>
                    <option value="bicycle">🚲 Bicycle</option>
                    <option value="public">🚌 Public Transport</option>
                    <option value="other">🚶 Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{isBn ? 'অভিজ্ঞতা (বছর)' : 'Experience (Years)'}</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={phlebExperience}
                    onChange={(e) => setPhlebExperience(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ডিগ্রি / সার্টিফিকেশন' : 'Certifications'}</label>
                <input
                  type="text"
                  value={phlebCertifications}
                  onChange={(e) => setPhlebCertifications(e.target.value)}
                  placeholder="e.g. Diploma in Medical Technology (Lab)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{isBn ? 'নোট বা মন্তব্য' : 'Notes / Remarks'}</label>
                <textarea
                  rows={2}
                  value={phlebNotes}
                  onChange={(e) => setPhlebNotes(e.target.value)}
                  placeholder="e.g. পেডিয়াট্রিক ব্লাড ড্র এবং ভ্যাকুটেইনারে অভিজ্ঞ..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
                />
              </div>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={phlebIsAvailable}
                  onChange={(e) => setPhlebIsAvailable(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="font-bold text-slate-800">
                  {isBn ? 'স্যাম্পল কালেকশনের জন্য প্রস্তুত (অন-ডিউটি)' : 'Available for Home Sample Collections (On-Duty)'}
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPhlebotomistModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  {editingPhlebotomist ? (isBn ? 'আপডেট করুন' : 'Update') : (isBn ? 'যোগ করুন' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Prescription Viewer Modal */}
      {previewPrescriptionBooking && previewPrescriptionBooking.prescriptionUrl && (
        <div 
          onClick={() => setPreviewPrescriptionBooking(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95"
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <div>
                  <h3 className="font-bold text-sm leading-none">
                    {isBn ? 'গ্রাহকের আপলোডকৃত প্রেসক্রিপশন' : 'Customer Uploaded Prescription'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Order ID: {formatOrderId(previewPrescriptionBooking.id)} • {previewPrescriptionBooking.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPrescriptionBooking(null)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 overflow-auto max-h-[70vh] flex items-center justify-center bg-slate-950">
              {previewPrescriptionBooking.prescriptionUrl.startsWith('data:image/') || previewPrescriptionBooking.prescriptionUrl.startsWith('http') ? (
                <img 
                  src={previewPrescriptionBooking.prescriptionUrl} 
                  alt="Customer Prescription" 
                  className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg" 
                />
              ) : (
                <div className="text-center py-10 text-white space-y-3">
                  <FileText size={48} className="mx-auto text-primary" />
                  <p className="text-sm font-bold">
                    {previewPrescriptionBooking.prescriptionName || 'Prescription PDF Document'}
                  </p>
                  <a
                    href={previewPrescriptionBooking.prescriptionUrl}
                    download={previewPrescriptionBooking.prescriptionName || `Prescription-${previewPrescriptionBooking.id}.pdf`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-sky-600"
                  >
                    <Download size={14} />
                    <span>{isBn ? 'PDF ডাউনলোড করুন' : 'Download PDF'}</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="text-slate-600">
                <span className="font-bold text-slate-800">{previewPrescriptionBooking.customerName}</span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span>{previewPrescriptionBooking.customerPhone}</span>
              </div>

              <div className="flex items-center gap-2">
                <a 
                  href={previewPrescriptionBooking.prescriptionUrl} 
                  download={previewPrescriptionBooking.prescriptionName || `Prescription-${formatOrderId(previewPrescriptionBooking.id)}.png`}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-sky-600 transition-colors cursor-pointer flex items-center gap-1.5 text-xs shadow-xs"
                >
                  <Download size={14} />
                  <span>{isBn ? 'ডাউনলোড' : 'Download'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPrescriptionBooking(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {isBn ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
