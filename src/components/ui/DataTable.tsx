import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  cell: (_row: T) => ReactNode;
  /** Headline of the mobile card — usually the name or the id. */
  primary?: boolean;
  /** Pinned to the foot of the mobile card, e.g. the edit/delete buttons. */
  actions?: boolean;
  /** Already conveyed by the primary cell; skipped on the card. */
  hideOnCard?: boolean;
  align?: 'left' | 'right';
  /** Width or wrapping rules for this column's cells. */
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (_row: T) => string;
  empty?: ReactNode;
}

/**
 * One definition, two presentations.
 *
 * A seven-column table cannot survive a 375px screen: squeezing it produces
 * unreadable columns and scrolling it sideways hides the very column you are
 * looking for. So below `md` each row is re-laid out as a card with the
 * columns as labelled fields, and the table markup is not rendered at all —
 * duplicating rows in two hidden blocks would double the DOM and read twice
 * to a screen reader.
 */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty = 'Nothing to show yet.'
}: DataTableProps<T>) {
  if (rows.length === 0)
    return (
      <p className="px-5 py-14 text-center text-14 text-gray">{empty}</p>
    );

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const actions = columns.filter((c) => c.actions);
  const fields = columns.filter(
    (c) => c !== primary && !c.actions && !c.hideOnCard
  );

  return (
    <>
      {/* ---- desktop ---- */}
      <div className="brand-scroll hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-secondary/[0.04]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`whitespace-nowrap px-3.5 py-3.5 text-13 font-medium text-secondary first:rounded-l-lg last:rounded-r-lg ${
                    column.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-secondary/8 last:border-0"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-3.5 py-3.5 align-middle text-13 text-gray ${
                      column.align === 'right' ? 'text-right' : ''
                    } ${column.className ?? ''}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- mobile ---- */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className="rounded-xl border border-secondary/10 p-4"
          >
            <div className="text-14 text-secondary">{primary.cell(row)}</div>

            {fields.length > 0 && (
              <dl className="mt-3 flex flex-col gap-2">
                {fields.map((column) => (
                  <div
                    key={column.key}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="shrink-0 text-12 text-gray">
                      {column.header}
                    </dt>
                    <dd className="text-right text-13 text-secondary">
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {actions.length > 0 && (
              <div className="mt-3 flex justify-end gap-2 border-t border-secondary/8 pt-3">
                {actions.map((column) => (
                  <div key={column.key}>{column.cell(row)}</div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
