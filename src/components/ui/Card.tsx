import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Drops the inner padding for panels that hold a full-bleed table. */
  flush?: boolean;
}

/** The white panel every screen is built from. */
export default function Card({ children, className = '', flush = false }: CardProps) {
  return (
    <section
      className={`rounded-2xl bg-white shadow-[0_4px_30px_rgba(43,52,69,0.06)] ${
        flush ? '' : 'p-4 sm:p-5'
      } ${className}`}
    >
      {children}
    </section>
  );
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 pb-4">
      <h2 className="text-16 font-semibold text-secondary sm:text-18">{children}</h2>
      {action}
    </div>
  );
}
