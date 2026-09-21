import type { ReactNode } from 'react';
import { ConsoleProvider } from 'components/console/ConsoleContext';
import Sidebar from 'components/console/Sidebar';
import TopContactBar from 'components/console/TopContactBar';

/* The whole page scrolls and the sidebar is sticky, rather than a nested
   scroll container: on a phone a `100vh` shell fights the browser's own
   collapsing toolbar, and the sidebar is a drawer there anyway. */
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleProvider>
      <div className="min-h-screen bg-background">
        <TopContactBar />

        <div className="flex">
          <Sidebar />

          <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ConsoleProvider>
  );
}
