import type { Member, Permissions } from 'lib/access';

/* The console's own staff.

   Nothing on the backend models this: `User.role` is BUYER | SELLER | ADMIN,
   so every admin account is currently a super admin as far as the API is
   concerned. These rows are the stand-in, and the real enforcement has to be
   server-side — see README.

   Emails match the accounts created by `npm run admin:create`, so signing in
   as either of them lands on the right permissions. */

export interface TeamMember extends Member {
  /** Only set when role is CUSTOM. */
  custom?: Permissions;
  /** Pre-formatted; no clock is read during render. */
  lastActive: string;
}

export const TEAM: TeamMember[] = [
  {
    id: 'T-1',
    name: 'Tredella Super Admin',
    email: 'admin@gmail.com',
    role: 'SUPER_ADMIN',
    active: true,
    lastActive: 'Today'
  },
  {
    id: 'T-2',
    name: 'Tredella Admin',
    email: 'admin2@gmail.com',
    role: 'SUPER_ADMIN',
    active: true,
    lastActive: 'Today'
  },
  {
    id: 'T-3',
    name: 'Hamza Tariq',
    email: 'hamzatariq@gmail.com',
    role: 'ADMIN',
    active: true,
    lastActive: '2 hours ago'
  },
  {
    id: 'T-4',
    name: 'Sara Ahmad',
    email: 'sarahamd@gmail.com',
    role: 'EDITOR',
    active: true,
    lastActive: 'Yesterday'
  },
  {
    id: 'T-5',
    name: 'Fahad Iqbal',
    email: 'fahadiqbal@gmail.com',
    role: 'VIEWER',
    active: true,
    lastActive: '3 days ago'
  },
  {
    id: 'T-6',
    name: 'Ayesha Malik',
    email: 'ayeshamalik@gmail.com',
    role: 'CUSTOM',
    /* The case fixed grades cannot express: someone who only handles the
       support queues and nothing else. */
    custom: {
      chats: 'MANAGE',
      complaints: 'MANAGE',
      orders: 'VIEW',
      settings: 'MANAGE'
    },
    active: true,
    lastActive: 'Last week'
  },
  {
    id: 'T-7',
    name: 'Ali Zafar',
    email: 'alizafar@gmail.com',
    role: 'EDITOR',
    active: false,
    lastActive: 'June'
  }
];

export const memberByEmail = (email: string): TeamMember | undefined =>
  TEAM.find(
    (member) => member.email.toLowerCase() === email.trim().toLowerCase()
  );
