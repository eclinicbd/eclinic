
export type Language = 'bn' | 'en';

export interface CategoryItem {
  id: string;
  name: string; // e.g. "Diabetes", "Heart", "Vitamin"
  nameBn?: string; // e.g. "ডায়াবেটিস", "হার্ট ও কার্ডিয়াক"
  description?: string;
  icon?: string; // e.g. 'FlaskConical', 'Droplet', 'HeartPulse', 'Activity', 'Zap', 'ShieldCheck', 'Layers', 'AlertCircle', 'Sparkles', 'User'
  color?: string; // e.g. 'blue', 'rose', 'red', 'purple', 'amber', 'cyan', 'emerald', 'orange', 'pink', 'indigo'
  order?: number;
  isHidden?: boolean;
}

export interface TestPackage {
  id: string;
  name: string;
  description: string;
  price: number; // Current discounted / final price
  originalPrice?: number; // Original / regular price (before discount)
  discountPercent?: number; // Optional discount percentage (e.g. 15, 20)
  priceByLab?: Record<string, number>; // Maps Lab ID to final price
  originalPriceByLab?: Record<string, number>; // Maps Lab ID to original regular price
  category: string;
  image: string;
  turnaroundTime: string; // Added turnaround time
  isHidden?: boolean; // When true, hidden from customer-facing catalog
  hiddenLabs?: string[]; // List of Lab IDs where this test/package is hidden/unavailable
  isPackage?: boolean;
  testCount?: number;
  includededTests?: string[];
  orderCount?: number; // Total number of times this test has been ordered/performed
}

export interface HealthPackage extends TestPackage {
  tagline?: string;
  testCount: number; // e.g. 4, 10, 6, 7, 8, 5
  includededTests: string[]; // Specific test list inside package
  testDetails?: { name: string; purpose: string; sample?: string }[];
  sampleType?: string; // 'Blood & Urine', 'Blood Sample'
  fastingRequirement?: string; // e.g. '8-10 Hours Fasting' / 'No Fasting'
  popularBadge?: string;
  badgeColor?: string;
  recommendedFor?: string;
  features?: string[];
}

export interface LabPartner {
  id: string;
  name: string;
  rating?: number;
  logo: string;
  serviceCharge: number; // Service charge / home collection fee
  discountPercent?: number; // Auto discount percentage for all tests of this diagnostic center (e.g. 10, 15, 20)
  location?: string;
  discountBadge?: string;
  accreditation?: string;
  accentColor?: string;
  order?: number;
  isHidden?: boolean; // When true, hidden from customer-facing booking and selector
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';

export interface BkashApiConfig {
  isActive: boolean;
  mode: 'manual' | 'api';
  merchantNumber: string; // e.g. "01712-345678"
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  isSandbox: boolean;
  callbackUrl?: string;
  instructions?: string;
}

export interface NagadApiConfig {
  isActive: boolean;
  mode: 'manual' | 'api';
  merchantNumber: string; // e.g. "01812-345678"
  merchantId: string;
  publicKey: string;
  privateKey: string;
  isSandbox: boolean;
  callbackUrl?: string;
  instructions?: string;
}

export interface RocketApiConfig {
  isActive: boolean;
  mode: 'manual' | 'api';
  accountNumber: string; // e.g. "01912-345678-9"
  billerId: string;
  apiKey: string;
  secretPin?: string;
  isSandbox: boolean;
  instructions?: string;
}

export interface CardGatewayConfig {
  isActive: boolean;
  provider: 'sslcommerz' | 'shurjopay' | 'aamarpay' | 'stripe' | 'custom';
  storeId: string;
  storePassword: string;
  apiKey?: string;
  isSandbox: boolean;
  currency: string;
  successUrl?: string;
  failUrl?: string;
  cancelUrl?: string;
  instructions?: string;
}

export interface CodConfig {
  isActive: boolean;
  title: string;
  instructions: string;
  extraFee?: number;
}

export interface PaymentGatewaysConfig {
  cod: CodConfig;
  bkash: BkashApiConfig;
  nagad: NagadApiConfig;
  rocket: RocketApiConfig;
  card: CardGatewayConfig;
}

export interface BookingFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  date: string;
  time: string;
  testIds: string[]; // Supports multiple tests in one booking
  labId: string;
  doctorName?: string;
  prescription?: File | null;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  senderPhone?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// Dashboard Types
export type BookingStatus = 'pending' | 'confirmed' | 'collected' | 'processing' | 'completed' | 'cancelled';

export interface BookingItemDetail {
  id?: string;
  name: string;
  category?: string;
  originalPrice: number; // Main / regular rate before discount
  discountAmount: number; // Discount amount (in BDT)
  finalPrice: number; // Final net price
}

export interface BookingHistoryItem {
  id: string;
  customerName?: string; // Added for Admin
  customerPhone?: string; // Added for Admin
  customerAddress?: string;
  area?: string; // Specific city area e.g. "Dhanmondi", "Uttara", "Mirpur", "Gulshan"
  date: string;
  time: string;
  labId?: string;
  labName: string;
  testNames: string[];
  items?: BookingItemDetail[]; // Itemized breakdown with main rate, discount and final rate
  subtotal?: number; // Main rate subtotal
  totalDiscount?: number; // Total savings/discount
  collectionFee?: number; // Home sample collection fee (serviceCharge)
  accessoriesFee?: number; // Tube, Needle & Accessories charge (1-2 tests: 45tk, 3-4 tests: 65tk, 4+ tests: 85tk)
  serviceCharge?: number;
  totalCost: number;
  status: BookingStatus;
  doctorName?: string;
  createdAt?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedStaffRole?: StaffRole;
  sampleCollectedAt?: string;
  deliveredAt?: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'unpaid' | 'paid' | 'pending_verification';
  transactionId?: string;
  senderPhone?: string;
}

export interface ReportItem {
  id: string;
  testName: string;
  date: string;
  labName: string;
  downloadUrl: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
  avatar: string;
}

// Patient Authentication & Account Interface
export interface PatientUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  address?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number | string;
  bloodGroup?: string;
  emergencyContact?: string;
  createdAt: string;
}

