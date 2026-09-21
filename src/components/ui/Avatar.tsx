import Image from 'next/image';
import { initials } from 'lib/format';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  /** Stores and brands use a rounded square; people use a circle. */
  shape?: 'circle' | 'square';
}

/**
 * Falls back to initials rather than a broken-image glyph — half of the sample
 * rows have no picture, and so will plenty of real sellers.
 */
export default function Avatar({
  src,
  name,
  size = 40,
  shape = 'circle'
}: AvatarProps) {
  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  /* A face can be cropped to a circle without losing anything; a product shot
     or a store logo cannot — cover would slice the item out of its own
     thumbnail. So squares contain, on a tint that gives the gaps a shape. */
  const fit = shape === 'circle' ? 'object-cover' : 'object-contain bg-secondary/5 p-0.5';

  if (!src)
    return (
      <span
        style={{ width: size, height: size }}
        className={`flex shrink-0 items-center justify-center bg-primary/10 text-12 font-medium text-primary ${radius}`}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
    );

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 ${fit} ${radius}`}
    />
  );
}
