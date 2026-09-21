import { HiOutlineInformationCircle } from 'react-icons/hi';

/**
 * These screens run on the sample rows in src/data until the admin-side
 * resolvers exist. Saying so where the data is shown beats letting someone
 * discover it when their edit disappears on refresh.
 */
export default function SampleDataNote({ children }: { children?: string }) {
  return (
    <p className="mb-4 flex items-start gap-2 rounded-lg bg-white px-3 py-2.5 text-12 text-gray shadow-[0_2px_12px_rgba(43,52,69,0.05)]">
      <HiOutlineInformationCircle
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-14 text-primary"
      />
      <span>
        {children ??
          'Sample data. Edits apply on screen but are not saved — the admin API for this screen does not exist yet.'}
      </span>
    </p>
  );
}
