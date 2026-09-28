'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineTrash
} from 'react-icons/hi';
import DetailHeader from 'components/console/DetailHeader';
import Card, { CardTitle } from 'components/ui/Card';
import DetailRows from 'components/ui/DetailRows';
import StatusBadge from 'components/ui/StatusBadge';
import Button from 'components/ui/Button';
import Modal from 'components/ui/Modal';
import FormError from 'components/auth/FormError';
import { useAccess } from 'components/console/AccessContext';
import {
  EMIRATE_LABEL,
  LEGAL_FORM_LABEL,
  TODAY,
  submissionById,
  type SellerSubmission
} from 'data/verification';
import { storeById } from 'data/stores';
import {
  DOCUMENT_LABEL,
  EXPIRY_WARNING_DAYS,
  STATUS_LABEL,
  approvalProblem,
  daysUntil,
  decisionProblem,
  hasExpired,
  missingDocuments,
  nextStatuses,
  removeDocument,
  requiredDocuments,
  type Decision,
  type DocumentType
} from 'lib/verification';
import { longDate } from 'lib/format';

export default function VerificationDetailView({ id }: { id: string }) {
  const { manage } = useAccess();
  const mayVerify = manage('verification');

  const [submission, setSubmission] = useState<SellerSubmission | undefined>(
    () => submissionById(id)
  );
  const [deciding, setDeciding] = useState(false);
  const [next, setNext] = useState<Decision>('APPROVED');
  const [reason, setReason] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [removingDoc, setRemovingDoc] = useState<DocumentType | null>(null);

  if (!submission) return null;

  const store = storeById(submission.storeId);
  const missing = missingDocuments(submission);
  const blocker = approvalProblem(submission, TODAY);
  const options = nextStatuses(submission.status);
  const expired = hasExpired(submission.tradeLicenseExpiry, TODAY);
  const daysLeft = daysUntil(submission.tradeLicenseExpiry, TODAY);

  const open = () => {
    setNext(options[0] ?? 'APPROVED');
    setReason('');
    setProblem(null);
    setDeciding(true);
  };

  const save = () => {
    const found = decisionProblem(submission, next, reason, TODAY);
    if (found) {
      setProblem(found);
      return;
    }
    setSubmission((current) =>
      current
        ? {
            ...current,
            status: next,
            note: next === 'REJECTED' ? reason.trim() : null
          }
        : current
    );
    setDeciding(false);
  };

  const confirmRemove = () => {
    if (!removingDoc) return;
    setSubmission((current) =>
      current
        ? { ...(removeDocument(current, removingDoc) as SellerSubmission) }
        : current
    );
    setRemovingDoc(null);
  };

  const tone =
    submission.status === 'APPROVED'
      ? 'success'
      : submission.status === 'REJECTED'
        ? 'danger'
        : submission.status === 'PENDING'
          ? 'warning'
          : 'neutral';

  return (
    <>
      <DetailHeader
        title="Seller verification"
        subtitle={`${submission.storeName} · ${submission.legalName}`}
        backTo="/verification"
        actions={
          mayVerify && options.length > 0 ? (
            <Button type="button" onClick={open}>
              Review submission
            </Button>
          ) : (
            <StatusBadge tone={tone}>
              {STATUS_LABEL[submission.status]}
            </StatusBadge>
          )
        }
      />

      {blocker && submission.status !== 'APPROVED' && (
        <p className="mb-4 rounded-lg bg-[#fdf3dd] px-3 py-2.5 text-12 leading-relaxed text-[#b07d17]">
          <span className="font-medium">Cannot verify yet.</span> {blocker}
        </p>
      )}

      {submission.note && (
        <p className="mb-4 rounded-lg bg-primary/8 px-3 py-2.5 text-12 leading-relaxed text-primary">
          <span className="font-medium">Reason given to the seller:</span>{' '}
          {submission.note}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardTitle
              action={
                <StatusBadge tone={tone}>
                  {STATUS_LABEL[submission.status]}
                </StatusBadge>
              }
            >
              Trade registration
            </CardTitle>

            <DetailRows
              rows={[
                { label: 'Legal name', value: submission.legalName },
                {
                  label: 'Legal form',
                  value: LEGAL_FORM_LABEL[submission.legalForm] ?? '—'
                },
                {
                  label: 'Emirate',
                  value: EMIRATE_LABEL[submission.emirate] ?? '—'
                },
                { label: 'Address', value: submission.addressLine },
                { label: 'Phone', value: submission.phone },
                { label: 'Email', value: submission.email },
                {
                  label: 'Trade licence number',
                  value: submission.tradeLicenseNumber || '—'
                },
                {
                  label: 'Licence expiry',
                  value: expired ? (
                    <StatusBadge tone="danger">
                      Expired {longDate(submission.tradeLicenseExpiry)}
                    </StatusBadge>
                  ) : daysLeft <= EXPIRY_WARNING_DAYS ? (
                    <StatusBadge tone="warning">
                      {daysLeft} days left
                    </StatusBadge>
                  ) : (
                    longDate(submission.tradeLicenseExpiry)
                  )
                },
                {
                  label: 'Emirates ID',
                  value: submission.emiratesIdNumber || '—'
                },
                {
                  label: 'TRN',
                  value:
                    submission.trn ??
                    'Not given — under the AED 375,000 threshold'
                },
                {
                  label: 'Submitted',
                  value: submission.submittedAt
                    ? longDate(submission.submittedAt)
                    : 'Never'
                }
              ]}
            />
          </Card>

          <Card>
            <CardTitle>Documents</CardTitle>

            <p className="px-1 pb-3 text-12 leading-relaxed text-gray">
              Removing one is how the seller gets an upload box back — their
              dashboard only offers upload where a slot is empty. Doing it to a
              verified store puts it back into review.
            </p>

            <ul className="flex flex-col gap-2">
              {requiredDocuments(submission).map((type) => {
                const held = submission.documents.find(
                  (entry) => entry.type === type
                );

                return (
                  <li
                    key={type}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-secondary/10 p-3"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-16 ${
                        held
                          ? 'bg-[#e7f7ee] text-[#1f9254]'
                          : 'bg-primary/8 text-primary'
                      }`}
                    >
                      <HiOutlineDocumentText aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-13 font-medium text-secondary">
                        {DOCUMENT_LABEL[type]}
                      </span>
                      <span className="block truncate text-12 text-gray">
                        {held
                          ? `${held.fileName} · uploaded ${longDate(held.uploadedAt)}`
                          : 'Not provided — the seller has an upload slot for this'}
                      </span>
                    </span>

                    {held ? (
                      <span className="flex items-center gap-2">
                        <a
                          href={`#${type.toLowerCase()}`}
                          className="flex items-center gap-1 text-12 font-medium text-primary hover:underline"
                        >
                          <HiOutlineExternalLink aria-hidden="true" />
                          View
                        </a>
                        {mayVerify && (
                          <button
                            type="button"
                            onClick={() => setRemovingDoc(type)}
                            aria-label={`Remove ${DOCUMENT_LABEL[type]}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/8 text-14 text-primary transition-colors hover:bg-primary/15"
                          >
                            <HiOutlineTrash />
                          </button>
                        )}
                      </span>
                    ) : (
                      <StatusBadge tone="warning">Missing</StatusBadge>
                    )}
                  </li>
                );
              })}
            </ul>

            {submission.trn === null && (
              <p className="mt-3 px-1 text-12 text-gray">
                No VAT certificate is required — this seller gave no TRN, so
                they are under the registration threshold.
              </p>
            )}
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
              Store
            </CardTitle>

            <dl className="flex flex-col gap-3 px-1">
              {[
                { label: 'Trading name', value: submission.storeName },
                { label: 'Store ID', value: submission.storeId },
                {
                  label: 'Status',
                  value: store?.status === 'ACTIVE' ? 'Active' : 'Inactive'
                },
                {
                  label: 'Documents',
                  value:
                    missing.length === 0
                      ? 'Complete'
                      : `${missing.length} missing`
                }
              ].map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-start justify-between gap-3"
                >
                  <dt className="text-12 text-gray">{entry.label}</dt>
                  <dd className="text-right text-13 text-secondary">
                    {entry.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardTitle>What verifying does</CardTitle>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-12 leading-relaxed text-gray">
              <li>Puts the verified mark on the store for buyers.</li>
              <li>
                Rejecting keeps the registration on file — the seller fixes what
                the reason names and resubmits.
              </li>
              <li>
                A verified store can still be pulled back if a licence lapses or
                a document turns out to be wrong.
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <Modal
        open={deciding}
        onClose={() => setDeciding(false)}
        title="Review submission"
        width="md"
      >
        <div className="flex flex-col gap-4">
          {problem && <FormError message={problem} />}

          {blocker && next === 'APPROVED' && !problem && (
            <p className="rounded-lg bg-[#fdf3dd] px-3 py-2.5 text-12 leading-relaxed text-[#b07d17]">
              <span className="font-medium">Cannot verify yet.</span> {blocker}
            </p>
          )}

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Decision</span>
            <select
              value={next}
              onChange={(event) => {
                setNext(event.target.value as Decision);
                setProblem(null);
              }}
              className="rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABEL[option]}
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
                  setProblem(null);
                }}
                placeholder="e.g. The trading name on the licence does not match the store name."
                className="brand-scroll resize-none rounded-lg border border-secondary/15 px-3 py-2.5 text-14 text-secondary outline-none placeholder:text-gray/60 focus:border-primary"
              />
            </label>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setDeciding(false)}
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
        open={removingDoc !== null}
        onClose={() => setRemovingDoc(null)}
        title="Remove document"
        width="sm"
      >
        <p className="text-13 leading-relaxed text-gray">
          {removingDoc && DOCUMENT_LABEL[removingDoc]} will be taken off file
          and an upload box appears in the seller&rsquo;s dashboard so they can
          send a correct one.
          {submission.status === 'APPROVED' &&
            ' This store is verified, so removing a required document puts it back into review.'}
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => setRemovingDoc(null)}
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
