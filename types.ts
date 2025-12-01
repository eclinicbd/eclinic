
export type Language = 'bn' | 'en';

export interface TestPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  priceByLab?: Record<string, number>; // Maps Lab ID to Price
  category: 'General' | 'Diabetes' | 'Heart' | 'Thyroid' | 'Vitamin';
  image: string;
  turnaroundTime: string; // Added turnaround time
}

export interface LabPartner {
  id: string;
  name: string;
  rating: number;
  logo: string;
  serviceCharge: number; // Added service charge per lab
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
  date: string;
  time: string;
  labName: string;
  testNames: string[];
  totalCost: number;
  status: BookingStatus;
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

// Admin Types
export interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  activeUsers: number;
}
