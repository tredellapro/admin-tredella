import type { ReactNode } from 'react';
import { AccessProvider } from 'components/console/AccessContext';
import { ConsoleProvider } from 'components/console/ConsoleContext';
import RouteGuard from 'components/console/RouteGuard';
import Sidebar from 'components/console/Sidebar';

/* The whole page scrolls and the sidebar is sticky, rather than a nested
   scroll container: on a phone a `100vh` shell fights the browser's own
   collapsing toolbar, and the sidebar is a drawer there anyway. */
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AccessProvider>
      <ConsoleProvider>
        <div className="min-h-screen bg-background">
          <div className="flex">
            <Sidebar />

            <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <RouteGuard>{children}</RouteGuard>
            </main>
          </div>
        </div>
      </ConsoleProvider>
    </AccessProvider>
  );
}
