'use client';

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (_page: number) => void;
}

/** At most five numbers, sliding so the current page stays inside the window. */
const windowOf = (page: number, pageCount: number): number[] => {
  const span = Math.min(5, pageCount);
  const start = Math.min(Math.max(1, page - 2), Math.max(1, pageCount - span + 1));
  return Array.from({ length: span }, (_, i) => start + i);
};

export default function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const arrow =
    'flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-16 text-primary transition-colors hover:bg-primary/8 disabled:cursor-not-allowed disabled:border-secondary/15 disabled:text-gray/50 disabled:hover:bg-transparent';

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 px-4 py-5"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={arrow}
      >
        <HiChevronLeft />
      </button>

      {windowOf(page, pageCount).map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Page ${n}`}
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onChange(n)}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-13 transition-colors ${
            n === page
              ? 'border border-primary text-primary'
              : 'text-gray hover:text-secondary'
          }`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
        className={arrow}
      >
        <HiChevronRight />
      </button>
    </nav>
  );
}
