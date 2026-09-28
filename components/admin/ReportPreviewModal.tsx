import React, { useState } from 'react';
import { Language } from '../../types';
import { ReportDataParams, printExecutiveReport, exportReportToCSV } from '../../services/reportService';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  DollarSign, 
  ShoppingBag, 
  FlaskConical, 
  CheckCircle2,
  Calendar,
  Check,
  Share2
} from 'lucide-react';
import { Button } from '../Button';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportParams: ReportDataParams;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  reportParams
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const {
    timeframeLabel,
    selectedLab,
    selectedStatus,
    stats,
    labBreakdown,
    popularTests,
    timelineBreakdown,
    lang
  } = reportParams;

  const isBn = lang === 'bn';

  const handlePrint = () => {
    printExecutiveReport(reportParams);
  };

  const handleCsvExport = () => {
    exportReportToCSV(reportParams);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-white text-lg">
              +
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                {isBn ? 'এক্সিকিউটিভ ডায়াগনস্টিক রিপোর্ট প্রিভিউ' : 'Diagnostic Financial Report Preview'}
              </h3>
              <p className="text-slate-400 text-xs">{timeframeLabel} • eClinic Bangladesh</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCsvExport}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              {downloadSuccess ? <Check size={14} className="text-emerald-400" /> : <Download size={14} />}
              <span>{isBn ? 'CSV ডাউনলোড' : 'Export CSV'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-primary hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>{isBn ? 'প্রিন্ট / PDF সেভ' : 'Print / Save PDF'}</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          
          {/* Summary Meta Bar */}
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider block">
                {isBn ? 'রিপোর্ট সময়কাল ও ফিল্টার' : 'Report Period & Filters'}
              </span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {timeframeLabel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-white border border-sky-200 text-sky-800 font-bold rounded-lg text-xs">
                🏥 {selectedLab === 'all' ? (isBn ? 'সকল সেন্টার' : 'All Centers') : selectedLab}
              </span>
              <span className="px-2.5 py-1 bg-white border border-sky-200 text-sky-800 font-bold rounded-lg text-xs">
                ⚡ {selectedStatus === 'all' ? (isBn ? 'সকল স্ট্যাটাস' : 'All Status') : selectedStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* KPI 4-Card Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'সর্বমোট আয়' : 'Total Revenue'}</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">৳ {stats.totalRevenue.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-bold">✓ ৳{stats.completedRevenue.toLocaleString()} Paid</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'মোট অর্ডার' : 'Total Orders'}</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalOrders}</p>
              <span className="text-[10px] text-slate-500 font-semibold">{stats.completionRate}% {isBn ? 'সম্পন্ন' : 'Completed'}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'মোট টেস্ট সংখ্যা' : 'Tests Volume'}</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalTestsCount}</p>
              <span className="text-[10px] text-slate-500 font-semibold">{labBreakdown.length} {isBn ? 'টি ল্যাব' : 'Labs'}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">{isBn ? 'গড় অর্ডার বিল (AOV)' : 'Avg Order Value'}</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">৳ {stats.avgOrderValue}</p>
              <span className="text-[10px] text-slate-500 font-semibold">{isBn ? 'প্রতি বুকিংয়ে' : 'Per Order'}</span>
            </div>
          </div>

          {/* Diagnostic Center Performance */}
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Building2 size={14} className="text-primary" />
              {isBn ? 'ডায়াগনস্টিক সেন্টার ভিত্তিক বিবরণ' : 'Diagnostic Center Breakdown'}
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase text-slate-500 grid grid-cols-12 gap-2">
                <span className="col-span-5">{isBn ? 'সেন্টার' : 'Center'}</span>
                <span className="col-span-2 text-center">{isBn ? 'অর্ডার' : 'Orders'}</span>
                <span className="col-span-2 text-center">{isBn ? 'টেস্ট' : 'Tests'}</span>
                <span className="col-span-3 text-right">{isBn ? 'আয় (টাকা)' : 'Revenue'}</span>
              </div>
              {labBreakdown.map((lab, i) => (
                <div key={i} className="px-4 py-3 bg-white grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-5">
                    <p className="font-bold text-slate-900 text-xs">{lab.labName}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ✓ {lab.completedCount} {isBn ? 'সম্পন্ন' : 'completed'}
                    </span>
                  </div>
                  <span className="col-span-2 text-center font-bold text-slate-800">{lab.ordersCount}</span>
                  <span className="col-span-2 text-center font-semibold text-slate-600">{lab.testsCount}</span>
                  <span className="col-span-3 text-right font-black text-slate-900 text-xs sm:text-sm">
                    ৳ {lab.totalRevenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tests & Daily Timeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Tests */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FlaskConical size={14} className="text-emerald-600" />
                {isBn ? 'সর্বাধিক চাহিদাসম্পন্ন টেস্ট' : 'Top Booked Tests'}
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {popularTests.slice(0, 5).map((tItem, idx) => (
                  <div key={idx} className="p-2.5 bg-white flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-xs truncate max-w-[160px]">{tItem.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{tItem.count} {isBn ? 'টি' : 'times'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Timeline */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Calendar size={14} className="text-sky-600" />
                {isBn ? 'তারিখ ভিত্তিক ট্রেন্ড' : 'Daily Timeline Summary'}
              </h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {timelineBreakdown.slice(-5).map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{item.date}</p>
                      <span className="text-[10px] text-slate-400">{item.ordersCount} {isBn ? 'টি অর্ডার' : 'orders'}</span>
                    </div>
                    <span className="font-black text-slate-900">৳ {item.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handlePrint} 
              variant="primary" 
              className="!py-2 !px-5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-200"
            >
              <Printer size={15} />
              <span>{isBn ? 'রিপোর্ট প্রিন্ট বা PDF ডাউনলোড' : 'Print / Download PDF Report'}</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
