'use client';

import { useState } from 'react';
import { HiOutlineLockClosed, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import Card, { CardTitle } from 'components/ui/Card';
import Avatar from 'components/ui/Avatar';
import StatusBadge from 'components/ui/StatusBadge';
import Button from 'components/ui/Button';
import Modal from 'components/ui/Modal';
import FormError from 'components/auth/FormError';
import { useAccess } from 'components/console/AccessContext';
import type { TeamMember } from 'data/team';
import {
  ACCESS_LABEL,
  ASSIGNABLE_ROLES,
  JOB_TEMPLATES,
  ROLE_LABEL,
  SECTIONS,
  applyTemplate,
  customProblem,
  permissionsFor,
  removalProblem,
  roleChangeProblem,
  summarise,
  type Access,
  type Permissions,
  type Role
} from 'lib/access';

const LEVELS: Access[] = ['NONE', 'VIEW', 'MANAGE'];

export default function TeamAccessTab() {
  const { me, manage, team: initialTeam } = useAccess();
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [role, setRole] = useState<Role>('VIEWER');
  const [grants, setGrants] = useState<Permissions>({});
  const [problem, setProblem] = useState<string | null>(null);

  /* The tab is only rendered for someone who can manage the team, but say why
     rather than showing a blank card if that ever changes. */
  if (!manage('team'))
    return (
      <Card className="max-w-[560px]">
        <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-22 text-primary">
            <HiOutlineLockClosed aria-hidden="true" />
          </span>
          <h2 className="text-16 font-semibold text-secondary">
            Only a super admin can grant access
          </h2>
          <p className="max-w-[380px] text-13 leading-relaxed text-gray">
            Access control and releasing money are the two things kept with the
            super admin, so that an account cannot widen its own permissions.
          </p>
        </div>
      </Card>
    );

  const open = (member: TeamMember) => {
    setRole(member.role);
    setGrants(permissionsFor(member.role, member.custom));
    setProblem(null);
    setEditing(member);
  };

  const pickRole = (next: Role) => {
    setRole(next);
    /* Switching to a preset replaces the ticks so what is shown is what will
       be saved; CUSTOM keeps whatever is already there to edit from. */
    if (next !== 'CUSTOM') setGrants(permissionsFor(next));
    setProblem(null);
  };

  const setLevel = (key: string, level: Access) => {
    setGrants((current) => ({ ...current, [key]: level }));
    /* Hand-editing a preset makes it custom by definition — otherwise the
       saved row would claim a role it no longer matches. */
    setRole('CUSTOM');
    setProblem(null);
  };

  const save = () => {
    if (!editing) return;

    const change = roleChangeProblem(me, editing, role, team);
    if (change) {
      setProblem(change);
      return;
    }
    if (role === 'CUSTOM') {
      const empty = customProblem(grants);
      if (empty) {
        setProblem(empty);
        return;
      }
    }

    setTeam((current) =>
      current.map((member) =>
        member.id === editing.id
          ? { ...member, role, custom: role === 'CUSTOM' ? grants : undefined }
          : member
      )
    );
    setEditing(null);
  };

  const confirmRemove = () => {
    if (!removing) return;
    const stop = removalProblem(me, removing, team);
    if (stop) {
      setProblem(stop);
      return;
    }
    setTeam((current) =>
      current.map((member) =>
        member.id === removing.id ? { ...member, active: false } : member
      )
    );
    setRemoving(null);
  };

  return (
    <>
      <Card flush className="max-w-[860px]">
        <div className="px-4 pt-4 sm:px-5 sm:pt-5">
          <CardTitle>Team access</CardTitle>
          <p className="px-1 pb-4 text-13 leading-relaxed text-gray">
            A role is a starting point, not a cage — tick individual sections
            and the member becomes Custom. Releasing money and granting access
            stay with the super admin.
          </p>
        </div>

        <ul className="flex flex-col gap-3 px-4 pb-5 sm:px-5">
          {team.map((member) => {
            const permissions = permissionsFor(member.role, member.custom);
            const isMe = member.id === me.id;

            return (
              <li
                key={member.id}
                className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${
                  member.active ? 'border-secondary/10' : 'border-secondary/10 opacity-60'
                }`}
              >
                <Avatar name={member.name} size={40} />

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-14 font-medium text-secondary">
                    {member.name}
                    {isMe && <span className="text-12 text-gray">(you)</span>}
                    <StatusBadge
                      tone={member.role === 'SUPER_ADMIN' ? 'danger' : 'neutral'}
                    >
                      {ROLE_LABEL[member.role]}
                    </StatusBadge>
                    {!member.active && (
                      <StatusBadge tone="neutral">Removed</StatusBadge>
                    )}
                  </p>
                  <p className="truncate text-12 text-gray">{member.email}</p>
                  <p className="mt-0.5 text-12 text-gray">
                    {summarise(permissions)} · active {member.lastActive}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => open(member)}
                    aria-label={`Edit access for ${member.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/8 text-14 text-primary transition-colors hover:bg-primary/15"
                  >
                    <HiOutlinePencil />
                  </button>
                  <button
                    type="button"
                    disabled={!member.active}
                    onClick={() => {
                      setProblem(null);
                      setRemoving(member);
                    }}
                    aria-label={`Remove access for ${member.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/8 text-14 text-primary transition-colors hover:bg-primary/15 disabled:opacity-30"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Access for ${editing?.name ?? ''}`}
        width="md"
      >
        <div className="flex flex-col gap-4">
          <FormError message={problem} />

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Role</span>
            <select
              value={role}
              onChange={(event) => pickRole(event.target.value as Role)}
              className="rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
            >
              {editing?.role === 'SUPER_ADMIN' && (
                <option value="SUPER_ADMIN">Super admin</option>
              )}
              {ASSIGNABLE_ROLES.map((entry) => (
                <option key={entry} value={entry}>
                  {ROLE_LABEL[entry]}
                </option>
              ))}
            </select>
          </label>

          {/* The three jobs the client described — "only view store", "check
              product and approve", "check the new seller info and verify" —
              are one click rather than thirteen. */}
          <div>
            <p className="pb-2 text-13 text-secondary">
              Or start from a job{' '}
              <span className="text-gray">(then adjust below)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {JOB_TEMPLATES.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  title={template.hint}
                  onClick={() => {
                    setGrants(applyTemplate(template));
                    setRole('CUSTOM');
                    setProblem(null);
                  }}
                  className="rounded-lg border border-secondary/20 px-3 py-1.5 text-12 text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="pb-2 text-13 text-secondary">Sections</p>
            <ul className="brand-scroll flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
              {SECTIONS.map((section) => (
                <li
                  key={section.key}
                  className="rounded-lg border border-secondary/10 p-2.5"
                >
                  <p className="text-13 font-medium text-secondary">
                    {section.label}
                  </p>
                  <p className="mb-2 text-11 text-gray">{section.hint}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {LEVELS.map((level) => {
                      const on = (grants[section.key] ?? 'NONE') === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setLevel(section.key, level)}
                          className={`rounded-md px-2.5 py-1 text-11 transition-colors ${
                            on
                              ? 'bg-primary text-white'
                              : 'bg-secondary/8 text-gray hover:text-secondary'
                          }`}
                        >
                          {ACCESS_LABEL[level]}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button type="button" fullWidth onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove access"
        width="sm"
      >
        <FormError message={problem} />

        <p className="mt-2 text-13 leading-relaxed text-gray">
          {removing?.name} will not be able to sign in to the console. Their
          account is not deleted and nothing they did is removed — you can give
          the access back at any time.
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => setRemoving(null)}
          >
            Cancel
          </Button>
          <Button type="button" fullWidth onClick={confirmRemove}>
            Remove
          </Button>
        </div>
      </Modal>
    </>
  );
}
