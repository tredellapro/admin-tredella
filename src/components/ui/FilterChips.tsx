'use client';

import { HiX } from 'react-icons/hi';

export interface Chip {
  key: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  chips: Chip[];
  onRemove: (_key: string) => void;
}

/**
 * What is currently narrowing the list, and one click to undo each. Without
 * these, a filter left on two screens ago looks like missing data.
 */
export default function FilterChips({ chips, onRemove }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2 pt-3">
      {chips.map((chip) => (
        <li key={chip.key}>
          <span className="flex items-center gap-1.5 rounded-md bg-primary/8 py-1 pl-2.5 pr-1.5 text-12 text-gray">
            {chip.label}:{' '}
            <span className="font-medium text-secondary">{chip.value}</span>
            <button
              type="button"
              onClick={() => onRemove(chip.key)}
              aria-label={`Clear ${chip.label} filter`}
              className="rounded-full p-0.5 text-13 text-primary transition-colors hover:bg-primary/15"
            >
              <HiX />
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
