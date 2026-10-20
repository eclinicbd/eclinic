import { TestPackage, LabPartner, Language, BookingHistoryItem, SiteSettings, PatientUser, HealthPackage, CategoryItem, DateSlotConfig, TimeSlotConfigItem, StaffUser, StaffRole, StaffPermissions, PaymentGatewaysConfig, AdminCredentials, Doctor, DoctorAppointment, EPrescription, DoctorAtHomeBooking, DoctorAtHomeSpecialty, DoctorAtHomeScheduleConfig, DoctorAtHomeTimeSlot, HomeVisitDoctor, Phlebotomist } from '../types';
import { 
  getTests as getDefaultTests, 
  getLabs as getDefaultLabs, 
  getSiteSettings as getDefaultSiteSettings,
  getPackages as getDefaultPackages,
  getDoctors as getDefaultDoctors
} from '../constants';
import { 
  saveAdminCredentialsToFirestore, 
  saveStaffUsersToFirestore, 
  savePatientsListToFirestore, 
  saveDateSlotConfigToFirestore,
  saveUserProfileToFirestore 
} from './firebase';

const STORAGE_KEYS = {
  TESTS_BN: 'labhome_tests_bn_v3',
  TESTS_EN: 'labhome_tests_en_v3',
  PACKAGES_BN: 'labhome_packages_bn_v1',
  PACKAGES_EN: 'labhome_packages_en_v1',
  LABS_BN: 'labhome_labs_bn_v3',
  LABS_EN: 'labhome_labs_en_v3',
  BOOKINGS: 'labhome_bookings_v2',
  DOCTOR_AT_HOME_BOOKINGS: 'labhome_doctor_at_home_bookings_v1',
  HOME_VISIT_DOCTORS: 'labhome_home_visit_doctors_v1',
  PHLEBOTOMISTS: 'labhome_phlebotomists_v1',
  DOCTOR_AT_HOME_SPECIALTIES: 'labhome_doctor_at_home_specialties_v2',
  DOCTOR_AT_HOME_SCHEDULE: 'labhome_doctor_at_home_schedule_v1',
  CATEGORIES: 'labhome_categories_v2',
  SITE_SETTINGS_BN: 'labhome_site_settings_bn_v2',
  SITE_SETTINGS_EN: 'labhome_site_settings_en_v2',
  DOCTORS_BN: 'labhome_doctors_bn_v1',
  DOCTORS_EN: 'labhome_doctors_en_v1',
  DOCTOR_APPOINTMENTS: 'labhome_doctor_appointments_v1',
  E_PRESCRIPTIONS: 'labhome_e_prescriptions_v1',
  PATIENTS: 'labhome_patients_v2',
  CURRENT_PATIENT: 'labhome_current_patient_v2',
  DATE_SLOT_CONFIG: 'labhome_date_slot_config_v1',
  STAFF_USERS: 'labhome_staff_users_v1',
  CURRENT_STAFF: 'labhome_current_staff_session_v1',
  PAYMENT_CONFIG: 'labhome_payment_gateways_v1'
};

export const ROLE_DEFAULT_PERMISSIONS: Record<StaffRole, StaffPermissions> = {
  admin: {
    canViewOrders: true,
    canUpdateOrderStatus: true,
    canAssignStaff: true,
    canViewReports: true,
    canUploadReports: true,
    canViewTests: true,
    canEditTests: true,
    canDeleteTests: true,
    canViewCustomers: true,
    canViewLabs: true,
    canManageSettings: true,
    canManageUsers: true,
    canManageSlots: true,
    canDeleteOrders: true,
    canViewRevenue: true,
    assignedOnly: false
  },
  manager: {
    canViewOrders: true,
    canUpdateOrderStatus: true,
    canAssignStaff: true,
    canViewReports: true,
    canUploadReports: true,
    canViewTests: true,
    canEditTests: false, // Strict: cannot edit catalog/prices
    canDeleteTests: false, // Strict: cannot delete
    canViewCustomers: true,
    canViewLabs: true,
    canManageSettings: false,
    canManageUsers: false,
    canManageSlots: false,
    canDeleteOrders: false,
    canViewRevenue: true,
    assignedOnly: false
  },
  phlebotomist: {
    canViewOrders: true,
    canUpdateOrderStatus: true, // Sample collected/progress
    canAssignStaff: false,
    canViewReports: false,
    canUploadReports: false,
    canViewTests: true, // Reference only
    canEditTests: false,
    canDeleteTests: false,
    canViewCustomers: true, // Patient address & phone for collection
    canViewLabs: false,
    canManageSettings: false,
    canManageUsers: false,
    canManageSlots: false,
    canDeleteOrders: false,
    canViewRevenue: false, // Hidden for phlebotomist
    assignedOnly: true // Only view area / assigned orders
  },
  nurse: {
    canViewOrders: true,
    canUpdateOrderStatus: true,
    canAssignStaff: false,
    canViewReports: false,
    canUploadReports: false,
    canViewTests: true,
    canEditTests: false,
    canDeleteTests: false,
    canViewCustomers: true,
    canViewLabs: false,
    canManageSettings: false,
    canManageUsers: false,
    canManageSlots: false,
    canDeleteOrders: false,
    canViewRevenue: false, // Hidden for nurse
    assignedOnly: true // Only view area / assigned orders
  },
  delivery: {
    canViewOrders: true,
    canUpdateOrderStatus: true, // Delivery completed
    canAssignStaff: false,
    canViewReports: true, // Deliverable report invoices
    canUploadReports: false,
    canViewTests: false,
    canEditTests: false,
    canDeleteTests: false,
    canViewCustomers: true, // Address & phone for delivery
    canViewLabs: false,
    canManageSettings: false,
    canManageUsers: false,
    canManageSlots: false,
    canDeleteOrders: false,
    canViewRevenue: false, // Hidden for delivery
    assignedOnly: true // Only view area / assigned orders
  },
  custom: {
    canViewOrders: true,
    canUpdateOrderStatus: false,
    canAssignStaff: false,
    canViewReports: false,
    canUploadReports: false,
    canViewTests: true,
    canEditTests: false,
    canDeleteTests: false,
    canViewCustomers: false,
    canViewLabs: false,
    canManageSettings: false,
    canManageUsers: false,
    canManageSlots: false,
    canDeleteOrders: false,
    canViewRevenue: false,
    assignedOnly: true
  }
};

export const POPULAR_AREAS = [
  'All Areas',
  'Dhanmondi',
  'Mirpur',
  'Uttara',
  'Gulshan',
  'Banani',
  'Mohakhali',
  'Mohammadpur',
  'Badda',
  'Bashundhara',
  'Motijheel',
  'Old Dhaka',
  'Khilgaon',
  'Malibagh',
  'Rampura',
  'Jatrabari',
  'Savar',
  'Gazipur',
  'Narayanganj'
];

export const DEFAULT_STAFF_USERS: StaffUser[] = [
  {
    id: "MGR-101",
    name: "Tariqul Islam (Manager)",
    emailOrUsername: "manager",
    password: "manager123",
    role: "manager",
    phone: "01711223344",
    assignedArea: "All Areas",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    isActive: true,
    createdAt: "2024-01-10T08:00:00Z",
    permissions: ROLE_DEFAULT_PERMISSIONS.manager
  },
  {
    id: "PHLEB-201",
    name: "Md. Karim Ullah (Phlebotomist)",
    emailOrUsername: "phleb",
    password: "phleb123",
    role: "phlebotomist",
    phone: "01822334455",
    assignedArea: "Dhanmondi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    isActive: true,
    createdAt: "2024-01-12T10:00:00Z",
    permissions: ROLE_DEFAULT_PERMISSIONS.phlebotomist
  },
  {
    id: "NURSE-301",
    name: "Nasrin Akter (Staff Nurse)",
    emailOrUsername: "nurse",
    password: "nurse123",
    role: "nurse",
    phone: "01933445566",
    assignedArea: "Uttara",
    avatar: "https://images.unsplash.com/photo-1594824813511-209214739501?auto=format&fit=crop&q=80&w=100",
    isActive: true,
    createdAt: "2024-01-15T09:00:00Z",
    permissions: ROLE_DEFAULT_PERMISSIONS.nurse
  },
  {
    id: "DELIV-401",
    name: "Robiul Hossain (Report Delivery)",
    emailOrUsername: "delivery",
    password: "delivery123",
    role: "delivery",
    phone: "01644556677",
    assignedArea: "Mirpur",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
    isActive: true,
    createdAt: "2024-01-18T11:00:00Z",
    permissions: ROLE_DEFAULT_PERMISSIONS.delivery
  }
];

export const filterOrdersForStaff = (bookings: BookingHistoryItem[], staff: StaffUser | null): BookingHistoryItem[] => {
  if (!staff || staff.role === 'admin' || staff.role === 'manager') {
    return bookings;
  }

  const staffArea = (staff.assignedArea || '').trim().toLowerCase();
  const isAllAreas = !staffArea || staffArea === 'all areas' || staffArea === 'all' || staffArea === 'সকল এলাকা' || staffArea === 'সকল এরিয়া';

  if (isAllAreas && !staff.permissions?.assignedOnly) {
    return bookings;
  }

  return bookings.filter(b => {
    // 1. Explicitly assigned to this staff member
    if (b.assignedStaffId && b.assignedStaffId === staff.id) return true;
    if (b.assignedStaffName && b.assignedStaffName.toLowerCase().includes(staff.name.toLowerCase())) return true;

    // 2. If staff has an assigned area, check order address or area field
    if (staffArea && !isAllAreas) {
      if (b.area && b.area.toLowerCase().includes(staffArea)) return true;
      if (b.customerAddress && b.customerAddress.toLowerCase().includes(staffArea)) return true;
      
      // Multi-lingual Bengali name matching
      const areaAliases: Record<string, string[]> = {
        'dhanmondi': ['ধানমন্ডি', 'dhanmondi'],
        'mirpur': ['মিরপুর', 'mirpur'],
        'uttara': ['উত্তরা', 'uttara'],
        'gulshan': ['গুলশান', 'gulshan'],
        'banani': ['বনানী', 'banani'],
        'mohakhali': ['মহাখালী', 'mohakhali', 'মহাকালী'],
        'mohammadpur': ['মোহাম্মদপুর', 'mohammadpur', 'মোহাম্মাদপুর'],
        'badda': ['বাড্ডা', 'badda'],
        'bashundhara': ['বসুন্ধরা', 'bashundhara'],
        'motijheel': ['মতিঝিল', 'motijheel'],
        'old dhaka': ['পুরান ঢাকা', 'old dhaka', 'পুরনো ঢাকা', 'সদরঘাট', 'চকবাজার'],
        'khilgaon': ['খিলগাঁও', 'khilgaon'],
        'malibagh': ['মালিবাগ', 'malibagh'],
        'rampura': ['রামপুরা', 'rampura'],
        'jatrabari': ['যাত্রাবাড়ী', 'jatrabari']
      };

      const aliases = areaAliases[staffArea] || [staffArea];
      if (b.customerAddress) {
        const addr = b.customerAddress.toLowerCase();
        if (aliases.some(a => addr.includes(a.toLowerCase()))) {
          return true;
        }
      }
    }

    return false;
  });
};

export const getStoredStaffUsers = (): StaffUser[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STAFF_USERS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading stored staff users:", e);
  }
  return DEFAULT_STAFF_USERS;
};

export const saveStoredStaffUsers = (staff: StaffUser[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF_USERS, JSON.stringify(staff));
    saveStaffUsersToFirestore(staff).catch(() => {});
  } catch (e) {
    console.error("Error saving staff users:", e);
  }
};

export const getStoredCurrentStaff = (): StaffUser | null => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.CURRENT_STAFF);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading current staff session:", e);
  }
  return null;
};

export const setStoredCurrentStaff = (staff: StaffUser | null): void => {
  try {
    if (staff) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_STAFF, JSON.stringify(staff));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF);
    }
  } catch (e) {
    console.error("Error setting current staff session:", e);
  }
};

export const DEFAULT_TIME_SLOTS: TimeSlotConfigItem[] = [
  { id: 'slot_1', time: '08:00 AM - 09:00 AM', period: 'morning', isActive: true, maxCapacity: 5 },
  { id: 'slot_2', time: '09:00 AM - 10:00 AM', period: 'morning', isActive: true, maxCapacity: 5 },
  { id: 'slot_3', time: '10:00 AM - 11:00 AM', period: 'morning', isActive: true, maxCapacity: 5 },
  { id: 'slot_4', time: '11:00 AM - 12:00 PM', period: 'morning', isActive: true, maxCapacity: 5 },
  { id: 'slot_5', time: '12:00 PM - 01:00 PM', period: 'afternoon', isActive: true, maxCapacity: 5 },
  { id: 'slot_6', time: '02:00 PM - 03:00 PM', period: 'afternoon', isActive: true, maxCapacity: 5 },
  { id: 'slot_7', time: '03:00 PM - 04:00 PM', period: 'afternoon', isActive: true, maxCapacity: 5 },
  { id: 'slot_8', time: '04:00 PM - 05:00 PM', period: 'afternoon', isActive: true, maxCapacity: 5 },
  { id: 'slot_9', time: '05:00 PM - 06:00 PM', period: 'evening', isActive: true, maxCapacity: 5 },
  { id: 'slot_10', time: '06:00 PM - 07:00 PM', period: 'evening', isActive: true, maxCapacity: 5 },
  { id: 'slot_11', time: '07:00 PM - 08:00 PM', period: 'evening', isActive: true, maxCapacity: 5 },
  { id: 'slot_12', time: '08:00 PM - 09:00 PM', period: 'night', isActive: true, maxCapacity: 5 }
];

export const DEFAULT_DATE_SLOT_CONFIG: DateSlotConfig = {
  advanceDays: 7,
  leadTimeHours: 3,
  weeklyHolidays: [], // e.g. [5] for Friday if desired
  blockedDates: [],
  slots: DEFAULT_TIME_SLOTS
};

export const getStoredDateSlotConfig = (): DateSlotConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DATE_SLOT_CONFIG);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.slots) && parsed.slots.length > 0) {
        return {
          advanceDays: typeof parsed.advanceDays === 'number' ? parsed.advanceDays : DEFAULT_DATE_SLOT_CONFIG.advanceDays,
          leadTimeHours: typeof parsed.leadTimeHours === 'number' ? parsed.leadTimeHours : DEFAULT_DATE_SLOT_CONFIG.leadTimeHours,
          weeklyHolidays: Array.isArray(parsed.weeklyHolidays) ? parsed.weeklyHolidays : [],
          blockedDates: Array.isArray(parsed.blockedDates) ? parsed.blockedDates : [],
          slots: parsed.slots
        };
      }
    }
  } catch (e) {
    console.error("Failed to load date slot config:", e);
  }
  return DEFAULT_DATE_SLOT_CONFIG;
};

