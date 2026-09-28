'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiOutlineEye, HiOutlinePencil } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import SampleDataNote from 'components/console/SampleDataNote';
import Card from 'components/ui/Card';
import DataTable, { type Column } from 'components/ui/DataTable';
import Toolbar from 'components/ui/Toolbar';
import Pagination from 'components/ui/Pagination';
import StatusBadge from 'components/ui/StatusBadge';
import IconButton from 'components/ui/IconButton';
import DecisionModal from 'components/withdrawals/DecisionModal';
import { useTableState, type FilterDef } from 'hooks/useTableState';
import { WITHDRAWALS, maskAccount, standingFor, type WithdrawalRow } from 'data/withdrawals';
import { storeName } from 'data/stores';
import {
  STATUS_LABEL,
  queueOrder,
  type Decision,
  type WithdrawalStatus
} from 'lib/withdrawals';
import { money, monthKey, monthOptions, shortDate } from 'lib/format';
import { downloadCsv } from 'lib/csv';

const METHOD_LABEL: Record<WithdrawalRow['method'], string> = {
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card'
};

const FILTERS: FilterDef<WithdrawalRow>[] = [
  {
    key: 'method',
    label: 'Payment Method',
    options: [
      { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
      { value: 'CARD', label: 'Card' }
    ],
    match: (row, value) => row.method === value
  },
  {
    key: 'status',
    label: 'Status',
    options: (['PENDING', 'APPROVED', 'REJECTED'] as WithdrawalStatus[]).map(
      (status) => ({ value: status, label: STATUS_LABEL[status] })
    ),
    match: (row, value) => row.status === value
  },
  {
    key: 'requested',
    label: 'Requested',
    options: monthOptions(WITHDRAWALS.map((row) => row.requestedAt)),
    match: (row, value) => monthKey(row.requestedAt) === value
  }
];

export default function WithdrawalsPage() {
  const [rows, setRows] = useState<WithdrawalRow[]>(() => queueOrder(WITHDRAWALS));
  const [deciding, setDeciding] = useState<WithdrawalRow | null>(null);

  const table = useTableState<WithdrawalRow>({
    rows,
    searchIn: (row) =>
      `${row.id} ${storeName(row.storeId)} ${row.bankName} ${row.accountHolder}`,
    filters: FILTERS
  });

  const save = (decision: Decision) => {
    if (!deciding) return;
    setRows((current) =>
      current.map((row) =>
        row.id === deciding.id
          ? {
              ...row,
              status: decision.next,
              note: decision.next === 'REJECTED' ? decision.reason.trim() : row.note
            }
          : row
      )
    );
    setDeciding(null);
  };

  const columns: Column<WithdrawalRow>[] = [
    {
      key: 'id',
      header: 'Request Id',
      primary: true,
      cell: (row) => (
        <Link
          href={`/withdrawals/${row.id}`}
          className="font-medium text-secondary transition-colors hover:text-primary"
        >
          #{row.id}
        </Link>
      )
    },
    {
      key: 'store',
      header: 'Store',
      cell: (row) => (
        <Link
          href={`/stores/${row.storeId}`}
          className="transition-colors hover:text-primary"
        >
          {storeName(row.storeId)}
        </Link>
      )
    },
    { key: 'amount', header: 'Amount', cell: (row) => money(row.amount) },
    {
      key: 'method',
      header: 'Payment Method',
      cell: (row) => METHOD_LABEL[row.method]
    },
    {
      key: 'bank',
      header: 'Bank Name',
      cell: (row) =>
        row.accountNumber ? (
          row.bankName
        ) : (
          <span className="text-primary">Not linked</span>
        )
    },
    {
      key: 'account',
      header: 'Account Number',
      cell: (row) => maskAccount(row.accountNumber)
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge status={row.status}>{STATUS_LABEL[row.status]}</StatusBadge>
      )
    },
    {
      key: 'date',
      header: 'Date',
      cell: (row) => shortDate(row.requestedAt)
    },
    {
      key: 'actions',
      header: 'Actions',
      actions: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            label={`Decide ${row.id}`}
            icon={<HiOutlinePencil />}
            onClick={() => setDeciding(row)}
          />
          <IconButton
            label={`Open ${row.id}`}
            icon={<HiOutlineEye />}
            tone="neutral"
            href={`/withdrawals/${row.id}`}
          />
        </div>
      )
    }
  ];

  const exportCsv = () =>
    downloadCsv(
      'tredella-withdrawals.csv',
      [
        { header: 'Request', value: (r: WithdrawalRow) => r.id },
        { header: 'Store', value: (r: WithdrawalRow) => storeName(r.storeId) },
        { header: 'Account holder', value: (r: WithdrawalRow) => r.accountHolder },
        { header: 'Amount (AED)', value: (r: WithdrawalRow) => r.amount },
        { header: 'Method', value: (r: WithdrawalRow) => METHOD_LABEL[r.method] },
        { header: 'Bank', value: (r: WithdrawalRow) => r.bankName },
        /* Last four only. This file gets emailed around; a full account
           number in it is a leak waiting to happen. */
        { header: 'Account', value: (r: WithdrawalRow) => maskAccount(r.accountNumber) },
        { header: 'Status', value: (r: WithdrawalRow) => STATUS_LABEL[r.status] },
        { header: 'Requested', value: (r: WithdrawalRow) => r.requestedAt }
      ],
      rows
    );

  const pending = rows.filter((row) => row.status === 'PENDING');
  const owed = pending.reduce((sum, row) => sum + row.amount, 0);

  return (
    <>
      <PageHeading
        title="Withdraw Request"
        trail={[{ label: 'Withdraw' }, { label: 'Withdraw Request' }]}
      />
      <SampleDataNote>
        Sample data. There is no payouts service on the backend — no table, no
        resolver — so nothing here is saved.
      </SampleDataNote>

      {pending.length > 0 && (
        <p className="mb-4 rounded-lg bg-[#fdf3dd] px-3 py-2.5 text-12 text-[#b07d17]">
          <span className="font-medium">
            {pending.length} request{pending.length === 1 ? '' : 's'} waiting —{' '}
            {money(owed, 0)}.
          </span>{' '}
          Approving one releases real money, so each is checked against the
          seller&rsquo;s cleared balance and undispatched orders first.
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
          searchPlaceholder="Search request, store or bank"
        />

        <div className="px-4 py-4 sm:px-5">
          <DataTable
            columns={columns}
            rows={table.visible}
            rowKey={(row) => row.id}
            empty="No withdrawal requests match those filters."
          />
        </div>

        <Pagination
          page={table.page}
          pageCount={table.pageCount}
          onChange={table.setPage}
        />
      </Card>

      <DecisionModal
        request={deciding}
        seller={deciding ? standingFor(deciding.storeId) : null}
        onClose={() => setDeciding(null)}
        onSave={save}
      />
    </>
  );
}
