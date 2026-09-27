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
  Language 
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
 * Save a new booking to Firestore
 */
export const saveBookingToFirestore = async (booking: BookingHistoryItem): Promise<boolean> => {
  try {
    const bookingsCol = collection(db, 'bookings');
    await addDoc(bookingsCol, {
      ...booking,
      createdAt: booking.createdAt || new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error saving booking to Firestore:", error);
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
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        bookings.push({
          id: docSnap.id,
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
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      bookings.push({
        id: docSnap.id,
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