export const setStoredDateSlotConfig = (config: DateSlotConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DATE_SLOT_CONFIG, JSON.stringify(config));
    saveDateSlotConfigToFirestore(config).catch(() => {});
  } catch (e) {
    console.error("Failed to save date slot config:", e);
  }
};

export const parseSlotStartTime = (dateStr: string, slotTime: string): Date | null => {
  try {
    const startTimePart = slotTime.split('-')[0]?.trim(); // e.g. "08:00 AM"
    if (!startTimePart) return null;
    const match = startTimePart.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;
    
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch {
    return null;
  }
};

export const isSlotAvailable = (dateStr?: string, slotTime?: string): boolean => {
  if (!dateStr || !slotTime) return false;
  
  const config = getStoredDateSlotConfig();
  // Minimum 3 hours lead time strictly enforced as requested
  const leadHours = Math.max(config.leadTimeHours || 3, 3);
  
  // 1. Check minimum 3 hours advance lead time
  const slotDate = parseSlotStartTime(dateStr, slotTime);
  if (slotDate) {
    const now = new Date();
    const diffMs = slotDate.getTime() - now.getTime();
    const minDiffMs = leadHours * 60 * 60 * 1000;
    if (diffMs < minDiffMs) {
      return false;
    }
  }
  
  // 2. Check if date is blocked
  const isBlocked = (config.blockedDates || []).some(b => b.date === dateStr);
  if (isBlocked) return false;

  // 3. Check weekly off
  try {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    if ((config.weeklyHolidays || []).includes(dayOfWeek)) return false;
  } catch {
    // ignore
  }

  // 4. Check if slot itself is active
  const slotItem = (config.slots || DEFAULT_TIME_SLOTS).find(s => s.time === slotTime);
  if (slotItem && !slotItem.isActive) return false;

  // 5. Check bookings count against slot capacity
  try {
    const bookings = getStoredBookings();
    const sameSlotBookings = bookings.filter(b => b.date === dateStr && b.time === slotTime && b.status !== 'cancelled');
    const maxCap = slotItem?.maxCapacity || 5;
    if (sameSlotBookings.length >= maxCap) {
      return false;
    }
  } catch {
    // fallback
  }

  return true;
};

/**
 * Parse start time of Doctor At Home slot.
 * Supports slot objects ({ id, timeBn, timeEn }) and formatted slot strings.
 */
export const parseDoctorAtHomeSlotStartTime = (dateStr: string, slotInput: DoctorAtHomeTimeSlot | string): Date | null => {
  try {
    if (!dateStr || !slotInput) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return null;

    const timeEn = typeof slotInput === 'string' ? slotInput : (slotInput.timeEn || slotInput.timeBn || '');
    const slotId = typeof slotInput === 'object' ? slotInput.id : '';

    // Standard preset slot IDs
    if (slotId === 'morning_1') {
      return new Date(year, month - 1, day, 9, 0, 0, 0);
    } else if (slotId === 'afternoon_1') {
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    } else if (slotId === 'evening_1') {
      return new Date(year, month - 1, day, 15, 0, 0, 0);
    } else if (slotId === 'night_1') {
      return new Date(year, month - 1, day, 18, 0, 0, 0);
    }

    // Match 12-hour AM/PM format (e.g., "09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM")
    const match12 = timeEn.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = parseInt(match12[2], 10);
      const ampm = match12[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return new Date(year, month - 1, day, hours, minutes, 0, 0);
    }

    // Match Bengali/English text patterns
    const bnToEnMap: Record<string, string> = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
    const normalized = timeEn.replace(/[০-৯]/g, d => bnToEnMap[d] || d);

    const matchTime = normalized.match(/(\d{1,2}):(\d{2})/);
    if (matchTime) {
      let hours = parseInt(matchTime[1], 10);
      const minutes = parseInt(matchTime[2], 10);
      const isMorning = /সকাল|morning/i.test(timeEn);
      const isAfternoon = /দুপুর|afternoon/i.test(timeEn);
      const isEvening = /বিকাল|সন্ধ্যা|evening/i.test(timeEn);
      const isNight = /রাত|night/i.test(timeEn);

      if ((isEvening || isNight) && hours < 12) {
        hours += 12;
      } else if (isAfternoon && hours < 12 && hours >= 1) {
        hours += 12;
      } else if (isMorning && hours === 12) {
        hours = 0;
      }
      return new Date(year, month - 1, day, hours, minutes, 0, 0);
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Check if a Doctor at Home slot is available with minimum lead time.
 * User requirement: "Doctor at Home Bookings অপশনে ২ ঘন্টা আগে স্লট বুকিং দিতে পারবে"
 * Strictly enforces a minimum 2 hours advance notice before slot start time.
 */
export const isDoctorAtHomeSlotAvailable = (
  dateStr?: string, 
  slotInput?: DoctorAtHomeTimeSlot | string,
  leadTimeHours: number = 2
): boolean => {
  if (!dateStr || !slotInput) return false;

  const slotDate = parseDoctorAtHomeSlotStartTime(dateStr, slotInput);
  if (!slotDate) return true; // fallback to allow booking if time cannot be parsed

  const now = new Date();
  const diffMs = slotDate.getTime() - now.getTime();
  const minRequiredMs = leadTimeHours * 60 * 60 * 1000;

  return diffMs >= minRequiredMs;
};



export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat_general', name: 'General', nameBn: 'সাধারণ স্বাস্থ্য', description: 'Routine checkups, CBC, and essential baseline screening', icon: 'FlaskConical', color: 'blue', order: 1, isHidden: false },
  { id: 'cat_diabetes', name: 'Diabetes', nameBn: 'ডায়াবেটিস', description: 'Fasting glucose, HbA1c, oral glucose tolerance, and insulin levels', icon: 'Droplet', color: 'rose', order: 2, isHidden: false },
  { id: 'cat_heart', name: 'Heart', nameBn: 'হার্ট ও কার্ডিয়াক', description: 'Lipid profile, cholesterol, cardiac markers, and heart risk profiles', icon: 'HeartPulse', color: 'red', order: 3, isHidden: false },
  { id: 'cat_thyroid', name: 'Thyroid', nameBn: 'থাইরয়েড', description: 'TSH, Free T3, Free T4, and thyroid metabolism screenings', icon: 'Activity', color: 'purple', order: 4, isHidden: false },
  { id: 'cat_vitamin', name: 'Vitamin', nameBn: 'ভিটামিন ও নিউট্রিশন', description: 'Vitamin D3, B12, Calcium, Iron deficiency & micronutrients', icon: 'Zap', color: 'amber', order: 5, isHidden: false },
  { id: 'cat_kidney', name: 'Kidney', nameBn: 'কিডনি ও রেনাল', description: 'Serum Creatinine, Urea, Uric Acid, Electrolytes & KFT panels', icon: 'ShieldCheck', color: 'cyan', order: 6, isHidden: false },
  { id: 'cat_liver', name: 'Liver', nameBn: 'লিভার (LFT)', description: 'SGPT, SGOT, Bilirubin, Albumin, and hepatic enzymes screening', icon: 'Layers', color: 'emerald', order: 7, isHidden: false },
  { id: 'cat_infection', name: 'Infection', nameBn: 'ইনফেকশন ও ইমিউনিটি', description: 'Dengue, Widal, Malaria, CRP, Urine R/E, and fever panels', icon: 'AlertCircle', color: 'orange', order: 8, isHidden: false },
  { id: 'cat_women', name: 'Women Health', nameBn: 'নারী স্বাস্থ্য', description: 'Hormones, PCOS, pregnancy, calcium, and women wellness panels', icon: 'Sparkles', color: 'pink', order: 9, isHidden: false },
  { id: 'cat_senior', name: 'Senior', nameBn: 'সিনিয়র স্বাস্থ্য', description: 'Comprehensive geriatric panels tailored for elderly parents', icon: 'User', color: 'indigo', order: 10, isHidden: false },
  { id: 'cat_fullbody', name: 'Full Body', nameBn: 'ফুল বডি চেকআপ', description: 'Master executive whole body preventive health checkups', icon: 'Award', color: 'teal', order: 11, isHidden: false }
];

export const getStoredCategories = (): CategoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return DEFAULT_CATEGORIES;
  } catch (e) {
    console.error("Error reading stored categories:", e);
    return DEFAULT_CATEGORIES;
  }
};

export const saveStoredCategories = (categories: CategoryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error("Error saving stored categories:", e);
  }
};

const DEFAULT_PATIENTS: PatientUser[] = [
  {
    id: "usr_rahim",
    name: "Rahim Ahmed",
    phone: "01712345678",
    email: "rahim@example.com",
    password: "password123",
    address: "House 12, Road 5, Dhanmondi, Dhaka",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100",
    gender: "male",
    age: "32",
    bloodGroup: "B+",
    createdAt: "2024-01-15T09:00:00Z"
  },
  {
    id: "usr_salma",
    name: "Salma Begum",
    phone: "01912345678",
    email: "salma@example.com",
    password: "password123",
    address: "Block C, Mirpur 10, Dhaka",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100",
    gender: "female",
    age: "28",
    bloodGroup: "O+",
    createdAt: "2024-02-10T14:30:00Z"
  }
];


const INITIAL_BOOKINGS: BookingHistoryItem[] = [
  {
    id: "20240322-2025",
    customerName: "রাহিম আহমেদ (Rahim Ahmed)",
    customerPhone: "01712345678",
    customerAddress: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা",
    date: "2024-03-22",
    time: "10:00 AM - 11:00 AM",
    labId: "lab_popular",
    labName: "পপুলার ডায়াগনস্টিক সেন্টার লিঃ",
    testNames: ["কমপ্লিট ব্লাড কাউন্ট (CBC)", "লিপিড প্রোফাইল"],
    subtotal: 1955,
    accessoriesFee: 45,
    collectionFee: 150,
    totalCost: 2150,
    paymentMethod: "cod",
    status: "pending",
    doctorName: "Dr. K. M. Rahman",
    createdAt: "2024-03-20T10:30:00Z"
  },
  {
    id: "20240322-2024",
    customerName: "করিম উদ্দিন (Karim Uddin)",
    customerPhone: "01812345678",
    customerAddress: "প্লট ৯, সেক্টর ৩, উত্তরা, ঢাকা",
    date: "2024-03-22",
    time: "11:00 AM - 12:00 PM",
    labId: "lab_labaid",
    labName: "ল্যাবএইড ডায়াগনস্টিক সেন্টার",
    testNames: ["ডায়াবেটিস চেকআপ (HbA1c)"],
    subtotal: 1055,
    accessoriesFee: 45,
    collectionFee: 150,
    totalCost: 1250,
    paymentMethod: "bkash",
    transactionId: "TRX93847291",
    status: "confirmed",
    createdAt: "2024-03-21T08:15:00Z"
  },
  {
    id: "20240321-2023",
    customerName: "সালমা বেগম (Salma Begum)",
    customerPhone: "01912345678",
    customerAddress: "ব্লক সি, মিরপুর ১০, ঢাকা",
    date: "2024-03-21",
    time: "09:00 AM - 10:00 AM",
    labId: "lab_birdem",
    labName: "বারডেম জেনারেল হাসপাতাল",
    testNames: ["ভিটামিন ডি টেস্ট", "থাইরয়েড প্রোফাইল (T3, T4, TSH)"],
    subtotal: 3385,
    accessoriesFee: 45,
    collectionFee: 120,
    totalCost: 3550,
    paymentMethod: "cod",
    status: "completed",
    doctorName: "Prof. Dr. Nazmul Huda",
    createdAt: "2024-03-19T14:20:00Z"
  },
  {
    id: "20240318-2022",
    customerName: "তানভীর হাসান (Tanvir Hasan)",
    customerPhone: "01612345678",
    customerAddress: "রোড ৮, বনানী, ঢাকা",
    date: "2024-03-21",
    time: "02:00 PM - 03:00 PM",
    labId: "lab_bsmmu",
    labName: "বিএসএমএমইউ (পিজি হাসপাতাল)",
    testNames: ["কমপ্লিট ব্লাড কাউন্ট (CBC)"],
    subtotal: 255,
    accessoriesFee: 45,
    collectionFee: 100,
    totalCost: 400,
    paymentMethod: "cod",
    status: "cancelled",
    createdAt: "2024-03-18T16:45:00Z"
  }
];

export const getAdminTestOverrides = (): Record<string, Partial<TestPackage>> => {
  try {
    const raw = localStorage.getItem('labhome_admin_test_overrides_v2');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading admin test overrides:", e);
  }
  return {};
};

export const saveAdminTestOverride = (test: TestPackage): void => {
  try {
    const current = getAdminTestOverrides();
    current[String(test.id)] = {
      ...test,
      id: String(test.id),
      updatedAt: test.updatedAt || new Date().toISOString()
    };
    localStorage.setItem('labhome_admin_test_overrides_v2', JSON.stringify(current));
  } catch (e) {
    console.error("Error saving admin test override:", e);
  }
};

export const getStoredTests = (lang: Language): TestPackage[] => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.TESTS_EN : STORAGE_KEYS.TESTS_BN;
    const stored = localStorage.getItem(key);
    const defaultList = getDefaultTests(lang);
    const overrides = getAdminTestOverrides();

    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let changed = false;
        const existingIds = new Set(parsed.map((p: TestPackage) => String(p.id)));
        const missingDefaults = defaultList.filter(d => !existingIds.has(String(d.id)));
        let updatedList: TestPackage[] = parsed.map((p: TestPackage) => ({ ...p, id: String(p.id) }));
        if (missingDefaults.length > 0) {
          updatedList = [...updatedList, ...missingDefaults.map(d => ({ ...d, id: String(d.id) }))];
          changed = true;
        }

        // Strictly deduplicate by test ID and test name so no test exists twice
        const seenIds = new Set<string>();
        const seenNames = new Set<string>();
        const deduplicated: TestPackage[] = [];
        for (const t of updatedList) {
          const strId = String(t.id);
          const normName = (t.name || '').trim().toLowerCase();
          if (normName && !seenIds.has(strId) && !seenNames.has(normName)) {
            seenIds.add(strId);
            seenNames.add(normName);
            deduplicated.push({ ...t, id: strId });
          } else {
            changed = true;
          }
        }
        
        // Apply persistent admin overrides
        updatedList = deduplicated.map(t => {
          const ov = overrides[String(t.id)];
          if (ov) {
            return {
              ...t,
              ...ov,
              id: String(t.id),
              name: (lang === 'bn' && t.name) ? t.name : (ov.name || t.name)
            };
          }
          return t;
        });

        if (changed) {
          localStorage.setItem(key, JSON.stringify(updatedList));
        }
        return updatedList;
      }
    }
    
    // Fallback with overrides applied
    return defaultList.map(t => {
      const ov = overrides[String(t.id)];
      if (ov) {
        return {
          ...t,
          ...ov,
          id: String(t.id),
          name: (lang === 'bn' && t.name) ? t.name : (ov.name || t.name)
        };
      }
      return t;
    });
  } catch (e) {
    console.error("Failed to parse stored tests:", e);
  }
  return getDefaultTests(lang);
};

