'use client';

import { useEffect, useState } from 'react';
import Modal from 'components/ui/Modal';
import Button from 'components/ui/Button';
import StatusBadge from 'components/ui/StatusBadge';
import Avatar from 'components/ui/Avatar';
import FormError from 'components/auth/FormError';
import {
  APPROVAL_LABEL,
  adminExplanation,
  nextStatuses,
  reviewProblem,
  type ApprovalStatus,
  type ReviewDecision
} from 'lib/productApproval';
import type { AdminProduct } from 'types/console';

interface ReviewModalProps {
  product: AdminProduct | null;
  onClose: () => void;
  onSave: (_decision: ReviewDecision) => void;
}

/**
 * The admin's decision on a listing. The dropdown only ever offers the
 * transitions `nextStatuses` allows, and Save runs the same `reviewProblem`
 * check the rules module defines — the UI does not get its own opinion about
 * what is valid.
 */
export default function ReviewModal({
  product,
  onClose,
  onSave
}: ReviewModalProps) {
  const [next, setNext] = useState<ApprovalStatus>('APPROVED');
  const [reason, setReason] = useState('');
  const [showProblem, setShowProblem] = useState(false);

  /* Re-seed whenever a different row is opened, or the second product you
     review would inherit the first one's decision. */
  useEffect(() => {
    if (!product) return;
    setNext(nextStatuses(product.approval)[0]);
    setReason(product.approvalNote ?? '');
    setShowProblem(false);
  }, [product]);

  if (!product) return null;

  const options = nextStatuses(product.approval);
  const problem = reviewProblem(product.approval, { next, reason });

  const submit = () => {
    if (problem) {
      setShowProblem(true);
      return;
    }
    onSave({ next, reason });
  };

  return (
    <Modal open onClose={onClose} title="Edit Product" width="md">
      <div className="flex items-center gap-3 rounded-xl border border-secondary/10 p-3">
        <Avatar src={product.image} name={product.name} size={44} shape="square" />
        <div className="min-w-0">
          <p className="truncate text-14 font-medium text-secondary">
            {product.name}
          </p>
          <p className="truncate text-12 text-gray">
            {adminExplanation({
              approval: product.approval,
              listedBySeller: product.listedBySeller,
              stock: product.stock
            })}
          </p>
        </div>
        <StatusBadge status={product.approval}>
          {APPROVAL_LABEL[product.approval]}
        </StatusBadge>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {showProblem && <FormError message={problem} />}

        <label className="flex flex-col gap-2">
          <span className="text-13 text-secondary">Change Status</span>
          <select
            value={next}
            onChange={(event) => {
              setNext(event.target.value as ApprovalStatus);
              setShowProblem(false);
            }}
            className="rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
          >
            {options.map((status) => (
              <option key={status} value={status}>
                {APPROVAL_LABEL[status]}
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
              placeholder="e.g. Photos are watermarked with another marketplace."
              className="brand-scroll resize-none rounded-lg border border-secondary/15 px-3 py-2.5 text-14 text-secondary outline-none placeholder:text-gray/60 focus:border-primary"
            />
          </label>
        )}

        <p className="text-12 leading-relaxed text-gray">
          {next === 'APPROVED'
            ? 'Approving clears the listing for sale. It does not switch it on for the seller — if they have it off, it stays off.'
            : 'Rejecting pulls it from the storefront. The seller keeps the listing and can resubmit once they have fixed the reason above.'}
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
    </Modal>
  );
}
