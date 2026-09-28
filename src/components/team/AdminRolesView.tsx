'use client';

import { useMemo, useState } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlinePencil,
  HiOutlineTrash
} from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import Card, { CardTitle } from 'components/ui/Card';
import Avatar from 'components/ui/Avatar';
import StatusBadge from 'components/ui/StatusBadge';
import SearchInput from 'components/ui/SearchInput';
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

const field =
  'w-full rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary';

/** Same shape as the seller app's User Roles screen, one level up. */
export default function AdminRolesView() {
  const { me, manage, team: initialTeam } = useAccess();
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [term, setTerm] = useState('');

  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('VIEWER');
  const [inviteProblem, setInviteProblem] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [role, setRole] = useState<Role>('VIEWER');
  const [grants, setGrants] = useState<Permissions>({});
  const [problem, setProblem] = useState<string | null>(null);

  const mayManage = manage('team');

  const rows = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return team.filter(
      (member) =>
        needle.length === 0 ||
        `${member.name} ${member.email} ${ROLE_LABEL[member.role]}`
          .toLowerCase()
          .includes(needle)
    );
  }, [team, term]);

  const addAdmin = () => {
    const email = inviteEmail.trim().toLowerCase();
    const name = inviteName.trim();

    if (!name) {
      setInviteProblem('Give the person a name.');
      return;
    }
    if (!email.includes('@')) {
      setInviteProblem('Enter their email address.');
      return;
    }
    if (team.some((member) => member.email.toLowerCase() === email)) {
      setInviteProblem('Someone with that email is already on the team.');
      return;
    }

    setTeam((current) => [
      ...current,
      {
        // index-derived, not random: this renders on the server first
        id: `T-new-${current.length}`,
        name,
        email,
        role: inviteRole,
        active: true,
        lastActive: 'Invited'
      }
    ]);
    setInviteName('');
    setInviteEmail('');
    setInviteProblem(null);
    setAdded(email);
  };

  const open = (member: TeamMember) => {
    setRole(member.role);
    setGrants(permissionsFor(member.role, member.custom));
    setProblem(null);
    setEditing(member);
  };

  const pickRole = (next: Role) => {
    setRole(next);
    if (next !== 'CUSTOM') setGrants(permissionsFor(next));
    setProblem(null);
  };

  const setLevel = (key: string, level: Access) => {
    setGrants((current) => ({ ...current, [key]: level }));
    /* Hand-editing a preset makes it custom by definition. */
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
      <PageHeading
        title="Admin Roles"
        trail={[{ label: 'Users', href: '/users' }, { label: 'Admin Roles' }]}
      />

      <p className="mb-4 flex items-start gap-2 rounded-lg bg-white px-3 py-2.5 text-12 leading-relaxed text-gray shadow-[0_2px_12px_rgba(43,52,69,0.05)]">
        <HiOutlineInformationCircle
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-14 text-primary"
        />
        <span>
          Only a super admin can reach this screen. A role is a starting point —
          pick a job or tick individual sections, and the person becomes Custom.
          Releasing money and granting access stay with the super admin.
        </span>
      </p>

      {/* ---- add an admin ---- */}
      <Card className="mb-4">
        <CardTitle>Add an admin</CardTitle>

        <div className="flex flex-col gap-3">
          <FormError message={inviteProblem} />

          {added && (
            <p
              role="status"
              className="flex items-start gap-2 rounded-lg bg-[#e7f7ee] px-3 py-2.5 text-12 leading-relaxed text-[#1f9254]"
            >
              <HiOutlineCheckCircle className="mt-0.5 shrink-0 text-15" />
              <span>
                {added} added with the access below. They still need a sign-in:
                run{' '}
                <code className="text-secondary">
                  npm run admin:create -- {added} &lt;password&gt;
                </code>{' '}
                in the backend until the invite mutation exists.
              </span>
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_160px_auto]">
            <input
              value={inviteName}
              placeholder="Full name"
              aria-label="Name"
              onChange={(event) => {
                setInviteName(event.target.value);
                setInviteProblem(null);
              }}
              className={field}
            />
            <input
              type="email"
              value={inviteEmail}
              placeholder="name@tredella.com"
              aria-label="Email"
              onChange={(event) => {
                setInviteEmail(event.target.value);
                setInviteProblem(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addAdmin();
              }}
              className={field}
            />
            <select
              value={inviteRole}
              aria-label="Role"
              onChange={(event) => setInviteRole(event.target.value as Role)}
              className={field}
            >
              {ASSIGNABLE_ROLES.map((entry) => (
                <option key={entry} value={entry}>
                  {ROLE_LABEL[entry]}
                </option>
              ))}
            </select>
            <Button type="button" onClick={addAdmin}>
              Add admin
            </Button>
          </div>
        </div>
      </Card>

      {/* ---- the team ---- */}
      <Card flush>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary/8 px-4 py-4 sm:px-5">
          <h2 className="text-16 font-semibold text-secondary">
            Admins &amp; roles
          </h2>
          <SearchInput
            value={term}
            onChange={setTerm}
            placeholder="Search name or email"
          />
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-14 text-center text-14 text-gray">
            Nobody matches that search.
          </p>
        ) : (
          <ul className="flex flex-col gap-3 px-4 py-4 sm:px-5">
            {rows.map((member) => {
              const permissions = permissionsFor(member.role, member.custom);
              const isMe = member.id === me.id;

              return (
                <li
                  key={member.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border border-secondary/10 p-3 ${
                    member.active ? '' : 'opacity-60'
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
                      {member.lastActive === 'Invited' && (
                        <StatusBadge tone="warning">Needs a sign-in</StatusBadge>
                      )}
                    </p>
                    <p className="truncate text-12 text-gray">{member.email}</p>
                    <p className="mt-0.5 text-12 text-gray">
                      {summarise(permissions)}
                      {member.lastActive !== 'Invited' &&
                        ` · active ${member.lastActive}`}
                    </p>
                  </div>

                  {mayManage && (
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
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* ---- permissions ---- */}
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
              className={field}
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
