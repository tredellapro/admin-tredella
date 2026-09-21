import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthShell from 'components/auth/AuthShell';
import LoginForm from 'components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in · Tredella Admin'
};

/* The console's only public route. There is no sign-up and no self-service
   password reset by design — an admin account is created by another super
   admin, so neither screen has anything to hang off. */
export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      subtitle="Restricted to Tredella staff accounts."
      footnote="Admin access is granted by an existing super admin — there is no sign-up. Locked out? Ask another super admin to reset your password."
    >
      {/* useSearchParams needs a boundary so the shell can still prerender */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
