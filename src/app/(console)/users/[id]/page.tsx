import { notFound } from 'next/navigation';
import Link from 'next/link';
import { HiOutlineCreditCard, HiOutlineOfficeBuilding } from 'react-icons/hi';
import DetailHeader from 'components/console/DetailHeader';
import Card, { CardTitle } from 'components/ui/Card';
import Avatar from 'components/ui/Avatar';
import StatusBadge from 'components/ui/StatusBadge';
import DataTable, { type Column } from 'components/ui/DataTable';
import { userById } from 'data/users';
import { ordersForCustomer } from 'data/orders';
import { storeById } from 'data/stores';
import { ROLE_LABEL, type AdminOrder } from 'types/console';
import { longDate, money } from 'lib/format';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

const ORDER_COLUMNS: Column<AdminOrder>[] = [
  {
    key: 'id',
    header: 'Order ID',
    primary: true,
    cell: (order) => (
      <Link
        href={`/orders/${order.id}`}
        className="font-medium text-secondary transition-colors hover:text-primary"
      >
        #{order.id}
      </Link>
    )
  },
  {
    key: 'store',
    header: 'Store',
    cell: (order) => storeById(order.storeId)?.name ?? order.storeId
  },
  {
    key: 'status',
    header: 'Status',
    cell: (order) => (
      <StatusBadge status={order.status}>
        {STATUS_LABEL[order.status]}
      </StatusBadge>
    )
  },
  {
    key: 'total',
    header: 'Amount',
    align: 'right',
    cell: (order) => money(order.total)
  }
];

/** Next 16 hands route params in as a promise. */
export default async function UserProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = userById(id);
  if (!user) notFound();

  const isShopper = user.role === 'BUYER';
  const store = user.storeId ? storeById(user.storeId) : undefined;
  const orders = ordersForCustomer(user.email);

  const personal: { label: string; value: string }[] = [
    { label: 'Email', value: user.email },
    { label: 'Phone Number', value: user.phone },
    { label: 'Gender', value: user.gender },
    { label: 'Date of Birth', value: longDate(user.dateOfBirth) },
    { label: 'Address', value: user.address }
  ];

  return (
    <>
      <DetailHeader title="User Profile" backTo="/users" />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar src={user.avatar} name={user.name} size={72} />
            <div>
              <h2 className="text-18 font-semibold text-secondary sm:text-20">
                {user.name}
              </h2>
              <p className="mt-0.5 text-13 text-gray">User ID: {user.id}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge tone="neutral">{ROLE_LABEL[user.role]}</StatusBadge>
                <StatusBadge status={user.status}>
                  {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </StatusBadge>
                {user.tier && (
                  <StatusBadge tone="warning">{user.tier}</StatusBadge>
                )}
              </div>
            </div>
          </div>

          {store && (
            <Link
              href={`/stores/${store.id}`}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-13 font-medium text-white transition-colors hover:bg-primary/90"
            >
              <HiOutlineOfficeBuilding aria-hidden="true" className="text-16" />
              View {store.name}
            </Link>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardTitle>Personal Information</CardTitle>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 px-1 sm:grid-cols-2">
              {personal.map((row) => (
                <div
                  key={row.label}
                  className="border-b border-secondary/8 pb-3 last:border-0"
                >
                  <dt className="text-13 text-gray">{row.label}</dt>
                  <dd className="mt-1 break-words text-14 text-secondary">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          {isShopper && (
            <Card flush>
              <div className="px-4 pt-4 sm:px-5 sm:pt-5">
                <CardTitle>Order History</CardTitle>
              </div>
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <DataTable
                  columns={ORDER_COLUMNS}
                  rows={orders}
                  rowKey={(order) => order.id}
                  empty="This customer has not ordered yet."
                />
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {isShopper && (
            <Card>
              <CardTitle>Payment Methods</CardTitle>

              {user.card ? (
                <div className="flex items-center gap-3 rounded-xl border border-secondary/10 p-3">
                  <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md bg-secondary/8 text-18 text-secondary">
                    <HiOutlineCreditCard aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-14 font-medium text-secondary">
                      {user.card.brand} **** {user.card.last4}
                    </span>
                    <span className="block text-12 text-gray">
                      Expires {user.card.expires}
                    </span>
                  </span>
                </div>
              ) : (
                <p className="px-1 text-13 text-gray">No card on file.</p>
              )}

              <div className="mt-3 flex items-center justify-between rounded-xl border border-secondary/10 p-3">
                <span className="text-14 font-medium text-secondary">
                  Wallet Balance
                </span>
                <span className="text-14 font-semibold text-primary">
                  {money(user.walletBalance)}
                </span>
              </div>
            </Card>
          )}

          <Card>
            <CardTitle>Activity Log</CardTitle>
            <dl className="flex flex-col gap-3 px-1">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-13 text-gray">Last Login</dt>
                <dd className="text-right text-13 text-secondary">
                  {user.lastLogin}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-13 text-gray">Devices Used</dt>
                <dd className="text-right text-13 text-secondary">
                  {user.devices}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-13 text-gray">Joined</dt>
                <dd className="text-right text-13 text-secondary">
                  {longDate(user.joinedAt)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
