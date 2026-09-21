'use client';

import Link from 'next/link';
import { HiOutlineMenu } from 'react-icons/hi';
import HeaderControls from './HeaderControls';
import { useConsole } from './ConsoleContext';

interface PageHeadingProps {
  title: string;
  /** Trail after "Admin", e.g. ['Users', 'User Management']. */
  trail?: { label: string; href?: string }[];
}

export default function PageHeading({ title, trail = [] }: PageHeadingProps) {
  const { setDrawerOpen } = useConsole();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="mt-0.5 rounded-lg p-2 text-20 text-secondary transition-colors hover:bg-primary/8 hover:text-primary lg:hidden"
        >
          <HiOutlineMenu />
        </button>

        <div>
          <h1 className="text-22 font-semibold text-secondary sm:text-28">
            {title}
          </h1>

          <nav aria-label="Breadcrumb" className="mt-1">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-12 text-gray">
              <li>Admin</li>
              {trail.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-primary">
                    •
                  </span>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-primary"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    crumb.label
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <HeaderControls />
    </div>
  );
}
