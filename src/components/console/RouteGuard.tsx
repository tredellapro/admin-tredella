'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiOutlineLockClosed } from 'react-icons/hi';
import type { ReactNode } from 'react';
import { useAccess } from './AccessContext';
import { SECTIONS, visibleSections } from 'lib/access';

/**
 * Section for a path — longest matching href wins, so /stores/SH12345 resolves
 * to `stores` rather than to `/`.
 */
const sectionFor = (pathname: string): string | null => {
  const matches = SECTIONS.filter(
    (section) =>
      section.href !== null &&
      (section.href === pathname ||
        (section.href !== '/' && pathname.startsWith(`${section.href}/`)))
  );
  if (matches.length === 0) return pathname === '/' ? 'analytics' : null;
  return matches.reduce((a, b) =>
    (b.href?.length ?? 0) > (a.href?.length ?? 0) ? b : a
  ).key;
};

/**
 * Hiding a sidebar link is not access control on its own — the URL is still
 * typeable. This turns the same permission map into an actual stop on the
 * route, and points the person at somewhere they can go.
 *
 * It is still only the console's own guard. Nothing here stops a request made
 * outside the browser, so the resolvers have to check a staff role too; see
 * README.
 */
export default function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { view, permissions } = useAccess();

  const section = sectionFor(pathname);
  if (!section || view(section)) return children;

  const elsewhere = visibleSections(permissions).find((entry) => entry.href);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex max-w-[420px] flex-col items-center gap-3 rounded-2xl bg-white px-6 py-12 text-center shadow-[0_4px_30px_rgba(43,52,69,0.06)]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-22 text-primary">
          <HiOutlineLockClosed aria-hidden="true" />
        </span>

        <h1 className="text-18 font-semibold text-secondary">
          You do not have access to this
        </h1>
        <p className="text-13 leading-relaxed text-gray">
          Your account has not been given access to this section. A super admin
          can change that under Settings, Team Access.
        </p>

        {elsewhere?.href && (
          <Link
            href={elsewhere.href}
            className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-13 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Go to {elsewhere.label}
          </Link>
        )}
      </div>
    </div>
  );
}
