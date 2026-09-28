'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiOutlinePencil, HiOutlineShieldCheck, HiOutlineTrash } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import { useAccess } from 'components/console/AccessContext';
import SampleDataNote from 'components/console/SampleDataNote';
import Card from 'components/ui/Card';
import DataTable, { type Column } from 'components/ui/DataTable';
import Toolbar from 'components/ui/Toolbar';
import Pagination from 'components/ui/Pagination';
import StatusBadge from 'components/ui/StatusBadge';
import Avatar from 'components/ui/Avatar';
import IconButton from 'components/ui/IconButton';
import Modal from 'components/ui/Modal';
import Button from 'components/ui/Button';
import { useTableState, type FilterDef } from 'hooks/useTableState';
import { USERS } from 'data/users';
import { ROLE_LABEL, type AdminUser, type UserRole } from 'types/console';
import { monthKey, monthOptions, shortDate } from 'lib/format';
import { downloadCsv } from 'lib/csv';

const ROLES: UserRole[] = ['ADMIN', 'EDITOR', 'VIEW_ONLY', 'SELLER', 'BUYER'];

const FILTERS: FilterDef<AdminUser>[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' }
    ],
    match: (user, value) => user.status === value
  },
  {
    key: 'role',
    label: 'Role',
    options: ROLES.map((role) => ({ value: role, label: ROLE_LABEL[role] })),
    match: (user, value) => user.role === value
  },
  {
    key: 'joined',
    label: 'Joined',
    options: monthOptions(USERS.map((user) => user.joinedAt)),
    match: (user, value) => monthKey(user.joinedAt) === value
  }
];

export default function UsersPage() {
  const { view } = useAccess();
  const [users, setUsers] = useState<AdminUser[]>(USERS);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [removing, setRemoving] = useState<AdminUser | null>(null);
  const [draftRole, setDraftRole] = useState<UserRole>('BUYER');
  const [draftStatus, setDraftStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const table = useTableState<AdminUser>({
    rows: users,
    searchIn: (user) => `${user.name} ${user.email} ${ROLE_LABEL[user.role]}`,
    filters: FILTERS
  });

  const openEdit = (user: AdminUser) => {
    setDraftRole(user.role);
    setDraftStatus(user.status);
    setEditing(user);
  };

  const saveEdit = () => {
    if (!editing) return;
    setUsers((current) =>
      current.map((user) =>
        user.id === editing.id
          ? { ...user, role: draftRole, status: draftStatus }
          : user
      )
    );
    setEditing(null);
  };

  const confirmRemove = () => {
    if (!removing) return;
    /* Deactivates rather than erases, matching the account-lifecycle rule the
       seller app already follows: a deleted account has to be recoverable. */
    setUsers((current) =>
      current.map((user) =>
        user.id === removing.id ? { ...user, status: 'INACTIVE' } : user
      )
    );
    setRemoving(null);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'user',
      header: 'User',
      primary: true,
      cell: (user) => (
        <Link
          href={`/users/${user.id}`}
          className="flex items-center gap-3 transition-colors hover:text-primary"
        >
          <Avatar src={user.avatar} name={user.name} size={40} />
          <span className="font-medium text-secondary">{user.name}</span>
        </Link>
      )
    },
    { key: 'email', header: 'Email', cell: (user) => user.email },
    { key: 'role', header: 'Role', cell: (user) => ROLE_LABEL[user.role] },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => (
        <StatusBadge status={user.status}>
          {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </StatusBadge>
      )
    },
    {
      key: 'joined',
      header: 'Joined Date',
      cell: (user) => shortDate(user.joinedAt)
    },
    {
      key: 'actions',
      header: 'Actions',
      actions: true,
      cell: (user) => (
        <div className="flex items-center gap-2">
          <IconButton
            label={`Edit ${user.name}`}
            icon={<HiOutlinePencil />}
            onClick={() => openEdit(user)}
          />
          <IconButton
            label={`Deactivate ${user.name}`}
            icon={<HiOutlineTrash />}
            onClick={() => setRemoving(user)}
          />
        </div>
      )
    }
  ];

  const exportCsv = () =>
    downloadCsv(
      'tredella-users.csv',
      [
        { header: 'Name', value: (u: AdminUser) => u.name },
        { header: 'Email', value: (u: AdminUser) => u.email },
        { header: 'Role', value: (u: AdminUser) => ROLE_LABEL[u.role] },
        { header: 'Status', value: (u: AdminUser) => u.status },
        { header: 'Joined', value: (u: AdminUser) => u.joinedAt }
      ],
      users
    );

  return (
    <>
      <PageHeading
        title="User Management"
        trail={[{ label: 'Users' }, { label: 'User Management' }]}
      />

      {/* Only a super admin can grant console access, so only they see the way
          in. The route is guarded too — this link is a convenience, not the
          lock. */}
      {view('team') && (
        <Link
          href="/users/roles"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 shadow-[0_2px_12px_rgba(43,52,69,0.05)] transition-colors hover:text-primary"
        >
          <span className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-16 text-primary">
              <HiOutlineShieldCheck aria-hidden="true" />
            </span>
            <span>
              <span className="block text-14 font-medium text-secondary">
                Admin roles
              </span>
              <span className="block text-12 text-gray">
                Add an admin and choose exactly what they can reach
              </span>
            </span>
          </span>
          <span className="text-13 font-medium text-primary">Open</span>
        </Link>
      )}

      <SampleDataNote />

      <Card flush>
        <Toolbar
          term={table.term}
          onSearch={table.search}
          filters={FILTERS}
          draft={table.draft}
          onDraftChange={table.setDraftValue}
          onApply={table.apply}
          chips={table.chips}
          onRemoveChip={table.removeChip}
          onExport={exportCsv}
          searchPlaceholder="Search name or email"
        />

        <div className="px-4 py-4 sm:px-5">
          <DataTable
            columns={columns}
            rows={table.visible}
            rowKey={(user) => user.id}
            empty="No users match those filters."
          />
        </div>

        <Pagination
          page={table.page}
          pageCount={table.pageCount}
          onChange={table.setPage}
        />
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit User"
        width="sm"
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Role</span>
            <select
              value={draftRole}
              onChange={(event) => setDraftRole(event.target.value as UserRole)}
              className="rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Status</span>
            <select
              value={draftStatus}
              onChange={(event) =>
                setDraftStatus(event.target.value as 'ACTIVE' | 'INACTIVE')
              }
              className="rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          <div className="mt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button type="button" fullWidth onClick={saveEdit}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Deactivate account"
        width="sm"
      >
        <p className="text-13 leading-relaxed text-gray">
          {removing?.name} will be signed out and blocked from signing in.
          Nothing is erased — their orders, reviews and messages stay, and you
          can set them back to Active at any time.
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
            Deactivate
          </Button>
        </div>
      </Modal>
    </>
  );
}
