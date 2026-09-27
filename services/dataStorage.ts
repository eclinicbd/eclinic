import { TestPackage, LabPartner, Language, BookingHistoryItem, SiteSettings, PatientUser, HealthPackage, CategoryItem } from '../types';
import { 
  getTests as getDefaultTests, 
  getLabs as getDefaultLabs, 
  getSiteSettings as getDefaultSiteSettings,
  getPackages as getDefaultPackages
} from '../constants';

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
  CURRENT_PATIENT: 'labhome_current_patient_v2'
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
    id: "BK-2025",
    customerName: "রাহিম আহমেদ (Rahim Ahmed)",
    customerPhone: "01712345678",
    customerAddress: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা",
    date: "2024-03-22",
    time: "10:00 AM - 11:00 AM",
    labId: "lab_popular",
    labName: "পপুলার ডায়াগনস্টিক সেন্টার লিঃ",
    testNames: ["কমপ্লিট ব্লাড কাউন্ট (CBC)", "লিপিড প্রোফাইল"],
    totalCost: 2150,
    status: "pending",
    doctorName: "Dr. K. M. Rahman",
    createdAt: "2024-03-20T10:30:00Z"
  },
  {
    id: "BK-2024",
    customerName: "করিম উদ্দিন (Karim Uddin)",
    customerPhone: "01812345678",
    customerAddress: "প্লট ৯, সেক্টর ৩, উত্তরা, ঢাকা",
    date: "2024-03-22",
    time: "11:00 AM - 12:00 PM",
    labId: "lab_labaid",
    labName: "ল্যাবএইড ডায়াগনস্টিক সেন্টার",
    testNames: ["ডায়াবেটিস চেকআপ (HbA1c)"],
    totalCost: 1250,
    status: "confirmed",
    createdAt: "2024-03-21T08:15:00Z"
  },
  {
    id: "BK-2023",
    customerName: "সালমা বেগম (Salma Begum)",
    customerPhone: "01912345678",
    customerAddress: "ব্লক সি, মিরপুর ১০, ঢাকা",
    date: "2024-03-21",
    time: "09:00 AM - 10:00 AM",
    labId: "lab_birdem",
    labName: "বারডেম জেনারেল হাসপাতাল",
    testNames: ["ভিটামিন ডি টেস্ট", "থাইরয়েড প্রোফাইল (T3, T4, TSH)"],
    totalCost: 3550,
    status: "completed",
    doctorName: "Prof. Dr. Nazmul Huda",
    createdAt: "2024-03-19T14:20:00Z"
  },
  {
    id: "BK-2022",
    customerName: "তানভীর হাসান (Tanvir Hasan)",
    customerPhone: "01612345678",
    customerAddress: "রোড ৮, বনানী, ঢাকা",
    date: "2024-03-21",
    time: "02:00 PM - 03:00 PM",
    labId: "lab_bsmmu",
    labName: "বিএসএমএমইউ (পিজি হাসপাতাল)",
    testNames: ["কমপ্লিট ব্লাড কাউন্ট (CBC)"],
    totalCost: 400,
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
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored bookings:", e);
  }
  return INITIAL_BOOKINGS;
};

export const saveStoredBookings = (bookings: BookingHistoryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
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
      heroImages: settings.heroImages || otherSettings.heroImages,
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

export interface AdminCredentials {
  username: string;
  password: string;
  updatedAt?: string;
}

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
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({
      ...credentials,
      updatedAt: new Date().toISOString()
    }));
  } catch (e) {
    console.error("Error saving admin credentials:", e);
  }
};

export const verifyAdminLogin = (inputUsername: string, inputPass: string): boolean => {
  const creds = getStoredAdminCredentials();
  const cleanInputUser = (inputUsername || '').trim().toLowerCase();
  const cleanSavedUser = (creds.username || '').trim().toLowerCase();
  
  // Accept match with saved custom username, default handles, or registered admin email
  const isUserMatch = 
    cleanInputUser === cleanSavedUser || 
    (cleanSavedUser === 'admin' && (cleanInputUser === 'admin@labhome.com' || cleanInputUser === 'muradhn.abc@gmail.com'));
                      
  // Check exact match with configured password
  const isPassMatch = inputPass === creds.password;

  return Boolean(isUserMatch && isPassMatch);
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

export const exportAllDataBackup = () => {
  return {
    version: '2.6',
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
    site_settings_en: getStoredSiteSettings('en')
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
    return true;
  } catch (e) {
    console.error("Failed to import backup:", e);
    return false;
  }
};

