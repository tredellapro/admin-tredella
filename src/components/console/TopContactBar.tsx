import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';

/**
 * The support strip from the designs. It was dropped from the seller dashboard
 * on request; it is kept here because every admin frame in Figma carries it,
 * and one component is easy to remove if you want it gone here too.
 */
export default function TopContactBar() {
  return (
    <div className="flex items-center justify-between gap-4 bg-primary px-4 py-2.5 text-12 text-white sm:px-6">
      <div className="flex items-center gap-4 sm:gap-6">
        <a
          href="tel:+923001234567"
          className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
        >
          <HiOutlinePhone aria-hidden="true" className="text-14" />
          <span className="hidden xs:inline">+92 300 1234567</span>
        </a>
        <a
          href="mailto:support@tredella.com"
          className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
        >
          <HiOutlineMail aria-hidden="true" className="text-14" />
          support@tredella.com
        </a>
      </div>

      <span className="hidden whitespace-nowrap sm:inline">Need Help?</span>
    </div>
  );
}
