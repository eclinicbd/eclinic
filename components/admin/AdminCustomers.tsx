import React, { useState } from 'react';
import { BookingHistoryItem, Language } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  Users, 
  Search, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  ExternalLink,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button } from '../Button';

interface AdminCustomersProps {
  lang: Language;
  bookings: BookingHistoryItem[];
  onSelectCustomerOrders: (customerPhone: string) => void;
}

interface CustomerSummary {
  name: string;
  phone: string;
  address: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string;
  lastStatus: string;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  lang,
  bookings,
  onSelectCustomerOrders
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const t = TRANSLATIONS[lang];

  // Group bookings by phone number
  const customersMap = new Map<string, CustomerSummary>();

  bookings.forEach(b => {
    const phone = b.customerPhone || 'Unknown';
    const existing = customersMap.get(phone);

    if (existing) {
      existing.totalBookings += 1;
      if (b.status !== 'cancelled') {
        existing.totalSpent += b.totalCost;
      }
      if (b.date > existing.lastBookingDate) {
        existing.lastBookingDate = b.date;
        existing.lastStatus = b.status;
      }
      if (!existing.address && b.customerAddress) {
        existing.address = b.customerAddress;
      }
    } else {
      customersMap.set(phone, {
        name: b.customerName || 'Anonymous Customer',
        phone: phone,
        address: b.customerAddress || 'Not Provided',
        totalBookings: 1,
        totalSpent: b.status !== 'cancelled' ? b.totalCost : 0,
        lastBookingDate: b.date,
        lastStatus: b.status
      });
    }
  });

  const customersList = Array.from(customersMap.values());

  const filtered = customersList.filter(c => {
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.phone.includes(term) || c.address.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{t.adminCustomerDir}</h1>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {customersList.length} Unique Patients
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">Directory of patients and customers who booked laboratory tests.</p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by customer name, phone, area..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs uppercase">
              <tr>
                <th className="px-5 py-3">Patient / Customer</th>
                <th className="px-5 py-3">Contact & Address</th>
                <th className="px-5 py-3 text-center">Total Bookings</th>
                <th className="px-5 py-3 text-right">Total Spent</th>
                <th className="px-5 py-3">Last Order</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((customer, idx) => (
                  <tr key={customer.phone + idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{customer.name}</p>
                          <span className="text-[10px] text-slate-400">Patient Profile</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1"><Phone size={12} className="text-emerald-600" /> {customer.phone}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-[220px]">
                        <MapPin size={11} className="text-slate-400 flex-shrink-0" /> {customer.address}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded-full text-xs">
                        {customer.totalBookings} orders
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900 text-sm">
                      ৳ {customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <p className="font-medium text-slate-800 flex items-center gap-1"><Calendar size={11} /> {customer.lastBookingDate}</p>
                      <span className="text-[10px] text-slate-400">Status: {customer.lastStatus}</span>
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {customer.phone && customer.phone !== 'Unknown' && (
                          <a 
                            href={`tel:${customer.phone}`}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-100"
                            title="Call customer directly"
                          >
                            <Phone size={11} /> Call
                          </a>
                        )}
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
