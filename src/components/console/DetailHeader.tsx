'use client';

import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi';
import type { ReactNode } from 'react';

interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  /** Where the arrow goes when there is no history to go back to. */
  backTo: string;
  actions?: ReactNode;
}

/** Back arrow and title — the detail screens' heading. */
export default function DetailHeader({
  title,
  subtitle,
  backTo,
  actions
}: DetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => {
            /* Prefer history so a deep link opened in a new tab still lands
               somewhere sensible rather than on about:blank. */
            if (window.history.length > 1) router.back();
            else router.push(backTo);
          }}
          className="rounded-lg bg-white p-2.5 text-18 text-secondary shadow-[0_2px_10px_rgba(43,52,69,0.08)] transition-colors hover:text-primary"
        >
          <HiArrowLeft />
        </button>

        <div>
          <h1 className="text-20 font-semibold text-secondary sm:text-26">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-13 text-gray">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
