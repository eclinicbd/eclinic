

import React, { useState, useEffect, useRef } from 'react';
import { TestPackage, BookingFormData, Language } from '../types';
import { getLabs } from '../constants';
import { TRANSLATIONS } from '../translations';
import { Button } from './Button';
import { X, Calendar, MapPin, Phone, User, CheckCircle, Clock, Trash2, ChevronRight, Loader2, ShoppingBag, FileText, Upload, Stethoscope, FlaskConical, MessageSquare, Search, Plus } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: TestPackage[];
  onRemoveItem: (id: string) => void;
  lang: Language;
  preSelectedLabId?: string;
  onClearCart?: () => void;
  allTests?: TestPackage[];
  onAddTest?: (test: TestPackage) => void;
}

// Updated to 1-hour ranges
const TIME_SLOTS = [
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM", 
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM"
];

// Helper to get next 7 days
const getNext7Days = (lang: Language) => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      fullDate: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' }),
      dayNumber: d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric' }),
      month: d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short' })
    });
  }
  return days;
};

// Helper to check if a slot is available (at least 3 hours from now)
const isSlotAvailable = (dateStr: string, slotStr: string): boolean => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // If date is in the future, all slots are available
  if (dateStr !== todayStr) return true;

  const now = new Date();
  // Add 3 hours to current time for buffer
  const minTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); 

  // Parse slot start time (e.g. "08:00 AM")
  const startTimeStr = slotStr.split(' - ')[0]; // "08:00 AM"
  const [time, modifier] = startTimeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  let slotDate = new Date(); // Today
  let h = parseInt(hours, 10);
  
  if (h === 12) h = 0;
  if (modifier === 'PM') h += 12;
  
  slotDate.setHours(h, parseInt(minutes, 10), 0, 0);

  // Return true if slot time is after the minimum buffer time
  return slotDate > minTime;
};

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, cartItems, onRemoveItem, lang, preSelectedLabId, onClearCart, allTests, onAddTest }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phoneNumber: '',
    address: '',
    date: '',
    time: '',
    testIds: [],
    labId: '',
    doctorName: '',
    prescription: null
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];
  let labs = getLabs(lang);
  const nextDays = getNext7Days(lang);

  // Filter labs if one is pre-selected
  if (preSelectedLabId) {
    labs = labs.filter(l => l.id === preSelectedLabId);
  }

  // Effect 1: Reset state ONLY when Modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSearchTerm(''); // Reset search
      
      // Automatic Date Selection Logic
      const days = getNext7Days(lang);
      let bestDate = days[0].fullDate; // Default to today

      // Loop through days to find the first one with available slots
      for (const day of days) {
        const hasAvailableSlots = TIME_SLOTS.some(slot => isSlotAvailable(day.fullDate, slot));
        if (hasAvailableSlots) {
          bestDate = day.fullDate;
          break; // Found the first available day
        }
      }
      
      // Initialize form data
      setFormData(prev => ({
        ...prev,
        date: bestDate, // Set the automatically calculated date
        testIds: cartItems.map(t => t.id),
        // Use current labs context for initialization
        labId: preSelectedLabId || prev.labId || (labs.length === 1 ? labs[0].id : ''), 
      }));
      setIsSubmitting(false);
    }
  }, [isOpen, lang]); // Added lang dependency

  // Effect 2: Sync cart items if they change while modal is open (without resetting step)
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        testIds: cartItems.map(t => t.id)
      }));
    }
  }, [cartItems, isOpen]);

  // Effect 3: Scroll to top when step changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [step]);

  // Reset time if selected date changes and time becomes invalid
  useEffect(() => {
    if (formData.date && formData.time) {
      if (!isSlotAvailable(formData.date, formData.time)) {
        setFormData(prev => ({ ...prev, time: '' }));
      }
    }
  }, [formData.date]);

  if (!isOpen) return null;

  // Calculate bill based on selected lab
  const getItemPrice = (item: TestPackage) => {
    if (formData.labId && item.priceByLab && item.priceByLab[formData.labId]) {
      return item.priceByLab[formData.labId];
    }
    return item.price;
  };

  const selectedLab = labs.find(l => l.id === formData.labId);
  const serviceCharge = selectedLab ? selectedLab.serviceCharge : 0;
  
  const subTotal = cartItems.reduce((sum, item) => sum + getItemPrice(item), 0);
  const totalBill = subTotal + serviceCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time) return;

    setIsSubmitting(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep(3); // Success state
  };

  const handleClose = () => {
    onClose();
  };

  const handleBackToHome = () => {
    // If a clear cart handler is provided, use it
    if (onClearCart) {
      onClearCart();
    }
    // Close the modal
    onClose();
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, prescription: e.target.files[0] });
    }
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return t.step1;
      case 2: return t.step2;
      case 3: return t.step3;
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {step === 1 && <ShoppingBag size={18} className="text-primary" />}
              {step === 2 && <User size={18} className="text-primary" />}
              {step === 3 && <CheckCircle size={18} className="text-primary" />}
              {getStepTitle()}
            </h2>
            <p className="text-xs text-slate-500">{t.step1.split(" ")[0]} {step} / 3</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          
          {/* STEP 1: Cart Review & Lab Selection */}
          {step === 1 && (
            <div className="space-y-6">

              {/* Selected Lab Prominent Display */}
              {selectedLab && (
                <div className="bg-gradient-to-br from-sky-50 to-white border border-sky-100 rounded-xl p-4 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-5">
                    <FlaskConical size={64} />
                  </div>
                  <img src={selectedLab.logo} alt={selectedLab.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md mb-2 bg-white" />
                  <h3 className="text-lg font-bold text-slate-800 leading-tight">{selectedLab.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <span className="bg-white px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1 shadow-sm">
                      <span className="text-yellow-500">⭐</span> {selectedLab.rating}
                    </span>
                    <span>• {t.successLab}</span>
                  </div>
                </div>
              )}

              {/* Lab Selection Section - Hidden if pre-selected */}
              {cartItems.length > 0 && !preSelectedLabId && (
                <div className="space-y-3">
                   <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary" />
                    {t.selectLab}
                  </label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-1">
                    {labs.map(lab => (
                      <div 
                        key={lab.id}
                        onClick={() => setFormData({...formData, labId: lab.id})}
                        className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between transition-all hover:bg-slate-50 ${formData.labId === lab.id ? 'border-primary bg-sky-50 ring-1 ring-primary' : 'border-slate-200'}`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={lab.logo} alt={lab.name} className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                          <div>
                            <p className="font-bold text-sm text-slate-800">{lab.name}</p>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500 text-xs">⭐</span>
                              <span className="text-xs text-slate-500">{lab.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.labId === lab.id ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                          {formData.labId === lab.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cart Items List */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                  {t.selectTest}
                  <span className="text-xs bg-sky-100 text-primary px-2 py-0.5 rounded-full">{cartItems.length} items</span>
                </label>

                {/* Search Bar for Adding Tests */}
                {onAddTest && allTests && (
                  <div className="relative mb-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all focus:bg-white"
                        placeholder={t.searchAndAddPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    
                    {/* Suggestions Dropdown */}
                    {searchTerm && (
                      <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 max-h-52 overflow-y-auto">
                        {allTests
                          .filter(test => 
                            test.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
                            !cartItems.find(item => item.id === test.id)
                          )
                          .map(test => (
                            <button
                              key={test.id}
                              onClick={() => {
                                onAddTest(test);
                                setSearchTerm('');
                              }}
                              className="w-full text-left p-3 hover:bg-sky-50 flex justify-between items-center border-b border-slate-50 last:border-none transition-colors group"
                            >
                              <div>
                                 <p className="text-sm font-medium text-slate-800 group-hover:text-primary">{test.name}</p>
                                 <p className="text-xs text-slate-500">{test.category}</p>
                              </div>
                              <Plus size={16} className="text-slate-400 group-hover:text-primary" />
                            </button>
                          ))}
                          {allTests.filter(test => test.name.toLowerCase().includes(searchTerm.toLowerCase()) && !cartItems.find(item => item.id === test.id)).length === 0 && (
                              <div className="p-3 text-xs text-slate-400 text-center">No matches found / Already in cart</div>
                          )}
                      </div>
                    )}
                  </div>
                )}
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-500 text-sm">{t.cartEmpty}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-white border border-slate-200 p-3 rounded-lg flex items-center gap-3 group hover:border-sky-200 transition-colors">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover bg-slate-100" />
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                          <p className="text-primary font-bold text-xs">৳ {getItemPrice(item)}</p>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          title={t.removeItem}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {cartItems.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-lg mt-2 space-y-2 border border-slate-100">
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>{t.cartSubtotal}</span>
                      <span>৳ {subTotal}</span>
                    </div>
                    {serviceCharge > 0 && (
                       <div className="flex justify-between items-center text-sm text-slate-600">
                        <span>{t.serviceCharge}</span>
                        <span>৳ {serviceCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-2">
                      <span className="text-sm font-bold text-slate-800">{t.cartTotal}</span>
                      <span className="text-lg font-bold text-primary">৳ {totalBill}</span>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                fullWidth 
                onClick={() => setStep(2)} 
                disabled={!formData.labId || cartItems.length === 0}
                className="mt-4"
              >
                {t.nextStep} <ChevronRight size={16} />
              </Button>
            </div>
          )}

          {/* STEP 2: Scheduling & Personal Info */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Schedule Section */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Clock size={16} className="text-primary" />
                  {t.scheduleTitle}
                </h3>
                
                {/* Custom Date Strip */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">{t.dateLabel}</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {nextDays.map((day) => (
                      <button
                        key={day.fullDate}
                        type="button"
                        onClick={() => setFormData({...formData, date: day.fullDate})}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-all ${
                          formData.date === day.fullDate
                            ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                        }`}
                      >
                        <span className="text-xs font-medium uppercase opacity-80">{day.dayName}</span>
                        <span className="text-xl font-bold">{day.dayNumber}</span>
                        <span className="text-[10px] uppercase opacity-70">{day.month}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots Grid */}
                <div>
                  <label className="block text-xs text-slate-500 mb-2">{t.timeLabel}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map(slot => {
                       const isAvailable = isSlotAvailable(formData.date, slot);
                       return (
                         <button 
                           key={slot}
                           type="button"
                           disabled={!isAvailable}
                           onClick={() => setFormData({...formData, time: slot})}
                           className={`text-xs py-2 px-1 rounded-md border transition-all truncate ${
                             formData.time === slot 
                               ? 'bg-primary text-white border-primary shadow-md' 
                               : isAvailable 
                                 ? 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:bg-sky-50'
                                 : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                           }`}
                         >
                           {slot}
                         </button>
                       );
                    })}
                  </div>
                  {!formData.time && <p className="text-[10px] text-red-500 mt-1">{t.timeError}</p>}
                </div>
              </div>

              {/* Personal Info Section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <User size={16} className="text-primary" />
                  {t.step2.split(' ')[0]} {/* "Info" / "তথ্য" */}
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                      placeholder={t.namePlaceholder}
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      required
                      type="tel" 
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                      placeholder={t.phoneLabel}
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <textarea 
                      required
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                      placeholder={t.addrPlaceholder}
                      rows={2}
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>

                {/* Doctor & Prescription (Moved Here) */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.doctorLabel}</label>
                    <div className="relative">
                      <Stethoscope className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                        placeholder={t.doctorPlaceholder}
                        value={formData.doctorName}
                        onChange={e => setFormData({...formData, doctorName: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.prescriptionLabel}</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="prescription-upload"
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                      <label 
                        htmlFor="prescription-upload"
                        className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-primary/50 bg-sky-50 rounded-lg cursor-pointer hover:bg-sky-100 transition-colors text-primary text-sm font-medium"
                      >
                        <Upload size={18} />
                        {formData.prescription ? (
                           <span className="text-slate-800">{formData.prescription.name}</span>
                        ) : (
                           <span>{t.attachBtn}</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} fullWidth disabled={isSubmitting}>{t.backBtn}</Button>
                <Button type="submit" fullWidth disabled={isSubmitting || !formData.date || !formData.time}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> {t.processing}
                    </span>
                  ) : (
                    t.confirmBtn
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="text-center py-4 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-25"></div>
                <CheckCircle size={48} className="text-green-600 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{t.successTitle}</h3>
              <p className="text-slate-600 mb-8">
                {t.successDesc}
              </p>
              
              <div className="bg-slate-50 p-6 rounded-xl text-left border border-slate-100 shadow-sm mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-bl-lg">{t.successConfirmed}</div>
                <div className="space-y-3">
                   <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 text-sm">{t.successTest}</span>
                    <span className="font-bold text-slate-800 text-right">{cartItems.length} Tests</span>
                  </div>
                   <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 text-sm">{t.successLab}</span>
                    <span className="font-bold text-slate-800">{labs.find(l => l.id === formData.labId)?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 text-sm">{t.successDateTime}</span>
                    <span className="font-bold text-slate-800 text-right">{formData.date}<br/>{formData.time}</span>
                  </div>
                  {formData.doctorName && (
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500 text-sm">Doctor Ref</span>
                      <span className="font-bold text-slate-800 text-right">{formData.doctorName}</span>
                    </div>
                  )}
                  {/* Bill Breakdown in Step 3 */}
                   <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{t.cartSubtotal}</span>
                        <span>৳ {subTotal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{t.serviceCharge}</span>
                        <span>৳ {serviceCharge}</span>
                      </div>
                       <div className="flex justify-between pt-1 border-t border-slate-200 mt-1">
                        <span className="text-slate-500 text-sm">{t.successTotal}</span>
                        <span className="font-bold text-primary text-lg">৳ {totalBill}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Contact Confirmation Note */}
              <div className="bg-sky-50 p-4 rounded-lg mb-6 flex items-center gap-3 text-left border border-sky-100">
                <Phone className="text-primary flex-shrink-0" size={20} />
                <p className="text-sm text-slate-700">
                  {t.successContact} <span className="font-bold text-slate-900">{formData.phoneNumber}</span>
                </p>
              </div>
              
              <Button onClick={handleBackToHome} fullWidth>{t.successHomeBtn}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};