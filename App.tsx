
import React, { useState, useEffect, useRef } from 'react';
import { TestPackage, HealthPackage, LabPartner, Language, BookingHistoryItem, SiteSettings, PatientUser, CategoryItem, Doctor, DoctorAppointment, EPrescription } from './types';
import { TRANSLATIONS } from './translations';
import { 
  getStoredTests, 
  saveStoredTests, 
  getStoredLabs, 
  saveStoredLabs, 
  getStoredPackages,
  saveStoredPackages,
  getStoredCategories,
  saveStoredCategories,
  getStoredBookings, 
  saveStoredBookings,
  getStoredSiteSettings,
  saveStoredSiteSettings,
  getStoredDoctors,
  setStoredDoctors,
  resetAllDataToDefaults,
  getStoredCurrentPatient,
  saveStoredCurrentPatient,
  updateStoredPatientProfile,
  getStoredPatients,
  saveStoredPatients,
  getIsAdminSessionActive,
  setAdminSessionActive
} from './services/dataStorage';
import { 
  auth, 
  onAuthStateChanged, 
  saveBookingToFirestore, 
  saveUserProfileToFirestore,
  subscribeToBookings, 
  logoutFirebase,
  saveSiteSettingsToFirestore,
  subscribeToSiteSettings,
  saveCategoriesToFirestore,
  subscribeToCategories,
  saveLabsToFirestore,
  subscribeToLabs,
  saveTestsToFirestore,
  subscribeToTests,
  savePackagesToFirestore,
  subscribeToPackages,
  saveDoctorsToFirestore,
  subscribeToDoctors,
  subscribeToUsers,
  subscribeToPaymentConfig,
  subscribeToAdminCredentials,
  subscribeToStaffUsers,
  subscribeToPatientsList,
  subscribeToDateSlotConfig
} from './services/firebase';
import { 
  sendOrderNotificationEmail, 
  sendPatientRegistrationNotificationEmail 
} from './services/emailNotificationService';
import { saveStoredPaymentConfig } from './services/dataStorage';
import { TestCard } from './components/TestCard';
import { BookingModal, calculateAccessoriesFee } from './components/BookingModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PatientAuthModal } from './components/PatientAuthModal';
import { TestsView } from './components/TestsView';
import { PackagesView } from './components/PackagesView';
import { DoctorsView } from './components/DoctorsView';
import { PackageDetailModal } from './components/PackageDetailModal';
import { HomePackagesSection } from './components/HomePackagesSection';
import { HomePopularTestsSection } from './components/HomePopularTestsSection';
import { NursingCareSection } from './components/NursingCareSection';
import { HomeAppDownloadSection } from './components/HomeAppDownloadSection';
import { HomeDoctorConsultationSection } from './components/HomeDoctorConsultationSection';
import { DoctorBookingModal } from './components/DoctorBookingModal';
import { DoctorVideoConsultationModal } from './components/DoctorVideoConsultationModal';
import { EPrescriptionModal } from './components/EPrescriptionModal';
import { LabLogo } from './components/LabLogo';
import { Button } from './components/Button';
import { 
  Search, 
  FlaskConical, 
  Phone, 
  Menu, 
  Activity, 
  Home, 
  User, 
  Globe, 
  ShoppingCart, 
  ChevronRight, 
  ChevronLeft,
  Check, 
  ShieldCheck, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  ShoppingBag,
  HeartPulse,
  Stethoscope,
  MessageSquare,
  Clock,
  FileText,
  Sparkles,
  MapPin,
  Mail,
  Layers,
  Award,
  Users,
  Building2,
  Star,
  ArrowRight,
  LogIn,
  UserPlus,
  LogOut
} from 'lucide-react';

import { DEFAULT_HERO_IMAGES, DEFAULT_NURSING_SERVICES_BN, DEFAULT_NURSING_SERVICES_EN, DEFAULT_HOME_SECTIONS_ORDER } from './constants';

const CATEGORIES = ['All', 'General', 'Diabetes', 'Heart', 'Thyroid', 'Vitamin'];

// Helper to determine active view based on URL path or hash
const getViewFromLocation = (): 'home' | 'tests' | 'packages' | 'doctors' | 'dashboard' | 'admin' => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();

  if (
    path === '/admin' || 
    path.startsWith('/admin/') || 
    hash === '#admin' || 
    hash.startsWith('#/admin') || 
    search.includes('view=admin') ||
    search.includes('admin=true')
  ) {
    return 'admin';
  }
  if (hash === '#tests' || hash.startsWith('#tests') || hash.startsWith('#/tests')) {
    return 'tests';
  }
  if (hash === '#packages' || hash.startsWith('#packages') || hash.startsWith('#/packages')) {
    return 'packages';
  }
  if (hash === '#doctors' || hash.startsWith('#doctors') || hash.startsWith('#/doctors') || path === '/doctors' || path.startsWith('/doctors') || search.includes('view=doctors')) {
    return 'doctors';
  }
  if (hash === '#dashboard' || hash.startsWith('#dashboard') || hash.startsWith('#/dashboard')) {
    return 'dashboard';
  }
  return 'home';
};

