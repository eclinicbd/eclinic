import React, { useState } from 'react';
import { CategoryItem, TestPackage, HealthPackage, Language } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { 
  Search, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2, 
  Tag, 
  FlaskConical, 
  Droplet, 
  HeartPulse, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Layers, 
  AlertCircle, 
  Sparkles, 
  User, 
  Award,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  RotateCcw,
  CheckCircle2,
  Stethoscope,
  Pill,
  Flame
} from 'lucide-react';
import { Button } from '../Button';

interface AdminCategoriesProps {
  lang: Language;
  categories: CategoryItem[];
  tests: TestPackage[];
  packages: HealthPackage[];
  onOpenAddCategory: () => void;
  onOpenEditCategory: (category: CategoryItem) => void;
  onToggleHideCategory: (categoryId: string) => void;
  onOpenDeleteCategory: (category: CategoryItem) => void;
  onReorderCategory: (categoryId: string, direction: 'up' | 'down') => void;
  onResetDefaultCategories: () => void;
}

export const CATEGORY_ICON_MAP: Record<string, any> = {
  FlaskConical,
  Droplet,
  HeartPulse,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
  AlertCircle,
  Sparkles,
  User,
  Award,
  Stethoscope,
  Pill,
  Flame,
  Tag
};

export const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', ring: 'ring-blue-400' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', ring: 'ring-rose-400' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-400' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', ring: 'ring-purple-400' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-400' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', ring: 'ring-cyan-400' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-400' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: 'ring-orange-400' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', ring: 'ring-pink-400' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', ring: 'ring-indigo-400' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', ring: 'ring-teal-400' }
};

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  lang,
  categories,
  tests,
  packages,
  onOpenAddCategory,
  onOpenEditCategory,
  onToggleHideCategory,
  onOpenDeleteCategory,
  onReorderCategory,
  onResetDefaultCategories
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const t = TRANSLATIONS[lang];

  // Count tests and packages per category
  const getCategoryStats = (categoryName: string) => {
    const testCount = tests.filter(t => t.category?.toLowerCase() === categoryName.toLowerCase()).length;
    const packageCount = packages.filter(p => p.category?.toLowerCase() === categoryName.toLowerCase()).length;
    return { testCount, packageCount, total: testCount + packageCount };
  };

  // Filtered categories
  const filtered = categories.filter(cat => {
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      cat.name.toLowerCase().includes(term) ||
      (cat.nameBn && cat.nameBn.toLowerCase().includes(term)) ||
      (cat.description && cat.description.toLowerCase().includes(term));

    const matchVisibility = visibilityFilter === 'all'
      ? true
      : visibilityFilter === 'hidden'
        ? !!cat.isHidden
        : !cat.isHidden;

    return matchSearch && matchVisibility;
  });

  const visibleCount = categories.filter(c => !c.isHidden).length;
  const hiddenCount = categories.filter(c => c.isHidden).length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="text-primary" size={24} />
            <h1 className="text-2xl font-bold text-slate-900">
              {lang === 'bn' ? 'ক্যাটেগরি ব্যবস্থাপনা (Categories)' : 'Manage Test Categories'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' 
              ? 'ল্যাব টেস্ট ও হেলথ প্যাকেজের জন্য ক্যাটেগরি তৈরি, এডিট ও ডিলিট করুন (যেমন: General, Diabetes, Heart, Vitamin ইত্যাদি)' 
              : 'Create, edit, and delete diagnostic categories for tests and health packages'}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
            <span>Total Categories: <strong className="text-slate-800 font-bold">{categories.length}</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Eye size={12} /> Visible: <strong>{visibleCount}</strong>
            </span>
            <span>•</span>
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <EyeOff size={12} /> Hidden: <strong>{hiddenCount}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            type="button"
            onClick={onResetDefaultCategories}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
            title="Reset standard medical categories"
          >
            <RotateCcw size={14} />
            <span>{lang === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset Defaults'}</span>
          </button>

          <Button 
            onClick={onOpenAddCategory} 
            className="!py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus size={16} /> 
            <span>{lang === 'bn' ? 'নতুন ক্যাটেগরি যোগ করুন' : 'Add New Category'}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === 'bn' ? 'ক্যাটেগরি খুঁজুন (e.g. Diabetes, Heart)...' : 'Search categories...'}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-xs"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter:</span>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none bg-white"
          >
            <option value="all">All Categories ({categories.length})</option>
            <option value="visible">Visible Only ({visibleCount})</option>
            <option value="hidden">Hidden Only ({hiddenCount})</option>
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Tag size={24} />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">
            {lang === 'bn' ? 'কোনো ক্যাটেগরি পাওয়া যায়নি' : 'No categories found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm 
              ? (lang === 'bn' ? 'সার্চ ফিল্টারের সাথে কোনো ক্যাটেগরি মেলেনি।' : 'No category matched your search criteria.') 
              : (lang === 'bn' ? 'নতুন ক্যাটেগরি যোগ করতে উপরের বাটনে ক্লিক করুন।' : 'Click Add New Category button to create one.')}
          </p>
          <Button onClick={onOpenAddCategory} variant="outline" className="text-xs">
            <Plus size={14} className="mr-1" /> {lang === 'bn' ? 'নতুন ক্যাটেগরি তৈরি করুন' : 'Create Category'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((category, index) => {
            const IconComponent = CATEGORY_ICON_MAP[category.icon || 'Tag'] || Tag;
            const colorScheme = CATEGORY_COLOR_MAP[category.color || 'blue'] || CATEGORY_COLOR_MAP.blue;
            const stats = getCategoryStats(category.name);

            return (
              <div 
                key={category.id} 
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                  category.isHidden ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border} flex items-center justify-center font-bold shadow-xs`}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{category.name}</h3>
                          {category.isHidden && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                              Hidden
                            </span>
                          )}
                        </div>
                        {category.nameBn && (
                          <p className="text-xs font-medium text-slate-500">{category.nameBn}</p>
                        )}
                      </div>
                    </div>

                    {/* Order Controls */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => onReorderCategory(category.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded-md transition-colors"
                        title="Move Up"
                      >
                        <MoveUp size={12} />
                      </button>
                      <span className="text-[10px] font-bold text-slate-600 px-1">#{category.order || index + 1}</span>
                      <button
                        type="button"
                        onClick={() => onReorderCategory(category.id, 'down')}
                        disabled={index === filtered.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded-md transition-colors"
                        title="Move Down"
                      >
                        <MoveDown size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {category.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {category.description}
                    </p>
                  )}

                  {/* Item Usage Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <FlaskConical size={12} />
                      <span>{stats.testCount} {lang === 'bn' ? 'টি টেস্ট' : 'Tests'}</span>
                    </span>

                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <Layers size={12} />
                      <span>{stats.packageCount} {lang === 'bn' ? 'টি প্যাকেজ' : 'Packages'}</span>
                    </span>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleHideCategory(category.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 ${
                      category.isHidden 
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={category.isHidden ? 'Show in Customer Catalog' : 'Hide from Customer Catalog'}
                  >
                    {category.isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{category.isHidden ? (lang === 'bn' ? 'লুকানো' : 'Hidden') : (lang === 'bn' ? 'সক্রিয়' : 'Active')}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenEditCategory(category)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      title="Edit Category"
                    >
                      <Edit2 size={13} />
                      <span className="hidden sm:inline">{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDeleteCategory(category)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
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