// Service Item for dynamic services management
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string; // e.g. 'Home', 'FlaskConical', 'Activity', 'Stethoscope', 'Truck', 'FileText', 'HeartPulse', 'ShieldCheck', 'PhoneCall', 'Clock'
  badge?: string;
  isActive?: boolean;
}

export interface AboutStat {
  label: string;
  value: string;
}

export interface HowItWorksStep {
  title: string;
  desc: string;
  icon?: string; // e.g. 'Search', 'Home', 'Activity', 'FlaskConical', 'FileText', 'ShieldCheck'
}

export interface NursingCareService {
  id: string;
  title: string;
  description: string;
  category?: string; // e.g., 'Home Nursing', 'Elderly Care', 'Post-Operative', 'Physiotherapy', 'Special Procedures', 'Equipment'
  price?: number | string; // e.g. 1500 or "৳১,৫০০"
  duration?: string; // e.g. '১২ ঘণ্টা', '২৪ ঘণ্টা', 'প্রতি ভিজিট', '১ ঘণ্টা'
  badge?: string; // e.g. '২৪/৭ সার্ভিস', 'সর্বাধিক জনপ্রিয়', 'সার্টিফাইড নার্স', 'জরুরি'
  icon?: string; // e.g. 'HeartPulse', 'Stethoscope', 'Activity', 'ShieldCheck', 'UserCheck', 'Clock', 'Home', 'Syringe'
  imageUrl?: string;
  features?: string[]; // e.g. ["ইনজেকশন ও স্যালাইন পুশ", "ড্রেসিং ও ক্ষত পরিচর্যা", "রক্তচাপ ও সুগার চেক"]
  isActive?: boolean;
}

// Doctor Consultation, E-Prescription & Telemedicine Interfaces
export interface DoctorTimeSlot {
  id: string;
  time: string; // e.g. "09:00 AM - 09:30 AM"
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "09:30 AM"
  period?: 'morning' | 'afternoon' | 'evening' | 'night';
  isBooked?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  title?: string; // e.g. "ডাঃ" / "Dr." or "অধ্যাপক ডাঃ"
  specialty: string; // e.g. "মেডিসিন ও ডায়াবেটিস বিশেষজ্ঞ"
  department: string; // e.g. "Medicine", "Cardiology", "Pediatrics", "Gynecology", "Dermatology", "Diabetes", "General Physician"
  degrees: string; // e.g. "MBBS, FCPS (Medicine), MD, MACP (USA)"
  bmdcRegNo?: string; // e.g. "A-54321"
  hospital: string; // e.g. "ঢাকা মেডিকেল কলেজ ও হাসপাতাল"
  experienceYears: number | string; // e.g. 12
  rating: number; // e.g. 4.9
  reviewCount: number; // e.g. 340
  totalConsultations: number; // e.g. 1450
  consultationFee: number; // e.g. 500
  originalFee?: number; // e.g. 800
  discountPercent?: number; // e.g. 37
  followupFee?: number; // e.g. 300
  image: string;
  gender?: 'male' | 'female';
  languages?: string[]; // e.g. ["বাংলা", "English"]
  availableDays?: string[]; // e.g. ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র"]
  availableTimeText?: string; // e.g. "প্রতিদিন সন্ধ্যা ৬:০০ - রাত ৯:০০"
  slotIntervalMinutes?: number; // 30
  consultationTypes?: ('video' | 'audio' | 'chamber')[];
  about?: string;
  isActive?: boolean;
  orderCount?: number;
}

