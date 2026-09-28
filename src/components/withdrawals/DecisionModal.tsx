'use client';

import { useEffect, useState } from 'react';
import Modal from 'components/ui/Modal';
import Button from 'components/ui/Button';
import StatusBadge from 'components/ui/StatusBadge';
import FormError from 'components/auth/FormError';
import { storeName } from 'data/stores';
import { maskAccount, type WithdrawalRow } from 'data/withdrawals';
import {
  STATUS_LABEL,
  approvalProblem,
  decisionProblem,
  nextStatuses,
  type Decision,
  type SellerStanding,
  type WithdrawalStatus
} from 'lib/withdrawals';
import { money } from 'lib/format';

interface DecisionModalProps {
  request: WithdrawalRow | null;
  seller: SellerStanding | null;
  onClose: () => void;
  onSave: (_decision: Decision) => void;
}

/**
 * Approving this is the console sending real money out, so the modal shows
 * the seller's position beside the amount and runs the same checks the rules
 * module defines. The UI does not get its own opinion about what is payable.
 */
export default function DecisionModal({
  request,
  seller,
  onClose,
  onSave
}: DecisionModalProps) {
  const [next, setNext] = useState<WithdrawalStatus>('APPROVED');
  const [reason, setReason] = useState('');
  const [showProblem, setShowProblem] = useState(false);

  useEffect(() => {
    if (!request) return;
    setNext(nextStatuses(request.status)[0] ?? 'APPROVED');
    setReason('');
    setShowProblem(false);
  }, [request]);

  if (!request || !seller) return null;

  const options = nextStatuses(request.status);
  const blocker = approvalProblem(request, seller);
  const problem = decisionProblem(request, seller, { next, reason });

  const submit = () => {
    if (problem) {
      setShowProblem(true);
      return;
    }
    onSave({ next, reason });
  };

  return (
    <Modal open onClose={onClose} title="Withdraw Request" width="md">
      <div className="rounded-xl border border-secondary/10 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-14 font-medium text-secondary">
              {money(request.amount)}
            </p>
            <p className="truncate text-12 text-gray">
              #{request.id} · {storeName(request.storeId)}
            </p>
          </div>
          <StatusBadge status={request.status}>
            {STATUS_LABEL[request.status]}
          </StatusBadge>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-secondary/8 pt-3 text-12">
          <div className="flex justify-between gap-2">
            <dt className="text-gray">Cleared</dt>
            <dd className="font-medium text-secondary">
              {money(seller.available, 0)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-gray">Frozen</dt>
            <dd
              className={`font-medium ${
                seller.frozen > 0 ? 'text-primary' : 'text-secondary'
              }`}
            >
              {money(seller.frozen, 0)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-gray">Undispatched</dt>
            <dd
              className={`font-medium ${
                seller.undispatched >= 2 ? 'text-primary' : 'text-secondary'
              }`}
            >
              {seller.undispatched}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-gray">Bank</dt>
            <dd className="font-medium text-secondary">
              {seller.bankAccount ?? 'Not linked'}
            </dd>
          </div>
        </dl>
      </div>

      {options.length === 0 ? (
        <>
          <p className="mt-5 text-13 leading-relaxed text-gray">
            This request is already{' '}
            {STATUS_LABEL[request.status].toLowerCase()}. Money that has left
            the marketplace cannot be pulled back from here, and a rejected
            request is re-raised by the seller rather than revived under them.
          </p>
          <div className="mt-6">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              Close
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          {showProblem && <FormError message={problem} />}

          {/* Shown up front, not just on submit — if this payout cannot go
              out, the admin should know before choosing anything. */}
          {blocker && !showProblem && (
            <p className="rounded-lg bg-[#fdf3dd] px-3 py-2.5 text-12 leading-relaxed text-[#b07d17]">
              <span className="font-medium">Cannot approve yet.</span> {blocker}
            </p>
          )}

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Change Status</span>
            <select
              value={next}
              onChange={(event) => {
                setNext(event.target.value as WithdrawalStatus);
                setShowProblem(false);
              }}
              className="rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
            >
              {options.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>

          {next === 'REJECTED' && (
            <label className="flex flex-col gap-2">
              <span className="text-13 text-secondary">
                Reason <span className="text-gray">(the seller sees this)</span>
              </span>
              <textarea
                rows={3}
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setShowProblem(false);
                }}
                placeholder="e.g. Orders 1004 and 1007 were never dispatched."
                className="brand-scroll resize-none rounded-lg border border-secondary/15 px-3 py-2.5 text-14 text-secondary outline-none placeholder:text-gray/60 focus:border-primary"
              />
            </label>
          )}

          <p className="text-12 leading-relaxed text-gray">
            {next === 'APPROVED'
              ? `Send ${money(request.amount)} to ${request.bankName} ${maskAccount(request.accountNumber)}. The seller's dashboard will show this as Completed.`
              : 'The seller keeps the balance and can request again once the reason above is dealt with.'}
          </p>

          <div className="mt-1 flex gap-3">
            <Button type="button" variant="outline" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" fullWidth onClick={submit}>
              Save
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
