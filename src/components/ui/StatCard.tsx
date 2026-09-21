import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** A trend line, a star, a unit — whatever sits under or beside the number. */
  hint?: ReactNode;
  icon?: ReactNode;
}

export default function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_4px_30px_rgba(43,52,69,0.06)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-13 text-gray">{label}</p>
        {icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-16 text-primary">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-22 font-semibold text-secondary sm:text-26">
        {value}
      </p>
      {hint && <div className="mt-1 text-12 text-gray">{hint}</div>}
    </div>
  );
}