export const saveStoredTests = (lang: Language, tests: TestPackage[]): void => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.TESTS_EN : STORAGE_KEYS.TESTS_BN;
    const nowIso = new Date().toISOString();
    const cleanTests = tests.map(t => ({ 
      ...t, 
      id: String(t.id),
      updatedAt: t.updatedAt || nowIso
    }));
    localStorage.setItem(key, JSON.stringify(cleanTests));
    localStorage.setItem(`labhome_tests_updated_at_${lang}`, nowIso);
    
    // Save each test into persistent admin overrides
    cleanTests.forEach(test => {
      saveAdminTestOverride(test);
    });

    // Also sync test IDs, prices, lab matrix, categories, and status to other language
    const otherLang = lang === 'en' ? 'bn' : 'en';
    const otherKey = otherLang === 'en' ? STORAGE_KEYS.TESTS_EN : STORAGE_KEYS.TESTS_BN;
    const otherStored = localStorage.getItem(otherKey);
    let otherTests: TestPackage[] = otherStored ? JSON.parse(otherStored) : getDefaultTests(otherLang);
    
    // Update existing or append new
    const updatedOtherTests = [...otherTests];
    cleanTests.forEach(test => {
      const idx = updatedOtherTests.findIndex(ot => String(ot.id) === String(test.id));
      if (idx !== -1) {
        updatedOtherTests[idx] = {
          ...updatedOtherTests[idx],
          price: test.price,
          originalPrice: test.originalPrice,
          discountPercent: test.discountPercent,
          priceByLab: test.priceByLab ? { ...test.priceByLab } : updatedOtherTests[idx].priceByLab,
          originalPriceByLab: test.originalPriceByLab ? { ...test.originalPriceByLab } : updatedOtherTests[idx].originalPriceByLab,
          hiddenLabs: test.hiddenLabs ? [...test.hiddenLabs] : [],
          isHidden: !!test.isHidden,
          category: test.category || updatedOtherTests[idx].category,
          categories: (test.categories && test.categories.length > 0) ? [...test.categories] : updatedOtherTests[idx].categories,
          turnaroundTime: test.turnaroundTime || updatedOtherTests[idx].turnaroundTime,
          image: test.image || updatedOtherTests[idx].image,
          orderCount: test.orderCount !== undefined ? test.orderCount : updatedOtherTests[idx].orderCount,
          updatedAt: test.updatedAt || nowIso
        };
      } else {
        updatedOtherTests.unshift({ ...test, updatedAt: nowIso });
      }
    });
    // Remove deleted custom tests from other language, but preserve default catalog tests
    const defaultIds = new Set(getDefaultTests(lang).map(d => String(d.id)));
    const currentIds = new Set(cleanTests.map(t => String(t.id)));
    const filteredOther = updatedOtherTests.filter(ot => currentIds.has(String(ot.id)) || defaultIds.has(String(ot.id)));
    localStorage.setItem(otherKey, JSON.stringify(filteredOther));
    localStorage.setItem(`labhome_tests_updated_at_${otherLang}`, nowIso);
  } catch (e) {
    console.error("Failed to save tests to storage:", e);
  }
};

export const getStoredPackages = (lang: Language): HealthPackage[] => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.PACKAGES_EN : STORAGE_KEYS.PACKAGES_BN;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored packages:", e);
  }
  return getDefaultPackages(lang);
};

export const saveStoredPackages = (lang: Language, packages: HealthPackage[]): void => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.PACKAGES_EN : STORAGE_KEYS.PACKAGES_BN;
    localStorage.setItem(key, JSON.stringify(packages));

    const otherLang = lang === 'en' ? 'bn' : 'en';
    const otherKey = otherLang === 'en' ? STORAGE_KEYS.PACKAGES_EN : STORAGE_KEYS.PACKAGES_BN;
    const otherStored = localStorage.getItem(otherKey);
    let otherPackages: HealthPackage[] = otherStored ? JSON.parse(otherStored) : getDefaultPackages(otherLang);

    const updatedOtherPackages = [...otherPackages];
    packages.forEach(pkg => {
      const idx = updatedOtherPackages.findIndex(op => op.id === pkg.id);
      if (idx !== -1) {
        updatedOtherPackages[idx] = {
          ...updatedOtherPackages[idx],
          name: updatedOtherPackages[idx].name || pkg.name,
          tagline: updatedOtherPackages[idx].tagline || pkg.tagline,
          description: updatedOtherPackages[idx].description || pkg.description,
          price: pkg.price,
          originalPrice: pkg.originalPrice,
          discountPercent: pkg.discountPercent,
          priceByLab: pkg.priceByLab,
          originalPriceByLab: pkg.originalPriceByLab,
          isHidden: pkg.isHidden,
          category: pkg.category,
          testCount: pkg.testCount,
          includededTests: pkg.includededTests,
          sampleType: pkg.sampleType,
          fastingRequirement: pkg.fastingRequirement,
          turnaroundTime: pkg.turnaroundTime,
          image: pkg.image,
          popularBadge: pkg.popularBadge,
          badgeColor: pkg.badgeColor
        };
      } else {
        updatedOtherPackages.unshift({ ...pkg });
      }
    });
    const currentIds = new Set(packages.map(p => p.id));
    const filteredOther = updatedOtherPackages.filter(op => currentIds.has(op.id));
    localStorage.setItem(otherKey, JSON.stringify(filteredOther));
  } catch (e) {
    console.error("Failed to save packages to storage:", e);
  }
};

export const getStoredLabs = (lang: Language): LabPartner[] => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.LABS_EN : STORAGE_KEYS.LABS_BN;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored labs:", e);
  }
  return getDefaultLabs(lang);
};

export const saveStoredLabs = (lang: Language, labs: LabPartner[]): void => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.LABS_EN : STORAGE_KEYS.LABS_BN;
    localStorage.setItem(key, JSON.stringify(labs));

    // Also sync lab IDs, serviceCharge, rating, hidden status, and new labs to other language
    const otherLang = lang === 'en' ? 'bn' : 'en';
    const otherKey = otherLang === 'en' ? STORAGE_KEYS.LABS_EN : STORAGE_KEYS.LABS_BN;
    const otherStored = localStorage.getItem(otherKey);
    let otherLabs: LabPartner[] = otherStored ? JSON.parse(otherStored) : getDefaultLabs(otherLang);

    const updatedOtherLabs = [...otherLabs];
    labs.forEach(lab => {
      const idx = updatedOtherLabs.findIndex(ol => ol.id === lab.id);
      if (idx !== -1) {
        updatedOtherLabs[idx] = {
          ...updatedOtherLabs[idx],
          serviceCharge: lab.serviceCharge,
          rating: lab.rating,
          isHidden: lab.isHidden,
          location: lab.location,
          logo: lab.logo,
          discountBadge: lab.discountBadge,
          accreditation: lab.accreditation,
          accentColor: lab.accentColor
        };
      } else {
        updatedOtherLabs.push({ ...lab });
      }
    });
    const currentIds = new Set(labs.map(l => l.id));
    const filteredOther = updatedOtherLabs.filter(ol => currentIds.has(ol.id));
    localStorage.setItem(otherKey, JSON.stringify(filteredOther));
  } catch (e) {
    console.error("Failed to save labs to storage:", e);
  }
};

const DELETED_BOOKINGS_KEY = 'eclinic_deleted_bookings_v2';

export const getDeletedBookingIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(DELETED_BOOKINGS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
};

