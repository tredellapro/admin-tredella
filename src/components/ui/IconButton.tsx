'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

interface IconButtonProps {
  label: string;
  icon: ReactNode;
  tone?: 'primary' | 'danger' | 'neutral';
  href?: string;
  onClick?: () => void;
}

const TONES = {
  primary: 'bg-primary/8 text-primary hover:bg-primary/15',
  danger: 'bg-primary/8 text-primary hover:bg-primary/15',
  neutral: 'bg-secondary/8 text-secondary hover:bg-secondary/15'
};

/** The round edit / view / delete buttons in the Actions column. */
export default function IconButton({
  label,
  icon,
  tone = 'primary',
  href,
  onClick
}: IconButtonProps) {
  const className = `flex h-8 w-8 items-center justify-center rounded-full text-14 transition-colors ${TONES[tone]}`;

  if (href)
    return (
      <Link href={href} aria-label={label} title={label} className={className}>
        {icon}
      </Link>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={className}
    >
      {icon}
    </button>
  );
}
