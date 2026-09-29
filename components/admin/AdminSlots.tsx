import React, { useState } from 'react';
import { Language, DateSlotConfig, TimeSlotConfigItem, BlockedDateItem, SlotPeriod } from '../../types';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  CalendarOff, 
  ShieldCheck, 
  Sun, 
  Sunset, 
  Moon, 
  Coffee,
  CheckCircle2,
  XCircle,
  Sparkles,
  Sliders,
  Info
} from 'lucide-react';
import { DEFAULT_DATE_SLOT_CONFIG, DEFAULT_TIME_SLOTS } from '../../services/dataStorage';

interface AdminSlotsProps {
  lang: Language;
  config: DateSlotConfig;
  onUpdateConfig: (newConfig: DateSlotConfig) => void;
  showToast: (msg: string) => void;
}

const WEEK_DAYS = [
  { day: 0, en: 'Sunday', bn: 'রবিবার' },
  { day: 1, en: 'Monday', bn: 'সোমবার' },
  { day: 2, en: 'Tuesday', bn: 'মঙ্গলবার' },
  { day: 3, en: 'Wednesday', bn: 'বুধবার' },
  { day: 4, en: 'Thursday', bn: 'বৃহস্পতিবার' },
  { day: 5, en: 'Friday', bn: 'শুক্রবার' },
  { day: 6, en: 'Saturday', bn: 'শনিবার' }
];