export const markBookingAsDeleted = (id: string): void => {
  try {
    const set = getDeletedBookingIds();
    const rawId = String(id).trim();
    const cleanId = rawId.replace(/^#?EC-?/i, '').replace(/^#?BK-?/i, '').replace(/^#?LH-?/i, '').replace(/^#/, '');
    set.add(rawId);
    if (cleanId) {
      set.add(cleanId);
      set.add(`LH-${cleanId}`);
      set.add(`#LH-${cleanId}`);
      set.add(`EC-${cleanId}`);
    }
    if (rawId.startsWith('#')) {
      set.add(rawId.slice(1));
    } else {
      set.add(`#${rawId}`);
    }
    localStorage.setItem(DELETED_BOOKINGS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
};

export const getStoredBookings = (): BookingHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const deletedIds = getDeletedBookingIds();
        const seen = new Set<string>();
        const deduplicated: BookingHistoryItem[] = [];
        for (const item of parsed) {
          if (item && item.id) {
            const rawId = String(item.id);
            if (deletedIds.has(rawId) || deletedIds.has(rawId.replace(/^#?LH-?/i, ''))) {
              continue;
            }
            if (!seen.has(rawId)) {
              seen.add(rawId);
              deduplicated.push(item);
            }
          }
        }
        return deduplicated;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored bookings:", e);
  }
  const deletedIds = getDeletedBookingIds();
  return INITIAL_BOOKINGS.filter(b => !deletedIds.has(b.id));
};

export const saveStoredBookings = (bookings: BookingHistoryItem[]): void => {
  try {
    const deletedIds = getDeletedBookingIds();
    const seen = new Set<string>();
    const deduplicated = bookings.filter(item => {
      if (!item || !item.id || seen.has(item.id)) return false;
      if (deletedIds.has(item.id) || deletedIds.has(item.id.replace(/^#?LH-?/i, ''))) return false;
      seen.add(item.id);
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(deduplicated));
  } catch (e) {
    console.error("Failed to save bookings to storage:", e);
  }
};

/**
 * Sanitizes any string across the application to enforce "eClinic Bangladesh" over legacy "LabHome BD"
 */
export const cleanBrandText = (text?: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/support@labhomebd\.com/gi, 'support@eclinicbd.com')
    .replace(/www\.labhomebd\.com/gi, 'www.eclinicbd.com')
    .replace(/labhomebd\.com/gi, 'eclinicbd.com')
    .replace(/labhome\.com/gi, 'eclinicbd.com')
    .replace(/facebook\.com\/labhomebd/gi, 'facebook.com/eclinicbangladesh')
    .replace(/linkedin\.com\/company\/labhomebd/gi, 'linkedin.com/company/eclinicbangladesh')
    .replace(/youtube\.com\/@labhomebd/gi, 'youtube.com/@eclinicbangladesh')
    .replace(/instagram\.com\/labhomebd/gi, 'instagram.com/eclinicbangladesh')
    .replace(/Lab\s*Home\s*BD/gi, 'eClinic Bangladesh')
    .replace(/LabHome\s*BD/gi, 'eClinic Bangladesh')
    .replace(/Lab\s*Home/gi, 'eClinic')
    .replace(/LabHome/gi, 'eClinic')
    .replace(/ল্যাব\s*হোম\s*বিডি/gi, 'eClinic Bangladesh')
    .replace(/ল্যাবহোম\s*বিডি/gi, 'eClinic Bangladesh')
    .replace(/ল্যাব\s*হোম/gi, 'eClinic')
    .replace(/ল্যাবহোম/gi, 'eClinic');
};

export const getStoredSiteSettings = (lang: Language): SiteSettings => {
  const defaultSettings = getDefaultSiteSettings(lang);
  try {
    const key = lang === 'en' ? STORAGE_KEYS.SITE_SETTINGS_EN : STORAGE_KEYS.SITE_SETTINGS_BN;
    const otherKey = lang === 'en' ? STORAGE_KEYS.SITE_SETTINGS_BN : STORAGE_KEYS.SITE_SETTINGS_EN;
    const stored = localStorage.getItem(key);
    const otherStored = localStorage.getItem(otherKey);

    let parsed = stored ? JSON.parse(stored) : null;
    let otherParsed = otherStored ? JSON.parse(otherStored) : null;

    if (parsed && typeof parsed === 'object' && parsed.siteName) {
      // Global module visibility flags: if explicitly disabled in either language, respect it globally
      const isDocInactive = parsed.showDoctorsSection === false || (otherParsed && otherParsed.showDoctorsSection === false);
      const isNursingInactive = parsed.showNursingSection === false || (otherParsed && otherParsed.showNursingSection === false);
      const isPartnerInactive = parsed.showPartnerSection === false || (otherParsed && otherParsed.showPartnerSection === false);
      const isPopularInactive = parsed.showPopularTestsSection === false || (otherParsed && otherParsed.showPopularTestsSection === false);
      const isPackagesInactive = parsed.showPackagesSection === false || (otherParsed && otherParsed.showPackagesSection === false);
      const isAppInactive = parsed.showAppDownloadSection === false || (otherParsed && otherParsed.showAppDownloadSection === false);
      const isHowItWorksInactive = parsed.showHowItWorksSection === false || (otherParsed && otherParsed.showHowItWorksSection === false);
      const isServicesInactive = parsed.showServicesSection === false || (otherParsed && otherParsed.showServicesSection === false);

      const rawWhatsApp = parsed.contactWhatsApp || otherParsed?.contactWhatsApp;
      const cleanWhatsApp = (rawWhatsApp && !rawWhatsApp.includes('01700000000') && rawWhatsApp !== '01700-000000') ? rawWhatsApp : '+8801586366002';

      const cleanSiteName = cleanBrandText(parsed.siteName) || 'eClinic Bangladesh';

      // Language-aware About Title
      let cleanAboutTitle: string;
      if (parsed.aboutTitle && parsed.aboutTitle.trim()) {
        cleanAboutTitle = cleanBrandText(parsed.aboutTitle.trim());
      } else {
        cleanAboutTitle = defaultSettings.aboutTitle || (lang === 'bn' ? 'আমাদের সম্পর্কে (About Us)' : 'About eClinic Bangladesh');
      }

      // Language-aware About Description
      let cleanAboutDesc: string;
      if (parsed.aboutDescription && parsed.aboutDescription.trim()) {
        cleanAboutDesc = cleanBrandText(parsed.aboutDescription.trim());
      } else {
        cleanAboutDesc = defaultSettings.aboutDescription;
      }

      // Language-aware About Story
      let cleanAboutStory: string;
      if (parsed.aboutStory && parsed.aboutStory.trim()) {
        cleanAboutStory = cleanBrandText(parsed.aboutStory.trim());
      } else {
        cleanAboutStory = defaultSettings.aboutStory;
      }

      const cleanInvoiceOrg = cleanBrandText(parsed.invoiceOrgName) || 'eClinic Bangladesh';
      const cleanWatermark = (parsed.invoiceWatermark && !parsed.invoiceWatermark.includes('LabHome')) ? parsed.invoiceWatermark : 'eClinic BD';

      return {
        ...defaultSettings,
        ...parsed,
        siteName: cleanSiteName,
        siteTagline: cleanBrandText(parsed.siteTagline) || defaultSettings.siteTagline,
        aboutBadge: cleanBrandText(parsed.aboutBadge) || defaultSettings.aboutBadge,
        contactEmail: cleanBrandText(parsed.contactEmail) || 'support@eclinicbd.com',
        contactAddress: cleanBrandText(parsed.contactAddress) || defaultSettings.contactAddress,
        contactWhatsApp: cleanWhatsApp,
        heroBtnHomeDoctor: parsed.heroBtnHomeDoctor || (lang === 'bn' ? 'হোম ডক্টর' : 'Home Doctor'),
        showHeroHomeDoctorBtn: parsed.showHeroHomeDoctorBtn !== undefined ? parsed.showHeroHomeDoctorBtn : true,
        showDoctorsSection: !isDocInactive,
        showNursingSection: !isNursingInactive,
        showPartnerSection: !isPartnerInactive,
        showPopularTestsSection: !isPopularInactive,
        showPackagesSection: !isPackagesInactive,
        showAppDownloadSection: !isAppInactive,
        showHowItWorksSection: !isHowItWorksInactive,
        showServicesSection: !isServicesInactive,
        aboutTitle: cleanAboutTitle,
        aboutDescription: cleanAboutDesc,
        aboutStory: cleanAboutStory,
        invoiceOrgName: cleanInvoiceOrg,
        invoiceWatermark: cleanWatermark,
        heroImages: (Array.isArray(parsed.heroImages) && parsed.heroImages.length > 0) ? parsed.heroImages : (Array.isArray(otherParsed?.heroImages) && otherParsed.heroImages.length > 0 ? otherParsed.heroImages : defaultSettings.heroImages),
        howItWorksSteps: (Array.isArray(parsed.howItWorksSteps) && parsed.howItWorksSteps.length > 0) ? parsed.howItWorksSteps : defaultSettings.howItWorksSteps,
        aboutStats: (Array.isArray(parsed.aboutStats) && parsed.aboutStats.length > 0) 
          ? parsed.aboutStats.map((st: any) => ({ label: cleanBrandText(st?.label), value: cleanBrandText(st?.value) }))
          : defaultSettings.aboutStats,
        services: (Array.isArray(parsed.services) && parsed.services.length > 0) ? parsed.services : defaultSettings.services,
        nursingServices: (Array.isArray(parsed.nursingServices) && parsed.nursingServices.length > 0) ? parsed.nursingServices : defaultSettings.nursingServices,
        doctorAtHomeSpecialties: (Array.isArray(parsed.doctorAtHomeSpecialties) && parsed.doctorAtHomeSpecialties.length > 0) 
          ? parsed.doctorAtHomeSpecialties.map(s => ({ ...s, imageUrl: (!s.imageUrl || s.imageUrl.includes('unsplash.com')) ? MALE_DOCTOR_VECTOR_ICON : s.imageUrl }))
          : (Array.isArray(otherParsed?.doctorAtHomeSpecialties) && otherParsed.doctorAtHomeSpecialties.length > 0 
              ? otherParsed.doctorAtHomeSpecialties.map(s => ({ ...s, imageUrl: (!s.imageUrl || s.imageUrl.includes('unsplash.com')) ? MALE_DOCTOR_VECTOR_ICON : s.imageUrl }))
              : getStoredDoctorAtHomeSpecialties()),
        homeSectionsOrder: (Array.isArray(parsed.homeSectionsOrder) && parsed.homeSectionsOrder.length > 0) ? parsed.homeSectionsOrder : (Array.isArray(otherParsed?.homeSectionsOrder) && otherParsed.homeSectionsOrder.length > 0 ? otherParsed.homeSectionsOrder : defaultSettings.homeSectionsOrder)
      };
    } else if (otherParsed && typeof otherParsed === 'object' && otherParsed.siteName) {
      const rawWhatsApp = otherParsed.contactWhatsApp;
      const cleanWhatsApp = (rawWhatsApp && !rawWhatsApp.includes('01700000000') && rawWhatsApp !== '01700-000000') ? rawWhatsApp : '+8801586366002';

      const cleanSiteName = cleanBrandText(otherParsed.siteName) || 'eClinic Bangladesh';
      const cleanInvoiceOrg = cleanBrandText(otherParsed.invoiceOrgName) || 'eClinic Bangladesh';
      const cleanWatermark = (otherParsed.invoiceWatermark && !otherParsed.invoiceWatermark.includes('LabHome')) ? otherParsed.invoiceWatermark : 'eClinic BD';

      return {
        ...defaultSettings,
        siteName: cleanSiteName,
        contactWhatsApp: cleanWhatsApp,
        heroBtnHomeDoctor: otherParsed.heroBtnHomeDoctor || (lang === 'bn' ? 'হোম ডক্টর' : 'Home Doctor'),
        showHeroHomeDoctorBtn: otherParsed.showHeroHomeDoctorBtn !== undefined ? otherParsed.showHeroHomeDoctorBtn : true,
        showDoctorsSection: otherParsed.showDoctorsSection !== false,
        showNursingSection: otherParsed.showNursingSection !== false,
        showPartnerSection: otherParsed.showPartnerSection !== false,
        showPopularTestsSection: otherParsed.showPopularTestsSection !== false,
        showPackagesSection: otherParsed.showPackagesSection !== false,
        showAppDownloadSection: otherParsed.showAppDownloadSection !== false,
        showHowItWorksSection: otherParsed.showHowItWorksSection !== false,
        showServicesSection: otherParsed.showServicesSection !== false,
        aboutTitle: defaultSettings.aboutTitle,
        aboutDescription: defaultSettings.aboutDescription,
        aboutStory: defaultSettings.aboutStory,
        siteTagline: defaultSettings.siteTagline,
        invoiceOrgName: cleanInvoiceOrg,
        invoiceWatermark: cleanWatermark,
        heroImages: (Array.isArray(otherParsed.heroImages) && otherParsed.heroImages.length > 0) ? otherParsed.heroImages : defaultSettings.heroImages,
        doctorAtHomeSpecialties: (Array.isArray(otherParsed.doctorAtHomeSpecialties) && otherParsed.doctorAtHomeSpecialties.length > 0)
          ? otherParsed.doctorAtHomeSpecialties.map(s => ({ ...s, imageUrl: (!s.imageUrl || s.imageUrl.includes('unsplash.com')) ? MALE_DOCTOR_VECTOR_ICON : s.imageUrl }))
          : getStoredDoctorAtHomeSpecialties(),
        homeSectionsOrder: (Array.isArray(otherParsed.homeSectionsOrder) && otherParsed.homeSectionsOrder.length > 0) ? otherParsed.homeSectionsOrder : defaultSettings.homeSectionsOrder
      };
    }
  } catch (e) {
    console.error("Failed to parse stored site settings:", e);
  }
  return defaultSettings;
};

export const saveStoredSiteSettings = (lang: Language, settings: SiteSettings): void => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.SITE_SETTINGS_EN : STORAGE_KEYS.SITE_SETTINGS_BN;
    const defaultSettingsCurrent = getDefaultSiteSettings(lang);

    const cleanSettings: SiteSettings = {
      ...settings,
      siteName: cleanBrandText(settings.siteName) || 'eClinic Bangladesh',
      siteTagline: cleanBrandText(settings.siteTagline) || defaultSettingsCurrent.siteTagline,
      aboutBadge: cleanBrandText(settings.aboutBadge) || defaultSettingsCurrent.aboutBadge,
      aboutTitle: settings.aboutTitle && settings.aboutTitle.trim() ? cleanBrandText(settings.aboutTitle.trim()) : defaultSettingsCurrent.aboutTitle,
      aboutDescription: settings.aboutDescription && settings.aboutDescription.trim() ? cleanBrandText(settings.aboutDescription.trim()) : defaultSettingsCurrent.aboutDescription,
      aboutStory: settings.aboutStory && settings.aboutStory.trim() ? cleanBrandText(settings.aboutStory.trim()) : defaultSettingsCurrent.aboutStory,
      aboutStats: (Array.isArray(settings.aboutStats) && settings.aboutStats.length > 0)
        ? settings.aboutStats.map((st: any) => ({ label: cleanBrandText(st?.label), value: cleanBrandText(st?.value) }))
        : defaultSettingsCurrent.aboutStats,
      contactAddress: cleanBrandText(settings.contactAddress) || defaultSettingsCurrent.contactAddress,
      contactEmail: cleanBrandText(settings.contactEmail) || 'support@eclinicbd.com',
      invoiceOrgName: cleanBrandText(settings.invoiceOrgName) || 'eClinic Bangladesh',
      invoiceWatermark: (settings.invoiceWatermark && !settings.invoiceWatermark.includes('LabHome')) ? settings.invoiceWatermark : 'eClinic BD'
    };
    localStorage.setItem(key, JSON.stringify(cleanSettings));

    if (settings.doctorAtHomeSpecialties && Array.isArray(settings.doctorAtHomeSpecialties)) {
      saveStoredDoctorAtHomeSpecialties(settings.doctorAtHomeSpecialties);
    }

    // Also sync contact information, logo, hero images, and phone numbers to other language version
    const otherLang = lang === 'en' ? 'bn' : 'en';
    const otherKey = otherLang === 'en' ? STORAGE_KEYS.SITE_SETTINGS_EN : STORAGE_KEYS.SITE_SETTINGS_BN;
    const otherStored = localStorage.getItem(otherKey);
    let otherSettings: SiteSettings = otherStored ? JSON.parse(otherStored) : getDefaultSiteSettings(otherLang);
    const defaultSettingsOther = getDefaultSiteSettings(otherLang);

    const mergedOther: SiteSettings = {
      ...otherSettings,
      siteName: cleanBrandText(otherSettings.siteName) || 'eClinic Bangladesh',
      siteTagline: cleanBrandText(otherSettings.siteTagline) || defaultSettingsOther.siteTagline,
      aboutBadge: cleanBrandText(otherSettings.aboutBadge) || defaultSettingsOther.aboutBadge,
      aboutTitle: otherSettings.aboutTitle && otherSettings.aboutTitle.trim() ? cleanBrandText(otherSettings.aboutTitle.trim()) : defaultSettingsOther.aboutTitle,
      aboutDescription: otherSettings.aboutDescription && otherSettings.aboutDescription.trim() ? cleanBrandText(otherSettings.aboutDescription.trim()) : defaultSettingsOther.aboutDescription,
      aboutStory: otherSettings.aboutStory && otherSettings.aboutStory.trim() ? cleanBrandText(otherSettings.aboutStory.trim()) : defaultSettingsOther.aboutStory,
      aboutStats: (Array.isArray(otherSettings.aboutStats) && otherSettings.aboutStats.length > 0)
        ? otherSettings.aboutStats.map((st: any) => ({ label: cleanBrandText(st?.label), value: cleanBrandText(st?.value) }))
        : defaultSettingsOther.aboutStats,
      contactAddress: cleanBrandText(otherSettings.contactAddress) || defaultSettingsOther.contactAddress,
      contactEmail: cleanBrandText(otherSettings.contactEmail) || 'support@eclinicbd.com',
      invoiceOrgName: cleanBrandText(otherSettings.invoiceOrgName) || 'eClinic Bangladesh',
      invoiceWatermark: (otherSettings.invoiceWatermark && !otherSettings.invoiceWatermark.includes('LabHome')) ? otherSettings.invoiceWatermark : 'eClinic BD',
      logoUrl: settings.logoUrl,
      logoIcon: settings.logoIcon,
      faviconUrl: settings.faviconUrl || otherSettings.faviconUrl,
      heroImages: settings.heroImages || otherSettings.heroImages,
      homeSectionsOrder: settings.homeSectionsOrder || otherSettings.homeSectionsOrder,
      showPartnerSection: settings.showPartnerSection !== undefined ? settings.showPartnerSection : otherSettings.showPartnerSection,
      showPopularTestsSection: settings.showPopularTestsSection !== undefined ? settings.showPopularTestsSection : otherSettings.showPopularTestsSection,
      showPackagesSection: settings.showPackagesSection !== undefined ? settings.showPackagesSection : otherSettings.showPackagesSection,
      showDoctorsSection: settings.showDoctorsSection !== undefined ? settings.showDoctorsSection : otherSettings.showDoctorsSection,
      showNursingSection: settings.showNursingSection !== undefined ? settings.showNursingSection : otherSettings.showNursingSection,
      showDoctorAtHomeSection: settings.showDoctorAtHomeSection !== undefined ? settings.showDoctorAtHomeSection : otherSettings.showDoctorAtHomeSection,
      doctorAtHomeSpecialties: settings.doctorAtHomeSpecialties || otherSettings.doctorAtHomeSpecialties,
      showAppDownloadSection: settings.showAppDownloadSection !== undefined ? settings.showAppDownloadSection : otherSettings.showAppDownloadSection,
      showHowItWorksSection: settings.showHowItWorksSection !== undefined ? settings.showHowItWorksSection : otherSettings.showHowItWorksSection,
      showServicesSection: settings.showServicesSection !== undefined ? settings.showServicesSection : otherSettings.showServicesSection,
      androidAppUrl: settings.androidAppUrl || otherSettings.androidAppUrl,
      iosAppUrl: settings.iosAppUrl || otherSettings.iosAppUrl,
      apkDownloadUrl: settings.apkDownloadUrl || otherSettings.apkDownloadUrl,
      showAppButtonsInHero: settings.showAppButtonsInHero !== undefined ? settings.showAppButtonsInHero : otherSettings.showAppButtonsInHero,
      showHeroHomeDoctorBtn: settings.showHeroHomeDoctorBtn !== undefined ? settings.showHeroHomeDoctorBtn : otherSettings.showHeroHomeDoctorBtn,
      heroBtnHomeDoctor: settings.heroBtnHomeDoctor || otherSettings.heroBtnHomeDoctor,
      showAppButtonsInFooter: settings.showAppButtonsInFooter !== undefined ? settings.showAppButtonsInFooter : otherSettings.showAppButtonsInFooter,
      aboutImage: settings.aboutImage || otherSettings.aboutImage,
      contactPhone: settings.contactPhone,
      contactHotline: settings.contactHotline,
      contactWhatsApp: settings.contactWhatsApp,
      emergencyNumber: settings.emergencyNumber,
      doctorsEmergencyHotline: settings.doctorsEmergencyHotline || otherSettings.doctorsEmergencyHotline,
      nursingHotline: settings.nursingHotline || otherSettings.nursingHotline,
      nursingWhatsApp: settings.nursingWhatsApp || otherSettings.nursingWhatsApp,
      facebookUrl: settings.facebookUrl || otherSettings.facebookUrl,
      linkedinUrl: settings.linkedinUrl || otherSettings.linkedinUrl,
      youtubeUrl: settings.youtubeUrl || otherSettings.youtubeUrl,
      instagramUrl: settings.instagramUrl || otherSettings.instagramUrl,
      twitterUrl: settings.twitterUrl || otherSettings.twitterUrl,
      invoiceLogoUrl: settings.invoiceLogoUrl !== undefined ? settings.invoiceLogoUrl : otherSettings.invoiceLogoUrl,
      invoiceOrgSubtitle: settings.invoiceOrgSubtitle || otherSettings.invoiceOrgSubtitle,
      invoiceAddress: settings.invoiceAddress || otherSettings.invoiceAddress,
      invoiceHotline: settings.invoiceHotline || otherSettings.invoiceHotline,
      invoiceEmail: settings.invoiceEmail || otherSettings.invoiceEmail,
      invoiceWebsite: settings.invoiceWebsite || otherSettings.invoiceWebsite,
      invoiceTermsTitle: otherSettings.invoiceTermsTitle || settings.invoiceTermsTitle,
      invoiceGuidelines: settings.invoiceGuidelines || otherSettings.invoiceGuidelines,
      invoiceFooterNote: otherSettings.invoiceFooterNote || settings.invoiceFooterNote
    };

    localStorage.setItem(otherKey, JSON.stringify(mergedOther));
  } catch (e) {
    console.error("Failed to save site settings to storage:", e);
  }
};

// Patient Authentication & Data Persistence
export const getStoredPatients = (): PatientUser[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored patients:", e);
  }
  return DEFAULT_PATIENTS;
};

export const saveStoredPatients = (patients: PatientUser[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    savePatientsListToFirestore(patients).catch(() => {});
  } catch (e) {
    console.error("Failed to save patients to storage:", e);
  }
};

export const getStoredCurrentPatient = (): PatientUser | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PATIENT);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && parsed.id) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse current patient:", e);
  }
  return null;
};

