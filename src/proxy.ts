import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TOKEN_COOKIE } from 'lib/token';

/* Next 16 calls this convention "proxy" (it replaced middleware.ts).

   This console has no public surface at all — every route but /login is staff
   only — so the gate works by exclusion rather than by listing protected
   paths. Screens added later are covered the moment they exist, which is the
   right default for an internal tool: forgetting to add a path here should
   lock people out, not let them in.

   Presence-only check. The API verifies the token on every request, so a
   forged cookie buys nothing beyond getting past this redirect. */

const LOGIN = '/login';

export function proxy(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname, search } = req.nextUrl;

  if (pathname === LOGIN) {
    return token ? NextResponse.redirect(new URL('/', req.url)) : NextResponse.next();
  }

  if (token) return NextResponse.next();

  const login = new URL(LOGIN, req.url);
  login.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(login);
}

/* `assets` has to be excluded or the sign-in page could not load its own logo
   while signed out — the request for it would be redirected to /login too. */
export const config = {
  matcher: ['/((?!_next/static|_next/image|assets|favicon.ico).*)']
};
