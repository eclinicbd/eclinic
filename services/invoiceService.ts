import { BookingHistoryItem, DoctorAtHomeBooking, Language, SiteSettings } from '../types';
import { getStoredSiteSettings, getStoredTests, getStoredPackages, getStoredLabs } from './dataStorage';

export const resolveOrderCollectionFee = (
  order: BookingHistoryItem, 
  lang: Language = 'bn', 
  itemsFinalSum: number = 0, 
  accessoriesFee: number = 0
): number => {
  // 1. Strict Priority: If fee is explicitly stored in order snapshot (historical preservation)
  if (typeof order.collectionFee === 'number') {
    return order.collectionFee;
  }
  if (typeof order.serviceCharge === 'number') {
    return order.serviceCharge;
  }

  // 2. Strict Priority: Derive from order.totalCost and saved subtotal / accessories
  if (order.totalCost && order.totalCost > 0) {
    const effectiveFinal = itemsFinalSum > 0 
      ? itemsFinalSum 
      : ((order.subtotal || 0) - (order.totalDiscount || 0));
    const effectiveAcc = order.accessoriesFee !== undefined ? order.accessoriesFee : accessoriesFee;
    
    if (effectiveFinal > 0) {
      const diff = order.totalCost - (effectiveFinal + effectiveAcc);
      if (diff >= 0) {
        return diff;
      }
    }
  }

  // 3. Fallback only for legacy orders missing snapshot data: Lookup lab service charge
  const allLabs = getStoredLabs(lang);
  const matchedLab = allLabs.find(l => 
    (order.labId && l.id === order.labId) || 
    (order.labName && l.name?.trim().toLowerCase() === order.labName.trim().toLowerCase())
  );

  if (matchedLab && typeof matchedLab.serviceCharge === 'number') {
    return matchedLab.serviceCharge;
  }

  return 200;
};

