'use client';

import { ApolloProvider } from '@apollo/client';
import type { ReactNode } from 'react';
import client from 'config/apolloClient';

/* The session is the backend's own JWT held in a cookie (see lib/token), so
   there is no second session layer here — Apollo attaches it per request.

   The seller app wraps this in a Redux store as well; nothing here needs one
   yet, so it is left out rather than carried for its own sake. */
export default function AppProviders({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
