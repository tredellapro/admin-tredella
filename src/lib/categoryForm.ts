/* Naming and duplicate rules for the Categories screen.

   Pure and dependency-free so it can be compiled and exercised on its own.
   The duplicate check is the part worth being careful about: "Electronics"
   and "electronics " are the same category to a human and to a URL, but not
   to ===, and two subcategories called "Accessories" under *different*
   parents are perfectly fine. */

export interface CategoryLike {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

/** `Home & Kitchen` → `home-kitchen`. Deterministic: no dates, no randomness. */
export const slugify = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * `taken` already holds `books` → `books-2`, then `books-3`.
 *
 * Counting up rather than appending a random suffix keeps the id readable and
 * keeps the server and the client in agreement about what was generated.
 */
export const uniqueSlug = (name: string, taken: string[]): string => {
  const base = slugify(name) || 'category';
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
};

/** Same name to a human: case and surrounding space do not make it different. */
const sameName = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

const MAX_NAME = 60;

const nameProblem = (name: string, what: string): string | null => {
  const trimmed = name.trim();
  if (trimmed.length === 0) return `Give the ${what} a name.`;
  if (trimmed.length > MAX_NAME)
    return `Keep the ${what} name under ${MAX_NAME} characters.`;
  /* Tested against the name, not its slug. `slugify` is Latin-only, so an
     Arabic name slugifies to nothing — and refusing "التجارة" on a UAE
     marketplace would be wrong. The slug is an internal id and can fall back
     to `category-2`; the name is what anyone actually reads. This only stops
     a name with no letters or digits in it at all, like "###". */
  if (!/[\p{L}\p{N}]/u.test(trimmed))
    return `Use some letters or numbers in the ${what} name.`;
  return null;
};

/** Null when the new top-level category is fine to create. */
export const categoryProblem = (
  name: string,
  categories: CategoryLike[]
): string | null => {
  const problem = nameProblem(name, 'category');
  if (problem) return problem;
  if (categories.some((category) => sameName(category.name, name)))
    return `There is already a category called “${name.trim()}”.`;
  return null;
};

/**
 * Null when the new subcategory is fine to create.
 *
 * Duplicates are only checked inside the chosen parent — Electronics and
 * Clothing may both have "Accessories", and forbidding that would be wrong.
 */
export const subcategoryProblem = (
  name: string,
  parentId: string,
  categories: CategoryLike[]
): string | null => {
  const parent = categories.find((category) => category.id === parentId);
  if (!parent) return 'Pick the category it belongs to.';

  const problem = nameProblem(name, 'subcategory');
  if (problem) return problem;

  if (parent.subcategories.some((sub) => sameName(sub.name, name)))
    return `${parent.name} already has a subcategory called “${name.trim()}”.`;
  return null;
};

/** Every slug in use, so a new one can avoid them all. */
export const takenSlugs = (categories: CategoryLike[]): string[] => [
  ...categories.map((category) => category.id),
  ...categories.flatMap((category) => category.subcategories.map((s) => s.id))
];
