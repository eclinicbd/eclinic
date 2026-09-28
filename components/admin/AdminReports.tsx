import React, { useState, useMemo } from 'react';
import { BookingHistoryItem, LabPartner, Language, BookingStatus } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  FlaskConical, 
  Building2, 
  Printer, 
  Download, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  PieChart, 
  Filter,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
  Eye,
  Check
} from 'lucide-react';
import { Button } from '../Button';
import { printExecutiveReport, exportReportToCSV, ReportDataParams } from '../../services/reportService';
import { ReportPreviewModal } from './ReportPreviewModal';

interface AdminReportsProps {
  lang: Language;
  bookings: BookingHistoryItem[];
  labs: LabPartner[];
  onSelectOrder?: (order: BookingHistoryItem) => void;
}

type TimeframeOption = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export const AdminReports: React.FC<AdminReportsProps> = ({
  lang,
  bookings,
  labs,
  onSelectOrder
}) => {
  const isBn = lang === 'bn';
  const t = TRANSLATIONS[lang];

  const [timeframe, setTimeframe] = useState<TimeframeOption>('month');
  const [selectedLabId, setSelectedLabId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Helper date parsing
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Compute filtered bookings based on timeframe & filters
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Diagnostic Lab filter
      if (selectedLabId !== 'all' && b.labId !== selectedLabId && b.labName !== selectedLabId) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && b.status !== selectedStatus) {
        return false;
      }

      // Date comparison
      const bookingDateStr = b.createdAt ? b.createdAt.slice(0, 10) : b.date;
      if (!bookingDateStr) return true;

      const bookingDate = new Date(bookingDateStr);

      if (timeframe === 'today') {
        return bookingDateStr === todayStr;
      } else if (timeframe === 'week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return bookingDate >= sevenDaysAgo;
      } else if (timeframe === 'month') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return bookingDate >= thirtyDaysAgo;
      } else if (timeframe === 'year') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return bookingDate >= oneYearAgo;
      } else if (timeframe === 'custom') {
        if (customStartDate && bookingDateStr < customStartDate) return false;
        if (customEndDate && bookingDateStr > customEndDate) return false;
        return true;
      }

      return true; // 'all'
    });
  }, [bookings, timeframe, selectedLabId, selectedStatus, customStartDate, customEndDate, todayStr]);

  // Overall Financial & Operational Summary
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let completedRevenue = 0;
    let totalTestsCount = 0;
    let pendingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    filteredBookings.forEach(b => {
      const testsCount = b.testNames ? b.testNames.length : 1;
      totalTestsCount += testsCount;

      if (b.status !== 'cancelled') {
        totalRevenue += (b.totalCost || 0);
      }
      if (b.status === 'completed') {
        completedRevenue += (b.totalCost || 0);
        completedCount++;
      } else if (b.status === 'pending') {
        pendingCount++;
      } else if (b.status === 'cancelled') {
        cancelledCount++;
      }
    });

    const totalOrders = filteredBookings.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const completionRate = totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0;

    return {
      totalRevenue,
      completedRevenue,
      totalOrders,
      totalTestsCount,
      pendingCount,
      completedCount,
      cancelledCount,
      avgOrderValue,
      completionRate
    };
  }, [filteredBookings]);

  // Breakdown by Diagnostic Center (Lab)
  const labBreakdown = useMemo(() => {
    const labMap = new Map<string, {
      labId: string;
      labName: string;
      ordersCount: number;
      testsCount: number;
      totalRevenue: number;
      completedCount: number;
      pendingCount: number;
    }>();

    filteredBookings.forEach(b => {
      const labKey = b.labName || b.labId || 'Other Diagnostic';
      const existing = labMap.get(labKey) || {
        labId: b.labId || '',
        labName: labKey,
        ordersCount: 0,
        testsCount: 0,
        totalRevenue: 0,
        completedCount: 0,
        pendingCount: 0
      };

      existing.ordersCount += 1;
      existing.testsCount += (b.testNames ? b.testNames.length : 1);
      if (b.status !== 'cancelled') {
        existing.totalRevenue += (b.totalCost || 0);
      }
      if (b.status === 'completed') existing.completedCount += 1;
      if (b.status === 'pending') existing.pendingCount += 1;

      labMap.set(labKey, existing);
    });

    return Array.from(labMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredBookings]);

  // Breakdown by Timeline (Daily / Monthly grouped data)
  const timelineBreakdown = useMemo(() => {
    const timeMap = new Map<string, {
      date: string;
      ordersCount: number;
      testsCount: number;
      revenue: number;
    }>();

    filteredBookings.forEach(b => {
      const dateKey = b.createdAt ? b.createdAt.slice(0, 10) : (b.date || 'Unknown');
      const existing = timeMap.get(dateKey) || {
        date: dateKey,
        ordersCount: 0,
        testsCount: 0,
        revenue: 0
      };

      existing.ordersCount += 1;
      existing.testsCount += (b.testNames ? b.testNames.length : 1);
      if (b.status !== 'cancelled') {
        existing.revenue += (b.totalCost || 0);
      }

      timeMap.set(dateKey, existing);
    });

    return Array.from(timeMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredBookings]);

  // Most Popular Tests
  const popularTests = useMemo(() => {
    const testMap = new Map<string, { name: string; count: number; estimatedRevenue: number }>();

    filteredBookings.forEach(b => {
      if (b.testNames && Array.isArray(b.testNames)) {
        const itemShare = b.testNames.length > 0 ? Math.round(b.totalCost / b.testNames.length) : b.totalCost;
        b.testNames.forEach(tName => {
          const existing = testMap.get(tName) || { name: tName, count: 0, estimatedRevenue: 0 };
          existing.count += 1;
          if (b.status !== 'cancelled') {
            existing.estimatedRevenue += itemShare;
          }
          testMap.set(tName, existing);
        });
      }
    });

    return Array.from(testMap.values()).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [filteredBookings]);

  const getTimeframeLabel = (tf: TimeframeOption) => {
    switch (tf) {
      case 'today': return isBn ? 'আজকের টেস্ট রিপোর্ট (Today)' : 'Today\'s Report';
      case 'week': return isBn ? 'চলতি সপ্তাহ (Last 7 Days)' : 'This Week (7 Days)';
      case 'month': return isBn ? 'চলতি মাস (Last 30 Days)' : 'This Month (30 Days)';
      case 'year': return isBn ? 'বাৎসরিক রিপোর্ট (This Year)' : 'Annual Report (1 Year)';
      case 'all': return isBn ? 'সর্বমোট সর্বকালীন (All Time)' : 'All Time Records';
      case 'custom': return isBn ? 'কাস্টম তারিখ সীমা' : 'Custom Date Range';
    }
  };

  const reportDataParams: ReportDataParams = useMemo(() => ({
    timeframeLabel: getTimeframeLabel(timeframe),
    selectedLab: selectedLabId,
    selectedStatus: selectedStatus,
    stats,
    labBreakdown,
    popularTests,
    timelineBreakdown,
    bookings: filteredBookings,
    lang
  }), [timeframe, selectedLabId, selectedStatus, stats, labBreakdown, popularTests, timelineBreakdown, filteredBookings, lang]);

  // Export CSV Report with Blob and UTF-8 BOM
  const handleExportCSV = () => {
    exportReportToCSV(reportDataParams);
  };

  // Direct Browser Print for Comprehensive Report
  const handlePrintReport = () => {
    printExecutiveReport(reportDataParams);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Filter Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isBn ? 'ল্যাব টেস্ট ও রেভিনিউ রিপোর্ট' : 'Test Analytics & Revenue Reports'}
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                {isBn 
                  ? 'প্রতিদিন, সাপ্তাহিক, মাসিক ও বাৎসরিক টেস্ট ও সেন্টারভিত্তিক আর্থিক রিপোর্ট' 
                  : 'Comprehensive daily, weekly, monthly, and yearly diagnostic revenue analysis'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto print:hidden">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 cursor-pointer"
            title="Preview full formatted report"
          >
            <Eye size={14} />
            <span>{isBn ? 'রিপোর্ট প্রিভিউ' : 'Preview Report'}</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer size={14} />
            <span>{isBn ? 'রিপোর্ট প্রিন্ট / PDF' : 'Print / PDF Report'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Export data to Excel/CSV"
          >
            <Download size={14} />
            <span>{isBn ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Timeframe Selector Pill Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['today', 'week', 'month', 'year', 'all', 'custom'] as TimeframeOption[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-primary text-white shadow-sm shadow-sky-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {getTimeframeLabel(tf)}
              </button>
            ))}
          </div>

          {/* Diagnostic Center and Status Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">{isBn ? 'সকল ডায়াগনস্টিক সেন্টার' : 'All Diagnostic Centers'}</option>
              {labs.map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="pending">{isBn ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
              <option value="confirmed">{isBn ? 'নিশ্চিত (Confirmed)' : 'Confirmed'}</option>
              <option value="collected">{isBn ? 'স্যাম্পল সংগ্রহ (Collected)' : 'Collected'}</option>
              <option value="processing">{isBn ? 'ল্যাব প্রসেসিং (Processing)' : 'Processing'}</option>
              <option value="completed">{isBn ? 'সম্পন্ন (Completed)' : 'Completed'}</option>
              <option value="cancelled">{isBn ? 'বাতিল (Cancelled)' : 'Cancelled'}</option>
            </select>
          </div>
        </div>

        {/* Custom Date Inputs if custom timeframe selected */}
        {timeframe === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">{isBn ? 'শুরুর তারিখ:' : 'Start:'}</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">{isBn ? 'শেষের তারিখ:' : 'End:'}</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign size={22} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {getTimeframeLabel(timeframe)}
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {isBn ? 'সর্বমোট টেস্টের আয় (Revenue)' : 'Total Revenue'}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              ৳ {stats.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> {isBn ? 'সম্পন্ন টেস্টের আদায়:' : 'Completed:'} ৳ {stats.completedRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag size={22} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {stats.completionRate}% {isBn ? 'সম্পন্ন' : 'Completed'}
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {isBn ? 'মোট বুকিং ও অর্ডার' : 'Total Bookings'}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {stats.totalOrders} <span className="text-sm font-semibold text-slate-500">{isBn ? 'টি' : 'orders'}</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              ⏳ {stats.pendingCount} {isBn ? 'অপেক্ষমান' : 'Pending'} • ✓ {stats.completedCount} {isBn ? 'সম্পন্ন' : 'Completed'}
            </p>
          </div>
        </div>

        {/* Total Tests Conducted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <FlaskConical size={22} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              {labBreakdown.length} {isBn ? 'সেন্টার' : 'Labs'}
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {isBn ? 'মোট সম্পাদিত টেস্টের সংখ্যা' : 'Individual Tests Done'}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {stats.totalTestsCount} <span className="text-sm font-semibold text-slate-500">{isBn ? 'টি টেস্ট' : 'tests'}</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              {isBn ? 'প্যাকেজ ও টেস্ট আইটেম মিলিয়ে' : 'Across all booked test items'}
            </p>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp size={22} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              AOV Metric
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {isBn ? 'গড় অর্ডার মূল্য (AOV)' : 'Avg Order Value'}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              ৳ {stats.avgOrderValue}
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              {isBn ? 'প্রতি বুকিংয়ে গড় খরচ' : 'Average ticket per appointment'}
            </p>
          </div>
        </div>
      </div>

      {/* Diagnostic Center Breakdown Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Building2 size={18} className="text-sky-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {isBn ? 'ডায়াগনস্টিক সেন্টার ভিত্তিক টেস্ট ও আয়ের বিবরণ' : 'Diagnostic Center Breakdown'}
              </h3>
              <p className="text-slate-400 text-xs">
                {isBn ? 'কোন ল্যাব সেন্টারে কত টাকার টেস্ট হয়েছে এবং কয়টি টেস্ট বুক করা হয়েছে' : 'Revenue and order distribution per diagnostic center'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            {labBreakdown.length} {isBn ? 'টি সেন্টার' : 'Centers'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-5 py-3.5">{isBn ? 'ডায়াগনস্টিক সেন্টার' : 'Diagnostic Center'}</th>
                <th className="px-5 py-3.5 text-center">{isBn ? 'মোট অর্ডার' : 'Total Orders'}</th>
                <th className="px-5 py-3.5 text-center">{isBn ? 'মোট টেস্ট' : 'Total Tests'}</th>
                <th className="px-5 py-3.5 text-right">{isBn ? 'মোট আয় (টাকা)' : 'Total Revenue (BDT)'}</th>
                <th className="px-5 py-3.5 text-center">{isBn ? 'মার্কেট শেয়ার' : 'Share %'}</th>
                <th className="px-5 py-3.5">{isBn ? 'অবস্থা' : 'Progress'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                    {isBn ? 'নির্বাচিত ফিল্টারে কোনো তথ্য পাওয়া যায়নি।' : 'No diagnostic center data available for this timeframe.'}
                  </td>
                </tr>
              ) : (
                labBreakdown.map((lab, idx) => {
                  const sharePercent = stats.totalRevenue > 0 
                    ? Math.round((lab.totalRevenue / stats.totalRevenue) * 100) 
                    : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">{lab.labName}</p>
                            <span className="text-[11px] text-slate-400 font-semibold">
                              ✓ {lab.completedCount} {isBn ? 'সম্পন্ন' : 'completed'} • ⏳ {lab.pendingCount} {isBn ? 'অপেক্ষমান' : 'pending'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-slate-800">
                        {lab.ordersCount}
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-700">
                        {lab.testsCount}
                      </td>
                      <td className="px-5 py-4 text-right font-black text-slate-900 text-sm">
                        ৳ {lab.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-center font-extrabold text-primary text-xs">
                        {sharePercent}%
                      </td>
                      <td className="px-5 py-4 w-44">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, Math.max(5, sharePercent))}%` }} 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column: Daily/Timeline Breakdown & Popular Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeline breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={17} className="text-primary" />
              <h3 className="font-bold text-slate-900 text-sm">
                {isBn ? 'তারিখ ভিত্তিক ট্রেন্ড ও দৈনিক বিবরণ' : 'Daily Timeline & Revenue Trend'}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              {timelineBreakdown.length} {isBn ? 'দিন' : 'days recorded'}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {timelineBreakdown.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-8">No records in this timeframe.</p>
            ) : (
              timelineBreakdown.map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 hover:bg-sky-50/50 rounded-xl border border-slate-100 flex items-center justify-between transition-colors">
                  <div>
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      {item.date}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {item.ordersCount} {isBn ? 'টি অর্ডার' : 'orders'} • {item.testsCount} {isBn ? 'টি টেস্ট' : 'tests'}
                    </span>
                  </div>
                  <span className="font-black text-slate-900 text-sm">
                    ৳ {item.revenue.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Booked Tests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical size={17} className="text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                {isBn ? 'সর্বাধিক বুক হওয়া জনপ্রিয় টেস্টসমূহ' : 'Top Booked Diagnostic Tests'}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              {popularTests.length} {isBn ? 'টি টেস্ট' : 'items'}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {popularTests.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-8">No test frequency data available.</p>
            ) : (
              popularTests.map((tItem, idx) => (
                <div key={idx} className="p-3 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-100 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{tItem.name}</p>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {tItem.count} {isBn ? 'বার বুক করা হয়েছে' : 'times booked'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-800 text-xs block">৳ {tItem.estimatedRevenue.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Report In-App Preview and Print Modal */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        reportParams={reportDataParams}
      />
    </div>
  );
};
