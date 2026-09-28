'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { ME } from 'graphql/auth';
import { TEAM, memberByEmail, type TeamMember } from 'data/team';
import {
  canManage,
  canView,
  permissionsFor,
  type Member,
  type Permissions
} from 'lib/access';
import type { MeResult } from 'types/auth';

interface AccessValue {
  /** The signed-in staff member, or a stand-in super admin. */
  me: Member;
  permissions: Permissions;
  view: (_section: string) => boolean;
  manage: (_section: string) => boolean;
  team: TeamMember[];
}

const AccessCtx = createContext<AccessValue | null>(null);

/* Falls back to super admin when the signed-in email is not in the team list.
   That is fail-open, which is normally the wrong default — but the API has no
   staff-role column, so every ADMIN token really is a super admin today, and
   failing closed would lock someone out of their own console over data that
   does not exist yet. The moment the backend has roles, this default goes and
   the resolvers become the real guard. */
const STANDIN: Member = {
  id: 'me',
  name: 'Admin',
  email: '',
  role: 'SUPER_ADMIN',
  active: true
};

export function AccessProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery<MeResult>(ME, { errorPolicy: 'all' });
  const email = data?.me?.email;

  const value = useMemo<AccessValue>(() => {
    const found = email ? memberByEmail(email) : undefined;
    const me: Member = found ?? {
      ...STANDIN,
      name: data?.me?.name ?? STANDIN.name,
      email: email ?? ''
    };
    const permissions = permissionsFor(me.role, found?.custom);

    return {
      me,
      permissions,
      view: (section) => canView(permissions, section),
      manage: (section) => canManage(permissions, section),
      team: TEAM
    };
  }, [email, data?.me?.name]);

  return <AccessCtx.Provider value={value}>{children}</AccessCtx.Provider>;
}

export const useAccess = (): AccessValue => {
  const value = useContext(AccessCtx);
  if (!value) throw new Error('useAccess must be used inside AccessProvider');
  return value;
};
