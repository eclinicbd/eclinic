import React, { useState } from 'react';
import { BookingHistoryItem, Language } from '../types';
import { printOrDownloadInvoice } from '../services/invoiceService';
import { getStoredSiteSettings } from '../services/dataStorage';
import { formatOrderId } from './BookingModal';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Button } from './Button';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: BookingHistoryItem | null;
  lang: Language;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  lang
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const isBn = lang === 'bn';
  const siteSettings = getStoredSiteSettings(lang);

  const invoiceLogo = siteSettings.invoiceLogoUrl || siteSettings.logoUrl;
  const orgName = siteSettings.invoiceOrgName || siteSettings.siteName || 'LabHome BD';
  const orgHotline = siteSettings.invoiceHotline || siteSettings.contactHotline || siteSettings.contactPhone || '+880 9613-828282';
  const guidelinesTitle = siteSettings.invoiceTermsTitle || (isBn ? 'স্যাম্পল কালেকশন ও রিপোর্ট নির্দেশিকা (Important Guidelines):' : 'Sample Collection & Report Guidelines:');
  const guidelinesList = (siteSettings.invoiceGuidelines && siteSettings.invoiceGuidelines.length > 0)
    ? siteSettings.invoiceGuidelines
    : [
        isBn ? 'ফাস্টিং টেস্টের ক্ষেত্রে ৮-১০ ঘণ্টা পূর্ব থেকে পানি ছাড়া অন্য কিছু খাওয়া থেকে বিরত থাকুন।' : 'For fasting tests, please fast for 8-10 hours prior to sample collection.',
        isBn ? `যেকোনো সহযোগিতায় কল করুন আমাদের হটলাইনে: ${orgHotline}` : `For any assistance, please call our 24/7 helpline: ${orgHotline}`
      ];

  const handlePrint = () => {
    printOrDownloadInvoice(order, lang, siteSettings);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(formatOrderId(order.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testsList = order.testNames && order.testNames.length > 0
    ? order.testNames
    : ['General Diagnostic Laboratory Test'];

  const avgCost = Math.round(order.totalCost / testsList.length);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Action Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {invoiceLogo ? (
              <img src={invoiceLogo} alt={orgName} className="h-9 max-w-[120px] object-contain rounded-lg bg-white p-0.5" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-black text-white text-lg">
                +
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-2">
                {isBn ? 'অফিসিয়াল ইনভয়েস ও মানি রিসিপ্ট' : 'Official Invoice & Receipt'}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {order.status.toUpperCase()}
                </span>
              </h3>
              <p className="text-slate-400 text-xs">{orgName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-primary hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title={isBn ? 'ইনভয়েস প্রিন্ট বা পিডিএফ ডাউনলোড করুন' : 'Print / Download PDF'}
            >
              <Download size={14} />
              <span>{isBn ? 'পিডিএফ / প্রিন্ট' : 'Print / PDF'}</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          
          {/* Invoice Meta Banner */}
          <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-primary tracking-wider">
                {isBn ? 'ইনভয়েস ট্র্যাকিং আইডি' : 'Invoice Tracking ID'}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-black text-slate-900 text-base">{formatOrderId(order.id)}</span>
                <button 
                  onClick={handleCopyId}
                  className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                {isBn ? 'অ্যাপয়েন্টমেন্ট স্লট' : 'Scheduled Slot'}
              </span>
              <p className="font-bold text-slate-800 text-xs mt-0.5 flex items-center gap-1 sm:justify-end">
                <Calendar size={13} className="text-primary" /> {order.date} • <Clock size={13} className="text-primary" /> {order.time}
              </p>
            </div>
          </div>

          {/* Patient and Lab Information 2-col Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Info Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-200/60 pb-2">
                <User size={15} className="text-primary" />
                <span>{isBn ? 'পেশেন্ট / কাস্টমার তথ্য' : 'Patient Information'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">{isBn ? 'নাম:' : 'Name:'}</span>
                <p className="font-bold text-slate-900 text-sm">{order.customerName || 'Anonymous'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">{isBn ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1"><Phone size={12} /> {order.customerPhone}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">{isBn ? 'হোম স্যাম্পল ঠিকানা:' : 'Collection Address:'}</span>
                <p className="text-slate-600 font-medium flex items-start gap-1"><MapPin size={12} className="shrink-0 mt-0.5" /> {order.customerAddress || 'Dhaka, Bangladesh'}</p>
              </div>
            </div>

            {/* Diagnostic Lab Info Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-200/60 pb-2">
                  <Building2 size={15} className="text-primary" />
                  <span>{isBn ? 'ডায়াগনস্টিক ল্যাব তথ্য' : 'Diagnostic Lab Info'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">{isBn ? 'নির্বাচিত ল্যাব:' : 'Lab Partner:'}</span>
                  <p className="font-bold text-sky-800 text-sm">{order.labName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">{isBn ? 'ডাক্তার রেফারেন্স:' : 'Doctor Ref:'}</span>
                  <p className="text-slate-700 font-medium">{order.doctorName || (isBn ? 'নির্দিষ্ট নেই / সেলফ' : 'Self Reference')}</p>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200 flex items-center gap-2 text-[11px] font-bold">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>{isBn ? 'সার্টিফাইড ল্যাব কোয়ালিটি ও হোম কালেকশন' : 'Certified Quality & Sterile Collection'}</span>
              </div>
            </div>
          </div>

          {/* Itemized Tests Breakdown */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                {isBn ? 'নির্বাচিত টেস্ট ও হেলথ প্যাকেজ সমূহ' : 'Booked Tests & Health Packages'}
              </span>
              <span className="text-slate-500 font-semibold text-[11px]">
                {testsList.length} {isBn ? 'টি টেস্ট' : 'items'}
              </span>
            </div>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
              {testsList.map((test, idx) => (
                <div key={idx} className="p-3 bg-white flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 text-xs">{test}</span>
                  </div>
                  <span className="font-bold text-slate-900">৳ {avgCost}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Bill Summary */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <p className="text-slate-400 text-xs">{isBn ? 'পেমেন্ট স্ট্যাটাস:' : 'Payment Method:'}</p>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> {isBn ? 'ক্যাশ অন কালেকশন / অনলাইন' : 'Cash on Home Collection / Online'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'হোম কালেকশন ফি সম্পূর্ণ ফ্রি' : 'Home sample collection is included for free'}
              </p>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 w-full sm:w-auto">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                {isBn ? 'সর্বমোট প্রদেয় বিল' : 'Total Payable'}
              </span>
              <span className="text-2xl font-black text-emerald-400">৳ {order.totalCost}</span>
            </div>
          </div>

          {/* Guidelines */}
          <div className="p-3.5 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">{guidelinesTitle}</p>
            {guidelinesList.map((g, idx) => (
              <p key={idx}>• {g}</p>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
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
              <span>{isBn ? 'ইনভয়েস ডাউনলোড / প্রিন্ট করুন' : 'Download / Print Invoice'}</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
