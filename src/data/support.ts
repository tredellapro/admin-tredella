/* Complaints and support chats.

   Two screens, one shape: both are a thread of messages between somebody on
   the marketplace and an admin. The backend has Conversation and Message
   models that already support SELLER_ADMIN and BUYER_ADMIN threads, but
   nothing models a *complaint* — no subject, no priority, no open/solved. So
   these are stand-ins. See README.

   Note for whoever wires the chat screen up: listConversations scopes an
   admin to `{ adminId: userId }`, and startConversation assigns adminId with
   findFirst({ role: 'ADMIN' }) — whichever admin row comes back first. With
   more than one admin account that means support threads land on one person
   and are invisible to everyone else. Support wants a shared queue, not an
   arbitrary owner. */

export type ComplaintPriority = 'URGENT' | 'NORMAL';
export type ComplaintState = 'OPEN' | 'SOLVED';
export type ComplaintTopic =
  | 'PAYMENT'
  | 'PRODUCT'
  | 'SHIPPING'
  | 'ACCOUNT';

export const TOPIC_LABEL: Record<ComplaintTopic, string> = {
  PAYMENT: 'Payment Problem',
  PRODUCT: 'Product Problem',
  SHIPPING: 'Shipping Problem',
  ACCOUNT: 'Account Problem'
};

export interface ThreadMessage {
  id: string;
  author: string;
  /** True when an admin wrote it. */
  fromAdmin: boolean;
  /** Pre-formatted; no clock is read during render. */
  sentAt: string;
  body: string;
  attachment?: { name: string; size: string; kind: 'PDF' | 'IMAGE' };
}

export interface Complaint {
  id: string;
  subject: string;
  topic: ComplaintTopic;
  priority: ComplaintPriority;
  state: ComplaintState;
  /** ISO date. */
  raisedAt: string;
  raisedBy: string;
  raisedByEmail: string;
  /** Set when the complaint came from a store rather than a shopper. */
  storeId: string | null;
  orderId: string | null;
  messages: ThreadMessage[];
}

const body =
  'The payment went through on my card but the order still shows as unpaid in my account. I have attached the bank confirmation. Could you check what happened and confirm the order is going out?';

const reply =
  'Thanks for sending that through. I can see the charge on our side and the order is now marked as paid. It will be dispatched today and you will get the tracking link by email.';

const thread = (who: string): ThreadMessage[] => [
  { id: 'm1', author: who, fromAdmin: false, sentAt: '10 Jan 2025, 12:00 AM', body },
  { id: 'm2', author: 'John Wick (Admin)', fromAdmin: true, sentAt: '10 Jan 2025, 12:14 AM', body: reply },
  {
    id: 'm3',
    author: who,
    fromAdmin: false,
    sentAt: '10 Jan 2025, 12:20 AM',
    body: 'Thank you. One more thing — can you confirm the delivery address on the order is the new one?',
    attachment: { name: 'bank-confirmation.pdf', size: '525 KB', kind: 'PDF' }
  },
  {
    id: 'm4',
    author: 'John Wick (Admin)',
    fromAdmin: true,
    sentAt: '10 Jan 2025, 12:31 AM',
    body: 'Checked — it is going to the updated address in Al Barsha. Nothing else needed from you.'
  }
];

