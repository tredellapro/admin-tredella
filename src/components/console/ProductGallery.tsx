'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

/** Main shot plus thumbnails. Falls back to the first image if the list is short. */
export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const shots = images.length > 0 ? images : [];

  if (shots.length === 0)
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-secondary/5 text-13 text-gray">
        No images
      </div>
    );

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary/5">
        <Image
          src={shots[Math.min(active, shots.length - 1)]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 380px"
          className="object-cover"
        />
      </div>

      {shots.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {shots.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1}`}
                aria-current={index === active}
                className={`relative block h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
                  index === active ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
