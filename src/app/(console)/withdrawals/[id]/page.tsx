import { notFound } from 'next/navigation';
import WithdrawDetailView from 'components/withdrawals/WithdrawDetailView';
import { withdrawalById } from 'data/withdrawals';

export default async function WithdrawInformationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!withdrawalById(id)) notFound();

  return <WithdrawDetailView id={id} />;
}
