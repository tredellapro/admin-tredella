/* Reviewing a seller's UAE trade registration.

   This is the step nothing has done yet: the seller app collects the licence,
   the Emirates ID and the VAT certificate, and `verificationStatus` has sat on
   PENDING ever since because no screen and no mutation moved it. Approving is
   what lets a store trade, so the checks below are the ones that matter.

   Every function takes `today` rather than reading the clock — deterministic,
   testable, and a server render cannot disagree with a client render about
   whether a licence has expired.

   Pure and dependency-free so it can be compiled and exercised on its own. */

export type VerificationStatus =
  | 'UNSUBMITTED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export const STATUS_LABEL: Record<VerificationStatus, string> = {
  UNSUBMITTED: 'Not submitted',
  PENDING: 'In review',
  APPROVED: 'Verified',
  REJECTED: 'Rejected'
};

export type DocumentType =
  | 'TRADE_LICENSE'
  | 'EMIRATES_ID_FRONT'
  | 'EMIRATES_ID_BACK'
  | 'VAT_CERTIFICATE';

export const DOCUMENT_LABEL: Record<DocumentType, string> = {
  TRADE_LICENSE: 'Trade licence',
  EMIRATES_ID_FRONT: 'Emirates ID — front',
  EMIRATES_ID_BACK: 'Emirates ID — back',
  VAT_CERTIFICATE: 'VAT certificate'
};

export interface SellerDocument {
  type: DocumentType;
  fileName: string;
  uploadedAt: string;
}

export interface Submission {
  sellerId: string;
  storeName: string;
  legalName: string;
  status: VerificationStatus;
  /** ISO date the licence runs out. */
  tradeLicenseExpiry: string;
  /** Null when the seller is under the VAT registration threshold. */
  trn: string | null;
  documents: SellerDocument[];
  /** ISO date, null when never submitted. */
  submittedAt: string | null;
  note: string | null;
}

const ALWAYS_REQUIRED: DocumentType[] = [
  'TRADE_LICENSE',
  'EMIRATES_ID_FRONT',
  'EMIRATES_ID_BACK'
];

/**
 * A VAT certificate is only required when the seller gave a TRN — UAE
 * registration is mandatory above AED 375,000 turnover, so a seller under it
 * has nothing to produce. Demanding one from everybody would block half the
 * queue on a document that does not exist.
 */
export const requiredDocuments = (submission: Submission): DocumentType[] =>
  submission.trn
    ? [...ALWAYS_REQUIRED, 'VAT_CERTIFICATE']
    : ALWAYS_REQUIRED;

export const missingDocuments = (submission: Submission): DocumentType[] => {
  const held = new Set(submission.documents.map((doc) => doc.type));
  return requiredDocuments(submission).filter((type) => !held.has(type));
};

/* ---------------- dates ---------------- */

/** Both ISO dates, so a string compare is the same as a date compare. */
export const hasExpired = (iso: string, today: string): boolean => iso < today;

const DAY_MS = 24 * 60 * 60 * 1000;

export const daysUntil = (iso: string, today: string): number =>
  Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS);

/** Warn before it bites; a licence with a month left is worth flagging. */
export const EXPIRY_WARNING_DAYS = 30;

/* ---------------- the decision ---------------- */

export type Decision = 'APPROVED' | 'REJECTED';

/**
 * Statuses a reviewer may move this to.
 *
 * An approved store can still be pulled back — a licence lapses, a document
 * turns out to be forged — and a rejected one can be approved on appeal, so
 * neither is terminal here. That is different from a payout, where the money
 * has already gone.
 */
export const nextStatuses = (current: VerificationStatus): Decision[] => {
  if (current === 'UNSUBMITTED') return [];
  if (current === 'APPROVED') return ['REJECTED'];
  if (current === 'REJECTED') return ['APPROVED'];
  return ['APPROVED', 'REJECTED'];
};

/**
 * Why this seller cannot be approved, or null when they can.
 *
 * Ordered by what the reviewer would have to do about it: a missing document
 * is a different job from an expired licence, and naming the expiry first
 * when three documents are absent would send them down the wrong path.
 */
export const approvalProblem = (
  submission: Submission,
  today: string
): string | null => {
  if (submission.status === 'UNSUBMITTED')
    return 'This seller has not submitted their registration yet.';

  const missing = missingDocuments(submission);
  if (missing.length > 0)
    return `Still missing ${missing.map((type) => DOCUMENT_LABEL[type]).join(', ')}.`;

  if (hasExpired(submission.tradeLicenseExpiry, today))
    return `The trade licence expired on ${submission.tradeLicenseExpiry}. Ask for a current one before verifying.`;

  return null;
};

export const canApprove = (submission: Submission, today: string): boolean =>
  approvalProblem(submission, today) === null;

/** A rejection the seller cannot act on is worthless, so the reason is required. */
export const decisionProblem = (
  submission: Submission,
  decision: Decision,
  reason: string,
  today: string
): string | null => {
  if (!nextStatuses(submission.status).includes(decision))
    return `A ${STATUS_LABEL[submission.status].toLowerCase()} submission cannot be set to ${STATUS_LABEL[decision].toLowerCase()}.`;

  if (decision === 'REJECTED' && reason.trim().length === 0)
    return 'Give the seller a reason so they know what to fix.';

  if (decision === 'APPROVED') return approvalProblem(submission, today);

  return null;
};

/**
 * Removing a document is how a seller gets their upload slot back — the
 * seller app shows an upload box only where a slot is empty.
 *
 * Doing it to an approved store drops them back to In review: they are no
 * longer fully documented, and leaving them Verified would mean a store
 * trading on a document an admin has just called wrong.
 */
export const removeDocument = (
  submission: Submission,
  type: DocumentType
): Submission => {
  const documents = submission.documents.filter((doc) => doc.type !== type);
  const stillRequired = requiredDocuments({ ...submission, documents });
  const nowMissing = stillRequired.some(
    (needed) => !documents.some((doc) => doc.type === needed)
  );

  return {
    ...submission,
    documents,
    status:
      submission.status === 'APPROVED' && nowMissing
        ? 'PENDING'
        : submission.status
  };
};

/** Queue order: waiting on the admin first, oldest submission first. */
export const queueOrder = <T extends { status: VerificationStatus; submittedAt: string | null }>(
  rows: T[]
): T[] =>
  [...rows].sort((a, b) => {
    const waiting = (r: T) => (r.status === 'PENDING' ? 0 : 1);
    return (
      waiting(a) - waiting(b) ||
      (a.submittedAt ?? '').localeCompare(b.submittedAt ?? '')
    );
  });
