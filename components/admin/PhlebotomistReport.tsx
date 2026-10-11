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
  ListFilter,
  Layers
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

  // Active Date Filter (Default: '7days' for Next 7 Days)
  const [dateTarget, setDateTarget] = useState<string>('7days');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedLab, setSelectedLab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate 7 Days Date List (Day 0: Today to Day 6)
  const sevenDaysList = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      const dayName = d.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { weekday: 'short' });
      const formattedDate = d.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric'
      });

      list.push({
        index: i,
        dateStr,
        dayName,
        formattedDate,
        isToday: i === 0,
        isTomorrow: i === 1
      });
    }
    return list;
  }, [isBn]);

  const todayStr = sevenDaysList[0]?.dateStr || '';
  const tomorrowStr = sevenDaysList[1]?.dateStr || '';

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

  // All 7 Days active bookings
  const all7DaysBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      return sevenDaysList.some(day => isMatchingDate(b, day.dateStr));
    });
  }, [bookings, sevenDaysList]);

  // Today and Tomorrow Filtered Bookings
  const todayBookings = useMemo(() => {
    return bookings.filter(b => b.status !== 'cancelled' && isMatchingDate(b, todayStr));
  }, [bookings, todayStr]);

  const tomorrowBookings = useMemo(() => {
    return bookings.filter(b => b.status !== 'cancelled' && isMatchingDate(b, tomorrowStr));
  }, [bookings, tomorrowStr]);

  // Filtered Bookings list based on dateTarget and Search / Dropdowns
  const filteredBookings = useMemo(() => {
    let list: Array<BookingHistoryItem & { dayType: string; dayDateStr: string }> = [];

    if (dateTarget === '7days') {
      sevenDaysList.forEach(dayItem => {
        const dayBookings = bookings.filter(b => b.status !== 'cancelled' && isMatchingDate(b, dayItem.dateStr));
        dayBookings.forEach(b => list.push({
          ...b,
          dayType: dayItem.isToday ? 'today' : dayItem.isTomorrow ? 'tomorrow' : 'upcoming',
          dayDateStr: dayItem.dateStr
        }));
      });
    } else if (dateTarget === 'today') {
      todayBookings.forEach(b => list.push({ ...b, dayType: 'today', dayDateStr: todayStr }));
    } else if (dateTarget === 'tomorrow') {
      tomorrowBookings.forEach(b => list.push({ ...b, dayType: 'tomorrow', dayDateStr: tomorrowStr }));
    } else {
      // Specific date selected among the 7 days
      const specificBookings = bookings.filter(b => b.status !== 'cancelled' && isMatchingDate(b, dateTarget));
      specificBookings.forEach(b => list.push({ ...b, dayType: 'specific', dayDateStr: dateTarget }));
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
  }, [dateTarget, bookings, sevenDaysList, todayBookings, tomorrowBookings, selectedArea, selectedLab, searchQuery, todayStr, tomorrowStr]);

  // Unique Areas list for dropdown filter
  const uniqueAreas = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => {
      if (b.area && b.area.trim()) set.add(b.area.trim());
    });
    return Array.from(set).sort();
  }, [bookings]);

  // Comprehensive 7 Days Metrics
  const metrics = useMemo(() => {
    const todayVisitCount = todayBookings.length;
    const todayTestCount = todayBookings.reduce((sum, b) => sum + (b.testNames ? b.testNames.length : 1), 0);
    const todayCodAmount = todayBookings.reduce((sum, b) => b.paymentStatus !== 'paid' ? sum + b.totalCost : sum, 0);

    const tomorrowVisitCount = tomorrowBookings.length;
    const tomorrowTestCount = tomorrowBookings.reduce((sum, b) => sum + (b.testNames ? b.testNames.length : 1), 0);
    const tomorrowCodAmount = tomorrowBookings.reduce((sum, b) => b.paymentStatus !== 'paid' ? sum + b.totalCost : sum, 0);

    const total7DaysVisits = all7DaysBookings.length;
    const total7DaysTests = all7DaysBookings.reduce((sum, b) => sum + (b.testNames ? b.testNames.length : 1), 0);
    const total7DaysCodAmount = all7DaysBookings.reduce((sum, b) => b.paymentStatus !== 'paid' ? sum + b.totalCost : sum, 0);

    // Daily breakdown for the 7 days
    const dailyCounts = sevenDaysList.map(day => {
      const dayBookings = bookings.filter(b => b.status !== 'cancelled' && isMatchingDate(b, day.dateStr));
      const visits = dayBookings.length;
      const tests = dayBookings.reduce((sum, b) => sum + (b.testNames ? b.testNames.length : 1), 0);
      return { ...day, visits, tests };
    });

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
      total7DaysVisits,
      total7DaysTests,
      total7DaysCodAmount,
      dailyCounts,
      testItemBreakdown
    };
  }, [todayBookings, tomorrowBookings, all7DaysBookings, bookings, sevenDaysList, filteredBookings]);

  // Report Params for Print and Export
  const reportParams: PhlebotomistReportParams = {
    dateTarget,
    sevenDaysList,
    all7DaysBookings,
    todayStr,
    tomorrowStr,
    todayBookings,
    tomorrowBookings,
    filteredBookings,
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
                  {isBn ? 'আগামী ৭ দিনের রিপোর্ট' : 'Next 7 Days Report'}
                </span>
              </div>
              <p className="text-emerald-100/80 text-xs mt-1">
                {isBn 
                  ? 'রোগীর বাসা থেকে ব্লাড/স্যাম্পল সংগ্রহের ৭ দিনের শিডিউল, এরিয়াভিত্তিক ভিজিট ও স্যাম্পল রান লিস্ট' 
                  : '7-day schedule for home sample collection, area visits, and test item counts'}
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
            <span>{isBn ? 'CSV এক্সপোর্ট (৭ দিন)' : 'Export 7-Day CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Comparison (7 Days Overview Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 7-Day Total Aggregate KPI */}
        <div className={`p-5 rounded-2xl border transition-all ${
          dateTarget === '7days' 
            ? 'bg-slate-900 border-emerald-500 text-white shadow-md' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
              ⚡ {isBn ? 'আগামী ৭ দিনের মোট সমাহার' : '7-Day Total Aggregate'}
            </span>
            <FlaskConical size={20} className="text-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? '৭ দিনের মোট ভিজিট' : '7-Day Visits'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5">
                {metrics.total7DaysVisits} <span className="text-xs font-normal opacity-80">{isBn ? 'জন রোগী' : 'patients'}</span>
              </h3>
            </div>
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? 'মোট টেস্ট সংখ্যা' : 'Tests to Collect'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5 text-emerald-400">
                {metrics.total7DaysTests} <span className="text-xs font-normal opacity-80">{isBn ? 'টি টেস্ট' : 'tests'}</span>
              </h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex justify-between items-center text-xs">
            <span className="opacity-80">{isBn ? '৭ দিনের বকেয়া আদায় (COD):' : '7-Day Pending COD:'}</span>
            <span className="font-extrabold text-amber-300 text-sm">৳ {metrics.total7DaysCodAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Today's KPI */}
        <div className={`p-5 rounded-2xl border transition-all ${
          dateTarget === 'today' 
            ? 'bg-emerald-900 border-emerald-600 text-white shadow-sm' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
              🗓️ {isBn ? 'আজকে (Today)' : 'Today'} • {sevenDaysList[0]?.formattedDate}
            </span>
            <span className="text-xs font-bold opacity-80">{todayStr}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? 'স্যাম্পল ভিজিট' : 'Sample Visits'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5">
                {metrics.todayVisitCount} <span className="text-xs font-normal opacity-80">{isBn ? 'জন' : 'patients'}</span>
              </h3>
            </div>
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? 'টেস্ট সংখ্যা' : 'Tests'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5 text-emerald-600">
                {metrics.todayTestCount} <span className="text-xs font-normal opacity-80">{isBn ? 'টি' : 'tests'}</span>
              </h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="opacity-80">{isBn ? 'আজকের COD:' : 'Today COD:'}</span>
            <span className="font-extrabold text-amber-600 text-sm">৳ {metrics.todayCodAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Tomorrow's KPI */}
        <div className={`p-5 rounded-2xl border transition-all ${
          dateTarget === 'tomorrow' 
            ? 'bg-sky-900 border-sky-600 text-white shadow-sm' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-300">
              📅 {isBn ? 'আগামীকাল (Tomorrow)' : 'Tomorrow'} • {sevenDaysList[1]?.formattedDate}
            </span>
            <span className="text-xs font-bold opacity-80">{tomorrowStr}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? 'স্যাম্পল ভিজিট' : 'Sample Visits'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5">
                {metrics.tomorrowVisitCount} <span className="text-xs font-normal opacity-80">{isBn ? 'জন' : 'patients'}</span>
              </h3>
            </div>
            <div>
              <p className="text-[11px] opacity-80 uppercase font-semibold">{isBn ? 'টেস্ট সংখ্যা' : 'Tests'}</p>
              <h3 className="text-2xl sm:text-3xl font-black mt-0.5 text-sky-600">
                {metrics.tomorrowTestCount} <span className="text-xs font-normal opacity-80">{isBn ? 'টি' : 'tests'}</span>
              </h3>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="opacity-80">{isBn ? 'আগামীকালের COD:' : 'Tomorrow COD:'}</span>
            <span className="font-extrabold text-amber-600 text-sm">৳ {metrics.tomorrowCodAmount.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Date Switcher & Day Selector Bar (7 Days Pills) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Main Date Target Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl overflow-x-auto w-full lg:w-auto">
            <button
              onClick={() => setDateTarget('7days')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                dateTarget === '7days'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ {isBn ? 'আগামী ৭ দিনের সম্পূর্ণ রিপোর্ট' : 'All 7 Days Report'} ({metrics.total7DaysVisits})
            </button>

            <button
              onClick={() => setDateTarget('today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                dateTarget === 'today'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'আজকে' : 'Today'} ({metrics.todayVisitCount})
            </button>

            <button
              onClick={() => setDateTarget('tomorrow')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                dateTarget === 'tomorrow'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'আগামীকাল' : 'Tomorrow'} ({metrics.tomorrowVisitCount})
            </button>
          </div>

          {/* Search Box & Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
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
            <div className="relative flex-1 sm:w-56">
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

        {/* 7-Day Individual Day Selector Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-extrabold text-slate-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
            <Calendar size={13} />
            {isBn ? 'দিন নির্বাচন:' : 'Pick Day:'}
          </span>
          {metrics.dailyCounts.map((dayItem) => {
            const isSelected = dateTarget === dayItem.dateStr;
            return (
              <button
                key={dayItem.dateStr}
                onClick={() => setDateTarget(dayItem.dateStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs border border-emerald-500'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{dayItem.isToday ? (isBn ? 'আজ' : 'Today') : dayItem.isTomorrow ? (isBn ? 'কাল' : 'Tomorrow') : dayItem.dayName}</span>
                <span className="text-[10px] opacity-80">{dayItem.formattedDate}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-white text-emerald-900' : 'bg-slate-200 text-slate-800'
                }`}>
                  {dayItem.visits}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Itemized Test Count Breakdown Pills Box */}
      {metrics.testItemBreakdown.length > 0 && (
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-950">
            <span className="flex items-center gap-1.5">
              <FlaskConical size={16} className="text-emerald-700" />
              {isBn ? 'সংগ্রহযোগ্য স্যাম্পল/টেস্ট আইটেমের তালিকা ও পরিমাণ:' : 'Sample Tests Required Breakdown:'}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold">
              {metrics.testItemBreakdown.length} {isBn ? 'টি ভিন্ন টেস্ট আইটেম' : 'unique test items'}
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

      {/* Patient Dispatch Collection Run Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-slate-50/60">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ListFilter size={18} className="text-emerald-600" />
              {isBn ? 'ফ্লেবোটমিস্ট স্যাম্পল কালেকশন লিস্ট' : 'Phlebotomist Dispatch Schedule'}
              <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full">
                {filteredBookings.length} {isBn ? 'টি পেশেন্ট ভিজিট' : 'visits'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {dateTarget === '7days' 
                ? (isBn ? 'আগামী ৭ দিনের সকল নমুনা সংগ্রহের ডিউটি শিডিউল' : 'Duty schedule for all 7 days') 
                : (isBn ? `নির্বাচনকৃত তারিখের রোগীর বাসা থেকে স্যাম্পল সংগ্রহের তালিকা (${dateTarget})` : `Sample collection list for ${dateTarget}`)}
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            {isBn ? 'প্রতি রোগীর ভিজিটের জন্য কল দিন বা সরাসরি লোকেশন কপি করুন' : 'Click phone to call patient or copy address for maps'}
          </div>
        </div>

        {/* Patient Cards List */}
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Syringe size={40} className="mx-auto text-slate-300 stroke-1" />
            <h4 className="font-bold text-slate-700">
              {isBn ? 'কোন স্যাম্পল সংগ্রহের বুকিং পাওয়া যায়নি' : 'No sample collection visits found'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isBn ? 'বাছাইকৃত ফিল্টার বা তারিখে কোন রোগীর স্যাম্পল কালেকশন নির্ধারণ করা নেই।' : 'No active bookings matched the selected date or search filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBookings.map((b, idx) => {
              const cleanId = (b.id || '').replace(/^#?EC-?/i, '').replace(/^#?BK-?/i, '');
              const displayDayStr = b.dayDateStr || b.date?.slice(0, 10) || todayStr;
              const isToday = displayDayStr === todayStr;
              const isTomorrow = displayDayStr === tomorrowStr;

              return (
                <div 
                  key={b.id || idx}
                  className="p-4 sm:p-5 hover:bg-emerald-50/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  
                  {/* Left Column: Schedule & Patient Info */}
                  <div className="space-y-2 flex-1">
                    
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black ${
                        isToday 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : isTomorrow 
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}>
                        🗓️ {isToday ? (isBn ? 'আজকে' : 'Today') : isTomorrow ? (isBn ? 'আগামীকাল' : 'Tomorrow') : displayDayStr}
                      </span>

                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-xs border border-slate-200 flex items-center gap-1">
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
