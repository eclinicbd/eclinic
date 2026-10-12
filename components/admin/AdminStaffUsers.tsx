import React, { useState } from 'react';
import { Language, StaffUser, StaffRole, StaffPermissions } from '../../types';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  KeyRound, 
  Phone, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Stethoscope, 
  Truck, 
  ClipboardList, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sliders,
  BadgePercent,
  MapPin
} from 'lucide-react';
import { ROLE_DEFAULT_PERMISSIONS, DEFAULT_STAFF_USERS, POPULAR_AREAS } from '../../services/dataStorage';

interface AdminStaffUsersProps {
  lang: Language;
  staffUsers: StaffUser[];
  onUpdateStaffUsers: (users: StaffUser[]) => void;
  showToast: (msg: string) => void;
}

export const AdminStaffUsers: React.FC<AdminStaffUsersProps> = ({
  lang,
  staffUsers,
  onUpdateStaffUsers,
  showToast
}) => {
  const isBn = lang === 'bn';
  const [filterRole, setFilterRole] = useState<StaffRole | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<StaffRole>('phlebotomist');
  const [phone, setPhone] = useState('');
  const [assignedArea, setAssignedArea] = useState<string>('All Areas');
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<StaffPermissions>(ROLE_DEFAULT_PERMISSIONS.phlebotomist);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setName('');
    const randomNum = Math.floor(100 + Math.random() * 900);
    setEmailOrUsername(`staff_${randomNum}`);
    setPassword('staff123');
    setRole('phlebotomist');
    setPhone('01700000000');
    setAssignedArea('Dhanmondi');
    setIsActive(true);
    setPermissions(ROLE_DEFAULT_PERMISSIONS.phlebotomist);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffUser) => {
    setEditingStaff(staff);
    setName(staff.name);
    setEmailOrUsername(staff.emailOrUsername);
    setPassword(staff.password);
    setRole(staff.role);
    setPhone(staff.phone);
    setAssignedArea(staff.assignedArea || 'All Areas');
    setIsActive(staff.isActive);
    setPermissions(staff.permissions || ROLE_DEFAULT_PERMISSIONS[staff.role]);
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    // Apply template permissions for chosen role
    setPermissions(ROLE_DEFAULT_PERMISSIONS[newRole] || ROLE_DEFAULT_PERMISSIONS.custom);
  };

  const handlePermissionToggle = (key: keyof StaffPermissions) => {
    // Prevent staff from enabling delete or master catalog edits
    if (key === 'canDeleteTests' || key === 'canDeleteOrders' || key === 'canManageSettings' || key === 'canManageUsers') {
      showToast(isBn ? 'নিরাপত্তার স্বার্থে এই ক্ষমতা শুধুমাত্র সুপার অ্যাডমিনের জন্য সংরক্ষিত!' : 'For security, this permission is strictly reserved for Super Admin only!');
      return;
    }
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !emailOrUsername.trim() || !password.trim()) {
      showToast(isBn ? 'অনুগ্রহ করে সকল আবশ্যক তথ্য পূরণ করুন!' : 'Please fill all required fields!');
      return;
    }

    if (editingStaff) {
      const updatedList = staffUsers.map(s => 
        s.id === editingStaff.id 
          ? {
              ...s,
              name: name.trim(),
              emailOrUsername: emailOrUsername.trim().toLowerCase(),
              password: password.trim(),
              role,
              phone: phone.trim(),
              assignedArea: assignedArea.trim() || 'All Areas',
              isActive,
              permissions: {
                ...permissions,
                canEditTests: false,
                canDeleteTests: false,
                canManageSettings: false,
                canManageUsers: false,
                canDeleteOrders: false
              }
            }
          : s
      );
      onUpdateStaffUsers(updatedList);
      showToast(isBn ? `স্টাফ ইউজার "${name}" সফলভাবে আপডেট করা হয়েছে!` : `Staff user "${name}" updated successfully!`);
    } else {
      // Generate standard ID based on role
      const prefix = role === 'manager' ? 'MGR' : role === 'phlebotomist' ? 'PHLEB' : role === 'nurse' ? 'NURSE' : role === 'delivery' ? 'DELIV' : 'STF';
      const newId = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

      const newStaff: StaffUser = {
        id: newId,
        name: name.trim(),
        emailOrUsername: emailOrUsername.trim().toLowerCase(),
        password: password.trim(),
        role,
        phone: phone.trim(),
        assignedArea: assignedArea.trim() || 'All Areas',
        isActive,
        createdAt: new Date().toISOString(),
        permissions: {
          ...permissions,
          canEditTests: false,
          canDeleteTests: false,
          canManageSettings: false,
          canManageUsers: false,
          canDeleteOrders: false
        }
      };

      onUpdateStaffUsers([newStaff, ...staffUsers]);
      showToast(isBn ? `নতুন স্টাফ অ্যাকাউন্ট (${newId}) তৈরি করা হয়েছে!` : `New staff account (${newId}) created successfully!`);
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = (staffId: string) => {
    const updated = staffUsers.map(s => s.id === staffId ? { ...s, isActive: !s.isActive } : s);
    onUpdateStaffUsers(updated);
    showToast(isBn ? 'স্টাফ অ্যাকাউন্টের স্ট্যাটাস পরিবর্তন হয়েছে!' : 'Staff account status toggled!');
  };

  const handleDeleteStaff = (staffId: string, staffName: string) => {
    if (window.confirm(isBn ? `আপনি কি নিশ্চিত যে "${staffName}" অ্যাকাউন্টটি মুছে ফেলতে চান?` : `Are you sure you want to delete staff account "${staffName}"?`)) {
      const updated = staffUsers.filter(s => s.id !== staffId);
      onUpdateStaffUsers(updated);
      showToast(isBn ? 'স্টাফ অ্যাকাউন্টটি মুছে ফেলা হয়েছে!' : 'Staff account deleted successfully!');
    }
  };

  const handleResetDefaultStaff = () => {
    if (window.confirm(isBn ? 'সকল স্টাফ তালিকা ডিফল্ট ডেমোতে রিসেট করতে চান?' : 'Reset staff users to default demo accounts?')) {
      onUpdateStaffUsers(DEFAULT_STAFF_USERS);
      showToast(isBn ? 'ডিফল্ট স্টাফ তালিকা সফলভাবে পুনঃস্থাপন করা হয়েছে!' : 'Default staff accounts restored!');
    }
  };

  const getRoleIconAndBadge = (r: StaffRole) => {
    switch (r) {
      case 'manager':
        return {
          icon: <ShieldCheck size={14} className="text-purple-600" />,
          label: isBn ? 'ম্যানেজার' : 'Manager',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      case 'phlebotomist':
        return {
          icon: <ClipboardList size={14} className="text-rose-600" />,
          label: isBn ? 'ফ্লেবোটোমিস্ট' : 'Phlebotomist',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'nurse':
        return {
          icon: <Stethoscope size={14} className="text-teal-600" />,
          label: isBn ? 'নার্স' : 'Nurse',
          badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
        };
      case 'delivery':
        return {
          icon: <Truck size={14} className="text-blue-600" />,
          label: isBn ? 'রিপোর্ট ডেলিভারি' : 'Report Delivery',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      default:
        return {
          icon: <Users size={14} className="text-slate-600" />,
          label: isBn ? 'কাস্টম রোল' : 'Custom Staff',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const filteredStaff = staffUsers.filter(s => {
    const matchesRole = filterRole === 'all' || s.role === filterRole;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.emailOrUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {isBn ? 'টিম ও ইউজার রোল ব্যবস্থাপনা (Staff & Role Access)' : 'Team & Staff Role Management'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn 
                  ? 'ম্যানেজার, ফ্লেবোটোমিস্ট, নার্স ও ডেলিভারি স্টাফ আইডি তৈরি ও কে কি দেখতে পারবে তা নিয়ন্ত্রণ করুন' 
                  : 'Create & manage staff logins (Manager, Phlebotomist, Nurse, Delivery) with strict read-only/action rules'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaultStaff}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="Restore default demo staff"
          >
            <RotateCcw size={14} />
            <span>{isBn ? 'ডিফল্ট রিসেট' : 'Reset Staff'}</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            <span>{isBn ? 'নতুন স্টাফ যোগ করুন' : 'Add New Staff'}</span>
          </button>
        </div>
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['manager', 'phlebotomist', 'nurse', 'delivery'] as const).map(r => {
          const count = staffUsers.filter(s => s.role === r && s.isActive).length;
          const badge = getRoleIconAndBadge(r);
          return (
            <div 
              key={r}
              onClick={() => setFilterRole(filterRole === r ? 'all' : r)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                filterRole === r 
                  ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-400/20' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-xl bg-slate-50">{badge.icon}</span>
                <span className="text-lg font-black text-slate-900">{count}</span>
              </div>
              <p className="font-bold text-xs text-slate-800">{badge.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {r === 'manager' && (isBn ? 'অর্ডার ও রিপোর্ট পর্যবেক্ষণ' : 'Order/Report Supervisor')}
                {r === 'phlebotomist' && (isBn ? 'রক্ত ও স্যাম্পল কালেকশন' : 'Sample Collector')}
                {r === 'nurse' && (isBn ? 'হোম কেয়ার ও নার্সিং' : 'Home Health Care')}
                {r === 'delivery' && (isBn ? 'রিপোর্ট হোম ডেলিভারি' : 'Physical Report Delivery')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Security Rule Card */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
        <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold">
            {isBn ? 'কঠোর নিরাপত্তা ও সীমাবদ্ধ এক্সেস নীতি (Strict Staff Restriction Policy):' : 'Strict Staff Security & Role Restriction Policy:'}
          </p>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            {isBn 
              ? 'স্টাফরা (ম্যানেজার, ফ্লেবোটোমিস্ট, নার্স, ডেলিভারি) কেবলমাত্র তাদের নির্ধারিত অর্ডার ও রোগীদের তথ্য দেখতে এবং স্ট্যাটাস আপডেট করতে পারবে। তারা কোনো টেস্ট, প্যাকেজ, ল্যাব, প্রাইস বা সাইট সেটিংস এডিট বা ডিলিট করতে পারবে না।' 
              : 'All staff users have restricted read/action access. They CANNOT edit test pricing, lab partners, categories, or delete any record. Only Super Admin has full master editing & deletion control.'}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'manager', 'phlebotomist', 'nurse', 'delivery'] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterRole === r
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? (isBn ? 'সকল স্টাফ' : 'All Staff') : getRoleIconAndBadge(r).label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={isBn ? 'নাম, আইডি বা ফোন দিয়ে খুঁজুন...' : 'Search by name, ID or phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Users size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 font-semibold text-xs">
              {isBn ? 'কোনো স্টাফ পাওয়া যায়নি' : 'No staff members found matching criteria'}
            </p>
          </div>
        ) : (
          filteredStaff.map(staff => {
            const badge = getRoleIconAndBadge(staff.role);
            return (
              <div
                key={staff.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                  staff.isActive ? 'border-slate-200 hover:border-slate-300' : 'border-dashed border-slate-300 opacity-60 bg-slate-50/50'
                }`}
              >
                <div>
                  {/* Top Bar with Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {staff.id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.badgeClass}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        staff.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {staff.isActive ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'বন্ধ' : 'Inactive')}
                      </span>
                    </div>
                  </div>

                  {/* Staff Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                      {staff.avatar ? (
                        <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                      ) : (
                        staff.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{staff.name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Username/ID: <strong className="text-slate-700">{staff.emailOrUsername}</strong>
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {staff.phone}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100 font-semibold w-fit">
                        <MapPin size={11} className="text-primary shrink-0" />
                        <span>{isBn ? 'এরিয়া:' : 'Area:'}</span>
                        <span className="font-bold text-primary">{staff.assignedArea || (isBn ? 'সকল এলাকা' : 'All Areas')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Chips */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600 font-semibold">
                      <span>{isBn ? 'অর্ডার পর্যবেক্ষণ:' : 'View Orders:'}</span>
                      <span className={staff.permissions?.canViewOrders ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {staff.permissions?.canViewOrders ? '✓ Yes' : '✕ No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 font-semibold">
                      <span>{isBn ? 'স্ট্যাটাস আপডেট:' : 'Update Status:'}</span>
                      <span className={staff.permissions?.canUpdateOrderStatus ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {staff.permissions?.canUpdateOrderStatus ? '✓ Yes' : '✕ No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 font-semibold">
                      <span>{isBn ? 'এডিট বা ডিলিট ক্ষমতা:' : 'Edit & Delete Access:'}</span>
                      <span className="text-rose-600 font-black">
                        ✕ Blocked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Pass: ••••••••
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(staff.id)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        staff.isActive ? 'text-slate-500 hover:bg-slate-100' : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={staff.isActive ? "Deactivate account" : "Activate account"}
                    >
                      {staff.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(staff)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit staff details & permissions"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff.id, staff.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete staff"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Staff Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/10 rounded-lg">
                  <Users size={18} />
                </span>
                <h2 className="font-bold text-base">
                  {editingStaff 
                    ? (isBn ? `স্টাফ ইউজার সম্পাদনা (${editingStaff.id})` : `Edit Staff User (${editingStaff.id})`) 
                    : (isBn ? 'নতুন স্টাফ ইউজার তৈরি করুন' : 'Create New Staff Account')}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'স্টাফের পূর্ণ নাম' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBn ? 'যেমন: মো: রফিকুল ইসলাম' : 'e.g. Md. Rafiqul Islam'}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'পদবি / রোল (Role)' : 'Designation / Role'} *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="manager">{isBn ? 'Manager (ম্যানেজার)' : 'Manager'}</option>
                    <option value="phlebotomist">{isBn ? 'Phlebotomist (স্যাম্পল কালেক্টর)' : 'Phlebotomist'}</option>
                    <option value="nurse">{isBn ? 'Nurse (হোম কেয়ার নার্স)' : 'Nurse'}</option>
                    <option value="delivery">{isBn ? 'Report Delivery (ডেলিভারি ম্যান)' : 'Report Delivery'}</option>
                    <option value="custom">{isBn ? 'Custom Staff (অন্যান্য)' : 'Custom Staff'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'লগইন ইউজারনেম / স্টাফ আইডি' : 'Login Username / Staff ID'} *
                  </label>
                  <input
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="phleb_karim or 01700..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'লগইন পাসওয়ার্ড / পিন' : 'Login Password / PIN'} *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 pr-9 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBn ? 'মোবাইল নাম্বার' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-primary" />
                      <span>{isBn ? 'নির্ধারিত সার্ভিস এরিয়া' : 'Assigned Area'} *</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {isBn ? '(শুধু এই এলাকার অর্ডার দেখতে পাবে)' : '(Can only view this area)'}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={POPULAR_AREAS.includes(assignedArea) ? assignedArea : 'Custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'Custom') {
                          setAssignedArea(e.target.value);
                        }
                      }}
                      className="w-1/2 px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none bg-white cursor-pointer"
                    >
                      {POPULAR_AREAS.map(ar => (
                        <option key={ar} value={ar}>{ar}</option>
                      ))}
                      <option value="Custom">{isBn ? 'অন্যান্য / কাস্টম' : 'Custom Area'}</option>
                    </select>
                    <input
                      type="text"
                      value={assignedArea}
                      onChange={(e) => setAssignedArea(e.target.value)}
                      placeholder={isBn ? 'এরিয়া নাম' : 'Area name'}
                      className="w-1/2 px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-5">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    {isBn ? 'অ্যাকাউন্ট সক্রিয় রাখুন (Active)' : 'Account is Active'}
                  </label>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sliders size={16} className="text-purple-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    {isBn ? 'কাস্টম অনুমতি ও এক্সেস কন্ট্রোল (Role Permissions)' : 'Custom Role Permissions Matrix'}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  {isBn 
                    ? 'এই ইউজার কোন কোন তথ্য দেখতে বা আপডেট করতে পারবে তা নির্ধারণ করুন' 
                    : 'Specify what this staff role is allowed to view or update'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canViewOrders}
                      onChange={() => handlePermissionToggle('canViewOrders')}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span>{isBn ? 'অর্ডার তালিকা দেখতে পারবে' : 'Can View Orders'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canUpdateOrderStatus}
                      onChange={() => handlePermissionToggle('canUpdateOrderStatus')}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span>{isBn ? 'অর্ডার স্ট্যাটাস আপডেট করতে পারবে' : 'Can Update Order Status'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canViewCustomers}
                      onChange={() => handlePermissionToggle('canViewCustomers')}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span>{isBn ? 'রোগীর ঠিকানা ও ফোন দেখতে পারবে' : 'Can View Patient Contact/Address'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canViewReports}
                      onChange={() => handlePermissionToggle('canViewReports')}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span>{isBn ? 'রিপোর্ট / ইনভয়েস দেখতে পারবে' : 'Can View/Download Reports'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canViewTests}
                      onChange={() => handlePermissionToggle('canViewTests')}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span>{isBn ? 'টেস্ট ক্যাটালগ দেখতে পারবে (Read-only)' : 'Can View Test Catalog (Read-only)'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.assignedOnly || false}
                      onChange={() => handlePermissionToggle('assignedOnly')}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span>{isBn ? 'শুধুমাত্র নিজকে অ্যাসাইন করা কাজ দেখবে' : 'Assigned Tasks Only'}</span>
                  </label>
                </div>

                {/* Hard Locked Rules Notice */}
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-[11px] text-rose-800 font-semibold">
                  <ShieldAlert size={14} className="text-rose-600 shrink-0" />
                  <span>
                    {isBn 
                      ? 'লক নীতি: কোনো স্টাফ টেস্টের দাম, ল্যাব, ক্যাটেগরি বা কোনো অর্ডার ডিলিট বা মাস্টার এডিট করতে পারবে না।' 
                      : 'Lock Rule: Staff cannot edit catalog pricing, diagnostic centers, or delete records.'}
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Staff User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
