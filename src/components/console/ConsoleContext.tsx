'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';

export type StorefrontMode = 'RETAIL' | 'WHOLESALE';

interface ConsoleValue {
  drawerOpen: boolean;
  setDrawerOpen: (_open: boolean) => void;
  mode: StorefrontMode;
  toggleMode: () => void;
}

const ConsoleCtx = createContext<ConsoleValue | null>(null);

/**
 * Two bits of shell state the pages need to reach: the mobile drawer (opened
 * from the page heading, closed by the sidebar) and the retail/wholesale
 * switch in the header. The marketplace runs both storefronts behind one
 * login, so Orders and Products mean different rows depending on this.
 */
export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<StorefrontMode>('WHOLESALE');

  const value = useMemo(
    () => ({
      drawerOpen,
      setDrawerOpen,
      mode,
      toggleMode: () =>
        setMode((current) => (current === 'RETAIL' ? 'WHOLESALE' : 'RETAIL'))
    }),
    [drawerOpen, mode]
  );

  return <ConsoleCtx.Provider value={value}>{children}</ConsoleCtx.Provider>;
}

export const useConsole = (): ConsoleValue => {
  const value = useContext(ConsoleCtx);
  if (!value) throw new Error('useConsole must be used inside ConsoleProvider');
  return value;
};
