import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  getDocsFromServer,
  setLogLevel
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  BookingHistoryItem, 
  PatientUser, 
  SiteSettings, 
  TestPackage, 
  HealthPackage, 
  LabPartner, 
  CategoryItem, 
  Language,
  PaymentGatewaysConfig,
  AdminCredentials,
  StaffUser,
  DateSlotConfig,
  Doctor,
  DoctorAtHomeBooking,
  HomeVisitDoctor,
  Phlebotomist
} from '../types';
import { cleanBrandText } from './dataStorage';
import { sendPatientRegistrationNotificationEmail } from './emailNotificationService';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID and forced long polling for robust connectivity in preview/iframe
export const db = (() => {
  const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: true,
      ignoreUndefinedProperties: true
    }, dbId);
  } catch (_err) {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
})();

// Suppress internal Firestore retry/backoff stream logs from flooding console
try {
  setLogLevel('silent');
} catch {}

// Initialize Firebase Auth
export const auth = getAuth(app);
export { onAuthStateChanged };

/**
 * Circuit Breaker for Firestore Quota Limit Exceeded (Resource Exhausted)
 * Automatically halts write attempts if the daily quota on Google Cloud has been exhausted,
 * preventing Firestore SDK from continuously failing and spamming exponential backoff logs.
 */
const QUOTA_KEY = 'eclinic_firestore_quota_exhausted';
let isFirestoreQuotaExhausted = false;
let quotaExhaustedUntil: number = 0;

try {
  const saved = localStorage.getItem(QUOTA_KEY) || localStorage.getItem('labhome_firestore_quota_exhausted');
  if (saved && Number(saved) > Date.now()) {
    isFirestoreQuotaExhausted = true;
    quotaExhaustedUntil = Number(saved);
  }
} catch {}

export const isQuotaExhausted = (): boolean => {
  if (isFirestoreQuotaExhausted) {
    if (Date.now() < quotaExhaustedUntil) {
      return true;
    }
    isFirestoreQuotaExhausted = false;
  }
  return false;
};

export const markQuotaExhausted = () => {
  isFirestoreQuotaExhausted = true;
  // Hold back further write attempts for 12 hours or until daily quota reset
  quotaExhaustedUntil = Date.now() + 12 * 60 * 60 * 1000;
  try {
    localStorage.setItem(QUOTA_KEY, String(quotaExhaustedUntil));
  } catch {}
};

// Suppress internal Firestore quota/retry noise if free tier write limit is reached
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const fullMsg = args.map(a => (typeof a === 'object' ? (a?.message || JSON.stringify(a)) : String(a))).join(' ');
    if (
      fullMsg.includes('resource-exhausted') ||
      fullMsg.includes('Quota limit exceeded') ||
      fullMsg.includes('Free daily write units') ||
      fullMsg.includes('Using maximum backoff delay') ||
      (fullMsg.includes('@firebase/firestore') && fullMsg.includes('quota'))
    ) {
      markQuotaExhausted();
      return; // Handled smoothly - app seamlessly uses local storage fallback
    }
    originalConsoleError.apply(console, args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const fullMsg = args.map(a => (typeof a === 'object' ? (a?.message || JSON.stringify(a)) : String(a))).join(' ');
    if (
      fullMsg.includes('Using maximum backoff delay') ||
      fullMsg.includes('resource-exhausted') ||
      fullMsg.includes('Quota limit exceeded')
    ) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

/**
 * Executes a Firestore write operation safely with quota protection
 */
export const safeFirestoreWrite = async (operation: () => Promise<any>): Promise<boolean> => {
  if (isQuotaExhausted()) {
    return false;
  }
  try {
    await operation();
    return true;
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    const errCode = error?.code || '';
    if (
      errCode === 'resource-exhausted' ||
      errMsg.includes('Quota limit exceeded') ||
      errMsg.includes('resource-exhausted') ||
      errMsg.includes('Free daily write units')
    ) {
      markQuotaExhausted();
      return false;
    }
    console.error("Firestore write error:", error);
    return false;
  }
};

/**
 * Deep sanitization for Firestore documents.
 * Automatically removes `undefined` properties from objects/arrays to prevent
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export const cleanFirestoreData = <T>(data: T): T => {
  if (data === null || data === undefined) return null as unknown as T;
  if (Array.isArray(data)) {
    return data.map(item => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof data === 'object' && data !== null) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return data;
};

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign In / Sign Up with Google Popup
 */
export const signInWithGoogle = async (): Promise<{ success: boolean; user?: PatientUser; error?: string }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    // Check or create patient user document in Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let patient: PatientUser;

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      patient = {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || 'Google User',
        phone: data.phone || fbUser.phoneNumber || '01700000000',
        email: fbUser.email || undefined,
        address: data.address || 'Dhaka, Bangladesh',
        avatar: fbUser.photoURL || data.avatar,
        gender: data.gender || 'male',
        age: data.age || '28',
        bloodGroup: data.bloodGroup || 'B+',
        emergencyContact: data.emergencyContact,
        createdAt: data.createdAt || new Date().toISOString()
      };
    } else {
      patient = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Google User',
        phone: fbUser.phoneNumber || '01700000000',
        email: fbUser.email || undefined,
        address: 'Dhaka, Bangladesh',
        avatar: fbUser.photoURL || undefined,
        gender: 'male',
        age: '28',
        bloodGroup: 'B+',
        createdAt: new Date().toISOString()
      };
      
      // Save newly created Google user profile in Firestore
      await setDoc(userDocRef, {
        name: patient.name,
        phone: patient.phone,
        email: patient.email || '',
        address: patient.address,
        avatar: patient.avatar || '',
        gender: patient.gender,
        age: patient.age,
        bloodGroup: patient.bloodGroup,
        createdAt: patient.createdAt,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Send automatic notification email to eclinicbd24@gmail.com
      sendPatientRegistrationNotificationEmail(patient);
    }

    return { success: true, user: patient };
  } catch (error: any) {
    console.error("Google sign in error:", error);
    return { 
      success: false, 
      error: error?.message || 'Google sign-in failed. Please try again.' 
    };
  }
};

