/* Who on the team can see and do what.

   Same shape as seller-tredella/src/lib/roles.ts on purpose, so moving between
   the two repos costs nothing: a role is a **preset over a per-section
   permission map**, not a thing anything branches on. The designs show fixed
   grades, but the requirement is "give the employee access to what I want",
   which fixed grades cannot express.

   Everything downstream reads the map, never the role name. Do not write
   `role === 'ADMIN'` anywhere — a CUSTOM member has to behave like any other.

   Pure and dependency-free so it can be compiled and exercised on its own.

   ---------------------------------------------------------------------------
   This is a UI rule, not a security boundary. Hiding a sidebar link stops
   nobody from calling the API directly. Until the resolvers check a staff role
   server-side, this only shapes the console — see README.
   --------------------------------------------------------------------------- */

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER' | 'CUSTOM';

export type Access = 'NONE' | 'VIEW' | 'MANAGE';

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'View-only',
  CUSTOM: 'Custom'
};

export const ACCESS_LABEL: Record<Access, string> = {
  NONE: 'No access',
  VIEW: 'Can view',
  MANAGE: 'Can manage'
};

/** Super admin is deliberately absent: it is not handed out from this list. */
export const ASSIGNABLE_ROLES: Role[] = ['ADMIN', 'EDITOR', 'VIEWER', 'CUSTOM'];

export interface Section {
  key: string;
  label: string;
  /**
   * Matches NavItem.href in components/console/navigation.ts — that is how the
   * sidebar filters itself. A new nav item without a section here would be
   * visible to everyone.
   */
  href: string | null;
  hint: string;
}

export const SECTIONS: Section[] = [
  { key: 'analytics', label: 'Analytics', href: '/', hint: 'Revenue, orders and the review queue' },
  { key: 'users', label: 'Users', href: '/users', hint: 'Every account on the marketplace' },
  { key: 'categories', label: 'Categories', href: '/categories', hint: 'Categories and subcategories' },
  { key: 'brands', label: 'Brands', href: '/brands', hint: 'Brand list' },
  { key: 'orders', label: 'Orders', href: '/orders', hint: 'Every order across all stores' },
  { key: 'products', label: 'Products', href: '/products', hint: 'Listings, and approving them for sale' },
  { key: 'stores', label: 'Stores', href: '/stores', hint: 'Seller profiles and suspension' },
  { key: 'plans', label: 'Plans', href: '/plans', hint: 'Prices, discounts and plan points' },
  { key: 'withdrawals', label: 'Withdrawals', href: '/withdrawals', hint: 'Releasing money to sellers' },
  { key: 'chats', label: 'Chats', href: '/chats', hint: 'Support conversations' },
  { key: 'complaints', label: 'Complaints', href: '/complaints', hint: 'Complaint queue' },
  { key: 'settings', label: 'Settings', href: '/settings', hint: 'Your own profile and password' },
  { key: 'team', label: 'Team access', href: null, hint: 'Granting access to staff' }
];

export const SECTION_KEYS = SECTIONS.map((section) => section.key);

export type Permissions = Record<string, Access>;

const everySection = (level: Access): Permissions =>
  Object.fromEntries(SECTION_KEYS.map((key) => [key, level]));

const withOverrides = (base: Access, overrides: Permissions): Permissions => ({
  ...everySection(base),
  ...overrides
});

/**
 * The super admin alone moves money and grants access.
 *
 * ADMIN gets VIEW on withdrawals, not MANAGE — an admin with MANAGE could
 * release the marketplace's money into a bank account. That is the one
 * mistake worth naming here because it is easy to make: the seller app had
 * exactly this bug, with a comment above it claiming otherwise.
 */
export const ROLE_PRESETS: Record<Exclude<Role, 'CUSTOM'>, Permissions> = {
  SUPER_ADMIN: everySection('MANAGE'),

  ADMIN: withOverrides('MANAGE', {
    withdrawals: 'VIEW',
    plans: 'VIEW',
    team: 'NONE'
  }),

  EDITOR: withOverrides('VIEW', {
    categories: 'MANAGE',
    brands: 'MANAGE',
    products: 'MANAGE',
    complaints: 'MANAGE',
    chats: 'MANAGE',
    settings: 'MANAGE',
    withdrawals: 'NONE',
    plans: 'NONE',
    team: 'NONE'
  }),

  VIEWER: withOverrides('VIEW', {
    withdrawals: 'NONE',
    team: 'NONE',
    // their own profile and password are still theirs to change
    settings: 'MANAGE'
  })
};

export const permissionsFor = (
  role: Role,
  custom?: Permissions
): Permissions =>
  role === 'CUSTOM'
    ? { ...everySection('NONE'), ...(custom ?? {}) }
    : ROLE_PRESETS[role];

export const canView = (permissions: Permissions, key: string): boolean =>
  permissions[key] === 'VIEW' || permissions[key] === 'MANAGE';

export const canManage = (permissions: Permissions, key: string): boolean =>
  permissions[key] === 'MANAGE';

export const visibleSections = (permissions: Permissions): Section[] =>
  SECTIONS.filter((section) => canView(permissions, section.key));

/** One line for the members list: "Manages 6, views 4". */
export const summarise = (permissions: Permissions): string => {
  const manage = SECTION_KEYS.filter((key) => permissions[key] === 'MANAGE').length;
  const view = SECTION_KEYS.filter((key) => permissions[key] === 'VIEW').length;
  if (manage === 0 && view === 0) return 'No access';
  if (manage === SECTION_KEYS.length) return 'Full access';
  return [
    manage > 0 ? `Manages ${manage}` : null,
    view > 0 ? `views ${view}` : null
  ]
    .filter(Boolean)
    .join(', ');
};

/* ---------------- guards ---------------- */

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  custom?: Permissions;
  active: boolean;
}

export const isSuperAdmin = (member: Member): boolean =>
  member.role === 'SUPER_ADMIN';

const activeSuperAdmins = (team: Member[]): Member[] =>
  team.filter((member) => member.active && isSuperAdmin(member));

export const isLastSuperAdmin = (team: Member[], id: string): boolean => {
  const supers = activeSuperAdmins(team);
  return supers.length === 1 && supers[0].id === id;
};

/**
 * Null when `actor` may change `target` to `next`.
 *
 * A console with nobody who can grant access is a console locked out of
 * itself, so the last super admin cannot be demoted — by anyone, including
 * themselves.
 */
export const roleChangeProblem = (
  actor: Member,
  target: Member,
  next: Role,
  team: Member[]
): string | null => {
  if (!isSuperAdmin(actor)) return 'Only a super admin can change access.';

  if (next === 'SUPER_ADMIN')
    return 'Super admin is not handed out from here. Ask an existing one to promote the account.';

  if (isSuperAdmin(target) && isLastSuperAdmin(team, target.id))
    return `${target.name} is the only super admin. Promote someone else first, or nobody will be able to grant access.`;

  return null;
};

export const removalProblem = (
  actor: Member,
  target: Member,
  team: Member[]
): string | null => {
  if (!isSuperAdmin(actor)) return 'Only a super admin can remove access.';

  if (target.id === actor.id)
    return 'You cannot remove your own access from here.';

  if (isSuperAdmin(target) && isLastSuperAdmin(team, target.id))
    return `${target.name} is the only super admin. Promote someone else first.`;

  return null;
};

/** A custom grant with nothing ticked is a member who cannot sign in usefully. */
export const customProblem = (permissions: Permissions): string | null =>
  Object.values(permissions).every((level) => level === 'NONE')
    ? 'Give them access to at least one section, or they will have nowhere to land.'
    : null;
