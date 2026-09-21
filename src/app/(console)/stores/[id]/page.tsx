import { notFound } from 'next/navigation';
import StoreDetailView from 'components/stores/StoreDetailView';
import { storeById } from 'data/stores';

export default async function StoreDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!storeById(id)) notFound();

  return <StoreDetailView id={id} />;
}
