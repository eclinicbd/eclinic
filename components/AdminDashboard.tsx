
import React, { useState } from 'react';
import { Language, BookingHistoryItem, TestPackage } from '../types';
import { TRANSLATIONS } from '../translations';
import { getTests } from '../constants';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FlaskConical, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Search,
  Plus
} from 'lucide-react';
import { Button } from './Button';

interface AdminDashboardProps {
  lang: Language;
  onLogout: () => void;
}

// Mock Data for Admin
const MOCK_ADMIN_BOOKINGS: BookingHistoryItem[] = [
  {
    id: "BK-2025",
    customerName: "Rahim Ahmed",
    customerPhone: "01712345678",
    date: "2024-03-22",
    time: "10:00 AM - 11:00 AM",
    labName: "Popular Diagnostic Centre Ltd.",
    testNames: ["CBC", "Lipid Profile"],
    totalCost: 1650,
    status: "pending"
  },
  {
    id: "BK-2024",
    customerName: "Karim Uddin",
    customerPhone: "01812345678",
    date: "2024-03-22",
    time: "11:00 AM - 12:00 PM",
    labName: "Labaid Diagnostics Center",
    testNames: ["Diabetes Checkup (HbA1c)"],
    totalCost: 1000,
    status: "confirmed"
  },
  {
    id: "BK-2023",
    customerName: "Salma Begum",
    customerPhone: "01912345678",
    date: "2024-03-21",
    time: "09:00 AM - 10:00 AM",
    labName: "BIRDEM General Hospital",
    testNames: ["Vitamin D Test", "Thyroid Profile"],
    totalCost: 3700,
    status: "completed"
  },
  {
    id: "BK-2022",
    customerName: "Tanvir Hasan",
    customerPhone: "01612345678",
    date: "2024-03-21",
    time: "02:00 PM - 03:00 PM",
    labName: "BSMMU (PG)",
    testNames: ["CBC"],
    totalCost: 300,
    status: "cancelled"
  }
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'tests' | 'users'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const t = TRANSLATIONS[lang];
  const allTests = getTests(lang);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> {t.statusPending}</span>;
      case 'confirmed': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> {t.statusConfirmed}</span>;
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> {t.statusCompleted}</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={12}/> {t.statusCancelled}</span>;
      default: return null;
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activeTab === id 
          ? 'bg-secondary text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
      {activeTab === id && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 h-auto md:h-screen sticky top-0 md:flex flex-col z-20 hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-secondary p-2 rounded-lg">
              <FlaskConical className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800 leading-tight">LabHome BD</h2>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Admin Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 flex-grow">
          <SidebarItem id="overview" icon={LayoutDashboard} label={t.dashOverview} />
          <SidebarItem id="orders" icon={ShoppingBag} label={t.adminTotalOrders} />
          <SidebarItem id="tests" icon={FlaskConical} label={t.adminManageTests} />
          <SidebarItem id="users" icon={Users} label={t.adminCustomers} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">{t.dashLogout}</span>
          </button>
        </div>
      </div>

      {/* Mobile Header (Only visible on mobile) */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
         <div className="flex items-center gap-2">
            <div className="bg-secondary p-1.5 rounded-lg">
              <FlaskConical className="text-white" size={16} />
            </div>
            <span className="font-bold text-slate-800">Admin Panel</span>
         </div>
         <Button onClick={onLogout} variant="outline" className="!py-1 !px-3 !text-xs">Logout</Button>
      </div>
      
      {/* Mobile Nav Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 overflow-x-auto">
        <div className="flex p-2 gap-2 min-w-max">
           <button onClick={() => setActiveTab('overview')} className={`px-3 py-1.5 rounded-full text-sm font-medium ${activeTab === 'overview' ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-600'}`}>Overview</button>
           <button onClick={() => setActiveTab('orders')} className={`px-3 py-1.5 rounded-full text-sm font-medium ${activeTab === 'orders' ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-600'}`}>Orders</button>
           <button onClick={() => setActiveTab('tests')} className={`px-3 py-1.5 rounded-full text-sm font-medium ${activeTab === 'tests' ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-600'}`}>Tests</button>
           <button onClick={() => setActiveTab('users')} className={`px-3 py-1.5 rounded-full text-sm font-medium ${activeTab === 'users' ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-600'}`}>Users</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-8 overflow-y-auto">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">{t.dashOverview}</h2>
              <span className="text-sm text-slate-500">{new Date().toDateString()}</span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                    <DollarSign size={24} />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">{t.adminTotalRev}</p>
                <h3 className="text-2xl font-bold text-slate-800">৳ 24,500</h3>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
                    <ShoppingBag size={24} />
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">{t.adminTotalOrders}</p>
                <h3 className="text-2xl font-bold text-slate-800">142</h3>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600">
                    <AlertCircle size={24} />
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">{t.adminPendingOrders}</p>
                <h3 className="text-2xl font-bold text-slate-800">15</h3>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-teal-50 p-3 rounded-lg text-teal-600">
                    <Users size={24} />
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">{t.adminCustomers}</p>
                <h3 className="text-2xl font-bold text-slate-800">1,204</h3>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">{t.adminRecentOrders}</h3>
                <Button variant="outline" className="!py-1.5 !px-3 !text-xs" onClick={() => setActiveTab('orders')}>View All</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Order ID</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Lab</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_ADMIN_BOOKINGS.map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-800">#{booking.id}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-800">{booking.customerName}</p>
                          <p className="text-xs text-slate-500">{booking.customerPhone}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{booking.labName}</td>
                        <td className="px-5 py-3">{getStatusBadge(booking.status)}</td>
                        <td className="px-5 py-3 text-right font-bold text-slate-800">৳ {booking.totalCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-800">{t.adminTotalOrders}</h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-grow md:flex-grow-0">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search orders..." 
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-secondary outline-none w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Order ID</th>
                      <th className="px-5 py-3">Date & Time</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Lab & Tests</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_ADMIN_BOOKINGS.filter(b => 
                      b.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      b.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(booking => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-800">#{booking.id}</td>
                        <td className="px-5 py-3 text-slate-600">{booking.date}<br/><span className="text-xs">{booking.time}</span></td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-800">{booking.customerName}</p>
                          <p className="text-xs text-slate-500">{booking.customerPhone}</p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                           <p className="font-medium text-xs text-primary">{booking.labName}</p>
                           <p className="text-xs truncate max-w-[150px]">{booking.testNames.join(', ')}</p>
                        </td>
                        <td className="px-5 py-3">{getStatusBadge(booking.status)}</td>
                        <td className="px-5 py-3 text-right font-bold text-slate-800">৳ {booking.totalCost}</td>
                        <td className="px-5 py-3 text-center">
                          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TESTS MANAGEMENT */}
        {activeTab === 'tests' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">{t.adminManageTests}</h2>
              <Button className="!py-2 !px-4 flex items-center gap-2">
                <Plus size={16} /> Add New Test
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTests.map(test => (
                <div key={test.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex gap-4 mb-4">
                    <img src={test.image} alt={test.name} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{test.name}</h4>
                      <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        {test.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-grow">{test.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                    <span className="font-bold text-slate-800">৳ {test.price}</span>
                    <button className="text-xs font-bold text-primary hover:underline">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
