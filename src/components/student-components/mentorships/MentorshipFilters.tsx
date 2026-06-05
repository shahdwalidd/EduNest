import { type FC, useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { MentorshipFiltersType } from '../../../types/mentorship';

interface MentorshipFiltersProps {
  onFiltersChange: (filters: MentorshipFiltersType) => void;
  categories?: string[];
  initialFilters?: MentorshipFiltersType;
}

const CATEGORIES = [
  'All Mentors',
  'Programming',
  'Marketing',
  'Business',
  'Design',
  'Data & AI',
  'Personal Development',
  'Other',
];

const MentorshipFilters: FC<MentorshipFiltersProps> = ({
  onFiltersChange,
  categories = CATEGORIES,
  initialFilters,
}) => {
  const [keyword, setKeyword] = useState(initialFilters?.keyword ?? '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category ?? 'All Mentors');
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice ?? 0);
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice ?? 2000);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    setKeyword(initialFilters?.keyword ?? '');
    setSelectedCategory(initialFilters?.category ?? 'All Mentors');
    setMinPrice(initialFilters?.minPrice ?? 0);
    setMaxPrice(initialFilters?.maxPrice ?? 2000);
  }, [initialFilters]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const clearPendingDebounce = () => {
    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  };

  const buildFilters = (overrides: Partial<MentorshipFiltersType> = {}) => {
    const nextKeyword = overrides.keyword !== undefined ? overrides.keyword : keyword;
    const nextCategory = overrides.category !== undefined ? overrides.category : selectedCategory;
    const nextMinPrice = overrides.minPrice !== undefined ? overrides.minPrice : minPrice;
    const nextMaxPrice = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;

    return {
      page: 0,
      ...(nextKeyword ? { keyword: nextKeyword } : {}),
      ...(nextCategory && nextCategory !== 'All Mentors' ? { category: nextCategory } : {}),
      ...(nextMinPrice > 0 ? { minPrice: nextMinPrice } : {}),
      ...(nextMaxPrice < 2000 ? { maxPrice: nextMaxPrice } : {}),
    };
  };

  const scheduleFilterUpdate = (overrides: Partial<MentorshipFiltersType> = {}) => {
    clearPendingDebounce();
    debounceTimer.current = window.setTimeout(() => {
      onFiltersChange(buildFilters(overrides));
      debounceTimer.current = null;
    }, 350);
  };

  const applyFiltersNow = (overrides: Partial<MentorshipFiltersType> = {}) => {
    clearPendingDebounce();
    onFiltersChange(buildFilters(overrides));
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    scheduleFilterUpdate({ keyword: value });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    applyFiltersNow({ category });
  };

  const handleMinPriceChange = (value: number) => {
    const nextMin = Math.min(value, maxPrice);
    setMinPrice(nextMin);
    scheduleFilterUpdate({ minPrice: nextMin });
  };

  const handleMaxPriceChange = (value: number) => {
    const nextMax = Math.max(value, minPrice);
    setMaxPrice(nextMax);
    scheduleFilterUpdate({ maxPrice: nextMax });
  };

  const flushPriceFilters = () => {
    if (debounceTimer.current) {
      applyFiltersNow();
    }
  };

  const handleReset = () => {
    setKeyword('');
    setSelectedCategory('All Mentors');
    setMinPrice(0);
    setMaxPrice(2000);
    onFiltersChange({
      keyword: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      page: 0,
    });
  };

  // لضمان تناسق شريط السحب التكيفي مع نمط Light & Dark بدون تعقيد برميجي
  const adaptiveTrackBg = 'rgba(148, 163, 184, 0.25)';

  return (
    <div className="sticky top-4 space-y-6 select-none bg-transparent">
      {/* Search Keyword */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">
          Keyword
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by mentorship, mentor name or others"
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Categories List */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">
          Category
        </label>
        <div className="space-y-2.5">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="mentorship-category"
                value={category}
                checked={selectedCategory === category}
                onChange={() => handleCategorySelect(category)}
                className="w-4 h-4 rounded-full border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--primary-500)] focus:ring-[var(--primary-500)] focus:ring-offset-0 dark:focus:ring-offset-slate-900 cursor-pointer transition-colors"
              />
              <span className="text-sm text-gray-600 dark:text-slate-400 group-hover:text-[var(--primary-500)] dark:group-hover:text-[var(--primary-400)] transition-colors font-medium">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Price Range
        </label>
        <div className="space-y-5">
          {/* Min Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">MIN ($)</span>
              <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{minPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="10"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(Number(e.target.value))}
              onMouseUp={flushPriceFilters}
              onTouchEnd={flushPriceFilters}
              onPointerUp={flushPriceFilters}
              className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer transition-all duration-200"
              style={{
                outline: 'none',
                background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(minPrice / 2000) * 100}%, ${adaptiveTrackBg} ${(minPrice / 2000) * 100}%, ${adaptiveTrackBg} 100%)`,
              }}
            />
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">MAX ($)</span>
              <span className="text-sm font-bold text-gray-900 dark:text-slate-100">{maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="10"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
              onMouseUp={flushPriceFilters}
              onTouchEnd={flushPriceFilters}
              onPointerUp={flushPriceFilters}
              className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer transition-all duration-200"
              style={{
                outline: 'none',
                background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${(maxPrice / 2000) * 100}%, ${adaptiveTrackBg} ${(maxPrice / 2000) * 100}%, ${adaptiveTrackBg} 100%)`,
              }}
            />
          </div>

          {/* Clean Rounded Price Display Box */}
          <div className="pt-2 px-3 py-2.5 bg-gray-50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/60 rounded-xl text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">
              Selected Range: <span className="font-bold text-gray-900 dark:text-slate-100">${minPrice}</span>
              {' — '}
              <span className="font-bold text-gray-900 dark:text-slate-100">${maxPrice}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Reset Controls Button */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/60 font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
      >
        <X className="w-4 h-4 text-gray-400 dark:text-slate-500" />
        Reset Filters
      </button>
    </div>
  );
};

export default MentorshipFilters;