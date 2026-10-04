import { TestPackage, LabPartner, Language, BookingHistoryItem, SiteSettings, PatientUser, HealthPackage, CategoryItem, DateSlotConfig, TimeSlotConfigItem, StaffUser, StaffRole, StaffPermissions, PaymentGatewaysConfig, AdminCredentials } from '../types';
import { 
  getTests as getDefaultTests, 
  getLabs as getDefaultLabs, 
  getSiteSettings as getDefaultSiteSettings,
  getPackages as getDefaultPackages
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
  CATEGORIES: 'labhome_categories_v2',
  SITE_SETTINGS_BN: 'labhome_site_settings_bn_v2',
  SITE_SETTINGS_EN: 'labhome_site_settings_en_v2',
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
    saveStaffUsersToFirestore(staff);
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
    saveDateSlotConfigToFirestore(config);
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

export const getStoredTests = (lang: Language): TestPackage[] => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.TESTS_EN : STORAGE_KEYS.TESTS_BN;
    const stored = localStorage.getItem(key);
    const defaultList = getDefaultTests(lang);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If stored has fewer tests than defaultList, merge remaining defaults
        if (parsed.length < defaultList.length) {
          const existingIds = new Set(parsed.map((p: TestPackage) => p.id));
          const merged = [...parsed, ...defaultList.filter(d => !existingIds.has(d.id))];
          localStorage.setItem(key, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored tests:", e);
  }
  return getDefaultTests(lang);
};

export const saveStoredTests = (lang: Language, tests: TestPackage[]): void => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.TESTS_EN : STORAGE_KEYS.TESTS_BN;
    localStorage.setItem(key, JSON.stringify(tests));
    
    // Also sync test IDs, prices, hidden status, and new custom tests to other language
    const otherLang = lang === 'en' ? 'bn' : 'en';
    const otherKey = otherLang === 'en' ? STORAGE_KEYS.TESTS_EN : STORAGE_KEYS.TESTS_BN;
    const otherStored = localStorage.getItem(otherKey);
    let otherTests: TestPackage[] = otherStored ? JSON.parse(otherStored) : getDefaultTests(otherLang);
    
    // Update existing or append new
    const updatedOtherTests = [...otherTests];
    tests.forEach(test => {
      const idx = updatedOtherTests.findIndex(ot => ot.id === test.id);
      if (idx !== -1) {
        updatedOtherTests[idx] = {
          ...updatedOtherTests[idx],
          price: test.price,
          originalPrice: test.originalPrice,
          discountPercent: test.discountPercent,
          priceByLab: test.priceByLab,
          originalPriceByLab: test.originalPriceByLab,
          isHidden: test.isHidden,
          category: test.category,
          turnaroundTime: test.turnaroundTime,
          image: test.image
        };
      } else {
        updatedOtherTests.unshift({ ...test });
      }
    });
    // Remove deleted tests from other language too
    const currentIds = new Set(tests.map(t => t.id));
    const filteredOther = updatedOtherTests.filter(ot => currentIds.has(ot.id));
    localStorage.setItem(otherKey, JSON.stringify(filteredOther));
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

export const getStoredBookings = (): BookingHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        const deduplicated: BookingHistoryItem[] = [];
        for (const item of parsed) {
          if (item && item.id) {
            const cleanId = String(item.id).replace(/^#?EC-?/i, '').replace(/^#?BK-?/i, '').replace(/^#/, '');
            const sanitizedItem = { ...item, id: cleanId };
            if (!seen.has(cleanId)) {
              seen.add(cleanId);
              deduplicated.push(sanitizedItem);
            }
          }
        }
        return deduplicated;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored bookings:", e);
  }
  return INITIAL_BOOKINGS;
};

