import React, { useState } from 'react';
import { Language, BookingHistoryItem, TestPackage, HealthPackage, LabPartner, BookingStatus, SiteSettings, ServiceItem, CategoryItem, PatientUser, StaffUser, StaffRole, StaffPermissions, Doctor, DoctorAppointment, EPrescription } from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FlaskConical, 
  Building2, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Check, 
  Globe, 
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Layers,
  FileEdit,
  Tag,
  BarChart3,
  CalendarClock,
  UserCheck,
  Lock,
  CreditCard,
  Stethoscope
} from 'lucide-react';
import { Button } from './Button';
import { 
  DEFAULT_CATEGORIES, 
  getStoredDateSlotConfig, 
  setStoredDateSlotConfig,
  getStoredStaffUsers,
  saveStoredStaffUsers,
  getStoredCurrentStaff,
  setStoredCurrentStaff,
  filterOrdersForStaff,
  getStoredDoctors,
  setStoredDoctors
} from '../services/dataStorage';
import { getLabs } from '../constants';

// Modular Admin Sub-components
import { AdminOverview } from './admin/AdminOverview';
import { AdminOrders } from './admin/AdminOrders';
import { AdminReports } from './admin/AdminReports';
import { AdminTests } from './admin/AdminTests';
import { AdminPackages } from './admin/AdminPackages';
import { AdminCategories } from './admin/AdminCategories';
import { AdminLabs } from './admin/AdminLabs';
import { AdminSlots } from './admin/AdminSlots';
import { AdminDoctors } from './admin/AdminDoctors';
import { AdminStaffUsers } from './admin/AdminStaffUsers';
import { AdminCustomers } from './admin/AdminCustomers';
import { AdminSettings } from './admin/AdminSettings';
import { AdminPaymentSettings } from './admin/AdminPaymentSettings';
import { AdminCMS } from './admin/AdminCMS';
import { 
  TestFormModal, 
  PackageFormModal,
  CategoryFormModal,
  LabFormModal, 
  LabTestsManagerModal,
  OrderFormModal, 
  OrderDetailsModal, 
  DeleteConfirmModal,
  ServiceFormModal
} from './admin/AdminModals';

interface AdminDashboardProps {
  lang: Language;
  onToggleLanguage?: () => void;
  tests: TestPackage[];
  onUpdateTests: (tests: TestPackage[]) => void;
  packages?: HealthPackage[];
  onUpdatePackages?: (packages: HealthPackage[]) => void;
  categories?: CategoryItem[];
  onUpdateCategories?: (categories: CategoryItem[]) => void;
  labs: LabPartner[];
  onUpdateLabs: (labs: LabPartner[]) => void;
  bookings: BookingHistoryItem[];
  onUpdateBookings: (bookings: BookingHistoryItem[]) => void;
  patients?: PatientUser[];
  onUpdatePatients?: (patients: PatientUser[]) => void;
  doctors?: Doctor[];
  onUpdateDoctors?: (doctors: Doctor[]) => void;
  onOpenPrescriptionViewer?: (prescription: EPrescription) => void;
  onJoinVideoAsDoctor?: (appointment: DoctorAppointment) => void;
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
  onResetAllData: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  onToggleLanguage,
  tests,
  onUpdateTests,
  packages = [],
  onUpdatePackages,
  categories = [],
  onUpdateCategories,
  labs,
  onUpdateLabs,
  bookings,
  onUpdateBookings,
  patients = [],
  onUpdatePatients,
  doctors: propDoctors,
  onUpdateDoctors: propOnUpdateDoctors,
  onOpenPrescriptionViewer,
  onJoinVideoAsDoctor,
  siteSettings,
  onUpdateSiteSettings,
  onResetAllData,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reports' | 'tests' | 'packages' | 'categories' | 'labs' | 'doctors' | 'slots' | 'staff' | 'payments' | 'customers' | 'cms' | 'settings'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Doctors Internal State fallback
  const [internalDoctors, setInternalDoctors] = useState<Doctor[]>(() => propDoctors || getStoredDoctors(lang));
  const activeDoctorsList = propDoctors || internalDoctors;
  const handleUpdateDoctorsList = (newDocs: Doctor[]) => {
    if (propOnUpdateDoctors) {
      propOnUpdateDoctors(newDocs);
    } else {
      setInternalDoctors(newDocs);
      setStoredDoctors(newDocs, lang);
    }
  };

