import { Suspense } from 'react';
import ProductsView from 'components/products/ProductsView';

/* The view reads ?status= to open straight into the review queue, and
   useSearchParams needs a boundary so the shell can still prerender. */
export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsView />
    </Suspense>
  );
}
