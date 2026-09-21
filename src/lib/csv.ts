/* CSV export for the list screens.

   Everything exported here is typed in by sellers and shoppers, and the file
   is going to be opened in Excel or Sheets by someone on the ops team. A cell
   beginning `=`, `+`, `-` or `@` is treated as a formula by both, so a store
   called `=HYPERLINK(...)` would run on open. Prefixing those with a single
   quote neutralises them without changing what a human reads. */

const RISKY_LEAD = /^[=+\-@\t\r]/;

const cell = (value: unknown): string => {
  const text =
    value === null || value === undefined ? '' : String(value);
  const safe = RISKY_LEAD.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export interface CsvColumn<T> {
  header: string;
  value: (_row: T) => unknown;
}

export const toCsv = <T,>(columns: CsvColumn<T>[], rows: T[]): string =>
  [
    columns.map((column) => cell(column.header)).join(','),
    ...rows.map((row) => columns.map((column) => cell(column.value(row))).join(','))
  ].join('\r\n');

/**
 * Hands the file to the browser. The BOM is what makes Excel read the UTF-8 —
 * without it, an Arabic store name comes out as mojibake.
 */
export const downloadCsv = <T,>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[]
): void => {
  const blob = new Blob([`﻿${toCsv(columns, rows)}`], {
    type: 'text/csv;charset=utf-8;'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