  // Active Staff / RBAC Session State
  const [currentStaff, setCurrentStaff] = useState<StaffUser | null>(getStoredCurrentStaff);
  const isSuperAdmin = !currentStaff || currentStaff.role === 'admin';
  const staffPermissions = currentStaff?.permissions || {
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
    assignedOnly: false
  };

  // Staff Users Management State
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(getStoredStaffUsers);

  const handleUpdateStaffUsers = (newUsers: StaffUser[]) => {
    setStaffUsers(newUsers);
    saveStoredStaffUsers(newUsers);
  };

  // Date and Slot Configuration State
  const [dateSlotConfig, setDateSlotConfig] = useState(getStoredDateSlotConfig);

  const handleUpdateDateSlotConfig = (newConfig: typeof dateSlotConfig) => {
    setDateSlotConfig(newConfig);
    setStoredDateSlotConfig(newConfig);
  };

  // Modals state
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<TestPackage | null>(null);

  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<HealthPackage | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<LabPartner | null>(null);
  const [managingLabTests, setManagingLabTests] = useState<LabPartner | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<BookingHistoryItem | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<BookingHistoryItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'test' | 'package' | 'category' | 'lab' | 'order' | 'service';
    id: string;
    name: string;
  } | null>(null);

  const t = TRANSLATIONS[lang];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // CATEGORY HANDLERS
  // ==========================================
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: CategoryItem) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (categoryToSave: CategoryItem, oldName?: string) => {
    if (!onUpdateCategories) return;

    if (editingCategory) {
      const updated = categories.map(c => c.id === categoryToSave.id ? categoryToSave : c);
      onUpdateCategories(updated);

      // If category name was renamed, automatically update tests and packages using old name!
      if (oldName && oldName.toLowerCase() !== categoryToSave.name.toLowerCase()) {
        const updatedTests = tests.map(t => {
          if (t.category && t.category.toLowerCase() === oldName.toLowerCase()) {
            return { ...t, category: categoryToSave.name };
          }
          return t;
        });
        onUpdateTests(updatedTests);

        if (onUpdatePackages && packages.length > 0) {
          const updatedPkgs = packages.map(p => {
            if (p.category && p.category.toLowerCase() === oldName.toLowerCase()) {
              return { ...p, category: categoryToSave.name };
            }
            return p;
          });
          onUpdatePackages(updatedPkgs);
        }
      }

      showToast(lang === 'bn' ? 'ক্যাটেগরি সফলভাবে আপডেট করা হয়েছে!' : 'Category updated successfully!');
    } else {
      // Check if duplicate name
      if (categories.some(c => c.name.toLowerCase() === categoryToSave.name.toLowerCase())) {
        showToast(lang === 'bn' ? 'এই নামের ক্যাটেগরি ইতিমধ্যেই বিদ্যমান!' : 'Category with this name already exists!');
        return;
      }
      onUpdateCategories([...categories, categoryToSave]);
      showToast(lang === 'bn' ? 'নতুন ক্যাটেগরি সফলভাবে তৈরি করা হয়েছে!' : 'New category created successfully!');
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleToggleHideCategory = (categoryId: string) => {
    if (!onUpdateCategories) return;
    const targetCat = categories.find(c => c.id === categoryId);
    if (!targetCat) return;
    const isNowHidden = !targetCat.isHidden;
    const updated = categories.map(c => c.id === categoryId ? { ...c, isHidden: isNowHidden } : c);
    onUpdateCategories(updated);
    showToast(isNowHidden 
      ? (lang === 'bn' ? 'ক্যাটেগরি লুকানো হয়েছে!' : 'Category is now hidden!') 
      : (lang === 'bn' ? 'ক্যাটেগরি সক্রিয় করা হয়েছে!' : 'Category is now active!'));
  };

  const handleReorderCategory = (categoryId: string, direction: 'up' | 'down') => {
    if (!onUpdateCategories) return;
    const index = categories.findIndex(c => c.id === categoryId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Update orders
    const reordered = updated.map((c, i) => ({ ...c, order: i + 1 }));
    onUpdateCategories(reordered);
  };

  const handleResetDefaultCategories = () => {
    if (!onUpdateCategories) return;
    onUpdateCategories(DEFAULT_CATEGORIES);
    showToast(lang === 'bn' ? 'ডিফল্ট ক্যাটেগরি সমূহ পুনঃস্থাপন করা হয়েছে!' : 'Default categories restored!');
  };

  const handleQuickAddCategory = (categoryToSave: CategoryItem) => {
    if (!onUpdateCategories) return;
    const exists = categories.some(c => c.name.toLowerCase() === categoryToSave.name.toLowerCase());
    if (!exists) {
      const updated = [...categories, categoryToSave];
      onUpdateCategories(updated);
      showToast(lang === 'bn' ? `নতুন ক্যাটেগরি "${categoryToSave.name}" তৈরি করা হয়েছে!` : `New category "${categoryToSave.name}" created!`);
    }
  };


  // ==========================================
  // TEST HANDLERS
  // ==========================================
  const handleOpenAddTest = () => {
    setEditingTest(null);
    setIsTestModalOpen(true);
  };

  const handleOpenEditTest = (test: TestPackage) => {
    setEditingTest(test);
    setIsTestModalOpen(true);
  };

  const handleSaveTest = (testToSave: TestPackage) => {
    if (editingTest) {
      const updated = tests.map(t => t.id === testToSave.id ? testToSave : t);
      onUpdateTests(updated);
      showToast(t.adminSaveSuccess);
    } else {
      onUpdateTests([testToSave, ...tests]);
      showToast(t.adminSaveSuccess);
    }
    setIsTestModalOpen(false);
    setEditingTest(null);
  };

  const handleToggleHideTest = (testId: string) => {
    const targetTest = tests.find(t => t.id === testId);
    if (!targetTest) return;
    const isNowHidden = !targetTest.isHidden;
    const updated = tests.map(t => t.id === testId ? { ...t, isHidden: isNowHidden } : t);
    onUpdateTests(updated);
    showToast(isNowHidden ? t.adminHideSuccess : t.adminUnhideSuccess);
  };

  const handleDuplicateTest = (test: TestPackage) => {
    const clone: TestPackage = {
      ...test,
      id: `test_${Date.now()}`,
      name: `${test.name} (Copy)`,
      isHidden: false
    };
    onUpdateTests([clone, ...tests]);
    showToast("Test duplicated successfully!");
  };

  const handleQuickUpdateTestOrderCount = (testId: string, delta: number) => {
    const updated = tests.map(t => {
      if (t.id === testId) {
        const currentCount = t.orderCount || 0;
        const newCount = Math.max(0, currentCount + delta);
        return { ...t, orderCount: newCount };
      }
      return t;
    });
    onUpdateTests(updated);
    showToast(lang === 'bn' ? 'অর্ডার সংখ্যা আপডেট করা হয়েছে!' : 'Test order count updated!');
  };

  // ==========================================
  // PACKAGE HANDLERS
  // ==========================================
  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: HealthPackage) => {
    setEditingPackage(pkg);
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = (pkgToSave: HealthPackage) => {
    if (!onUpdatePackages) return;
    if (editingPackage) {
      const updated = packages.map(p => p.id === pkgToSave.id ? pkgToSave : p);
      onUpdatePackages(updated);
      showToast(lang === 'bn' ? 'প্যাকেজ সফলভাবে আপডেট করা হয়েছে!' : 'Package updated successfully!');
    } else {
      onUpdatePackages([pkgToSave, ...packages]);
      showToast(lang === 'bn' ? 'নতুন প্যাকেজ সফলভাবে তৈরি করা হয়েছে!' : 'New package created successfully!');
    }
    setIsPackageModalOpen(false);
    setEditingPackage(null);
  };

  const handleToggleHidePackage = (pkgId: string) => {
    if (!onUpdatePackages) return;
    const targetPkg = packages.find(p => p.id === pkgId);
    if (!targetPkg) return;
    const isNowHidden = !targetPkg.isHidden;
    const updated = packages.map(p => p.id === pkgId ? { ...p, isHidden: isNowHidden } : p);
    onUpdatePackages(updated);
    showToast(isNowHidden 
      ? (lang === 'bn' ? 'প্যাকেজটি লুকানো হয়েছে!' : 'Package is now hidden!') 
      : (lang === 'bn' ? 'প্যাকেজটি সক্রিয় করা হয়েছে!' : 'Package is now active & visible!'));
  };

  const handleDuplicatePackage = (pkg: HealthPackage) => {
    if (!onUpdatePackages) return;
    const clone: HealthPackage = {
      ...pkg,
      id: `pkg_${Date.now()}`,
      name: `${pkg.name} (Copy)`,
      isHidden: false
    };
    onUpdatePackages([clone, ...packages]);
    showToast(lang === 'bn' ? 'প্যাকেজের অনুলিপি তৈরি করা হয়েছে!' : 'Package duplicated successfully!');
  };

  // ==========================================
  // LAB HANDLERS
  // ==========================================
  const handleOpenAddLab = () => {
    setEditingLab(null);
    setIsLabModalOpen(true);
  };

  const handleOpenEditLab = (lab: LabPartner) => {
    setEditingLab(lab);
    setIsLabModalOpen(true);
  };

  const handleSaveLab = (labToSave: LabPartner, activeTestIds?: string[]) => {
    if (editingLab) {
      const updated = labs.map(l => l.id === labToSave.id ? labToSave : l);
      onUpdateLabs(updated);

      // If lab discount percent was changed or set, update active tests for this lab
      if (labToSave.discountPercent !== undefined && labToSave.discountPercent > 0) {
        const disc = labToSave.discountPercent;
        const updatedTests = tests.map(test => {
          const isHidden = (test.hiddenLabs || []).includes(labToSave.id);
          if (isHidden) return test;
          const reg = test.originalPriceByLab?.[labToSave.id] || test.originalPrice || test.price;
          const discounted = Math.round(reg * (1 - disc / 100));
          return {
            ...test,
            originalPriceByLab: {
              ...(test.originalPriceByLab || {}),
              [labToSave.id]: reg
            },
            priceByLab: {
              ...(test.priceByLab || {}),
              [labToSave.id]: discounted
            }
          };
        });
        onUpdateTests(updatedTests);
      }

      showToast(t.adminSaveSuccess);
    } else {
      // NEW Diagnostic Center created:
      // DO NOT auto-activate all tests!
      // Only tests explicitly chosen in activeTestIds (empty by default) will be active.
      const activeSet = new Set(activeTestIds || []);
      const disc = labToSave.discountPercent || 0;

      const updatedTests = tests.map(test => {
        const isCurrentActive = activeSet.has(test.id);
        const currentHidden = test.hiddenLabs || [];
        if (isCurrentActive) {
          const reg = test.originalPriceByLab?.[labToSave.id] || test.originalPrice || test.price;
          const discounted = disc > 0 ? Math.round(reg * (1 - disc / 100)) : (test.priceByLab?.[labToSave.id] || test.price);
          return {
            ...test,
            hiddenLabs: currentHidden.filter(id => id !== labToSave.id),
            originalPriceByLab: {
              ...(test.originalPriceByLab || {}),
              [labToSave.id]: reg
            },
            priceByLab: {
              ...(test.priceByLab || {}),
              [labToSave.id]: discounted
            }
          };
        } else {
          // Deactivated/Inactive for this newly created diagnostic center
          return {
            ...test,
            hiddenLabs: currentHidden.includes(labToSave.id) ? currentHidden : [...currentHidden, labToSave.id]
          };
        }
      });
      onUpdateTests(updatedTests);

      // Packages: Also inactive by default for the new diagnostic center
      if (onUpdatePackages && packages) {
        const updatedPackages = packages.map(pkg => {
          const currentHidden = pkg.hiddenLabs || [];
          return {
            ...pkg,
            hiddenLabs: currentHidden.includes(labToSave.id) ? currentHidden : [...currentHidden, labToSave.id]
          };
        });
        onUpdatePackages(updatedPackages);
      }

      onUpdateLabs([...labs, labToSave]);
      showToast(lang === 'bn' 
        ? `নতুন সেন্টার "${labToSave.name}" সফলভাবে যুক্ত হয়েছে (টেস্টসমূহ ডিফল্টভাবে ইনঅ্যাক্টিভ রাখা হয়েছে)!` 
        : `New center "${labToSave.name}" added successfully (tests inactive by default)!`
      );
    }
    setIsLabModalOpen(false);
    setEditingLab(null);
  };

  const handleToggleHideLab = (labId: string) => {
    const targetLab = labs.find(l => l.id === labId);
    if (!targetLab) return;
    const isNowHidden = !targetLab.isHidden;
    const updated = labs.map(l => l.id === labId ? { ...l, isHidden: isNowHidden } : l);
    onUpdateLabs(updated);
    showToast(isNowHidden ? t.adminHideLabSuccess : t.adminUnhideLabSuccess);
  };

  const handleReorderLab = (labId: string, direction: 'up' | 'down') => {
    const index = labs.findIndex(l => l.id === labId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= labs.length) return;

    const updated = [...labs];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Update order indexes
    const reordered = updated.map((l, i) => ({ ...l, order: i + 1 }));
    onUpdateLabs(reordered);
    showToast(lang === 'bn' ? `"${temp.name}" সেন্টারের ক্রম পরিবর্তন করা হয়েছে!` : `Diagnostic center "${temp.name}" moved ${direction}!`);
  };

  const handleResetDefaultLabs = () => {
    const defaultLabs = getLabs(lang);
    onUpdateLabs(defaultLabs);
    showToast(lang === 'bn' ? 'ডিফল্ট সেন্টারের তালিকা পুনঃস্থাপন করা হয়েছে!' : 'Default diagnostic centers list restored!');
  };

  // ==========================================
  // ORDER HANDLERS
  // ==========================================
  const handleOpenAddOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleOpenEditOrder = (order: BookingHistoryItem) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleSaveOrder = (orderToSave: BookingHistoryItem) => {
    if (editingOrder) {
      const updated = bookings.map(b => b.id === orderToSave.id ? orderToSave : b);
      onUpdateBookings(updated);
      if (selectedOrderForDetails?.id === orderToSave.id) {
        setSelectedOrderForDetails(orderToSave);
      }
      showToast(t.adminSaveSuccess);
    } else {
      onUpdateBookings([orderToSave, ...bookings]);
      showToast("New manual order created successfully!");
    }
    setIsOrderModalOpen(false);
    setEditingOrder(null);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: BookingStatus) => {
    const updated = bookings.map(b => b.id === orderId ? { ...b, status: newStatus } : b);
    onUpdateBookings(updated);
    if (selectedOrderForDetails?.id === orderId) {
      setSelectedOrderForDetails({ ...selectedOrderForDetails, status: newStatus });
    }
    showToast(`Order #${orderId} status changed to ${newStatus}`);
  };

  // ==========================================
  // SERVICE HANDLERS (CMS)
  // ==========================================
  const handleOpenAddService = () => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (serviceToSave: ServiceItem) => {
    const currentServices = siteSettings.services || [];
    let updatedServices: ServiceItem[];
    if (editingService) {
      updatedServices = currentServices.map(s => s.id === serviceToSave.id ? serviceToSave : s);
      showToast(t.adminSaveSuccess);
    } else {
      updatedServices = [serviceToSave, ...currentServices];
      showToast("New service added successfully!");
    }
    const updatedSettings = { ...siteSettings, services: updatedServices };
    onUpdateSiteSettings(updatedSettings);
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const handleToggleServiceActive = (serviceId: string) => {
    const currentServices = siteSettings.services || [];
    const updatedServices = currentServices.map(s => {
      if (s.id === serviceId) {
        const nextState = s.isActive === false ? true : false;
        showToast(nextState ? "Service is now visible on website!" : "Service is hidden from website!");
        return { ...s, isActive: nextState };
      }
      return s;
    });
    onUpdateSiteSettings({ ...siteSettings, services: updatedServices });
  };

  // ==========================================
  // DELETE HANDLER
  // ==========================================
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (!isSuperAdmin) {
      showToast(lang === 'bn' ? 'স্টাফ অ্যাকাউন্টে কোনো কিছু মুছে ফেলার (Delete) অনুমতি নেই!' : 'Staff accounts are strictly prohibited from deleting any records!');
      setDeleteTarget(null);
      return;
    }

    if (deleteTarget.type === 'test') {
      const updated = tests.filter(t => t.id !== deleteTarget.id);
      onUpdateTests(updated);
      showToast(t.adminDeleteSuccess);
    } else if (deleteTarget.type === 'package') {
      if (onUpdatePackages) {
        const updated = packages.filter(p => p.id !== deleteTarget.id);
        onUpdatePackages(updated);
        showToast(lang === 'bn' ? 'প্যাকেজটি সফলভাবে মুছে ফেলা হয়েছে!' : 'Package deleted successfully!');
      }
    } else if (deleteTarget.type === 'category') {
      if (onUpdateCategories) {
        const updated = categories.filter(c => c.id !== deleteTarget.id);
        onUpdateCategories(updated);
        showToast(lang === 'bn' ? 'ক্যাটেগরি সফলভাবে মুছে ফেলা হয়েছে!' : 'Category deleted successfully!');
      }
    } else if (deleteTarget.type === 'lab') {
      const updated = labs.filter(l => l.id !== deleteTarget.id);
      onUpdateLabs(updated);
      showToast(t.adminDeleteSuccess);
    } else if (deleteTarget.type === 'order') {
      const updated = bookings.filter(b => b.id !== deleteTarget.id);
      onUpdateBookings(updated);
      if (selectedOrderForDetails?.id === deleteTarget.id) {
        setSelectedOrderForDetails(null);
      }
      showToast(t.adminDeleteSuccess);
    } else if (deleteTarget.type === 'service') {
      const updatedServices = (siteSettings.services || []).filter(s => s.id !== deleteTarget.id);
      onUpdateSiteSettings({ ...siteSettings, services: updatedServices });
      showToast(t.adminDeleteSuccess);
    }
    setDeleteTarget(null);
  };

  // Filter bookings based on logged-in staff role and assigned area
  const visibleBookings = filterOrdersForStaff(bookings, currentStaff);
  const pendingCount = visibleBookings.filter(b => b.status === 'pending').length;

  const NavButton = ({ 
    id, 
    icon: Icon, 
    label, 
    badge 
  }: { 
    id: typeof activeTab; 
    icon: any; 
    label: string; 
    badge?: number;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
        activeTab === id
          ? 'bg-slate-900 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={17} />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {badge !== undefined && badge > 0 && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === id ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
          }`}>
            {badge}
          </span>
        )}
        {activeTab === id && <ChevronRight size={14} className="opacity-60" />}
      </div>
    </button>
  );

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
            <Check size={13} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Return to Main Website"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Customer View</span>
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                LH
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block leading-none">LabHome BD</span>
                <span className="text-[10px] font-semibold text-emerald-600">
                  {isSuperAdmin ? 'Super Admin Portal' : `${currentStaff?.name} (${currentStaff?.role?.toUpperCase()})`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Active User Role Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              {isSuperAdmin ? (
                <>
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Super Admin</span>
                </>
              ) : (
                <>
                  <UserCheck size={14} className="text-purple-600" />
                  <span className="capitalize">{currentStaff?.role} ({currentStaff?.id})</span>
                </>
              )}
            </div>

            {onToggleLanguage && (
              <button
                onClick={onToggleLanguage}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
              >
                <Globe size={13} />
                <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setStoredCurrentStaff(null);
                onLogout();
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-100 cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Staff Restricted Mode Warning Banner */}
      {!isSuperAdmin && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-purple-800">
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 rounded-md font-bold text-[10px] uppercase border border-purple-400/30">
                {currentStaff?.role?.toUpperCase()} PORTAL
              </span>
              <span className="text-slate-200 text-xs">
                {currentStaff?.name}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 text-[11px] font-bold">
                📍 {lang === 'bn' ? 'নির্ধারিত এরিয়া:' : 'Assigned Area:'} {currentStaff?.assignedArea || (lang === 'bn' ? 'সকল এলাকা' : 'All Areas')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-200 font-mono">
              <Lock size={12} />
              <span>{lang === 'bn' ? `শুধুমাত্র আপনার এলাকার (${visibleBookings.length} টি) অর্ডার দৃশ্যমান` : `Showing your area (${visibleBookings.length}) orders`}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
        
        {/* Left Sidebar */}
        <aside className="md:col-span-1 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <NavButton id="overview" icon={LayoutDashboard} label="Dashboard" />
            
            {staffPermissions.canViewOrders && (
              <NavButton id="orders" icon={ShoppingBag} label={t.adminTotalOrders} badge={pendingCount} />
            )}

            {staffPermissions.canViewReports && (
              <NavButton id="reports" icon={BarChart3} label={lang === 'bn' ? 'রিপোর্ট ও অ্যানালিটিক্স' : 'Reports & Analytics'} />
            )}

            {staffPermissions.canViewTests && (
              <NavButton id="tests" icon={FlaskConical} label={t.adminManageTests} />
            )}

            {isSuperAdmin && (
              <>
                <NavButton id="packages" icon={Layers} label={lang === 'bn' ? 'ডায়াগনস্টিক প্যাকেজ' : 'Diagnostic Packages'} badge={packages.length} />
                <NavButton id="categories" icon={Tag} label={lang === 'bn' ? 'ক্যাটেগরি ব্যবস্থাপনা' : 'Test Categories'} badge={categories.length} />
              </>
            )}

            {staffPermissions.canViewLabs && (
              <NavButton id="labs" icon={Building2} label="Centers & Fees" />
            )}

            <NavButton 
              id="doctors" 
              icon={Stethoscope} 
              label={lang === 'bn' ? 'ডাক্তার কন্সালটেন্সি' : 'Doctors & Tele-care'} 
              badge={activeDoctorsList.length} 
            />

            {(isSuperAdmin || staffPermissions.canManageSlots) && (
              <NavButton id="slots" icon={CalendarClock} label={lang === 'bn' ? 'তারিখ ও স্লট কাস্টমাইজ' : 'Date & Slot Manager'} />
            )}

            {(isSuperAdmin || staffPermissions.canManageUsers) && (
              <NavButton id="staff" icon={Users} label={lang === 'bn' ? 'টিম ও ইউজার রোল' : 'Team & Staff Roles'} badge={staffUsers.length} />
            )}

            {isSuperAdmin && (
              <NavButton id="cms" icon={Globe} label={t.adminSiteCMS} />
            )}

            {(isSuperAdmin || staffPermissions.canManageSettings) && (
              <NavButton id="payments" icon={CreditCard} label={lang === 'bn' ? 'পেমেন্ট গেটওয়ে ও API' : 'Payment & Gateway APIs'} />
            )}

            {staffPermissions.canViewCustomers && (
              <NavButton id="customers" icon={Users} label={t.adminCustomers} badge={patients.length} />
            )}

            {(isSuperAdmin || staffPermissions.canManageSettings) && (
              <NavButton id="settings" icon={Settings} label={t.adminSettings} />
            )}
          </div>


          {/* Quick Stats Widget */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-2.5">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-400">Database Status</span>
            <div className="flex justify-between text-slate-600">
              <span>Tests Catalog:</span>
              <strong className="text-slate-900">{tests.length} tests</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Health Packages:</span>
              <strong className="text-slate-900">{packages.length} packages</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Test Categories:</span>
              <strong className="text-slate-900">{categories.length} categories</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Partner Labs:</span>
              <strong className="text-slate-900">{labs.length} labs</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{isSuperAdmin ? 'Total Orders:' : 'My Area Orders:'}</span>
              <strong className="text-slate-900">{visibleBookings.length}</strong>
            </div>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="md:col-span-4">
          {activeTab === 'overview' && (
            <AdminOverview 
              lang={lang}
              tests={tests}
              labs={labs}
              bookings={visibleBookings}
              canViewRevenue={isSuperAdmin || staffPermissions.canViewRevenue !== false}
              currentStaff={currentStaff}
              onNavigateTab={setActiveTab}
              onOpenAddTest={handleOpenAddTest}
              onOpenAddLab={handleOpenAddLab}
              onOpenAddOrder={handleOpenAddOrder}
              onSelectOrder={setSelectedOrderForDetails}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders 
              lang={lang}
              bookings={visibleBookings}
              labs={labs}
              onUpdateStatus={handleUpdateOrderStatus}
              onSelectOrder={setSelectedOrderForDetails}
              onOpenEditOrder={handleOpenEditOrder}
              onOpenAddOrder={handleOpenAddOrder}
              onOpenDeleteOrder={(order) => setDeleteTarget({ type: 'order', id: order.id, name: `Order #${order.id} (${order.customerName || 'Patient'})` })}
            />
          )}

          {activeTab === 'reports' && (
            <AdminReports
              lang={lang}
              bookings={visibleBookings}
              labs={labs}
              onSelectOrder={setSelectedOrderForDetails}
            />
          )}

          {activeTab === 'tests' && (
            <AdminTests 
              lang={lang}
              tests={tests}
              labs={labs}
              categories={categories}
              onOpenAddTest={handleOpenAddTest}
              onOpenEditTest={handleOpenEditTest}
              onToggleHideTest={handleToggleHideTest}
              onDuplicateTest={handleDuplicateTest}
              onOpenDeleteTest={(test) => setDeleteTarget({ type: 'test', id: test.id, name: test.name })}
              onQuickUpdateOrderCount={handleQuickUpdateTestOrderCount}
            />
          )}

          {activeTab === 'packages' && (
            <AdminPackages 
              lang={lang}
              packages={packages}
              labs={labs}
              categories={categories}
              onOpenAddPackage={handleOpenAddPackage}
              onOpenEditPackage={handleOpenEditPackage}
              onToggleHidePackage={handleToggleHidePackage}
              onDuplicatePackage={handleDuplicatePackage}
              onOpenDeletePackage={(pkg) => setDeleteTarget({ type: 'package', id: pkg.id, name: pkg.name })}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategories 
              lang={lang}
              categories={categories}
              tests={tests}
              packages={packages}
              onOpenAddCategory={handleOpenAddCategory}
              onOpenEditCategory={handleOpenEditCategory}
              onToggleHideCategory={handleToggleHideCategory}
              onOpenDeleteCategory={(cat) => setDeleteTarget({ type: 'category', id: cat.id, name: `${cat.name} ${cat.nameBn ? `(${cat.nameBn})` : ''}` })}
              onReorderCategory={handleReorderCategory}
              onResetDefaultCategories={handleResetDefaultCategories}
            />
          )}

          {activeTab === 'labs' && (
            <AdminLabs 
              lang={lang}
              labs={labs}
              tests={tests}
              onOpenAddLab={handleOpenAddLab}
              onOpenEditLab={handleOpenEditLab}
              onToggleHideLab={handleToggleHideLab}
              onOpenDeleteLab={(lab) => setDeleteTarget({ type: 'lab', id: lab.id, name: lab.name })}
              onReorderLab={handleReorderLab}
              onResetDefaultLabs={handleResetDefaultLabs}
              onManageLabTests={(lab) => setManagingLabTests(lab)}
            />
          )}

          {activeTab === 'doctors' && (
            <AdminDoctors 
              lang={lang}
              doctors={activeDoctorsList}
              onUpdateDoctors={handleUpdateDoctorsList}
              onOpenPrescriptionViewer={onOpenPrescriptionViewer}
              onJoinVideoAsDoctor={onJoinVideoAsDoctor}
            />
          )}

          {activeTab === 'slots' && (
            <AdminSlots 
              lang={lang}
              config={dateSlotConfig}
              onUpdateConfig={handleUpdateDateSlotConfig}
              showToast={showToast}
            />
          )}

          {activeTab === 'staff' && (
            <AdminStaffUsers 
              lang={lang}
              staffUsers={staffUsers}
              onUpdateStaffUsers={handleUpdateStaffUsers}
              showToast={showToast}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomers 
              lang={lang}
              patients={patients}
              bookings={bookings}
              onSelectCustomerOrders={(phone) => {
                setActiveTab('orders');
              }}
            />
          )}

          {activeTab === 'cms' && (
            <AdminCMS 
              lang={lang}
              siteSettings={siteSettings}
              onUpdateSiteSettings={onUpdateSiteSettings}
              onOpenAddService={handleOpenAddService}
              onOpenEditService={handleOpenEditService}
              onDeleteService={(srv) => setDeleteTarget({ type: 'service', id: srv.id, name: srv.title })}
              onToggleServiceActive={handleToggleServiceActive}
              showToast={showToast}
            />
          )}

          {activeTab === 'payments' && (
            <AdminPaymentSettings 
              lang={lang}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings 
              lang={lang}
              onResetAllData={() => {
                onResetAllData();
                showToast(t.adminResetSuccess);
              }}
              onDataRestored={() => {
                showToast("Data restored successfully!");
              }}
            />
          )}
        </main>
      </div>

      {/* ========================================== */}
      {/* ALL ADMIN MODALS                           */}
      {/* ========================================== */}
      <TestFormModal 
        lang={lang}
        isOpen={isTestModalOpen}
        onClose={() => {
          setIsTestModalOpen(false);
          setEditingTest(null);
        }}
        onSave={handleSaveTest}
        editingTest={editingTest}
        labs={labs}
        categories={categories}
        onAddNewCategory={handleQuickAddCategory}
      />

      <PackageFormModal 
        lang={lang}
        isOpen={isPackageModalOpen}
        onClose={() => {
          setIsPackageModalOpen(false);
          setEditingPackage(null);
        }}
        onSave={handleSavePackage}
        editingPackage={editingPackage}
        labs={labs}
        tests={tests}
        categories={categories}
        onAddNewCategory={handleQuickAddCategory}
      />

      <CategoryFormModal 
        lang={lang}
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
        existingCategoriesCount={categories.length}
      />

      <LabFormModal 
        lang={lang}
        isOpen={isLabModalOpen}
        onClose={() => {
          setIsLabModalOpen(false);
          setEditingLab(null);
        }}
        onSave={handleSaveLab}
        editingLab={editingLab}
        tests={tests}
      />

      <LabTestsManagerModal 
        lang={lang}
        isOpen={!!managingLabTests}
        onClose={() => setManagingLabTests(null)}
        lab={managingLabTests}
        tests={tests}
        onUpdateTests={(updated) => {
          onUpdateTests(updated);
          showToast(lang === 'bn' ? 'সেন্টারের টেস্ট অ্যাক্টিভেশন আপডেট করা হয়েছে!' : 'Center test activations updated!');
        }}
      />

      <OrderFormModal 
        lang={lang}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveOrder}
        editingOrder={editingOrder}
        labs={labs}
        tests={tests}
      />

      <ServiceFormModal 
        lang={lang}
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        editingService={editingService}
      />

      <OrderDetailsModal 
        lang={lang}
        order={selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
        onUpdateStatus={handleUpdateOrderStatus}
      />


      <DeleteConfirmModal 
        lang={lang}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={t.adminConfirmDelete}
        description={`Are you sure you want to permanently remove "${deleteTarget?.name}"?`}
      />
    </div>
  );
};