export const generateInvoiceHtml = (
  order: BookingHistoryItem, 
  lang: Language = 'bn',
  customSettings?: SiteSettings
): string => {
  const isBn = lang === 'bn';
  const settings = customSettings || getStoredSiteSettings(lang);

  const issueDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : `${order.date} ${order.time}`;

  // Resolve itemized breakdown (test wise main rate, discount, final rate)
  // Strict snapshot isolation: If order.items exists, never query catalog
  const allCatalogItems = [...getStoredTests(lang), ...getStoredPackages(lang)];
  
  interface ResolvedInvoiceItem {
    name: string;
    category?: string;
    originalPrice: number; // Main Rate
    discountAmount: number; // Discount Amount
    finalPrice: number; // Final Rate
  }

  let resolvedItems: ResolvedInvoiceItem[] = [];

  if (order.items && order.items.length > 0) {
    // 100% frozen historical snapshot
    resolvedItems = order.items.map(item => ({
      name: item.name,
      category: item.category,
      originalPrice: item.originalPrice ?? item.finalPrice,
      discountAmount: item.discountAmount ?? Math.max(0, (item.originalPrice ?? item.finalPrice) - item.finalPrice),
      finalPrice: item.finalPrice
    }));
  } else {
    if (order.prescriptionUrl && (!order.testNames || order.testNames.length === 0)) {
      resolvedItems = [{
        name: isBn ? `ডাক্তারের প্রেসক্রিপশন (${order.prescriptionName || 'সংযুক্ত'})` : `Doctor Prescription (${order.prescriptionName || 'Attached'})`,
        category: isBn ? 'প্রেসক্রিপশন পর্যালোচনা সাপেক্ষে' : 'Prescription Review',
        originalPrice: 0,
        discountAmount: 0,
        finalPrice: 0
      }];
    } else {
      const rawTests = order.testNames && order.testNames.length > 0 
        ? order.testNames 
        : ['Diagnostic Health Test / Package'];
      
      // If order has a preserved subtotal or totalCost, anchor item rates to preserved totals
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
            category: isBn ? 'ল্যাব টেস্ট' : 'Lab Test',
            originalPrice: avg,
            discountAmount: 0,
            finalPrice: avg
          };
        }
      });
    }
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

  // Total payable amount (Strictly frozen to order.totalCost)
  const totalPayable = order.totalCost && order.totalCost > 0 
    ? order.totalCost 
    : (itemsFinalSum + accessoriesFee + collectionFee);

  const cleanOrderId = (order.id || '').replace(/^#?EC-?/i, '').replace(/^#?BK-?/i, '').replace(/^#/, '');

  // Brand / Organization Details from settings
  const invoiceLogo = settings?.invoiceLogoUrl || settings?.logoUrl || '';
  const orgName = settings?.invoiceOrgName || settings?.siteName || 'LabHome BD';
  const orgSubtitle = settings?.invoiceOrgSubtitle || settings?.siteTagline || (isBn ? 'বিশ্বস্ত হোম ডায়াগনস্টিক ও ডিজিটাল ল্যাব কেয়ার নেটওয়ার্ক' : 'Trusted Digital Lab & Home Sample Collection');
  const orgAddress = settings?.invoiceAddress || settings?.contactAddress || (isBn ? 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা - ১২০৫, বাংলাদেশ' : 'House #12, Road #5, Dhanmondi, Dhaka, Bangladesh');
  const orgHotline = settings?.invoiceHotline || settings?.contactHotline || settings?.contactPhone || '+880 9613-828282';
  const orgEmail = settings?.invoiceEmail || settings?.contactEmail || 'support@labhomebd.com';
  const orgWebsite = settings?.invoiceWebsite || 'www.labhomebd.com';
  const watermarkText = settings?.invoiceWatermark || orgName || 'LabHome BD';
  const guidelinesTitle = settings?.invoiceTermsTitle || (isBn ? 'স্যাম্পল কালেকশন ও রিপোর্ট নির্দেশিকা (Important Guidelines):' : 'Sample Collection & Report Guidelines:');
  const guidelinesList = (settings?.invoiceGuidelines && settings.invoiceGuidelines.length > 0)
    ? settings.invoiceGuidelines
    : [
        isBn ? 'ফাস্টিং ব্লাড সুগার বা লিপিড প্রোফাইল টেস্ট থাকলে অনুগ্রহ করে ৮-১০ ঘণ্টা উপবাস থাকুন।' : 'For fasting tests (FBS, Lipid Profile), ensure 8-10 hours overnight fasting.',
        isBn ? 'আমাদের প্রশিক্ষিত মেডিকেল টেকনোলজিস্ট জীবাণুমুক্ত কিট নিয়ে আপনার ঠিকানায় নির্ধারিত সময়ে পৌঁছাবেন।' : 'Our certified medical phlebotomist will arrive with sterilized collection kits at your selected slot.',
        isBn ? 'ল্যাব টেস্ট সম্পন্ন হওয়ার পর আপনার পেশেন্ট ড্যাশবোর্ড ও এসএমএস/হোয়াটসঅ্যাপে ভেরিফাইড রিপোর্ট পাওয়া যাবে।' : 'Digital verified reports will be available on your dashboard and phone upon lab processing.',
        isBn ? 'যেকোনো জরুরি জিজ্ঞাসা ও সহায়তায় আমাদের হেল্পলাইন নাম্বারে যোগাযোগ করুন।' : 'For any immediate assistance, contact our 24/7 customer helpline.'
      ];
  const footerNote = settings?.invoiceFooterNote || (isBn ? '✓ ভেরিফাইড ডিজিটাল মানি রিসিপ্ট' : '✓ Verified Digital Money Receipt');

  const getPaymentMethodLabel = (pm?: string, trxId?: string) => {
    switch (pm) {
      case 'bkash':
        return `bKash ${trxId ? `(Trx: ${trxId})` : '(বিকাশ)'}`;
      case 'nagad':
        return `Nagad ${trxId ? `(Trx: ${trxId})` : '(নগদ)'}`;
      case 'rocket':
        return `Rocket ${trxId ? `(Trx: ${trxId})` : '(রকেট)'}`;
      case 'card':
        return isBn ? 'ডেবিট / ক্রেডিট কার্ড (Card Payment)' : 'Debit / Credit Card';
      case 'cod':
      default:
        return isBn ? 'ক্যাশ অন স্যাম্পল কালেকশন (Cash on Delivery)' : 'Cash on Sample Collection';
    }
  };

  const paymentDisplay = getPaymentMethodLabel(order.paymentMethod, order.transactionId);

  const count = resolvedItems.length;
  const tablePadding = count > 12 ? '2px 5px' : (count > 6 ? '3.5px 7px' : '5px 10px');
  const tableFontSize = count > 12 ? '9.5px' : (count > 6 ? '11px' : '12px');
  const sectionMargin = count > 10 ? '5px' : (count > 5 ? '8px' : '11px');
  const cardPadding = count > 10 ? '10px 14px' : (count > 5 ? '16px 20px' : '20px 24px');

  return `
<!DOCTYPE html>
<html lang="${isBn ? 'bn' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${cleanOrderId} | ${orgName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      padding: 12px;
    }

    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: ${cardPadding};
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      position: relative;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-after: avoid !important;
      page-break-before: avoid !important;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 65px;
      font-weight: 900;
      color: rgba(2, 132, 199, 0.03);
      text-transform: uppercase;
      pointer-events: none;
      user-select: none;
      white-space: nowrap;
      letter-spacing: 5px;
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 8px;
      margin-bottom: ${sectionMargin};
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: 900;
    }

    .brand-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }

    .brand-title span {
      color: #0284c7;
    }

    .brand-sub {
      font-size: 9.5px;
      color: #64748b;
      font-weight: 500;
    }

    .invoice-badge {
      text-align: right;
    }

    .invoice-title {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0284c7;
      letter-spacing: 0.5px;
      line-height: 1.1;
    }

    .order-id {
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 5px;
      display: inline-block;
      margin-top: 2px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 7px 10px;
      margin-bottom: ${sectionMargin};
    }

    .meta-col h4 {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
    }

    .meta-col p {
      font-size: 11px;
      color: #1e293b;
      font-weight: 600;
      line-height: 1.3;
    }

    .meta-col span.sub-text {
      font-size: 10px;
      color: #64748b;
      font-weight: 400;
      display: block;
      margin-top: 1px;
    }

    .lab-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 6px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${sectionMargin};
    }

    .lab-info h3 {
      font-size: 12px;
      font-weight: 800;
      color: #0369a1;
    }

    .lab-info p {
      font-size: 9.5px;
      color: #0284c7;
      font-weight: 600;
      margin-top: 1px;
    }

    .status-tag {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 12px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .status-tag.pending {
      background: #fef9c3;
      color: #854d0e;
      border-color: #fde047;
    }

    .status-tag.cancelled {
      background: #ffe4e6;
      color: #9f1239;
      border-color: #fca5a5;
    }

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: ${sectionMargin};
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    table.items-table th {
      background: #f1f5f9;
      color: #334155;
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: 700;
      padding: 5px 8px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }

    table.items-table th.text-right {
      text-align: right;
    }

    table.items-table td {
      padding: ${tablePadding};
      font-size: ${tableFontSize};
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
      line-height: 1.25;
    }

    table.items-table td.text-right {
      text-align: right;
    }

    .item-cat {
      display: block;
      font-size: 8.5px;
      color: #64748b;
      font-weight: normal;
      margin-top: 1px;
    }

    .rate-cell {
      color: #0f172a;
      font-weight: 700;
      font-size: ${tableFontSize};
    }

    table.items-table tbody tr:last-child td {
      border-bottom: 2px solid #e2e8f0;
    }

    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: ${sectionMargin};
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .summary-table {
      width: 310px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 10px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 0;
      font-size: 10.5px;
      color: #475569;
    }

    .summary-row.total-row {
      border-top: 2px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 3px;
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }

    .total-amount {
      color: #0284c7;
      font-size: 14.5px;
      font-weight: 900;
    }

    .instructions-box {
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      padding: 6px 10px;
      background: #fafafa;
      margin-bottom: ${sectionMargin};
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .instructions-box h5 {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 2px;
    }

    .instructions-box ul {
      list-style-type: disc;
      padding-left: 14px;
      font-size: 9px;
      color: #64748b;
      line-height: 1.35;
    }

    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .contact-info {
      font-size: 9px;
      color: #64748b;
      line-height: 1.35;
    }

    .seal-box {
      text-align: right;
    }

    .digital-seal {
      display: inline-block;
      border: 1.5px dashed #0284c7;
      border-radius: 5px;
      padding: 3px 6px;
      color: #0284c7;
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @page {
      size: A4 portrait;
      margin: 4mm 6mm 4mm 6mm;
    }

    @media print {
      html, body {
        width: 100%;
        height: 100%;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        overflow: hidden !important;
      }
      .invoice-card {
        border: none !important;
        box-shadow: none !important;
        padding: 6px 10px !important;
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="invoice-card">
    <div class="watermark">${watermarkText}</div>

    <!-- Header -->
    <div class="header-row">
      <div class="brand-logo">
        ${invoiceLogo ? `
          <img src="${invoiceLogo}" alt="${orgName}" style="max-height: 40px; max-width: 130px; object-fit: contain; border-radius: 6px; border: 1px solid #f1f5f9; background: #fff;" />
        ` : `
          <div class="logo-icon">+</div>
        `}
        <div>
          <div class="brand-title">${orgName}</div>
          <div class="brand-sub">${orgSubtitle}</div>
        </div>
      </div>
      <div class="invoice-badge">
        <div class="invoice-title">${isBn ? 'মানি রিসিপ্ট / ইনভয়েস' : 'OFFICIAL INVOICE'}</div>
        <div class="order-id">ID: ${cleanOrderId}</div>
      </div>
    </div>

    <!-- Patient and Order Details Grid -->
    <div class="meta-grid">
      <div class="meta-col">
        <h4>${isBn ? 'রোগী / কাস্টমারের তথ্য (Patient Info)' : 'Patient Information'}</h4>
        <p>${order.customerName || (isBn ? 'নাম দেওয়া হয়নি' : 'Anonymous Patient')}</p>
        <span class="sub-text">📞 ${isBn ? 'ফোন:' : 'Phone:'} ${order.customerPhone}</span>
        <span class="sub-text">📍 ${isBn ? 'ঠিকানা:' : 'Address:'} ${order.customerAddress || (isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh')}</span>
      </div>
      <div class="meta-col">
        <h4>${isBn ? 'অ্যাপয়েন্টমেন্ট ও ইনভয়েস বিবরণ' : 'Booking Details'}</h4>
        <p>${isBn ? 'তারিখ ও সময়:' : 'Slot:'} ${order.date} (${order.time})</p>
        <span class="sub-text">🕒 ${isBn ? 'ইস্যুর সময়:' : 'Issued At:'} ${issueDate}</span>
        <span class="sub-text">👨‍⚕️ ${isBn ? 'রেফারেল ডক্টর:' : 'Doctor Ref:'} ${order.doctorName || (isBn ? 'সেলফ / নির্দিষ্ট নেই' : 'Self Reference')}</span>
      </div>
    </div>

    <!-- Lab Partner Info -->
    <div class="lab-box">
      <div class="lab-info">
        <h3>🏥 ${order.labName}</h3>
        <p>${isBn ? 'নির্বাচিত সার্টিফাইড ডায়াগনস্টিক ল্যাবরেটরি' : 'Selected Certified Diagnostic Center'}</p>
      </div>
      <div class="status-tag ${order.status}">
        ${isBn ? (order.status === 'completed' ? 'সম্পন্ন (Completed)' : order.status === 'confirmed' ? 'নিশ্চিত (Confirmed)' : order.status === 'cancelled' ? 'বাতিল (Cancelled)' : 'অপেক্ষমান (Pending)') : order.status.toUpperCase()}
      </div>
    </div>

    <!-- Itemized Test Table with Rate only -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 32px; text-align: center;">#</th>
          <th>${isBn ? 'ল্যাব টেস্ট / প্যাকেজের নাম ও বিবরণ' : 'Test / Package Description'}</th>
          <th class="text-right" style="width: 100px;">${isBn ? 'রেট' : 'Rate'}</th>
        </tr>
      </thead>
      <tbody>
        ${resolvedItems.map((item, index) => `
          <tr>
            <td style="color: #64748b; text-align: center;">${index + 1}</td>
            <td>
              <strong style="color: #0f172a;">${item.name}</strong>
              ${item.category ? `<span class="item-cat">${item.category}</span>` : ''}
            </td>
            <td class="text-right rate-cell">৳ ${item.originalPrice}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Bill Summary with Home Sample Collection Fee, Tube Fee and Total -->
    <div class="summary-section">
      <div class="summary-table">
        <div class="summary-row">
          <span>${isBn ? 'মোট টেস্টের মূল্য (Tests Subtotal):' : 'Tests Subtotal:'}</span>
          <span style="font-weight: 700; color: #0f172a;">৳ ${itemsMainSum}</span>
        </div>
        ${totalDiscountSavings > 0 ? `
        <div class="summary-row" style="color: #16a34a;">
          <span>${isBn ? 'মোট ডিসকাউন্ট / সাশ্রয় (Total Discount Savings):' : 'Total Discount Savings:'}</span>
          <span style="font-weight: 700; color: #16a34a;">- ৳ ${totalDiscountSavings}</span>
        </div>
        ` : ''}
        <div class="summary-row">
          <span>${isBn ? 'টিউব, নিডল ও এক্সেসরিজ:' : 'Tube, Needle & Accessories:'}</span>
          <span style="font-weight: 700; color: #0f172a;">৳ ${accessoriesFee}</span>
        </div>
        <div class="summary-row">
          <span>${isBn ? 'হোম স্যাম্পল কালেকশন ফি:' : 'Home Sample Collection Fee:'}</span>
          <span style="${collectionFee === 0 ? 'color: #16a34a; font-weight: 700;' : 'font-weight: 700; color: #0f172a;'}">
            ${collectionFee === 0 ? (isBn ? '৳ ০ (ফ্রি / Free)' : '৳ 0 (FREE)') : `৳ ${collectionFee}`}
          </span>
        </div>
        <div class="summary-row">
          <span>${isBn ? 'পেমেন্ট মেথড:' : 'Payment Method:'}</span>
          <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">${paymentDisplay}</span>
        </div>
        <div class="summary-row total-row">
          <span>${isBn ? 'সর্বমোট প্রদেয় বিল:' : 'Total Payable:'}</span>
          <span class="total-amount">৳ ${totalPayable}</span>
        </div>
      </div>
    </div>

    <!-- Instructions / Notes -->
    <div class="instructions-box">
      <h5>${guidelinesTitle}</h5>
      <ul>
        ${guidelinesList.slice(0, count > 8 ? 2 : guidelinesList.length).map(g => `<li>${g}</li>`).join('')}
      </ul>
    </div>

    <!-- Footer with Helpline & Official Stamp -->
    <div class="footer-row">
      <div class="contact-info">
        <strong>${orgName}</strong><br/>
        📍 ${orgAddress}<br/>
        📞 Hotline: ${orgHotline} | ✉️ ${orgEmail}
      </div>
      <div class="seal-box">
        <div class="digital-seal">
          ${footerNote}
        </div>
        <div style="font-size: 8px; color: #94a3b8; margin-top: 2px;">
          Computer Generated • No Signature Required
        </div>
      </div>
    </div>
  </div>

</body>
</html>
`;
};

/**
 * Open print window and trigger print / PDF save
 */
export const printOrDownloadInvoice = (
  order: BookingHistoryItem, 
  lang: Language = 'bn',
  customSettings?: SiteSettings
): void => {
  const htmlContent = generateInvoiceHtml(order, lang, customSettings);
  const printWindow = window.open('', '_blank', 'width=900,height=900');
  
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for assets/fonts to load then trigger print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 450);
  } else {
    // Fallback: Create hidden iframe if popup is blocked
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 3000);
      }, 450);
    }
  }
};

/**
 * Generate Printable HTML for Doctor at Home Visit Receipt / Slip
 */
export const generateDoctorAtHomeSlipHtml = (
  booking: DoctorAtHomeBooking,
  lang: Language = 'bn',
  customSettings?: SiteSettings
): string => {
  const isBn = lang === 'bn';
  const settings = customSettings || getStoredSiteSettings(lang);

  const issueDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : `${booking.date} ${booking.timeSlot}`;

  const orgName = settings.siteName || (isBn ? 'ল্যাবহোম বিডি হেলথকেয়ার' : 'LabHome BD Healthcare');
  const orgTagline = settings.siteTagline || (isBn ? 'স্মার্ট হোম হেলথকেয়ার ও স্পেশালিস্ট ডক্টর সার্ভিস' : 'Smart Home Healthcare & Specialist Doctor Visit');
  const orgHotline = settings.contactHotline || settings.contactPhone || '01700-000000';
  const orgEmail = settings.contactEmail || 'care@labhomebd.com';
  const orgAddress = settings.contactAddress || 'House 24, Road 11, Dhanmondi, Dhaka-1209';

  let paymentMethodLabel = isBn ? 'ভিজিটের সময় নগদ (ক্যাশ)' : 'Cash on Visit';
  if (booking.paymentMethod === 'bkash') {
    paymentMethodLabel = `bKash ${booking.transactionId ? `(TrxID: ${booking.transactionId})` : ''}`;
  } else if (booking.paymentMethod === 'nagad') {
    paymentMethodLabel = `Nagad ${booking.transactionId ? `(TrxID: ${booking.transactionId})` : ''}`;
  } else if (booking.paymentMethod === 'rocket') {
    paymentMethodLabel = `Rocket ${booking.transactionId ? `(TrxID: ${booking.transactionId})` : ''}`;
  } else if (booking.paymentMethod === 'card') {
    paymentMethodLabel = isBn ? 'অনলাইন কার্ড পেমেন্ট (পরিশোধিত)' : 'Online Card Payment (Paid)';
  }

  const paymentStatusBadge = booking.paymentStatus === 'paid'
    ? `<span style="background: #ecfdf5; color: #047857; padding: 3px 8px; border-radius: 6px; font-weight: 700; border: 1px solid #a7f3d0;">✓ ${isBn ? 'পরিশোধিত (PAID)' : 'PAID'}</span>`
    : booking.paymentStatus === 'pending_verification'
    ? `<span style="background: #fffbeb; color: #b45309; padding: 3px 8px; border-radius: 6px; font-weight: 700; border: 1px solid #fde68a;">⏳ ${isBn ? 'যাচাইাধীন (PENDING VERIFICATION)' : 'PENDING VERIFICATION'}</span>`
    : `<span style="background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px; font-weight: 700; border: 1px solid #cbd5e1;">💵 ${isBn ? 'ভিজিটের পর প্রদেয় (DUE ON VISIT)' : 'DUE ON VISIT'}</span>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${isBn ? 'হোম ডক্টর ভিজিট স্লিপ' : 'Doctor at Home Visit Slip'} - ${booking.id}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Hind Siliguri", "Kalpurush", sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.5;
    }
    .slip-container {
      max-width: 780px;
      margin: 0 auto;
      padding: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      background: #ffffff;
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #059669;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #065f46;
      letter-spacing: -0.5px;
    }
    .brand-tagline {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .slip-badge {
      text-align: right;
    }
    .badge-pill {
      display: inline-block;
      background: #059669;
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .tracking-id {
      font-family: monospace;
      font-size: 14px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 6px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
    }
    .info-card h4 {
      font-size: 11px;
      font-weight: 800;
      color: #047857;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 11.5px;
    }
    .info-label {
      color: #64748b;
      font-weight: 600;
    }
    .info-val {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
      max-width: 65%;
      word-break: break-word;
    }
    .highlight-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 20px;
    }
    .highlight-box h4 {
      font-size: 12px;
      font-weight: 800;
      color: #065f46;
      margin-bottom: 6px;
    }
    .table-container {
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 800;
      font-size: 11px;
      text-align: left;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
    }
    td {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
      color: #1e293b;
    }
    .total-row {
      background: #f8fafc;
      font-weight: 800;
    }
    .total-amount {
      color: #047857;
      font-size: 16px;
      font-weight: 900;
    }
    .instructions {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 10px;
      padding: 12px;
      margin-bottom: 20px;
      font-size: 11px;
      color: #92400e;
    }
    .instructions ul {
      margin-left: 18px;
      margin-top: 4px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      font-size: 10.5px;
      color: #64748b;
    }
    .seal-box {
      border: 2px dashed #059669;
      padding: 8px 16px;
      border-radius: 8px;
      text-align: center;
      color: #047857;
      font-weight: 800;
      font-size: 10px;
    }
    @media print {
      body {
        background: #ffffff;
      }
      .slip-container {
        border: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="slip-container">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="brand-title">${orgName}</h1>
        <p class="brand-tagline">${orgTagline}</p>
        <p style="font-size: 10.5px; color: #64748b; margin-top: 4px;">📍 ${orgAddress}</p>
      </div>
      <div class="slip-badge">
        <span class="badge-pill">${isBn ? 'হোম ডক্টর বুকিং স্লিপ' : 'Doctor at Home Slip'}</span>
        <div class="tracking-id">${booking.id}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${issueDate}</div>
      </div>
    </div>

    <!-- Patient & Appointment Meta Grid -->
    <div class="meta-grid">
      <!-- Patient Details -->
      <div class="info-card">
        <h4>${isBn ? 'রোগীর বিবরণ (Patient Details)' : 'Patient Details'}</h4>
        <div class="info-row">
          <span class="info-label">${isBn ? 'রোগীর নাম:' : 'Name:'}</span>
          <span class="info-val">${booking.patientName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isBn ? 'বয়স ও লিঙ্গ:' : 'Age & Gender:'}</span>
          <span class="info-val">${booking.patientAge ? `${booking.patientAge} ${isBn ? 'বছর' : 'Yrs'}` : 'N/A'} | ${booking.patientGender === 'female' ? (isBn ? 'মহিলা' : 'Female') : (isBn ? 'পুরুষ' : 'Male')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isBn ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
          <span class="info-val font-mono">${booking.patientPhone}</span>
        </div>
        ${booking.altPhone ? `
        <div class="info-row">
          <span class="info-label">${isBn ? 'বিকল্প নম্বর:' : 'Alt Phone:'}</span>
          <span class="info-val font-mono">${booking.altPhone}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">${isBn ? 'এলাকা:' : 'Area:'}</span>
          <span class="info-val">${booking.area || 'ঢাকা (Dhaka)'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isBn ? 'পূর্ণ ঠিকানা:' : 'Address:'}</span>
          <span class="info-val">${booking.address}</span>
        </div>
      </div>

      <!-- Appointment & Doctor Details -->
      <div class="info-card">
        <h4>${isBn ? 'ভিজিটের বিবরণ (Visit Schedule)' : 'Visit Schedule'}</h4>
        <div class="info-row">
          <span class="info-label">${isBn ? 'ডাক্তারের ক্যাটাগরি:' : 'Doctor Specialty:'}</span>
          <span class="info-val" style="color: #047857; font-weight: 800;">${booking.doctorTypeLabel || booking.doctorType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isBn ? 'নির্ধারিত তারিখ:' : 'Visit Date:'}</span>
          <span class="info-val">${booking.date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isBn ? 'সময় স্লট:' : 'Time Slot:'}</span>
          <span class="info-val">${booking.timeSlot}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isBn ? 'বুকিং স্ট্যাটাস:' : 'Booking Status:'}</span>
          <span class="info-val" style="text-transform: uppercase;">${booking.status}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${isBn ? 'পেমেন্ট স্ট্যাটাস:' : 'Payment:'}</span>
          <span class="info-val">${paymentStatusBadge}</span>
        </div>
        ${booking.assignedDoctorName ? `
        <div class="info-row">
          <span class="info-label">${isBn ? 'অ্যাসাইনড ডাক্তার:' : 'Assigned Doctor:'}</span>
          <span class="info-val">${booking.assignedDoctorName}</span>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- Symptoms & Clinical Instructions -->
    <div class="highlight-box">
      <h4>${isBn ? 'রোগীর প্রধান শারীরিক সমস্যা / উপসর্গ (Reported Symptoms):' : 'Reported Symptoms:'}</h4>
      <p style="font-size: 11.5px; color: #1e293b; line-height: 1.6;">${booking.symptoms || (isBn ? 'সাধারণ শারীরিক চেকআপ ও পরামর্শ' : 'General clinical checkup and consultation')}</p>
      ${booking.emergencyInstructions ? `
      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #a7f3d0; font-size: 11px; color: #065f46;">
        <strong>${isBn ? 'বিশেষ নির্দেশনা:' : 'Special Instructions:'}</strong> ${booking.emergencyInstructions}
      </div>
      ` : ''}
    </div>

    <!-- Bill / Fee Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>${isBn ? 'সেবার বিবরণ (Service Description)' : 'Service Description'}</th>
            <th style="width: 140px; text-align: center;">${isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}</th>
            <th style="width: 120px; text-align: right;">${isBn ? 'মোট ফি (Amount)' : 'Amount'}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${booking.doctorTypeLabel || 'Doctor at Home Visit'}</strong><br/>
              <span style="font-size: 10px; color: #64748b;">${isBn ? 'বাসায় সরাসরি বিশেষজ্ঞ চিকিৎসকের ক্লিনিক্যাল পরীক্ষা, ভাইটালস মনিটরিং ও প্রেসক্রিপশন' : 'In-person specialist home checkup, vitals examination & authorized prescription'}</span>
            </td>
            <td style="text-align: center; font-size: 11px; font-weight: 600;">
              ${paymentMethodLabel}
            </td>
            <td style="text-align: right; font-weight: 700;">
              ৳ ${booking.consultationFee || 1500}
            </td>
          </tr>
          <tr class="total-row">
            <td colspan="2" style="text-align: right; font-weight: 800;">
              ${isBn ? 'সর্বমোট ফি (Total Amount):' : 'Total Amount:'}
            </td>
            <td style="text-align: right;" class="total-amount">
              ৳ ${booking.consultationFee || 1500}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Patient Guidelines -->
    <div class="instructions">
      <strong>${isBn ? 'জরুরি নির্দেশনা ও সেবা শর্তাবলী:' : 'Important Guidelines:'}</strong>
      <ul>
        <li>${isBn ? 'ডাক্তার ভিজিটের পূর্বে আমাদের মেডিকেল কো-অর্ডিনেটর রোগীর সাথে যোগাযোগ করে নিশ্চিত করবেন।' : 'Our medical coordinator will call to confirm visit timing before doctor dispatch.'}</li>
        <li>${isBn ? 'রোগীর পূর্ববর্তী সকল প্রেসক্রিপশন ও মেডিকেল টেস্টের রিপোর্ট হাতের কাছে রাখুন।' : 'Keep patient previous medical reports and prescriptions handy.'}</li>
        <li>${isBn ? `যেকোনো জিজ্ঞাসা বা জরুরি প্রয়োজনে আমাদের ২৪/৭ হেল্পলাইনে কল করুন: ${orgHotline}` : `For any queries or emergencies, call our 24/7 hotline: ${orgHotline}`}</li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>
        <strong>${orgName}</strong><br/>
        📞 Hotline: ${orgHotline} | ✉️ ${orgEmail}<br/>
        <span>Computer Generated Doctor Visit Slip • Authorized Digital Copy</span>
      </div>
      <div class="seal-box">
        ✓ VERIFIED<br/>
        HEALTHCARE SERVICE
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Print or Download Doctor at Home Slip with popup and hidden iframe fallback
 */
export const printOrDownloadDoctorAtHomeSlip = (
  booking: DoctorAtHomeBooking,
  lang: Language = 'bn',
  customSettings?: SiteSettings
): void => {
  const htmlContent = generateDoctorAtHomeSlipHtml(booking, lang, customSettings);
  const printWindow = window.open('', '_blank', 'width=850,height=900');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 450);
  } else {
    // Hidden iframe fallback if popup blocked
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 3000);
      }, 450);
    }
  }
};

