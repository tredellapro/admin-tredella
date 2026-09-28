'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import Card from 'components/ui/Card';
import PasswordField from 'components/ui/PasswordField';
import Button from 'components/ui/Button';
import FormError from 'components/auth/FormError';
import { CHANGE_PASSWORD } from 'graphql/auth';
import { errorMessage } from 'utils/graphqlError';
import {
  STRENGTH_LABEL,
  passwordProblem,
  strengthOf,
  type PasswordDraft
} from 'lib/passwordChange';
import type { ChangePasswordResult } from 'types/auth';

const EMPTY: PasswordDraft = { current: '', next: '', confirm: '' };

const STRENGTH_TONE = {
  WEAK: 'text-primary',
  FAIR: 'text-[#b07d17]',
  STRONG: 'text-[#1f9254]'
} as const;

/**
 * The one settings action that is wired to the real API — the backend already
 * has changePassword, and it is the authority: it re-checks the length and
 * verifies the current password against the hash. The local rules only catch
 * what is knowable here, so a typo in the confirm box does not cost a round
 * trip.
 */
export default function SecurityTab() {
  const [draft, setDraft] = useState<PasswordDraft>(EMPTY);
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [changePassword, { loading }] =
    useMutation<ChangePasswordResult>(CHANGE_PASSWORD);

  const patch = (changes: Partial<PasswordDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setProblem(null);
    setDone(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const local = passwordProblem(draft);
    if (local) {
      setProblem(local);
      return;
    }

    try {
      const { data } = await changePassword({
        variables: {
          currentPassword: draft.current,
          newPassword: draft.next
        }
      });
      if (!data?.changePassword) throw new Error('Could not change the password.');

      /* Cleared rather than left filled: this form is often open on a shared
         screen, and there is no reason for the new password to sit in the DOM
         after it has been saved. */
      setDraft(EMPTY);
      setDone(true);
    } catch (error) {
      setProblem(errorMessage(error, 'Could not change the password.'));
    }
  };

  const strength = draft.next ? strengthOf(draft.next) : null;

  return (
    <Card className="max-w-[560px]">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <h2 className="text-16 font-semibold text-secondary">Security</h2>
          <Button type="submit" loading={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>

        <FormError message={problem} />

        {done && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-lg bg-[#e7f7ee] px-3 py-2.5 text-13 text-[#1f9254]"
          >
            <HiOutlineCheckCircle className="mt-0.5 shrink-0 text-15" />
            <span>
              Password changed. You stay signed in here; anywhere else will need
              the new one.
            </span>
          </p>
        )}

        <PasswordField
          name="current"
          label="Old Password"
          autoComplete="current-password"
          value={draft.current}
          onChange={(event) => patch({ current: event.target.value })}
        />

        <div>
          <PasswordField
            name="next"
            label="New Password"
            autoComplete="new-password"
            value={draft.next}
            onChange={(event) => patch({ next: event.target.value })}
          />
          {strength && (
            <p className={`mt-1.5 text-12 ${STRENGTH_TONE[strength]}`}>
              Strength: {STRENGTH_LABEL[strength]}
              {strength === 'WEAK' &&
                ' — this account can see every order, payout and customer.'}
            </p>
          )}
        </div>

        <PasswordField
          name="confirm"
          label="Confirm Password"
          autoComplete="new-password"
          value={draft.confirm}
          onChange={(event) => patch({ confirm: event.target.value })}
        />
      </form>
    </Card>
  );
}