export interface PrescribedMedicine {
  id: string;
  name: string; // e.g. "Tab. Napa Extra 500mg"
  type?: 'Tab' | 'Cap' | 'Syp' | 'Inj' | 'Drop' | 'Ointment';
  dosage: string; // e.g. "১ + ০ + ১"
  duration: string; // e.g. "৭ দিন"
  instruction: string; // e.g. "খাবারের পরে ভরা পেটে"
}

export interface PrescribedTestAdvice {
  id: string;
  testId?: string; // matching lab test ID if available
  name: string; // e.g. "CBC with ESR"
  estimatedPrice?: number;
  instructions?: string; // e.g. "ফাস্টিং ব্লাড সুগার ৮-১০ ঘণ্টা না খেয়ে দিতে হবে"
}

export interface EPrescription {
  id: string;
  appointmentId: string;
  date: string;
  doctorId: string;
  doctorName: string;
  doctorDegrees: string;
  doctorSpecialty: string;
  doctorHospital: string;
  doctorBmdcNo: string;
  doctorSignature?: string;
  patientName: string;
  patientAge: string | number;
  patientGender: string;
  patientPhone: string;
  chiefComplaints: string[];
  vitals?: {
    bloodPressure?: string;
    pulse?: string;
    temperature?: string;
    weight?: string;
    bloodSugar?: string;
  };
  diagnosis?: string;
  medicines: PrescribedMedicine[];
  advisedTests: PrescribedTestAdvice[];
  advice: string[];
  followupDate?: string;
}

export interface DoctorAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorHospital: string;
  doctorImage?: string;
  doctorFee: number;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge: number | string;
  patientGender: 'male' | 'female' | 'other';
  problemDescription: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTimeSlot: string; // e.g. "06:00 PM - 06:30 PM"
  consultationType: 'video' | 'audio' | 'chamber';
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  transactionId?: string;
  senderPhone?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  ePrescriptionId?: string;
  prescription?: EPrescription;
  videoRoomId?: string;
}

