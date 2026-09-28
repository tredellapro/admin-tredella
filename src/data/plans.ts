import type { EditablePlan } from 'lib/plans';

/* The two seller plans, mirroring backend-tredella's PLAN_CATALOGUE.

   There are exactly two and what separates them is which storefronts a seller
   gets. `discountPercent` is the one field that is not in the backend
   catalogue yet — the Plan table has no discount column, so an admin editing
   it here has nowhere to save it. See README.

   Prices are AED, billed monthly. Quarterly was dropped as a product and is
   offered nowhere. */

export const PLANS: EditablePlan[] = [
  {
    code: 'BASIC',
    name: 'Retail',
    tagline: 'Sell single units to shoppers across the UAE.',
    monthlyPrice: 150,
    discountPercent: 0,
    active: true,
    features: [
      { kind: 'FEATURE', label: 'Retail storefront', included: true },
      { kind: 'FEATURE', label: 'Unlimited product listings', included: true },
      { kind: 'FEATURE', label: '10 product showcases', included: true },
      { kind: 'FEATURE', label: '20 RFQ responses a month', included: true },
      { kind: 'FEATURE', label: 'Business verification support', included: true },
      { kind: 'FEATURE', label: 'Wholesale storefront', included: false },
      {
        kind: 'FEATURE',
        label: 'Full-service onboarding help for 60 days',
        included: false
      },
      { kind: 'FEATURE', label: 'Dedicated Account Manager', included: false },
      {
        kind: 'NOTE',
        title: 'Retail Tab',
        label:
          'Sell single units to shoppers. A category-based fee applies on retail sales.'
      },
      {
        kind: 'NOTE',
        title: 'Upgrade Anytime',
        label:
          'Move up to Wholesale + Retail whenever you are ready — your listings come with you.'
      }
    ]
  },
  {
    code: 'STANDARD',
    name: 'Wholesale + Retail',
    tagline: 'Everything in Retail, plus the wholesale storefront.',
    monthlyPrice: 200,
    discountPercent: 0,
    active: true,
    features: [
      { kind: 'FEATURE', label: 'Retail storefront', included: true },
      { kind: 'FEATURE', label: 'Wholesale storefront', included: true },
      { kind: 'FEATURE', label: 'Unlimited product listings', included: true },
      { kind: 'FEATURE', label: '20 product showcases', included: true },
      { kind: 'FEATURE', label: '40 RFQ responses a month', included: true },
      { kind: 'FEATURE', label: 'Business verification support', included: true },
      {
        kind: 'FEATURE',
        label: 'Full-service onboarding help for 60 days',
        included: true
      },
      { kind: 'FEATURE', label: 'Dedicated Account Manager', included: true },
      {
        kind: 'NOTE',
        title: 'No Additional Fees',
        label:
          'There aren’t any additional charges or percentages on products that are used for wholesale operations.'
      },
      {
        kind: 'NOTE',
        title: 'Both Storefronts',
        label:
          'Switch between retail and wholesale from your dashboard, and list a product in either or both.'
      }
    ]
  }
];

/** Subscribers per plan, for the "who is on this" line. */
export const SUBSCRIBERS: Record<string, number> = {
  BASIC: 34,
  STANDARD: 52
};
