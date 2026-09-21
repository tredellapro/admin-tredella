'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
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
import { STORES } from 'data/stores';
import type { ActiveStatus, AdminStore } from 'types/console';
import { money, monthKey, monthOptions, shortDate } from 'lib/format';
import { downloadCsv } from 'lib/csv';

const FILTERS: FilterDef<AdminStore>[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' }
    ],
    match: (store, value) => store.status === value
  },
  {
    key: 'verified',
    label: 'Verification',
    options: [
      { value: 'YES', label: 'Verified' },
      { value: 'NO', label: 'Unverified' }
    ],
    match: (store, value) => (value === 'YES') === store.verified
  },
  {
    key: 'created',
    label: 'Created',
    options: monthOptions(STORES.map((store) => store.createdAt)),
    match: (store, value) => monthKey(store.createdAt) === value
  }
];

export default function StoresPage() {
  const [stores, setStores] = useState<AdminStore[]>(STORES);
  const [editing, setEditing] = useState<AdminStore | null>(null);
  const [removing, setRemoving] = useState<AdminStore | null>(null);
  const [draftStatus, setDraftStatus] = useState<ActiveStatus>('ACTIVE');

  const table = useTableState<AdminStore>({
    rows: stores,
    searchIn: (store) => `${store.id} ${store.name} ${store.ownerName} ${store.ownerEmail}`,
    filters: FILTERS
  });

  const columns: Column<AdminStore>[] = [
    { key: 'id', header: 'Store ID', cell: (store) => store.id },
    {
      key: 'name',
      header: 'Store Name',
      primary: true,
      cell: (store) => (
        <Link
          href={`/stores/${store.id}`}
          className="flex items-center gap-3 transition-colors hover:text-primary"
        >
          <Avatar src={store.logo} name={store.name} size={40} shape="square" />
          <span>
            <span className="block font-medium text-secondary">{store.name}</span>
            <span className="block text-12 text-gray">{store.ownerName}</span>
          </span>
        </Link>
      )
    },
    { key: 'sales', header: 'Sales', cell: (store) => money(store.sales, 0) },
    {
      key: 'verified',
      header: 'Verification',
      cell: (store) => (
        <StatusBadge tone={store.verified ? 'success' : 'warning'}>
          {store.verified ? 'Verified' : 'Unverified'}
        </StatusBadge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (store) => (
        <StatusBadge status={store.status}>
          {store.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </StatusBadge>
      )
    },
    {
      key: 'created',
      header: 'Created Date',
      cell: (store) => shortDate(store.createdAt)
    },
    {
      key: 'actions',
      header: 'Actions',
      actions: true,
      cell: (store) => (
        <div className="flex items-center gap-2">
          <IconButton
            label={`Edit ${store.name}`}
            icon={<HiOutlinePencil />}
            onClick={() => {
              setDraftStatus(store.status);
              setEditing(store);
            }}
          />
          <IconButton
            label={`Open ${store.name}`}
            icon={<HiOutlineEye />}
            tone="neutral"
            href={`/stores/${store.id}`}
          />
          <IconButton
            label={`Suspend ${store.name}`}
            icon={<HiOutlineTrash />}
            onClick={() => setRemoving(store)}
          />
        </div>
      )
    }
  ];

  const exportCsv = () =>
    downloadCsv(
      'tredella-stores.csv',
      [
        { header: 'Store ID', value: (s: AdminStore) => s.id },
        { header: 'Name', value: (s: AdminStore) => s.name },
        { header: 'Owner', value: (s: AdminStore) => s.ownerName },
        { header: 'Email', value: (s: AdminStore) => s.ownerEmail },
        { header: 'Sales (AED)', value: (s: AdminStore) => s.sales },
        { header: 'Verified', value: (s: AdminStore) => (s.verified ? 'Yes' : 'No') },
        { header: 'Status', value: (s: AdminStore) => s.status },
        { header: 'Created', value: (s: AdminStore) => s.createdAt }
      ],
      stores
    );

  return (
    <>
      <PageHeading
        title="Stores"
        trail={[{ label: 'Stores' }, { label: 'Stores' }]}
      />
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
          searchPlaceholder="Search store or owner"
        />

        <div className="px-4 py-4 sm:px-5">
          <DataTable
            columns={columns}
            rows={table.visible}
            rowKey={(store) => store.id}
            empty="No stores match those filters."
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
        title="Edit Stores"
        width="sm"
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Change Status</span>
            <select
              value={draftStatus}
              onChange={(event) =>
                setDraftStatus(event.target.value as ActiveStatus)
              }
              className="rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          <p className="text-12 leading-relaxed text-gray">
            An inactive store disappears from the storefront and its seller
            cannot withdraw. Their listings and orders are left untouched.
          </p>

          <div className="mt-1 flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              fullWidth
              onClick={() => {
                if (!editing) return;
                setStores((current) =>
                  current.map((store) =>
                    store.id === editing.id
                      ? { ...store, status: draftStatus }
                      : store
                  )
                );
                setEditing(null);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Suspend store"
        width="sm"
      >
        <p className="text-13 leading-relaxed text-gray">
          {removing?.name} will be hidden from buyers and its seller locked out
          of withdrawals. Orders already placed still have to be fulfilled, so
          nothing is deleted — you can set it back to Active at any time.
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
          <Button
            type="button"
            fullWidth
            onClick={() => {
              setStores((current) =>
                current.map((store) =>
                  store.id === removing?.id
                    ? { ...store, status: 'INACTIVE' }
                    : store
                )
              );
              setRemoving(null);
            }}
          >
            Suspend
          </Button>
        </div>
      </Modal>
    </>
  );
}
