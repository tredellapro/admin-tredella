'use client';

import { useState } from 'react';
import Link from 'next/link';
import DetailHeader from 'components/console/DetailHeader';
import Card, { CardTitle } from 'components/ui/Card';
import DetailRows from 'components/ui/DetailRows';
import StatusBadge from 'components/ui/StatusBadge';
import StatCard from 'components/ui/StatCard';
import Button from 'components/ui/Button';
import Avatar from 'components/ui/Avatar';
import DecisionModal from './DecisionModal';
import { standingFor, withdrawalById } from 'data/withdrawals';
import { storeById } from 'data/stores';
import { userForStore } from 'data/users';
import { ordersForStore } from 'data/orders';
import { ORDER_STATUS_LABEL } from 'lib/orderStatus';
import {
  SELLER_FACING_STATUS,
  STATUS_LABEL,
  approvalProblem,
  type Decision,
  type WithdrawalStatus
} from 'lib/withdrawals';
import { count, longDate, money } from 'lib/format';

const METHOD_LABEL = {
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card'
} as const;

export default function WithdrawDetailView({ id }: { id: string }) {
  const row = withdrawalById(id);
  const [status, setStatus] = useState<WithdrawalStatus>(
    () => row?.status ?? 'PENDING'
  );
  const [note, setNote] = useState<string | null>(() => row?.note ?? null);
  const [deciding, setDeciding] = useState(false);

  if (!row) return null;

  const current = { ...row, status, note };
  const store = storeById(row.storeId);
  const owner = userForStore(row.storeId);
  const seller = standingFor(row.storeId);
  const blocker = approvalProblem(current, seller);

  /* The orders behind the money: which are frozen and why. This is the record
     the client asked to see beside a payout — approving without it is signing
     a cheque against numbers you cannot check. */
  const orders = ordersForStore(row.storeId);
  const frozenOrders = orders.filter((order) => order.freezeAmount);

  const save = (decision: Decision) => {
    setStatus(decision.next);
    if (decision.next === 'REJECTED') setNote(decision.reason.trim());
    setDeciding(false);
  };

  return (
    <>
      <DetailHeader
        title="Withdraw Information"
        subtitle={`#${row.id} · ${store?.name ?? row.storeId}`}
        backTo="/withdrawals"
        actions={
          status === 'PENDING' ? (
            <Button type="button" onClick={() => setDeciding(true)}>
              Review request
            </Button>
          ) : (
            <StatusBadge status={status}>{STATUS_LABEL[status]}</StatusBadge>
          )
        }
      />

      {status === 'PENDING' && blocker && (
        <p className="mb-4 rounded-lg bg-[#fdf3dd] px-3 py-2.5 text-12 leading-relaxed text-[#b07d17]">
          <span className="font-medium">Cannot approve yet.</span> {blocker}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Requested" value={money(row.amount, 0)} />
        <StatCard
          label="Cleared balance"
          value={money(seller.available, 0)}
          hint="Past the 14-day hold"
        />
        <StatCard
          label="Frozen"
          value={money(seller.frozen, 0)}
          hint={`${seller.undispatched} order${seller.undispatched === 1 ? '' : 's'} never dispatched`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardTitle>Withdraw Details</CardTitle>
            <DetailRows
              rows={[
                { label: 'Store ID', value: row.storeId },
                { label: 'Store Name', value: store?.name ?? '—' },
                { label: 'Request ID', value: `#${row.id}` },
                { label: 'Amount', value: money(row.amount) },
                { label: 'Payment Method', value: METHOD_LABEL[row.method] },
                {
                  label: 'Status',
                  value: (
                    <StatusBadge status={status}>
                      {STATUS_LABEL[status]}
                    </StatusBadge>
                  )
                },
                {
                  label: 'Seller sees',
                  value: SELLER_FACING_STATUS[status]
                },
                { label: 'Date', value: longDate(row.requestedAt) }
              ]}
            />

            {note && (
              <p className="mt-3 rounded-lg bg-primary/8 px-3 py-2.5 text-12 leading-relaxed text-primary">
                <span className="font-medium">
                  {status === 'REJECTED' ? 'Reason given to the seller:' : 'Note:'}
                </span>{' '}
                {note}
              </p>
            )}
          </Card>

          {/* Where the money actually goes. */}
          <Card>
            <CardTitle>Bank Details</CardTitle>
            {row.accountNumber ? (
              <DetailRows
                rows={[
                  { label: 'Account Holder', value: row.accountHolder },
                  { label: 'Bank Name', value: row.bankName },
                  { label: 'Account Number', value: row.accountNumber },
                  { label: 'IBAN', value: row.iban }
                ]}
              />
            ) : (
              <p className="px-1 text-13 leading-relaxed text-gray">
                No bank account on file. The seller has to add one in their
                dashboard before this can be paid — there is nowhere to send it.
              </p>
            )}
          </Card>

          <Card flush>
            <div className="px-4 pt-4 sm:px-5 sm:pt-5">
              <CardTitle
                action={
                  <Link
                    href={`/orders?store=${row.storeId}`}
                    className="text-13 font-medium text-primary hover:underline"
                  >
                    All orders
                  </Link>
                }
              >
                Orders holding money back
              </CardTitle>
            </div>

            <div className="px-4 pb-5 sm:px-5">
              {frozenOrders.length === 0 ? (
                <p className="py-6 text-center text-13 text-gray">
                  Nothing frozen. Every order behind this balance has settled.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {frozenOrders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/orders/${order.id}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-secondary/10 px-3 py-2.5 transition-colors hover:border-primary/40"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-13 font-medium text-secondary">
                            #{order.id} · {order.customerName}
                          </span>
                          <span className="block text-12 text-gray">
                            {money(order.total)} · {count(order.items)} items
                          </span>
                        </span>
                        <StatusBadge status={order.status}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </StatusBadge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle
              action={
                store && (
                  <Link
                    href={`/stores/${store.id}`}
                    className="text-13 font-medium text-primary hover:underline"
                  >
                    Open store
                  </Link>
                )
              }
            >
              Seller record
            </CardTitle>

            <div className="flex items-center gap-3 px-1">
              <Avatar
                src={store?.logo}
                name={store?.name ?? 'Store'}
                size={44}
                shape="square"
              />
              <div className="min-w-0">
                <p className="truncate text-14 font-medium text-secondary">
                  {store?.name ?? row.storeId}
                </p>
                <p className="truncate text-12 text-gray">{row.accountHolder}</p>
              </div>
            </div>

            <dl className="mt-4 flex flex-col gap-3 px-1">
              {[
                { label: 'Contact', value: store?.ownerEmail ?? '—' },
                { label: 'Phone', value: store?.phone ?? '—' },
                {
                  label: 'Verification',
                  value: store?.verified ? 'Verified' : 'Unverified'
                },
                {
                  label: 'Store status',
                  value: store?.status === 'ACTIVE' ? 'Active' : 'Inactive'
                },
                {
                  label: 'Joined',
                  value: store ? longDate(store.createdAt) : '—'
                },
                {
                  label: 'Completed orders',
                  value: count(store?.completedOrders ?? 0)
                },
                {
                  label: 'Cancelled orders',
                  value: count(store?.cancelledOrders ?? 0)
                }
              ].map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-start justify-between gap-3"
                >
                  <dt className="text-12 text-gray">{entry.label}</dt>
                  <dd className="break-words text-right text-13 text-secondary">
                    {entry.value}
                  </dd>
                </div>
              ))}
            </dl>

            {owner && (
              <Link
                href={`/users/${owner.id}`}
                className="mt-4 inline-flex text-13 font-medium text-primary hover:underline"
              >
                Open {owner.name}&rsquo;s account
              </Link>
            )}
          </Card>

          <Card>
            <CardTitle>Payout history</CardTitle>
            <dl className="flex flex-col gap-3 px-1">
              <div className="flex items-center justify-between">
                <dt className="text-12 text-gray">Recent payouts</dt>
                <dd className="text-13 font-medium text-secondary">
                  {money(store?.recentPayout ?? 0, 0)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-12 text-gray">Pending settlements</dt>
                <dd className="text-13 font-medium text-primary">
                  {money(store?.pendingSettlement ?? 0, 0)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <DecisionModal
        request={deciding ? current : null}
        seller={deciding ? seller : null}
        onClose={() => setDeciding(false)}
        onSave={save}
      />
    </>
  );
}
