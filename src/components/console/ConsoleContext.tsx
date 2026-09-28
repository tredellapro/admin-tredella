'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';

interface ConsoleValue {
  drawerOpen: boolean;
  setDrawerOpen: (_open: boolean) => void;
}

const ConsoleCtx = createContext<ConsoleValue | null>(null);

/**
 * The mobile drawer, opened from the page heading and closed by the sidebar.
 *
 * This used to carry a retail/wholesale switch for the whole console too. It
 * was removed: a global mode is the wrong shape for an admin, who is usually
 * looking at everything and only sometimes at one storefront. Orders and
 * Products now carry Storefront as an ordinary filter alongside their others,
 * which is both narrower in scope and visible in the filter chips.
 */
export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const value = useMemo(() => ({ drawerOpen, setDrawerOpen }), [drawerOpen]);

  return <ConsoleCtx.Provider value={value}>{children}</ConsoleCtx.Provider>;
}

export const useConsole = (): ConsoleValue => {
  const value = useContext(ConsoleCtx);
  if (!value) throw new Error('useConsole must be used inside ConsoleProvider');
  return value;
};