// Helper to determine if current URL is accessing the Admin Portal route
const isPathAdmin = () => {
  return getViewFromLocation() === 'admin';
};

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('labhome_lang');
    return (saved === 'bn' || saved === 'en') ? saved : 'en';
  });
  const [currentView, setCurrentView] = useState<'home' | 'tests' | 'packages' | 'doctors' | 'dashboard' | 'admin'>(() => {
    return getViewFromLocation();
  });
  const [currentPatient, setCurrentPatient] = useState<PatientUser | null>(() => getStoredCurrentPatient());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [cart, setCart] = useState<string[]>([]); // Array of Test/Package IDs
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [highlightedTestId, setHighlightedTestId] = useState<string | null>(null);
  
  // Real-time editable state synchronized with LocalStorage
  const [tests, setTests] = useState<TestPackage[]>(() => getStoredTests(language));
  const [labs, setLabs] = useState<LabPartner[]>(() => getStoredLabs(language));
  const [packages, setPackages] = useState<HealthPackage[]>(() => getStoredPackages(language));
  const [doctors, setDoctors] = useState<Doctor[]>(() => getStoredDoctors(language));
  const [categories, setCategories] = useState<CategoryItem[]>(() => getStoredCategories());
  const [bookings, setBookings] = useState<BookingHistoryItem[]>(() => getStoredBookings());
  const [patients, setPatients] = useState<PatientUser[]>(() => getStoredPatients());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getStoredSiteSettings(language));
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<HealthPackage | null>(null);

  // Doctor Consultation & Telemedicine Interactive States
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [selectedAppointmentForVideo, setSelectedAppointmentForVideo] = useState<DoctorAppointment | null>(null);
  const [selectedPrescriptionForView, setSelectedPrescriptionForView] = useState<EPrescription | null>(null);

  // Secure Admin Authentication State (session based, prevents public domain auto-login)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => getIsAdminSessionActive());
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(() => isPathAdmin() && !getIsAdminSessionActive());

  // Dynamic Browser Favicon & Title synchronization
  useEffect(() => {
    if (siteSettings) {
      const faviconUrl = siteSettings.faviconUrl || siteSettings.logoUrl || 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png';
      const linkIds = ['app-favicon', 'app-shortcut-icon', 'app-apple-icon'];
      
      linkIds.forEach(id => {
        let el = document.getElementById(id) as HTMLLinkElement | null;
        if (!el) {
          el = document.createElement('link');
          el.id = id;
          el.rel = id === 'app-apple-icon' ? 'apple-touch-icon' : (id === 'app-shortcut-icon' ? 'shortcut icon' : 'icon');
          document.head.appendChild(el);
        }
        el.href = faviconUrl;
      });

      if (siteSettings.siteName) {
        document.title = `${siteSettings.siteName} - ${siteSettings.siteTagline || (language === 'bn' ? 'স্মার্ট হেলথকেয়ার' : 'Smart Healthcare')}`;
      }
    }
  }, [siteSettings, language]);

  // Listen to browser Back/Forward buttons and URL changes without abruptly kicking the user out of the site
  useEffect(() => {
    const currentLocView = getViewFromLocation();
    if (!window.history.state) {
      window.history.replaceState({ view: currentLocView }, '', window.location.href);
    }

    const handlePopState = (e: PopStateEvent) => {
      // 1. If any modal is open, close the modal first instead of navigating away
      if (isBookingModalOpen) {
        setIsBookingModalOpen(false);
        return;
      }
      if (selectedPackageForDetail) {
        setSelectedPackageForDetail(null);
        return;
      }
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
        return;
      }
      if (isAdminLoginModalOpen && currentView !== 'admin') {
        setIsAdminLoginModalOpen(false);
        return;
      }

      // 2. Otherwise navigate to the target view from history state or URL
      const targetView: 'home' | 'tests' | 'packages' | 'dashboard' | 'admin' = 
        (e.state && e.state.view) ? e.state.view : getViewFromLocation();
      
      if (targetView === 'admin') {
        const hasSession = getIsAdminSessionActive();
        setIsAdminAuthenticated(hasSession);
        if (!hasSession) {
          setIsAdminLoginModalOpen(true);
        }
        setCurrentView('admin');
      } else {
        setIsAdminLoginModalOpen(false);
        setCurrentView(targetView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [isBookingModalOpen, selectedPackageForDetail, isAuthModalOpen, isAdminLoginModalOpen, currentView]);

  const [isLabPaused, setIsLabPaused] = useState(false);
  const labScrollRef = useRef<HTMLDivElement>(null);

  const scrollLabs = (direction: 'left' | 'right') => {
    if (labScrollRef.current) {
      const isMobile = window.innerWidth < 640;
      const scrollAmount = isMobile ? labScrollRef.current.clientWidth : 240;
      labScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll partner labs horizontally (1 lab at a time)
  useEffect(() => {
    if (currentView !== 'home' || isLabPaused) return;

    const interval = setInterval(() => {
      if (labScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = labScrollRef.current;
        const step = window.innerWidth < 640 ? clientWidth : 240;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          labScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          labScrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
        }
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [currentView, isLabPaused, labs]);

  // Default to the first lab (Popular)
  const [selectedLabId, setSelectedLabId] = useState<string>(() => labs[0]?.id || 'lab_popular');

  const t = TRANSLATIONS[language];

  // Language switch reload
  useEffect(() => {
    setTests(getStoredTests(language));
    setLabs(getStoredLabs(language));
    setPackages(getStoredPackages(language));
    setDoctors(getStoredDoctors(language));
    setSiteSettings(getStoredSiteSettings(language));
  }, [language]);

  // If labs change and selectedLabId is invalid or hidden, default to ''
  useEffect(() => {
    const visibleLabs = labs.filter(l => !l.isHidden);
    if (selectedLabId && !visibleLabs.some(l => l.id === selectedLabId)) {
      setSelectedLabId('');
    }
  }, [labs, selectedLabId]);

  const activeHeroImages = (siteSettings.heroImages && siteSettings.heroImages.length > 0)
    ? siteSettings.heroImages
    : DEFAULT_HERO_IMAGES;

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % activeHeroImages.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [activeHeroImages.length]);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'bn' ? 'en' : 'bn';
      localStorage.setItem('labhome_lang', next);
      return next;
    });
  };

  const handleUpdateTests = (updated: TestPackage[]) => {
    setTests(updated);
    saveStoredTests(language, updated);
    saveTestsToFirestore(language, updated);
  };

  const handleUpdateLabs = (updated: LabPartner[]) => {
    setLabs(updated);
    saveStoredLabs(language, updated);
    saveLabsToFirestore(language, updated);
  };

  const handleUpdatePackages = (updated: HealthPackage[]) => {
    setPackages(updated);
    saveStoredPackages(language, updated);
    savePackagesToFirestore(language, updated);
  };

  const handleUpdateCategories = (updated: CategoryItem[]) => {
    setCategories(updated);
    saveStoredCategories(updated);
    saveCategoriesToFirestore(updated);
  };

  const handleUpdateBookings = (updated: BookingHistoryItem[]) => {
    setBookings(updated);
    saveStoredBookings(updated);
  };

  const handleUpdatePatients = (updated: PatientUser[]) => {
    setPatients(updated);
    saveStoredPatients(updated);
  };

  const handleUpdateDoctors = (updated: Doctor[]) => {
    setDoctors(updated);
    setStoredDoctors(updated, language);
    saveDoctorsToFirestore(language, updated);
    const otherLang = language === 'en' ? 'bn' : 'en';
    const otherStored = getStoredDoctors(otherLang);
    saveDoctorsToFirestore(otherLang, otherStored);
  };

  // Check if Doctor Telemedicine Module is currently active
  const isDoctorModuleActive = siteSettings.showDoctorsSection !== false && doctors.some(d => d.isActive !== false);

  // Auto redirect from doctor view if doctor module is inactive
  useEffect(() => {
    if (currentView === 'doctors' && !isDoctorModuleActive) {
      setCurrentView('home');
      if (window.location.hash === '#doctors') {
        window.history.replaceState({ view: 'home' }, '', `${window.location.pathname}#home`);
      }
    }
  }, [currentView, isDoctorModuleActive]);

  const handleUpdateSiteSettings = (updated: SiteSettings) => {
    setSiteSettings(updated);
    saveStoredSiteSettings(language, updated);
    // Real-time synchronization to Firestore ensures changes are visible to ALL visitors across the live domain
    saveSiteSettingsToFirestore(language, updated);
    const otherLang = language === 'en' ? 'bn' : 'en';
    const otherSettings = getStoredSiteSettings(otherLang);
    saveSiteSettingsToFirestore(otherLang, otherSettings);
  };

  const handleResetAllData = () => {
    resetAllDataToDefaults();
    const dTests = getStoredTests(language);
    const dLabs = getStoredLabs(language);
    const dPkgs = getStoredPackages(language);
    const dDocs = getStoredDoctors(language);
    const dCats = getStoredCategories();
    const dSettings = getStoredSiteSettings(language);
    
    setTests(dTests);
    setLabs(dLabs);
    setPackages(dPkgs);
    setDoctors(dDocs);
    setCategories(dCats);
    setBookings(getStoredBookings());
    setSiteSettings(dSettings);

    // Sync reset to Firestore
    saveTestsToFirestore(language, dTests);
    saveLabsToFirestore(language, dLabs);
    savePackagesToFirestore(language, dPkgs);
    saveCategoriesToFirestore(dCats);
    saveSiteSettingsToFirestore(language, dSettings);
  };

  // Real-time subscription to Site Settings (Header, Footer, Logo, Tagline, Phone, Address, Hero Images, Services)
  useEffect(() => {
    const unsubscribe = subscribeToSiteSettings(language, (liveSettings) => {
      if (liveSettings && Object.keys(liveSettings).length > 0) {
        setSiteSettings(prev => {
          const merged = { ...prev, ...liveSettings };
          saveStoredSiteSettings(language, merged);
          return merged;
        });
      }
    });
    return () => unsubscribe();
  }, [language]);

  // Real-time subscription to Categories
  useEffect(() => {
    const unsubscribe = subscribeToCategories((liveCategories) => {
      if (liveCategories && liveCategories.length > 0) {
        setCategories(liveCategories);
        saveStoredCategories(liveCategories);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time subscription to Labs
  useEffect(() => {
    const unsubscribe = subscribeToLabs(language, (liveLabs) => {
      if (liveLabs && liveLabs.length > 0) {
        setLabs(liveLabs);
        saveStoredLabs(language, liveLabs);
      }
    });
    return () => unsubscribe();
  }, [language]);

  // Real-time subscription to Tests
  useEffect(() => {
    const unsubscribe = subscribeToTests(language, (liveTests) => {
      if (liveTests && liveTests.length > 0) {
        setTests(liveTests);
        saveStoredTests(language, liveTests);
      }
    });
    return () => unsubscribe();
  }, [language]);

  // Real-time subscription to Packages
  useEffect(() => {
    const unsubscribe = subscribeToPackages(language, (livePkgs) => {
      if (livePkgs && livePkgs.length > 0) {
        setPackages(livePkgs);
        saveStoredPackages(language, livePkgs);
      }
    });
    return () => unsubscribe();
  }, [language]);

  // Real-time subscription to Doctors
  useEffect(() => {
    const unsubscribe = subscribeToDoctors(language, (liveDoctors) => {
      if (liveDoctors && liveDoctors.length > 0) {
        setDoctors(liveDoctors);
        setStoredDoctors(liveDoctors, language);
      }
    });
    return () => unsubscribe();
  }, [language]);

  // Real-time subscription to Registered Patients in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToUsers((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setPatients(prev => {
          const firestoreIds = new Set(firestoreUsers.map(u => u.id));
          const localOnly = prev.filter(u => !firestoreIds.has(u.id));
          const merged = [...firestoreUsers, ...localOnly];
          saveStoredPatients(merged);
          return merged;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time subscription to Payment Gateways API Configuration in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPaymentConfig((liveConfig) => {
      if (liveConfig && Object.keys(liveConfig).length > 0) {
        saveStoredPaymentConfig(liveConfig);
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time subscription to Super Admin Credentials in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToAdminCredentials((liveCreds) => {
      if (liveCreds && liveCreds.username && liveCreds.password) {
        localStorage.setItem('labhome_admin_credentials_v1', JSON.stringify(liveCreds));
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time subscription to Staff Users & Passwords in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToStaffUsers((liveStaff) => {
      if (liveStaff && liveStaff.length > 0) {
        localStorage.setItem('labhome_staff_users_v1', JSON.stringify(liveStaff));
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time subscription to Full Patients List in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPatientsList((livePatients) => {
      if (livePatients && livePatients.length > 0) {
        setPatients(livePatients);
        localStorage.setItem('labhome_patients_v2', JSON.stringify(livePatients));
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time subscription to Date Slot Config in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToDateSlotConfig((liveSlotConfig) => {
      if (liveSlotConfig && liveSlotConfig.slots && liveSlotConfig.slots.length > 0) {
        localStorage.setItem('labhome_date_slot_config_v1', JSON.stringify(liveSlotConfig));
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore bookings
  useEffect(() => {
    const unsubscribe = subscribeToBookings((firestoreBookings) => {
      if (firestoreBookings && firestoreBookings.length > 0) {
        setBookings(prev => {
          const seenIds = new Set<string>();
          const deduplicated: BookingHistoryItem[] = [];
          
          // Prioritize incoming Firestore entries
          for (const item of firestoreBookings) {
            if (item && item.id && !seenIds.has(item.id)) {
              seenIds.add(item.id);
              deduplicated.push(item);
            }
          }
          // Append any local-only entries that don't match Firestore IDs or same phone+time+date
          for (const item of prev) {
            if (item && item.id && !seenIds.has(item.id)) {
              seenIds.add(item.id);
              deduplicated.push(item);
            }
          }
          
          saveStoredBookings(deduplicated);
          return deduplicated;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync Firebase Auth status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const existing = getStoredCurrentPatient();
        if (!existing || existing.id !== fbUser.uid) {
          const userObj: PatientUser = {
            id: fbUser.uid,
            name: fbUser.displayName || existing?.name || 'Patient',
            email: fbUser.email || undefined,
            phone: fbUser.phoneNumber || existing?.phone || '01700000000',
            avatar: fbUser.photoURL || existing?.avatar,
            address: existing?.address || 'Dhaka, Bangladesh',
            createdAt: existing?.createdAt || new Date().toISOString()
          };
          setCurrentPatient(userObj);
          saveStoredCurrentPatient(userObj);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNewBooking = (booking: BookingHistoryItem) => {
    setBookings(prev => {
      if (prev.some(b => b.id === booking.id)) {
        return prev;
      }
      const next = [booking, ...prev];
      saveStoredBookings(next);
      return next;
    });
    // Persist real-time to Firebase Firestore
    saveBookingToFirestore(booking);

    // Send automatic notification email to eclinicbd24@gmail.com with Invoice, Schedule & Patient Details
    sendOrderNotificationEmail(booking, language);

    // Automatically increment orderCount for booked tests
    const bookedIds = new Set<string>();
    const bookedNames = new Set<string>();

    if (booking.items && Array.isArray(booking.items)) {
      booking.items.forEach(it => {
        if (it.id) bookedIds.add(it.id);
        if (it.name) bookedNames.add(it.name.toLowerCase().trim());
      });
    }
    if (booking.testNames && Array.isArray(booking.testNames)) {
      booking.testNames.forEach(name => {
        if (name) bookedNames.add(name.toLowerCase().trim());
      });
    }

    setTests(prevTests => {
      let changed = false;
      const updatedTests = prevTests.map(test => {
        const isMatched = 
          bookedIds.has(test.id) ||
          bookedNames.has(test.name.toLowerCase().trim()) ||
          Array.from(bookedNames).some(bn => bn.includes(test.name.toLowerCase().trim()) || test.name.toLowerCase().trim().includes(bn));
        
        if (isMatched) {
          changed = true;
          const currentCount = test.orderCount || 0;
          return { ...test, orderCount: currentCount + 1 };
        }
        return test;
      });

      if (changed) {
        saveStoredTests(language, updatedTests);
        saveTestsToFirestore(language, updatedTests);
      }
      return updatedTests;
    });
  };

  const toggleCart = (test: TestPackage | { id: string }) => {
    setCart(prev => {
      if (prev.includes(test.id)) {
        return prev.filter(id => id !== test.id);
      } else {
        return [...prev, test.id];
      }
    });
  };

  const addToCart = (test: TestPackage | { id: string } | string) => {
    const id = typeof test === 'string' ? test : test.id;
    setCart(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const handleDirectBookPackage = (pkgId: string, labId?: string) => {
    if (labId) setSelectedLabId(labId);
    setCart(prev => prev.includes(pkgId) ? prev : [...prev, pkgId]);
    setIsBookingModalOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(itemId => itemId !== id));
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const openCartModal = () => {
    setIsBookingModalOpen(true);
  };

  const handleOpenAuth = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (patient: PatientUser) => {
    setCurrentPatient(patient);
    saveStoredCurrentPatient(patient);
    setPatients(prev => {
      const exists = prev.some(p => p.id === patient.id || (p.phone && p.phone === patient.phone));
      if (!exists) {
        // Send automatic notification email to eclinicbd24@gmail.com
        sendPatientRegistrationNotificationEmail(patient, language);

        const next = [patient, ...prev];
        saveStoredPatients(next);
        return next;
      }
      return prev.map(p => (p.id === patient.id || (p.phone && p.phone === patient.phone)) ? patient : p);
    });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    saveStoredCurrentPatient(null);
    setCurrentPatient(null);
    logoutFirebase();
    navigateToHome();
  };

  const handleOpenAdminPortal = () => {
    if (window.location.pathname !== '/admin' && window.location.hash !== '#admin') {
      window.history.pushState({ view: 'admin' }, '', '/admin');
    }
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginModalOpen(false);
    if (window.location.pathname !== '/admin' && window.location.hash !== '#admin') {
      window.history.pushState({ view: 'admin' }, '', '/admin');
    }
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setAdminSessionActive(false);
    setIsAdminAuthenticated(false);
    if (window.location.pathname === '/admin' || window.location.hash.includes('admin')) {
      window.history.pushState({ view: 'home' }, '', '/');
    }
    setCurrentView('home');
  };

  const handleUpdatePatientProfile = (updates: Partial<PatientUser>) => {
    if (!currentPatient) return;
    const res = updateStoredPatientProfile(currentPatient.id, updates);
    if (res.success && res.patient) {
      setCurrentPatient(res.patient);
      saveUserProfileToFirestore(res.patient);
      setPatients(prev => prev.map(p => p.id === res.patient!.id ? res.patient! : p));
    }
  };

  const handlePatientNavClick = () => {
    if (currentPatient) {
      setCurrentView('dashboard');
      if (window.location.hash !== '#dashboard') {
        window.history.pushState({ view: 'dashboard' }, '', `${window.location.pathname}#dashboard`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleOpenAuth('login');
    }
  };

  const navigateToTests = (categoryId?: any, labId?: any, search?: string, highlightTestId?: string, pushHistory = true) => {
    const validCategory = (typeof categoryId === 'string' && categoryId) ? categoryId : 'All';
    const validLab = (typeof labId === 'string') ? labId : (selectedLabId || '');
    const validSearch = (typeof search === 'string') ? search : '';
    const validHighlight = (typeof highlightTestId === 'string') ? highlightTestId : null;

    setActiveCategory(validCategory);
    setSelectedLabId(validLab);
    setSearchTerm(validSearch);
    setHighlightedTestId(validHighlight);
    setCurrentView('tests');
    
    if (pushHistory && window.location.hash !== '#tests') {
      window.history.pushState({ view: 'tests' }, '', `${window.location.pathname}#tests`);
    }

    if (!validHighlight) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToPackages = (pushHistory = true) => {
    setCurrentView('packages');
    if (pushHistory && window.location.hash !== '#packages') {
      window.history.pushState({ view: 'packages' }, '', `${window.location.pathname}#packages`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToDoctors = (pushHistory = true) => {
    setCurrentView('doctors');
    if (pushHistory && window.location.hash !== '#doctors') {
      window.history.pushState({ view: 'doctors' }, '', `${window.location.pathname}#doctors`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = (pushHistory = true) => {
    setCurrentView('home');
    if (pushHistory && (window.location.hash || window.location.pathname === '/admin')) {
      window.history.pushState({ view: 'home' }, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    if (id === 'tests') {
      navigateToTests();
      return;
    }
    if (id === 'packages') {
      navigateToPackages();
      return;
    }

    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        if (id === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
        else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const filteredTests = tests.filter(test => {
    if (test.isHidden) return false;
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || test.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Get full objects for selected tests and packages
  const allAvailableItems = [...tests, ...packages];
  const cartItems = allAvailableItems.filter(item => cart.includes(item.id));
  
  // Calculate total bill - if specific lab selected, use that price, otherwise default
  // Plus Service Charge if Lab is selected
  const selectedLab = labs.find(l => l.id === selectedLabId);
  const serviceCharge = selectedLab ? selectedLab.serviceCharge : 0;

  const subTotal = cartItems.reduce((sum, item) => {
    if (selectedLabId && item.priceByLab && item.priceByLab[selectedLabId]) {
      return sum + item.priceByLab[selectedLabId];
    }
    return sum + item.price;
  }, 0);

  const handleHeaderBookTestClick = () => {
    setIsBookingModalOpen(true);
  };

  const accessoriesFee = calculateAccessoriesFee(cartItems.length);
  const totalBill = subTotal + (cartItems.length > 0 ? serviceCharge : 0) + accessoriesFee;

  const renderBrandLogo = () => {
    if (siteSettings.logoUrl) {
      return (
        <img 
          src={siteSettings.logoUrl} 
          alt={siteSettings.siteName || "Logo"} 
          className="w-9 h-9 object-contain rounded-xl bg-white p-0.5 border border-slate-200"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    const iconMap: Record<string, any> = {
      Activity,
      HeartPulse,
      Stethoscope,
      ShieldCheck,
      FlaskConical
    };
    const IconComponent = iconMap[siteSettings.logoIcon || 'FlaskConical'] || FlaskConical;
    return (
      <div className="bg-primary p-2 rounded-xl text-white shadow-xs">
        <IconComponent size={22} />
      </div>
    );
  };

  const activeServices = (siteSettings.services || []).filter(s => s.isActive !== false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 md:pb-0 relative">
      
      {/* Navbar - Hide in Admin Mode */}
      {currentView !== 'admin' && (
        <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('home')}>
                {renderBrandLogo()}
                <div>
                  <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 block leading-none">
                    {siteSettings.siteName || t.appTitle}
                  </span>
                  {siteSettings.siteTagline && (
                    <span className="text-[10px] text-slate-500 hidden sm:block truncate max-w-[220px]">
                      {siteSettings.siteTagline}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-2.5 text-sm font-medium">
                {/* 1. Home */}
                <button 
                  onClick={navigateToHome} 
                  className={`px-3.5 py-1.5 rounded-full transition-all ${
                    currentView === 'home' 
                      ? 'bg-sky-50 text-primary font-bold border border-sky-200 shadow-2xs' 
                      : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  {t.navHome}
                </button>

                {/* 2. Tests (Only active/visible if Tests Section is active) */}
                {siteSettings.showPopularTestsSection !== false && (
                  <button 
                    onClick={() => navigateToTests()} 
                    className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                      currentView === 'tests' 
                        ? 'bg-sky-50 text-primary font-bold border border-sky-200 shadow-2xs' 
                        : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                    }`}
                  >
                    <FlaskConical size={14} />
                    <span>{t.navTests}</span>
                  </button>
                )}

                {/* 3. Health Packages (Only active/visible if Packages Section is active) */}
                {siteSettings.showPackagesSection !== false && (
                  <button 
                    onClick={navigateToPackages} 
                    className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                      currentView === 'packages' 
                        ? 'bg-sky-50 text-primary font-bold border border-sky-200 shadow-2xs' 
                        : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>{t.navPackages || (language === 'bn' ? 'হেলথ প্যাকেজ' : 'Health Packages')}</span>
                  </button>
                )}

                {/* 4. Doctor Telemedicine Page (Header Option 'Doctor') */}
                {isDoctorModuleActive && (
                  <button 
                    onClick={navigateToDoctors} 
                    className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentView === 'doctors' 
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-300 shadow-2xs' 
                        : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <Stethoscope size={15} className={currentView === 'doctors' ? 'text-emerald-600' : 'text-emerald-600'} />
                    <span>{language === 'bn' ? 'ডাক্তার' : 'Doctor'}</span>
                  </button>
                )}

                {/* 5. Nursing & Home Care (Only active/visible if Nursing Section is active) */}
                {siteSettings.showNursingSection !== false && (
                  <button 
                    onClick={() => scrollToSection('nursing-care')} 
                    className="px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <HeartPulse size={14} className="text-rose-500" />
                    <span>{language === 'bn' ? 'নার্সিং ও কেয়ার' : 'Nursing & Care'}</span>
                  </button>
                )}

                {/* Language Switcher */}
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-slate-200 hover:border-primary hover:text-primary transition-all text-slate-700"
                  title="Change Language"
                >
                  <Globe size={15} />
                  <span className="uppercase text-xs font-bold">{language}</span>
                </button>
                
                {/* 4. Combined Log In & Sign Up */}
                {currentPatient ? (
                  <button 
                    onClick={handlePatientNavClick}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-primary border border-sky-200 hover:bg-sky-100 transition-all font-semibold text-xs shadow-xs cursor-pointer"
                    title="View Patient Dashboard"
                  >
                    <img 
                      src={currentPatient.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100"} 
                      alt={currentPatient.name} 
                      className="w-5 h-5 rounded-full object-cover border border-primary/30"
                    />
                    <span className="truncate max-w-[110px]">{currentPatient.name.split(' ')[0]}</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleOpenAuth('login')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-700 hover:text-primary hover:bg-sky-50 hover:border-sky-200 border border-slate-200 transition-all text-xs font-bold cursor-pointer"
                  >
                    <User size={14} className="text-primary" />
                    <span>{t.navLoginSignUp || (language === 'bn' ? 'লগইন / সাইন আপ' : 'Log In / Sign Up')}</span>
                  </button>
                )}

                {/* 5. Book Test Now (At the very end) */}
                <button 
                  onClick={handleHeaderBookTestClick}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Stethoscope size={14} />
                  <span>{t.navBookTestNow || (language === 'bn' ? 'টেস্ট বুক করুন' : 'Book Test Now')}</span>
                  {cart.length > 0 && (
                    <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="md:hidden flex items-center">
                {/* Mobile: Only Login / Profile Option */}
                {currentPatient ? (
                  <button 
                    onClick={handlePatientNavClick} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 text-primary border border-sky-200 hover:bg-sky-100 transition-all font-semibold text-xs shadow-xs cursor-pointer"
                    title="Profile"
                  >
                    <img 
                      src={currentPatient.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100"} 
                      alt={currentPatient.name} 
                      className="w-6 h-6 rounded-full object-cover border border-primary/40"
                    />
                    <span className="truncate max-w-[100px] text-xs font-bold">{currentPatient.name.split(' ')[0]}</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleOpenAuth('login')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary hover:bg-sky-600 text-white transition-all text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <LogIn size={14} />
                    <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* CONDITIONAL RENDERING: ADMIN vs DASHBOARD vs HOME */}
      {currentView === 'admin' && isAdminAuthenticated ? (
        <AdminDashboard 
          lang={language} 
          onToggleLanguage={toggleLanguage}
          tests={tests}
          onUpdateTests={handleUpdateTests}
          packages={packages}
          onUpdatePackages={handleUpdatePackages}
          categories={categories}
          onUpdateCategories={handleUpdateCategories}
          labs={labs}
          onUpdateLabs={handleUpdateLabs}
          bookings={bookings}
          onUpdateBookings={handleUpdateBookings}
          patients={patients}
          onUpdatePatients={handleUpdatePatients}
          doctors={doctors}
          onUpdateDoctors={handleUpdateDoctors}
          onOpenPrescriptionViewer={(presc) => setSelectedPrescriptionForView(presc)}
          onJoinVideoAsDoctor={(apt) => setSelectedAppointmentForVideo(apt)}
          siteSettings={siteSettings}
          onUpdateSiteSettings={handleUpdateSiteSettings}
          onResetAllData={handleResetAllData}
          onLogout={handleAdminLogout} 
        />
      ) : currentView === 'dashboard' ? (
        <UserDashboard 
          lang={language} 
          onLogout={handleLogout} 
          currentPatient={currentPatient || {
            id: 'demo',
            name: 'Guest Patient',
            phone: '01700000000',
            address: 'Dhaka, Bangladesh',
            gender: 'male',
            age: 30,
            bloodGroup: 'B+'
          }}
          onUpdateProfile={handleUpdatePatientProfile}
          bookings={bookings}
          onBookNewTest={() => {
            setCurrentView('home');
            setTimeout(() => scrollToSection('tests'), 100);
          }}
          onOpenVideoRoom={(apt) => setSelectedAppointmentForVideo(apt)}
          onOpenPrescription={(presc) => setSelectedPrescriptionForView(presc)}
        />
      ) : currentView === 'packages' ? (
        <PackagesView 
          packages={packages}
          lang={language}
          onAddToCart={addToCart}
          onDirectBook={handleDirectBookPackage}
          cart={cart}
          onOpenDetailModal={(pkg) => setSelectedPackageForDetail(pkg)}
          labs={labs}
          selectedLabId={selectedLabId}
          onSelectLab={setSelectedLabId}
        />
      ) : currentView === 'doctors' ? (
        <DoctorsView 
          doctors={doctors}
          lang={language}
          onBookDoctor={(doc) => setSelectedDoctorForBooking(doc)}
          onQuickVideoCall={(doc) => setSelectedDoctorForBooking(doc)}
          onBackToHome={navigateToHome}
          emergencyHotline={siteSettings.doctorsEmergencyHotline || siteSettings.contactHotline}
        />
      ) : currentView === 'tests' ? (
        <TestsView 
          tests={tests}
          labs={labs}
          categories={categories}
          cart={cart}
          toggleCart={toggleCart}
          removeFromCart={removeFromCart}
          openCartModal={openCartModal}
          lang={language}
          selectedLabId={selectedLabId}
          setSelectedLabId={setSelectedLabId}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onBackToHome={navigateToHome}
          highlightedTestId={highlightedTestId}
          setHighlightedTestId={setHighlightedTestId}
          bookings={bookings}
        />
      ) : (
        <>
          {/* Hero Section */}
          <section id="home" className="relative overflow-hidden bg-white">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-white z-0"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 relative z-10">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                  <span className="inline-block py-1 px-3 rounded-full bg-sky-100 text-primary text-sm font-bold mb-4 border border-sky-200">
                    {siteSettings.heroBadge || t.heroBadge}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-bold text-secondary leading-tight mb-6">
                    {siteSettings.heroTitle || t.heroTitle} <br/>
                    <span className="text-primary">{siteSettings.heroTitleHighlight || t.heroTitleHighlight}</span>
                  </h1>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                    {siteSettings.heroDesc || t.heroDesc}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <Button onClick={() => navigateToTests()} className="px-8 py-4 text-lg shadow-lg shadow-sky-200">
                      {siteSettings.heroBtnBook || t.heroBtnBook}
                    </Button>

                    {siteSettings.contactWhatsApp && (
                      <a 
                        href={`https://wa.me/88${siteSettings.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3.5 text-base font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 flex items-center justify-center gap-2 transition-colors shadow-xs"
                      >
                        <MessageSquare size={18} className="text-emerald-600" /> WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Hero App Store Download Badges Row */}
                  {siteSettings.showAppButtonsInHero !== false && (
                    <div className="pt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <a
                        href={siteSettings.androidAppUrl || 'https://play.google.com/store/apps'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold border border-slate-800 hover:border-sky-400 transition-all shadow-xs cursor-pointer"
                        title="Download on Google Play Store"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path d="M3.609 1.814L13.793 12 3.61 22.186a2.372 2.372 0 0 1-.61-.926V2.74c.15-.353.364-.67.61-.926z" fill="#00D2FF"/>
                          <path d="M17.186 8.607L13.793 12l3.393 3.393 3.82-2.183a1.41 1.41 0 0 0 0-2.42l-3.82-2.183z" fill="#FFCE00"/>
                          <path d="M3.609 22.186L13.793 12 17.186 15.393 6.012 21.78a2.38 2.38 0 0 1-2.403.406z" fill="#FF3A44"/>
                          <path d="M3.609 1.814a2.38 2.38 0 0 1 2.403.406l11.174 6.387L13.793 12 3.61 1.814z" fill="#00E676"/>
                        </svg>
                        <span className="text-[11px] font-bold">Google Play</span>
                      </a>

                      <a
                        href={siteSettings.iosAppUrl || 'https://apps.apple.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold border border-slate-800 hover:border-sky-400 transition-all shadow-xs cursor-pointer"
                        title="Download on Apple App Store"
                      >
                        <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1 .08 2.05-.51 2.68-1.26z"/>
                        </svg>
                        <span className="text-[11px] font-bold">App Store</span>
                      </a>

                      <button
                        onClick={() => scrollToSection('app-download')}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{language === 'bn' ? '📱 অ্যাপ ফিচারসমূহ' : '📱 App Features'}</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Image Slider */}
                <div className="relative h-[400px] w-full max-w-md mx-auto md:ml-auto">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl transform translate-x-10 translate-y-10"></div>
                  
                  <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                    {activeHeroImages.map((img, index) => (
                        <img 
                          key={index}
                          src={img} 
                          alt="Lab Service" 
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            index === currentHeroImage ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                    ))}
                    
                    {/* Slider Indicators */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                        {activeHeroImages.map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setCurrentHeroImage(idx)}
                            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === currentHeroImage ? 'w-6 bg-primary' : 'w-2 bg-white/70 hover:bg-white'}`} 
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Dynamic Reorderable Homepage Content Sections */}
          {(() => {
            const sectionsOrder = (siteSettings.homeSectionsOrder && Array.isArray(siteSettings.homeSectionsOrder) && siteSettings.homeSectionsOrder.length > 0)
              ? siteSettings.homeSectionsOrder
              : DEFAULT_HOME_SECTIONS_ORDER;

            // Ensure all known section keys exist in the sequence
            const normalizedOrder = [...sectionsOrder];
            DEFAULT_HOME_SECTIONS_ORDER.forEach(secKey => {
              if (!normalizedOrder.includes(secKey)) normalizedOrder.push(secKey);
            });

            return normalizedOrder.map((sectionKey) => {
              switch (sectionKey) {
                case 'partner':
                  if (siteSettings.showPartnerSection === false) return null;
                  return (
                    <section key="partner" className="py-12 bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100/70 border-y border-slate-200">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                          <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/90 text-primary text-xs font-extrabold uppercase tracking-wider mb-2">
                              <ShieldCheck size={14} />
                              <span>{siteSettings.partnerBadge || (language === 'bn' ? 'বিশ্বস্ত ডায়াগনস্টিক নেটওয়ার্ক' : 'Trusted Diagnostic Network')}</span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                              <Building2 className="text-primary flex-shrink-0" size={24} />
                              <span>{siteSettings.partnerTitle || (language === 'bn' ? 'আমাদের অনুমোদিত ডায়াগনস্টিক পার্টনার্স' : 'Accredited Diagnostic Lab Partners')}</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                              {siteSettings.partnerDesc || (language === 'bn' 
                                ? 'ল্যাব সিলেক্ট করে সহজেই টেস্ট ও ক্যাটালগ ব্রাউজ করুন' 
                                : 'Select any partner lab to explore tests and diagnostic packages')}
                            </p>
                          </div>

                          {/* Navigation Scroll Buttons & View All */}
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button 
                              onClick={() => scrollLabs('left')}
                              aria-label="Scroll left"
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary hover:bg-sky-50 shadow-xs transition-all"
                            >
                              <ChevronLeft size={18} />
                            </button>
                            <button 
                              onClick={() => scrollLabs('right')}
                              aria-label="Scroll right"
                              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary hover:bg-sky-50 shadow-xs transition-all"
                            >
                              <ChevronRight size={18} />
                            </button>
                            <button 
                              onClick={() => navigateToTests()} 
                              className="inline-flex items-center gap-1 px-3.5 py-2 bg-white text-primary font-bold text-xs rounded-xl border border-sky-200 hover:bg-sky-50 shadow-xs transition-all ml-1 whitespace-nowrap"
                            >
                              <span>{siteSettings.partnerBtnText || (language === 'bn' ? 'সব দেখুন' : 'View All')}</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Single-Row Horizontally Scrollable Lab Cards with Auto-Scroll & Pause-on-Hover */}
                        <div 
                          ref={labScrollRef}
                          onMouseEnter={() => setIsLabPaused(true)}
                          onMouseLeave={() => setIsLabPaused(false)}
                          onTouchStart={() => setIsLabPaused(true)}
                          onTouchEnd={() => setIsLabPaused(false)}
                          className="flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 px-1 no-scrollbar select-none snap-x snap-mandatory"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {labs.filter(l => !l.isHidden).map((lab) => (
                            <div
                              key={lab.id}
                              onClick={() => navigateToTests('All', lab.id, '')}
                              className="w-full sm:w-56 flex-shrink-0 snap-center bg-white rounded-2xl border border-slate-200 hover:border-primary hover:shadow-lg transition-all duration-200 p-4 sm:p-4 flex flex-col items-center justify-between text-center cursor-pointer group relative overflow-hidden"
                            >
                              {/* Optional Discount Tag on Corner */}
                              {lab.discountBadge && (
                                <div className="absolute top-2 right-2">
                                  <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                    {lab.discountBadge}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col items-center w-full pt-1">
                                {/* Prominent Lab Logo */}
                                <div className="mb-3 p-1 rounded-xl bg-slate-50/80 group-hover:bg-sky-50/80 transition-colors">
                                  <LabLogo 
                                    name={lab.name} 
                                    logo={lab.logo} 
                                    size="lg" 
                                    accentColor={lab.accentColor} 
                                    className="group-hover:scale-105 transition-transform"
                                  />
                                </div>

                                {/* Lab Name */}
                                <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug min-h-[2.5rem] flex items-center justify-center">
                                  {lab.name}
                                </h4>
                              </div>

                              {/* Simple Clean CTA Link */}
                              <div className="w-full mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-bold text-primary group-hover:underline">
                                <span>{language === 'bn' ? 'টেস্ট দেখুন' : 'Explore Tests'}</span>
                                <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );

                case 'popularTests':
                  if (siteSettings.showPopularTestsSection === false) return null;
                  return (
                    <HomePopularTestsSection
                      key="popularTests"
                      tests={tests}
                      lang={language}
                      onToggleCart={toggleCart}
                      onDirectBook={(testId, labId) => {
                        if (labId) setSelectedLabId(labId);
                        addToCart(testId);
                        setIsBookingModalOpen(true);
                      }}
                      cart={cart}
                      labs={labs}
                      selectedLabId={selectedLabId}
                      onNavigateToTests={navigateToTests}
                      badge={siteSettings.popularTestsBadge}
                      title={siteSettings.popularTestsTitle}
                      description={siteSettings.popularTestsDesc}
                      btnText={siteSettings.popularTestsBtnText}
                    />
                  );

                case 'packages':
                  if (siteSettings.showPackagesSection === false) return null;
                  return (
                    <HomePackagesSection
                      key="packages"
                      packages={packages}
                      lang={language}
                      onAddToCart={addToCart}
                      onDirectBook={handleDirectBookPackage}
                      cart={cart}
                      onOpenDetailModal={(pkg) => setSelectedPackageForDetail(pkg)}
                      onNavigateToPackages={navigateToPackages}
                      labs={labs}
                      selectedLabId={selectedLabId}
                      badge={siteSettings.packagesBadge}
                      title={siteSettings.packagesTitle}
                      description={siteSettings.packagesDesc}
                      btnText={siteSettings.packagesBtnText}
                    />
                  );

                case 'nursing':
                  if (siteSettings.showNursingSection === false) return null;
                  return (
                    <NursingCareSection
                      key="nursing"
                      services={siteSettings.nursingServices && siteSettings.nursingServices.length > 0
                        ? siteSettings.nursingServices
                        : (language === 'en' ? DEFAULT_NURSING_SERVICES_EN : DEFAULT_NURSING_SERVICES_BN)}
                      lang={language}
                      badge={siteSettings.nursingBadge}
                      title={siteSettings.nursingTitle}
                      description={siteSettings.nursingDesc}
                      hotline={siteSettings.nursingHotline || siteSettings.contactHotline || siteSettings.contactPhone}
                      whatsapp={siteSettings.nursingWhatsApp || siteSettings.contactWhatsApp}
                    />
                  );

                case 'services':
                  if (siteSettings.showServicesSection === false || activeServices.length === 0) return null;
                  return (
                    <section key="services" id="services" className="hidden md:block py-20 bg-white border-b border-slate-100">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-14">
                          <span className="inline-block py-1 px-3 rounded-full bg-sky-100 text-primary text-xs font-bold mb-3 uppercase tracking-wider">
                            {siteSettings.servicesBadge || t.footerServices}
                          </span>
                          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
                            {siteSettings.servicesTitle || (language === 'bn' ? 'আমাদের স্বাস্থ্যসেবা সমূহ' : 'Our Specialized Healthcare Services')}
                          </h2>
                          <p className="text-slate-600 text-sm md:text-base">
                            {siteSettings.servicesDesc || (language === 'bn' 
                              ? 'ঘরে বসেই উন্নত মানের ডায়াগনস্টিক ও ল্যাব টেস্ট সেবা নিশ্চিত করতে আমরা প্রতিজ্ঞাবদ্ধ।' 
                              : 'Reliable, hospital-grade sample collection and diagnostics delivered right at your doorstep.')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {activeServices.map((service) => {
                            const iconMap: Record<string, any> = {
                              Home,
                              FlaskConical,
                              FileText,
                              Stethoscope,
                              HeartPulse,
                              ShieldCheck,
                              Activity,
                              Phone,
                              Clock,
                              Award,
                              Sparkles
                            };
                            const SrvIcon = iconMap[service.icon || 'FlaskConical'] || FlaskConical;

                            return (
                              <div 
                                key={service.id} 
                                className="group bg-slate-50 hover:bg-white p-7 rounded-2xl border border-slate-200/80 hover:border-primary/40 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-5">
                                    <div className="w-13 h-13 rounded-xl bg-white border border-slate-200 group-hover:bg-primary group-hover:border-primary flex items-center justify-center text-primary group-hover:text-white transition-all shadow-xs">
                                      <SrvIcon size={26} />
                                    </div>
                                    {service.badge && (
                                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-primary group-hover:bg-sky-50 group-hover:text-sky-700">
                                        {service.badge}
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                                    {service.title}
                                  </h3>
                                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                    {service.description}
                                  </p>
                                </div>

                                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-primary">
                                  <button 
                                    onClick={() => scrollToSection('tests')}
                                    className="flex items-center gap-1 hover:underline"
                                  >
                                    <span>{language === 'bn' ? 'টেস্ট বুক করুন' : 'Book Test'}</span>
                                    <ChevronRight size={14} />
                                  </button>
                                  {(siteSettings.contactHotline || siteSettings.contactPhone) && (
                                    <a 
                                      href={`tel:${siteSettings.contactHotline || siteSettings.contactPhone}`}
                                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                                    >
                                      <Phone size={12} />
                                      <span>{siteSettings.contactHotline || siteSettings.contactPhone}</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  );

                case 'doctors':
                  if (!isDoctorModuleActive) return null;
                  return (
                    <HomeDoctorConsultationSection
                      key="doctors"
                      lang={language}
                      doctors={doctors}
                      badge={siteSettings.doctorsBadge}
                      title={siteSettings.doctorsTitle}
                      description={siteSettings.doctorsDesc}
                      btnText={siteSettings.doctorsBtnText}
                      emergencyHotline={siteSettings.doctorsEmergencyHotline || siteSettings.contactHotline}
                      onBookDoctor={(doc) => setSelectedDoctorForBooking(doc)}
                      onQuickVideoCall={(doc) => setSelectedDoctorForBooking(doc)}
                      onViewAllDoctors={navigateToDoctors}
                    />
                  );

                case 'appDownload':
                  if (siteSettings.showAppDownloadSection === false) return null;
                  return (
                    <HomeAppDownloadSection
                      key="appDownload"
                      lang={language}
                      badge={siteSettings.appSectionBadge}
                      title={siteSettings.appSectionTitle}
                      description={siteSettings.appSectionDesc}
                      androidAppUrl={siteSettings.androidAppUrl}
                      iosAppUrl={siteSettings.iosAppUrl}
                      apkDownloadUrl={siteSettings.apkDownloadUrl}
                      downloadCount={siteSettings.appDownloadCount}
                      rating={siteSettings.appRating}
                      appMockupImage={siteSettings.appMockupImage}
                      onBookClick={() => navigateToTests()}
                    />
                  );

                case 'howItWorks':
                  if (siteSettings.showHowItWorksSection === false) return null;
                  return (
                    <section key="howItWorks" id="how-it-works" className="hidden md:block py-20 bg-slate-50">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                          <h2 className="text-3xl font-bold text-secondary mb-4">
                            {siteSettings.howItWorksTitle || t.sectionHowTitle}
                          </h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                          {(siteSettings.howItWorksSteps && siteSettings.howItWorksSteps.length > 0 
                            ? siteSettings.howItWorksSteps 
                            : [
                                { title: t.step1Title, desc: t.step1Desc },
                                { title: t.step2Title, desc: t.step2Desc },
                                { title: t.step3Title, desc: t.step3Desc }
                              ]
                          ).map((feature, idx) => (
                            <div key={idx} className="p-8 bg-white rounded-2xl text-center border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300">
                              <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs text-primary">
                                {idx === 0 && <Search className="w-8 h-8" />}
                                {idx === 1 && <Home className="w-8 h-8" />}
                                {idx === 2 && <Activity className="w-8 h-8" />}
                                {idx > 2 && <ShieldCheck className="w-8 h-8" />}
                              </div>
                              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                              <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );

                default:
                  return null;
              }
            });
          })()}

          {/* Dynamic About Us Section */}
          <section id="about" className="py-20 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <span className="inline-block py-1 px-3 rounded-full bg-sky-100 text-primary text-xs font-bold uppercase tracking-wider">
                    {t.footerLinks.about}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                    {siteSettings.aboutTitle || (language === 'bn' ? 'আমাদের সম্পর্কে' : 'About LabHome BD')}
                  </h2>
                  <p className="text-base text-slate-600 leading-relaxed">
                    {siteSettings.aboutDescription}
                  </p>
                  {siteSettings.aboutStory && (
                    <div className="p-5 bg-slate-50 rounded-2xl border-l-4 border-primary text-slate-700 text-sm leading-relaxed italic">
                      "{siteSettings.aboutStory}"
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 pt-2">
                    <Button onClick={() => scrollToSection('tests')}>
                      {t.heroBtnBook}
                    </Button>
                    {(siteSettings.contactPhone || siteSettings.contactHotline) && (
                      <a
                        href={`tel:${siteSettings.contactPhone || siteSettings.contactHotline}`}
                        className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <Phone size={16} className="text-primary" />
                        <span>{language === 'bn' ? 'সরাসরি কল করুন' : 'Call Support'}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* About Stats Cards */}
                <div className="lg:col-span-6">
                  <div className="grid grid-cols-2 gap-4">
                    {(siteSettings.aboutStats || []).map((stat, idx) => (
                      <div 
                        key={idx} 
                        className="p-6 bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white text-primary flex items-center justify-center mb-3 shadow-xs border border-slate-100">
                          {idx === 0 && <Award size={22} />}
                          {idx === 1 && <Users size={22} />}
                          {idx === 2 && <FlaskConical size={22} />}
                          {idx === 3 && <Clock size={22} />}
                          {idx > 3 && <Sparkles size={22} />}
                        </div>
                        <span className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                          {stat.value}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Floating Checkout Bar for Mobile when cart has items */}
      {cart.length > 0 && !isBookingModalOpen && currentView !== 'admin' && (
        <div className="md:hidden fixed bottom-16 left-3 right-3 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div 
            onClick={openCartModal}
            className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-3 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-md">
                {cart.length}
              </div>
              <div>
                <span className="text-[10px] text-slate-300 block leading-tight">{language === 'bn' ? 'নির্বাচিত টেস্টসমূহ' : 'Selected Tests'}</span>
                <span className="font-extrabold text-sm text-emerald-400">৳{totalBill}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-sky-500 rounded-xl font-bold text-xs shadow-md text-white">
              <span>{language === 'bn' ? 'চেকআউট করুন' : 'Checkout'}</span>
              <ChevronRight size={15} />
            </div>
          </div>
        </div>
      )}

      {/* App Bar for Mobile (Bottom Navigation) - Active on Home, Packages, Tests, and Doctors Views */}
      {(currentView === 'home' || currentView === 'tests' || currentView === 'packages' || currentView === 'doctors') && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex justify-around py-2 pb-safe shadow-lg">
          <button 
            onClick={navigateToHome} 
            className={`flex flex-col items-center px-3 py-1 transition-colors ${currentView === 'home' ? 'text-primary font-bold' : 'text-slate-500'}`}
          >
            <Home size={18} />
            <span className="text-[10px] mt-0.5">{t.navHome}</span>
          </button>
          {siteSettings.showPopularTestsSection !== false && (
            <button 
              onClick={() => navigateToTests()} 
              className={`flex flex-col items-center px-3 py-1 transition-colors ${currentView === 'tests' ? 'text-primary font-bold' : 'text-slate-500'}`}
            >
              <FlaskConical size={18} />
              <span className="text-[10px] mt-0.5">{t.navTests}</span>
            </button>
          )}
          {isDoctorModuleActive && (
            <button 
              onClick={navigateToDoctors} 
              className={`flex flex-col items-center px-3 py-1 transition-colors ${currentView === 'doctors' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}
            >
              <Stethoscope size={18} className={currentView === 'doctors' ? 'text-emerald-600' : ''} />
              <span className="text-[10px] mt-0.5">{language === 'bn' ? 'ডাক্তার' : 'Doctor'}</span>
            </button>
          )}
          {siteSettings.showPackagesSection !== false && (
            <button 
              onClick={navigateToPackages} 
              className={`flex flex-col items-center px-3 py-1 transition-colors ${currentView === 'packages' ? 'text-primary font-bold' : 'text-slate-500'}`}
            >
              <Sparkles size={18} className={currentView === 'packages' ? 'text-amber-500' : ''} />
              <span className="text-[10px] mt-0.5">{t.navPackages || (language === 'bn' ? 'প্যাকেজ' : 'Packages')}</span>
            </button>
          )}
          <button 
            onClick={openCartModal} 
            className={`flex flex-col items-center px-3 py-1 ${cart.length > 0 ? 'text-primary font-bold' : 'text-slate-500'} relative`}
          >
            <div className="relative">
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5">{t.navBookTestNow || (language === 'bn' ? 'কার্ট/বুক' : 'Cart/Book')}</span>
          </button>
        </div>
      )}

      {/* Components */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        lang={language}
        preSelectedLabId={selectedLabId}
        onSelectLab={setSelectedLabId}
        onClearCart={clearCart}
        allTests={allAvailableItems}
        onAddTest={addToCart}
        labsList={labs}
        onBookingConfirmed={handleNewBooking}
        currentPatient={currentPatient}
        onOpenAuthModal={() => handleOpenAuth('login')}
        onNavigateToTests={() => navigateToTests()}
      />

      <PackageDetailModal
        packageData={selectedPackageForDetail}
        isOpen={Boolean(selectedPackageForDetail)}
        onClose={() => setSelectedPackageForDetail(null)}
        lang={language}
        onAddToCart={addToCart}
        onDirectBook={handleDirectBookPackage}
        isInCart={selectedPackageForDetail ? cart.includes(selectedPackageForDetail.id) : false}
        labs={labs}
      />

      <PatientAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={language}
        initialTab={authModalTab}
        onSuccess={handleAuthSuccess}
      />

      <AdminLoginModal
        isOpen={isAdminLoginModalOpen || (currentView === 'admin' && !isAdminAuthenticated)}
        onClose={() => {
          setIsAdminLoginModalOpen(false);
          if (currentView === 'admin') {
            if (window.location.pathname === '/admin' || window.location.hash.includes('admin')) {
              window.history.pushState(null, '', '/');
            }
            setCurrentView('home');
          }
        }}
        onSuccess={handleAdminLoginSuccess}
        lang={language}
      />

      {/* Doctor Booking Modal */}
      {selectedDoctorForBooking && (
        <DoctorBookingModal 
          doctor={selectedDoctorForBooking}
          isOpen={Boolean(selectedDoctorForBooking)}
          onClose={() => setSelectedDoctorForBooking(null)}
          lang={language}
          currentPatient={currentPatient}
          onBookingSuccess={(appointment) => {
            // Keep doctor appointment state updated
          }}
          onStartVideoCall={(appointment) => {
            setSelectedAppointmentForVideo(appointment);
          }}
        />
      )}

      {/* Doctor Live Video Consultation Modal */}
      {selectedAppointmentForVideo && (
        <DoctorVideoConsultationModal 
          appointment={selectedAppointmentForVideo}
          isOpen={Boolean(selectedAppointmentForVideo)}
          onClose={() => setSelectedAppointmentForVideo(null)}
          lang={language}
          onOpenPrescription={(presc) => {
            setSelectedPrescriptionForView(presc);
          }}
        />
      )}

      {/* Digital E-Prescription Modal */}
      {selectedPrescriptionForView && (
        <EPrescriptionModal 
          prescription={selectedPrescriptionForView}
          isOpen={Boolean(selectedPrescriptionForView)}
          onClose={() => setSelectedPrescriptionForView(null)}
          lang={language}
          onBookAdvisedTest={(testName, testId) => {
            // If test exists with matching ID or name, add to cart
            const matchingTest = tests.find(t => (testId && t.id === testId) || t.name.toLowerCase().includes(testName.toLowerCase()));
            if (matchingTest) {
              addToCart(matchingTest.id);
            } else if (testId) {
              addToCart(testId);
            } else {
              setSelectedPrescriptionForView(null);
              navigateToTests();
            }
          }}
          onBookAllAdvisedTests={(testNames) => {
            testNames.forEach(tName => {
              const matchingTest = tests.find(t => t.name.toLowerCase().includes(tName.toLowerCase()));
              if (matchingTest && !cart.includes(matchingTest.id)) {
                addToCart(matchingTest.id);
              }
            });
            setSelectedPrescriptionForView(null);
            setIsBookingModalOpen(true);
          }}
        />
      )}
      
      {/* Dynamic Footer with CMS Data */}
      {currentView !== 'dashboard' && currentView !== 'admin' && (
        <footer id="contact" className="bg-slate-900 text-slate-400 py-14 pb-24 md:pb-14 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Column 1: Brand & Tagline */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                {renderBrandLogo()}
                <span className="text-xl font-bold text-white tracking-tight">
                  {siteSettings.siteName || t.appTitle}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {siteSettings.siteTagline || t.footerDesc}
              </p>
              {siteSettings.workingHours && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                  <Clock size={14} className="text-primary flex-shrink-0" />
                  <span>{siteSettings.workingHours}</span>
                </div>
              )}

              {/* Footer Store Download Badges */}
              {siteSettings.showAppButtonsInFooter !== false && (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'bn' ? 'আমাদের মোবাইল অ্যাপ:' : 'Get Mobile App:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={siteSettings.androidAppUrl || 'https://play.google.com/store/apps'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-slate-950 text-white text-[11px] font-bold border border-slate-700 hover:border-sky-400 transition-colors shadow-xs"
                      title="Google Play Store"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                        <path d="M3.609 1.814L13.793 12 3.61 22.186a2.372 2.372 0 0 1-.61-.926V2.74c.15-.353.364-.67.61-.926z" fill="#00D2FF"/>
                        <path d="M17.186 8.607L13.793 12l3.393 3.393 3.82-2.183a1.41 1.41 0 0 0 0-2.42l-3.82-2.183z" fill="#FFCE00"/>
                        <path d="M3.609 22.186L13.793 12 17.186 15.393 6.012 21.78a2.38 2.38 0 0 1-2.403.406z" fill="#FF3A44"/>
                        <path d="M3.609 1.814a2.38 2.38 0 0 1 2.403.406l11.174 6.387L13.793 12 3.61 1.814z" fill="#00E676"/>
                      </svg>
                      <span>Google Play</span>
                    </a>

                    <a
                      href={siteSettings.iosAppUrl || 'https://apps.apple.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-slate-950 text-white text-[11px] font-bold border border-slate-700 hover:border-sky-400 transition-colors shadow-xs"
                      title="Apple App Store"
                    >
                      <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76 1 .08 2.05-.51 2.68-1.26z"/>
                      </svg>
                      <span>App Store</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Social Media Links Icons */}
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'সামাজিক যোগাযোগ (Social Media):' : 'Connect With Us:'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Facebook */}
                  <a
                    href={siteSettings.facebookUrl || 'https://facebook.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#1877F2] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-700/80 hover:border-[#1877F2] shadow-xs cursor-pointer group"
                    title="Facebook Page"
                  >
                    <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href={siteSettings.linkedinUrl || 'https://linkedin.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#0A66C2] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-700/80 hover:border-[#0A66C2] shadow-xs cursor-pointer group"
                    title="LinkedIn Company Page"
                  >
                    <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href={siteSettings.youtubeUrl || 'https://youtube.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#FF0000] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-700/80 hover:border-[#FF0000] shadow-xs cursor-pointer group"
                    title="YouTube Channel"
                  >
                    <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  {siteSettings.instagramUrl && (
                    <a
                      href={siteSettings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-700/80 shadow-xs cursor-pointer group"
                      title="Instagram Profile"
                    >
                      <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t.footerServices}</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => scrollToSection('tests')} className="hover:text-white transition-colors cursor-pointer">
                    {t.footerLinks.labTest}
                  </button>
                </li>
                {isDoctorModuleActive && (
                  <li>
                    <button onClick={navigateToDoctors} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                      <span>{language === 'bn' ? 'ডাক্তার ভিডিও কন্সালটেন্সি' : 'Doctor Video Consultation'}</span>
                    </button>
                  </li>
                )}
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors cursor-pointer">
                    {language === 'bn' ? 'হোম স্যাম্পল কালেকশন' : 'Home Sample Collection'}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors cursor-pointer">
                    {language === 'bn' ? 'অনলাইন রিপোর্ট ডেলিভারি' : 'Online Report Delivery'}
                  </button>
                </li>
                {siteSettings.showNursingSection !== false && (
                  <li>
                    <button onClick={() => scrollToSection('nursing-care')} className="hover:text-white transition-colors cursor-pointer">
                      {language === 'bn' ? 'হোম নার্সিং ও কেয়ার' : 'Home Nursing Care'}
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t.footerCompany}</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">
                    {t.footerLinks.about}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">
                    {t.navHowItWorks}
                  </button>
                </li>
                <li>
                  <span className="text-slate-500 cursor-default">{t.footerLinks.privacy}</span>
                </li>
                <li>
                  <span className="text-slate-500 cursor-default">{t.footerLinks.terms}</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Helplines */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t.footerContact}</h4>
              <ul className="space-y-3 text-sm">
                {siteSettings.contactAddress && (
                  <li className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>{siteSettings.contactAddress}</span>
                  </li>
                )}
                {siteSettings.contactPhone && (
                  <li className="flex items-center gap-2.5">
                    <Phone size={16} className="text-emerald-400 flex-shrink-0" />
                    <a href={`tel:${siteSettings.contactPhone}`} className="hover:text-white transition-colors">
                      {siteSettings.contactPhone}
                    </a>
                  </li>
                )}
                {siteSettings.contactHotline && (
                  <li className="flex items-center gap-2.5">
                    <Phone size={16} className="text-sky-400 flex-shrink-0" />
                    <a href={`tel:${siteSettings.contactHotline}`} className="hover:text-white transition-colors">
                      Hotline: {siteSettings.contactHotline}
                    </a>
                  </li>
                )}
                {siteSettings.contactWhatsApp && (
                  <li className="flex items-center gap-2.5">
                    <MessageSquare size={16} className="text-emerald-500 flex-shrink-0" />
                    <a 
                      href={`https://wa.me/88${siteSettings.contactWhatsApp.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="hover:text-emerald-400 transition-colors font-medium"
                    >
                      WhatsApp: {siteSettings.contactWhatsApp}
                    </a>
                  </li>
                )}
                {siteSettings.contactEmail && (
                  <li className="flex items-center gap-2.5">
                    <Mail size={16} className="text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${siteSettings.contactEmail}`} className="hover:text-white transition-colors">
                      {siteSettings.contactEmail}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-500">
            <p>© {new Date().getFullYear()} {siteSettings.siteName || 'LabHome BD'}. All rights reserved.</p>
            <p className="text-[11px] text-slate-500">
              {language === 'bn' ? 'স্মার্ট ডায়াগনস্টিক ও হোম হেলথকেয়ার সল্যুশন' : 'Smart Diagnostic & Home Healthcare Platform'}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