export const AdminSlots: React.FC<AdminSlotsProps> = ({
  lang,
  config,
  onUpdateConfig,
  showToast
}) => {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'slots' | 'dates' | 'rules'>('slots');
  const [filterPeriod, setFilterPeriod] = useState<SlotPeriod | 'all'>('all');

  // New Slot Form State
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotPeriod, setNewSlotPeriod] = useState<SlotPeriod>('morning');
  const [newSlotCapacity, setNewSlotCapacity] = useState<number>(5);

  // New Blocked Date Form State
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');

  // 1. Slot Toggles and CRUD
  const handleToggleSlotActive = (slotId: string) => {
    const updatedSlots = config.slots.map(slot => 
      slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot
    );
    const updated = { ...config, slots: updatedSlots };
    onUpdateConfig(updated);
    showToast(isBn ? 'স্লটের অবস্থা সফলভাবে পরিবর্তন হয়েছে!' : 'Slot status updated successfully!');
  };

  const handleDeleteSlot = (slotId: string) => {
    if (config.slots.length <= 1) {
      showToast(isBn ? 'কমপক্ষে একটি স্লট সক্রিয় থাকতে হবে!' : 'At least one slot must remain!');
      return;
    }
    const updatedSlots = config.slots.filter(s => s.id !== slotId);
    onUpdateConfig({ ...config, slots: updatedSlots });
    showToast(isBn ? 'স্লটটি মুছে ফেলা হয়েছে!' : 'Slot deleted successfully!');
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে স্লটের সময়সীমা লিখুন' : 'Please enter slot time range');
      return;
    }

    const newSlot: TimeSlotConfigItem = {
      id: `slot_${Date.now()}`,
      time: newSlotTime.trim(),
      period: newSlotPeriod,
      isActive: true,
      maxCapacity: newSlotCapacity || 5
    };

    onUpdateConfig({
      ...config,
      slots: [...config.slots, newSlot]
    });

    setNewSlotTime('');
    setNewSlotCapacity(5);
    setIsAddingSlot(false);
    showToast(isBn ? 'নতুন সময়সূচি (স্লট) যুক্ত করা হয়েছে!' : 'New time slot added successfully!');
  };

  // 2. Weekly Holidays Toggle
  const handleToggleWeeklyHoliday = (dayNum: number) => {
    const holidays = config.weeklyHolidays || [];
    let updatedHolidays: number[];
    if (holidays.includes(dayNum)) {
      updatedHolidays = holidays.filter(d => d !== dayNum);
    } else {
      updatedHolidays = [...holidays, dayNum];
    }
    onUpdateConfig({ ...config, weeklyHolidays: updatedHolidays });
    showToast(isBn ? 'সাপ্তাহিক ছুটির দিন আপডেট হয়েছে!' : 'Weekly holiday settings updated!');
  };

  // 3. Blocked Dates CRUD
  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) {
      showToast(isBn ? 'অনুগ্রহ করে তারিখ নির্বাচন করুন' : 'Please select a date to block');
      return;
    }

    const exists = (config.blockedDates || []).some(b => b.date === newBlockedDate);
    if (exists) {
      showToast(isBn ? 'এই তারিখটি ইতিমধ্যে বন্ধ হিসেবে তালিকাভুক্ত আছে!' : 'This date is already blocked!');
      return;
    }

    const newBlocked: BlockedDateItem = {
      date: newBlockedDate,
      reason: newBlockedReason.trim() || (isBn ? 'ছুটি / বন্ধ' : 'Holiday / Closed')
    };

    onUpdateConfig({
      ...config,
      blockedDates: [...(config.blockedDates || []), newBlocked]
    });

    setNewBlockedDate('');
    setNewBlockedReason('');
    showToast(isBn ? 'বিশেষ ছুটির দিন যোগ করা হয়েছে!' : 'Blocked holiday date added!');
  };

  const handleRemoveBlockedDate = (dateStr: string) => {
    const updated = (config.blockedDates || []).filter(b => b.date !== dateStr);
    onUpdateConfig({ ...config, blockedDates: updated });
    showToast(isBn ? 'ছুটির তালিকা থেকে তারিখটি মুছে ফেলা হয়েছে' : 'Date unblocked successfully!');
  };

  // 4. Booking Rules (Advance Days & Lead Time)
  const handleUpdateAdvanceDays = (days: number) => {
    if (days < 1 || days > 60) return;
    onUpdateConfig({ ...config, advanceDays: days });
    showToast(isBn ? `অগ্রিম বুকিং সীমা ${days} দিনে সেট করা হয়েছে!` : `Advance booking range set to ${days} days!`);
  };

  const handleUpdateLeadTime = (hours: number) => {
    if (hours < 0 || hours > 24) return;
    onUpdateConfig({ ...config, leadTimeHours: hours });
    showToast(isBn ? `একই দিনের লিড টাইম ${hours} ঘণ্টায় সেট করা হয়েছে!` : `Same-day cutoff lead time set to ${hours} hours!`);
  };

  const handleResetDefaults = () => {
    if (window.confirm(isBn ? 'আপনি কি সমস্ত স্লট ও তারিখ সেটিংস ডিফল্টে রিসেট করতে চান?' : 'Are you sure you want to reset all date & slot settings to defaults?')) {
      onUpdateConfig(DEFAULT_DATE_SLOT_CONFIG);
      showToast(isBn ? 'তারিখ ও স্লট সেটিংস ডিফল্টে রিসেট করা হয়েছে!' : 'Date & slot settings reset to defaults!');
    }
  };

  const filteredSlots = filterPeriod === 'all' 
    ? config.slots 
    : config.slots.filter(s => s.period === filterPeriod);

  const activeSlotsCount = config.slots.filter(s => s.isActive).length;

  const getPeriodBadge = (period: SlotPeriod) => {
    switch (period) {
      case 'morning':
        return <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"><Coffee size={11} /> {isBn ? 'সকাল' : 'Morning'}</span>;
      case 'afternoon':
        return <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200"><Sun size={11} /> {isBn ? 'দুপুর' : 'Afternoon'}</span>;
      case 'evening':
        return <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"><Sunset size={11} /> {isBn ? 'সন্ধ্যা' : 'Evening'}</span>;
      case 'night':
        return <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-100 border border-slate-700"><Moon size={11} /> {isBn ? 'রাত' : 'Night'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 text-primary rounded-xl">
              <Clock size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {isBn ? 'তারিখ ও সময়সূচি (Date & Slot) কাস্টমাইজেশন' : 'Date & Time Slot Management'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn 
                  ? 'রোগীদের বুকিংয়ের জন্য সময়সূচি, অগ্রিম বুকিং সীমা, ছুটির দিন এবং স্লটের প্রাপ্যতা নিয়ন্ত্রণ করুন' 
                  : 'Customize appointment time slots, advance booking window, off-days & blackout holidays'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw size={14} />
            <span>{isBn ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}</span>
          </button>
          <button
            onClick={() => { setIsAddingSlot(true); setActiveTab('slots'); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>{isBn ? 'নতুন স্লট যোগ করুন' : 'Add New Slot'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">{isBn ? 'সক্রিয় স্লট' : 'Active Slots'}</p>
            <p className="text-lg font-black text-slate-900">{activeSlotsCount} <span className="text-xs text-slate-400 font-normal">/ {config.slots.length}</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">{isBn ? 'অগ্রিম বুকিং সীমা' : 'Advance Window'}</p>
            <p className="text-lg font-black text-slate-900">{config.advanceDays} <span className="text-xs text-slate-400 font-normal">{isBn ? 'দিন' : 'Days'}</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">{isBn ? 'একই দিনের কাটঅফ' : 'Same-Day Cutoff'}</p>
            <p className="text-lg font-black text-slate-900">{config.leadTimeHours} <span className="text-xs text-slate-400 font-normal">{isBn ? 'ঘণ্টা পূর্বে' : 'Hours'}</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <CalendarOff size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">{isBn ? 'ছুটির দিন ও বন্ধ' : 'Holidays & Off'}</p>
            <p className="text-lg font-black text-slate-900">{(config.weeklyHolidays?.length || 0) + (config.blockedDates?.length || 0)} <span className="text-xs text-slate-400 font-normal">{isBn ? 'টি' : 'Rules'}</span></p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('slots')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'slots'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock size={16} />
          <span>{isBn ? 'সময়সূচি স্লট তালিকা' : 'Time Slots'} ({config.slots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dates')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'dates'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarOff size={16} />
          <span>{isBn ? 'ছুটির দিন ও বন্ধের তারিখ' : 'Holidays & Blackout Dates'}</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            activeTab === 'rules'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders size={16} />
          <span>{isBn ? 'বুকিং নীতি ও শর্তাবলি' : 'Booking Rules & Window'}</span>
        </button>
      </div>

      {/* TAB 1: TIME SLOTS */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          {/* Add Slot Modal / Inline Card */}
          {isAddingSlot && (
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Plus size={16} className="text-primary" />
                  {isBn ? 'নতুন অ্যাপয়েন্টমেন্ট স্লট তৈরি করুন' : 'Create New Appointment Slot'}
                </h3>
                <button
                  onClick={() => setIsAddingSlot(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕ {isBn ? 'বাতিল' : 'Cancel'}
                </button>
              </div>

              <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'সময়সীমা (যেমন: 09:30 AM - 10:30 AM)' : 'Time Slot (e.g. 09:30 AM - 10:30 AM)'} *
                  </label>
                  <input
                    type="text"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    placeholder="09:30 AM - 10:30 AM"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'বেলা / পর্ব' : 'Period'}
                  </label>
                  <select
                    value={newSlotPeriod}
                    onChange={(e) => setNewSlotPeriod(e.target.value as SlotPeriod)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="morning">{isBn ? 'সকাল (Morning)' : 'Morning'}</option>
                    <option value="afternoon">{isBn ? 'দুপুর (Afternoon)' : 'Afternoon'}</option>
                    <option value="evening">{isBn ? 'সন্ধ্যা (Evening)' : 'Evening'}</option>
                    <option value="night">{isBn ? 'রাত (Night)' : 'Night'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'প্রতি স্লটে সর্বোচ্চ রোগী' : 'Max Capacity (Patients)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newSlotCapacity}
                    onChange={(e) => setNewSlotCapacity(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    {isBn ? 'সংরক্ষণ করুন' : 'Save Slot'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'morning', 'afternoon', 'evening', 'night'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPeriod(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                    filterPeriod === p
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p === 'all' 
                    ? (isBn ? 'সকল স্লট' : 'All Slots') 
                    : (p === 'morning' ? (isBn ? 'সকাল' : 'Morning') : p === 'afternoon' ? (isBn ? 'দুপুর' : 'Afternoon') : p === 'evening' ? (isBn ? 'সন্ধ্যা' : 'Evening') : (isBn ? 'রাত' : 'Night'))}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              {isBn ? 'মোট স্লট:' : 'Total slots:'} <span className="font-bold text-slate-900">{filteredSlots.length}</span>
            </div>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSlots.map(slot => (
              <div 
                key={slot.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  slot.isActive 
                    ? 'bg-white border-slate-200 shadow-xs hover:border-primary/50' 
                    : 'bg-slate-50/70 border-dashed border-slate-300 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {getPeriodBadge(slot.period)}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        slot.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {slot.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}
                      </span>
                    </div>
                    <p className="font-mono font-bold text-slate-900 text-sm">
                      {slot.time}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isBn ? 'ধারণক্ষমতা:' : 'Capacity:'} <span className="font-semibold text-slate-600">{slot.maxCapacity || 5} {isBn ? 'জন' : 'bookings'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleSlotActive(slot.id)}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        slot.isActive
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title={slot.isActive ? "Click to disable slot" : "Click to enable slot"}
                    >
                      {slot.isActive ? <Check size={14} /> : <XCircle size={14} />}
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-colors cursor-pointer"
                      title="Delete slot"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HOLIDAYS & BLACKOUT DATES */}
      {activeTab === 'dates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Holidays */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <CalendarOff size={18} />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isBn ? 'সাপ্তাহিক নিয়মিত ছুটির দিন (Weekly Holidays)' : 'Weekly Regular Holidays'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn ? 'যে যে বারে সমস্ত ল্যাব কালেকশন ও বুকিং বন্ধ রাখতে চান সিলেক্ট করুন' : 'Select standard days of the week when no home collection is scheduled'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {WEEK_DAYS.map(w => {
                const isHoliday = (config.weeklyHolidays || []).includes(w.day);
                return (
                  <button
                    key={w.day}
                    onClick={() => handleToggleWeeklyHoliday(w.day)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isHoliday 
                        ? 'bg-rose-50/80 border-rose-200 text-rose-700 shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{isBn ? w.bn : w.en}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                      isHoliday ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isHoliday ? (isBn ? 'ছুটি / বন্ধ' : 'Closed') : (isBn ? 'খোলা' : 'Open')}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-2.5 text-xs text-sky-800">
              <Info size={16} className="shrink-0 mt-0.5 text-sky-600" />
              <p>
                {isBn 
                  ? 'সাপ্তাহিক ছুটির দিনে বুকিং ক্যালেন্ডারে দিনগুলো স্বয়ংক্রিয়ভাবে অচল (Disabled) থাকবে।' 
                  : 'Weekly off days will be automatically disabled in patient booking calendar.'}
              </p>
            </div>
          </div>

          {/* Specific Blocked Dates / National Holidays */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Calendar size={18} />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isBn ? 'নির্দিষ্ট ছুটির দিন / বিশেষ বন্ধ (Blackout Dates)' : 'Specific Blackout Dates & Holidays'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn ? 'ঈদ, জাতীয় ছুটি বা ল্যাব মেইনটেন্যান্স এর জন্য নির্দিষ্ট দিন বন্ধ রাখুন' : 'Block out specific single dates for Eid, national holidays, or emergencies'}
                </p>
              </div>
            </div>

            {/* Add Date Form */}
            <form onSubmit={handleAddBlockedDate} className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'তারিখ নির্বাচন করুন' : 'Select Date'} *
                  </label>
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'ছুটির কারণ (ঐচ্ছিক)' : 'Reason (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={newBlockedReason}
                    onChange={(e) => setNewBlockedReason(e.target.value)}
                    placeholder={isBn ? 'যেমন: পবিত্র ঈদুল ফিতর' : 'e.g. Eid Holiday'}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                + {isBn ? 'ছুটির তালিকায় যুক্ত করুন' : 'Add Blackout Date'}
              </button>
            </form>

            {/* Blocked Dates List */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(config.blockedDates || []).length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  {isBn ? 'কোনো নির্দিষ্ট ছুটির দিন যোগ করা হয়নি' : 'No specific blackout dates added yet'}
                </div>
              ) : (
                config.blockedDates.map(b => (
                  <div key={b.date} className="flex items-center justify-between p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs">
                    <div>
                      <p className="font-bold font-mono text-slate-900">{b.date}</p>
                      <p className="text-[11px] text-rose-700 font-medium">{b.reason || (isBn ? 'ছুটি' : 'Holiday')}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveBlockedDate(b.date)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      title="Remove date block"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKING RULES & TIMELINES */}
      {activeTab === 'rules' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sliders size={20} />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isBn ? 'অগ্রিম বুকিং ও কাটঅফ সময়সীমা নির্ধারণ' : 'Advance Booking Window & Same-Day Lead Time'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'রোগী কতদিন আগে বুক করতে পারবে এবং একই দিনে বুকিংয়ের জন্য কত ঘণ্টা আগে বুক করা আবশ্যক তা ঠিক করুন' : 'Define how many days into future users can schedule, and minimum hours lead time'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Advance Days */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <label className="block font-bold text-slate-900 text-xs">
                {isBn ? 'সর্বোচ্চ অগ্রিম বুকিং সীমা (দিন)' : 'Max Advance Booking Days'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="3"
                  max="30"
                  step="1"
                  value={config.advanceDays || 7}
                  onChange={(e) => handleUpdateAdvanceDays(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold font-mono text-sm text-primary whitespace-nowrap">
                  {config.advanceDays || 7} {isBn ? 'দিন' : 'Days'}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>3 {isBn ? 'দিন' : 'Days'}</span>
                <span>7 {isBn ? 'দিন (ডিফল্ট)' : 'Days (Default)'}</span>
                <span>14 {isBn ? 'দিন' : 'Days'}</span>
                <span>30 {isBn ? 'দিন' : 'Days'}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isBn 
                  ? `বর্তমানে রোগীরা আগামী ${config.advanceDays || 7} দিনের মধ্যে যেকোনো তারিখ বেছে নিতে পারবে।` 
                  : `Patients can choose appointment dates up to ${config.advanceDays || 7} days in advance.`}
              </p>
            </div>

            {/* Same Day Lead Time */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <label className="block font-bold text-slate-900 text-xs">
                {isBn ? 'একই দিনের জন্য নুন্যতম প্রস্তুতির সময় (লিড টাইম)' : 'Same-Day Minimum Lead Time (Hours)'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={config.leadTimeHours !== undefined ? config.leadTimeHours : 3}
                  onChange={(e) => handleUpdateLeadTime(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold font-mono text-sm text-primary whitespace-nowrap">
                  {config.leadTimeHours !== undefined ? config.leadTimeHours : 3} {isBn ? 'ঘণ্টা' : 'Hours'}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>0 {isBn ? 'ঘণ্টা (তাৎক্ষণিক)' : 'hrs (Instant)'}</span>
                <span>3 {isBn ? 'ঘণ্টা (প্রস্তাবিত)' : 'hrs (Recommended)'}</span>
                <span>8 {isBn ? 'ঘণ্টা' : 'hrs'}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isBn 
                  ? `একই দিনে স্যাম্পল কালেকশনের জন্য বর্তমান সময় থেকে কমপক্ষে ${config.leadTimeHours !== undefined ? config.leadTimeHours : 3} ঘণ্টা পরের স্লটসমূহ নির্বাচনযোগ্য থাকবে।` 
                  : `For today's bookings, time slots starting earlier than current time + ${config.leadTimeHours !== undefined ? config.leadTimeHours : 3} hours will be locked.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