/**
 * Sign In with Email and Password
 */
export const loginWithEmail = async (
  email: string, 
  pass: string
): Promise<{ success: boolean; user?: PatientUser; error?: string }> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const fbUser = cred.user;

    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let patient: PatientUser;
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      patient = {
        id: fbUser.uid,
        name: data.name || fbUser.displayName || email.split('@')[0],
        phone: data.phone || '01700000000',
        email: fbUser.email || email,
        address: data.address || 'Dhaka, Bangladesh',
        avatar: data.avatar || fbUser.photoURL,
        gender: data.gender || 'male',
        age: data.age,
        bloodGroup: data.bloodGroup || 'B+',
        emergencyContact: data.emergencyContact,
        createdAt: data.createdAt || new Date().toISOString()
      };
    } else {
      patient = {
        id: fbUser.uid,
        name: fbUser.displayName || email.split('@')[0],
        phone: '01700000000',
        email: fbUser.email || email,
        address: 'Dhaka, Bangladesh',
        avatar: fbUser.photoURL || undefined,
        gender: 'male',
        age: '28',
        bloodGroup: 'B+',
        createdAt: new Date().toISOString()
      };
    }

    return { success: true, user: patient };
  } catch (error: any) {
    console.error("Email login error:", error);
    let msg = 'Login failed. Please verify your email and password.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      msg = 'Incorrect email or password. Please check and try again.';
    } else if (error.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    }
    return { success: false, error: msg };
  }
};

/**
 * Register new user with Email and Password
 */
export const registerWithEmail = async (
  email: string,
  pass: string,
  profileData: Partial<PatientUser>
): Promise<{ success: boolean; user?: PatientUser; error?: string }> => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const fbUser = cred.user;

    if (profileData.name) {
      await updateProfile(fbUser, {
        displayName: profileData.name,
        photoURL: profileData.avatar || undefined
      });
    }

    const patient: PatientUser = {
      id: fbUser.uid,
      name: profileData.name || email.split('@')[0],
      phone: profileData.phone || '01700000000',
      email: fbUser.email || email,
      address: profileData.address || 'Dhaka, Bangladesh',
      avatar: profileData.avatar || undefined,
      gender: profileData.gender || 'male',
      age: profileData.age,
      bloodGroup: profileData.bloodGroup || 'B+',
      createdAt: new Date().toISOString()
    };

    // Save profile to Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    await setDoc(userDocRef, {
      name: patient.name,
      phone: patient.phone,
      email: patient.email || '',
      address: patient.address,
      avatar: patient.avatar || '',
      gender: patient.gender,
      age: patient.age || '',
      bloodGroup: patient.bloodGroup,
      createdAt: patient.createdAt,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Send automatic notification email to eclinicbd24@gmail.com
    sendPatientRegistrationNotificationEmail(patient);

    return { success: true, user: patient };
  } catch (error: any) {
    console.error("Email register error:", error);
    let msg = error?.message || 'Registration failed.';
    if (error.code === 'auth/email-already-in-use') {
      msg = 'This email is already registered. Please sign in instead.';
    } else if (error.code === 'auth/weak-password') {
      msg = 'Password should be at least 6 characters.';
    }
    return { success: false, error: msg };
  }
};

