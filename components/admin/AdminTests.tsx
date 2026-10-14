import React, { useState } from 'react';
import { TestPackage, LabPartner, Language, CategoryItem } from '../../types';
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
  Tag,
  Flame,
  RotateCcw
} from 'lucide-react';
import { Button } from '../Button';

interface AdminTestsProps {
  lang: Language;
  tests: TestPackage[];
  labs: LabPartner[];
  categories?: CategoryItem[];
  onOpenAddTest: () => void;
  onOpenEditTest: (test: TestPackage) => void;
  onToggleHideTest: (testId: string) => void;
  onDuplicateTest: (test: TestPackage) => void;
  onOpenDeleteTest: (test: TestPackage) => void;
  onQuickUpdateOrderCount?: (testId: string, delta: number) => void;
  onResetDefaultTests?: () => void;
  onFixPopularRates?: () => void;
  onQuickUpdateLabPrice?: (testId: string, labId: string, delta: number) => void;
}

export const AdminTests: React.FC<AdminTestsProps> = ({
  lang,
  tests,
  labs,
  categories = [],
  onOpenAddTest,
  onOpenEditTest,
  onToggleHideTest,
  onDuplicateTest,
  onOpenDeleteTest,
  onQuickUpdateOrderCount,
  onResetDefaultTests,
  onFixPopularRates,
  onQuickUpdateLabPrice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'name_asc' | 'price_low' | 'price_high'>('default');

  const t = TRANSLATIONS[lang];

  // Derive unique categories from both categories prop and existing tests
  const categoryOptions = Array.from(new Set([
    ...categories.map(c => c.name),
    ...tests.flatMap(t => (t.categories && t.categories.length > 0 ? t.categories : [t.category])).filter(Boolean)
  ]));

  // Filtering
  const filtered = tests.filter(test => {
    const term = searchTerm.toLowerCase();
    const testCats = (test.categories && test.categories.length > 0) ? test.categories : [test.category || ''];
    const matchSearch = 
      test.name.toLowerCase().includes(term) || 
      test.description.toLowerCase().includes(term) ||
      testCats.some(c => c.toLowerCase().includes(term));

    const matchCategory = categoryFilter === 'All' || testCats.includes(categoryFilter);
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
            <span>Total Catalog Tests: <strong className="text-slate-800 font-bold">{tests.length}</strong></span>
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
          {onFixPopularRates && (
            <button
              type="button"
              onClick={onFixPopularRates}
              className="px-3.5 py-2.5 text-xs font-bold text-emerald-800 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded-xl border border-emerald-300 hover:border-emerald-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md shrink-0 active:scale-95"
              title="Fix glitched Popular Diagnostic Centre rates back to catalog standards"
            >
              <span>🏥</span>
              <span>{lang === 'bn' ? 'পপুলার সেন্টারের রেট ফিক্স' : 'Fix Popular Lab Rates'}</span>
            </button>
          )}

          {onResetDefaultTests && (
            <button
              type="button"
              onClick={onResetDefaultTests}
              className="px-4 py-2.5 text-xs font-bold text-sky-700 hover:text-white bg-sky-50 hover:bg-sky-600 rounded-xl border border-sky-300 hover:border-sky-600 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md shrink-0 active:scale-95"
              title="Reset all 100 default diagnostic tests"
            >
              <RotateCcw size={15} className="text-sky-600 group-hover:text-white shrink-0 animate-spin-hover" />
              <span>{lang === 'bn' ? '🔄 ১০০টি ডিফল্ট টেস্ট রিলোড' : '🔄 Restore 100 Defaults'}</span>
            </button>
          )}

          <Button onClick={onOpenAddTest} className="!py-2.5 !px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm whitespace-nowrap">
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
            {categoryOptions.map(c => (
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

      {/* Notice & Quick Restore Banner if tests count is less than 100 */}
      {tests.length < 100 && onResetDefaultTests && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
              <FlaskConical size={20} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {lang === 'bn' ? `বর্তমানে ${tests.length}টি টেস্ট রয়েছে (ডিফল্ট ক্যাটালগে মোট ১০০টি টেস্ট)` : `Currently showing ${tests.length} tests (100 tests in default catalog)`}
              </p>
              <p className="text-[11px] text-slate-600">
                {lang === 'bn' 
                  ? 'রক্ত, ইউরিন ও স্টুলের সব নতুন টেস্ট ক্যাটালগে এক ক্লিকেই রিলোড করতে নিচের বাটনে চাপ দিন:' 
                  : 'Click below to restore all 100 comprehensive blood, urine and stool tests into your catalog:'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetDefaultTests}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>{lang === 'bn' ? '১০০টি টেস্ট রিলোড করুন' : 'Restore All 100 Tests'}</span>
          </button>
        </div>
      )}

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
                {/* Top Badges & Meta Row (No Image) */}
                <div className="p-3.5 pb-2.5 border-b border-slate-100/80 flex items-center justify-between gap-2 bg-slate-50/50">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-white border border-slate-200/80 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-xs flex items-center gap-1">
                      <FlaskConical size={11} className="text-sky-600" />
                      {(test.categories && test.categories.length > 0) ? test.categories.join(', ') : test.category}
                    </span>

                    {/* Order Count / Completed Badge with quick adjust */}
                    <div className="inline-flex items-center bg-amber-50 text-amber-800 border border-amber-200/80 rounded-lg text-[10px] font-extrabold shadow-2xs">
                      {onQuickUpdateOrderCount && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickUpdateOrderCount(test.id, -10);
                          }}
                          className="px-1.5 py-0.5 hover:bg-amber-100 text-amber-700 rounded-l-md font-bold transition-colors"
                          title="-10"
                        >
                          -
                        </button>
                      )}
                      <span className="px-1.5 py-0.5 flex items-center gap-1">
                        <Flame size={11} className="text-amber-500 fill-amber-500" />
                        <span>{test.orderCount || 0}+ {lang === 'bn' ? 'সম্পন্ন' : 'Done'}</span>
                      </span>
                      {onQuickUpdateOrderCount && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickUpdateOrderCount(test.id, 10);
                          }}
                          className="px-1.5 py-0.5 hover:bg-amber-100 text-amber-700 rounded-r-md font-bold transition-colors"
                          title="+10"
                        >
                          +
                        </button>
                      )}
                    </div>

                    {test.originalPrice && test.originalPrice > test.price && (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                        <Tag size={10} />
                        {test.discountPercent || Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isHidden ? (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <EyeOff size={11} /> {t.adminHiddenBadge}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
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
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Center Pricing Matrix:</span>
                      {onQuickUpdateLabPrice && (
                        <span className="text-[9px] text-sky-600 font-semibold">{lang === 'bn' ? '+/- দিয়ে রেট পরিবর্তন করুন' : 'Click +/- to adjust'}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {labs.slice(0, 4).map(lab => {
                        const labSelling = test.priceByLab?.[lab.id] || test.price;
                        const labOrig = test.originalPriceByLab?.[lab.id] || test.originalPrice || labSelling;
                        const hasLabDisc = labOrig > labSelling;
                        return (
                          <div key={lab.id} className="flex justify-between items-center text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                            <span className="truncate font-semibold text-slate-700 text-[10px]">{lab.name.split(' ')[0]}:</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {hasLabDisc && (
                                <span className="line-through text-slate-400 text-[9px]">৳{labOrig}</span>
                              )}
                              <span className="font-bold text-slate-900 text-[11px]">৳{labSelling}</span>
                              {onQuickUpdateLabPrice && (
                                <div className="flex items-center gap-0.5 ml-1">
                                  <button
                                    type="button"
                                    onClick={() => onQuickUpdateLabPrice(test.id, lab.id, -50)}
                                    className="w-4 h-4 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 flex items-center justify-center text-[11px] font-black cursor-pointer transition-colors"
                                    title={lang === 'bn' ? `${lab.name}-এ ৫০ টাকা কমান` : `Decrease 50 for ${lab.name}`}
                                  >
                                    -
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onQuickUpdateLabPrice(test.id, lab.id, 50)}
                                    className="w-4 h-4 rounded bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 flex items-center justify-center text-[11px] font-black cursor-pointer transition-colors"
                                    title={lang === 'bn' ? `${lab.name}-এ ৫০ টাকা বাড়ান` : `Increase 50 for ${lab.name}`}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
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
