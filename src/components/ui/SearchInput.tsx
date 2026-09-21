'use client';

import { HiOutlineSearch } from 'react-icons/hi';

interface SearchInputProps {
  value: string;
  onChange: (_value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  label = 'Search'
}: SearchInputProps) {
  return (
    <div className="relative w-full sm:max-w-[260px]">
      <HiOutlineSearch
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-16 text-gray"
      />
      <input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-secondary/15 bg-white py-2 pl-9 pr-3 text-13 text-secondary outline-none transition-colors placeholder:text-gray/70 focus:border-primary"
      />
    </div>
  );
}
