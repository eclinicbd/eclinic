import React, { useState } from 'react';
import { TestPackage, LabPartner, Language } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  Search, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Copy, 
  Clock, 
  FlaskConical, 
  ArrowUpDown,
  Tag 
} from 'lucide-react';
import { Button } from '../Button';

interface AdminTestsProps {
  lang: Language;
  tests: TestPackage[];
  labs: LabPartner[];
  onOpenAddTest: () => void;
  onOpenEditTest: (test: TestPackage) => void;
  onToggleHideTest: (testId: string) => void;
  onDuplicateTest: (test: TestPackage) => void;
  onOpenDeleteTest: (test: TestPackage) => void;
}

const PRESET_CATEGORIES = ['General', 'Diabetes', 'Heart', 'Thyroid', 'Vitamin', 'Kidney', 'Liver', 'Infection', 'Women Health'];

export const AdminTests: React.FC<AdminTestsProps> = ({
  lang,
  tests,
  labs,
  onOpenAddTest,
  onOpenEditTest,
  onToggleHideTest,
  onDuplicateTest,
  onOpenDeleteTest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'name_asc' | 'price_low' | 'price_high'>('default');

  const t = TRANSLATIONS[lang];

  // Filtering
  const filtered = tests.filter(test => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      test.name.toLowerCase().includes(term) || 
      test.description.toLowerCase().includes(term) ||
      test.category.toLowerCase().includes(term);

    const matchCategory = categoryFilter === 'All' || test.category === categoryFilter;
    const matchVisibility = visibilityFilter === 'all' 
      ? true 
      : visibilityFilter === 'hidden' 
        ? !!test.isHidden 
        : !test.isHidden;

    return matchSearch && matchCategory && matchVisibility;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    return 0;
  });

  const visibleCount = tests.filter(t => !t.isHidden).length;
  const hiddenCount = tests.filter(t => t.isHidden).length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.adminManageTests}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Total: <strong className="text-slate-800 font-bold">{tests.length}</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Eye size={12} /> {t.adminOnlyVisible}: <strong>{visibleCount}</strong>
            </span>
            <span>•</span>
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <EyeOff size={12} /> {t.adminOnlyHidden}: <strong>{hiddenCount}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Button onClick={onOpenAddTest} className="!py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm whitespace-nowrap">
            <Plus size={16} /> {t.adminAddNewTest}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search test name or rate..." 
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 outline-none w-full bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none cursor-pointer"
          >
            <option value="All">All Categories ({tests.length})</option>
            {PRESET_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Visibility */}
        <div>
          <select 
            value={visibilityFilter} 
            onChange={(e) => setVisibilityFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 outline-none cursor-pointer text-slate-700"
          >
            <option value="all">👁️ {t.adminAllVisibility} ({tests.length})</option>
            <option value="visible">✓ {t.adminOnlyVisible} ({visibleCount})</option>
            <option value="hidden">🚫 {t.adminOnlyHidden} ({hiddenCount})</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none cursor-pointer"
          >
            <option value="default">Default Order</option>
            <option value="name_asc">Alphabetical (A - Z)</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <FlaskConical size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 text-sm font-medium">No tests found matching your filters.</p>
          </div>
        ) : (
          sorted.map(test => {
            const isHidden = !!test.isHidden;
            return (
              <div 
                key={test.id} 
                className={`bg-white rounded-2xl border shadow-sm flex flex-col transition-all overflow-hidden group ${
                  isHidden ? 'border-amber-300/80 bg-amber-50/15' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Image & Badges */}
                <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={test.image} 
                    alt={test.name} 
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      isHidden ? 'grayscale-[35%] opacity-90' : ''
                    }`} 
                  />
                  
                  {/* Category & Discount badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm">
                      {test.category}
                    </span>
                    {test.originalPrice && test.originalPrice > test.price && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                        <Tag size={10} />
                        {test.discountPercent || Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
                      </span>
                    )}
                  </div>

                  {/* Top-Right Badges */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    {isHidden ? (
                      <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <EyeOff size={11} /> {t.adminHiddenBadge}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Clock size={10} /> {test.turnaroundTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Test Info */}
                <div className="p-4 flex flex-col flex-grow">
                  {/* Status alert banner when hidden */}
                  {isHidden && (
                    <div className="mb-2.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-[11px] text-amber-800">
                      <span className="flex items-center gap-1 font-semibold">
                        <EyeOff size={12} className="text-amber-600" />
                        ক্যাটালগে লুকানো (Hidden)
                      </span>
                      <button 
                        onClick={() => onToggleHideTest(test.id)}
                        className="text-[10px] font-bold text-amber-900 underline hover:text-amber-700"
                      >
                        Unhide
                      </button>
                    </div>
                  )}

                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">{test.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{test.description}</p>
                  
                  {/* Diagnostic Center Rates Matrix */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Center Pricing Matrix:</span>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      {labs.slice(0, 4).map(lab => {
                        const labSelling = test.priceByLab?.[lab.id] || test.price;
                        const labOrig = test.originalPriceByLab?.[lab.id] || test.originalPrice || labSelling;
                        const hasLabDisc = labOrig > labSelling;
                        return (
                          <div key={lab.id} className="flex justify-between items-center text-slate-600 truncate pr-1">
                            <span className="truncate">{lab.name.split(' ')[0]}:</span>
                            <div className="flex items-center gap-1">
                              {hasLabDisc && (
                                <span className="line-through text-slate-400 text-[10px]">৳{labOrig}</span>
                              )}
                              <span className="font-bold text-slate-800">৳{labSelling}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Price & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between gap-2">
                    <div>
                      {test.originalPrice && test.originalPrice > test.price ? (
                        <div>
                          <div className="flex items-center gap-1 leading-none mb-0.5">
                            <span className="text-xs text-slate-400 line-through">৳ {test.originalPrice}</span>
                            <span className="text-[10px] font-bold text-rose-600">
                              -{test.discountPercent || Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}%
                            </span>
                          </div>
                          <span className="text-lg font-black text-slate-900">৳ {test.price}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Base Rate</span>
                          <span className="text-lg font-black text-slate-900">৳ {test.price}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* 1-Click Hide/Unhide */}
                      <button 
                        onClick={() => onToggleHideTest(test.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border ${
                          isHidden 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700 border-slate-200'
                        }`}
                        title={isHidden ? t.adminUnhideTest : t.adminHideTest}
                      >
                        {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>

                      {/* Duplicate Test */}
                      <button 
                        onClick={() => onDuplicateTest(test)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-100"
                        title={t.adminDuplicateTest}
                      >
                        <Copy size={14} />
                      </button>

                      {/* Edit Button */}
                      <button 
                        onClick={() => onOpenEditTest(test)}
                        className="px-2.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-sky-100"
                        title={t.adminEditTest}
                      >
                        <Edit2 size={13} /> 
                        <span className="text-[11px]">Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button 
                        onClick={() => onOpenDeleteTest(test)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title="Delete test"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
