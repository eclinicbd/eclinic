import React, { useState } from 'react';
import { LabPartner, TestPackage, Language } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { LabLogo } from '../LabLogo';
import { 
  Search, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Building2, 
  MapPin, 
  FlaskConical, 
  Filter, 
  X,
  Star,
  Tag,
  Award,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  RotateCcw,
  Check
} from 'lucide-react';
import { Button } from '../Button';

interface AdminLabsProps {
  lang: Language;
  labs: LabPartner[];
  tests: TestPackage[];
  onOpenAddLab: () => void;
  onOpenEditLab: (lab: LabPartner) => void;
  onToggleHideLab: (labId: string) => void;
  onOpenDeleteLab: (lab: LabPartner) => void;
  onReorderLab?: (labId: string, direction: 'up' | 'down') => void;
  onResetDefaultLabs?: () => void;
  onManageLabTests?: (lab: LabPartner) => void;
}

export const AdminLabs: React.FC<AdminLabsProps> = ({
  lang,
  labs,
  tests,
  onOpenAddLab,
  onOpenEditLab,
  onToggleHideLab,
  onOpenDeleteLab,
  onReorderLab,
  onResetDefaultLabs,
  onManageLabTests
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const t = TRANSLATIONS[lang];

  const filtered = labs.filter(lab => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      lab.name.toLowerCase().includes(term) || 
      (lab.location && lab.location.toLowerCase().includes(term));
    const matchVisibility = visibilityFilter === 'all' 
      ? true 
      : visibilityFilter === 'hidden' 
        ? !!lab.isHidden 
        : !lab.isHidden;
    return matchSearch && matchVisibility;
  });

  const visibleCount = labs.filter(l => !l.isHidden).length;
  const hiddenCount = labs.filter(l => l.isHidden).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{t.adminManageLabs}</h1>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {labs.length} {lang === 'bn' ? 'টি সেন্টার' : 'Centers'}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {lang === 'bn' 
              ? 'পার্টনার ডায়াগনস্টিক সেন্টার পরিচালনা, নাম, হোম স্যাম্পল চার্জ ও উপরে-নিচে প্রদর্শনের ক্রম (Reorder) নিয়ন্ত্রণ করুন।' 
              : 'Control partner diagnostic centers, edit names, home sample collection service charges, and display order.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {onResetDefaultLabs && (
            <button
              onClick={onResetDefaultLabs}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={lang === 'bn' ? 'ডিফল্ট সেন্টারের তালিকায় রিসেট করুন' : 'Reset to default centers list'}
            >
              <RotateCcw size={14} />
              <span className="hidden md:inline">{lang === 'bn' ? 'ডিফল্ট ক্রম' : 'Reset Order'}</span>
            </button>
          )}

          <Button onClick={onOpenAddLab} className="!py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Plus size={16} /> {t.adminAddNewLab}
          </Button>
        </div>
      </div>

      {/* Reorder instructions tip banner */}
      <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-sky-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <ArrowUpDown size={16} />
          </div>
          <div>
            <span className="font-bold block text-slate-900">
              {lang === 'bn' ? 'ডায়াগনস্টিক সেন্টারের ক্রম সাজান (Move Up / Down):' : 'Arrange Diagnostic Centers Order:'}
            </span>
            <span className="text-slate-600 text-[11px]">
              {lang === 'bn' 
                ? 'কার্ডের উপরের "▲ উপরে" ও "▼ নিচে" বাটনে ক্লিক করে সহজেই সেন্টারের অবস্থান পরিবর্তন করতে পারবেন। এই ক্রমই কাস্টমার বুকিং ও হোমপেজে প্রদর্শিত হবে।' 
                : 'Click "▲ Move Up" and "▼ Move Down" on any center card to change its ranking. This order is reflected in customer test booking.'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'bn' ? 'সেন্টারের নাম বা লোকেশন দিয়ে খুঁজুন...' : 'Search centers by name or location...'} 
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Visibility Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter size={13} /> {t.adminFilterVisibility}:
          </span>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                visibilityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.adminAllLabsVisibility} ({labs.length})
            </button>
            <button
              onClick={() => setVisibilityFilter('visible')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                visibilityFilter === 'visible'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={12} /> {t.adminOnlyVisible} ({visibleCount})
            </button>
            <button
              onClick={() => setVisibilityFilter('hidden')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                visibilityFilter === 'hidden'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <EyeOff size={12} /> {t.adminOnlyHidden} ({hiddenCount})
            </button>
          </div>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Building2 className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-sm font-semibold text-slate-600">
              {lang === 'bn' ? 'কোনো ডায়াগনস্টিক সেন্টার পাওয়া যায়নি।' : 'No diagnostic centers found matching your search.'}
            </p>
          </div>
        ) : (
          filtered.map((lab) => {
            const actualIndex = labs.findIndex(l => l.id === lab.id);
            const isFirst = actualIndex === 0;
            const isLast = actualIndex === labs.length - 1;

            return (
              <div 
                key={lab.id} 
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between relative group ${
                  lab.isHidden ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Order Badge & Reorder Controls Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-slate-900 text-white text-xs font-black rounded-lg shadow-2xs">
                        #{actualIndex + 1}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {lang === 'bn' ? 'সেন্টারের অবস্থান' : 'Position Rank'}
                      </span>
                    </div>

                    {/* Move Up & Move Down Action Buttons */}
                    {onReorderLab && (
                      <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => onReorderLab(lab.id, 'up')}
                          disabled={isFirst}
                          className="px-2 py-1 text-slate-700 hover:text-slate-950 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                          title={lang === 'bn' ? 'উপরে নিন (Move Up)' : 'Move Up'}
                        >
                          <MoveUp size={13} className="text-primary" />
                          <span className="text-[11px]">{lang === 'bn' ? 'উপরে' : 'Up'}</span>
                        </button>

                        <div className="w-px h-3.5 bg-slate-300" />

                        <button
                          type="button"
                          onClick={() => onReorderLab(lab.id, 'down')}
                          disabled={isLast}
                          className="px-2 py-1 text-slate-700 hover:text-slate-950 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                          title={lang === 'bn' ? 'নিচে নিন (Move Down)' : 'Move Down'}
                        >
                          <MoveDown size={13} className="text-indigo-600" />
                          <span className="text-[11px]">{lang === 'bn' ? 'নিচে' : 'Down'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Top Info & Visibility Badge */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <LabLogo 
                        name={lab.name} 
                        logo={lab.logo} 
                        size="md" 
                        accentColor={lab.accentColor}
                        className={lab.isHidden ? 'opacity-60 grayscale' : ''}
                      />
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-snug">{lab.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={12} /> {lab.location || 'Dhaka, Bangladesh'}
                          </span>
                          {lab.discountPercent !== undefined && lab.discountPercent > 0 && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[11px] font-extrabold rounded-md border border-rose-200/80 flex items-center gap-1">
                              <Tag size={10} className="text-rose-600" />
                              <span>{lab.discountPercent}% {lang === 'bn' ? 'অটো ডিসকাউন্ট' : 'Auto Discount'}</span>
                            </span>
                          )}
                          {lab.discountBadge && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md border border-emerald-200/60">
                              {lab.discountBadge}
                            </span>
                          )}
                          {lab.accreditation && (
                            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                              • {lab.accreditation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      {lab.isHidden ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full flex items-center gap-1 border border-amber-200 whitespace-nowrap">
                          <EyeOff size={12} /> {t.adminHiddenBadge}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full flex items-center gap-1 border border-emerald-200 whitespace-nowrap">
                          <Eye size={12} /> {t.adminVisibleBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hidden Banner */}
                  {lab.isHidden && (
                    <div className="mb-3 px-3 py-1.5 bg-amber-100/70 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
                      <EyeOff size={13} className="text-amber-700 flex-shrink-0" />
                      <span className="text-[11px] font-medium">গ্রাহকদের বুকিং ড্রপডাউন ও হোমপেজ থেকে সেন্টারটি লুকানো রয়েছে।</span>
                    </div>
                  )}

                  {/* Service Charge Box */}
                  <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-xl p-3.5 my-3 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block">Home Collection Service Charge</span>
                      <span className="text-xs text-slate-600">Added to cart when this center is chosen</span>
                    </div>
                    <span className="text-xl font-extrabold text-sky-900">৳ {lab.serviceCharge}</span>
                  </div>

                  {/* Diagnostics Test Count & Active Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <FlaskConical size={14} className="text-sky-600" />
                      <span>
                        {lang === 'bn' ? 'সক্রিয় টেস্ট:' : 'Active Tests:'}{' '}
                        <strong className={tests.filter(t => !t.hiddenLabs?.includes(lab.id)).length > 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                          {tests.filter(t => !t.hiddenLabs?.includes(lab.id)).length}
                        </strong>
                        <span className="text-slate-400">/{tests.length}</span>
                      </span>
                    </div>

                    {onManageLabTests && (
                      <button
                        type="button"
                        onClick={() => onManageLabTests(lab)}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/90 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      >
                        <FlaskConical size={12} className="text-sky-600" />
                        <span>{lang === 'bn' ? 'টেস্ট পরিচালনা' : 'Manage Tests'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                  {/* 1-Click Hide/Unhide Button */}
                  <button
                    onClick={() => onToggleHideLab(lab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      lab.isHidden 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                    }`}
                    title={lab.isHidden ? t.adminUnhideLab : t.adminHideLab}
                  >
                    {lab.isHidden ? (
                      <>
                        <Eye size={14} />
                        <span>{t.adminUnhideLab}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} />
                        <span>{t.adminHideLab}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    {onManageLabTests && (
                      <button 
                        type="button"
                        onClick={() => onManageLabTests(lab)}
                        className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-indigo-200/70 cursor-pointer"
                        title={lang === 'bn' ? 'এই সেন্টারের টেস্ট এক্টিভেশন ও মূল্য নির্ধারণ করুন' : 'Manage tests and pricing'}
                      >
                        <FlaskConical size={13} />
                        <span className="hidden sm:inline">{lang === 'bn' ? 'টেস্ট সেটিংস' : 'Tests'}</span>
                      </button>
                    )}
                    <button 
                      onClick={() => onOpenEditLab(lab)}
                      className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <Edit2 size={13} /> {t.adminEditLab}
                    </button>
                    <button 
                      onClick={() => onOpenDeleteLab(lab)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                      title="Delete Diagnostic Center"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