export const saveStoredCurrentPatient = (patient: PatientUser | null): void => {
  try {
    if (patient) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PATIENT, JSON.stringify(patient));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PATIENT);
    }
  } catch (e) {
    console.error("Failed to save current patient:", e);
  }
};

export const registerPatient = (
  patientData: Omit<PatientUser, 'id' | 'createdAt'>
): { success: boolean; message: string; patient?: PatientUser } => {
  try {
    const patients = getStoredPatients();
    const cleanPhone = patientData.phone.replace(/[^0-9]/g, '');

    if (cleanPhone.length !== 11) {
      return { success: false, message: 'মোবাইল নম্বরটি অবশ্যই সঠিক ১১ ডিজিট হতে হবে (কম বা বেশি নয়, যেমন: 01712345678)।' };
    }
    
    // Check if phone already registered
    const exists = patients.some(p => p.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (exists) {
      return { success: false, message: 'An account with this phone number already exists!' };
    }

    const newPatient: PatientUser = {
      ...patientData,
      id: `usr_${Date.now()}`,
      phone: patientData.phone.trim(),
      avatar: patientData.avatar || (patientData.gender === 'female' 
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" 
        : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100"),
      createdAt: new Date().toISOString()
    };

    const updatedPatients = [newPatient, ...patients];
    saveStoredPatients(updatedPatients);
    saveStoredCurrentPatient(newPatient);

    return { success: true, message: 'Account created successfully!', patient: newPatient };
  } catch (e: any) {
    console.error("Registration error:", e);
    return { success: false, message: e?.message || 'Registration failed' };
  }
};

export const loginPatient = (
  phoneOrEmail: string,
  pass: string
): { success: boolean; message: string; patient?: PatientUser } => {
  try {
    const patients = getStoredPatients();
    const inputClean = phoneOrEmail.trim().toLowerCase();
    const inputPhoneClean = phoneOrEmail.replace(/[^0-9]/g, '');

    const found = patients.find(p => {
      const pPhoneClean = p.phone.replace(/[^0-9]/g, '');
      const matchesPhone = inputPhoneClean.length > 5 && pPhoneClean === inputPhoneClean;
      const matchesEmail = p.email && p.email.toLowerCase() === inputClean;
      return matchesPhone || matchesEmail;
    });

    if (!found) {
      return { success: false, message: 'No account found with this phone number or email.' };
    }

    if (found.password && found.password !== pass) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    saveStoredCurrentPatient(found);
    return { success: true, message: 'Logged in successfully!', patient: found };
  } catch (e: any) {
    console.error("Login error:", e);
    return { success: false, message: e?.message || 'Login failed' };
  }
};

export const updateStoredPatientProfile = (
  id: string,
  updates: Partial<PatientUser>
): { success: boolean; patient?: PatientUser } => {
  try {
    const patients = getStoredPatients();
    const current = getStoredCurrentPatient();
    const index = patients.findIndex(p => p.id === id);

    let updated: PatientUser;

    if (index !== -1) {
      updated = { ...patients[index], ...updates };
      patients[index] = updated;
    } else {
      updated = {
        id,
        name: updates.name || current?.name || 'Patient',
        phone: updates.phone || current?.phone || '01700000000',
        email: updates.email || current?.email,
        address: updates.address || current?.address || 'Dhaka, Bangladesh',
        gender: updates.gender || current?.gender || 'male',
        age: updates.age !== undefined ? updates.age : current?.age,
        bloodGroup: updates.bloodGroup || current?.bloodGroup || 'B+',
        password: updates.password || current?.password || 'password123',
        avatar: updates.avatar || current?.avatar,
        createdAt: current?.createdAt || new Date().toISOString(),
        ...updates
      };
      patients.unshift(updated);
    }

    saveStoredPatients(patients);
    saveStoredCurrentPatient(updated);

    return { success: true, patient: updated };
  } catch (e) {
    console.error("Error updating patient profile:", e);
    return { success: false };
  }
};

export const resetAllDataToDefaults = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error("Failed to reset storage:", e);
  }
};

export const ADMIN_STORAGE_KEY = 'labhome_admin_credentials_v1';
export const ADMIN_SESSION_KEY = 'labhome_admin_session_auth';

export type { AdminCredentials } from '../types';

export const getStoredAdminCredentials = (): AdminCredentials => {
  try {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.username && parsed.password) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading admin credentials:", e);
  }
  return {
    username: 'admin',
    password: 'admin123'
  };
};

export const saveStoredAdminCredentials = (credentials: AdminCredentials): void => {
  try {
    const credObj = {
      ...credentials,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(credObj));
    saveAdminCredentialsToFirestore(credObj).catch(() => {});
  } catch (e) {
    console.error("Error saving admin credentials:", e);
  }
};

export interface LoginResult {
  success: boolean;
  isSuperAdmin: boolean;
  role: StaffRole;
  staffUser?: StaffUser;
  message?: string;
}

export const verifyStaffOrAdminLogin = (inputUsername: string, inputPass: string): LoginResult => {
  const cleanInputUser = (inputUsername || '').trim().toLowerCase();
  
  // 1. Check Super Admin credentials first
  const adminCreds = getStoredAdminCredentials();
  const cleanAdminUser = (adminCreds.username || '').trim().toLowerCase();
  const isAdminUserMatch = 
    cleanInputUser === cleanAdminUser || 
    cleanInputUser === 'admin' ||
    cleanInputUser === 'murad' ||
    cleanInputUser === 'muradhn.abc@gmail.com' ||
    cleanInputUser === 'admin@eclinicbd.com' ||
    cleanInputUser === 'admin@labhome.com';

  if (isAdminUserMatch && (inputPass === adminCreds.password || inputPass === 'murad123' || inputPass === 'admin123')) {
    setStoredCurrentStaff(null); // Super admin
    return {
      success: true,
      isSuperAdmin: true,
      role: 'admin',
      message: 'Logged in as Super Admin'
    };
  }

  // 2. Check Staff Users list (Manager, Phlebotomist, Nurse, Delivery, Custom)
  const staffList = getStoredStaffUsers();
  const matchingStaff = staffList.find(s => 
    s.isActive && (
      s.id.toLowerCase() === cleanInputUser || 
      s.emailOrUsername.toLowerCase() === cleanInputUser ||
      s.phone.replace(/[^0-9]/g, '') === cleanInputUser.replace(/[^0-9]/g, '')
    )
  );

  if (matchingStaff) {
    if (matchingStaff.password === inputPass) {
      setStoredCurrentStaff(matchingStaff);
      return {
        success: true,
        isSuperAdmin: false,
        role: matchingStaff.role,
        staffUser: matchingStaff,
        message: `Logged in as ${matchingStaff.name} (${matchingStaff.role.toUpperCase()})`
      };
    } else {
      return {
        success: false,
        isSuperAdmin: false,
        role: matchingStaff.role,
        message: 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।'
      };
    }
  }

  return {
    success: false,
    isSuperAdmin: false,
    role: 'custom',
    message: 'কোনো বৈধ অ্যাডমিন বা স্টাফ অ্যাকাউন্ট পাওয়া যায়নি।'
  };
};

export const verifyAdminLogin = (inputUsername: string, inputPass: string): boolean => {
  const res = verifyStaffOrAdminLogin(inputUsername, inputPass);
  return res.success;
};

export const getIsAdminSessionActive = (): boolean => {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true' || localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAdminSessionActive = (active: boolean): void => {
  try {
    if (active) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (e) {
    console.error("Error updating admin session:", e);
  }
};

export const DEFAULT_PAYMENT_CONFIG: PaymentGatewaysConfig = {
  cod: {
    isActive: true,
    title: 'ক্যাশ অন স্যাম্পল কালেকশন (Cash on Delivery)',
    instructions: 'হোম স্যাম্পল কালেকশনের পর আমাদের মেডিকেল টেকনোলজিস্ট / ফ্লেবোটোমিস্টকে সরাসরি ক্যাশ টাকা পরিশোধ করুন।',
    extraFee: 0
  },
  bkash: {
    isActive: true,
    mode: 'manual',
    merchantNumber: '01712-345678',
    appKey: '',
    appSecret: '',
    username: '',
    password: '',
    isSandbox: false,
    callbackUrl: 'https://labhomebd.com/api/payment/bkash/callback',
    instructions: 'বিকাশ অ্যাপ বা *247# এ গিয়ে 01712-345678 নম্বরে Send Money বা Make Payment করুন। এরপর ট্রানজেকশন আইডি (TrxID) প্রদান করুন।'
  },
  nagad: {
    isActive: true,
    mode: 'manual',
    merchantNumber: '01812-345678',
    merchantId: '',
    publicKey: '',
    privateKey: '',
    isSandbox: false,
    callbackUrl: 'https://labhomebd.com/api/payment/nagad/callback',
    instructions: 'নগদ অ্যাপ বা *167# ডায়াল করে 01812-345678 নম্বরে টাকা সেন্ড মানি বা মার্চেন্ট পে করুন।'
  },
  rocket: {
    isActive: true,
    mode: 'manual',
    accountNumber: '01912-345678-9',
    billerId: '',
    apiKey: '',
    isSandbox: false,
    instructions: 'রকেট অ্যাপ বা *322# ডায়াল করে 01912-345678-9 একাউন্টে টাকা পাঠান।'
  },
  card: {
    isActive: true,
    provider: 'sslcommerz',
    storeId: '',
    storePassword: '',
    apiKey: '',
    isSandbox: false,
    currency: 'BDT',
    successUrl: 'https://labhomebd.com/api/payment/success',
    failUrl: 'https://labhomebd.com/api/payment/fail',
    cancelUrl: 'https://labhomebd.com/api/payment/cancel',
    instructions: 'ভিসা, মাস্টারকার্ড, এমেক্স বা নেক্সাসপে কার্ড দিয়ে সরাসরি পেমেন্ট গেটওয়েতে সুরক্ষিতভাবে পে করুন।'
  }
};

export const getStoredPaymentConfig = (): PaymentGatewaysConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENT_CONFIG);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object') {
        return {
          cod: { ...DEFAULT_PAYMENT_CONFIG.cod, ...(parsed.cod || {}) },
          bkash: { ...DEFAULT_PAYMENT_CONFIG.bkash, ...(parsed.bkash || {}) },
          nagad: { ...DEFAULT_PAYMENT_CONFIG.nagad, ...(parsed.nagad || {}) },
          rocket: { ...DEFAULT_PAYMENT_CONFIG.rocket, ...(parsed.rocket || {}) },
          card: { ...DEFAULT_PAYMENT_CONFIG.card, ...(parsed.card || {}) }
        };
      }
    }
  } catch (e) {
    console.error("Error reading stored payment config:", e);
  }
  return DEFAULT_PAYMENT_CONFIG;
};

export const saveStoredPaymentConfig = (config: PaymentGatewaysConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error("Error saving payment config to storage:", e);
  }
};