export const COMPLAINTS: Complaint[] = [
  {
    id: 'C-2041',
    subject: 'Payment method is not working',
    topic: 'PAYMENT',
    priority: 'URGENT',
    state: 'OPEN',
    raisedAt: '2025-01-25',
    raisedBy: 'Hamza Tariq',
    raisedByEmail: 'hamzatariq@gmail.com',
    storeId: null,
    orderId: '12345',
    messages: thread('Hamza Tariq')
  },
  {
    id: 'C-2042',
    subject: 'Product Broken. I need refund',
    topic: 'PRODUCT',
    priority: 'NORMAL',
    state: 'OPEN',
    raisedAt: '2024-11-15',
    raisedBy: 'Emily Carter',
    raisedByEmail: 'emily.carter@example.com',
    storeId: null,
    orderId: '25436',
    messages: thread('Emily Carter')
  },
  {
    id: 'C-2043',
    subject: 'Where is my order?',
    topic: 'SHIPPING',
    priority: 'URGENT',
    state: 'OPEN',
    raisedAt: '2025-02-25',
    raisedBy: 'Noah Wilson',
    raisedByEmail: 'noah.wilson@example.com',
    storeId: null,
    orderId: '25435',
    messages: thread('Noah Wilson')
  },
  {
    id: 'C-2044',
    subject: 'Payout has not arrived',
    topic: 'PAYMENT',
    priority: 'URGENT',
    state: 'OPEN',
    raisedAt: '2025-03-10',
    raisedBy: 'Omar Farouk',
    raisedByEmail: 'omar.farouk@example.ae',
    storeId: 'HH24680',
    orderId: null,
    messages: thread('Omar Farouk')
  },
  {
    id: 'C-2045',
    subject: 'Wrong item delivered',
    topic: 'PRODUCT',
    priority: 'NORMAL',
    state: 'OPEN',
    raisedAt: '2025-02-14',
    raisedBy: 'Olivia Davis',
    raisedByEmail: 'olivia.davis@example.com',
    storeId: null,
    orderId: '25439',
    messages: thread('Olivia Davis')
  },
  {
    id: 'C-2046',
    subject: 'Courier never collected the parcel',
    topic: 'SHIPPING',
    priority: 'URGENT',
    state: 'OPEN',
    raisedAt: '2025-02-25',
    raisedBy: 'Maya Haddad',
    raisedByEmail: 'maya.haddad@example.ae',
    storeId: 'FF69870',
    orderId: '25435',
    messages: thread('Maya Haddad')
  },
  {
    id: 'C-2047',
    subject: 'Cannot sign in to my account',
    topic: 'ACCOUNT',
    priority: 'NORMAL',
    state: 'OPEN',
    raisedAt: '2025-03-02',
    raisedBy: 'Ava Thompson',
    raisedByEmail: 'ava.thompson@example.com',
    storeId: null,
    orderId: null,
    messages: thread('Ava Thompson')
  },
  {
    id: 'C-2030',
    subject: 'Payment method is not working',
    topic: 'PAYMENT',
    priority: 'URGENT',
    state: 'SOLVED',
    raisedAt: '2025-01-25',
    raisedBy: 'Liam Carter',
    raisedByEmail: 'liam.carter@example.com',
    storeId: null,
    orderId: '25437',
    messages: thread('Liam Carter')
  },
  {
    id: 'C-2031',
    subject: 'Refund was short by the shipping fee',
    topic: 'PAYMENT',
    priority: 'NORMAL',
    state: 'SOLVED',
    raisedAt: '2025-01-18',
    raisedBy: 'Sara Ahmad',
    raisedByEmail: 'sarahamd@gmail.com',
    storeId: null,
    orderId: '54321',
    messages: thread('Sara Ahmad')
  },
  {
    id: 'C-2032',
    subject: 'Listing was rejected without a reason',
    topic: 'ACCOUNT',
    priority: 'NORMAL',
    state: 'SOLVED',
    raisedAt: '2025-01-09',
    raisedBy: 'Bilal Ahmed',
    raisedByEmail: 'bilal.ahmed@example.ae',
    storeId: 'YY87634',
    orderId: null,
    messages: thread('Bilal Ahmed')
  },
  {
    id: 'C-2033',
    subject: 'Duplicate charge on the same order',
    topic: 'PAYMENT',
    priority: 'URGENT',
    state: 'SOLVED',
    raisedAt: '2024-12-28',
    raisedBy: 'Fahad Iqbal',
    raisedByEmail: 'fahadiqbal@gmail.com',
    storeId: null,
    orderId: '25441',
    messages: thread('Fahad Iqbal')
  },
  {
    id: 'C-2034',
    subject: 'Parcel arrived damaged',
    topic: 'SHIPPING',
    priority: 'NORMAL',
    state: 'SOLVED',
    raisedAt: '2024-12-11',
    raisedBy: 'Aisha Khalid',
    raisedByEmail: 'aisha.khalid@example.ae',
    storeId: 'CC09125',
    orderId: '25443',
    messages: thread('Aisha Khalid')
  }
];

export const complaintById = (id: string): Complaint | undefined =>
  COMPLAINTS.find((complaint) => complaint.id === id);

