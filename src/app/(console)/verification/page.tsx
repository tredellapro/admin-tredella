'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiOutlineEye } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import SampleDataNote from 'components/console/SampleDataNote';
import Card from 'components/ui/Card';
import DataTable, { type Column } from 'components/ui/DataTable';
import Toolbar from 'components/ui/Toolbar';
import Pagination from 'components/ui/Pagination';
import StatusBadge from 'components/ui/StatusBadge';
import Avatar from 'components/ui/Avatar';
import IconButton from 'components/ui/IconButton';
import { useTableState, type FilterDef } from 'hooks/useTableState';
import {
  EMIRATE_LABEL,
  SUBMISSIONS,
  TODAY,
  type SellerSubmission
} from 'data/verification';
import { storeById } from 'data/stores';
import {
  EXPIRY_WARNING_DAYS,
  STATUS_LABEL,
  daysUntil,
  hasExpired,
  missingDocuments,
  queueOrder,
  type VerificationStatus
} from 'lib/verification';
import { shortDate } from 'lib/format';
import { downloadCsv } from 'lib/csv';

const STATUSES: VerificationStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'UNSUBMITTED'
];

const FILTERS: FilterDef<SellerSubmission>[] = [
  {
    key: 'status',
    label: 'Status',
    options: STATUSES.map((status) => ({
      value: status,
      label: STATUS_LABEL[status]
    })),
    match: (row, value) => row.status === value
  },
  {
    key: 'emirate',
    label: 'Emirate',
    options: Object.entries(EMIRATE_LABEL).map(([value, label]) => ({
      value,
      label
    })),
    match: (row, value) => row.emirate === value
  },
  {
    key: 'licence',
    label: 'Licence',
    options: [
      { value: 'EXPIRED', label: 'Expired' },
      { value: 'SOON', label: 'Expiring soon' },
      { value: 'OK', label: 'In date' }
    ],
    match: (row, value) => {
      if (hasExpired(row.tradeLicenseExpiry, TODAY)) return value === 'EXPIRED';
      const left = daysUntil(row.tradeLicenseExpiry, TODAY);
      return left <= EXPIRY_WARNING_DAYS ? value === 'SOON' : value === 'OK';
    }
  }
];

export default function VerificationPage() {
  const [rows] = useState<SellerSubmission[]>(() => queueOrder(SUBMISSIONS));

  const table = useTableState<SellerSubmission>({
    rows,
    searchIn: (row) =>
      `${row.storeName} ${row.legalName} ${row.tradeLicenseNumber} ${row.email}`,
    filters: FILTERS
  });

  const columns: Column<SellerSubmission>[] = [
    {
      key: 'store',
      header: 'Store',
      primary: true,
      cell: (row) => (
        <Link
          href={`/verification/${row.sellerId}`}
          className="flex items-center gap-3 transition-colors hover:text-primary"
        >
          <Avatar
            src={storeById(row.storeId)?.logo}
            name={row.storeName}
            size={40}
            shape="square"
          />
          <span className="min-w-0">
            <span className="block truncate font-medium text-secondary">
              {row.storeName}
            </span>
            <span className="block truncate text-12 text-gray">
              {row.legalName}
            </span>
          </span>
        </Link>
      )
    },
    {
      key: 'emirate',
      header: 'Emirate',
      cell: (row) => EMIRATE_LABEL[row.emirate] ?? '—'
    },
    {
      key: 'licence',
      header: 'Trade licence',
      cell: (row) => row.tradeLicenseNumber || '—'
    },
    {
      key: 'expiry',
      header: 'Expires',
      cell: (row) => {
        if (!row.tradeLicenseExpiry) return '—';
        if (hasExpired(row.tradeLicenseExpiry, TODAY))
          return <StatusBadge tone="danger">Expired</StatusBadge>;
        const left = daysUntil(row.tradeLicenseExpiry, TODAY);
        return left <= EXPIRY_WARNING_DAYS ? (
          <StatusBadge tone="warning">{left} days left</StatusBadge>
        ) : (
          shortDate(row.tradeLicenseExpiry)
        );
      }
    },
    {
      key: 'documents',
      header: 'Documents',
      cell: (row) => {
        const missing = missingDocuments(row);
        return missing.length === 0 ? (
          <StatusBadge tone="success">Complete</StatusBadge>
        ) : (
          <StatusBadge tone="warning">{missing.length} missing</StatusBadge>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge
          tone={
            row.status === 'APPROVED'
              ? 'success'
              : row.status === 'REJECTED'
                ? 'danger'
                : row.status === 'PENDING'
                  ? 'warning'
                  : 'neutral'
          }
        >
          {STATUS_LABEL[row.status]}
        </StatusBadge>
      )
    },
    {
      key: 'submitted',
      header: 'Submitted',
      cell: (row) => (row.submittedAt ? shortDate(row.submittedAt) : '—')
    },
    {
      key: 'actions',
      header: '',
      actions: true,
      cell: (row) => (
        <IconButton
          label={`Review ${row.storeName}`}
          icon={<HiOutlineEye />}
          href={`/verification/${row.sellerId}`}
        />
      )
    }
  ];

  const exportCsv = () =>
    downloadCsv(
      'tredella-seller-verification.csv',
      [
        { header: 'Store', value: (r: SellerSubmission) => r.storeName },
        { header: 'Legal name', value: (r: SellerSubmission) => r.legalName },
        { header: 'Emirate', value: (r: SellerSubmission) => EMIRATE_LABEL[r.emirate] ?? '' },
        { header: 'Trade licence', value: (r: SellerSubmission) => r.tradeLicenseNumber },
        { header: 'Expires', value: (r: SellerSubmission) => r.tradeLicenseExpiry },
        { header: 'Status', value: (r: SellerSubmission) => STATUS_LABEL[r.status] },
        {
          header: 'Missing documents',
          value: (r: SellerSubmission) => missingDocuments(r).length
        }
        /* Emirates ID and TRN are deliberately not exported — this file gets
           emailed around, and they are the most sensitive things collected. */
      ],
      rows
    );

  const waiting = rows.filter((row) => row.status === 'PENDING').length;

  return (
    <>
      <PageHeading
        title="Seller verification"
        trail={[{ label: 'Sellers' }, { label: 'Verification' }]}
      />
      <SampleDataNote>
        Sample data. The seller app has collected all of this since day one, but
        nothing has ever moved a store from In review to Verified — there is no
        admin mutation for it yet.
      </SampleDataNote>

      {waiting > 0 && (
        <p className="mb-4 rounded-lg bg-[#fdf3dd] px-3 py-2.5 text-12 text-[#b07d17]">
          <span className="font-medium">
            {waiting} seller{waiting === 1 ? '' : 's'} waiting on a decision.
          </span>{' '}
          A store cannot be verified until its documents are complete and its
          licence is in date.
        </p>
      )}

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
          searchPlaceholder="Search store, legal name or licence"
        />

        <div className="px-4 py-4 sm:px-5">
          <DataTable
            columns={columns}
            rows={table.visible}
            rowKey={(row) => row.sellerId}
            empty="No submissions match those filters."
          />
        </div>

        <Pagination
          page={table.page}
          pageCount={table.pageCount}
          onChange={table.setPage}
        />
      </Card>
    </>
  );
}
