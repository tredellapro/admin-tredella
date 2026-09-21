'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiX } from 'react-icons/hi';
import { NAV, activeHref } from './navigation';
import { useConsole } from './ConsoleContext';

/**
 * One definition, rendered twice: pinned on large screens and as a drawer
 * below `lg`. Both render the same list from NAV so they cannot drift.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { drawerOpen, setDrawerOpen } = useConsole();
  const active = activeHref(pathname);

  const list = (
    <nav aria-label="Main menu" className="px-5 pb-8">
      <p className="px-2 pb-3 text-11 font-medium uppercase tracking-wider text-gray">
        Main menu
      </p>

      <ul className="flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const current = item.href === active;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-14 transition-colors ${
                  current
                    ? 'bg-primary font-medium text-white'
                    : 'text-secondary hover:bg-primary/8 hover:text-primary'
                }`}
              >
                <Icon aria-hidden="true" className="shrink-0 text-18" />
                <span className="truncate">{item.label}</span>
                {item.pending && !current && (
                  // honest about what is not built yet rather than a dead link
                  <span className="ml-auto text-10 uppercase tracking-wide text-gray/70">
                    soon
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const logo = (
    <div className="px-5 py-6">
      <Link href="/" aria-label="Tredella Admin home">
        <Image
          src="/assets/images/logo.webp"
          alt="Tredella"
          width={150}
          height={48}
          priority
          className="h-9 w-auto"
        />
      </Link>
    </div>
  );

  return (
    <>
      <aside className="brand-scroll sticky top-0 hidden h-screen w-[253px] shrink-0 overflow-y-auto border-r border-secondary/8 bg-white lg:block">
        {logo}
        {list}
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-secondary/40"
          />

          <div className="brand-scroll absolute inset-y-0 left-0 w-[264px] max-w-[85vw] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-start justify-between">
              {logo}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="m-4 rounded-full p-1.5 text-18 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
              >
                <HiX />
              </button>
            </div>
            {list}
          </div>
        </div>
      )}
    </>
  );
}
