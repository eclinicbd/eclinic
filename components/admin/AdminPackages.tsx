import React, { useState } from 'react';
import { HealthPackage, LabPartner, Language, CategoryItem } from '../../types';
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
  Sparkles, 
  Tag, 
  CheckCircle2, 
  Droplet,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '../Button';

interface AdminPackagesProps {
  lang: Language;
  packages: HealthPackage[];
  labs: LabPartner[];
  categories?: CategoryItem[];
  onOpenAddPackage: () => void;
  onOpenEditPackage: (pkg: HealthPackage) => void;
  onToggleHidePackage: (pkgId: string) => void;
  onDuplicatePackage: (pkg: HealthPackage) => void;
  onOpenDeletePackage: (pkg: HealthPackage) => void;
}

export const AdminPackages: React.FC<AdminPackagesProps> = ({
  lang,
  packages,
  labs,
  categories = [],
  onOpenAddPackage,
  onOpenEditPackage,
  onToggleHidePackage,
  onDuplicatePackage,
  onOpenDeletePackage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'name_asc' | 'price_low' | 'price_high' | 'tests_count'>('default');

  const t = TRANSLATIONS[lang];

  // Derive unique categories
  const packageCategoryOptions = ['All', ...Array.from(new Set([
    ...categories.map(c => c.name),
    ...packages.map(p => p.category).filter(Boolean)
  ]))];

  // Filtering
  const filtered = packages.filter(pkg => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      pkg.name.toLowerCase().includes(term) || 
      (pkg.tagline && pkg.tagline.toLowerCase().includes(term)) ||
      (pkg.description && pkg.description.toLowerCase().includes(term)) ||
      (pkg.category && pkg.category.toLowerCase().includes(term)) ||
      (pkg.includededTests && pkg.includededTests.some(test => test.toLowerCase().includes(term)));

    const matchCategory = categoryFilter === 'All' || pkg.category === categoryFilter;
    const matchVisibility = visibilityFilter === 'all' 
      ? true 
      : visibilityFilter === 'hidden' 
        ? !!pkg.isHidden 
        : !pkg.isHidden;

    return matchSearch && matchCategory && matchVisibility;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'tests_count') return (b.testCount || 0) - (a.testCount || 0);
    return 0;
  });

  const visibleCount = packages.filter(p => !p.isHidden).length;
  const hiddenCount = packages.filter(p => p.isHidden).length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-primary" size={22} />
            <span>{lang === 'bn' ? 'ডায়াগনস্টিক প্যাকেজ তালিকা' : 'Diagnostic Packages Directory'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' 
              ? `মোট ${packages.length} টি প্যাকেজ (${visibleCount} টি দৃশ্যমান, ${hiddenCount} টি লুকায়িত)` 
              : `Total ${packages.length} packages (${visibleCount} active, ${hiddenCount} hidden)`}
          </p>
        </div>

        <Button 
          onClick={onOpenAddPackage}
          className="shadow-md shadow-sky-100 flex items-center gap-2 text-xs font-bold py-2.5 px-4"
        >
          <Plus size={16} />
          <span>{lang === 'bn' ? 'নতুন প্যাকেজ যোগ করুন' : 'Add New Package'}</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'bn' ? 'প্যাকেজের নাম বা টেস্ট দিয়ে খুঁজুন...' : 'Search by package name or included test...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Visibility Filter */}
          <div className="sm:col-span-3">
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700"
            >
              <option value="all">{lang === 'bn' ? 'সকল প্যাকেজ (All)' : 'All Visibility'}</option>
              <option value="visible">{lang === 'bn' ? 'সক্রিয় / দৃশ্যমান' : 'Active / Visible'}</option>
              <option value="hidden">{lang === 'bn' ? 'লুকায়িত (Hidden)' : 'Hidden'}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700"
            >
              <option value="default">{lang === 'bn' ? 'ক্রমানুসারে (ডিফল্ট)' : 'Default Order'}</option>
              <option value="tests_count">{lang === 'bn' ? 'সর্বোচ্চ টেস্ট সংখ্যা' : 'Highest Test Count'}</option>
              <option value="name_asc">{lang === 'bn' ? 'নাম অনুসারে (A-Z)' : 'Name (A-Z)'}</option>
              <option value="price_low">{lang === 'bn' ? 'মূল্য (কম থেকে বেশি)' : 'Price (Low to High)'}</option>
              <option value="price_high">{lang === 'bn' ? 'মূল্য (বেশি থেকে কম)' : 'Price (High to Low)'}</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
          {packageCategoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      {sorted.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Layers className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-600 font-semibold">{lang === 'bn' ? 'কোনো ডায়াগনস্টিক প্যাকেজ পাওয়া যায়নি' : 'No diagnostic packages found'}</p>
          <p className="text-xs text-slate-400 mt-1">{lang === 'bn' ? 'ফিল্টার পরিবর্তন করুন বা নতুন প্যাকেজ যোগ করুন' : 'Try adjusting your search filters or add a new package'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((pkg) => {
            const original = pkg.originalPrice || pkg.price;
            const discount = original > pkg.price ? Math.round(((original - pkg.price) / original) * 100) : (pkg.discountPercent || 0);

            return (
              <div 
                key={pkg.id} 
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  pkg.isHidden ? 'border-amber-200 bg-amber-50/20 opacity-75' : 'border-slate-200 hover:border-primary/40'
                }`}
              >
                <div>
                  {/* Top Image + Overlay */}
                  <div className="relative h-36 bg-slate-100 overflow-hidden">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/30"></div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold border border-white/20 flex items-center gap-1">
                        <Sparkles size={10} className="text-amber-300" />
                        {pkg.testCount} Tests
                      </span>
                      {pkg.popularBadge && (
                        <span className={`px-2 py-0.5 rounded-md text-white text-[10px] font-bold ${pkg.badgeColor || 'bg-emerald-600'}`}>
                          {pkg.popularBadge}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {pkg.isHidden ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                          <EyeOff size={11} /> {lang === 'bn' ? 'লুকায়িত' : 'Hidden'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                          <Eye size={11} /> {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h3 className="text-sm font-bold truncate drop-shadow">{pkg.name}</h3>
                      {pkg.tagline && <p className="text-[11px] text-sky-100 truncate opacity-90">{pkg.tagline}</p>}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    {/* Tests inside */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                        {lang === 'bn' ? `অন্তর্ভুক্ত টেস্ট (${pkg.testCount} টি):` : `Included Tests (${pkg.testCount}):`}
                      </span>
                      <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar pr-1">
                        {pkg.includededTests?.map((testName, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                            <span className="truncate">{testName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 py-2 border-y border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-sky-600 shrink-0" />
                        <span className="truncate">{pkg.turnaroundTime}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplet size={12} className="text-rose-500 shrink-0" />
                        <span className="truncate">{pkg.sampleType || 'Blood & Urine'}</span>
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">{lang === 'bn' ? 'প্যাকেজ মূল্য' : 'Price'}</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-slate-900">৳ {pkg.price.toLocaleString()}</span>
                          {original > pkg.price && (
                            <span className="text-xs text-slate-400 line-through">৳ {original.toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      {discount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                          {discount}% {lang === 'bn' ? 'ছাড়' : 'OFF'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    {/* Hide / Unhide */}
                    <button
                      onClick={() => onToggleHidePackage(pkg.id)}
                      title={pkg.isHidden ? (lang === 'bn' ? 'সক্রিয় করুন' : 'Show package') : (lang === 'bn' ? 'লুকিয়ে রাখুন' : 'Hide package')}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${
                        pkg.isHidden 
                          ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pkg.isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => onDuplicatePackage(pkg)}
                      title={lang === 'bn' ? 'ক্লোন / কপি করুন' : 'Duplicate'}
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors"
                    >
                      <Copy size={15} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Edit */}
                    <Button
                      onClick={() => onOpenEditPackage(pkg)}
                      variant="outline"
                      className="py-1.5 px-3 text-xs border-slate-200 hover:bg-white hover:border-primary text-slate-700 flex items-center gap-1"
                    >
                      <Edit2 size={13} />
                      <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                    </Button>

                    {/* Delete */}
                    <button
                      onClick={() => onOpenDeletePackage(pkg)}
                      title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      className="p-2 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
