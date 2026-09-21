'use client';

import { HiOutlineUpload } from 'react-icons/hi';
import SearchInput from './SearchInput';
import FilterDropdown from './FilterDropdown';
import FilterChips, { type Chip } from './FilterChips';
import type { FilterDef } from 'hooks/useTableState';

interface ToolbarProps<T> {
  term: string;
  onSearch: (_value: string) => void;
  filters?: FilterDef<T>[];
  draft: Record<string, string | null>;
  onDraftChange: (_key: string, _value: string | null) => void;
  onApply: () => void;
  chips: Chip[];
  onRemoveChip: (_key: string) => void;
  onExport?: () => void;
  searchPlaceholder?: string;
}

/**
 * The strip above every list: search, the staged filters, Apply and Export.
 * On a phone the controls stack and each dropdown takes the full width — a row
 * of four 90px buttons is unusable with a thumb.
 */
export default function Toolbar<T>({
  term,
  onSearch,
  filters = [],
  draft,
  onDraftChange,
  onApply,
  chips,
  onRemoveChip,
  onExport,
  searchPlaceholder
}: ToolbarProps<T>) {
  return (
    <div className="border-b border-secondary/8 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          value={term}
          onChange={onSearch}
          placeholder={searchPlaceholder}
        />

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
          {filters.map((filter) => (
            <FilterDropdown
              key={filter.key}
              label={filter.label}
              icon={filter.icon}
              options={filter.options}
              value={draft[filter.key] ?? null}
              onChange={(value) => onDraftChange(filter.key, value)}
            />
          ))}

          {filters.length > 0 && (
            <button
              type="button"
              onClick={onApply}
              className="rounded-lg bg-secondary px-4 py-2 text-13 font-medium text-white transition-colors hover:bg-secondary/90"
            >
              Apply Filter
            </button>
          )}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-13 font-medium text-white transition-colors hover:bg-primary/90"
            >
              <HiOutlineUpload aria-hidden="true" className="text-14" />
              Export
            </button>
          )}
        </div>
      </div>

      <FilterChips chips={chips} onRemove={onRemoveChip} />
    </div>
  );
}
