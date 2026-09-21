import type { AdminOrder } from 'types/console';

/* Order wording lives here rather than in a page file: a `page.tsx` is meant
   to export the route's own contract, and three screens need these labels. */

export const ORDER_STATUS_LABEL: Record<AdminOrder['status'], string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

export const ORDER_STATUSES = Object.keys(
  ORDER_STATUS_LABEL
) as AdminOrder['status'][];

export const PAYMENT_STATUS_LABEL: Record<AdminOrder['paymentStatus'], string> = {
  PAID: 'Paid',
  REFUNDED: 'Refunded'
};
