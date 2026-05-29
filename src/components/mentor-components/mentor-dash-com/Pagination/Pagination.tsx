import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  /** Current page — 0-based */
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Builds compact pagination range (max 5 items):
 * Example: 1 ... 4 5 6 ... 10
 */
function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const range: (number | '...')[] = [];

  const first = 0;
  const last = total - 1;

  const left = Math.max(first + 1, current - 1);
  const right = Math.min(last - 1, current + 1);

  range.push(first);

  if (left > first + 1) range.push('...');

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < last - 1) range.push('...');

  range.push(last);

  // 🔥 enforce max 5 items (trim if needed)
  while (range.length > 5) {
    // remove extra from middle (prefer ellipses cleanup)
    const firstDots = range.indexOf('...');
    if (firstDots !== -1) {
      range.splice(firstDots, 1);
    } else {
      range.splice(2, 1);
    }
  }

  return range;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(currentPage, totalPages);

  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages - 1;

  return (
    <div className={`flex items-center justify-center gap-2 pt-6 pb-2 ${className}`}>

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Previous page"
        className="
          flex items-center justify-center w-10 h-10 rounded-xl
          bg-white dark:bg-zinc-800/50
          border border-gray-200 dark:border-zinc-700/50
          text-gray-700 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-zinc-800
          disabled:opacity-40 disabled:pointer-events-none
          transition
        "
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Pages */}
      <div className="flex items-center gap-1">
        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`dots-${idx}`}
              className="px-2 text-gray-400 select-none"
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`
                w-10 h-10 rounded-xl text-sm font-medium transition
                ${
                  page === currentPage
                    ? 'bg-[var(--primary-500)] text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }
              `}
            >
              {page + 1}
            </button>
          ),
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Next page"
        className="
          flex items-center justify-center w-10 h-10 rounded-xl
          bg-white dark:bg-zinc-800/50
          border border-gray-200 dark:border-zinc-700/50
          text-gray-700 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-zinc-800
          disabled:opacity-40 disabled:pointer-events-none
          transition
        "
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;