import type { IconType } from 'react-icons';
import {
  HiOutlineArchive,
  HiOutlineCash,
  HiOutlineChartBar,
  HiOutlineChat,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineQuestionMarkCircle,
  HiOutlineShoppingCart,
  HiOutlineTag,
  HiOutlineUsers,
  HiOutlineViewGrid
} from 'react-icons/hi';

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  /** No screen behind it yet — the sidebar still lists it, greyed. */
  pending?: boolean;
}

/* Analytics is not in the Figma sidebar, but the console opens on it, so it
   needs a way back. Everything below matches the design's order. */
export const NAV: NavItem[] = [
  { href: '/', label: 'Analytics', icon: HiOutlineChartBar },
  { href: '/users', label: 'Users', icon: HiOutlineUsers },
  { href: '/categories', label: 'Categories', icon: HiOutlineViewGrid },
  { href: '/brands', label: 'Brands', icon: HiOutlineTag },
  { href: '/orders', label: 'Orders', icon: HiOutlineShoppingCart },
  { href: '/products', label: 'Products', icon: HiOutlineArchive },
  { href: '/stores', label: 'Stores', icon: HiOutlineOfficeBuilding },
  { href: '/plans', label: 'Plans', icon: HiOutlineClipboardList, pending: true },
  { href: '/withdrawals', label: 'Withdrawals', icon: HiOutlineCash, pending: true },
  { href: '/chats', label: 'Chats', icon: HiOutlineChat, pending: true },
  { href: '/complaints', label: 'Complaints', icon: HiOutlineQuestionMarkCircle, pending: true },
  { href: '/settings', label: 'Settings', icon: HiOutlineCog, pending: true }
];

/** The deepest nav item matching the path — so /users/789 still lights Users. */
export const activeHref = (pathname: string): string => {
  const matches = NAV.filter(
    (item) =>
      item.href === pathname ||
      (item.href !== '/' && pathname.startsWith(`${item.href}/`))
  );
  return matches.length > 0
    ? matches.reduce((a, b) => (b.href.length > a.href.length ? b : a)).href
    : '/';
};
