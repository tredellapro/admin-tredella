/* Changing your own console password.

   The API is the authority — it re-checks the length and verifies the current
   password against the hash, and only it can tell you the old one is wrong.
   These checks exist to catch what is knowable in the browser, so a typo in
   the confirm field does not cost a round trip.

   Pure and dependency-free so it can be compiled and exercised on its own. */

/** Must match MIN_PASSWORD_LENGTH in backend-tredella's auth.service.ts. */
export const MIN_PASSWORD_LENGTH = 6;

export interface PasswordDraft {
  current: string;
  next: string;
  confirm: string;
}

/**
 * Null when the change is worth sending, otherwise what to show.
 *
 * Ordered so the message always points at the field the person is most likely
 * still looking at: an empty box before a mismatch, a mismatch before a
 * strength complaint about a password they may have mistyped anyway.
 */
export const passwordProblem = (draft: PasswordDraft): string | null => {
  if (draft.current.length === 0) return 'Enter your current password.';
  if (draft.next.length === 0) return 'Enter a new password.';
  if (draft.confirm.length === 0) return 'Confirm the new password.';

  if (draft.next !== draft.confirm)
    return 'The new password and confirmation do not match.';

  if (draft.next.length < MIN_PASSWORD_LENGTH)
    return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

  /* Saving the same password is not an error the API would reject, but it is
     never what someone meant, and letting it "succeed" teaches them that the
     form lies about having done something. */
  if (draft.next === draft.current)
    return 'The new password is the same as the current one.';

  return null;
};

export const canSubmit = (draft: PasswordDraft): boolean =>
  passwordProblem(draft) === null;

export type Strength = 'WEAK' | 'FAIR' | 'STRONG';

export const STRENGTH_LABEL: Record<Strength, string> = {
  WEAK: 'Weak',
  FAIR: 'Fair',
  STRONG: 'Strong'
};

/**
 * Advisory only — nothing is blocked on it.
 *
 * A console account can see every order, payout and customer on the
 * marketplace, so it is worth saying out loud when a password is thin. But a
 * strength meter that refuses to let you save is a meter that gets worked
 * around, so this only ever informs.
 */
export const strengthOf = (password: string): Strength => {
  if (password.length < MIN_PASSWORD_LENGTH) return 'WEAK';

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
    pattern.test(password)
  ).length;

  if (password.length >= 12 && classes >= 3) return 'STRONG';
  if (password.length >= 8 && classes >= 2) return 'FAIR';
  return 'WEAK';
};
