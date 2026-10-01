import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
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
  getDocsFromServer
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
  DateSlotConfig
} from '../types';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export { onAuthStateChanged };

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
    }, (error) => {
      console.warn("Users subscription warning:", error);
    });
  } catch (error) {
    console.error("Error setting up users subscription:", error);
    return () => {};
  }
};

/**
 * Save user profile updates to Firestore
 */
export const saveUserProfileToFirestore = async (user: PatientUser): Promise<boolean> => {
  try {
    if (!user.id) return false;
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
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
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving user profile to Firestore:", error);
    return false;
  }
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
  try {
    const bookingDoc = doc(db, 'bookings', booking.id);
    await setDoc(bookingDoc, {
      ...booking,
      createdAt: booking.createdAt || new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving booking to Firestore:", error);
    return false;
  }
};

/**
 * Delete a booking from Firestore
 */
export const deleteBookingFromFirestore = async (bookingId: string): Promise<boolean> => {
  try {
    const bookingDoc = doc(db, 'bookings', bookingId);
    await deleteDoc(bookingDoc);
    return true;
  } catch (error) {
    console.error("Error deleting booking from Firestore:", error);
    return false;
  }
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
    }, (error) => {
      console.warn("Bookings subscription warning:", error);
    });
  } catch (error) {
    console.error("Error setting up bookings subscription:", error);
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
  try {
    const settingsDoc = doc(db, 'site_settings', `config_${lang}`);
    await setDoc(settingsDoc, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving site settings to Firestore:", error);
    return false;
  }
};

export const subscribeToSiteSettings = (lang: Language, callback: (settings: SiteSettings) => void) => {
  try {
    const settingsDoc = doc(db, 'site_settings', `config_${lang}`);
    return onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SiteSettings;
        callback(data);
      }
    }, (error) => {
      console.warn("Site settings subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to site settings:", error);
    return () => {};
  }
};

/**
 * ============================================================================
 * CATEGORIES, LABS, TESTS & PACKAGES REAL-TIME SYNC
 * ============================================================================
 */

export const saveCategoriesToFirestore = async (categories: CategoryItem[]): Promise<boolean> => {
  try {
    const catDoc = doc(db, 'categories', 'master_list');
    await setDoc(catDoc, {
      items: categories,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving categories to Firestore:", error);
    return false;
  }
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
    }, (error) => {
      console.warn("Categories subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to categories:", error);
    return () => {};
  }
};

export const saveLabsToFirestore = async (lang: Language, labs: LabPartner[]): Promise<boolean> => {
  try {
    const labsDoc = doc(db, 'labs', `list_${lang}`);
    await setDoc(labsDoc, {
      items: labs,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving labs to Firestore:", error);
    return false;
  }
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
    }, (error) => {
      console.warn("Labs subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to labs:", error);
    return () => {};
  }
};

export const saveTestsToFirestore = async (lang: Language, tests: TestPackage[]): Promise<boolean> => {
  try {
    const testsDoc = doc(db, 'tests', `list_${lang}`);
    await setDoc(testsDoc, {
      items: tests,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving tests to Firestore:", error);
    return false;
  }
};

export const subscribeToTests = (lang: Language, callback: (tests: TestPackage[]) => void) => {
  try {
    const testsDoc = doc(db, 'tests', `list_${lang}`);
    return onSnapshot(testsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as TestPackage[]);
        }
      }
    }, (error) => {
      console.warn("Tests subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to tests:", error);
    return () => {};
  }
};

export const savePackagesToFirestore = async (lang: Language, packages: HealthPackage[]): Promise<boolean> => {
  try {
    const pkgsDoc = doc(db, 'packages', `list_${lang}`);
    await setDoc(pkgsDoc, {
      items: packages,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving packages to Firestore:", error);
    return false;
  }
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
    }, (error) => {
      console.warn("Packages subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to packages:", error);
    return () => {};
  }
};

export const savePaymentConfigToFirestore = async (config: PaymentGatewaysConfig): Promise<boolean> => {
  try {
    const payDoc = doc(db, 'settings', 'payment_gateways');
    await setDoc(payDoc, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving payment config to Firestore:", error);
    return false;
  }
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
    }, (error) => {
      console.warn("Payment config subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to payment config:", error);
    return () => {};
  }
};

/**
 * Super Admin Credentials Cloud Sync
 */
export const saveAdminCredentialsToFirestore = async (creds: AdminCredentials): Promise<boolean> => {
  try {
    const adminDoc = doc(db, 'settings', 'admin_credentials');
    await setDoc(adminDoc, {
      username: creds.username,
      password: creds.password,
      updatedAt: creds.updatedAt || new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving admin credentials to Firestore:", error);
    return false;
  }
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
    }, (error) => {
      console.warn("Admin credentials subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to admin credentials:", error);
    return () => {};
  }
};

/**
 * Staff Users & Passwords Cloud Sync
 */
export const saveStaffUsersToFirestore = async (staffList: StaffUser[]): Promise<boolean> => {
  try {
    const staffDoc = doc(db, 'settings', 'staff_users');
    await setDoc(staffDoc, {
      items: staffList,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving staff users to Firestore:", error);
    return false;
  }
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
    }, (error) => {
      console.warn("Staff users subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to staff users:", error);
    return () => {};
  }
};

/**
 * Patients List & Accounts Cloud Sync
 */
export const savePatientsListToFirestore = async (patients: PatientUser[]): Promise<boolean> => {
  try {
    const patientsDoc = doc(db, 'settings', 'patients_list');
    await setDoc(patientsDoc, {
      items: patients,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving patients list to Firestore:", error);
    return false;
  }
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
    }, (error) => {
      console.warn("Patients list subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to patients list:", error);
    return () => {};
  }
};

/**
 * Appointment Date & Slot Configuration Cloud Sync
 */
export const saveDateSlotConfigToFirestore = async (config: DateSlotConfig): Promise<boolean> => {
  try {
    const slotDoc = doc(db, 'settings', 'date_slot_config');
    await setDoc(slotDoc, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving date slot config to Firestore:", error);
    return false;
  }
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
    }, (error) => {
      console.warn("Date slot config subscription warning:", error);
    });
  } catch (error) {
    console.error("Error subscribing to date slot config:", error);
    return () => {};
  }
};


