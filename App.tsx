
import React, { useState, useEffect, useRef } from 'react';
import { TestPackage, HealthPackage, LabPartner, Language, BookingHistoryItem, SiteSettings, PatientUser, CategoryItem } from './types';
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
  subscribeToUsers,
  subscribeToPaymentConfig,
  subscribeToAdminCredentials,
  subscribeToStaffUsers,
  subscribeToPatientsList,
  subscribeToDateSlotConfig
} from './services/firebase';
import { saveStoredPaymentConfig } from './services/dataStorage';
import { TestCard } from './components/TestCard';
import { BookingModal, calculateAccessoriesFee } from './components/BookingModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PatientAuthModal } from './components/PatientAuthModal';
import { TestsView } from './components/TestsView';
import { PackagesView } from './components/PackagesView';
import { PackageDetailModal } from './components/PackageDetailModal';
import { HomePackagesSection } from './components/HomePackagesSection';
import { HomePopularTestsSection } from './components/HomePopularTestsSection';
import { NursingCareSection } from './components/NursingCareSection';
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

import { DEFAULT_HERO_IMAGES, DEFAULT_NURSING_SERVICES_BN, DEFAULT_NURSING_SERVICES_EN } from './constants';

const CATEGORIES = ['All', 'General', 'Diabetes', 'Heart', 'Thyroid', 'Vitamin'];

