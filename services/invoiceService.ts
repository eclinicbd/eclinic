import { BookingHistoryItem, Language, SiteSettings } from '../types';
import { getStoredSiteSettings, getStoredTests, getStoredPackages } from './dataStorage';

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
      : ['Diagnostic Health Test / Package'];
    
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
        const avg = Math.round(order.totalCost / rawTests.length);
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

  const itemsFinalSum = resolvedItems.reduce((sum, item) => sum + item.finalPrice, 0);
  const itemsMainSum = resolvedItems.reduce((sum, item) => sum + item.originalPrice, 0);
  const itemsDiscountSum = resolvedItems.reduce((sum, item) => sum + item.discountAmount, 0);

  // Home Sample Collection Fee
  const collectionFee = order.collectionFee !== undefined 
    ? order.collectionFee 
    : (order.serviceCharge !== undefined 
        ? order.serviceCharge 
        : (order.totalCost > itemsFinalSum ? order.totalCost - itemsFinalSum : 0));

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
    
    body {
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      padding: 24px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .invoice-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px 40px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      position: relative;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(2, 132, 199, 0.04);
      text-transform: uppercase;
      pointer-events: none;
      user-select: none;
      white-space: nowrap;
      letter-spacing: 6px;
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 22px;
      font-weight: 900;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .brand-title span {
      color: #0284c7;
    }

    .brand-sub {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }

    .invoice-badge {
      text-align: right;
    }

    .invoice-title {
      font-size: 20px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0284c7;
      letter-spacing: 1px;
    }

    .order-id {
      font-family: monospace;
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      background: #f1f5f9;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-top: 4px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }

    .meta-col h4 {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }

    .meta-col p {
      font-size: 13px;
      color: #1e293b;
      font-weight: 600;
      line-height: 1.4;
    }

    .meta-col span.sub-text {
      font-size: 12px;
      color: #64748b;
      font-weight: 400;
      display: block;
      margin-top: 2px;
    }

    .lab-box {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .lab-info h3 {
      font-size: 14px;
      font-weight: 800;
      color: #0369a1;
    }

    .lab-info p {
      font-size: 11px;
      color: #0284c7;
      font-weight: 600;
      margin-top: 2px;
    }

    .status-tag {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 20px;
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
      margin-bottom: 24px;
    }

    table.items-table th {
      background: #f1f5f9;
      color: #334155;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }

    table.items-table th.text-right {
      text-align: right;
    }

    table.items-table td {
      padding: 11px 12px;
      font-size: 13px;
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
    }

    table.items-table td.text-right {
      text-align: right;
    }

    .item-cat {
      display: block;
      font-size: 10px;
      color: #64748b;
      font-weight: normal;
      margin-top: 1px;
    }

    .main-rate {
      color: #64748b;
      font-weight: 600;
    }

    .discount-pill {
      display: inline-block;
      background: #fff7ed;
      color: #c2410c;
      border: 1px solid #ffedd5;
      font-size: 11px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
    }

    .final-rate {
      font-weight: 800;
      color: #0f172a;
    }

    table.items-table tbody tr:last-child td {
      border-bottom: 2px solid #e2e8f0;
    }

    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }

    .summary-table {
      width: 360px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0;
      font-size: 12px;
      color: #475569;
    }

    .summary-row.total-row {
      border-top: 2px solid #cbd5e1;
      padding-top: 10px;
      margin-top: 6px;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }

    .total-amount {
      color: #0284c7;
      font-size: 18px;
      font-weight: 900;
    }

    .instructions-box {
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 14px 18px;
      background: #fafafa;
      margin-bottom: 30px;
    }

    .instructions-box h5 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 4px;
    }

    .instructions-box ul {
      list-style-type: disc;
      padding-left: 18px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }

    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
    }

    .contact-info {
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }

    .seal-box {
      text-align: right;
    }

    .digital-seal {
      display: inline-block;
      border: 2px dashed #0284c7;
      border-radius: 8px;
      padding: 6px 12px;
      color: #0284c7;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media print {
      body {
        background: transparent;
        padding: 0;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
        padding: 20px;
        max-width: 100%;
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
          <img src="${invoiceLogo}" alt="${orgName}" style="max-height: 48px; max-width: 140px; object-fit: contain; border-radius: 8px; border: 1px solid #f1f5f9; background: #fff;" />
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

    <!-- Itemized Test Table with Main Rate, Discount and Final Rate -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 32px;">#</th>
          <th>${isBn ? 'ল্যাব টেস্ট / প্যাকেজের নাম ও বিবরণ' : 'Test / Package Description'}</th>
          <th class="text-right" style="width: 100px;">${isBn ? 'মূল রেট' : 'Main Rate'}</th>
          <th class="text-right" style="width: 110px;">${isBn ? 'ডিসকাউন্ট' : 'Discount'}</th>
          <th class="text-right" style="width: 110px;">${isBn ? 'চূড়ান্ত রেট' : 'Final Rate'}</th>
        </tr>
      </thead>
      <tbody>
        ${resolvedItems.map((item, index) => `
          <tr>
            <td style="color: #64748b;">${index + 1}</td>
            <td>
              <strong>${item.name}</strong>
              ${item.category ? `<span class="item-cat">${item.category}</span>` : ''}
            </td>
            <td class="text-right main-rate">৳ ${item.originalPrice}</td>
            <td class="text-right">
              ${item.discountAmount > 0 
                ? `<span class="discount-pill">-৳ ${item.discountAmount}</span>` 
                : `<span style="color: #94a3b8; font-size: 11px;">৳ ০</span>`
              }
            </td>
            <td class="text-right final-rate">৳ ${item.finalPrice}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Bill Summary with Home Sample Collection Fee, Discounts and Total -->
    <div class="summary-section">
      <div class="summary-table">
        <div class="summary-row">
          <span>${isBn ? 'মোট মূল মূল্য (Main Subtotal):' : 'Main Rate Subtotal:'}</span>
          <span style="font-weight: 600; color: #64748b;">৳ ${itemsMainSum}</span>
        </div>
        ${itemsDiscountSum > 0 ? `
        <div class="summary-row">
          <span style="color: #c2410c;">${isBn ? 'মোট ডিসকাউন্ট ছাড় (Total Savings):' : 'Total Discount:'}</span>
          <span style="color: #c2410c; font-weight: 700;">-৳ ${itemsDiscountSum}</span>
        </div>
        ` : ''}
        <div class="summary-row" style="border-top: 1px dashed #e2e8f0; padding-top: 5px; margin-top: 3px;">
          <span>${isBn ? 'টেস্টের নেট ফি (Net Tests Fee):' : 'Net Tests Fee:'}</span>
          <span style="font-weight: 700; color: #0f172a;">৳ ${itemsFinalSum}</span>
        </div>
        <div class="summary-row">
          <span>${isBn ? 'হোম স্যাম্পল কালেকশন ফি:' : 'Home Sample Collection Fee:'}</span>
          <span style="${collectionFee === 0 ? 'color: #16a34a; font-weight: 700;' : 'font-weight: 700; color: #0f172a;'}">
            ${collectionFee === 0 ? (isBn ? '৳ ০ (ফ্রি / Free)' : '৳ 0 (FREE)') : `৳ ${collectionFee}`}
          </span>
        </div>
        <div class="summary-row">
          <span>${isBn ? 'পেমেন্ট মেথড:' : 'Payment Method:'}</span>
          <span style="font-weight: 700; color: #0f172a; font-size: 11px;">${paymentDisplay}</span>
        </div>
        <div class="summary-row total-row">
          <span>${isBn ? 'সর্বমোট প্রদেয় বিল:' : 'Total Payable:'}</span>
          <span class="total-amount">৳ ${order.totalCost}</span>
        </div>
      </div>
    </div>

    <!-- Instructions / Notes -->
    <div class="instructions-box">
      <h5>${guidelinesTitle}</h5>
      <ul>
        ${guidelinesList.map(g => `<li>${g}</li>`).join('')}
      </ul>
    </div>

    <!-- Footer with Helpline & Official Stamp -->
    <div class="footer-row">
      <div class="contact-info">
        <strong>${orgName}</strong><br/>
        📍 ${orgAddress}<br/>
        📞 Hotline: ${orgHotline} | ✉️ ${orgEmail}<br/>
        🌐 ${orgWebsite}
      </div>
      <div class="seal-box">
        <div class="digital-seal">
          ${footerNote}
        </div>
        <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">
          Computer Generated • No Physical Signature Required
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
