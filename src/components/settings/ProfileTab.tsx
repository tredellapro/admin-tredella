'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { HiOutlinePencil } from 'react-icons/hi';
import Card from 'components/ui/Card';
import Avatar from 'components/ui/Avatar';
import Button from 'components/ui/Button';
import TextField from 'components/ui/TextField';
import DetailRows from 'components/ui/DetailRows';
import { ME } from 'graphql/auth';
import type { MeResult } from 'types/auth';

/**
 * The backend stores one `name` column, the design asks for First and Last.
 * Split on the first space and rejoin on save — the same shape registerSeller
 * already uses, so a name with three words keeps its tail in the last-name
 * field rather than being quietly dropped.
 */
const splitName = (name: string): { first: string; last: string } => {
  const parts = name.trim().split(/\s+/);
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
};

export default function ProfileTab() {
  const { data } = useQuery<MeResult>(ME, { errorPolicy: 'all' });
  const me = data?.me;

  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [picture, setPicture] = useState<string | null>(null);

  /* Seed from the query once it lands; `me` is undefined on first render. */
  useEffect(() => {
    if (!me) return;
    const { first: f, last: l } = splitName(me.name);
    setFirst(f);
    setLast(l);
  }, [me]);

  const avatar = picture ?? me?.avatar ?? null;
  const fullName = [first, last].filter(Boolean).join(' ') || me?.name || 'Admin';

  const pickPicture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    /* Preview only. There is no upload endpoint, so this never leaves the
       browser — revoked when it is replaced so the blob is not held forever. */
    setPicture((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  return (
    <Card className="max-w-[560px]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-4">
        <h2 className="text-16 font-semibold text-secondary">
          Profile Management
        </h2>

        {editing ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (me) {
                  const { first: f, last: l } = splitName(me.name);
                  setFirst(f);
                  setLast(l);
                }
                setPicture(null);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => setEditing(false)}>
              Save Changes
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/8 text-16 text-primary transition-colors hover:bg-primary/15"
          >
            <HiOutlinePencil />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={avatar} name={fullName} size={64} />
            <label className="cursor-pointer text-13 font-medium text-primary hover:underline">
              {avatar ? 'Change Picture' : 'Upload picture'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={pickPicture}
                className="sr-only"
              />
            </label>
          </div>

          <TextField
            name="firstName"
            label="First Name"
            value={first}
            onChange={(event) => setFirst(event.target.value)}
          />

          <TextField
            name="lastName"
            label="Last Name"
            value={last}
            onChange={(event) => setLast(event.target.value)}
          />

          <TextField
            name="email"
            label="Email"
            value={me?.email ?? ''}
            readOnly
            disabled
            className="bg-secondary/[0.06]"
          />

          <p className="text-12 leading-relaxed text-gray">
            The email address is what you sign in with and cannot be changed
            here. Nothing on this tab is saved yet — the API has no profile
            mutation, so the name and picture reset on reload.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2 pb-5">
            <Avatar src={avatar} name={fullName} size={72} />
            <p className="text-13 font-medium text-primary">Profile Picture</p>
          </div>

          <DetailRows
            rows={[
              { label: 'First Name', value: first || '—' },
              { label: 'Last Name', value: last || '—' },
              { label: 'Email Address', value: me?.email ?? '—' }
            ]}
          />
        </>
      )}
    </Card>
  );
}
