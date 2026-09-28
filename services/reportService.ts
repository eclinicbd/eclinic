import { BookingHistoryItem, Language } from '../types';

export interface ReportDataParams {
  timeframeLabel: string;
  selectedLab: string;
  selectedStatus: string;
  stats: {
    totalRevenue: number;
    completedRevenue: number;
    totalOrders: number;
    totalTestsCount: number;
    pendingCount: number;
    completedCount: number;
    cancelledCount: number;
    avgOrderValue: number;
    completionRate: number;
  };
  labBreakdown: Array<{
    labName: string;
    ordersCount: number;
    testsCount: number;
    totalRevenue: number;
    completedCount: number;
    pendingCount: number;
  }>;
  popularTests: Array<{
    name: string;
    count: number;
    estimatedRevenue: number;
  }>;
  timelineBreakdown: Array<{
    date: string;
    ordersCount: number;
    testsCount: number;
    revenue: number;
  }>;
  bookings: BookingHistoryItem[];
  lang: Language;
}

/**
 * Generate full HTML document for Executive Diagnostic & Financial Report
 */
export const generateExecutiveReportHtml = (params: ReportDataParams): string => {
  const {
    timeframeLabel,
    selectedLab,
    selectedStatus,
    stats,
    labBreakdown,
    popularTests,
    timelineBreakdown,
    bookings,
    lang
  } = params;

  const isBn = lang === 'bn';
  const generatedAt = new Date().toLocaleString(isBn ? 'bn-BD' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  return `
<!DOCTYPE html>
<html lang="${isBn ? 'bn' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>Diagnostic Financial Report - eClinic Bangladesh</title>
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
      color: #0f172a;
      padding: 24px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .report-container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px 40px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 44px;
      height: 44px;
      background: #0284c7;
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 900;
    }

    .brand-text h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .brand-text h1 span {
      color: #0284c7;
    }

    .brand-text p {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
    }

    .report-badge {
      text-align: right;
    }

    .report-badge h2 {
      font-size: 16px;
      font-weight: 800;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .report-badge .meta-item {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
      padding: 10px 14px;
      background: #f1f5f9;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      color: #334155;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
    }

    .kpi-card.highlight {
      background: #f0f9ff;
      border-color: #bae6fd;
    }

    .kpi-title {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .kpi-value {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }

    .kpi-sub {
      font-size: 10px;
      color: #0284c7;
      font-weight: 600;
      margin-top: 2px;
    }

    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      margin-top: 24px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    table.data-table th {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #cbd5e1;
    }

    table.data-table td {
      padding: 10px 12px;
      font-size: 12px;
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
    }

    table.data-table tr:nth-child(even) td {
      background: #fafafa;
    }

    table.data-table td.text-right,
    table.data-table th.text-right {
      text-align: right;
    }

    table.data-table td.text-center,
    table.data-table th.text-center {
      text-align: center;
    }

    .progress-bar-bg {
      width: 100%;
      background: #e2e8f0;
      height: 6px;
      border-radius: 99px;
      overflow: hidden;
      margin-top: 4px;
    }

    .progress-bar-fill {
      background: #0284c7;
      height: 100%;
      border-radius: 99px;
    }

    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 10px;
    }

    .footer-bar {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }

    .official-seal {
      border: 1px dashed #0284c7;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      color: #0284c7;
      text-transform: uppercase;
    }

    @media print {
      body {
        background: transparent;
        padding: 0;
      }
      .report-container {
        border: none;
        box-shadow: none;
        padding: 10px;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>

  <div class="report-container">
    <!-- Header -->
    <div class="header-bar">
      <div class="brand-logo">
        <div class="brand-icon">+</div>
        <div class="brand-text">
          <h1>eClinic<span>BD</span></h1>
          <p>${isBn ? 'ডিজিটাল ডায়াগনস্টিক ও হেলথকেয়ার নেটওয়ার্ক' : 'Digital Diagnostic & Healthcare Platform'}</p>
        </div>
      </div>
      <div class="report-badge">
        <h2>${isBn ? 'ডায়াগনস্টিক আর্থিক ও টেস্ট রিপোর্ট' : 'Diagnostic Financial & Operations Report'}</h2>
        <div class="meta-item">${isBn ? 'সময়কাল:' : 'Period:'} <strong>${timeframeLabel}</strong></div>
        <div class="meta-item">${isBn ? 'রিপোর্ট তৈরির সময়:' : 'Generated:'} ${generatedAt}</div>
      </div>
    </div>

    <!-- Filter Meta -->
    <div class="filter-tags">
      <span>🗓️ ${isBn ? 'ফিল্টার সময়কাল:' : 'Timeframe:'} ${timeframeLabel}</span>
      <span>🏥 ${isBn ? 'সেন্টার ফিল্টার:' : 'Center Filter:'} ${selectedLab === 'all' ? (isBn ? 'সকল ল্যাব সেন্টার' : 'All Diagnostic Centers') : selectedLab}</span>
      <span>⚡ ${isBn ? 'স্ট্যাটাস:' : 'Status:'} ${selectedStatus === 'all' ? (isBn ? 'সকল স্ট্যাটাস' : 'All Statuses') : selectedStatus.toUpperCase()}</span>
      <span>📦 ${isBn ? 'মোট ডেটা রেকর্ড:' : 'Records Count:'} ${bookings.length} ${isBn ? 'টি অর্ডার' : 'orders'}</span>
    </div>

    <!-- KPI Metric Cards -->
    <div class="kpi-grid">
      <div class="kpi-card highlight">
        <div class="kpi-title">${isBn ? 'সর্বমোট টেস্টের আয় (Revenue)' : 'Total Revenue'}</div>
        <div class="kpi-value">৳ ${stats.totalRevenue.toLocaleString()}</div>
        <div class="kpi-sub">${isBn ? 'সম্পন্ন টেস্ট থেকে আদায়:' : 'Completed Tests:'} ৳ ${stats.completedRevenue.toLocaleString()}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-title">${isBn ? 'মোট বুকিং ও অর্ডার' : 'Total Orders'}</div>
        <div class="kpi-value">${stats.totalOrders}</div>
        <div class="kpi-sub">${stats.completionRate}% ${isBn ? 'সফলভাবে সম্পন্ন' : 'completion rate'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-title">${isBn ? 'মোট সম্পাদিত টেস্ট' : 'Tests Volume'}</div>
        <div class="kpi-value">${stats.totalTestsCount}</div>
        <div class="kpi-sub">${isBn ? 'সকল টেস্ট আইটেম মিলিয়ে' : 'Across all booked tests'}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-title">${isBn ? 'গড় অর্ডার মূল্য (AOV)' : 'Average Order Value'}</div>
        <div class="kpi-value">৳ ${stats.avgOrderValue}</div>
        <div class="kpi-sub">${isBn ? 'প্রতি অ্যাপয়েন্টমেন্টে গড় বিল' : 'Average ticket price'}</div>
      </div>
    </div>

    <!-- Diagnostic Center Performance Breakdown -->
    <div class="section-title">
      🏥 ${isBn ? 'ডায়াগনস্টিক সেন্টার ভিত্তিক আয় ও টেস্টের বিবরণ' : 'Diagnostic Center Breakdown'}
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>${isBn ? 'ডায়াগনস্টিক ল্যাব সেন্টারের নাম' : 'Diagnostic Center Name'}</th>
          <th class="text-center">${isBn ? 'মোট অর্ডার' : 'Total Orders'}</th>
          <th class="text-center">${isBn ? 'সম্পাদিত টেস্ট' : 'Tests Count'}</th>
          <th class="text-right">${isBn ? 'সর্বমোট আয় (টাকা)' : 'Total Revenue (BDT)'}</th>
          <th class="text-center" style="width: 120px;">${isBn ? 'মার্কেট শেয়ার' : 'Share %'}</th>
        </tr>
      </thead>
      <tbody>
        ${labBreakdown.length === 0 ? `
          <tr><td colspan="6" class="text-center" style="padding: 20px; color: #94a3b8;">No diagnostic center records in this period.</td></tr>
        ` : labBreakdown.map((lab, i) => {
          const share = stats.totalRevenue > 0 ? Math.round((lab.totalRevenue / stats.totalRevenue) * 100) : 0;
          return `
            <tr>
              <td style="color: #94a3b8; font-weight: 700;">${i + 1}</td>
              <td><strong>${lab.labName}</strong></td>
              <td class="text-center">${lab.ordersCount}</td>
              <td class="text-center">${lab.testsCount}</td>
              <td class="text-right" style="font-weight: 800; color: #0f172a;">৳ ${lab.totalRevenue.toLocaleString()}</td>
              <td>
                <div style="font-weight: 700; text-align: center; color: #0284c7;">${share}%</div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${Math.max(5, share)}%;"></div>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <!-- 2 Column: Popular Tests & Daily Timeline -->
    <div class="two-col-grid">
      <!-- Popular Tests -->
      <div>
        <div class="section-title">
          🔬 ${isBn ? 'সর্বাধিক বুক হওয়া জনপ্রিয় টেস্টসমূহ' : 'Top Booked Tests'}
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>${isBn ? 'টেস্টের নাম' : 'Test Name'}</th>
              <th class="text-center">${isBn ? 'সংখ্যা' : 'Count'}</th>
              <th class="text-right">${isBn ? 'আয় (টাকা)' : 'Revenue'}</th>
            </tr>
          </thead>
          <tbody>
            ${popularTests.slice(0, 6).map((tItem) => `
              <tr>
                <td><strong>${tItem.name}</strong></td>
                <td class="text-center" style="font-weight: 700; color: #0284c7;">${tItem.count}</td>
                <td class="text-right" style="font-weight: 800;">৳ ${tItem.estimatedRevenue.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Daily Timeline -->
      <div>
        <div class="section-title">
          📅 ${isBn ? 'তারিখ ভিত্তিক দৈনিক বিবরণ' : 'Daily Timeline Summary'}
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>${isBn ? 'তারিখ' : 'Date'}</th>
              <th class="text-center">${isBn ? 'অর্ডার' : 'Orders'}</th>
              <th class="text-right">${isBn ? 'মোট আয়' : 'Revenue'}</th>
            </tr>
          </thead>
          <tbody>
            ${timelineBreakdown.slice(-6).map((item) => `
              <tr>
                <td><strong>${item.date}</strong></td>
                <td class="text-center">${item.ordersCount} (${item.testsCount} tests)</td>
                <td class="text-right" style="font-weight: 800; color: #0284c7;">৳ ${item.revenue.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-bar">
      <div>
        <strong>eClinic Bangladesh Administration System</strong> • Confidential Financial & Operations Report<br/>
        Hotline: +880 9613-828282 | Dhaka, Bangladesh
      </div>
      <div class="official-seal">
        ✓ Verified Official Report
      </div>
    </div>
  </div>

</body>
</html>
`;
};

/**
 * Trigger robust print / save PDF for executive report
 */
export const printExecutiveReport = (params: ReportDataParams): void => {
  const htmlContent = generateExecutiveReportHtml(params);
  const printWindow = window.open('', '_blank', 'width=980,height=900');

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 450);
  } else {
    // Fallback if popup blocker intercepted
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
 * Robust CSV Downloader using Blob & UTF-8 BOM for Excel compatibility
 */
export const exportReportToCSV = (params: ReportDataParams): void => {
  const { timeframeLabel, stats, labBreakdown, bookings } = params;

  const lines: string[] = [];

  // Report metadata headers
  lines.push(`"eClinic Bangladesh - Diagnostic & Financial Analytics Report"`);
  lines.push(`"Report Timeframe:","${timeframeLabel}"`);
  lines.push(`"Generated At:","${new Date().toISOString()}"`);
  lines.push(`"Total Revenue (BDT):","${stats.totalRevenue}"`);
  lines.push(`"Total Bookings:","${stats.totalOrders}"`);
  lines.push(`"Total Tests Conducted:","${stats.totalTestsCount}"`);
  lines.push(`"Average Order Value:","${stats.avgOrderValue}"`);
  lines.push('');

  // Diagnostic Center Breakdown Section
  lines.push(`"--- DIAGNOSTIC CENTER BREAKDOWN ---"`);
  lines.push(`"Center Name","Total Orders","Total Tests","Total Revenue (BDT)","Market Share %"`);
  labBreakdown.forEach(l => {
    const share = stats.totalRevenue > 0 ? Math.round((l.totalRevenue / stats.totalRevenue) * 100) : 0;
    lines.push(`"${l.labName.replace(/"/g, '""')}","${l.ordersCount}","${l.testsCount}","${l.totalRevenue}","${share}%"`);
  });
  lines.push('');

  // Itemized Orders list
  lines.push(`"--- ITEMIZE BOOKING RECORDS ---"`);
  lines.push(`"Order ID","Date","Customer Name","Phone","Diagnostic Center","Tests Count","Tests Names","Status","Total Bill (BDT)"`);
  bookings.forEach(b => {
    const cleanId = (b.id || '').replace(/^#?EC-?/i, '').replace(/^#?BK-?/i, '').replace(/^#/, '');
    lines.push([
      `"${cleanId}"`,
      `"${b.date || ''}"`,
      `"${(b.customerName || 'Anonymous').replace(/"/g, '""')}"`,
      `"${(b.customerPhone || '').replace(/"/g, '""')}"`,
      `"${(b.labName || '').replace(/"/g, '""')}"`,
      b.testNames?.length || 1,
      `"${(b.testNames || []).join('; ').replace(/"/g, '""')}"`,
      `"${b.status}"`,
      b.totalCost
    ].join(','));
  });

  const csvString = lines.join('\r\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `eclinic_diagnostic_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
};

export interface OrdersListReportParams {
  orders: BookingHistoryItem[];
  filterLabel?: string;
  startDate?: string;
  endDate?: string;
  statusFilter?: string;
  labFilter?: string;
  totalRevenue: number;
  lang: Language;
}

/**
 * Generate and Print Itemized Orders List Report with Serial Numbers
 */
export const printOrdersListReport = (params: OrdersListReportParams): void => {
  const {
    orders,
    filterLabel,
    startDate,
    endDate,
    statusFilter = 'All',
    labFilter = 'All',
    totalRevenue,
    lang
  } = params;

  const isBn = lang === 'bn';
  const generatedAt = new Date().toLocaleString(isBn ? 'bn-BD' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const htmlContent = `
<!DOCTYPE html>
<html lang="${isBn ? 'bn' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>Orders List Report - eClinic Bangladesh</title>
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
      color: #0f172a;
      padding: 20px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .report-card {
      max-width: 960px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }

    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 18px;
      margin-bottom: 18px;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
    }

    .brand-title span {
      color: #0284c7;
    }

    .sub-title {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .meta-box {
      text-align: right;
    }

    .meta-box h2 {
      font-size: 15px;
      font-weight: 800;
      color: #0284c7;
      text-transform: uppercase;
    }

    .meta-box .date-text {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }

    .summary-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      background: #f1f5f9;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      justify-content: space-between;
      align-items: center;
    }

    .badge-pill {
      background: #ffffff;
      padding: 4px 10px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
    }

    table.orders-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 11px;
    }

    table.orders-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-transform: uppercase;
      padding: 10px 8px;
      text-align: left;
      border-bottom: 2px solid #cbd5e1;
    }

    table.orders-table td {
      padding: 9px 8px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    table.orders-table tr:nth-child(even) td {
      background: #fafafa;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 10px;
      font-weight: 700;
      text-transform: capitalize;
    }

    .status-completed { background: #dcfce7; color: #15803d; }
    .status-pending { background: #fef9c3; color: #854d0e; }
    .status-confirmed { background: #e0f2fe; color: #0369a1; }
    .status-collected { background: #ede9fe; color: #6d28d9; }
    .status-processing { background: #f3e8ff; color: #7e22ce; }
    .status-cancelled { background: #ffe4e6; color: #be123c; }

    .footer-note {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }

    @media print {
      body {
        background: transparent;
        padding: 0;
      }
      .report-card {
        border: none;
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="report-card">
    <!-- Header -->
    <div class="header-box">
      <div>
        <h1 class="brand-title">eClinic<span>BD</span></h1>
        <p class="sub-title">${isBn ? 'ল্যাব বুকিং ও কাস্টমার অর্ডার তালিকা' : 'Diagnostic Orders & Patient Bookings'}</p>
      </div>
      <div class="meta-box">
        <h2>${isBn ? 'অর্ডার তালিকা রিপোর্ট' : 'Orders List Report'}</h2>
        <div class="date-text">${isBn ? 'প্রিন্টের সময়:' : 'Generated:'} ${generatedAt}</div>
      </div>
    </div>

    <!-- Summary strip -->
    <div class="summary-strip">
      <div>
        <span>📦 ${isBn ? 'মোট অর্ডার:' : 'Total Orders:'} <strong>${orders.length}</strong> ${isBn ? 'টি' : 'items'}</span>
        ${(startDate || endDate) ? `<span style="margin-left: 10px;" class="badge-pill">📅 ${startDate || 'Start'} ➔ ${endDate || 'End'}</span>` : ''}
        ${labFilter !== 'All' ? `<span style="margin-left: 8px;" class="badge-pill">🏥 ${labFilter}</span>` : ''}
        ${statusFilter !== 'All' ? `<span style="margin-left: 8px;" class="badge-pill">⚡ ${statusFilter}</span>` : ''}
      </div>
      <div>
        <span>💰 ${isBn ? 'মোট আয়ের পরিমাণ:' : 'Total Amount:'} <strong style="color: #0284c7; font-size: 13px;">৳ ${totalRevenue.toLocaleString()}</strong></span>
      </div>
    </div>

    <!-- Orders Table with Serial Numbers -->
    <table class="orders-table">
      <thead>
        <tr>
          <th style="width: 35px; text-align: center;">SL</th>
          <th style="width: 80px;">Order ID</th>
          <th style="width: 90px;">Date & Time</th>
          <th>Customer Details</th>
          <th>Diagnostic Center & Tests</th>
          <th style="width: 85px; text-align: center;">Status</th>
          <th style="width: 75px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${orders.length === 0 ? `
          <tr><td colspan="7" style="text-align: center; padding: 25px; color: #94a3b8;">No orders recorded in this filter criteria.</td></tr>
        ` : orders.map((b, index) => {
          const cleanId = (b.id || '').replace(/^#?EC-?/i, '').replace(/^#?BK-?/i, '').replace(/^#/, '');
          return `
          <tr>
            <td style="text-align: center; font-weight: 800; color: #64748b;">${index + 1}</td>
            <td style="font-weight: 700; color: #0f172a; font-family: monospace;">${cleanId}</td>
            <td>
              <div style="font-weight: 600;">${b.date}</div>
              <div style="color: #64748b; font-size: 10px;">${b.time}</div>
            </td>
            <td>
              <div style="font-weight: 700; color: #0f172a;">${b.customerName || 'Anonymous'}</div>
              <div style="color: #64748b; font-size: 10px;">📞 ${b.customerPhone || 'N/A'}</div>
              ${b.customerAddress ? `<div style="color: #94a3b8; font-size: 9px;">📍 ${b.customerAddress}</div>` : ''}
            </td>
            <td>
              <div style="font-weight: 700; color: #0284c7;">${b.labName}</div>
              <div style="color: #475569; font-size: 10px;">${(b.testNames || []).join(', ')}</div>
            </td>
            <td style="text-align: center;">
              <span class="status-badge status-${b.status || 'pending'}">${b.status}</span>
            </td>
            <td style="text-align: right; font-weight: 800; color: #0f172a;">৳ ${b.totalCost}</td>
          </tr>
        `;
        }).join('')}
      </tbody>
    </table>

    <!-- Footer -->
    <div class="footer-note">
      <div>
        <strong>eClinic Bangladesh</strong> • Official Admin Orders Registry<br/>
        Hotline: +880 9613-828282 | Dhaka, Bangladesh
      </div>
      <div>
        ✓ Verified Document
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank', 'width=980,height=900');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 450);
  } else {
    // Fallback if popup blocker intercepted
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