/**
 * Sign Out from Firebase
 */
export const logoutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Sign out error:", e);
  }
};

/**
 * Real-time subscription to registered patients/users
 */
export const subscribeToUsers = (callback: (users: PatientUser[]) => void) => {
  try {
    const usersCol = collection(db, 'users');
    return onSnapshot(usersCol, (snapshot) => {
      const users: PatientUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        users.push({
          id: docSnap.id,
          name: data.name || 'Patient',
          phone: data.phone || '01700000000',
          email: data.email || undefined,
          address: data.address || 'Dhaka, Bangladesh',
          avatar: data.avatar || undefined,
          gender: data.gender || 'male',
          age: data.age,
          bloodGroup: data.bloodGroup || 'B+',
          emergencyContact: data.emergencyContact,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });
      callback(users);
    }, (_error) => {
      // Offline / permission subscription fallback
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * Save user profile updates to Firestore
 */
export const saveUserProfileToFirestore = async (user: PatientUser): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    if (!user.id) return;
    const userRef = doc(db, 'users', user.id);
    const dataToSave = cleanFirestoreData({
      name: user.name,
      phone: user.phone,
      email: user.email || '',
      address: user.address || '',
      avatar: user.avatar || '',
      gender: user.gender || 'male',
      age: user.age || '',
      bloodGroup: user.bloodGroup || '',
      emergencyContact: user.emergencyContact || '',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    await setDoc(userRef, dataToSave, { merge: true });
  });
};

/**
 * Fetch User Profile from Firestore
 */
export const getUserProfileFromFirestore = async (userId: string): Promise<PatientUser | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: userId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        avatar: data.avatar,
        gender: data.gender,
        age: data.age,
        bloodGroup: data.bloodGroup,
        emergencyContact: data.emergencyContact,
        createdAt: data.createdAt || new Date().toISOString()
      };
    }
    return null;
  } catch (e) {
    console.error("Error fetching user from Firestore:", e);
    return null;
  }
};

/**
 * Save a new booking to Firestore using the unique booking ID as document ID
 */
export const saveBookingToFirestore = async (booking: BookingHistoryItem): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const bookingDoc = doc(db, 'bookings', booking.id);
    await setDoc(bookingDoc, cleanFirestoreData({
      ...booking,
      createdAt: booking.createdAt || new Date().toISOString()
    }), { merge: true });
  });
};

/**
 * Delete a booking from Firestore
 */
export const deleteBookingFromFirestore = async (bookingId: string): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const bookingDoc = doc(db, 'bookings', bookingId);
    await deleteDoc(bookingDoc);
  });
};

/**
 * Real-time subscription to bookings
 */
export const subscribeToBookings = (callback: (bookings: BookingHistoryItem[]) => void) => {
  try {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const bookings: BookingHistoryItem[] = [];
      const seenIds = new Set<string>();

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const finalId = data.id || docSnap.id;
        if (!seenIds.has(finalId)) {
          seenIds.add(finalId);
          bookings.push({
            id: finalId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerAddress: data.customerAddress,
            date: data.date,
            time: data.time,
            labId: data.labId,
            labName: data.labName,
            testNames: data.testNames || [],
            totalCost: data.totalCost || 0,
            status: data.status || 'pending',
            doctorName: data.doctorName,
            createdAt: data.createdAt
          });
        }
      });
      callback(bookings);
    }, (_error) => {
      // Offline fallback
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * Get one-time bookings from Firestore
 */
export const getBookingsFromFirestore = async (): Promise<BookingHistoryItem[]> => {
  try {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const bookings: BookingHistoryItem[] = [];
    const seenIds = new Set<string>();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const finalId = data.id || docSnap.id;
      if (!seenIds.has(finalId)) {
        seenIds.add(finalId);
        bookings.push({
          id: finalId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          date: data.date,
          time: data.time,
          labId: data.labId,
          labName: data.labName,
          testNames: data.testNames || [],
          totalCost: data.totalCost || 0,
          status: data.status || 'pending',
          doctorName: data.doctorName,
          createdAt: data.createdAt
        });
      }
    });
    return bookings;
  } catch (error) {
    console.error("Error getting bookings:", error);
    return [];
  }
};

