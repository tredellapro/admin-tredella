/* Editing the two seller plans.

   There are exactly two and what separates them is which storefronts a seller
   gets: Retail, and Wholesale + Retail. Do not add a third — that is a product
   decision, not an oversight.

   The plan CODES stay BASIC and STANDARD even though nobody reads those words:
   the seller app maps storefront capability from the code, and every existing
   subscription row references it. Renaming a code strands those rows. Only the
   display name, price, discount and feature list are editable here.

   Prices are AED, billed monthly. Quarterly was dropped as a product.

   Pure and dependency-free so it can be compiled and exercised on its own. */

export type PlanCode = 'BASIC' | 'STANDARD';

export type FeatureKind = 'FEATURE' | 'NOTE';

export interface PlanFeature {
  kind: FeatureKind;
  /** NOTE rows carry a heading; FEATURE rows do not. */
  title?: string;
  label: string;
  /** A FEATURE the plan does not include, shown struck through. */
  included?: boolean;
}

export interface EditablePlan {
  code: PlanCode;
  name: string;
  tagline: string;
  /** AED per month, before any discount. */
  monthlyPrice: number;
  /** Whole percent off, 0 when the plan is at list price. */
  discountPercent: number;
  active: boolean;
  features: PlanFeature[];
}

const MAX_DISCOUNT = 90;
const MAX_PRICE = 100_000;

/**
 * What a seller actually pays, rounded to fils.
 *
 * Rounded here rather than at render time so the number on the plan card, the
 * number in the invoice and the number the API charges cannot drift apart by a
 * hundredth of a dirham.
 */
export const effectivePrice = (
  monthlyPrice: number,
  discountPercent: number
): number =>
  Math.round(monthlyPrice * (1 - discountPercent / 100) * 100) / 100;

/** What the discount is worth per month, for the "you save" line. */
export const savingPerMonth = (
  monthlyPrice: number,
  discountPercent: number
): number =>
  Math.round((monthlyPrice - effectivePrice(monthlyPrice, discountPercent)) * 100) /
  100;

/* ---------------- validation ---------------- */

export const priceProblem = (monthlyPrice: number): string | null => {
  if (!Number.isFinite(monthlyPrice)) return 'Enter a price.';
  if (monthlyPrice <= 0) return 'A plan has to cost something.';
  if (monthlyPrice > MAX_PRICE)
    return `That is over ${MAX_PRICE.toLocaleString('en-US')} AED — check the figure.`;
  return null;
};

export const discountProblem = (discountPercent: number): string | null => {
  if (!Number.isFinite(discountPercent)) return 'Enter a discount, or 0 for none.';
  if (discountPercent < 0) return 'A discount cannot be negative.';
  /* Capped well under 100 on purpose: a 100% discount is a free plan, which is
     a different product decision and should not be reachable by fat-fingering
     an extra zero into a promo. */
  if (discountPercent > MAX_DISCOUNT)
    return `Keep the discount at or under ${MAX_DISCOUNT}%. A free plan is a separate decision.`;
  return null;
};

export const featuresProblem = (features: PlanFeature[]): string | null => {
  if (features.length === 0) return 'A plan needs at least one point.';
  if (features.some((feature) => feature.label.trim().length === 0))
    return 'One of the points is empty. Fill it in or remove it.';
  if (features.some((f) => f.kind === 'NOTE' && !f.title?.trim()))
    return 'A note needs a heading.';
  return null;
};

/** Null when the draft is fine to save, otherwise the first problem with it. */
export const planProblem = (plan: EditablePlan): string | null => {
  if (plan.name.trim().length === 0) return 'Give the plan a name.';
  return (
    priceProblem(plan.monthlyPrice) ??
    discountProblem(plan.discountPercent) ??
    featuresProblem(plan.features)
  );
};

/* ---------------- feature list editing ---------------- */

export const addFeature = (
  features: PlanFeature[],
  kind: FeatureKind = 'FEATURE'
): PlanFeature[] => [
  ...features,
  kind === 'NOTE'
    ? { kind, title: '', label: '' }
    : { kind, label: '', included: true }
];

export const removeFeature = (
  features: PlanFeature[],
  index: number
): PlanFeature[] => features.filter((_, i) => i !== index);

export const updateFeature = (
  features: PlanFeature[],
  index: number,
  patch: Partial<PlanFeature>
): PlanFeature[] =>
  features.map((feature, i) => (i === index ? { ...feature, ...patch } : feature));

/** Reordering by one step; out-of-range moves are a no-op rather than a throw. */
export const moveFeature = (
  features: PlanFeature[],
  index: number,
  direction: -1 | 1
): PlanFeature[] => {
  const target = index + direction;
  if (index < 0 || index >= features.length) return features;
  if (target < 0 || target >= features.length) return features;
  const next = [...features];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};
