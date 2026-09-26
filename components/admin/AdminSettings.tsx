import React, { useRef, useState } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldAlert, 
  FileJson, 
  Check, 
  AlertTriangle,
  Server,
  HelpCircle,
  Database
} from 'lucide-react';
import { Button } from '../Button';
import { exportAllDataBackup, importAllDataBackup } from '../../services/dataStorage';

interface AdminSettingsProps {
  lang: Language;
  onResetAllData: () => void;
  onDataRestored: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  lang,
  onResetAllData,
  onDataRestored
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];

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
          ডেটা ব্যাকআপ ডাউনলোড করুন, ব্যাকআপ রিস্টোর করুন অথবা সিস্টেমের প্রাথমিক তথ্যে রিসেট করুন।
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

      {/* Danger Zone: Reset All Data */}
      <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-rose-900 text-base">Reset All Catalog & Order Data</h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              সিস্টেমের সমস্ত টেস্ট ক্যাটালগ, সেন্টার ও অর্ডার মুছে ফেলে প্রাথমিক ডিফল্ট তথ্যে ফিরিয়ে নেবে। এই কাজটি অপরিবর্তনীয়।
            </p>
            
            <div className="mt-4">
              {!showConfirmReset ? (
                <button 
                  onClick={() => setShowConfirmReset(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <RotateCcw size={14} /> Reset to Defaults
                </button>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-rose-900 font-semibold flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-600 flex-shrink-0" />
                    <span>আপনি কি নিশ্চিত সমস্ত তথ্য রিসেট করতে চান?</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowConfirmReset(false)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
                    >
                      না, বাতিল করুন
                    </button>
                    <button 
                      onClick={() => {
                        onResetAllData();
                        setShowConfirmReset(false);
                      }}
                      className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-sm"
                    >
                      হ্যাঁ, রিসেট করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