// Global Site Settings and CMS configuration
export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl?: string;
  logoIcon?: string; // e.g. 'FlaskConical', 'Activity', 'HeartPulse', 'ShieldCheck', 'Stethoscope'
  faviconUrl?: string; // Custom browser tab icon / favicon URL or Data URI
  
  // Hero Section Customization
  heroBadge?: string;
  heroTitle?: string;
  heroTitleHighlight?: string;
  heroDesc?: string;
  heroBtnBook?: string;
  heroImages?: string[];

  // Homepage Sections Ordering & Visibility
  homeSectionsOrder?: string[]; // Custom ordering array of section keys: 'partner' | 'popularTests' | 'packages' | 'nursing' | 'services' | 'howItWorks'
  
  // Partner Diagnostic Centers Section
  showPartnerSection?: boolean; // Section 2 visibility toggle
  partnerBadge?: string;
  partnerTitle?: string;
  partnerDesc?: string;
  partnerBtnText?: string;

  // Popular Tests Section
  showPopularTestsSection?: boolean; // Section 3 visibility toggle
  popularTestsBadge?: string;
  popularTestsTitle?: string;
  popularTestsDesc?: string;
  popularTestsBtnText?: string;

  // Health Packages Section
  showPackagesSection?: boolean; // Section 4 visibility toggle
  packagesBadge?: string;
  packagesTitle?: string;
  packagesDesc?: string;
  packagesBtnText?: string;

  // Doctor Consultation & Telemedicine Section
  showDoctorsSection?: boolean; // Doctor Consultation visibility toggle
  doctorsBadge?: string;
  doctorsTitle?: string;
  doctorsDesc?: string;
  doctorsBtnText?: string;
  doctorsEmergencyHotline?: string;

  // Nursing & Care Section
  showNursingSection?: boolean; // Below Packages visibility toggle
  nursingBadge?: string;
  nursingTitle?: string;
  nursingDesc?: string;
  nursingHotline?: string;
  nursingWhatsApp?: string;
  nursingServices?: NursingCareService[];

  // How It Works / Steps Section
  showHowItWorksSection?: boolean; // Steps visibility toggle
  howItWorksTitle?: string;
  howItWorksSteps?: HowItWorksStep[];

  // Services Section Header Text
  showServicesSection?: boolean; // Services Header visibility toggle
  servicesBadge?: string;
  servicesTitle?: string;
  servicesDesc?: string;

  // About Us Customization
  aboutBadge?: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutStory?: string;
  aboutStats?: AboutStat[];
  aboutImage?: string;

  // Contact Details & Socials
  contactAddress: string;
  contactPhone: string;
  contactHotline: string;
  contactEmail: string;
  contactWhatsApp?: string;
  emergencyNumber?: string;
  workingHours?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  services: ServiceItem[];

  // Mobile App Download Section & Store Links (Android & Apple iOS)
  showAppDownloadSection?: boolean;
  appSectionBadge?: string;
  appSectionTitle?: string;
  appSectionDesc?: string;
  androidAppUrl?: string; // Google Play Store link
  iosAppUrl?: string; // Apple iOS App Store link
  apkDownloadUrl?: string; // Direct APK download link if needed
  appDownloadCount?: string; // e.g. "৫০,০০০+ ডাউনলোড"
  appRating?: string; // e.g. "৪.৮ ★ (৫,০০০+ রিভিউ)"
  appMockupImage?: string; // Custom app preview screenshot
  showAppButtonsInHero?: boolean; // Show Google Play / iOS badges in Hero banner as well
  showAppButtonsInFooter?: boolean; // Show store buttons in Footer

  // Invoice & Money Receipt Customization
  invoiceLogoUrl?: string;
  invoiceOrgName?: string;
  invoiceOrgSubtitle?: string;
  invoiceAddress?: string;
  invoiceHotline?: string;
  invoiceEmail?: string;
  invoiceWebsite?: string;
  invoiceTermsTitle?: string;
  invoiceGuidelines?: string[];
  invoiceFooterNote?: string;
  invoiceWatermark?: string;
}

// Admin Types
export interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  activeUsers: number;
}

export type SlotPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeSlotConfigItem {
  id: string;
  time: string; // e.g. "08:00 AM - 09:00 AM"
  period: SlotPeriod;
  isActive: boolean;
  maxCapacity?: number; // max appointments allowed per slot
}

export interface BlockedDateItem {
  date: string; // YYYY-MM-DD
  reason?: string; // e.g. "Eid Holiday", "Maintenance"
}

export interface DateSlotConfig {
  advanceDays: number; // e.g. 7, 14, 30 days
  leadTimeHours: number; // minimum hours required for same-day booking (e.g. 2, 3)
  weeklyHolidays: number[]; // 0=Sunday, 1=Monday, ..., 5=Friday, 6=Saturday
  blockedDates: BlockedDateItem[]; // Specific dates closed
  slots: TimeSlotConfigItem[];
}

export type StaffRole = 'admin' | 'manager' | 'phlebotomist' | 'nurse' | 'delivery' | 'custom';

export interface StaffPermissions {
  canViewOrders: boolean;
  canUpdateOrderStatus: boolean;
  canAssignStaff: boolean;
  canViewReports: boolean;
  canUploadReports: boolean;
  canViewTests: boolean; // View tests catalog
  canEditTests: boolean; // Edit tests/packages/prices (Super Admin only)
  canDeleteTests: boolean; // Delete tests/packages (Super Admin only)
  canViewCustomers: boolean;
  canViewLabs: boolean;
  canManageSettings: boolean; // Super Admin only
  canManageUsers: boolean; // Super Admin only
  canManageSlots: boolean; // Super Admin only
  canDeleteOrders: boolean; // Super Admin only
  canViewRevenue: boolean; // View financial earnings/revenue (Super Admin & Manager only)
  assignedOnly?: boolean; // Only view assigned tasks
}

export interface AdminCredentials {
  username: string;
  password: string;
  updatedAt?: string;
}

export interface StaffUser {
  id: string; // e.g. "MGR-101", "PHLEB-201", "NURSE-301", "DELIV-401"
  name: string;
  emailOrUsername: string;
  password: string;
  role: StaffRole;
  phone: string;
  assignedArea?: string; // e.g. "Dhanmondi", "Uttara", "Mirpur", "Gulshan", "Mohakhali", "Mohammadpur", "All Areas"
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  permissions: StaffPermissions;
}



