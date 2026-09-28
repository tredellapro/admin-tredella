import type { Submission } from 'lib/verification';

/* Seller trade registrations awaiting review.

   The seller app has collected all of this since day one — legal name, legal
   form, emirate, licence number and expiry, Emirates ID, optional TRN, and the
   documents — and `verificationStatus` has sat on PENDING ever since, because
   no screen and no mutation ever moved it. `removeSellerDocument` exists on the
   API but is scoped to the signed-in seller, so an admin cannot call it.

   Fixed reference date so the expiry warnings are deterministic; move this one
   constant to move the whole demo. */

export const TODAY = '2026-09-28';

export interface SellerSubmission extends Submission {
  /** Links to the store screen. */
  storeId: string;
  legalForm: string;
  emirate: string;
  addressLine: string;
  phone: string;
  email: string;
  tradeLicenseNumber: string;
  emiratesIdNumber: string;
}

const doc = (type: Submission['documents'][number]['type'], uploadedAt: string) => ({
  type,
  fileName: `${type.toLowerCase()}.pdf`,
  uploadedAt
});

export const SUBMISSIONS: SellerSubmission[] = [
  {
    sellerId: 'V-1',
    storeId: 'HH24680',
    storeName: 'Clickora',
    legalName: 'Clickora Trading LLC',
    legalForm: 'LLC',
    emirate: 'DUBAI',
    addressLine: 'Al Quoz Industrial 3, Dubai',
    phone: '+971 55 220 9933',
    email: 'omar.farouk@example.ae',
    tradeLicenseNumber: 'CN-1198342',
    tradeLicenseExpiry: '2027-03-14',
    emiratesIdNumber: '784-1985-0128773-1',
    trn: null,
    status: 'PENDING',
    documents: [
      doc('TRADE_LICENSE', '2026-09-02'),
      doc('EMIRATES_ID_FRONT', '2026-09-02'),
      doc('EMIRATES_ID_BACK', '2026-09-02')
    ],
    submittedAt: '2026-09-02',
    note: null
  },
  {
    sellerId: 'V-2',
    storeId: 'YY87634',
    storeName: 'Snapnado',
    legalName: 'Snapnado FZE',
    legalForm: 'FREE_ZONE',
    emirate: 'AJMAN',
    addressLine: 'Ajman Free Zone, Warehouse 22',
    phone: '+971 54 118 7765',
    email: 'bilal.ahmed@example.ae',
    tradeLicenseNumber: 'AFZ-88201',
    tradeLicenseExpiry: '2026-11-02',
    emiratesIdNumber: '784-1991-2033118-4',
    trn: '100442891700003',
    /* Gave a TRN but no VAT certificate — the case that would be wrongly
       approved if the requirement were unconditional. */
    status: 'PENDING',
    documents: [
      doc('TRADE_LICENSE', '2026-09-05'),
      doc('EMIRATES_ID_FRONT', '2026-09-05'),
      doc('EMIRATES_ID_BACK', '2026-09-05')
    ],
    submittedAt: '2026-09-05',
    note: null
  },
  {
    sellerId: 'V-3',
    storeId: 'ZR44512',
    storeName: 'Nova Living',
    legalName: 'Nova Living Home Trading',
    legalForm: 'SOLE_ESTABLISHMENT',
    emirate: 'DUBAI',
    addressLine: 'Jumeirah 1, Dubai',
    phone: '+971 52 900 4411',
    email: 'layla.haddad@example.ae',
    tradeLicenseNumber: '778190',
    /* Licence already out of date — must not be approvable. */
    tradeLicenseExpiry: '2026-08-19',
    emiratesIdNumber: '784-1993-7781902-2',
    trn: null,
    status: 'PENDING',
    documents: [
      doc('TRADE_LICENSE', '2026-08-28'),
      doc('EMIRATES_ID_FRONT', '2026-08-28'),
      doc('EMIRATES_ID_BACK', '2026-08-28')
    ],
    submittedAt: '2026-08-28',
    note: null
  },
  {
    sellerId: 'V-4',
    storeId: 'SS98765',
    storeName: 'Pixcart',
    legalName: 'Pixcart General Trading LLC',
    legalForm: 'LLC',
    emirate: 'ABU_DHABI',
    addressLine: 'Khalifa City, Abu Dhabi',
    phone: '+971 50 664 8123',
    email: 'yusuf.rahman@example.ae',
    tradeLicenseNumber: 'AD-4471902',
    /* In date, but not for long — the warning case. */
    tradeLicenseExpiry: '2026-10-15',
    emiratesIdNumber: '784-1990-4471902-7',
    trn: '100778112900003',
    status: 'PENDING',
    documents: [
      doc('TRADE_LICENSE', '2026-09-20'),
      doc('EMIRATES_ID_FRONT', '2026-09-20'),
      doc('EMIRATES_ID_BACK', '2026-09-20'),
      doc('VAT_CERTIFICATE', '2026-09-20')
    ],
    submittedAt: '2026-09-20',
    note: null
  },
  {
    sellerId: 'V-5',
    storeId: 'SH12345',
    storeName: 'Shopnetic',
    legalName: 'Shopnetic FZ-LLC',
    legalForm: 'FREE_ZONE',
    emirate: 'DUBAI',
    addressLine: '123 Fashion Ave, Dubai',
    phone: '+971 50 123 4567',
    email: 'alex.bennett@example.ae',
    tradeLicenseNumber: 'CN-2041887',
    tradeLicenseExpiry: '2028-01-15',
    emiratesIdNumber: '784-1987-1098342-3',
    trn: '100119983400003',
    status: 'APPROVED',
    documents: [
      doc('TRADE_LICENSE', '2025-01-10'),
      doc('EMIRATES_ID_FRONT', '2025-01-10'),
      doc('EMIRATES_ID_BACK', '2025-01-10'),
      doc('VAT_CERTIFICATE', '2025-01-10')
    ],
    submittedAt: '2025-01-10',
    note: null
  },
  {
    sellerId: 'V-6',
    storeId: 'FF69870',
    storeName: 'SwiftCart',
    legalName: 'SwiftCart Commerce LLC',
    legalForm: 'LLC',
    emirate: 'DUBAI',
    addressLine: '44 Marina Walk, Dubai',
    phone: '+971 52 887 1120',
    email: 'maya.haddad@example.ae',
    tradeLicenseNumber: 'CN-9930118',
    tradeLicenseExpiry: '2027-12-01',
    emiratesIdNumber: '784-1990-9930118-5',
    trn: null,
    status: 'APPROVED',
    documents: [
      doc('TRADE_LICENSE', '2025-01-12'),
      doc('EMIRATES_ID_FRONT', '2025-01-12'),
      doc('EMIRATES_ID_BACK', '2025-01-12')
    ],
    submittedAt: '2025-01-12',
    note: null
  },
  {
    sellerId: 'V-7',
    storeId: 'GG13579',
    storeName: 'Trendloop',
    legalName: 'Trendloop Media FZ',
    legalForm: 'FREE_ZONE',
    emirate: 'SHARJAH',
    addressLine: 'Sharjah Media City',
    phone: '+971 56 771 4002',
    email: 'fatima.noor@example.ae',
    tradeLicenseNumber: 'SHAMS-33102',
    tradeLicenseExpiry: '2027-06-30',
    emiratesIdNumber: '784-1994-3310221-9',
    trn: null,
    status: 'REJECTED',
    documents: [
      doc('TRADE_LICENSE', '2026-07-02'),
      doc('EMIRATES_ID_FRONT', '2026-07-02'),
      doc('EMIRATES_ID_BACK', '2026-07-02')
    ],
    submittedAt: '2026-07-02',
    note: 'The trading name on the licence does not match the store name. Send a licence in the name of Trendloop, or rename the store.'
  },
  {
    sellerId: 'V-8',
    storeId: 'CC09125',
    storeName: 'Gadget Galaxy',
    legalName: 'Gadget Galaxy Electronics',
    legalForm: 'SOLE_ESTABLISHMENT',
    emirate: 'DUBAI',
    addressLine: 'Deira, Dubai',
    phone: '+971 58 330 1177',
    email: 'aisha.khalid@example.ae',
    tradeLicenseNumber: '',
    tradeLicenseExpiry: '2027-09-09',
    emiratesIdNumber: '',
    trn: null,
    status: 'UNSUBMITTED',
    documents: [],
    submittedAt: null,
    note: null
  }
];

export const submissionById = (id: string): SellerSubmission | undefined =>
  SUBMISSIONS.find((entry) => entry.sellerId === id);

export const EMIRATE_LABEL: Record<string, string> = {
  DUBAI: 'Dubai',
  ABU_DHABI: 'Abu Dhabi',
  SHARJAH: 'Sharjah',
  AJMAN: 'Ajman',
  UMM_AL_QUWAIN: 'Umm Al Quwain',
  RAS_AL_KHAIMAH: 'Ras Al Khaimah',
  FUJAIRAH: 'Fujairah'
};

export const LEGAL_FORM_LABEL: Record<string, string> = {
  SOLE_ESTABLISHMENT: 'Sole establishment',
  LLC: 'LLC',
  FREE_ZONE: 'Free zone',
  BRANCH: 'Branch',
  CIVIL_COMPANY: 'Civil company'
};
