import React, { useState, useMemo } from 'react';
import { BookingHistoryItem, LabPartner, Language } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  Syringe, 
  Calendar, 
  MapPin, 
  Phone, 
  FlaskConical, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Check, 
  Copy, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Building2,
  ListFilter
} from 'lucide-react';
import { printPhlebotomistDispatchReport, exportPhlebotomistDispatchCSV, PhlebotomistReportParams } from '../../services/reportService';

interface PhlebotomistReportProps {
  lang: Language;
  bookings: BookingHistoryItem[];
  labs: LabPartner[];
  onSelectOrder?: (order: BookingHistoryItem) => void;
  onUpdateOrderStatus?: (orderId: string, status: any) => void;
}

export const PhlebotomistReport: React.FC<PhlebotomistReportProps> = ({
  lang,
  bookings,
  labs,
  onSelectOrder,
  onUpdateOrderStatus
}) => {
  const isBn = lang === 'bn';
  const t = TRANSLATIONS[lang];

  // Active Date Filter
  const [dateTarget, setDateTarget] = useState<'today' | 'tomorrow' | 'both'>('both');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedLab, setSelectedLab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Date calculation strings
  const { todayStr, tomorrowStr, displayTodayFormatted, displayTomorrowFormatted } = useMemo(() => {
    const d1 = new Date();
    const y1 = d1.getFullYear();
    const m1 = String(d1.getMonth() + 1).padStart(2, '0');
    const day1 = String(d1.getDate()).padStart(2, '0');
    const todayStr = `${y1}-${m1}-${day1}`;

    const d2 = new Date();
    d2.setDate(d2.getDate() + 1);
    const y2 = d2.getFullYear();
    const m2 = String(d2.getMonth() + 1).padStart(2, '0');
    const day2 = String(d2.getDate()).padStart(2, '0');
    const tomorrowStr = `${y2}-${m2}-${day2}`;

    const displayTodayFormatted = d1.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    const displayTomorrowFormatted = d2.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    return { todayStr, tomorrowStr, displayTodayFormatted, displayTomorrowFormatted };
  }, [isBn]);

  // Helper date matching function
  const isMatchingDate = (booking: BookingHistoryItem, targetDateStr: string): boolean => {
    if (!booking) return false;
    if (booking.date) {
      if (booking.date.includes(targetDateStr)) return true;
      if (booking.date.slice(0, 10) === targetDateStr) return true;
    }
    if (booking.createdAt && booking.createdAt.slice(0, 10) === targetDateStr) {
      return true;
    }
    return false;
  };

  // Filter Today and Tomorrow Bookings (exclude cancelled)
  const todayBookings = useMemo(() => {
    return bookings.filter(b => b.status !== 'cancelled' && isMatchingDate(b, todayStr));
  }, [bookings, todayStr]);

  const tomorrowBookings = useMemo(() => {
    return bookings.filter(b => b.status !== 'cancelled' && isMatchingDate(b, tomorrowStr));
  }, [bookings, tomorrowStr]);

  // Combined Active Bookings based on Date Target & Dropdowns
  const filteredBookings = useMemo(() => {
    let list: Array<BookingHistoryItem & { dayType: 'today' | 'tomorrow'; dayDateStr: string }> = [];

    if (dateTarget === 'today' || dateTarget === 'both') {
      todayBookings.forEach(b => list.push({ ...b, dayType: 'today', dayDateStr: todayStr }));
    }
    if (dateTarget === 'tomorrow' || dateTarget === 'both') {
      tomorrowBookings.forEach(b => list.push({ ...b, dayType: 'tomorrow', dayDateStr: tomorrowStr }));
    }

    // Filter by Area
    if (selectedArea !== 'all') {
      list = list.filter(b => (b.area || '').toLowerCase().includes(selectedArea.toLowerCase()));
    }

    // Filter by Lab
    if (selectedLab !== 'all') {
      list = list.filter(b => b.labName === selectedLab || b.labId === selectedLab);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => 
        (b.customerName || '').toLowerCase().includes(q) ||
        (b.customerPhone || '').includes(q) ||
        (b.area || '').toLowerCase().includes(q) ||
        (b.customerAddress || '').toLowerCase().includes(q) ||
        (b.id || '').toLowerCase().includes(q) ||
        (b.testNames || []).some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [dateTarget, todayBookings, tomorrowBookings, selectedArea, selectedLab, searchQuery, todayStr, tomorrowStr]);

  // Unique Areas list for dropdown filter
  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => {
      if (b.area && b.area.trim()) set.add(b.area.trim());
    });
    return Array.from(set).sort();
  }, [bookings]);

  // Metrics for Today vs Tomorrow
  const metrics = useMemo(() => {
    const todayVisitCount = todayBookings.length;
    const todayTestCount = todayBookings.reduce((sum, b) => sum + (b.testNames ? b.testNames.length : 1), 0);
    const todayCodAmount = todayBookings.reduce((sum, b) => b.paymentStatus !== 'paid' ? sum + b.totalCost : sum, 0);

    const tomorrowVisitCount = tomorrowBookings.length;
    const tomorrowTestCount = tomorrowBookings.reduce((sum, b) => sum + (b.testNames ? b.testNames.length : 1), 0);
    const tomorrowCodAmount = tomorrowBookings.reduce((sum, b) => b.paymentStatus !== 'paid' ? sum + b.totalCost : sum, 0);

    // Itemized test frequency for active filter selection
    const testMap = new Map<string, number>();
    filteredBookings.forEach(b => {
      (b.testNames || []).forEach(tName => {
        testMap.set(tName, (testMap.get(tName) || 0) + 1);
      });
    });

    const testItemBreakdown = Array.from(testMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      todayVisitCount,
      todayTestCount,
      todayCodAmount,
      tomorrowVisitCount,
      tomorrowTestCount,
      tomorrowCodAmount,
      totalVisits: todayVisitCount + tomorrowVisitCount,
      totalTests: todayTestCount + tomorrowTestCount,
      testItemBreakdown
    };
  }, [todayBookings, tomorrowBookings, filteredBookings]);

  // Report Params for Print and Export
  const reportParams: PhlebotomistReportParams = {
    dateTarget,
    todayStr,
    tomorrowStr,
    todayBookings,
    tomorrowBookings,
    lang
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-md border border-emerald-800/80 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
              <Syringe size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isBn ? 'ফ্লেবোটমিস্ট স্যাম্পল কালেকশন ও ডেসপ্যাচ রিপোর্ট' : 'Phlebotomist Sample Collection Report'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-400/20 text-emerald-200 border border-emerald-400/40">
                  {isBn ? 'আজ ও আগামীকাল' : 'Today & Tomorrow'}
                </span>
              </div>
              <p className="text-emerald-100/80 text-xs mt-1">
                {isBn 
                  ? 'রোগীর বাসা থেকে ব্লাড/স্যাম্পল সংগ্রহের দৈনিক শিডিউল, এরিয়াভিত্তিক ভিজিট ও স্যাম্পল রান লিস্ট' 
                  : 'Daily schedule for home sample collection, area visits, and test item counts'}
              </p>
            </div>
          </div>
        </div>

        {/* Print & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => printPhlebotomistDispatchReport(reportParams)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Printer size={16} />
            <span>{isBn ? 'ফ্লেবোটমিস্ট ডিউটি শিট প্রিন্ট' : 'Print Duty Sheet'}</span>
          </button>

          <button
            onClick={() => exportPhlebotomistDispatchCSV(reportParams)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-200 font-bold rounded-xl text-xs flex items-center gap-2 transition-all border border-emerald-700/50 cursor-pointer"
          >
            <Download size={16} />
            <span>{isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Comparison (Today vs Tomorrow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Today's KPI */}
        <div className={`p-5 rounded-2xl border transition-all ${
          dateTarget === 'today' || dateTarget === 'both' 
            ? 'bg-emerald-900/90 border-emerald-600 text-white shadow-sm' 
            : 'bg-white border-slate-200 text-slate-800 opacity-80'
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              🗓️ {isBn ? 'আজকে (Today)' : 'Today'} • {displayTodayFormatted}
            </span>
            <span className="text-xs font-bold opacity-80">{todayStr}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? 'স্যাম্পল ভিজিট' : 'Sample Visits'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5">
                {metrics.todayVisitCount} <span className="text-xs font-normal opacity-80">{isBn ? 'টি রোগী' : 'patients'}</span>
              </h3>
            </div>
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? 'মোট টেস্ট সংখ্যা' : 'Tests to Collect'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5 text-emerald-300">
                {metrics.todayTestCount} <span className="text-xs font-normal opacity-80">{isBn ? 'টি টেস্ট' : 'tests'}</span>
              </h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-700/50 flex justify-between items-center text-xs">
            <span className="opacity-80">{isBn ? 'আদায়ের টাকা (COD/Pending):' : 'Pending COD Amount:'}</span>
            <span className="font-extrabold text-amber-300 text-sm">৳ {metrics.todayCodAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Tomorrow's KPI */}
        <div className={`p-5 rounded-2xl border transition-all ${
          dateTarget === 'tomorrow' || dateTarget === 'both' 
            ? 'bg-sky-900/90 border-sky-600 text-white shadow-sm' 
            : 'bg-white border-slate-200 text-slate-800 opacity-80'
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-sky-400/20 text-sky-200 border border-sky-400/30">
              📅 {isBn ? 'আগামীকাল (Tomorrow)' : 'Tomorrow'} • {displayTomorrowFormatted}
            </span>
            <span className="text-xs font-bold opacity-80">{tomorrowStr}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? 'স্যাম্পল ভিজিট' : 'Sample Visits'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5">
                {metrics.tomorrowVisitCount} <span className="text-xs font-normal opacity-80">{isBn ? 'টি রোগী' : 'patients'}</span>
              </h3>
            </div>
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? 'মোট টেস্ট সংখ্যা' : 'Tests to Collect'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5 text-sky-300">
                {metrics.tomorrowTestCount} <span className="text-xs font-normal opacity-80">{isBn ? 'টি টেস্ট' : 'tests'}</span>
              </h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-sky-700/50 flex justify-between items-center text-xs">
            <span className="opacity-80">{isBn ? 'আদায়ের টাকা (COD/Pending):' : 'Pending COD Amount:'}</span>
            <span className="font-extrabold text-amber-300 text-sm">৳ {metrics.tomorrowCodAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Combined 2-Day Total KPI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-800">
              ⚡ {isBn ? '২ দিনের মোট সমাহার' : '2-Day Aggregate'}
            </span>
            <FlaskConical size={20} className="text-purple-600" />
          </div>
          <div className="space-y-2 my-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs font-bold">{isBn ? 'মোট রোগী ভিজিট:' : 'Total Patient Visits:'}</span>
              <span className="text-slate-900 font-black text-lg">{metrics.totalVisits} {isBn ? 'জন' : 'visits'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-xs font-bold">{isBn ? 'মোট সংগ্রহযোগ্য টেস্ট:' : 'Total Tests to Collect:'}</span>
              <span className="text-emerald-700 font-black text-lg">{metrics.totalTests} {isBn ? 'টি' : 'tests'}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
            {isBn ? 'ফেলোবটমিস্টদের নমুনা সংগ্রহের রুট ম্যাপ তৈরি ও ট্র্যাকিং সহজ করতে ব্যবহৃত।' : 'Utilized for phlebotomist route planning & sample batching.'}
          </div>
        </div>

      </div>

      {/* Date Switcher & Search / Area Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Target Date Pill Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setDateTarget('today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                dateTarget === 'today'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'আজকে (Today)' : 'Today Only'}
            </button>
            <button
              onClick={() => setDateTarget('tomorrow')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                dateTarget === 'tomorrow'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'আগামীকাল (Tomorrow)' : 'Tomorrow Only'}
            </button>
            <button
              onClick={() => setDateTarget('both')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                dateTarget === 'both'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'আজ ও আগামীকাল উভয়ই (Both)' : 'Both Days'}
            </button>
          </div>

          {/* Area & Diagnostic Lab Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Area filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <MapPin size={14} className="text-emerald-600" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer"
              >
                <option value="all">{isBn ? 'সকল এরিয়া (All Areas)' : 'All Areas'}</option>
                {uniqueAreas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Lab filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <Building2 size={14} className="text-sky-600" />
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer"
              >
                <option value="all">{isBn ? 'সকল ডায়াগনস্টিক ল্যাব' : 'All Diagnostic Labs'}</option>
                {labs.map(l => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={isBn ? 'রোগীর নাম, ফোন বা এরিয়া খুঁজুন...' : 'Search patient, phone, area...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Itemized Test Count Breakdown Pills Box */}
      {metrics.testItemBreakdown.length > 0 && (
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-950">
            <span className="flex items-center gap-1.5">
              <FlaskConical size={16} className="text-emerald-700" />
              {isBn ? 'সংগ্রহযোগ্য টেস্ট আইটেমের তালিকা ও পরিমাণ:' : 'Sample Tests Required Breakdown:'}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold">
              {metrics.testItemBreakdown.length} {isBn ? 'টি ভিন্ন টেস্ট' : 'unique test items'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {metrics.testItemBreakdown.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
              >
                <span>{item.name}</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                  {item.count} {isBn ? 'টি' : 'samples'}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Patients & Sample Visits List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Syringe size={18} className="text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              {isBn ? 'স্যাম্পল সংগ্রহের রোগী তালিকা ও ঠিকানা' : 'Scheduled Patient Sample Collection Visits'}
            </h3>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full">
            {filteredBookings.length} {isBn ? 'টি কালেকশন অ্যাপয়েন্টমেন্ট' : 'appointments'}
          </span>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <AlertCircle size={36} className="mx-auto text-slate-300" />
            <p className="font-bold text-sm text-slate-600">
              {isBn ? 'নির্বাচিত ফিল্টারে কোনো স্যাম্পল কালেকশন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি।' : 'No sample collection appointments match this filter criteria.'}
            </p>
            <p className="text-xs text-slate-400">
              {isBn ? 'তারিখের অপশন পরিবর্তন করে অথবা ফিল্টার রিকসেট করে চেষ্টা করুন।' : 'Try selecting a different date range or clear the area/search filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBookings.map((b, index) => {
              const cleanId = (b.id || '').replace(/^#?EC-?/i, '').replace(/^#?BK-?/i, '');
              const isToday = b.dayType === 'today';

              return (
                <div key={b.id || index} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  
                  {/* Left Column: Date Tag, Patient Info, Address */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${
                        isToday 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-sky-100 text-sky-800 border border-sky-300'
                      }`}>
                        {isToday ? (isBn ? `আজ (${todayStr})` : `Today (${todayStr})`) : (isBn ? `আগামীকাল (${tomorrowStr})` : `Tomorrow (${tomorrowStr})`)}
                      </span>

                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Clock size={12} className="text-slate-500" />
                        {b.time || '08:00 AM - 10:00 AM'}
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-500">
                        #{cleanId}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-slate-900">
                          {b.customerName || (isBn ? 'নামবিহীন রোগী' : 'Anonymous Patient')}
                        </h4>
                        
                        {/* Direct Phone Call Button */}
                        {b.customerPhone && (
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-lg transition-all border border-emerald-200"
                          >
                            <Phone size={12} />
                            <span>{b.customerPhone}</span>
                          </a>
                        )}
                      </div>

                      {/* Location & Area Address */}
                      <div className="text-xs text-slate-600 mt-1 flex items-start gap-1.5">
                        <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800 font-bold">{b.area || (isBn ? 'ঢাকা সিটি' : 'Dhaka Area')}: </strong>
                          <span>{b.customerAddress || (isBn ? 'ঠিকানা দেয়া নেই' : 'No address provided')}</span>
                          <button
                            onClick={() => handleCopyText(b.customerAddress || b.area || '', b.id)}
                            className="ml-2 text-[10px] text-slate-400 hover:text-slate-700 inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <Copy size={10} />
                            <span>{copiedId === b.id ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic Lab & Tests badges */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1">
                        <Building2 size={12} />
                        {b.labName}
                      </span>

                      {(b.testNames || []).map((tName, tIdx) => (
                        <span key={tIdx} className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          🧪 {tName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Collection Amount, Collector & Action */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isBn ? 'সংগ্রহের ফি ও অর্থ' : 'Collection Amount'}
                      </p>
                      <h4 className="text-xl font-black text-slate-900">
                        ৳ {b.totalCost}
                      </h4>
                      <span className={`inline-block text-[11px] font-extrabold mt-0.5 px-2 py-0.5 rounded-full ${
                        b.paymentStatus === 'paid' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.paymentStatus === 'paid' ? (isBn ? '✓ পরিশোধিত (PAID)' : 'PAID') : (isBn ? '💵 ক্যাশ অন কালেকশন (COD)' : 'COLLECT COD')}
                      </span>
                    </div>

                    {/* Quick Action Button */}
                    <div className="flex items-center gap-2">
                      {onSelectOrder && (
                        <button
                          onClick={() => onSelectOrder(b)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span>{isBn ? 'অর্ডার বিস্তারিত' : 'View Order'}</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