/* ---------------- chats ---------------- */

export type ChatKind = 'BUYER_ADMIN' | 'SELLER_ADMIN';

export interface ChatConversation {
  id: string;
  party: string;
  kind: ChatKind;
  /** Set for a seller thread, so the admin can open the store. */
  storeId: string | null;
  online: boolean;
  unread: number;
  lastAt: string;
  messages: ThreadMessage[];
}

const chatThread = (who: string, withFile: boolean): ThreadMessage[] => [
  {
    id: 'c1',
    author: who,
    fromAdmin: false,
    sentAt: '01:15 PM',
    body: 'Hi — my product still is not showing on the storefront after you approved it yesterday. Is there something else I need to switch on?'
  },
  {
    id: 'c2',
    author: 'Admin',
    fromAdmin: true,
    sentAt: '01:15 PM',
    body: 'Approval only clears it for sale. Your own listing switch is still off, so buyers cannot see it yet — turn it on under Products and it will appear.'
  },
  {
    id: 'c3',
    author: who,
    fromAdmin: false,
    sentAt: '01:16 PM',
    body: 'Found it, thanks. It is live now.'
  },
  ...(withFile
    ? [
        {
          id: 'c4',
          author: 'Admin',
          fromAdmin: true,
          sentAt: '01:18 PM',
          body: 'Here is the listing guide so the next one goes through first time.',
          attachment: { name: 'OrderInfo.pdf', size: '525 KB', kind: 'PDF' as const }
        },
        {
          id: 'c5',
          author: 'Admin',
          fromAdmin: true,
          sentAt: '01:18 PM',
          body: 'And the photo spec.',
          attachment: { name: 'Product.jpg', size: '728 KB', kind: 'IMAGE' as const }
        }
      ]
    : [])
];

export const CONVERSATIONS: ChatConversation[] = [
  { id: 'K-1', party: 'Alex Bennett', kind: 'SELLER_ADMIN', storeId: 'SH12345', online: true, unread: 0, lastAt: '06:45 PM', messages: chatThread('Alex Bennett', true) },
  { id: 'K-2', party: 'Maya Haddad', kind: 'SELLER_ADMIN', storeId: 'FF69870', online: false, unread: 2, lastAt: '02:15 PM', messages: chatThread('Maya Haddad', false) },
  { id: 'K-3', party: 'Emily Carter', kind: 'BUYER_ADMIN', storeId: null, online: true, unread: 0, lastAt: '03:30 PM', messages: chatThread('Emily Carter', false) },
  { id: 'K-4', party: 'Omar Farouk', kind: 'SELLER_ADMIN', storeId: 'HH24680', online: false, unread: 5, lastAt: '06:45 PM', messages: chatThread('Omar Farouk', false) },
  { id: 'K-5', party: 'Noah Wilson', kind: 'BUYER_ADMIN', storeId: null, online: true, unread: 0, lastAt: '01:15 PM', messages: chatThread('Noah Wilson', true) },
  { id: 'K-6', party: 'Aisha Khalid', kind: 'SELLER_ADMIN', storeId: 'CC09125', online: false, unread: 1, lastAt: '05:30 PM', messages: chatThread('Aisha Khalid', false) },
  { id: 'K-7', party: 'Olivia Davis', kind: 'BUYER_ADMIN', storeId: null, online: false, unread: 0, lastAt: '02:15 PM', messages: chatThread('Olivia Davis', false) },
  { id: 'K-8', party: 'Fatima Noor', kind: 'SELLER_ADMIN', storeId: 'GG13579', online: true, unread: 0, lastAt: '03:30 PM', messages: chatThread('Fatima Noor', false) },
  { id: 'K-9', party: 'Liam Carter', kind: 'BUYER_ADMIN', storeId: null, online: false, unread: 3, lastAt: '06:45 PM', messages: chatThread('Liam Carter', false) },
  { id: 'K-10', party: 'Layla Haddad', kind: 'SELLER_ADMIN', storeId: 'ZR44512', online: true, unread: 0, lastAt: '01:15 PM', messages: chatThread('Layla Haddad', false) }
];

export const conversationById = (id: string): ChatConversation | undefined =>
  CONVERSATIONS.find((conversation) => conversation.id === id);
