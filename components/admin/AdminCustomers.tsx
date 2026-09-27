import React, { useState } from 'react';
import { BookingHistoryItem, Language, PatientUser } from '../../types';
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
  CheckCircle,
  Mail,
  UserCheck,
  UserX,
  MessageSquare,
  ShieldCheck,
  Activity,
  Heart,
  Filter,
  User,
  Trash2
} from 'lucide-react';
import { Button } from '../Button';

interface AdminCustomersProps {
  lang: Language;
  patients?: PatientUser[];
  bookings: BookingHistoryItem[];
  onSelectCustomerOrders: (customerPhone: string) => void;
  onDeletePatient?: (patientId: string) => void;
}

export interface MergedCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  avatar?: string;
  gender?: string;
  age?: string | number;
  bloodGroup?: string;
  isRegistered: boolean;
  registeredAt?: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate?: string;
  lastStatus?: string;
  recentTests: string[];
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  lang,
  patients = [],
  bookings,
  onSelectCustomerOrders,
  onDeletePatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'registered' | 'with_orders'>('all');
  const t = TRANSLATIONS[lang];

  // Merge Registered Patients and Booking Customers
  const customerMap = new Map<string, MergedCustomer>();

  // 1. Process all Registered Patients first
  patients.forEach(p => {
    const cleanPhone = (p.phone || '').trim();
    if (!cleanPhone && !p.id) return;
    
    const key = cleanPhone || p.id;
    customerMap.set(key, {
      id: p.id,
      name: p.name || (lang === 'bn' ? 'নিবন্ধিত রোগী' : 'Registered Patient'),
      phone: p.phone || '',
      email: p.email,
      address: p.address || (lang === 'bn' ? 'ঠিকানা দেয়া হয়নি' : 'Not provided'),
      avatar: p.avatar,
      gender: p.gender,
      age: p.age,
      bloodGroup: p.bloodGroup,
      isRegistered: true,
      registeredAt: p.createdAt,
      totalBookings: 0,
      totalSpent: 0,
      recentTests: []
    });
  });

  // 2. Aggregate Bookings data and add Guest bookers
  bookings.forEach(b => {
    const phone = (b.customerPhone || '').trim();
    if (!phone) return;

    // Check if matching registered patient exists by phone
    let existing = customerMap.get(phone);
    if (!existing) {
      // Find by matching phone numbers
      for (const [k, v] of customerMap.entries()) {
        const cleanA = v.phone.replace(/[^0-9]/g, '');
        const cleanB = phone.replace(/[^0-9]/g, '');
        if (cleanA && cleanB && (cleanA === cleanB || cleanA.endsWith(cleanB) || cleanB.endsWith(cleanA))) {
          existing = v;
          break;
        }
      }
    }

    if (existing) {
      existing.totalBookings += 1;
      if (b.status !== 'cancelled') {
        existing.totalSpent += (b.totalCost || 0);
      }
      if (!existing.lastBookingDate || (b.date && b.date > existing.lastBookingDate)) {
        existing.lastBookingDate = b.date;
        existing.lastStatus = b.status;
      }
      if ((!existing.address || existing.address === 'Not provided') && b.customerAddress) {
        existing.address = b.customerAddress;
      }
      if (b.testNames && Array.isArray(b.testNames)) {
        b.testNames.forEach(tn => {
          if (!existing!.recentTests.includes(tn) && existing!.recentTests.length < 4) {
            existing!.recentTests.push(tn);
          }
        });
      }
    } else {
      // Create guest customer record from booking
      customerMap.set(phone, {
        id: `guest_${phone}`,
        name: b.customerName || (lang === 'bn' ? 'গেস্ট কাস্টমার' : 'Guest Customer'),
        phone: phone,
        address: b.customerAddress || (lang === 'bn' ? 'ঠিকানা দেয়া হয়নি' : 'Not Provided'),
        isRegistered: false,
        totalBookings: 1,
        totalSpent: b.status !== 'cancelled' ? (b.totalCost || 0) : 0,
        lastBookingDate: b.date,
        lastStatus: b.status,
        recentTests: b.testNames ? b.testNames.slice(0, 3) : []
      });
    }
  });

  const allCustomers = Array.from(customerMap.values());

  const registeredCount = allCustomers.filter(c => c.isRegistered).length;
  const withOrdersCount = allCustomers.filter(c => c.totalBookings > 0).length;

  const filtered = allCustomers.filter(c => {
    // Filter type
    if (activeFilter === 'registered' && !c.isRegistered) return false;
    if (activeFilter === 'with_orders' && c.totalBookings === 0) return false;

    // Search query
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      c.name.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      c.address.toLowerCase().includes(term) ||
      (c.bloodGroup && c.bloodGroup.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {lang === 'bn' ? 'কাস্টমার ও পেশেন্ট ডিরেক্টরি' : 'Customer & Patient Directory'}
            </h1>
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
              {allCustomers.length} {lang === 'bn' ? 'জন কাস্টমার' : 'Total'}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {lang === 'bn' 
              ? 'নিবন্ধিত রোগী এবং টেস্ট বুকিং সম্পন্নকারী গ্রাহকদের সম্পূর্ণ তথ্য ও অর্ডার হিস্ট্রি।' 
              : 'Complete directory of registered patients and diagnostic test customers.'}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <div className="px-3 py-1 bg-white rounded-xl shadow-2xs border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{lang === 'bn' ? 'নিবন্ধিত' : 'Registered'}</span>
            <span className="text-sm font-black text-emerald-600">{registeredCount}</span>
          </div>
          <div className="px-3 py-1 bg-white rounded-xl shadow-2xs border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{lang === 'bn' ? 'বুকিংকারী' : 'With Orders'}</span>
            <span className="text-sm font-black text-primary">{withOrdersCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'bn' ? 'নাম, মোবাইল, ইমেইল, এলাকা দিয়ে খুঁজুন...' : 'Search by customer name, phone, email, area...'} 
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none bg-slate-50"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'সকল কাস্টমার' : 'All'} ({allCustomers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('registered')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'registered'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck size={13} className="text-emerald-500" />
            <span>{lang === 'bn' ? 'নিবন্ধিত রোগী' : 'Registered'} ({registeredCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('with_orders')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'with_orders'
                ? 'bg-white text-primary shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag size={13} className="text-primary" />
            <span>{lang === 'bn' ? 'বুকিংকারী' : 'With Orders'} ({withOrdersCount})</span>
          </button>
        </div>
      </div>

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Users className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm font-semibold text-slate-600">
              {lang === 'bn' ? 'কোনো কাস্টমার বা রোগীর তথ্য পাওয়া যায়নি।' : 'No customers or patients found matching your search.'}
            </p>
          </div>
        ) : (
          filtered.map((customer) => {
            const cleanPhoneDigits = customer.phone.replace(/[^0-9]/g, '');

            return (
              <div 
                key={customer.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Customer Info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {customer.avatar ? (
                          <img 
                            src={customer.avatar} 
                            alt={customer.name} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-2xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-100 to-indigo-100 text-primary flex items-center justify-center font-bold text-base border border-sky-200">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                        )}
                        {customer.bloodGroup && (
                          <span className="absolute -bottom-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-2xs">
                            {customer.bloodGroup}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900 leading-snug">{customer.name}</h3>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          {customer.isRegistered ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <UserCheck size={11} className="text-emerald-600" />
                              <span>{lang === 'bn' ? 'নিবন্ধিত রোগী' : 'Registered Patient'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>{lang === 'bn' ? 'গেস্ট কাস্টমার' : 'Guest Booking'}</span>
                            </span>
                          )}

                          {customer.age && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              • {customer.age} {lang === 'bn' ? 'বছর' : 'yrs'}
                            </span>
                          )}
                          {customer.gender && (
                            <span className="text-[11px] text-slate-500 capitalize font-medium">
                              • {customer.gender}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total Bookings Badge */}
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-slate-900 text-white text-xs font-black rounded-xl shadow-2xs">
                        {customer.totalBookings} {lang === 'bn' ? 'টি বুকিং' : 'Orders'}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info Box */}
                  <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-700 mb-3 border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono font-medium">
                        <Phone size={13} className="text-primary flex-shrink-0" />
                        <span>{customer.phone || (lang === 'bn' ? 'নম্বর নেই' : 'No Phone')}</span>
                      </div>
                      
                      {cleanPhoneDigits && (
                        <div className="flex items-center gap-1.5">
                          <a 
                            href={`tel:${cleanPhoneDigits}`}
                            className="p-1 bg-white hover:bg-sky-50 text-primary rounded-lg border border-slate-200 hover:border-primary transition-colors text-[11px] flex items-center gap-1 font-bold px-2 cursor-pointer"
                            title="Call customer"
                          >
                            <Phone size={11} /> {lang === 'bn' ? 'কল' : 'Call'}
                          </a>
                          <a 
                            href={`https://wa.me/88${cleanPhoneDigits}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-[11px] flex items-center gap-1 font-bold px-2 cursor-pointer shadow-2xs"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare size={11} /> WhatsApp
                          </a>
                        </div>
                      )}
                    </div>

                    {customer.email && (
                      <div className="flex items-center gap-2 text-slate-600 truncate">
                        <Mail size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin size={13} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  </div>

                  {/* Financial & Activity Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                        {lang === 'bn' ? 'মোট খরচ' : 'Total Spent'}
                      </span>
                      <span className="font-extrabold text-emerald-950 text-sm">৳ {customer.totalSpent}</span>
                    </div>

                    <div className="p-2.5 bg-sky-50/70 border border-sky-100 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-sky-800 block">
                        {lang === 'bn' ? 'সর্বশেষ বুকিং' : 'Last Booking'}
                      </span>
                      <span className="font-bold text-sky-950 text-xs truncate block">
                        {customer.lastBookingDate || (customer.registeredAt ? customer.registeredAt.slice(0, 10) : 'Never')}
                      </span>
                    </div>
                  </div>

                  {/* Recent Tests Tags */}
                  {customer.recentTests && customer.recentTests.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {lang === 'bn' ? 'টেস্টসমূহ:' : 'Tests:'}
                      </span>
                      {customer.recentTests.map((tName, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md truncate max-w-[160px]">
                          {tName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <div className="text-[11px] text-slate-400">
                    {customer.registeredAt && (
                      <span>{lang === 'bn' ? 'যুক্ত হয়েছেন: ' : 'Joined: '} {customer.registeredAt.slice(0, 10)}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {customer.totalBookings > 0 && (
                      <button
                        type="button"
                        onClick={() => onSelectCustomerOrders(customer.phone)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ShoppingBag size={12} />
                        <span>{lang === 'bn' ? 'অর্ডার দেখুন' : 'View Orders'}</span>
                        <ExternalLink size={11} className="text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
