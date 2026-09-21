import { notFound } from 'next/navigation';
import ProductDetailView from 'components/products/ProductDetailView';
import { productById } from 'data/products';

export default async function ProductInformationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  /* Resolved here rather than in the view so an unknown id renders the 404
     instead of a blank screen. */
  if (!productById(id)) notFound();

  return <ProductDetailView id={id} />;
}
