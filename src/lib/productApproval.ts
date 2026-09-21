/* Whether a seller's listing may actually be sold.

   The rule the client asked for: a product a seller lists is not on sale the
   moment they save it — an admin reviews it first and decides whether it can
   be sold at all. So "can a buyer see this?" is the product of three separate
   decisions, made by three different parties:

     • the admin  — approval: has this listing been reviewed and cleared?
     • the seller — listed:   have they switched it on in their own dashboard?
     • stock      — supply:   is there anything left to sell?

   Keeping them apart matters. An admin revoking approval must not silently
   erase the seller's own on/off choice, and a product going out of stock must
   not look like a compliance problem. Pure functions, no imports, so this can
   be compiled on its own and exercised without a browser. */

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Listing {
  approval: ApprovalStatus;
  /** The seller's own switch, from their dashboard. */
  listedBySeller: boolean;
  stock: number;
}

/**
 * Why a listing is not sellable, most serious first, or null when it is.
 *
 * Ordered on purpose: a rejected product that is also out of stock is a
 * rejected product. Telling the seller to restock would send them to fix the
 * wrong thing.
 */
export type BlockReason =
  | 'REJECTED'
  | 'AWAITING_REVIEW'
  | 'UNLISTED_BY_SELLER'
  | 'OUT_OF_STOCK'
  | null;

export const blockReason = (listing: Listing): BlockReason => {
  if (listing.approval === 'REJECTED') return 'REJECTED';
  if (listing.approval === 'PENDING') return 'AWAITING_REVIEW';
  if (!listing.listedBySeller) return 'UNLISTED_BY_SELLER';
  if (listing.stock <= 0) return 'OUT_OF_STOCK';
  return null;
};

/** The one question the storefront should ask. */
export const canBeSold = (listing: Listing): boolean =>
  blockReason(listing) === null;

export const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

/* ---------------- what each side is told ---------------- */

const ADMIN_BLOCK_COPY: Record<NonNullable<BlockReason>, string> = {
  REJECTED: 'Rejected — not on sale',
  AWAITING_REVIEW: 'Awaiting your review — not on sale',
  UNLISTED_BY_SELLER: 'Approved, but the seller has it switched off',
  OUT_OF_STOCK: 'Approved and listed, but out of stock'
};

const SELLER_BLOCK_COPY: Record<NonNullable<BlockReason>, string> = {
  REJECTED: 'Rejected by Tredella. See the reason and edit your listing.',
  AWAITING_REVIEW: 'Waiting for Tredella to review it. Buyers cannot see it yet.',
  UNLISTED_BY_SELLER: 'You have this switched off. Turn it on to start selling.',
  OUT_OF_STOCK: 'Out of stock. Add stock to start selling again.'
};

export const adminExplanation = (listing: Listing): string => {
  const reason = blockReason(listing);
  return reason ? ADMIN_BLOCK_COPY[reason] : 'On sale';
};

export const sellerExplanation = (listing: Listing): string => {
  const reason = blockReason(listing);
  return reason ? SELLER_BLOCK_COPY[reason] : 'On sale';
};

/* ---------------- what an admin may change it to ---------------- */

/**
 * PENDING is not offered: it is what a listing arrives as, not somewhere a
 * reviewer can push it back to. Re-opening a decision means approving or
 * rejecting again, which keeps every transition an accountable one.
 */
export const nextStatuses = (current: ApprovalStatus): ApprovalStatus[] =>
  (['APPROVED', 'REJECTED'] as ApprovalStatus[]).filter((s) => s !== current);

/** A rejection the seller cannot act on is worthless, so the reason is required. */
export const rejectionNeedsReason = (
  next: ApprovalStatus,
  reason: string
): boolean => next === 'REJECTED' && reason.trim().length === 0;

export interface ReviewDecision {
  next: ApprovalStatus;
  reason: string;
}

/** Null when the decision is fine to submit, otherwise the message to show. */
export const reviewProblem = (
  current: ApprovalStatus,
  decision: ReviewDecision
): string | null => {
  if (decision.next === current) return 'Pick a different status to save a change.';
  if (!nextStatuses(current).includes(decision.next))
    return 'That status cannot be set from here.';
  if (rejectionNeedsReason(decision.next, decision.reason))
    return 'Give the seller a reason for the rejection.';
  return null;
};

/**
 * Applying the decision. The seller's own switch is carried through untouched —
 * approving a listing does not put it on sale if the seller had it off, and
 * rejecting does not flip their switch behind their back.
 */
export const applyReview = <T extends Listing>(
  listing: T,
  decision: ReviewDecision
): T => ({ ...listing, approval: decision.next });

/** Queue ordering: everything waiting on the admin, oldest first. */
export const reviewQueueOrder = <T extends { approval: ApprovalStatus; createdAt: string }>(
  rows: T[]
): T[] =>
  [...rows].sort((a, b) => {
    const waiting = (r: T) => (r.approval === 'PENDING' ? 0 : 1);
    return waiting(a) - waiting(b) || a.createdAt.localeCompare(b.createdAt);
  });
