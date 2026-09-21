import type { ReactNode } from 'react';

export interface DetailRow {
  label: string;
  value: ReactNode;
}

/**
 * The striped label/value list the detail screens use. Zebra striping comes
 * from the row index rather than `odd:` so two lists sitting side by side start
 * on the same colour, which is how the Figma frames read.
 */
export default function DetailRows({ rows }: { rows: DetailRow[] }) {
  return (
    <dl className="flex flex-col">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={`flex items-center justify-between gap-4 px-3 py-2.5 ${
            index % 2 === 0 ? 'bg-secondary/[0.05]' : ''
          }`}
        >
          <dt className="text-13 text-gray">{row.label}</dt>
          <dd className="text-right text-13 font-medium text-secondary">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
