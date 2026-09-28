import { notFound } from 'next/navigation';
import VerificationDetailView from 'components/verification/VerificationDetailView';
import { submissionById } from 'data/verification';

export default async function SellerVerificationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!submissionById(id)) notFound();

  return <VerificationDetailView id={id} />;
}