/**
 * ============================================================================
 * SITE SETTINGS & CMS REAL-TIME SYNC (HEADER, FOOTER, BRANDING, CONTACTS, HERO)
 * Ensures changes in Admin CMS immediately reflect on all public live domains!
 * ============================================================================
 */

export const saveSiteSettingsToFirestore = async (lang: Language, settings: SiteSettings): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const cleanSettings: SiteSettings = {
      ...settings,
      siteName: cleanBrandText(settings.siteName) || 'eClinic Bangladesh',
      siteTagline: cleanBrandText(settings.siteTagline),
      aboutBadge: cleanBrandText(settings.aboutBadge),
      aboutTitle: cleanBrandText(settings.aboutTitle) || (lang === 'bn' ? 'আমাদের সম্পর্কে (About Us)' : 'About eClinic Bangladesh'),
      aboutDescription: cleanBrandText(settings.aboutDescription),
      aboutStory: cleanBrandText(settings.aboutStory),
      aboutStats: (Array.isArray(settings.aboutStats) && settings.aboutStats.length > 0)
        ? settings.aboutStats.map((st: any) => ({ label: cleanBrandText(st?.label), value: cleanBrandText(st?.value) }))
        : settings.aboutStats,
      contactAddress: cleanBrandText(settings.contactAddress),
      contactEmail: cleanBrandText(settings.contactEmail) || 'support@eclinicbd.com',
      invoiceOrgName: cleanBrandText(settings.invoiceOrgName) || 'eClinic Bangladesh',
      invoiceWatermark: (settings.invoiceWatermark && !settings.invoiceWatermark.includes('LabHome')) ? settings.invoiceWatermark : 'eClinic BD'
    };

    const settingsDoc = doc(db, 'site_settings', `config_${lang}`);
    await setDoc(settingsDoc, cleanFirestoreData({
      ...cleanSettings,
      updatedAt: new Date().toISOString()
    }), { merge: true });

    // Also sync global visibility toggles to the other language in Firestore
    const otherLang = lang === 'en' ? 'bn' : 'en';
    const otherDoc = doc(db, 'site_settings', `config_${otherLang}`);
    const globalVisibilityFields: Record<string, any> = {};
    if (settings.showDoctorsSection !== undefined) globalVisibilityFields.showDoctorsSection = settings.showDoctorsSection;
    if (settings.showNursingSection !== undefined) globalVisibilityFields.showNursingSection = settings.showNursingSection;
    if (settings.showPartnerSection !== undefined) globalVisibilityFields.showPartnerSection = settings.showPartnerSection;
    if (settings.showPopularTestsSection !== undefined) globalVisibilityFields.showPopularTestsSection = settings.showPopularTestsSection;
    if (settings.showPackagesSection !== undefined) globalVisibilityFields.showPackagesSection = settings.showPackagesSection;
    if (settings.showAppDownloadSection !== undefined) globalVisibilityFields.showAppDownloadSection = settings.showAppDownloadSection;
    if (settings.showHowItWorksSection !== undefined) globalVisibilityFields.showHowItWorksSection = settings.showHowItWorksSection;
    if (settings.showServicesSection !== undefined) globalVisibilityFields.showServicesSection = settings.showServicesSection;

    if (Object.keys(globalVisibilityFields).length > 0) {
      await setDoc(otherDoc, cleanFirestoreData({
        ...globalVisibilityFields,
        siteName: cleanSettings.siteName,
        updatedAt: new Date().toISOString()
      }), { merge: true });
    }
  });
};

