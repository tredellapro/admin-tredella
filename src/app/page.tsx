import { HiOutlineShieldCheck } from 'react-icons/hi';

/* Placeholder until the admin screens are designed. The queues below are the
   ones the buyer and seller apps already depend on — each is something those
   apps can raise but nothing can currently action. */
const OWED = [
  {
    title: 'Seller verification',
    body: 'Approve or reject a seller’s trade documents. Nothing moves a store from PENDING to APPROVED today.'
  },
  {
    title: 'Document review',
    body: 'Remove a document that is wrong, with a reason. That is the only way a seller gets an upload slot back.'
  },
  {
    title: 'Deactivated accounts',
    body: 'Restore an account a seller deleted, once their own 30-day window has passed.'
  },
  {
    title: 'Support inbox',
    body: 'Answer SELLER_ADMIN and BUYER_ADMIN threads. Both apps can open them; only an admin can reply.'
  },
  {
    title: 'Payout review',
    body: 'Release or reject withdrawals, and unfreeze amounts held against undispatched orders.'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-[760px]">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-24 text-primary">
          <HiOutlineShieldCheck aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-30 font-semibold text-secondary">
          Tredella Admin
        </h1>
        <p className="mt-2 text-14 text-gray">
          The operations console. Next.js and Apollo are wired up against the
          same API as the buyer and seller apps; the screens come next.
        </p>

        <h2 className="mt-10 text-16 font-semibold text-secondary">
          What the other apps are waiting on
        </h2>

        <ul className="mt-4 flex flex-col gap-3">
          {OWED.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl bg-white px-5 py-4 shadow-[0_4px_30px_rgba(43,52,69,0.06)]"
            >
              <p className="text-14 font-medium text-secondary">{item.title}</p>
              <p className="mt-1 text-13 leading-relaxed text-gray">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
