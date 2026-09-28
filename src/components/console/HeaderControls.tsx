'use client';

import { useApolloClient, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { HiOutlineBell, HiOutlineLogout } from 'react-icons/hi';
import Avatar from 'components/ui/Avatar';
import { ME } from 'graphql/auth';
import { clearToken } from 'lib/token';
import type { MeResult } from 'types/auth';

/** The pill-and-icons cluster on the right of every page heading. */
export default function HeaderControls() {
  const router = useRouter();
  const client = useApolloClient();

  // 'all' so an expired token still renders the bar — with the way out on it
  const { data } = useQuery<MeResult>(ME, { errorPolicy: 'all' });
  const me = data?.me;

  const signOut = async () => {
    clearToken();
    // clearStore, not resetStore: refetching active queries without a token
    // would only produce a wave of UNAUTHENTICATED errors on the way out
    await client.clearStore();
    router.replace('/login');
    router.refresh();
  };

  const icon =
    'flex h-9 w-9 items-center justify-center rounded-full text-18 text-secondary transition-colors hover:bg-primary/8 hover:text-primary';

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white px-2 py-1.5 shadow-[0_4px_20px_rgba(43,52,69,0.08)] sm:gap-2 sm:px-3">
      <button type="button" aria-label="Notifications" className={icon}>
        <HiOutlineBell />
      </button>

      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        title="Sign out"
        className={icon}
      >
        <HiOutlineLogout />
      </button>

      <span title={me?.email ?? undefined}>
        <Avatar src={me?.avatar} name={me?.name ?? 'Admin'} size={36} />
      </span>
    </div>
  );
}
