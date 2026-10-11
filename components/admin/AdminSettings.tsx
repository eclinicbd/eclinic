import React, { useRef, useState } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  Download, 
  Upload, 
  FileJson, 
  Check, 
  AlertTriangle,
  Server,
  HelpCircle,
  Database,
  Lock,
  KeyRound,
  ShieldCheck,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../Button';
import { 
  exportAllDataBackup, 
  importAllDataBackup, 
  getStoredAdminCredentials, 
  saveStoredAdminCredentials 
} from '../../services/dataStorage';

interface AdminSettingsProps {
  lang: Language;
  onResetAllData?: () => void;
  onDataRestored: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  lang,
  onDataRestored
}) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];

  // Admin Password Management State
  const [adminUsername, setAdminUsername] = useState(() => getStoredAdminCredentials().username);
  const [adminPassword, setAdminPassword] = useState(() => getStoredAdminCredentials().password);
  const [showPass, setShowPass] = useState(false);
  const [credSaveSuccess, setCredSaveSuccess] = useState(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) return;

    saveStoredAdminCredentials({
      username: adminUsername.trim(),
      password: adminPassword.trim()
    });
    setCredSaveSuccess(true);
    setTimeout(() => setCredSaveSuccess(false), 3000);
  };

  // Download JSON Backup
  const handleDownloadBackup = () => {
    const backupData = exportAllDataBackup();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `labhome_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Upload and Restore JSON Backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = importAllDataBackup(json);
        if (success) {
          setImportStatus('success');
          onDataRestored();
          setTimeout(() => setImportStatus('idle'), 4000);
        } else {
          setImportStatus('error');
        }
      } catch (err) {
        console.error("JSON parse error:", err);
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{t.adminSettings}</h1>
        <p className="text-slate-500 text-xs mt-1">
          {lang === 'bn' 
            ? 'ডেটা ব্যাকআপ ডাউনলোড করুন এবং সংরক্ষিত ব্যাকআপ ফাইল থেকে নিরাপদভাবে রিস্টোর করুন।' 
            : 'Download data backup (.json) and safely restore from your backup file.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Export Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <FileJson size={24} />
            </div>
            <h2 className="font-bold text-slate-900 text-base mb-1">{t.adminExportJson}</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              আপনার সমস্ত টেস্টের মূল্য তালিকা, ডায়াগনস্টিক সেন্টারের তথ্য এবং সব বুকিং অর্ডার একটি JSON ফাইল হিসেবে ডাউনলোড করে সংরক্ষণ করে রাখুন।
            </p>
          </div>
          <Button onClick={handleDownloadBackup} className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5">
            <Download size={15} /> Download Backup (.json)
          </Button>
        </div>

        {/* Restore from Backup Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Upload size={24} />
            </div>
            <h2 className="font-bold text-slate-900 text-base mb-1">{t.adminImportJson}</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              পূর্বে ডাউনলোড করা কোনো JSON ব্যাকআপ ফাইল আপলোড করে এক ক্লিকে সম্পূর্ণ ডেটা রিস্টোর করুন।
            </p>
            {importStatus === 'success' && (
              <div className="mb-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                <Check size={16} /> ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে!
              </div>
            )}
            {importStatus === 'error' && (
              <div className="mb-3 p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-rose-200">
                <AlertTriangle size={16} /> ফাইলের ফরম্যাটটি সঠিক নয়। অনুগ্রহ করে সঠিক JSON ফাইল সিলেক্ট করুন।
              </div>
            )}
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".json,application/json" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 border-slate-300"
            >
              <Upload size={15} /> Select JSON Backup File
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Security & Password Management Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              {lang === 'bn' ? 'অ্যাডমিন পোর্টাল সিকিউরিটি ও পাসওয়ার্ড' : 'Admin Portal Security & Password'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'bn' 
                ? 'পাবলিক ডোমেইনে অ্যাডমিন ড্যাশবোর্ডের অননুমোদিত অ্যাক্সেস ঠেকাতে এখান থেকে আপনার অ্যাডমিন ইউজারনেম ও পাসওয়ার্ড পরিবর্তন করুন।' 
                : 'Protect the admin panel from unauthorized access by setting a custom administrator username and password.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCredentials} className="mt-4 pt-4 border-t border-slate-100 max-w-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'bn' ? 'অ্যাডমিন ইউজারনেম' : 'Admin Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  required
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড' : 'Admin Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {credSaveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <Check size={14} />
                  {lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে!' : 'Password updated successfully!'}
                </span>
              )}
            </div>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5"
            >
              <KeyRound size={14} />
              {lang === 'bn' ? 'তথ্য সংরক্ষণ করুন' : 'Save Security Settings'}
            </Button>
          </div>
        </form>
      </div>


    </div>
  );
};