export const subscribeToSiteSettings = (lang: Language, callback: (settings: SiteSettings) => void) => {
  try {
    const settingsDoc = doc(db, 'site_settings', `config_${lang}`);
    return onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        const cleanAboutTitle = data.aboutTitle && data.aboutTitle.trim()
          ? cleanBrandText(data.aboutTitle.trim())
          : (lang === 'bn' ? 'আমাদের সম্পর্কে (About Us)' : 'About eClinic Bangladesh');

        const cleanAboutDesc = data.aboutDescription && data.aboutDescription.trim()
          ? cleanBrandText(data.aboutDescription.trim())
          : (lang === 'bn'
              ? 'eClinic Bangladesh হলো বাংলাদেশের একটি নির্ভরযোগ্য ডিজিটাল স্বাস্থ্যসেবা ও হোম ডায়াগনস্টিক প্ল্যাটফর্ম। ট্রাফিকের ভিড় এড়িয়ে ঘরে বসেই পপুলার, ল্যাবএইড, বারডেমসহ দেশের সেরা ল্যাব থেকে রক্ত পরীক্ষা ও ডায়াগনস্টিক টেস্টের সুবিধা দিতে আমরা বদ্ধপরিকর।'
              : 'eClinic Bangladesh is Bangladesh’s premier digital healthcare and doorstep diagnostic platform. Skip traffic jams and clinic queues by getting diagnostic tests done from top accredited labs directly from home.');

        const cleanAboutStory = data.aboutStory && data.aboutStory.trim()
          ? cleanBrandText(data.aboutStory.trim())
          : (lang === 'bn'
              ? '২০২৪ সাল থেকে আমাদের দক্ষ মেডিকেল টেকনোলজিস্ট ও সার্টিফাইড ল্যাব পার্টনারদের মাধ্যমে ঢাকার হাজারো পরিবারের কাছে সহজে, নিরাপদে ও সাশ্রয়ী মূল্যে হোম স্যাম্পল কালেকশন ও ইনস্ট্যান্ট অনলাইন রিপোর্ট সেবা পৌঁছে দিচ্ছি।'
              : 'Founded in 2024, we empower thousands of families across Dhaka with prompt, hygienic, and affordable blood sample collection, analyzed at accredited labs like Popular, Labaid, BIRDEM, and BSMMU.');

        const cleanSettings: SiteSettings = {
          ...data,
          siteName: cleanBrandText(data.siteName) || 'eClinic Bangladesh',
          siteTagline: cleanBrandText(data.siteTagline) || (lang === 'bn' ? 'বাংলাদেশের বিশ্বস্ত হোম স্যাম্পল কালেকশন ও ডিজিটাল ডায়াগনস্টিক প্ল্যাটফর্ম' : 'Trusted Home Sample Collection & Digital Diagnostic Platform in Bangladesh'),
          aboutBadge: cleanBrandText(data.aboutBadge) || (lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'),
          aboutTitle: cleanAboutTitle,
          aboutDescription: cleanAboutDesc,
          aboutStory: cleanAboutStory,
          aboutStats: (Array.isArray(data.aboutStats) && data.aboutStats.length > 0)
            ? data.aboutStats.map((st: any) => ({ label: cleanBrandText(st?.label), value: cleanBrandText(st?.value) }))
            : data.aboutStats,
          contactEmail: cleanBrandText(data.contactEmail) || 'support@eclinicbd.com',
          contactAddress: cleanBrandText(data.contactAddress) || data.contactAddress,
          invoiceOrgName: cleanBrandText(data.invoiceOrgName) || 'eClinic Bangladesh',
          invoiceWatermark: (data.invoiceWatermark && !data.invoiceWatermark.includes('LabHome')) ? data.invoiceWatermark : 'eClinic BD'
        };

        // Deliver clean settings directly to callback without recursive write-back
        callback(cleanSettings);
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * ============================================================================
 * CATEGORIES, LABS, TESTS & PACKAGES REAL-TIME SYNC
 * ============================================================================
 */

export const saveCategoriesToFirestore = async (categories: CategoryItem[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const catDoc = doc(db, 'categories', 'master_list');
    await setDoc(catDoc, cleanFirestoreData({
      items: categories,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToCategories = (callback: (categories: CategoryItem[]) => void) => {
  try {
    const catDoc = doc(db, 'categories', 'master_list');
    return onSnapshot(catDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as CategoryItem[]);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

export const saveLabsToFirestore = async (lang: Language, labs: LabPartner[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const labsDoc = doc(db, 'labs', `list_${lang}`);
    await setDoc(labsDoc, cleanFirestoreData({
      items: labs,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToLabs = (lang: Language, callback: (labs: LabPartner[]) => void) => {
  try {
    const labsDoc = doc(db, 'labs', `list_${lang}`);
    return onSnapshot(labsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as LabPartner[]);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

export const saveTestsToFirestore = async (lang: Language, tests: TestPackage[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const testsDoc = doc(db, 'tests', `list_${lang}`);
    await setDoc(testsDoc, cleanFirestoreData({
      items: tests,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToTests = (
  lang: Language, 
  callback: (tests: TestPackage[], metadata?: { updatedAt?: string; hasPendingWrites?: boolean }) => void
) => {
  try {
    const testsDoc = doc(db, 'tests', `list_${lang}`);
    return onSnapshot(testsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as TestPackage[], {
            updatedAt: data.updatedAt,
            hasPendingWrites: snapshot.metadata.hasPendingWrites
          });
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

export const savePackagesToFirestore = async (lang: Language, packages: HealthPackage[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const pkgsDoc = doc(db, 'packages', `list_${lang}`);
    await setDoc(pkgsDoc, cleanFirestoreData({
      items: packages,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToPackages = (lang: Language, callback: (packages: HealthPackage[]) => void) => {
  try {
    const pkgsDoc = doc(db, 'packages', `list_${lang}`);
    return onSnapshot(pkgsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as HealthPackage[]);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

export const saveDoctorsToFirestore = async (lang: Language, doctors: Doctor[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const docRef = doc(db, 'doctors', `list_${lang}`);
    await setDoc(docRef, cleanFirestoreData({
      items: doctors,
      updatedAt: new Date().toISOString()
    }), { merge: true });

    // Also sync doctor active status, slot intervals and offDays to the other language list in Firestore
    const otherLang = lang === 'en' ? 'bn' : 'en';
    const otherDocRef = doc(db, 'doctors', `list_${otherLang}`);
    const otherSnap = await getDoc(otherDocRef);
    if (otherSnap.exists()) {
      const otherData = otherSnap.data();
      if (Array.isArray(otherData?.items)) {
        const currentMap = new Map(doctors.map(d => [d.id, d]));
        const updatedOther = otherData.items.map((od: Doctor) => {
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
              orderCount: match.orderCount,
              totalConsultations: match.totalConsultations,
              consultationFee: match.consultationFee,
              originalFee: match.originalFee,
              discountPercent: match.discountPercent,
              followupFee: match.followupFee,
              rating: match.rating,
              experienceYears: match.experienceYears,
              gender: match.gender || od.gender,
              image: match.image || od.image,
              slotIntervalMinutes: match.slotIntervalMinutes,
              availableTimeText: match.availableTimeText || od.availableTimeText,
              customSlots: match.customSlots,
              offDays: match.offDays,
              about: match.about || od.about
            };
          }
          return od;
        });
        await setDoc(otherDocRef, cleanFirestoreData({
          items: updatedOther,
          updatedAt: new Date().toISOString()
        }), { merge: true });
      }
    }
  });
};

export const subscribeToDoctors = (lang: Language, callback: (doctors: Doctor[]) => void) => {
  try {
    const docRef = doc(db, 'doctors', `list_${lang}`);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as Doctor[]);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

export const savePaymentConfigToFirestore = async (config: PaymentGatewaysConfig): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const payDoc = doc(db, 'settings', 'payment_gateways');
    await setDoc(payDoc, cleanFirestoreData({
      ...config,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToPaymentConfig = (callback: (config: PaymentGatewaysConfig) => void) => {
  try {
    const payDoc = doc(db, 'settings', 'payment_gateways');
    return onSnapshot(payDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data) {
          callback(data as unknown as PaymentGatewaysConfig);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * Super Admin Credentials Cloud Sync
 */
export const saveAdminCredentialsToFirestore = async (creds: AdminCredentials): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const adminDoc = doc(db, 'settings', 'admin_credentials');
    await setDoc(adminDoc, cleanFirestoreData({
      username: creds.username,
      password: creds.password,
      updatedAt: creds.updatedAt || new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToAdminCredentials = (callback: (creds: AdminCredentials) => void) => {
  try {
    const adminDoc = doc(db, 'settings', 'admin_credentials');
    return onSnapshot(adminDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.username && data.password) {
          callback({
            username: data.username,
            password: data.password,
            updatedAt: data.updatedAt
          });
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * Staff Users & Passwords Cloud Sync
 */
export const saveStaffUsersToFirestore = async (staffList: StaffUser[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const staffDoc = doc(db, 'settings', 'staff_users');
    await setDoc(staffDoc, cleanFirestoreData({
      items: staffList,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToStaffUsers = (callback: (staff: StaffUser[]) => void) => {
  try {
    const staffDoc = doc(db, 'settings', 'staff_users');
    return onSnapshot(staffDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as StaffUser[]);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * Patients List & Accounts Cloud Sync
 */
export const savePatientsListToFirestore = async (patients: PatientUser[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const patientsDoc = doc(db, 'settings', 'patients_list');
    await setDoc(patientsDoc, cleanFirestoreData({
      items: patients,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToPatientsList = (callback: (patients: PatientUser[]) => void) => {
  try {
    const patientsDoc = doc(db, 'settings', 'patients_list');
    return onSnapshot(patientsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as PatientUser[]);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * Appointment Date & Slot Configuration Cloud Sync
 */
export const saveDateSlotConfigToFirestore = async (config: DateSlotConfig): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const slotDoc = doc(db, 'settings', 'date_slot_config');
    await setDoc(slotDoc, cleanFirestoreData({
      ...config,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToDateSlotConfig = (callback: (config: DateSlotConfig) => void) => {
  try {
    const slotDoc = doc(db, 'settings', 'date_slot_config');
    return onSnapshot(slotDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.slots) && data.slots.length > 0) {
          callback(data as unknown as DateSlotConfig);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * Doctor at Home (হোমে ডাক্তার বুকিং) Cloud Firestore Sync
 */
export const saveDoctorAtHomeBookingsToFirestore = async (bookings: DoctorAtHomeBooking[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const dahDoc = doc(db, 'bookings', 'doctor_at_home_list');
    await setDoc(dahDoc, cleanFirestoreData({
      items: bookings,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToDoctorAtHomeBookings = (callback: (bookings: DoctorAtHomeBooking[]) => void) => {
  try {
    const dahDoc = doc(db, 'bookings', 'doctor_at_home_list');
    return onSnapshot(dahDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          callback(data.items as DoctorAtHomeBooking[]);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * Home Visit Doctors (হোম ভিজিট ডাক্তারদের তালিকা) Cloud Firestore Sync
 */
export const saveHomeVisitDoctorsToFirestore = async (doctors: HomeVisitDoctor[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const hvdDoc = doc(db, 'settings', 'home_visit_doctors');
    await setDoc(hvdDoc, cleanFirestoreData({
      items: doctors,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToHomeVisitDoctors = (callback: (doctors: HomeVisitDoctor[]) => void) => {
  try {
    const hvdDoc = doc(db, 'settings', 'home_visit_doctors');
    return onSnapshot(hvdDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          callback(data.items as HomeVisitDoctor[]);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};

/**
 * Phlebotomists Roster (স্যাম্পল কালেকশন ফ্লেবোটোমিস্টদের তালিকা) Cloud Firestore Sync
 */
export const savePhlebotomistsToFirestore = async (phlebotomists: Phlebotomist[]): Promise<boolean> => {
  return safeFirestoreWrite(async () => {
    const phlebDoc = doc(db, 'settings', 'phlebotomists_list');
    await setDoc(phlebDoc, cleanFirestoreData({
      items: phlebotomists,
      updatedAt: new Date().toISOString()
    }), { merge: true });
  });
};

export const subscribeToPhlebotomists = (callback: (phlebotomists: Phlebotomist[]) => void) => {
  try {
    const phlebDoc = doc(db, 'settings', 'phlebotomists_list');
    return onSnapshot(phlebDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.items)) {
          callback(data.items as Phlebotomist[]);
        }
      }
    }, (_error) => {
      // Handled quietly
    });
  } catch (_error) {
    return () => {};
  }
};




