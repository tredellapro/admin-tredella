'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { FilterOption } from 'components/ui/FilterDropdown';
import type { Chip } from 'components/ui/FilterChips';

export interface FilterDef<T> {
  key: string;
  label: string;
  options: FilterOption[];
  icon?: ReactNode;
  /** True when the row should survive this filter. */
  match: (_row: T, _value: string) => boolean;
}

interface Options<T> {
  rows: T[];
  /** Everything the search box should look through, as one string. */
  searchIn: (_row: T) => string;
  filters?: FilterDef<T>[];
  pageSize?: number;
  /** Filters already applied on arrival, e.g. seeded from the URL. */
  initial?: Record<string, string | null>;
}

/**
 * Search, filters and paging for the six list screens, in one place.
 *
 * Filters are staged: picking a value only changes the draft, and `apply`
 * commits it. That is what the "Apply Filter" button in the designs is for,
 * and it is the right shape for later — once these lists come from the API,
 * committing once beats a refetch per dropdown. Search stays live, because it
 * has no button of its own and typing with no feedback feels broken.
 */
export function useTableState<T>({
  rows,
  searchIn,
  filters = [],
  pageSize = 7,
  initial = {}
}: Options<T>) {
  const [term, setTerm] = useState('');
  const [draft, setDraft] = useState<Record<string, string | null>>(initial);
  const [applied, setApplied] = useState<Record<string, string | null>>(initial);
  const [page, setPage] = useState(1);

  const setDraftValue = (key: string, value: string | null) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const apply = () => {
    setApplied(draft);
    setPage(1);
  };

  /* Clearing a chip has to clear the draft too, or the next Apply would put
     the filter the user just dismissed straight back. */
  const removeChip = (key: string) => {
    setDraft((current) => ({ ...current, [key]: null }));
    setApplied((current) => ({ ...current, [key]: null }));
    setPage(1);
  };

  const search = (value: string) => {
    setTerm(value);
    setPage(1);
  };

  const chips: Chip[] = filters.flatMap((filter) => {
    const value = applied[filter.key];
    if (!value) return [];
    const option = filter.options.find((o) => o.value === value);
    return [{ key: filter.key, label: filter.label, value: option?.label ?? value }];
  });

  const matched = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return rows.filter((row) => {
      if (needle && !searchIn(row).toLowerCase().includes(needle)) return false;
      return filters.every((filter) => {
        const value = applied[filter.key];
        return !value || filter.match(row, value);
      });
    });
    // searchIn and filters are declared inline by the pages, so they are new
    // objects every render; the row set and the committed criteria are what
    // actually decide the result
  }, [rows, term, applied]);

  const pageCount = Math.max(1, Math.ceil(matched.length / pageSize));
  /* A filter can shrink the list under the current page — clamp rather than
     letting the table render empty while the pager still says page 4. */
  const current = Math.min(page, pageCount);
  const visible = matched.slice((current - 1) * pageSize, current * pageSize);

  return {
    term,
    search,
    draft,
    setDraftValue,
    apply,
    chips,
    removeChip,
    page: current,
    setPage,
    pageCount,
    visible,
    total: matched.length
  };
}
