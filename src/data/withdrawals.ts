import { ORDERS } from './orders';
import { storeById } from './stores';
import type { SellerStanding, WithdrawalStatus } from 'lib/withdrawals';

/* Withdrawal requests, and the seller standing an admin needs in order to
   judge one.

   There is no payouts service on the backend — not a resolver, not a table —
   so these rows are stand-ins. The shape is what the screen needs: enough of
   the seller's record to decide, and the bank details to actually send the
   money. */

export interface WithdrawalRow {
  id: string;
  storeId: string;
  /** AED. */
  amount: number;
  method: 'BANK_TRANSFER' | 'CARD';
  bankName: string;
  /** Held in full here; the list masks all but the last four. */
  accountNumber: string;
  iban: string;
  accountHolder: string;
  status: WithdrawalStatus;
  /** ISO date. */
  requestedAt: string;
  /** The seller's note on the request, or the admin's rejection reason. */
  note: string | null;
}

export const WITHDRAWALS: WithdrawalRow[] = [
  {
    id: 'WRD001',
    storeId: 'SH12345',
    amount: 2600,
    method: 'BANK_TRANSFER',
    bankName: 'Emirates NBD',
    accountNumber: '0012345678909876',
    iban: 'AE070331234567890123456',
    accountHolder: 'Alex Bennett',
    status: 'PENDING',
    requestedAt: '2025-03-14',
    note: 'Monthly payout, please process before the weekend.'
  },
  {
    id: 'WRD002',
    storeId: 'FF69870',
    amount: 9800,
    method: 'BANK_TRANSFER',
    bankName: 'First Abu Dhabi Bank',
    accountNumber: '0098871120004411',
    iban: 'AE480351112223334445556',
    accountHolder: 'Maya Haddad',
    status: 'PENDING',
    requestedAt: '2025-03-12',
    note: null
  },
  {
    id: 'WRD003',
    storeId: 'HH24680',
    amount: 1500,
    method: 'BANK_TRANSFER',
    bankName: 'Not linked',
    accountNumber: '',
    iban: '',
    accountHolder: 'Omar Farouk',
    status: 'PENDING',
    requestedAt: '2025-03-10',
    note: 'Need this urgently.'
  },
  {
    id: 'WRD004',
    storeId: 'CC09125',
    amount: 34000,
    method: 'BANK_TRANSFER',
    bankName: 'Emirates NBD',
    accountNumber: '0099031177552200',
    iban: 'AE120331999888777666555',
    accountHolder: 'Aisha Khalid',
    status: 'APPROVED',
    requestedAt: '2025-03-03',
    note: null
  },
  {
    id: 'WRD005',
    storeId: 'GG13579',
    amount: 7400,
    method: 'BANK_TRANSFER',
    bankName: 'Mashreq',
    accountNumber: '0044104002771400',
    iban: 'AE330441000222333444555',
    accountHolder: 'Fatima Noor',
    status: 'APPROVED',
    requestedAt: '2025-02-27',
    note: null
  },
  {
    id: 'WRD006',
    storeId: 'YY87634',
    amount: 5200,
    method: 'BANK_TRANSFER',
    bankName: 'Not linked',
    accountNumber: '',
    iban: '',
    accountHolder: 'Bilal Ahmed',
    status: 'REJECTED',
    requestedAt: '2025-02-20',
    note: 'Orders 1015 and 1023 were never dispatched. Resolve those first.'
  },
  {
    id: 'WRD007',
    storeId: 'SS98765',
    amount: 3050,
    method: 'BANK_TRANSFER',
    bankName: 'ADCB',
    accountNumber: '0077026648123000',
    iban: 'AE600030011122233344455',
    accountHolder: 'Yusuf Rahman',
    status: 'PENDING',
    requestedAt: '2025-03-15',
    note: null
  },
  {
    id: 'WRD008',
    storeId: 'ZR44512',
    amount: 2140,
    method: 'BANK_TRANSFER',
    bankName: 'RAKBANK',
    accountNumber: '0022189004411900',
    iban: 'AE910400122233344455566',
    accountHolder: 'Layla Haddad',
    status: 'APPROVED',
    requestedAt: '2025-02-11',
    note: null
  },
  {
    id: 'WRD009',
    storeId: 'SH12345',
    amount: 18400,
    method: 'BANK_TRANSFER',
    bankName: 'Emirates NBD',
    accountNumber: '0012345678909876',
    iban: 'AE070331234567890123456',
    accountHolder: 'Alex Bennett',
    status: 'REJECTED',
    requestedAt: '2025-01-29',
    note: 'Amount exceeded the cleared balance at the time of the request.'
  }
];

export const withdrawalById = (id: string): WithdrawalRow | undefined =>
  WITHDRAWALS.find((row) => row.id === id);

/** All but the last four, so a screenshot of this console leaks nothing. */
export const maskAccount = (accountNumber: string): string =>
  accountNumber.length >= 4 ? `****${accountNumber.slice(-4)}` : '—';

/**
 * The seller's money position, derived from the same order rows the Orders
 * screen shows rather than a second set of figures. A payout decision made
 * against numbers that disagree with the orders behind them is worse than no
 * decision at all.
 */
export const standingFor = (storeId: string): SellerStanding => {
  const orders = ORDERS.filter((order) => order.storeId === storeId);
  const paid = orders.filter((order) => order.paymentStatus === 'PAID');
  const store = storeById(storeId);
  const withBank = WITHDRAWALS.find(
    (row) => row.storeId === storeId && row.accountNumber.length > 0
  );

  return {
    available: paid
      .filter((order) => !order.freezeAmount)
      .reduce((sum, order) => sum + order.total, 0),
    frozen: paid
      .filter((order) => order.freezeAmount)
      .reduce((sum, order) => sum + order.total, 0),
    /* An order is only a strike if it was frozen *and* never moved past
       confirmation — a shipped order that is still frozen is waiting on the
       hold period, which is not the seller's fault. */
    undispatched: orders.filter(
      (order) =>
        order.freezeAmount &&
        (order.status === 'PENDING' || order.status === 'CONFIRMED')
    ).length,
    storeActive: store?.status === 'ACTIVE',
    bankAccount: withBank ? maskAccount(withBank.accountNumber) : null
  };
};