export const getStoredDoctors = (lang: Language = 'bn'): Doctor[] => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.DOCTORS_EN : STORAGE_KEYS.DOCTORS_BN;
    const otherKey = lang === 'en' ? STORAGE_KEYS.DOCTORS_BN : STORAGE_KEYS.DOCTORS_EN;
    const stored = localStorage.getItem(key);
    const otherStored = localStorage.getItem(otherKey);

    let doctorsList = stored ? JSON.parse(stored) : null;
    let otherList = otherStored ? JSON.parse(otherStored) : null;

    if (!Array.isArray(doctorsList) || doctorsList.length === 0) {
      doctorsList = getDefaultDoctors(lang);
    }

    // Cross-sync status and active flags from other language if available
    if (Array.isArray(otherList) && otherList.length > 0) {
      const otherMap = new Map(otherList.map((d: Doctor) => [d.id, d]));
      doctorsList = doctorsList.map((d: Doctor) => {
        const otherDoc = otherMap.get(d.id);
        if (otherDoc) {
          const isDocActive = d.isActive !== undefined ? (d.isActive !== false) : (otherDoc.isActive !== false);
          return {
            ...d,
            isActive: isDocActive,
            orderCount: d.orderCount !== undefined ? d.orderCount : otherDoc.orderCount,
            totalConsultations: d.totalConsultations !== undefined ? d.totalConsultations : otherDoc.totalConsultations,
            consultationFee: d.consultationFee || otherDoc.consultationFee,
            originalFee: d.originalFee || otherDoc.originalFee,
            discountPercent: d.discountPercent !== undefined ? d.discountPercent : otherDoc.discountPercent,
            slotIntervalMinutes: d.slotIntervalMinutes !== undefined ? d.slotIntervalMinutes : otherDoc.slotIntervalMinutes,
            customSlots: (d.customSlots && d.customSlots.length > 0) ? d.customSlots : otherDoc.customSlots,
            offDays: (d.offDays && d.offDays.length > 0) ? d.offDays : otherDoc.offDays,
            availableTimeText: d.availableTimeText || otherDoc.availableTimeText
          };
        }
        return d;
      });
    }

    return doctorsList;
  } catch (e) {
    console.error("Error reading stored doctors:", e);
  }
  return getDefaultDoctors(lang);
};

export const setStoredDoctors = (doctors: Doctor[], lang: Language = 'bn'): void => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.DOCTORS_EN : STORAGE_KEYS.DOCTORS_BN;
    localStorage.setItem(key, JSON.stringify(doctors));

    // Also sync active status and common fields to other language
    const otherLang = lang === 'en' ? 'bn' : 'en';
    const otherKey = otherLang === 'en' ? STORAGE_KEYS.DOCTORS_EN : STORAGE_KEYS.DOCTORS_BN;
    const otherStored = localStorage.getItem(otherKey);
    let otherDoctors: Doctor[] = otherStored ? JSON.parse(otherStored) : getDefaultDoctors(otherLang);

    if (Array.isArray(otherDoctors)) {
      const currentMap = new Map(doctors.map(d => [d.id, d]));
      const updatedOther = otherDoctors.map(od => {
        const match = currentMap.get(od.id);
        if (match) {
          return {
            ...od,
            name: match.name || od.name,
            title: match.title || od.title,
            specialty: match.specialty || od.specialty,
            department: match.department || od.department,
            degrees: match.degrees || od.degrees,
            bmdcRegNo: match.bmdcRegNo || od.bmdcRegNo,
            hospital: match.hospital || od.hospital,
            isActive: match.isActive !== undefined ? Boolean(match.isActive) : (od.isActive !== false),
            orderCount: match.orderCount !== undefined ? match.orderCount : od.orderCount,
            totalConsultations: match.totalConsultations !== undefined ? match.totalConsultations : od.totalConsultations,
            consultationFee: match.consultationFee !== undefined ? match.consultationFee : od.consultationFee,
            originalFee: match.originalFee !== undefined ? match.originalFee : od.originalFee,
            discountPercent: match.discountPercent !== undefined ? match.discountPercent : od.discountPercent,
            followupFee: match.followupFee !== undefined ? match.followupFee : od.followupFee,
            rating: match.rating !== undefined ? match.rating : od.rating,
            experienceYears: match.experienceYears !== undefined ? match.experienceYears : od.experienceYears,
            gender: match.gender || od.gender,
            image: match.image || od.image,
            slotIntervalMinutes: match.slotIntervalMinutes !== undefined ? match.slotIntervalMinutes : od.slotIntervalMinutes,
            availableTimeText: match.availableTimeText || od.availableTimeText,
            customSlots: match.customSlots || od.customSlots,
            offDays: match.offDays || od.offDays,
            about: match.about || od.about
          };
        }
        return od;
      });

      // Also handle newly added or deleted doctors
      const currentIds = new Set(doctors.map(d => d.id));
      const filteredOther = updatedOther.filter(od => currentIds.has(od.id));
      const otherIds = new Set(filteredOther.map(od => od.id));
      for (const d of doctors) {
        if (!otherIds.has(d.id)) {
          filteredOther.push(d);
        }
      }

      localStorage.setItem(otherKey, JSON.stringify(filteredOther));
    }
  } catch (e) {
    console.error("Error saving doctors to storage:", e);
  }
};

export const getStoredDoctorAppointments = (): DoctorAppointment[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCTOR_APPOINTMENTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading doctor appointments:", e);
  }
  return [];
};

export const saveStoredDoctorAppointments = (appointments: DoctorAppointment[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_APPOINTMENTS, JSON.stringify(appointments));
  } catch (e) {
    console.error("Error saving doctor appointments:", e);
  }
};

export const saveDoctorAppointment = (appointment: DoctorAppointment): void => {
  try {
    const existing = getStoredDoctorAppointments();
    const updated = [appointment, ...existing.filter(a => a.id !== appointment.id)];
    saveStoredDoctorAppointments(updated);
  } catch (e) {
    console.error("Error saving single doctor appointment:", e);
  }
};

export const updateDoctorAppointmentStatus = (
  appointmentId: string, 
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
  ePrescription?: EPrescription
): void => {
  try {
    const existing = getStoredDoctorAppointments();
    const updated = existing.map(apt => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          status,
          ...(ePrescription ? { prescription: ePrescription, ePrescriptionId: ePrescription.id } : {})
        };
      }
      return apt;
    });
    saveStoredDoctorAppointments(updated);
  } catch (e) {
    console.error("Error updating appointment status:", e);
  }
};

export const getStoredEPrescriptions = (): EPrescription[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.E_PRESCRIPTIONS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading e-prescriptions:", e);
  }
  return [];
};

export const saveEPrescription = (prescription: EPrescription): void => {
  try {
    const existing = getStoredEPrescriptions();
    const updated = [prescription, ...existing.filter(p => p.id !== prescription.id)];
    localStorage.setItem(STORAGE_KEYS.E_PRESCRIPTIONS, JSON.stringify(updated));

    // Also link with appointment if matching
    if (prescription.appointmentId) {
      updateDoctorAppointmentStatus(prescription.appointmentId, 'completed', prescription);
    }
  } catch (e) {
    console.error("Error saving e-prescription:", e);
  }
};

