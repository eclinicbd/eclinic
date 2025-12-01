
import React, { useState } from 'react';
import { Language, BookingHistoryItem, ReportItem, UserProfile } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileText, 
  User, 
  LogOut, 
  ChevronRight, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  Activity
} from 'lucide-react';
import { Button } from './Button';

interface UserDashboardProps {
  lang: Language;
  onLogout: () => void;
}

// Mock Data
const MOCK_USER: UserProfile = {
  name: "Rahim Ahmed",
  phone: "01712345678",
  email: "rahim@example.com",
  address: "House 12, Road 5, Dhanmondi, Dhaka",
  avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100"
};

const MOCK_BOOKINGS: BookingHistoryItem[] = [
  {
    id: "BK-1001",
    date: "2024-03-20",
    time: "10:00 AM - 11:00 AM",
    labName: "Popular Diagnostic Centre Ltd.",
    testNames: ["CBC", "Lipid Profile"],
    totalCost: 1650,
    status: "pending"
  },
  {
    id: "BK-0998",
    date: "2024-03-15",
    time: "08:00 AM - 09:00 AM",
    labName: "Labaid Diagnostics Center",
    testNames: ["Diabetes Checkup (HbA1c)"],
    totalCost: 1000,
    status: "completed"
  },
  {
    id: "BK-0990",
    date: "2024-02-28",
    time: "05:00 PM - 06:00 PM",
    labName: "BIRDEM General Hospital",
    testNames: ["Vitamin D Test"],
    totalCost: 2200,
    status: "cancelled"
  }
];

const MOCK_REPORTS: ReportItem[] = [
  {
    id: "RPT-0998",
    testName: "Diabetes Checkup (HbA1c)",
    date: "2024-03-16",
    labName: "Labaid Diagnostics Center",
    downloadUrl: "#"
  },
  {
    id: "RPT-0850",
    testName: "Complete Blood Count (CBC)",
    date: "2024-01-10",
    labName: "Popular Diagnostic Centre Ltd.",
    downloadUrl: "#"
  }
];

export const UserDashboard: React.FC<UserDashboardProps> = ({ lang, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'reports' | 'profile'>('overview');
  const t = TRANSLATIONS[lang];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> {t.statusPending}</span>;
      case 'confirmed': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> {t.statusConfirmed}</span>;
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> {t.statusCompleted}</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> {t.statusCancelled}</span>;
      default: return null;
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activeTab === id 
          ? 'bg-primary text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {activeTab === id && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-64px)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
        
        {/* Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 h-fit">
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-100">
            <img src={MOCK_USER.avatar} alt="User" className="w-20 h-20 rounded-full border-4 border-slate-50 mb-3" />
            <h3 className="font-bold text-slate-800 text-lg">{MOCK_USER.name}</h3>
            <p className="text-slate-500 text-sm">{MOCK_USER.phone}</p>
          </div>
          
          <nav className="space-y-1">
            <SidebarItem id="overview" icon={LayoutDashboard} label={t.dashOverview} />
            <SidebarItem id="bookings" icon={CalendarDays} label={t.dashBookings} />
            <SidebarItem id="reports" icon={FileText} label={t.dashReports} />
            <SidebarItem id="profile" icon={User} label={t.dashProfile} />
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all mt-6"
            >
              <LogOut size={20} />
              <span className="font-medium">{t.dashLogout}</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{t.dashWelcome} {MOCK_USER.name.split(' ')[0]} 👋</h2>
                  <p className="text-slate-500">Here is your health activity summary.</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">{t.dashStatTests}</p>
                    <h4 className="text-2xl font-bold text-slate-800">{MOCK_BOOKINGS.length}</h4>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="bg-yellow-50 p-3 rounded-full text-yellow-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">{t.dashStatPending}</p>
                    <h4 className="text-2xl font-bold text-slate-800">
                      {MOCK_BOOKINGS.filter(b => b.status === 'pending').length}
                    </h4>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="bg-green-50 p-3 rounded-full text-green-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Reports Ready</p>
                    <h4 className="text-2xl font-bold text-slate-800">{MOCK_REPORTS.length}</h4>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t.dashRecentActivity}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {MOCK_BOOKINGS.slice(0, 3).map(booking => (
                    <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <CalendarDays className="text-slate-500" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{booking.labName}</p>
                          <p className="text-xs text-slate-500">{booking.date} • {booking.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(booking.status)}
                        <p className="text-xs font-bold text-slate-700 mt-1">৳ {booking.totalCost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">{t.dashBookings}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-3">Booking ID</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Lab Name</th>
                      <th className="px-4 py-3">Tests</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_BOOKINGS.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">#{booking.id}</td>
                        <td className="px-4 py-3 text-slate-600">{booking.date}<br/><span className="text-xs">{booking.time}</span></td>
                        <td className="px-4 py-3 text-slate-600">{booking.labName}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{booking.testNames.join(', ')}</td>
                        <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">৳ {booking.totalCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {MOCK_REPORTS.map(report => (
                <div key={report.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-50 p-3 rounded-lg text-red-500">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{report.testName}</h4>
                      <p className="text-sm text-slate-500">{report.labName}</p>
                      <p className="text-xs text-slate-400 mt-1">Generated on: {report.date}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2 text-xs">
                    <Download size={16} /> {t.dashDownload}
                  </Button>
                </div>
              ))}
              {MOCK_REPORTS.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t.dashNoData}</p>
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">{t.dashProfile}</h3>
              <form className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.nameLabel}</label>
                  <input type="text" defaultValue={MOCK_USER.name} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.phoneLabel}</label>
                  <input type="text" defaultValue={MOCK_USER.phone} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" defaultValue={MOCK_USER.email} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t.addrLabel}</label>
                  <textarea defaultValue={MOCK_USER.address} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="pt-4">
                  <Button>{t.confirmBtn.split(' ')[0]} Update</Button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
