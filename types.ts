
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
  rating: number;
  logo: string;
  serviceCharge: number; // Service charge / home collection fee
  location?: string;
  discountBadge?: string;
  accreditation?: string;
  accentColor?: string;
  order?: number;
  isHidden?: boolean; // When true, hidden from customer-facing booking and selector
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
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// Dashboard Types
export type BookingStatus = 'pending' | 'confirmed' | 'collected' | 'processing' | 'completed' | 'cancelled';

export interface BookingHistoryItem {
  id: string;
  customerName?: string; // Added for Admin
  customerPhone?: string; // Added for Admin
  customerAddress?: string;
  date: string;
  time: string;
  labId?: string;
  labName: string;
  testNames: string[];
  totalCost: number;
  status: BookingStatus;
  doctorName?: string;
  createdAt?: string;
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

// Global Site Settings and CMS configuration
export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoUrl?: string;
  logoIcon?: string; // e.g. 'FlaskConical', 'Activity', 'HeartPulse', 'ShieldCheck', 'Stethoscope'
  
  // Hero Section Customization
  heroBadge?: string;
  heroTitle?: string;
  heroTitleHighlight?: string;
  heroDesc?: string;
  heroBtnBook?: string;
  heroImages?: string[];

  // Partner Diagnostic Centers Section
  partnerBadge?: string;
  partnerTitle?: string;
  partnerDesc?: string;
  partnerBtnText?: string;

  // Popular Tests Section
  popularTestsBadge?: string;
  popularTestsTitle?: string;
  popularTestsDesc?: string;
  popularTestsBtnText?: string;

  // Health Packages Section
  packagesBadge?: string;
  packagesTitle?: string;
  packagesDesc?: string;
  packagesBtnText?: string;

  // Nursing & Care Section
  nursingBadge?: string;
  nursingTitle?: string;
  nursingDesc?: string;
  nursingHotline?: string;
  nursingWhatsApp?: string;
  nursingServices?: NursingCareService[];

  // How It Works / Steps Section
  howItWorksTitle?: string;
  howItWorksSteps?: HowItWorksStep[];

  // Services Section Header Text
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
  services: ServiceItem[];
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


