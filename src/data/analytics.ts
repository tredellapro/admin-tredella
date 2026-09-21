import { ORDERS } from './orders';
import { PRODUCTS } from './products';
import { STORES } from './stores';
import { USERS } from './users';
import { canBeSold } from 'lib/productApproval';
import type { StorefrontMode } from 'types/console';

/* Derived from the same rows the list screens show, rather than a second set
   of hardcoded totals. If a number on the dashboard disagrees with the table
   behind it, the dashboard is the thing nobody trusts again. */

export interface Totals {
  revenue: number;
  orders: number;
  stores: number;
  activeStores: number;
  customers: number;
  liveProducts: number;
  awaitingReview: number;
  rejected: number;
  frozen: number;
  cancelled: number;
}

export const totalsFor = (mode: StorefrontMode): Totals => {
  const orders = ORDERS.filter((order) => order.mode === mode);
  const products = PRODUCTS.filter((product) => product.mode === mode);

  return {
    revenue: orders
      .filter((order) => order.paymentStatus === 'PAID')
      .reduce((sum, order) => sum + order.total, 0),
    orders: orders.length,
    stores: STORES.length,
    activeStores: STORES.filter((store) => store.status === 'ACTIVE').length,
    customers: USERS.filter((user) => user.role === 'BUYER').length,
    liveProducts: products.filter((product) =>
      canBeSold({
        approval: product.approval,
        listedBySeller: product.listedBySeller,
        stock: product.stock
      })
    ).length,
    awaitingReview: products.filter((p) => p.approval === 'PENDING').length,
    rejected: products.filter((p) => p.approval === 'REJECTED').length,
    frozen: orders
      .filter((order) => order.freezeAmount)
      .reduce((sum, order) => sum + order.total, 0),
    cancelled: orders.filter((order) => order.status === 'CANCELLED').length
  };
};

/** Twelve months of revenue, in AED. Fixed figures — no live reporting yet. */
export const REVENUE_SERIES: { month: string; retail: number; wholesale: number }[] = [
  { month: 'Oct', retail: 18400, wholesale: 62000 },
  { month: 'Nov', retail: 22100, wholesale: 71500 },
  { month: 'Dec', retail: 31800, wholesale: 96200 },
  { month: 'Jan', retail: 24600, wholesale: 78400 },
  { month: 'Feb', retail: 27300, wholesale: 84900 },
  { month: 'Mar', retail: 35200, wholesale: 112600 },
  { month: 'Apr', retail: 29800, wholesale: 91300 },
  { month: 'May', retail: 33100, wholesale: 104700 },
  { month: 'Jun', retail: 28400, wholesale: 88200 },
  { month: 'Jul', retail: 30900, wholesale: 95800 },
  { month: 'Aug', retail: 37600, wholesale: 118400 },
  { month: 'Sep', retail: 41200, wholesale: 126900 }
];

/** Stores ranked by lifetime sales — the five the dashboard lists. */
export const topStores = () =>
  [...STORES].sort((a, b) => b.sales - a.sales).slice(0, 5);

/** Share of orders in each state, for the donut. */
export const orderMix = (mode: StorefrontMode) => {
  const orders = ORDERS.filter((order) => order.mode === mode);
  const of = (...states: string[]) =>
    orders.filter((order) => states.includes(order.status)).length;

  return [
    { label: 'Completed', value: of('COMPLETED', 'DELIVERED'), tone: '#1f9254' },
    { label: 'In transit', value: of('SHIPPED', 'CONFIRMED'), tone: '#2563a8' },
    { label: 'Pending', value: of('PENDING'), tone: '#b07d17' },
    { label: 'Cancelled', value: of('CANCELLED'), tone: '#e94560' }
  ].filter((slice) => slice.value > 0);
};