// Helper to determine if current URL is accessing the Admin Portal route
const isPathAdmin = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/admin' || 
    path.startsWith('/admin/') || 
    hash === '#admin' || 
    hash.startsWith('#/admin') || 
    search.includes('view=admin') ||
    search.includes('admin=true')
  );
};

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('labhome_lang');
    return (saved === 'bn' || saved === 'en') ? saved : 'en';
  });
  const [currentView, setCurrentView] = useState<'home' | 'tests' | 'packages' | 'dashboard' | 'admin'>(() => {
    return isPathAdmin() ? 'admin' : 'home';
  });
  const [currentPatient, setCurrentPatient] = useState<PatientUser | null>(() => getStoredCurrentPatient());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [cart, setCart] = useState<string[]>([]); // Array of Test/Package IDs
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  
  // Real-time editable state synchronized with LocalStorage
  const [tests, setTests] = useState<TestPackage[]>(() => getStoredTests(language));
  const [labs, setLabs] = useState<LabPartner[]>(() => getStoredLabs(language));
  const [packages, setPackages] = useState<HealthPackage[]>(() => getStoredPackages(language));
  const [categories, setCategories] = useState<CategoryItem[]>(() => getStoredCategories());
  const [bookings, setBookings] = useState<BookingHistoryItem[]>(() => getStoredBookings());
  const [patients, setPatients] = useState<PatientUser[]>(() => getStoredPatients());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getStoredSiteSettings(language));
  const [selectedPackageForDetail, setSelectedPackageForDetail] = useState<HealthPackage | null>(null);

  // Secure Admin Authentication State (session based, prevents public domain auto-login)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => getIsAdminSessionActive());
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(() => isPathAdmin() && !getIsAdminSessionActive());

  // Listen to URL changes (e.g. user types /admin or uses browser back/forward buttons)
  useEffect(() => {
    const handleUrlRoute = () => {
      if (isPathAdmin()) {
        const hasSession = getIsAdminSessionActive();
        setIsAdminAuthenticated(hasSession);
        if (!hasSession) {
          setIsAdminLoginModalOpen(true);
        }
        setCurrentView('admin');
      } else {
        setIsAdminLoginModalOpen(false);
        setCurrentView(prev => (prev === 'admin' ? 'home' : prev));
      }
    };

    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  const [isLabPaused, setIsLabPaused] = useState(false);
  const labScrollRef = useRef<HTMLDivElement>(null);

  const scrollLabs = (direction: 'left' | 'right') => {
    if (labScrollRef.current) {
      const scrollAmount = 240;
      labScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll partner labs horizontally
  useEffect(() => {
    if (currentView !== 'home' || isLabPaused) return;

    const interval = setInterval(() => {
      if (labScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = labScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          labScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          labScrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
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

  const handleUpdateSiteSettings = (updated: SiteSettings) => {
    setSiteSettings(updated);
    saveStoredSiteSettings(language, updated);
    // Real-time synchronization to Firestore ensures changes are visible to ALL visitors across the live domain
    saveSiteSettingsToFirestore(language, updated);
  };

  const handleResetAllData = () => {
    resetAllDataToDefaults();
    const dTests = getStoredTests(language);
    const dLabs = getStoredLabs(language);
    const dPkgs = getStoredPackages(language);
    const dCats = getStoredCategories();
    const dSettings = getStoredSiteSettings(language);
    
    setTests(dTests);
    setLabs(dLabs);
    setPackages(dPkgs);
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
    setCurrentView('home');
  };

  const handleOpenAdminPortal = () => {
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
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
    if (window.location.pathname !== '/admin') {
      window.history.pushState(null, '', '/admin');
    }
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setAdminSessionActive(false);
    setIsAdminAuthenticated(false);
    if (window.location.pathname === '/admin' || window.location.hash.includes('admin')) {
      window.history.pushState(null, '', '/');
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
    } else {
      handleOpenAuth('login');
    }
  };

  const navigateToTests = (categoryId?: string, labId?: string, search?: string) => {
    setActiveCategory(categoryId || 'All');
    if (labId !== undefined) {
      setSelectedLabId(labId);
    } else {
      setSelectedLabId('');
    }
    setSearchTerm(search !== undefined ? search : '');
    setCurrentView('tests');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPackages = () => {
    setCurrentView('packages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentView('home');
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

                {/* 2. Tests */}
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

                {/* 3. Health Packages */}
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

                {/* 4. Nursing & Home Care */}
                <button 
                  onClick={() => scrollToSection('nursing-care')} 
                  className="px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <HeartPulse size={14} className="text-rose-500" />
                  <span>{language === 'bn' ? 'নার্সিং ও কেয়ার' : 'Nursing & Care'}</span>
                </button>

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

              <div className="md:hidden flex items-center gap-2">
                {/* Mobile Book Test Button */}
                <button 
                  onClick={handleHeaderBookTestClick}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Stethoscope size={13} />
                  <span>{language === 'bn' ? 'বুকিং' : 'Book'}</span>
                  {cart.length > 0 && (
                    <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1 rounded-full">
                      {cart.length}
                    </span>
                  )}
                </button>

                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <Globe size={16} />
                  <span className="uppercase text-xs font-bold">{language}</span>
                </button>
                <button onClick={handlePatientNavClick} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 cursor-pointer">
                  {currentPatient ? (
                    <img 
                      src={currentPatient.avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100"} 
                      alt={currentPatient.name} 
                      className="w-7 h-7 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <User size={20} className="text-slate-600" />
                  )}
                </button>
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

          {/* Partner Diagnostic Centers Single-Row Scrollable Section */}
          <section className="py-12 bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100/70 border-y border-slate-200">
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
                className="flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 px-1 no-scrollbar select-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {labs.filter(l => !l.isHidden).map((lab) => (
                  <div
                    key={lab.id}
                    onClick={() => navigateToTests('All', lab.id, '')}
                    className="w-48 sm:w-56 flex-shrink-0 bg-white rounded-2xl border border-slate-200 hover:border-primary hover:shadow-lg transition-all duration-200 p-4 flex flex-col items-center justify-between text-center cursor-pointer group relative overflow-hidden"
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

          {/* Most Ordered / Popular Tests Auto-scrolling Single Row Section (Max 12 Tests) */}
          <HomePopularTestsSection
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

          {/* Essential Home Diagnostic Packages Auto-scrolling Section */}
          <HomePackagesSection
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

          {/* Home Nursing & Patient Care Service Section */}
          <NursingCareSection
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

          {/* Dynamic Services Section */}
          {activeServices.length > 0 && (
            <section id="services" className="py-20 bg-white border-b border-slate-100">
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
          )}

          {/* Features / How it Works */}
          <section id="how-it-works" className="py-20 bg-slate-50">
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

      {/* App Bar for Mobile (Bottom Navigation) - Active on Home, Packages, and Tests Views */}
      {(currentView === 'home' || currentView === 'tests' || currentView === 'packages') && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex justify-around py-2 pb-safe shadow-lg">
          <button 
            onClick={navigateToHome} 
            className={`flex flex-col items-center px-3 py-1 transition-colors ${currentView === 'home' ? 'text-primary font-bold' : 'text-slate-500'}`}
          >
            <Home size={18} />
            <span className="text-[10px] mt-0.5">{t.navHome}</span>
          </button>
          <button 
            onClick={() => navigateToTests()} 
            className={`flex flex-col items-center px-3 py-1 transition-colors ${currentView === 'tests' ? 'text-primary font-bold' : 'text-slate-500'}`}
          >
            <FlaskConical size={18} />
            <span className="text-[10px] mt-0.5">{t.navTests}</span>
          </button>
          <button 
            onClick={navigateToPackages} 
            className={`flex flex-col items-center px-3 py-1 transition-colors ${currentView === 'packages' ? 'text-primary font-bold' : 'text-slate-500'}`}
          >
            <Sparkles size={18} className={currentView === 'packages' ? 'text-amber-500' : ''} />
            <span className="text-[10px] mt-0.5">{t.navPackages || (language === 'bn' ? 'প্যাকেজ' : 'Packages')}</span>
          </button>
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
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{t.footerServices}</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => scrollToSection('tests')} className="hover:text-white transition-colors">
                    {t.footerLinks.labTest}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">
                    {language === 'bn' ? 'হোম স্যাম্পল কালেকশন' : 'Home Sample Collection'}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">
                    {language === 'bn' ? 'অনলাইন রিপোর্ট ডেলিভারি' : 'Online Report Delivery'}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('packages')} className="hover:text-white transition-colors">
                    {t.footerLinks.healthPkg}
                  </button>
                </li>
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