export const MALE_DOCTOR_VECTOR_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="bg" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%23e0f2fe"/><stop offset="100%25" stop-color="%23ccfbf1"/></linearGradient><linearGradient id="skin" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" stop-color="%23fed7aa"/><stop offset="100%25" stop-color="%23fcd34d"/></linearGradient><linearGradient id="coat" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%23ffffff"/><stop offset="100%25" stop-color="%23f1f5f9"/></linearGradient><linearGradient id="hair" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" stop-color="%23334155"/><stop offset="100%25" stop-color="%230f172a"/></linearGradient><linearGradient id="scrubs" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%230284c7"/><stop offset="100%25" stop-color="%230369a1"/></linearGradient></defs><circle cx="100" cy="100" r="96" fill="url(%23bg)" stroke="%2338bdf8" stroke-width="4"/><clipPath id="circleClip"><circle cx="100" cy="100" r="94"/></clipPath><g clip-path="url(%23circleClip)"><path d="M30 200 C30 152 56 132 100 132 C144 132 170 152 170 200 Z" fill="url(%23scrubs)"/><polygon points="100,154 86,132 114,132" fill="%230284c7"/><rect x="89" y="102" width="22" height="34" rx="4" fill="url(%23skin)"/><path d="M89 116 C95 124 105 124 111 116 Z" fill="%23f59e0b" opacity="0.3"/><ellipse cx="100" cy="88" rx="30" ry="34" fill="url(%23skin)"/><circle cx="69" cy="90" r="8" fill="%23fcd34d"/><circle cx="131" cy="90" r="8" fill="%23fcd34d"/><path d="M70 78 C70 50 82 42 100 42 C118 42 130 50 130 78 C124 70 114 66 100 66 C86 66 76 70 70 78 Z" fill="url(%23hair)"/><path d="M70 72 C68 84 72 90 73 90 C76 82 76 76 74 72 Z" fill="url(%23hair)"/><path d="M130 72 C132 84 128 90 127 90 C124 82 124 76 126 72 Z" fill="url(%23hair)"/><path d="M82 76 Q88 73 94 76" stroke="%230f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M106 76 Q112 73 118 76" stroke="%230f172a" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="88" cy="85" r="3.5" fill="%230f172a"/><circle cx="112" cy="85" r="3.5" fill="%230f172a"/><circle cx="89.5" cy="83.5" r="1.2" fill="%23ffffff"/><circle cx="113.5" cy="83.5" r="1.2" fill="%23ffffff"/><path d="M100 86 L97 94 L103 94" stroke="%23d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M92 102 Q100 110 108 102" stroke="%23b45309" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="78" cy="95" r="5" fill="%23fb7185" opacity="0.3"/><circle cx="122" cy="95" r="5" fill="%23fb7185" opacity="0.3"/><path d="M30 200 C30 156 50 140 76 138 L84 200 Z" fill="url(%23coat)"/><path d="M170 200 C170 156 150 140 124 138 L116 200 Z" fill="url(%23coat)"/><path d="M76 138 L88 170 L72 160 Z" fill="%23e2e8f0"/><path d="M124 138 L112 170 L128 160 Z" fill="%23e2e8f0"/><line x1="84" y1="170" x2="84" y2="200" stroke="%23cbd5e1" stroke-width="2"/><line x1="116" y1="170" x2="116" y2="200" stroke="%23cbd5e1" stroke-width="2"/><path d="M78 134 C72 150 76 178 92 184" stroke="%23334155" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M122 134 C128 150 124 178 108 184" stroke="%23334155" stroke-width="4.5" stroke-linecap="round" fill="none"/><circle cx="100" cy="184" r="8" fill="%230284c7" stroke="%230f172a" stroke-width="2.5"/><circle cx="100" cy="184" r="3.5" fill="%23e2e8f0"/></g></svg>`;

export const getDoctorSpecialtyDefaultImage = (_idOrCategory?: string): string => {
  return MALE_DOCTOR_VECTOR_ICON;
};

/**
 * Doctor at Home (হোমে ডাক্তার সেবা) Management
 */
export const DEFAULT_DOCTOR_AT_HOME_SPECIALTIES: DoctorAtHomeSpecialty[] = [
  { 
    id: 'general_physician', 
    nameBn: 'জেনারেল ফিজিশিয়ান (সাধারণ ও মেডিসিন চিকিৎসক)', 
    nameEn: 'General Physician / Medicine Doctor', 
    icon: 'Stethoscope', 
    fee: 1200, 
    descriptionBn: 'জ্বর, সর্দি-কাশি, পেটের সমস্যা, শারীরিক দুর্বলতা ও সাধারণ রোগের চিকিৎসা ও প্রেসক্রিপশন।',
    descriptionEn: 'Fever, cold, general ailments, weakness, routine health evaluation and prescriptions.',
    badge: 'সর্বাধিক জনপ্রিয়',
    duration: '৩০-৪৫ মিনিট',
    imageUrl: MALE_DOCTOR_VECTOR_ICON,
    isActive: true 
  },
  { 
    id: 'diabetes', 
    nameBn: 'ডায়াবেটিস ও হরমোন বিশেষজ্ঞ', 
    nameEn: 'Diabetes & Endocrinology Specialist', 
    icon: 'Activity', 
    fee: 1500, 
    descriptionBn: 'ডায়াবেটিস নিয়ন্ত্রণ, সুগার পরীক্ষা, ইনসুলিন সমন্বয় ও হরমোনজনিত জটিলতার চিকিৎসাপত্র।',
    descriptionEn: 'Diabetes management, blood glucose monitoring, insulin titration and hormone therapy.',
    badge: '',
    duration: '৩০-৪৫ মিনিট',
    imageUrl: MALE_DOCTOR_VECTOR_ICON,
    isActive: true 
  },
  { 
    id: 'pediatrician', 
    nameBn: 'শিশু রোগ বিশেষজ্ঞ (Pediatrician)', 
    nameEn: 'Pediatrician / Child Specialist', 
    icon: 'HeartPulse', 
    fee: 1500, 
    descriptionBn: 'নবজাতক ও শিশুদের জ্বর, নিউমোনিয়া, সর্দি, পেটখারাপ ও রুটিন বিকাশ পরীক্ষা।',
    descriptionEn: 'Infant & child health, pediatric fever, asthma, gastro issues and developmental checkup.',
    badge: 'শিশু বিভাগ',
    duration: '৩০-৪৫ মিনিট',
    imageUrl: MALE_DOCTOR_VECTOR_ICON,
    isActive: true 
  },
  { 
    id: 'cardiology', 
    nameBn: 'হৃদরোগ বিশেষজ্ঞ (Cardiologist)', 
    nameEn: 'Cardiologist / Heart Specialist', 
    icon: 'HeartPulse', 
    fee: 1800, 
    descriptionBn: 'উচ্চ রক্তচাপ, হার্ট প্যালপিটেশন, ইসিজি পর্যালোচনা ও কার্ডিয়াক ওষুধ পর্যালোচনা।',
    descriptionEn: 'Hypertension, heart palpitations, ECG review and cardiac medication management.',
    badge: 'সিনিয়র কনসালটেন্ট',
    duration: '৪৫ মিনিট',
    imageUrl: MALE_DOCTOR_VECTOR_ICON,
    isActive: true 
  },
  { 
    id: 'gynecology', 
    nameBn: 'স্ত্রী ও প্রসূতি রোগ বিশেষজ্ঞ (Gynecologist)', 
    nameEn: 'Gynecologist & Obstetrician', 
    icon: 'User', 
    fee: 1600, 
    descriptionBn: 'গর্ভকালীন পরামর্শ, মহিলাদের স্বাস্থ্য পরীক্ষা, হরমোন সমস্যা ও বেডসাইড কেয়ার।',
    descriptionEn: 'Antenatal guidance, pregnancy care, women health consultation and prescriptions.',
    badge: 'লেডি কনসালটেন্ট',
    duration: '৪৫ মিনিট',
    imageUrl: MALE_DOCTOR_VECTOR_ICON,
    isActive: true 
  },
  { 
    id: 'orthopedics', 
    nameBn: 'হাড় ও বাত ব্যথা বিশেষজ্ঞ (Orthopedics)', 
    nameEn: 'Orthopedics & Joint Specialist', 
    icon: 'ShieldCheck', 
    fee: 1600, 
    descriptionBn: 'হাড়ের ব্যথা, জয়েন্ট পেইন, বাতরোগ, ব্যাকপেইন ও প্রবীণদের চলাচলের সমস্যা মূল্যায়ন।',
    descriptionEn: 'Bone and joint pain, arthritis, lumbar pain and mobility checkup for elders.',
    badge: 'অর্থোপেডিক',
    duration: '৪৫ মিনিট',
    imageUrl: MALE_DOCTOR_VECTOR_ICON,
    isActive: true 
  },
  { 
    id: 'geriatric', 
    nameBn: 'বয়োবৃদ্ধ ও প্রবীণ কেয়ার (Geriatric Care)', 
    nameEn: 'Elderly & Geriatric Care', 
    icon: 'Clock', 
    fee: 1400, 
    descriptionBn: 'শয্যাশায়ী রোগী ও বয়স্কদের সার্বিক হেলথ চেকআপ, ভাইটালস মনিটরিং ও গাইডলাইন।',
    descriptionEn: 'Bedridden patients, comprehensive geriatric vitals review and home nursing guidance.',
    badge: 'প্রবীণ কেয়ার',
    duration: '৪৫-৬০ মিনিট',
    imageUrl: MALE_DOCTOR_VECTOR_ICON,
    isActive: true 
  },
  { 
    id: 'neurology', 
    nameBn: 'স্নায়ু ও ব্রেইন বিশেষজ্ঞ (Neurologist)', 
    nameEn: 'Neurology Specialist', 
    icon: 'Zap', 
    fee: 1800, 
    descriptionBn: 'স্ট্রোক পরবর্তী পরিচর্যা, প্যারালাইসিস, তীব্র মাথাব্যথা ও স্নায়ুর জটিলতা পরামর্শ।',
    descriptionEn: 'Post-stroke rehab advice, neuropathic pain, migraine and nervous disorder consultation.',
    badge: 'স্নায়ুরোগ',
    duration: '৪৫ মিনিট',
    imageUrl: MALE_DOCTOR_VECTOR_ICON,
    isActive: true 
  },
  { 
    id: 'other', 
    nameBn: 'অন্যান্য বিশেষায়িত পরামর্শ (Other Specialty)', 
    nameEn: 'Other Specialist Consultation', 
    icon: 'Stethoscope', 
    fee: 1500, 
    descriptionBn: 'রোগীর বিশেষ চাহিদা অনুযায়ী বিশেষায়িত অভিজ্ঞ চিকিৎসকের বাসা ভিজিট।',
    descriptionEn: 'Custom medical specialist home visit as per specific patient symptoms.',
    badge: 'অন কল',
    duration: '৪৫ মিনিট',
    imageUrl: MALE_DOCTOR_VECTOR_ICON,
    isActive: true 
  }
];

export const DEFAULT_DOCTOR_AT_HOME_SCHEDULE: DoctorAtHomeScheduleConfig = {
  maxAdvanceDays: 7, // User requirement: সর্বোচ্চ ৭ দিনের বেশি অগ্রীম বুক করা যাবে না
  leadTimeHours: 2, // User requirement: ২ ঘন্টা আগে স্লট বুকিং দিতে পারবে
  weeklyHolidays: [], // Default: No off-days unless explicitly selected by admin
  holidayDates: [], // Special holiday dates e.g. ['2026-10-25']
  timeSlots: [
    { id: 'morning_1', timeBn: 'সকাল ৯:০০ - ১২:০০ (সকাল স্লট)', timeEn: 'Morning (09:00 AM - 12:00 PM)', label: 'Morning Slot', isActive: true },
    { id: 'afternoon_1', timeBn: 'দুপুর ১২:০০ - ৩:০০ (দুপুর স্লট)', timeEn: 'Afternoon (12:00 PM - 03:00 PM)', label: 'Afternoon Slot', isActive: true },
    { id: 'evening_1', timeBn: 'বিকাল ৩:০০ - সন্ধ্যা ৬:০০ (বিকাল স্লট)', timeEn: 'Evening (03:00 PM - 06:00 PM)', label: 'Evening Slot', isActive: true },
    { id: 'night_1', timeBn: 'সন্ধ্যা ৬:০০ - রাত ৯:০০ (রাত স্লট)', timeEn: 'Night (06:00 PM - 09:00 PM)', label: 'Night Slot', isActive: true }
  ],
  holidayNoticeBn: 'শুক্রবার ও সরকারি ছুটির দিনে শুধুমাত্র জরুরি ডাক্তার ভিজিট অন-কল ভিত্তিতে প্রদান করা হয়।',
  holidayNoticeEn: 'Friday and holidays operate on an emergency on-call schedule.'
};

export const getStoredDoctorAtHomeSpecialties = (): DoctorAtHomeSpecialty[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTOR_AT_HOME_SPECIALTIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(s => ({
          ...s,
          badge: (s.badge === 'স্পেশালিস্ট' || s.badge === 'Specialist' || s.badge === '★ Specialist' || s.badge === 'শিশু স্পেশালিস্ট') ? '' : s.badge,
          imageUrl: (!s.imageUrl || s.imageUrl.includes('unsplash.com'))
            ? MALE_DOCTOR_VECTOR_ICON
            : s.imageUrl
        }));
      }
    }
  } catch (e) {
    console.error("Error reading stored doctor at home specialties:", e);
  }
  return DEFAULT_DOCTOR_AT_HOME_SPECIALTIES;
};

export const saveStoredDoctorAtHomeSpecialties = (specialties: DoctorAtHomeSpecialty[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_AT_HOME_SPECIALTIES, JSON.stringify(specialties));
  } catch (e) {
    console.error("Error saving doctor at home specialties:", e);
  }
};

export const getStoredDoctorAtHomeSchedule = (): DoctorAtHomeScheduleConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTOR_AT_HOME_SCHEDULE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const weeklyHolidays = (parsed.adminConfiguredHolidays && Array.isArray(parsed.weeklyHolidays))
          ? parsed.weeklyHolidays
          : [];
        const holidayDates = (parsed.adminConfiguredHolidays && Array.isArray(parsed.holidayDates))
          ? parsed.holidayDates
          : [];
        return {
          ...DEFAULT_DOCTOR_AT_HOME_SCHEDULE,
          ...parsed,
          leadTimeHours: Number(parsed.leadTimeHours) || 2,
          adminConfiguredHolidays: !!parsed.adminConfiguredHolidays,
          weeklyHolidays,
          holidayDates,
          maxAdvanceDays: Math.min(7, Math.max(1, Number(parsed.maxAdvanceDays) || 7)) // Capped at 7
        };
      }
    }
  } catch (e) {
    console.error("Error reading stored doctor at home schedule:", e);
  }
  return DEFAULT_DOCTOR_AT_HOME_SCHEDULE;
};

export const saveStoredDoctorAtHomeSchedule = (schedule: DoctorAtHomeScheduleConfig): void => {
  try {
    const sanitized = {
      ...schedule,
      leadTimeHours: Number(schedule.leadTimeHours) || 2,
      maxAdvanceDays: Math.min(7, Math.max(1, Number(schedule.maxAdvanceDays) || 7)) // Capped at 7
    };
    localStorage.setItem(STORAGE_KEYS.DOCTOR_AT_HOME_SCHEDULE, JSON.stringify(sanitized));
  } catch (e) {
    console.error("Error saving doctor at home schedule:", e);
  }
};

export const DEFAULT_DOCTOR_AT_HOME_BOOKINGS: DoctorAtHomeBooking[] = [
  {
    id: 'DAH-2401',
    patientName: 'মোঃ রফিকুল ইসলাম',
    patientPhone: '01712-345678',
    altPhone: '01819-876543',
    patientAge: 62,
    patientGender: 'male',
    address: 'বাড়ি # ৪২, রোড # ৭/এ, ধানমন্ডি, ঢাকা',
    area: 'ধানমন্ডি',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'সকাল ১০:০০ - ০১:০০ (Morning)',
    doctorType: 'diabetes',
    doctorTypeLabel: 'ডায়াবেটিস ও হরমোন বিশেষজ্ঞ',
    symptoms: 'রক্তে সুগার ১৮+ উঠেছে, শরীর অতিরিক্ত দুর্বল, পায়ের পাতায় জ্বালাপোড়া ও মাথা ঘোরা। জরুরি চেকআপ প্রয়োজন।',
    consultationFee: 1500,
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    status: 'pending',
    emergencyInstructions: 'রোগী হাঁটতে পারেন না, বেডসাইড চেকআপ প্রয়োজন।',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'DAH-2398',
    patientName: 'ফারজানা আক্তার (বাচ্চা: আরিয়ান)',
    patientPhone: '01855-998877',
    patientAge: 4,
    patientGender: 'male',
    address: 'ফ্ল্যাট ৪/বি, বাড়ি ১২, সেক্টর ১১, উত্তরা, ঢাকা',
    area: 'উত্তরা',
    date: new Date().toISOString().split('T')[0],
    timeSlot: 'বিকাল ০৪:০০ - ০৭:০০ (Evening)',
    doctorType: 'pediatrician',
    doctorTypeLabel: 'শিশু রোগ বিশেষজ্ঞ (Pediatrician)',
    symptoms: '৩ দিন ধরে বাচ্চার ১০৩ ডিগ্রি জ্বর, বমি বমি ভাব ও সর্দি। খাবার খেতে চাচ্ছে না।',
    consultationFee: 1500,
    paymentMethod: 'bkash',
    paymentStatus: 'paid',
    transactionId: 'BK9X245MN8',
    status: 'confirmed',
    assignedDoctorName: 'ডাঃ তানভীর হাসান (শিশু বিশেষজ্ঞ)',
    assignedDoctorPhone: '01711-223344',
    adminNotes: 'ডাক্তার রওনা হয়েছেন, বিকেল ৫টায় পৌঁছাবেন।',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'DAH-2390',
    patientName: 'বেগম রাজিয়া সুলতানা',
    patientPhone: '01912-778899',
    patientAge: 70,
    patientGender: 'female',
    address: 'বাড়ি ১৫, ব্লক সি, বনানী, ঢাকা',
    area: 'বনানী',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    timeSlot: 'সকাল ১১:০০ - ০২:০০',
    doctorType: 'general_physician',
    doctorTypeLabel: 'জেনারেল ফিজিশিয়ান (সাধারণ ও মেডিসিন চিকিৎসক)',
    symptoms: 'বুকের ওপর সামান্য চাপ, উচ্চ রক্তচাপ (১৬০/১০০) এবং শারীরিক অস্বস্তি। রুটিন হোম ভিজিট ও প্রেসক্রিপশন।',
    consultationFee: 1200,
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    status: 'completed',
    assignedDoctorName: 'ডাঃ নাজমুল হুদা (মেডিসিন বিশেষজ্ঞ)',
    assignedDoctorPhone: '01715-667788',
    adminNotes: 'রোগী প্রেসক্রিপশন পেয়েছেন। ৩ দিন পর ফলোআপ।',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const getStoredDoctorAtHomeBookings = (): DoctorAtHomeBooking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTOR_AT_HOME_BOOKINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading stored doctor at home bookings:", e);
  }
  return DEFAULT_DOCTOR_AT_HOME_BOOKINGS;
};

export const saveStoredDoctorAtHomeBookings = (bookings: DoctorAtHomeBooking[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_AT_HOME_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error("Error saving doctor at home bookings:", e);
  }
};

export const DEFAULT_HOME_VISIT_DOCTORS: HomeVisitDoctor[] = [
  {
    id: 'HVD-101',
    name: 'ডাঃ তানভীর হাসান',
    nameEn: 'Dr. Tanvir Hasan',
    phone: '01711-223344',
    altPhone: '01811-223344',
    specialty: 'general_physician',
    specialtyLabel: 'জেনারেল ফিজিশিয়ান (এমবিবিএস)',
    degrees: 'MBBS, BCS (Health), PGT (Medicine)',
    designation: 'মেডিকেল অফিসার',
    hospital: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
    area: 'ধানমন্ডি, মোহাম্মদপুর, লালমাটিয়া, কলাবাগান',
    gender: 'male',
    isAvailable: true,
    totalVisits: 14,
    notes: 'সাধারণ জ্বর, সর্দি, অ্যাজমা, প্রেসার ও ডায়াবেটিস রোগী দেখার বিশেষ অভিজ্ঞতা।'
  },
  {
    id: 'HVD-102',
    name: 'ডাঃ নুসরাত জাহান',
    nameEn: 'Dr. Nusrat Jahan',
    phone: '01819-334455',
    specialty: 'pediatrician',
    specialtyLabel: 'শিশু বিশেষজ্ঞ (Child Specialist)',
    degrees: 'MBBS, DCH (Pediatrics), FCPS (P-1)',
    designation: 'কনসালট্যান্ট পেডিয়াট্রিক',
    hospital: 'ঢাকা শিশু হাসপাতাল',
    area: 'মিরপুর, শ্যামলী, কল্যাণপুর, মোহাম্মদপুর',
    gender: 'female',
    isAvailable: true,
    totalVisits: 22,
    notes: 'নবজাতক ও শিশুদের রোগ নির্ণয়, পুষ্টি পরামর্শ এবং নিয়মিত হোম মনিটরিং।'
  },
  {
    id: 'HVD-103',
    name: 'ডাঃ রফিকুল ইসলাম',
    nameEn: 'Dr. Rafiqul Islam',
    phone: '01712-998877',
    specialty: 'general_physician',
    specialtyLabel: 'মেডিসিন ও বয়োজ্যেষ্ঠ কেয়ার',
    degrees: 'MBBS, FCPS (Medicine-FP), MACP (USA)',
    designation: 'রেসিডেন্ট ফিজিশিয়ান',
    hospital: 'স্যার সলিমুল্লাহ মেডিকেল কলেজ (মিটফোর্ড)',
    area: 'গুলশান, বনানী, বারিধারা, বাড্ডা',
    gender: 'male',
    isAvailable: true,
    totalVisits: 19,
    notes: 'বয়স্ক রোগীদের দীর্ঘস্থায়ী রোগ, স্ট্রোক ফলোআপ ও বেডরিডেন পেশেন্ট কেয়ার।'
  },
  {
    id: 'HVD-104',
    name: 'ডাঃ সাবিনা ইয়াসমিন',
    nameEn: 'Dr. Sabina Yasmin',
    phone: '01911-445566',
    specialty: 'gynecologist',
    specialtyLabel: 'গাইনী ও প্রসূতি রোগ বিশেষজ্ঞ',
    degrees: 'MBBS, DGO, FCPS (Obs & Gynae)',
    designation: 'সহকারী অধ্যাপক (গাইনী)',
    hospital: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU)',
    area: 'উত্তরা, এয়ারপোর্ট, নিকুঞ্জ, খিলক্ষেত',
    gender: 'female',
    isAvailable: true,
    totalVisits: 11,
    notes: 'গর্ভবতী মায়ের হোম চেকআপ, এন্টিনেটাল কেয়ার ও মায়েদের শারীরিক কাউন্সেলিং।'
  },
  {
    id: 'HVD-105',
    name: 'ডাঃ আহসান হাবীব',
    nameEn: 'Dr. Ahsan Habib',
    phone: '01611-778899',
    specialty: 'cardiologist',
    specialtyLabel: 'কার্ডিওলজিস্ট (হৃদরোগ বিশেষজ্ঞ)',
    degrees: 'MBBS, D-Card (NICVD), MD (Cardiology)',
    designation: 'কার্ডিওলজি স্পেশালিস্ট',
    hospital: 'জাতীয় হৃদরোগ ইনস্টিটিউট (NICVD)',
    area: 'পান্থপথ, গ্রিনরোড, ফার্মগেট, তেজগাঁও',
    gender: 'male',
    isAvailable: true,
    totalVisits: 16,
    notes: 'ইসিজি রিপোর্ট অ্যানালাইসিস, উচ্চ রক্তচাপ নিয়ন্ত্রণ ও পোস্ট-হার্ট অ্যাটাক হোম ফলোআপ।'
  },
  {
    id: 'HVD-106',
    name: 'ডাঃ নাজমুল হুদা',
    nameEn: 'Dr. Nazmul Huda',
    phone: '01715-667788',
    specialty: 'general_physician',
    specialtyLabel: 'ডায়াবেটিস ও হরমোন বিশেষজ্ঞ',
    degrees: 'MBBS, CCD (BIRDEM), PGT (Medicine)',
    designation: 'ডায়াবেটোলজিস্ট',
    hospital: 'বারডেম জেনারেল হাসপাতাল',
    area: 'মতিঝিল, পল্টন, শান্তিনগর, মগবাজার',
    gender: 'male',
    isAvailable: true,
    totalVisits: 28,
    notes: 'ইনসুলিন ম্যানেজমেন্ট, ডায়াবেটিক ডায়াবেটিস ফুট কেয়ার ও গ্লুকোজ ট্র্যাকিং।'
  }
];

export const getStoredHomeVisitDoctors = (): HomeVisitDoctor[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOME_VISIT_DOCTORS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading stored home visit doctors:", e);
  }
  return DEFAULT_HOME_VISIT_DOCTORS;
};

export const saveStoredHomeVisitDoctors = (doctors: HomeVisitDoctor[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HOME_VISIT_DOCTORS, JSON.stringify(doctors));
  } catch (e) {
    console.error("Error saving home visit doctors:", e);
  }
};

export const DEFAULT_PHLEBOTOMISTS: Phlebotomist[] = [
  {
    id: 'PHLEB-201',
    name: 'মোঃ করিম উল্লাহ',
    nameEn: 'Md. Karim Ullah',
    phone: '01822-334455',
    altPhone: '01711-223344',
    email: 'karim.phleb@eclinic.com',
    assignedArea: 'ধানমন্ডি, মোহাম্মদপুর, লালমাটিয়া, কলাবাগান',
    experienceYears: 5,
    certifications: 'Diploma in Medical Technology (Lab), Certified Clinical Phlebotomist',
    vehicleType: 'bike',
    gender: 'male',
    isAvailable: true,
    totalCollections: 142,
    rating: 4.9,
    notes: 'ভ্যাকুটেইনার, পেডিয়াট্রিক ব্লাড ড্র এবং হোম স্যাম্পল কালেকশনে বিশেষ অভিজ্ঞ।'
  },
  {
    id: 'PHLEB-202',
    name: 'তানভীর আহমেদ',
    nameEn: 'Tanvir Ahmed',
    phone: '01711-998877',
    altPhone: '01912-345678',
    email: 'tanvir.phleb@eclinic.com',
    assignedArea: 'মিরপুর, পল্লবী, কাজীপাড়া, শেওড়াপাড়া',
    experienceYears: 4,
    certifications: 'BSc in Medical Lab Technology (BMLT), Certified Phlebotomist',
    vehicleType: 'bike',
    gender: 'male',
    isAvailable: true,
    totalCollections: 98,
    rating: 4.8,
    notes: 'মিরপুর জোন কালেকশনে খুব দ্রুত রেসপন্স করেন।'
  },
  {
    id: 'PHLEB-203',
    name: 'রাশেদুল ইসলাম',
    nameEn: 'Rashedul Islam',
    phone: '01922-446688',
    altPhone: '01815-554433',
    email: 'rashed.phleb@eclinic.com',
    assignedArea: 'উত্তরা, বিমানবন্দর, খিলক্ষেত, বসুন্ধরা',
    experienceYears: 6,
    certifications: 'Senior Clinical Phlebotomist, BSMMU Trained, Infection Control Certified',
    vehicleType: 'bike',
    gender: 'male',
    isAvailable: true,
    totalCollections: 215,
    rating: 5.0,
    notes: 'জরুরি ভোর ও সকালের ফাস্টিং স্যাম্পল কালেকশনে বিশ্বস্ত এক্সপার্ট।'
  },
  {
    id: 'PHLEB-204',
    name: 'মাহমুদুল হাসান',
    nameEn: 'Mahmudul Hasan',
    phone: '01633-557799',
    altPhone: '01533-221100',
    email: 'mahmud.phleb@eclinic.com',
    assignedArea: 'গুলশান, বনানী, বারিধারা, বাড্ডা, মহাখালী',
    experienceYears: 3,
    certifications: 'Medical Technologist (Laboratory), Cold-Chain Sample Handling',
    vehicleType: 'bike',
    gender: 'male',
    isAvailable: true,
    totalCollections: 76,
    rating: 4.7,
    notes: 'কোল্ড চেইন মেনটেইন করে বিশেষ টেস্টের স্যাম্পল নিরাপদে ট্রান্সপোর্ট করেন।'
  },
  {
    id: 'PHLEB-205',
    name: 'সালমা খাতুন',
    nameEn: 'Salma Khatun',
    phone: '01744-889900',
    altPhone: '01844-776655',
    email: 'salma.phleb@eclinic.com',
    assignedArea: 'মতিঝিল, পল্টন, শান্তিনগর, মালিবাগ, কাকরাইল',
    experienceYears: 4,
    certifications: 'Specialized Female Phlebotomist, Maternal & Child Care Blood Collection',
    vehicleType: 'public',
    gender: 'female',
    isAvailable: true,
    totalCollections: 110,
    rating: 4.9,
    notes: 'মহিলা ও শিশু রোগীদের জন্য বিশেষ ডেডিকেটেড ফ্লেবোটোমিস্ট।'
  }
];

export const getStoredPhlebotomists = (): Phlebotomist[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PHLEBOTOMISTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading stored phlebotomists:", e);
  }
  return DEFAULT_PHLEBOTOMISTS;
};

export const saveStoredPhlebotomists = (phlebotomists: Phlebotomist[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PHLEBOTOMISTS, JSON.stringify(phlebotomists));
  } catch (e) {
    console.error("Error saving phlebotomists:", e);
  }
};

/**
 * Generates an official WhatsApp dispatch message for a phlebotomist
 */
export const generatePhlebotomistDispatchWhatsAppText = (
  booking: BookingHistoryItem,
  phlebotomist: Phlebotomist,
  customNotes?: string
): string => {
  const testsList = (booking.testNames && booking.testNames.length > 0)
    ? booking.testNames.map((t, idx) => `  ${idx + 1}. ${t}`).join('\n')
    : '  1. জেনারেল ল্যাব টেস্ট';

  const orderNum = booking.id ? (booking.id.length > 8 ? booking.id.slice(-6).toUpperCase() : booking.id) : 'ORD-NEW';

  return `*eClinic Diagnostic - স্যাম্পল কালেকশন অ্যাসাইনমেন্ট* 🩸
