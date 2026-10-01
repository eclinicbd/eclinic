import React, { useState } from 'react';
import { BookingHistoryItem, LabPartner, TestPackage, Language, StaffUser } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertCircle, 
  FlaskConical, 
  Plus, 
  Building2, 
  Eye, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Printer,
  Download,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  HeartPulse,
  Truck
} from 'lucide-react';
import { Button } from '../Button';
import { printOrDownloadInvoice } from '../../services/invoiceService';
import { formatOrderId } from '../BookingModal';

interface AdminOverviewProps {
  lang: Language;
  tests: TestPackage[];
  labs: LabPartner[];
  bookings: BookingHistoryItem[];
  canViewRevenue?: boolean;
  currentStaff?: StaffUser | null;
  onNavigateTab: (tab: 'overview' | 'orders' | 'reports' | 'tests' | 'packages' | 'categories' | 'labs' | 'customers' | 'settings') => void;
  onOpenAddTest: () => void;
  onOpenAddLab: () => void;
  onOpenAddOrder: () => void;
  onSelectOrder: (order: BookingHistoryItem) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  lang,
  tests,
  labs,
  bookings,
  canViewRevenue = true,
  currentStaff,
  onNavigateTab,
  onOpenAddTest,
  onOpenAddLab,
  onOpenAddOrder,
  onSelectOrder
}) => {
  const t = TRANSLATIONS[lang];
  const isBn = lang === 'bn';

  const totalRevenue = bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + b.totalCost : sum, 0);
  const totalOrders = bookings.length;
  const pendingOrders = bookings.filter(b => b.status === 'pending').length;
  const completedOrders = bookings.filter(b => b.status === 'completed').length;
  const inProgressOrders = bookings.filter(b => b.status === 'collected' || b.status === 'processing' || b.status === 'confirmed').length;
  const visibleLabs = labs.filter(l => !l.isHidden).length;
  const visibleTests = tests.filter(t => !t.isHidden).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center gap-1"><Clock size={11}/> {t.statusPending}</span>;
      case 'confirmed': 
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle size={11}/> {t.statusConfirmed}</span>;
      case 'collected': 
        return <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold flex items-center gap-1"><FlaskConical size={11}/> Collected</span>;
      case 'processing': 
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold flex items-center gap-1"><Sparkles size={11}/> Processing</span>;
      case 'completed': 
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle size={11}/> {t.statusCompleted}</span>;
      case 'cancelled': 
        return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle size={11}/> {t.statusCancelled}</span>;
      default: 
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentStaff?.role === 'phlebotomist' 
              ? (isBn ? 'ফ্লেবোটোমিস্ট পোর্টাল' : 'Phlebotomist Portal')
              : currentStaff?.role === 'nurse'
              ? (isBn ? 'নার্সিং সার্ভিস পোর্টাল' : 'Nurse Care Portal')
              : currentStaff?.role === 'delivery'
              ? (isBn ? 'রিপোর্ট ডেলিভারি পোর্টাল' : 'Report Delivery Portal')
              : t.adminDashboard}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {currentStaff?.assignedArea && currentStaff.assignedArea !== 'All Areas'
              ? (isBn 
                  ? `নির্ধারিত এরিয়া: "${currentStaff.assignedArea}" এর রোগীদের স্যাম্পল কালেকশন ও টেস্ট সেবা পরিচালনা করুন।` 
                  : `Managing assigned healthcare tasks in "${currentStaff.assignedArea}" area.`)
              : (isBn 
                  ? 'সেন্টার ও টেস্টের তালিকা, গ্রাহকদের বুকিং এবং রিপোর্ট ম্যানেজ করুন।' 
                  : 'Manage healthcare packages, sample collections, customer orders, and lab reports.')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onOpenAddOrder} className="!py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={15} /> {t.adminAddNewOrder}
          </Button>
          {canViewRevenue && (
            <>
              <Button onClick={onOpenAddTest} className="!py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Plus size={15} /> {t.adminAddNewTest}
              </Button>
              <button 
                onClick={onOpenAddLab}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Building2 size={15} /> {t.adminAddNewLab}
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue for Admin/Managers OR Operational Task Queue for Phleb/Nurse/Delivery */}
        {canViewRevenue ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer" onClick={() => onNavigateTab('orders')}>
            <div className="flex justify-between items-start mb-3">
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                <DollarSign size={22} />
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Live Revenue</span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{t.adminTotalRev}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">৳ {totalRevenue.toLocaleString()}</h3>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer" onClick={() => onNavigateTab('orders')}>
            <div className="flex justify-between items-start mb-3">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                {currentStaff?.role === 'phlebotomist' && <FlaskConical size={22} />}
                {currentStaff?.role === 'nurse' && <HeartPulse size={22} />}
                {currentStaff?.role === 'delivery' && <Truck size={22} />}
                {!['phlebotomist', 'nurse', 'delivery'].includes(currentStaff?.role || '') && <ShoppingBag size={22} />}
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                {isBn ? 'কাজের স্ট্যাটাস' : 'Task Status'}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              {currentStaff?.role === 'phlebotomist' 
                ? (isBn ? 'স্যাম্পল সংগ্রহ সম্পন্ন' : 'Samples Collected')
                : currentStaff?.role === 'nurse'
                ? (isBn ? 'নার্সিং সেবা সম্পন্ন' : 'Nursing Done')
                : currentStaff?.role === 'delivery'
                ? (isBn ? 'রিপোর্ট ডেলিভারি সম্পন্ন' : 'Reports Delivered')
                : (isBn ? 'সম্পন্ন টাস্ক' : 'Completed Tasks')}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {completedOrders} / {totalOrders}
            </h3>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer" onClick={() => onNavigateTab('orders')}>
          <div className="flex justify-between items-start mb-3">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <ShoppingBag size={22} />
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
              {canViewRevenue ? `${completedOrders} Completed` : (isBn ? 'মোট অ্যাসাইনকৃত' : 'Total Assigned')}
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            {canViewRevenue ? t.adminTotalOrders : (isBn ? 'আমার এরিয়ার অর্ডার' : 'My Area Orders')}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalOrders}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer" onClick={() => onNavigateTab('orders')}>
          <div className="flex justify-between items-start mb-3">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <AlertCircle size={22} />
            </div>
            {pendingOrders > 0 && (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md animate-pulse">
                {isBn ? 'অ্যাকশন প্রয়োজন' : 'Action Needed'}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            {isBn ? 'অপেক্ষমান অর্ডার (Pending)' : t.adminPendingOrders}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingOrders}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer" onClick={() => onNavigateTab('tests')}>
          <div className="flex justify-between items-start mb-3">
            <div className="bg-sky-50 p-3 rounded-xl text-sky-600">
              <FlaskConical size={22} />
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">{visibleLabs} Active Labs</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            {canViewRevenue ? 'Active Catalog Tests' : (isBn ? 'চলমান প্রসেসিং অর্ডার' : 'In Processing Queue')}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            {canViewRevenue ? `${visibleTests} / ${tests.length}` : `${inProgressOrders}`}
          </h3>
        </div>
      </div>

      {/* Analytics & Financial Reports Shortcut Banner - Only show when canViewRevenue is true */}
      {canViewRevenue && (
        <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-5 rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
              <BarChart3 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  {lang === 'bn' ? 'দৈনিক, সাপ্তাহিক, মাসিক ও বাৎসরিক রিপোর্ট' : 'Daily, Weekly, Monthly & Yearly Reports'}
                </h3>
                <span className="text-[10px] bg-sky-500 text-white font-black px-2 py-0.5 rounded-md uppercase">
                  Analytics
                </span>
              </div>
              <p className="text-xs text-sky-200/80 mt-0.5">
                {lang === 'bn' 
                  ? 'কোন সেন্টারে কত টাকার টেস্ট হয়েছে, কতগুলো টেস্ট সম্পন্ন হয়েছে তার পূর্ণাঙ্গ বিশ্লেষণ ও প্রিন্ট কপি।' 
                  : 'Center-wise revenue, tests volume, order breakdown, and downloadable PDF/CSV reports.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('reports')}
            className="px-4 py-2.5 bg-primary hover:bg-sky-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <span>{lang === 'bn' ? 'রিপোর্ট ও অ্যানালিটিক্স দেখুন' : 'Open Full Analytics'}</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-slate-700" />
            <h2 className="font-bold text-slate-900 text-base">
              {canViewRevenue ? t.adminRecentOrders : (isBn ? 'সাম্প্রতিক নির্ধারিত অর্ডারসমূহ' : 'Recent Assigned Orders')}
            </h2>
          </div>
          <Button variant="outline" className="!py-1.5 !px-3 !text-xs font-semibold" onClick={() => onNavigateTab('orders')}>
            View All Orders ({bookings.length})
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer Info</th>
                <th className="px-5 py-3">Diagnostic Center</th>
                <th className="px-5 py-3">Tests Booked</th>
                <th className="px-5 py-3">Status</th>
                {canViewRevenue && <th className="px-5 py-3 text-right">Amount</th>}
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={canViewRevenue ? 7 : 6} className="text-center py-8 text-slate-400 text-xs">No orders recorded yet.</td>
                </tr>
              ) : (
                bookings.slice(0, 5).map(booking => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 font-mono text-xs">{formatOrderId(booking.id)}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900 text-xs">{booking.customerName || 'Anonymous'}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10} /> {booking.customerPhone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-sky-600 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{booking.labName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs max-w-xs truncate">
                      {booking.testNames.join(', ')}
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(booking.status)}</td>
                    {canViewRevenue && (
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">৳ {booking.totalCost}</td>
                    )}
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => printOrDownloadInvoice(booking, lang)}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-bold transition-all border border-sky-100 flex items-center gap-1 cursor-pointer shadow-2xs"
                          title={lang === 'bn' ? 'ইনভয়েস ডাউনলোড / প্রিন্ট করুন' : 'Download / Print Invoice'}
                        >
                          <Printer size={13} />
                          <span>{lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}</span>
                        </button>
                        <button 
                          onClick={() => onSelectOrder(booking)} 
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostic Centers & Quick Instant Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnostic Centers List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={18} className="text-sky-600" />
              {t.adminManageLabs} ({labs.length})
            </h3>
            <button 
              onClick={() => onNavigateTab('labs')} 
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              Manage All Centers
            </button>
          </div>
          <div className="space-y-2.5">
            {labs.slice(0, 4).map(lab => (
              <div key={lab.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <img src={lab.logo} alt={lab.name} className="w-8 h-8 rounded-lg object-cover bg-white border border-slate-200" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">{lab.name}</p>
                    <p className="text-[10px] text-slate-500">⭐ {lab.rating} | 📍 {lab.location || 'Dhaka'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Service Charge</span>
                  <span className="font-bold text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">৳ {lab.serviceCharge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instant Controls Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-emerald-600" />
              Admin Instant Controls
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              সেন্টারের নাম, সার্ভিস চার্জ, টেস্টের রেট, বা নতুন ম্যানুয়াল অর্ডার তৈরি করলে তা তাৎক্ষণিকভাবে হোমপেজ, কার্ট এবং বুকিং সিস্টেমে সিঙ্ক হয়ে যাবে।
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={() => onNavigateTab('tests')}
                className="p-3 bg-sky-50 hover:bg-sky-100 rounded-xl text-left border border-sky-100 transition-colors"
              >
                <span className="text-xs font-bold text-sky-900 block">Edit Test Rates</span>
                <span className="text-[11px] text-sky-600">Update rates per lab</span>
              </button>
              <button 
                onClick={() => onNavigateTab('labs')}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-left border border-emerald-100 transition-colors"
              >
                <span className="text-xs font-bold text-emerald-900 block">Edit Service Charges</span>
                <span className="text-[11px] text-emerald-600">Change home sample fees</span>
              </button>
              <button 
                onClick={() => onNavigateTab('customers')}
                className="p-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-left border border-purple-100 transition-colors"
              >
                <span className="text-xs font-bold text-purple-900 block">Customer Directory</span>
                <span className="text-[11px] text-purple-600">View patients list</span>
              </button>
              <button 
                onClick={() => onNavigateTab('settings')}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-left border border-slate-200 transition-colors"
              >
                <span className="text-xs font-bold text-slate-900 block">Backup & Settings</span>
                <span className="text-[11px] text-slate-600">Export / restore JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
