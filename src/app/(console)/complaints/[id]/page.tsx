import { notFound } from 'next/navigation';
import ComplaintDetailView from 'components/support/ComplaintDetailView';
import { complaintById } from 'data/support';

export default async function ComplaintPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!complaintById(id)) notFound();

  return <ComplaintDetailView id={id} />;
}
