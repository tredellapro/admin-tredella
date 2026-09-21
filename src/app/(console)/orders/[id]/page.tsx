import { notFound } from 'next/navigation';
import Link from 'next/link';
import DetailHeader from 'components/console/DetailHeader';
import ProductGallery from 'components/console/ProductGallery';
import Card, { CardTitle } from 'components/ui/Card';
import DetailRows from 'components/ui/DetailRows';
import StatusBadge from 'components/ui/StatusBadge';
import Avatar from 'components/ui/Avatar';
import { orderById } from 'data/orders';
import { productById } from 'data/products';
import { storeById } from 'data/stores';
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from 'lib/orderStatus';
import { count, longDate, money } from 'lib/format';

export default async function OrderInformationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = orderById(id);
  if (!order) notFound();

  const product = productById(order.productId);
  const store = storeById(order.storeId);

  return (
    <>
      <DetailHeader
        title="Order Information"
        subtitle={`Order #${order.id}`}
        backTo="/orders"
      />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
          <ProductGallery
            images={product?.gallery ?? []}
            alt={product?.name ?? 'Product'}
          />

          <div className="min-w-0">
            <h2 className="text-16 font-semibold text-secondary sm:text-18">
              {product?.name ?? 'Removed product'}
            </h2>
            <p className="mt-2 text-13 leading-relaxed text-gray">
              {product?.description}
            </p>

            <h3 className="mb-2 mt-6 text-15 font-semibold text-secondary">
              Order Details
            </h3>

            <DetailRows
              rows={[
                { label: 'Total', value: money(order.total) },
                { label: 'Items', value: count(order.items) },
                {
                  label: 'Discount',
                  value:
                    order.discountPercent > 0
                      ? `${order.discountPercent}% OFF`
                      : 'None'
                },
                { label: 'Coupon', value: order.coupon ?? 'No' },
                {
                  label: 'Order Status',
                  value: (
                    <StatusBadge status={order.status}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </StatusBadge>
                  )
                },
                {
                  label: 'Payment Status',
                  value: (
                    <StatusBadge status={order.paymentStatus}>
                      {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                    </StatusBadge>
                  )
                },
                { label: 'Payment Method', value: order.paymentMethod },
                { label: 'Create at', value: longDate(order.createdAt) },
                { label: 'Shipping', value: order.shipping },
                {
                  label: 'Storefront',
                  value: order.mode === 'RETAIL' ? 'Retail' : 'Wholesale'
                }
              ]}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Customer</CardTitle>
          <div className="flex items-center gap-3 px-1">
            <Avatar name={order.customerName} size={44} />
            <div className="min-w-0">
              <p className="truncate text-14 font-medium text-secondary">
                {order.customerName}
              </p>
              <p className="truncate text-13 text-gray">{order.customerEmail}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle
            action={
              store && (
                <Link
                  href={`/stores/${store.id}`}
                  className="text-13 font-medium text-primary hover:underline"
                >
                  Open store
                </Link>
              )
            }
          >
            Seller
          </CardTitle>

          <div className="flex items-center gap-3 px-1">
            <Avatar
              src={store?.logo}
              name={store?.name ?? 'Store'}
              size={44}
              shape="square"
            />
            <div className="min-w-0">
              <p className="truncate text-14 font-medium text-secondary">
                {store?.name ?? order.storeId}
              </p>
              <p className="truncate text-13 text-gray">
                Store ID: {order.storeId}
              </p>
            </div>
          </div>

          {/* The one field on this screen that is an admin decision, not a
              record of what the buyer did. */}
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-secondary/10 p-3">
            <div>
              <p className="text-13 font-medium text-secondary">
                Payout held
              </p>
              <p className="mt-0.5 text-12 text-gray">
                {order.freezeAmount
                  ? 'Frozen until the order is dispatched and settled.'
                  : 'Released into the seller’s balance.'}
              </p>
            </div>
            <StatusBadge tone={order.freezeAmount ? 'warning' : 'success'}>
              {order.freezeAmount ? 'Frozen' : 'Released'}
            </StatusBadge>
          </div>
        </Card>
      </div>
    </>
  );
}