export const saveStoredBookings = (bookings: BookingHistoryItem[]): void => {
  try {
    const seen = new Set<string>();
    const deduplicated = bookings.filter(item => {
      if (!item || !item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(deduplicated));
  } catch (e) {
    console.error("Failed to save bookings to storage:", e);
  }
};

export const getStoredSiteSettings = (lang: Language): SiteSettings => {
  const defaultSettings = getDefaultSiteSettings(lang);
  try {
    const key = lang === 'en' ? STORAGE_KEYS.SITE_SETTINGS_EN : STORAGE_KEYS.SITE_SETTINGS_BN;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && parsed.siteName) {
        return {
          ...defaultSettings,
          ...parsed,
          heroImages: (Array.isArray(parsed.heroImages) && parsed.heroImages.length > 0) ? parsed.heroImages : defaultSettings.heroImages,
          howItWorksSteps: (Array.isArray(parsed.howItWorksSteps) && parsed.howItWorksSteps.length > 0) ? parsed.howItWorksSteps : defaultSettings.howItWorksSteps,
          aboutStats: (Array.isArray(parsed.aboutStats) && parsed.aboutStats.length > 0) ? parsed.aboutStats : defaultSettings.aboutStats,
          services: (Array.isArray(parsed.services) && parsed.services.length > 0) ? parsed.services : defaultSettings.services,
          nursingServices: (Array.isArray(parsed.nursingServices) && parsed.nursingServices.length > 0) ? parsed.nursingServices : defaultSettings.nursingServices
        };
      }
    }
  } catch (e) {
    console.error("Failed to parse stored site settings:", e);
  }
  return defaultSettings;
};

export const saveStoredSiteSettings = (lang: Language, settings: SiteSettings): void => {
  try {
    const key = lang === 'en' ? STORAGE_KEYS.SITE_SETTINGS_EN : STORAGE_KEYS.SITE_SETTINGS_BN;
    localStorage.setItem(key, JSON.stringify(settings));

    // Also sync contact information, logo, hero images, and phone numbers to other language version
    const otherLang = lang === 'en' ? 'bn' : 'en';
    const otherKey = otherLang === 'en' ? STORAGE_KEYS.SITE_SETTINGS_EN : STORAGE_KEYS.SITE_SETTINGS_BN;
    const otherStored = localStorage.getItem(otherKey);
    let otherSettings: SiteSettings = otherStored ? JSON.parse(otherStored) : getDefaultSiteSettings(otherLang);

    const mergedOther: SiteSettings = {
      ...otherSettings,
      logoUrl: settings.logoUrl,
      logoIcon: settings.logoIcon,
      faviconUrl: settings.faviconUrl || otherSettings.faviconUrl,
      heroImages: settings.heroImages || otherSettings.heroImages,
      showPartnerSection: settings.showPartnerSection !== undefined ? settings.showPartnerSection : otherSettings.showPartnerSection,
      showPopularTestsSection: settings.showPopularTestsSection !== undefined ? settings.showPopularTestsSection : otherSettings.showPopularTestsSection,
      showPackagesSection: settings.showPackagesSection !== undefined ? settings.showPackagesSection : otherSettings.showPackagesSection,
      showNursingSection: settings.showNursingSection !== undefined ? settings.showNursingSection : otherSettings.showNursingSection,
      showHowItWorksSection: settings.showHowItWorksSection !== undefined ? settings.showHowItWorksSection : otherSettings.showHowItWorksSection,
      showServicesSection: settings.showServicesSection !== undefined ? settings.showServicesSection : otherSettings.showServicesSection,
      aboutImage: settings.aboutImage || otherSettings.aboutImage,
      contactAddress: otherSettings.contactAddress || settings.contactAddress,
      contactPhone: settings.contactPhone,
      contactHotline: settings.contactHotline,
      contactEmail: settings.contactEmail,
      contactWhatsApp: settings.contactWhatsApp,
      emergencyNumber: settings.emergencyNumber,
      nursingHotline: settings.nursingHotline || otherSettings.nursingHotline,
      nursingWhatsApp: settings.nursingWhatsApp || otherSettings.nursingWhatsApp,
      facebookUrl: settings.facebookUrl
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
    savePatientsListToFirestore(patients);
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

    if (cleanPhone.length < 11) {
      return { success: false, message: '১১ ডিজিটের কম মোবাইল নম্বর দিয়ে রেজিস্ট্রেশন করা যাবে না।' };
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
    saveAdminCredentialsToFirestore(credObj);
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
    (cleanAdminUser === 'admin' && (cleanInputUser === 'admin@labhome.com' || cleanInputUser === 'muradhn.abc@gmail.com'));

  if (isAdminUserMatch && inputPass === adminCreds.password) {
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
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAdminSessionActive = (active: boolean): void => {
  try {
    if (active) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
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

