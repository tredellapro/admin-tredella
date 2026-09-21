import type { AdminOrder } from 'types/console';

/* Orders across every store.

   `freezeAmount` mirrors the seller-side payout rule already built in
   seller-tredella/src/lib/payouts.ts: money from an order that has not been
   dispatched is held back rather than paid out. The admin needs to see that
   flag because releasing it is their call, not the seller's. */

export const ORDERS: AdminOrder[] = [
  { id: '12345', storeId: 'SH12345', productId: 'P-10041', mode: 'WHOLESALE', customerName: 'Hamza Tariq', customerEmail: 'hamzatariq@gmail.com', items: 500, total: 12000, discountPercent: 50, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Tredella Shipping', status: 'SHIPPED', freezeAmount: true, createdAt: '2025-03-09' },
  { id: '54321', storeId: 'FF69870', productId: 'P-10042', mode: 'WHOLESALE', customerName: 'Layla Haddad', customerEmail: 'layla.haddad@example.ae', items: 250, total: 9625, discountPercent: 20, coupon: 'EID20', paymentMethod: 'Bank Transfer', paymentStatus: 'REFUNDED', shipping: 'Standard', status: 'CANCELLED', freezeAmount: false, createdAt: '2025-03-08' },
  { id: '43521', storeId: 'GG13579', productId: 'P-10044', mode: 'WHOLESALE', customerName: 'Omar Farouk', customerEmail: 'omar.farouk@example.ae', items: 400, total: 13600, discountPercent: 15, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Tredella Shipping', status: 'DELIVERED', freezeAmount: true, createdAt: '2025-03-07' },
  { id: '35421', storeId: 'HH24680', productId: 'P-10043', mode: 'RETAIL', customerName: 'Fatima Noor', customerEmail: 'fatima.noor@example.ae', items: 2, total: 80, discountPercent: 10, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'REFUNDED', shipping: 'Standard', status: 'CANCELLED', freezeAmount: false, createdAt: '2025-03-06' },
  { id: '25431', storeId: 'CC09125', productId: 'P-10047', mode: 'WHOLESALE', customerName: 'Yusuf Rahman', customerEmail: 'yusuf.rahman@example.ae', items: 1000, total: 34000, discountPercent: 12, coupon: 'BULK12', paymentMethod: 'Bank Transfer', paymentStatus: 'PAID', shipping: 'Tredella Shipping', status: 'COMPLETED', freezeAmount: true, createdAt: '2025-02-28' },
  { id: '15423', storeId: 'YY87634', productId: 'P-10046', mode: 'RETAIL', customerName: 'Bilal Ahmed', customerEmail: 'bilal.ahmed@example.ae', items: 1, total: 75, discountPercent: 0, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'REFUNDED', shipping: 'Standard', status: 'CANCELLED', freezeAmount: false, createdAt: '2025-02-25' },
  { id: '25432', storeId: 'SS98765', productId: 'P-10045', mode: 'RETAIL', customerName: 'Nadia Iqbal', customerEmail: 'nadia.iqbal@example.ae', items: 2, total: 104, discountPercent: 24, coupon: 'GLOW10', paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Standard', status: 'SHIPPED', freezeAmount: true, createdAt: '2025-03-09' },
  { id: '25433', storeId: 'SH12345', productId: 'P-10049', mode: 'RETAIL', customerName: 'Sara Mansoor', customerEmail: 'sara.mansoor@example.ae', items: 1, total: 95, discountPercent: 0, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Tredella Shipping', status: 'CONFIRMED', freezeAmount: false, createdAt: '2025-03-09' },
  { id: '25434', storeId: 'GG13579', productId: 'P-10051', mode: 'RETAIL', customerName: 'Olivia Davis', customerEmail: 'olivia.davis@example.com', items: 3, total: 1008, discountPercent: 30, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Standard', status: 'DELIVERED', freezeAmount: false, createdAt: '2025-03-04' },
  { id: '25435', storeId: 'FF69870', productId: 'P-10050', mode: 'WHOLESALE', customerName: 'Noah Wilson', customerEmail: 'noah.wilson@example.com', items: 120, total: 46368, discountPercent: 8, coupon: null, paymentMethod: 'Bank Transfer', paymentStatus: 'PAID', shipping: 'Tredella Shipping', status: 'PENDING', freezeAmount: true, createdAt: '2025-03-10' },
  { id: '25436', storeId: 'CC09125', productId: 'P-10054', mode: 'RETAIL', customerName: 'Emily Carter', customerEmail: 'emily.carter@example.com', items: 2, total: 238, discountPercent: 10, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Standard', status: 'COMPLETED', freezeAmount: false, createdAt: '2025-02-19' },
  { id: '25437', storeId: 'ZR44512', productId: 'P-10055', mode: 'RETAIL', customerName: 'Liam Carter', customerEmail: 'liam.carter@example.com', items: 1, total: 560, discountPercent: 0, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Tredella Shipping', status: 'SHIPPED', freezeAmount: true, createdAt: '2025-03-11' },
  { id: '25438', storeId: 'SS98765', productId: 'P-10053', mode: 'WHOLESALE', customerName: 'Ava Thompson', customerEmail: 'ava.thompson@example.com', items: 60, total: 43788, discountPercent: 18, coupon: 'SCHOOL18', paymentMethod: 'Bank Transfer', paymentStatus: 'PAID', shipping: 'Tredella Shipping', status: 'CONFIRMED', freezeAmount: true, createdAt: '2025-03-12' },
  { id: '25439', storeId: 'ZR44512', productId: 'P-10048', mode: 'RETAIL', customerName: 'Aisha Khalid', customerEmail: 'aisha.khalid@example.ae', items: 2, total: 275, discountPercent: 5, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Standard', status: 'DELIVERED', freezeAmount: false, createdAt: '2025-02-14' },
  { id: '25440', storeId: 'HH24680', productId: 'P-10052', mode: 'WHOLESALE', customerName: 'Faisal Khan', customerEmail: 'faisalkhan@gmail.com', items: 40, total: 25600, discountPercent: 0, coupon: null, paymentMethod: 'Bank Transfer', paymentStatus: 'PAID', shipping: 'Standard', status: 'PENDING', freezeAmount: true, createdAt: '2025-03-13' },
  { id: '25441', storeId: 'SH12345', productId: 'P-10041', mode: 'WHOLESALE', customerName: 'Sophia Lee', customerEmail: 'sophia.lee@example.com', items: 250, total: 25500, discountPercent: 15, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Tredella Shipping', status: 'COMPLETED', freezeAmount: false, createdAt: '2025-01-30' },
  { id: '25442', storeId: 'GG13579', productId: 'P-10044', mode: 'WHOLESALE', customerName: 'Daniel Wright', customerEmail: 'daniel.wright@example.com', items: 300, total: 7200, discountPercent: 20, coupon: null, paymentMethod: 'Credit Card', paymentStatus: 'PAID', shipping: 'Standard', status: 'PENDING', freezeAmount: true, createdAt: '2025-03-14' },
  { id: '25443', storeId: 'CC09125', productId: 'P-10047', mode: 'WHOLESALE', customerName: 'Chloe Bennett', customerEmail: 'chloe.bennett@example.com', items: 500, total: 17000, discountPercent: 12, coupon: null, paymentMethod: 'Bank Transfer', paymentStatus: 'PAID', shipping: 'Tredella Shipping', status: 'DELIVERED', freezeAmount: false, createdAt: '2025-02-08' }
];

export const orderById = (id: string): AdminOrder | undefined =>
  ORDERS.find((order) => order.id === id);

export const ordersForStore = (storeId: string): AdminOrder[] =>
  ORDERS.filter((order) => order.storeId === storeId);

export const ordersForCustomer = (email: string): AdminOrder[] =>
  ORDERS.filter((order) => order.customerEmail === email);
