/* Presentation helpers.

   Deliberately no `Intl` and no `Date` parsing: this console renders on the
   server first, and ICU data differs between Node and the browser, which shows
   up as a hydration mismatch on every money column. Everything here is plain
   string work, so the server and the client cannot disagree. */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/** `1234567.5` → `1,234,567.5`. Grouping only; no rounding decisions here. */
const group = (digits: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * `12000` → `AED 12,000.00`.
 *
 * The marketplace prices in AED — the Figma frames show `$`, but the seller
 * dashboard, the plans and the payout rules are all dirhams, and a console
 * that disagrees with them about currency is worse than one that disagrees
 * with the mock-up.
 */
export const money = (amount: number, decimals = 2): string => {
  const negative = amount < 0;
  const fixed = Math.abs(amount).toFixed(decimals);
  const [whole, fraction] = fixed.split('.');
  const body = fraction ? `${group(whole)}.${fraction}` : group(whole);
  return `${negative ? '-' : ''}AED ${body}`;
};

/** `96250` → `AED 96,250` — for stat cards, where the fils are noise. */
export const moneyShort = (amount: number): string => money(amount, 0);

/** `250` → `250`, `12500` → `12,500`. */
export const count = (value: number): string => group(String(Math.trunc(value)));

/** `2025-03-09` → `09 Mar 2025`. Anything unparseable is returned untouched. */
export const longDate = (iso: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  return name ? `${day} ${name} ${year}` : iso;
};

/** The date part of an ISO timestamp, which is what the table columns show. */
export const shortDate = (iso: string): string => iso.slice(0, 10);

/** `0.98` → `98%`. */
export const percent = (ratio: number, decimals = 0): string =>
  `${(ratio * 100).toFixed(decimals)}%`;

/**
 * The first `count` words, with an ellipsis when anything was dropped.
 * Same helper as the seller app: a description is as long as the seller made
 * it, and a table cell cannot take a whole paragraph.
 */
export const firstWords = (text: string, words: number): string => {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  return parts.length <= words
    ? text.trim()
    : `${parts.slice(0, words).join(' ')}…`;
};

/** Initials for an avatar fallback — `Hamza Tariq` → `HT`. */
export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

/* ---------------- month filters ---------------- */

/** `2025-03-09` → `2025-03`, the key the date filters group on. */
export const monthKey = (iso: string): string => iso.slice(0, 7);

/** `2025-03` → `Mar 2025`. */
export const monthLabel = (key: string): string => {
  const [year, month] = key.split('-');
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : key;
};

/** The months present in a set of dates, newest first. */
export const monthOptions = (
  dates: string[]
): { value: string; label: string }[] =>
  Array.from(new Set(dates.map(monthKey)))
    .sort()
    .reverse()
    .map((value) => ({ value, label: monthLabel(value) }));
