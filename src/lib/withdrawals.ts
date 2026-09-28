/* What an admin may do with a seller's withdrawal request.

   The seller side of these rules already exists in
   seller-tredella/src/lib/payouts.ts — money clears 14 days after delivery,
   an order that was never dispatched has its amount frozen, and repeat
   non-dispatch pauses withdrawals entirely. This module is the other half:
   the checks that run before an admin actually sends the money.

   Pure and dependency-free so it can be compiled and exercised on its own. */

/** Mirrors seller-tredella's WithdrawalStatus. Both apps must agree. */
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * What the admin sees. The seller sees the wording in
 * SELLER_FACING_STATUS below — the two are different on purpose and must be
 * kept in step, the same trap as the order-status emails.
 */
export const STATUS_LABEL: Record<WithdrawalStatus, string> = {
  PENDING: 'In process',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

/**
 * The seller's own dashboard wording for the same state.
 *
 * A withdrawal is never instantly "successful": it is requested, sits as
 * In process while the orders behind it are verified, and only then completes.
 */
export const SELLER_FACING_STATUS: Record<WithdrawalStatus, string> = {
  PENDING: 'In process',
  APPROVED: 'Completed',
  REJECTED: 'Rejected'
};

export interface SellerStanding {
  /** Cleared money, past the 14-day hold. */
  available: number;
  /** Held against orders that were never dispatched. */
  frozen: number;
  /** Orders past the dispatch grace period. 2 is at risk, 3 is review. */
  undispatched: number;
  storeActive: boolean;
  /** Null when the seller has not given bank details. */
  bankAccount: string | null;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: WithdrawalStatus;
}

/** Matches DEACTIVATION_STRIKES in the seller app. */
export const DEACTIVATION_STRIKES = 3;

/**
 * Why this payout cannot be approved, or null when it can.
 *
 * Ordered by how serious the problem is: an account under review is a
 * different conversation from a missing IBAN, and telling the admin about the
 * IBAN first would send them to fix the wrong thing.
 */
export const approvalProblem = (
  request: WithdrawalRequest,
  seller: SellerStanding
): string | null => {
  if (request.status !== 'PENDING')
    return `This request is already ${STATUS_LABEL[request.status].toLowerCase()}.`;

  if (seller.undispatched >= DEACTIVATION_STRIKES)
    return `${seller.undispatched} orders were never dispatched. This account is under review — resolve that before paying anything out.`;

  if (!seller.storeActive)
    return 'The store is suspended. Reactivate it before releasing money.';

  if (!seller.bankAccount)
    return 'No bank account on file. The seller has to add one before you can pay them.';

  if (request.amount > seller.available)
    return `Only ${seller.available} AED has cleared. ${seller.frozen} AED is still frozen or on hold.`;

  return null;
};

export const canApprove = (
  request: WithdrawalRequest,
  seller: SellerStanding
): boolean => approvalProblem(request, seller) === null;

/**
 * Statuses an admin may move this request to.
 *
 * Approved is terminal: the money has left the marketplace, and letting
 * someone flip it back to rejected would make the ledger disagree with the
 * bank. Rejected is terminal too — the seller requests again rather than
 * having an old request silently revived under them.
 */
export const nextStatuses = (current: WithdrawalStatus): WithdrawalStatus[] =>
  current === 'PENDING' ? ['APPROVED', 'REJECTED'] : [];

/** A rejection the seller cannot act on is worthless, so the reason is required. */
export const rejectionNeedsReason = (
  next: WithdrawalStatus,
  reason: string
): boolean => next === 'REJECTED' && reason.trim().length === 0;

export interface Decision {
  next: WithdrawalStatus;
  reason: string;
}

/** Null when the decision is fine to submit, otherwise the message to show. */
export const decisionProblem = (
  request: WithdrawalRequest,
  seller: SellerStanding,
  decision: Decision
): string | null => {
  if (!nextStatuses(request.status).includes(decision.next))
    return `A request that is already ${STATUS_LABEL[request.status].toLowerCase()} cannot be changed.`;

  if (rejectionNeedsReason(decision.next, decision.reason))
    return 'Give the seller a reason for the rejection.';

  if (decision.next === 'APPROVED') return approvalProblem(request, seller);

  return null;
};

/** Queue order: requests waiting on the admin first, oldest first. */
export const queueOrder = <T extends { status: WithdrawalStatus; requestedAt: string }>(
  rows: T[]
): T[] =>
  [...rows].sort((a, b) => {
    const waiting = (r: T) => (r.status === 'PENDING' ? 0 : 1);
    return waiting(a) - waiting(b) || a.requestedAt.localeCompare(b.requestedAt);
  });
