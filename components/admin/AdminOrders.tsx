import React, { useState } from 'react';
import { BookingHistoryItem, LabPartner, Language, BookingStatus } from '../../types';
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
  X
} from 'lucide-react';
import { Button } from '../Button';
import { printOrDownloadInvoice } from '../../services/invoiceService';
import { printOrdersListReport } from '../../services/reportService';
import { formatOrderId } from '../BookingModal';
import { getStoredCurrentStaff, getStoredStaffUsers } from '../../services/dataStorage';

interface AdminOrdersProps {
  lang: Language;
  bookings: BookingHistoryItem[];
  labs: LabPartner[];
  onUpdateStatus: (orderId: string, status: BookingStatus) => void;
  onSelectOrder: (order: BookingHistoryItem) => void;
  onOpenEditOrder: (order: BookingHistoryItem) => void;
  onOpenAddOrder: () => void;
  onOpenDeleteOrder: (order: BookingHistoryItem) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  lang,
  bookings,
  labs,
  onUpdateStatus,
  onSelectOrder,
  onOpenEditOrder,
  onOpenAddOrder,
  onOpenDeleteOrder
}) => {
  const isBn = lang === 'bn';
  const currentStaff = getStoredCurrentStaff();
  const isSuperAdmin = !currentStaff;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [labFilter, setLabFilter] = useState('All');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');

  const t = TRANSLATIONS[lang];

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
      b.testNames.some(t => t.toLowerCase().includes(term));

    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchLab = labFilter === 'All' || b.labId === labFilter || b.labName === labFilter;

    // Date Filtering
    const bookingDate = b.createdAt ? b.createdAt.slice(0, 10) : b.date;
    let matchDate = true;
    if (startDate && bookingDate) {
      matchDate = matchDate && (bookingDate >= startDate);
    }
    if (endDate && bookingDate) {
      matchDate = matchDate && (bookingDate <= endDate);
    }

    return matchSearch && matchStatus && matchLab && matchDate;
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
    const headers = ['Order ID', 'Date', 'Time', 'Customer Name', 'Phone', 'Address', 'Diagnostic Center', 'Tests Booked', 'Status', 'Total Bill (BDT)'];
    const rows = sorted.map(b => [
      formatOrderId(b.id),
      b.date,
      b.time,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.customerPhone || ''}"`,
      `"${(b.customerAddress || '').replace(/"/g, '""')}"`,
      `"${b.labName.replace(/"/g, '""')}"`,
      `"${b.testNames.join('; ').replace(/"/g, '""')}"`,
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

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{t.adminTotalOrders}</h1>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {bookings.length}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">Manage customer test appointments, update status, and print receipts.</p>
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
              { id: 'month', label: isBn ? 'চলতি মাস' : 'This Month' },
              { id: 'custom', label: isBn ? 'কাস্টম তারিখ (Custom)' : 'Custom Range' },
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => handleDatePresetChange(preset.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  datePreset === preset.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs (always visible or highlighted on custom) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{isBn ? 'শুরু:' : 'From:'}</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{isBn ? 'শেষ:' : 'To:'}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>

            {(startDate || endDate || searchTerm || statusFilter !== 'All' || labFilter !== 'All') && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border border-rose-100 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw size={12} />
                <span>{isBn ? 'রিসেট' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

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
            {(startDate || endDate) && (
              <span className="bg-sky-50 text-sky-800 px-2.5 py-0.5 rounded-lg font-bold border border-sky-100 text-[11px]">
                📅 {startDate || 'Start'} ➔ {endDate || 'End'}
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
                <th className="px-3 py-3 min-w-[150px]">Diagnostic Center & Tests</th>
                <th className="px-2.5 py-3 w-32 whitespace-nowrap">Status</th>
                <th className="px-2.5 py-3 text-right w-20 whitespace-nowrap">Bill</th>
                <th className="px-2.5 py-3 text-center w-24 whitespace-nowrap">{lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}</th>
                <th className="px-2 py-3 text-center w-20 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                    No orders matching your filters.
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
                    <td className="px-3 py-3 max-w-[180px]">
                      <p className="font-bold text-xs text-sky-700 truncate" title={booking.labName}>
                        {booking.labName}
                      </p>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5" title={booking.testNames.join(', ')}>
                        {booking.testNames.join(', ')}
                      </p>
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
                    <td className="px-2.5 py-3 text-right font-black text-slate-900 whitespace-nowrap text-xs">
                      ৳ {booking.totalCost}
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
    </div>
  );
};
