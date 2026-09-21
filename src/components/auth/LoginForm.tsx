'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FormError from './FormError';
import TextField from 'components/ui/TextField';
import PasswordField from 'components/ui/PasswordField';
import Button from 'components/ui/Button';
import { LOGIN_ADMIN } from 'graphql/auth';
import { setToken } from 'lib/token';
import { errorMessage } from 'utils/graphqlError';
import type { LoginResult } from 'types/auth';

const schema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address.')
    .required('Email is required.'),
  password: Yup.string().required('Password is required.')
});

/* `next` arrives in the URL, so it is attacker-controllable: only same-origin
   paths are honoured. Without this, `?next=https://evil.example` (or the
   protocol-relative `//evil.example`) would turn the console's own sign-in
   into an open redirect — a ready-made phishing hop for a staff account. */
const safeNext = (value: string | null): string =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [login, { loading }] = useMutation<LoginResult>(LOGIN_ADMIN);

  const next = safeNext(searchParams.get('next'));

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      setSubmitError(null);
      try {
        const { data } = await login({
          variables: { email: email.trim(), password }
        });
        if (!data?.login?.token) throw new Error('Sign in failed.');

        setToken(data.login.token);
        router.push(next);
        // so the proxy re-runs and server components see the new cookie
        router.refresh();
      } catch (error) {
        setSubmitError(errorMessage(error, 'Could not sign you in.'));
      }
    }
  });

  const fieldError = (name: 'email' | 'password') =>
    formik.touched[name] && formik.errors[name];

  return (
    <form
      onSubmit={formik.handleSubmit}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormError message={submitError} />

      <TextField
        name="email"
        type="email"
        label="Email"
        placeholder="admin@tredella.com"
        autoComplete="email"
        autoFocus
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={fieldError('email')}
      />

      <PasswordField
        name="password"
        label="Password"
        autoComplete="current-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={fieldError('password')}
      />

      <Button type="submit" size="lg" fullWidth loading={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
