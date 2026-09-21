'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { HiCheck, HiChevronDown } from 'react-icons/hi';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (_value: string | null) => void;
  /** Rendered before the label — the calendar glyph on date filters. */
  icon?: ReactNode;
}

/**
 * A listbox rather than a native <select>: the design wants the chosen value to
 * replace the label, a tick against the active row, and an explicit "All" that
 * clears the filter — none of which a native select gives without fighting it.
 */
export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
  icon
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const active = options.find((option) => option.value === value);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-13 transition-colors sm:w-auto ${
          active
            ? 'border-primary/40 bg-primary/5 text-primary'
            : 'border-secondary/15 bg-white text-gray hover:border-secondary/30'
        }`}
      >
        <span className="flex items-center gap-1.5">
          {icon}
          {active ? active.label : label}
        </span>
        <HiChevronDown
          className={`text-14 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="brand-scroll absolute right-0 z-30 mt-2 max-h-64 w-full min-w-[180px] overflow-y-auto rounded-xl border border-secondary/10 bg-white py-1.5 shadow-[0_12px_40px_rgba(43,52,69,0.14)]"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === null}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-13 text-gray transition-colors hover:bg-background"
            >
              All
              {value === null && <HiCheck className="text-14 text-primary" />}
            </button>
          </li>

          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-13 transition-colors hover:bg-background ${
                  option.value === value ? 'text-primary' : 'text-secondary'
                }`}
              >
                {option.label}
                {option.value === value && <HiCheck className="text-14" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