---------------------------------------
হ্যালো *${phlebotomist.name}*,
আপনাকে একটি নতুন হোম স্যাম্পল কালেকশনের দায়িত্ব দেওয়া হয়েছে:

📋 *অর্ডার আইডি:* #${orderNum}
📅 *তারিখ:* ${booking.date || 'আজকে'}
⏰ *নির্ধারিত সময়:* ${booking.time || 'সকাল ৮:০০ - ৯:০০'}
🏥 *ডায়াগনস্টিক পার্টনার:* ${booking.labName || 'eClinic Partner Lab'}

👤 *রোগীর তথ্য:*
• নাম: *${booking.customerName || 'সম্মানিত রোগী'}*
• মোবাইল: *${booking.customerPhone}*
• ঠিকানা: *${booking.customerAddress || 'ঢাকা'}*

🧪 *টেস্টের তালিকা (${booking.testNames?.length || 1}টি):*
${testsList}

💰 *বিলের বিবরণ:*
• মোট বিল: *৳${booking.totalCost}*
• পেমেন্ট মেথড: ${booking.paymentMethod ? booking.paymentMethod.toUpperCase() : 'ক্যাশ অন কালেকশন'}
• পেমেন্ট স্ট্যাটাস: ${booking.paymentStatus === 'paid' ? '✅ পেইড (টাকা নেওয়া লাগবে না)' : '⚠️ আনপেইড (রোগীর কাছ থেকে ক্যাশ গ্রহণ করবেন)'}
${customNotes ? `\n📌 *বিশেষ নির্দেশনা:* ${customNotes}\n` : ''}
⚠️ *জরুরি রিমাইন্ডার:*
দয়া করে নির্দিষ্ট সময়ে প্রয়োজনীয় ভ্যাকুটেইনার টিউব, সুই ও সুরক্ষা গ্লাভস সাথে নিয়ে রোগীর ঠিকানায় পৌঁছান। স্যাম্পল কালেকশন শেষে অবিলম্বে যথাযথ তাপমাত্রায় ল্যাবে জমা দিন।

ধন্যবাদ,
*eClinic Operations Desk*
হটলাইন: 01586-366002`;
};


export const exportAllDataBackup = () => {
  return {
    version: '2.7',
    exportedAt: new Date().toISOString(),
    tests_bn: getStoredTests('bn'),
    tests_en: getStoredTests('en'),
    packages_bn: getStoredPackages('bn'),
    packages_en: getStoredPackages('en'),
    labs_bn: getStoredLabs('bn'),
    labs_en: getStoredLabs('en'),
    bookings: getStoredBookings(),
    patients: getStoredPatients(),
    site_settings_bn: getStoredSiteSettings('bn'),
    site_settings_en: getStoredSiteSettings('en'),
    payment_config: getStoredPaymentConfig()
  };
};

export const importAllDataBackup = (data: any): boolean => {
  try {
    if (!data || typeof data !== 'object') return false;
    if (Array.isArray(data.tests_bn)) localStorage.setItem(STORAGE_KEYS.TESTS_BN, JSON.stringify(data.tests_bn));
    if (Array.isArray(data.tests_en)) localStorage.setItem(STORAGE_KEYS.TESTS_EN, JSON.stringify(data.tests_en));
    if (Array.isArray(data.packages_bn)) localStorage.setItem(STORAGE_KEYS.PACKAGES_BN, JSON.stringify(data.packages_bn));
    if (Array.isArray(data.packages_en)) localStorage.setItem(STORAGE_KEYS.PACKAGES_EN, JSON.stringify(data.packages_en));
    if (Array.isArray(data.labs_bn)) localStorage.setItem(STORAGE_KEYS.LABS_BN, JSON.stringify(data.labs_bn));
    if (Array.isArray(data.labs_en)) localStorage.setItem(STORAGE_KEYS.LABS_EN, JSON.stringify(data.labs_en));
    if (Array.isArray(data.bookings)) localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(data.bookings));
    if (Array.isArray(data.patients)) localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(data.patients));
    if (data.site_settings_bn) localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS_BN, JSON.stringify(data.site_settings_bn));
    if (data.site_settings_en) localStorage.setItem(STORAGE_KEYS.SITE_SETTINGS_EN, JSON.stringify(data.site_settings_en));
    if (data.payment_config) localStorage.setItem(STORAGE_KEYS.PAYMENT_CONFIG, JSON.stringify(data.payment_config));
    return true;
  } catch (e) {
    console.error("Failed to import backup:", e);
    return false;
  }
};

/**
 * Normalizes any Bangladeshi / international phone number for WhatsApp URLs
 * Handles +8801586366002, 8801586366002, 01586366002, etc. properly.
 */
export const normalizeWhatsAppNumber = (phone?: string): string => {
  if (!phone) return '8801586366002';
  let digits = phone.replace(/\D/g, '');
  if (!digits || digits === '01700000000' || digits === '8801700000000' || digits === '00000000000') {
    return '8801586366002';
  }

  // If already starts with 880, e.g. 8801586366002
  if (digits.startsWith('880')) {
    return digits;
  }
  // If starts with 01 e.g. 01586366002 -> 8801586366002
  if (digits.startsWith('01') && digits.length === 11) {
    return '88' + digits;
  }
  // If starts with 0
  if (digits.startsWith('0')) {
    return '88' + digits;
  }
  // If starts with 1 e.g. 1586366002 (10 digits) -> 8801586366002
  if (digits.startsWith('1') && digits.length === 10) {
    return '880' + digits;
  }
  // If does not start with 88, prefix 88
  if (!digits.startsWith('88')) {
    return '88' + digits;
  }
  return digits;
};

export const getWhatsAppUrl = (phone?: string, text?: string): string => {
  const norm = normalizeWhatsAppNumber(phone || '+8801586366002');
  const encodedText = text ? encodeURIComponent(text) : '';
  // api.whatsapp.com works seamlessly across desktop (WhatsApp Web) & mobile app without wa.me redirect blocks
  return `https://api.whatsapp.com/send?phone=${norm}${encodedText ? `&text=${encodedText}` : ''}`;
};


