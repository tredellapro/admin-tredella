'use client';

import { useApolloClient, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { HiOutlineLogout } from 'react-icons/hi';
import { ME } from 'graphql/auth';
import { clearToken } from 'lib/token';
import type { MeResult } from 'types/auth';

/* Who is signed in, and the way out. It also proves the cookie actually
   authenticates against the API rather than merely existing, which is all the
   proxy can tell. */
export default function SessionBar() {
  const router = useRouter();
  const client = useApolloClient();

  // 'all' so an expired token still renders the bar — with the sign-out button
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 shadow-[0_4px_30px_rgba(43,52,69,0.06)]">
      <div className="min-w-0">
        <p className="truncate text-14 font-medium text-secondary">
          {me?.name ?? 'Signed in'}
        </p>
        <p className="truncate text-12 text-gray">{me?.email ?? '—'}</p>
      </div>

      <button
        type="button"
        onClick={signOut}
        className="flex items-center gap-1.5 rounded-lg border border-secondary/15 px-3 py-2 text-13 text-secondary transition-colors hover:border-primary/40 hover:text-primary"
      >
        <HiOutlineLogout aria-hidden="true" className="text-16" />
        Sign out
      </button>
    </div>
  );
}
