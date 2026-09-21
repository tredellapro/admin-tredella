import { HiOutlineClock } from 'react-icons/hi';
import PageHeading from './PageHeading';
import Card from 'components/ui/Card';

/**
 * A placeholder with a reason, for the sidebar entries whose screens have not
 * been designed yet. Better than a dead link or a 404 that reads like a bug.
 */
export default function ComingSoon({
  title,
  section,
  children
}: {
  title: string;
  section: string;
  children: string;
}) {
  return (
    <>
      <PageHeading title={title} trail={[{ label: section }, { label: title }]} />

      <Card>
        <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-22 text-primary">
            <HiOutlineClock aria-hidden="true" />
          </span>
          <h2 className="text-16 font-semibold text-secondary">
            Not built yet
          </h2>
          <p className="max-w-[420px] text-13 leading-relaxed text-gray">
            {children}
          </p>
        </div>
      </Card>
    </>
  );
}
