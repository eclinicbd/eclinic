import React, { useState } from 'react';
import { BookingHistoryItem, LabPartner, Language, BookingStatus } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  Search, 
  Plus, 
  Download, 
  Eye, 
  Trash2, 
  Phone, 
  MapPin, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FlaskConical, 
  Sparkles,
  Edit2,
  Filter
} from 'lucide-react';
import { Button } from '../Button';

interface AdminOrdersProps {
  lang: Language;
  bookings: BookingHistoryItem[];
  labs: LabPartner[];
  onUpdateStatus: (orderId: string, status: BookingStatus) => void;
  onSelectOrder: (order: BookingHistoryItem) => void;
  onOpenEditOrder: (order: BookingHistoryItem) => void;
  onOpenAddOrder: () => void;
  onOpenDeleteOrder: (order: BookingHistoryItem) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  lang,
  bookings,
  labs,
  onUpdateStatus,
  onSelectOrder,
  onOpenEditOrder,
  onOpenAddOrder,
  onOpenDeleteOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [labFilter, setLabFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');

  const t = TRANSLATIONS[lang];

  // Filtering
  const filtered = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      b.id.toLowerCase().includes(term) ||
      (b.customerName && b.customerName.toLowerCase().includes(term)) ||
      (b.customerPhone && b.customerPhone.includes(term)) ||
      (b.customerAddress && b.customerAddress.toLowerCase().includes(term)) ||
      b.labName.toLowerCase().includes(term) ||
      b.testNames.some(t => t.toLowerCase().includes(term));

    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchLab = labFilter === 'All' || b.labId === labFilter || b.labName === labFilter;

    return matchSearch && matchStatus && matchLab;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return (b.createdAt || b.date) > (a.createdAt || a.date) ? 1 : -1;
    if (sortBy === 'oldest') return (a.createdAt || a.date) > (b.createdAt || b.date) ? 1 : -1;
    if (sortBy === 'amount_high') return b.totalCost - a.totalCost;
    if (sortBy === 'amount_low') return a.totalCost - b.totalCost;
    return 0;
  });

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Time', 'Customer Name', 'Phone', 'Address', 'Diagnostic Center', 'Tests Booked', 'Status', 'Total Bill (BDT)'];
    const rows = sorted.map(b => [
      b.id,
      b.date,
      b.time,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.customerPhone || ''}"`,
      `"${(b.customerAddress || '').replace(/"/g, '""')}"`,
      `"${b.labName.replace(/"/g, '""')}"`,
      `"${b.testNames.join('; ').replace(/"/g, '""')}"`,
      b.status,
      b.totalCost
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `labhome_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{t.adminTotalOrders}</h1>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {bookings.length}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">Manage customer test appointments, update status, and print receipts.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Button onClick={onOpenAddOrder} className="!py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus size={15} /> {t.adminAddNewOrder}
          </Button>

          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Export orders as CSV"
          >
            <Download size={14} /> {t.adminExportCsv}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by ID, Name, Phone, Area..." 
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none w-full bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none cursor-pointer"
          >
            <option value="All">All Statuses ({bookings.length})</option>
            <option value="pending">⏳ Pending ({bookings.filter(b => b.status === 'pending').length})</option>
            <option value="confirmed">✓ Confirmed ({bookings.filter(b => b.status === 'confirmed').length})</option>
            <option value="collected">🩸 Sample Collected ({bookings.filter(b => b.status === 'collected').length})</option>
            <option value="processing">🔬 Lab Processing ({bookings.filter(b => b.status === 'processing').length})</option>
            <option value="completed">🎉 Completed ({bookings.filter(b => b.status === 'completed').length})</option>
            <option value="cancelled">✕ Cancelled ({bookings.filter(b => b.status === 'cancelled').length})</option>
          </select>
        </div>

        {/* Center filter */}
        <div>
          <select 
            value={labFilter} 
            onChange={(e) => setLabFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none cursor-pointer"
          >
            <option value="All">All Diagnostic Centers</option>
            {labs.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {/* Sort by */}
        <div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none cursor-pointer"
          >
            <option value="newest">📅 Newest Bookings First</option>
            <option value="oldest">📅 Oldest Bookings First</option>
            <option value="amount_high">৳ Bill: High to Low</option>
            <option value="amount_low">৳ Bill: Low to High</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Date & Slot</th>
                <th className="px-5 py-3">Customer Details</th>
                <th className="px-5 py-3">Diagnostic Center & Tests</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Bill</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    No orders matching your filters.
                  </td>
                </tr>
              ) : (
                sorted.map(booking => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      #{booking.id}
                    </td>
                    <td className="px-5 py-4 text-slate-700 text-xs whitespace-nowrap">
                      <span className="font-semibold block">{booking.date}</span>
                      <span className="text-slate-500">{booking.time}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 text-xs">{booking.customerName || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={11} /> {booking.customerPhone}</p>
                      {booking.customerAddress && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5"><MapPin size={10} className="inline mr-1" />{booking.customerAddress}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-xs text-sky-700">{booking.labName}</p>
                      <p className="text-xs text-slate-600 truncate max-w-[200px] mt-0.5">{booking.testNames.join(', ')}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select 
                        value={booking.status} 
                        onChange={(e) => onUpdateStatus(booking.id, e.target.value as BookingStatus)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white shadow-sm focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="confirmed">✓ Confirmed</option>
                        <option value="collected">🩸 Sample Collected</option>
                        <option value="processing">🔬 Lab Processing</option>
                        <option value="completed">🎉 Completed</option>
                        <option value="cancelled">✕ Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      ৳ {booking.totalCost}
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => onSelectOrder(booking)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" 
                          title="View receipt / details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => onOpenEditOrder(booking)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                          title="Edit order"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          onClick={() => onOpenDeleteOrder(booking)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                          title="Delete order"
                        >
                          <Trash2 size={15} />
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
    </div>
  );
};
