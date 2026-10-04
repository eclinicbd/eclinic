import React, { useState } from 'react';
import { BookingHistoryItem, Language } from '../types';
import { printOrDownloadInvoice, resolveOrderCollectionFee } from '../services/invoiceService';
import { getStoredSiteSettings, getStoredTests, getStoredPackages } from '../services/dataStorage';
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
  ShieldCheck,
  Tag,
  Truck,
  CreditCard,
  FlaskConical
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

  // Resolve itemized breakdown (test-wise main rate, discount, final rate)
  const allCatalogItems = [...getStoredTests(lang), ...getStoredPackages(lang)];
  
  interface DisplayInvoiceItem {
    name: string;
    category?: string;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
  }

  let resolvedItems: DisplayInvoiceItem[] = [];

  if (order.items && order.items.length > 0) {
    resolvedItems = order.items.map(item => ({
      name: item.name,
      category: item.category,
      originalPrice: item.originalPrice ?? item.finalPrice,
      discountAmount: item.discountAmount ?? Math.max(0, (item.originalPrice ?? item.finalPrice) - item.finalPrice),
      finalPrice: item.finalPrice
    }));
  } else {
    const rawTests = order.testNames && order.testNames.length > 0 
      ? order.testNames 
      : ['General Diagnostic Laboratory Test'];
    
    const preservedSubtotal = order.subtotal && order.subtotal > 0 
      ? order.subtotal 
      : (order.totalCost ? Math.max(0, order.totalCost - (order.accessoriesFee || 45) - (order.collectionFee || order.serviceCharge || 150)) : 0);

    resolvedItems = rawTests.map(testName => {
      const matched = allCatalogItems.find(c => 
        c.name?.trim().toLowerCase() === testName.trim().toLowerCase() ||
        c.id === testName
      );
      if (matched) {
        const itemFinal = (order.labId && matched.priceByLab?.[order.labId] !== undefined)
          ? matched.priceByLab[order.labId]
          : matched.price;
        const itemRegular = (order.labId && matched.originalPriceByLab?.[order.labId] !== undefined)
          ? matched.originalPriceByLab[order.labId]
          : (matched.originalPrice || itemFinal);
        const discount = Math.max(0, itemRegular - itemFinal);
        return {
          name: matched.name,
          category: matched.category,
          originalPrice: itemRegular,
          discountAmount: discount,
          finalPrice: itemFinal
        };
      } else {
        const avg = preservedSubtotal > 0 
          ? Math.round(preservedSubtotal / rawTests.length) 
          : Math.round((order.totalCost || 500) / rawTests.length);
        return {
          name: testName,
          category: isBn ? 'ডায়াগনস্টিক টেস্ট' : 'Diagnostic Test',
          originalPrice: avg,
          discountAmount: 0,
          finalPrice: avg
        };
      }
    });
  }

  // Preserve stored financial snapshot amounts
  const computedMainSum = resolvedItems.reduce((sum, item) => sum + item.originalPrice, 0);
  const itemsMainSum = (order.subtotal !== undefined && order.subtotal > 0)
    ? order.subtotal
    : computedMainSum;

  const computedDiscountSum = resolvedItems.reduce((sum, item) => sum + item.discountAmount, 0);
  const totalDiscountSavings = order.totalDiscount !== undefined 
    ? order.totalDiscount 
    : (computedDiscountSum > 0 
        ? computedDiscountSum 
        : Math.max(0, itemsMainSum - resolvedItems.reduce((sum, item) => sum + item.finalPrice, 0)));

  const computedFinalSum = resolvedItems.reduce((sum, item) => sum + item.finalPrice, 0);
  const itemsFinalSum = (order.subtotal !== undefined && order.totalDiscount !== undefined)
    ? Math.max(0, order.subtotal - order.totalDiscount)
    : computedFinalSum;

  // Tube, Needle & Accessories Charge (Historical preservation)
  const accessoriesFee = order.accessoriesFee !== undefined
    ? order.accessoriesFee
    : (resolvedItems.length > 0 ? (resolvedItems.length <= 2 ? 45 : resolvedItems.length <= 4 ? 65 : 85) : 0);

  // Home Sample Collection Fee (Historical preservation)
  const collectionFee = resolveOrderCollectionFee(order, lang, itemsFinalSum, accessoriesFee);

  // Total Payable calculation (Strictly frozen to order.totalCost)
  const totalPayable = order.totalCost && order.totalCost > 0
    ? order.totalCost
    : (itemsFinalSum + accessoriesFee + collectionFee);

  const getPaymentMethodBadge = () => {
    switch (order.paymentMethod) {
      case 'bkash':
        return `bKash ${order.transactionId ? `(Trx: ${order.transactionId})` : '(বিকাশ)'}`;
      case 'nagad':
        return `Nagad ${order.transactionId ? `(Trx: ${order.transactionId})` : '(নগদ)'}`;
      case 'rocket':
        return `Rocket ${order.transactionId ? `(Trx: ${order.transactionId})` : '(রকেট)'}`;
      case 'card':
        return isBn ? 'কার্ড পেমেন্ট (Card)' : 'Card Payment';
      case 'cod':
      default:
        return isBn ? 'ক্যাশ অন স্যাম্পল কালেকশন (Cash)' : 'Cash on Sample Collection';
    }
  };

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

          {/* Itemized Tests Table with Rate only */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                {isBn ? 'নির্বাচিত টেস্ট সমূহ ও রেট' : 'Booked Tests & Rates'}
              </span>
              <span className="text-slate-500 font-semibold text-[11px]">
                {resolvedItems.length} {isBn ? 'টি টেস্ট' : 'items'}
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {/* Header */}
              <div className="grid grid-cols-12 bg-slate-100/90 text-slate-700 font-bold text-[11px] uppercase tracking-wider p-2.5 border-b border-slate-200">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-8">{isBn ? 'টেস্টের বিবরণ' : 'Test Description'}</div>
                <div className="col-span-3 text-right">{isBn ? 'রেট' : 'Rate'}</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {resolvedItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 p-2.5 items-center hover:bg-slate-50/70 transition-colors text-xs">
                    <div className="col-span-1 text-center text-slate-400 font-bold text-[11px]">
                      {idx + 1}
                    </div>
                    <div className="col-span-8 pr-2">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      {item.category && (
                        <span className="text-[10px] text-slate-400 block font-normal">{item.category}</span>
                      )}
                    </div>
                    <div className="col-span-3 text-right font-black text-slate-900">
                      ৳ {item.originalPrice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Bill Summary: 1. Tests Subtotal -> 2. Discount Savings -> 3. Tube & Accessories -> 4. Home Collection Fee -> 5. Payment Method -> 6. Total */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <FileText size={14} className="text-sky-400" />
                <span>{isBn ? 'মোট টেস্টের মূল্য (Tests Subtotal):' : 'Tests Subtotal:'}</span>
                <span className="text-white font-bold">৳ {itemsMainSum}</span>
              </div>
              {totalDiscountSavings > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Tag size={14} className="text-emerald-400" />
                  <span>{isBn ? 'মোট ডিসকাউন্ট / সাশ্রয় (Total Discount Savings):' : 'Total Discount Savings:'}</span>
                  <span className="text-emerald-400 font-bold">- ৳ {totalDiscountSavings}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <FlaskConical size={14} className="text-sky-400" />
                <span>{isBn ? 'টিউব, নিডল ও এক্সেসরিজ:' : 'Tube, Needle & Accessories:'}</span>
                <span className="text-white font-bold">৳ {accessoriesFee}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <Truck size={14} className="text-emerald-400" />
                <span>{isBn ? 'হোম স্যাম্পল কালেকশন ফি:' : 'Home Sample Collection Fee:'}</span>
                <span className={collectionFee === 0 ? 'text-emerald-400 font-bold' : 'text-white font-bold'}>
                  {collectionFee === 0 ? (isBn ? '৳ ০ (ফ্রি / Free)' : '৳ 0 (FREE)') : `৳ ${collectionFee}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <CreditCard size={14} className="text-primary" />
                <span>{isBn ? 'পেমেন্ট মেথড:' : 'Payment Method:'}</span>
                <span className="text-white font-bold">{getPaymentMethodBadge()}</span>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 w-full sm:w-auto">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                {isBn ? 'সর্বমোট প্রদেয় বিল' : 'Total Payable'}
              </span>
              <span className="text-2xl font-black text-emerald-400">৳ {totalPayable}</span>
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
