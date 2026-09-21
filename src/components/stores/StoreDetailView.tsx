'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineChat,
  HiOutlineExternalLink,
  HiOutlineStar,
  HiOutlineTag,
  HiStar
} from 'react-icons/hi';
import DetailHeader from 'components/console/DetailHeader';
import Card, { CardTitle } from 'components/ui/Card';
import StatCard from 'components/ui/StatCard';
import DataTable, { type Column } from 'components/ui/DataTable';
import StatusBadge from 'components/ui/StatusBadge';
import Avatar from 'components/ui/Avatar';
import Switch from 'components/ui/Switch';
import { STORE_ACTIVITY, STORE_REVIEWS, storeById } from 'data/stores';
import { productsForStore } from 'data/products';
import { ordersForStore } from 'data/orders';
import { userForStore } from 'data/users';
import { ORDER_STATUS_LABEL } from 'lib/orderStatus';
import { APPROVAL_LABEL, canBeSold } from 'lib/productApproval';
import type { ActiveStatus, AdminOrder, AdminProduct } from 'types/console';
import { count, longDate, money, moneyShort, percent } from 'lib/format';

const Stars = ({ rating }: { rating: number }) => (
  <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span key={n} aria-hidden="true" className="text-13 text-[#f5b301]">
        {n <= Math.round(rating) ? <HiStar /> : <HiOutlineStar />}
      </span>
    ))}
  </span>
);

export default function StoreDetailView({ id }: { id: string }) {
  const store = storeById(id);
  const [status, setStatus] = useState<ActiveStatus>(store?.status ?? 'ACTIVE');

  if (!store) return null;

  const owner = userForStore(store.id);
  const products = productsForStore(store.id);
  const orders = ordersForStore(store.id);
  const reviews = STORE_REVIEWS.filter((review) => review.storeId === store.id);
  const activity = STORE_ACTIVITY.filter((entry) => entry.storeId === store.id);
  const bestSelling = [...products].sort((a, b) => b.sales - a.sales).slice(0, 3);

  const productColumns: Column<AdminProduct>[] = [
    {
      key: 'product',
      header: 'Product',
      primary: true,
      className: 'w-[260px] max-w-[260px]',
      cell: (product) => (
        <Link
          href={`/products/${product.id}`}
          className="flex items-center gap-2.5 transition-colors hover:text-primary"
        >
          <Avatar src={product.image} name={product.name} size={36} shape="square" />
          <span className="truncate font-medium text-secondary">
            {product.name}
          </span>
        </Link>
      )
    },
    { key: 'price', header: 'Price', cell: (product) => money(product.price) },
    { key: 'stock', header: 'Stock', cell: (product) => count(product.stock) },
    {
      key: 'status',
      header: 'Status',
      cell: (product) => (
        <StatusBadge status={product.approval}>
          {APPROVAL_LABEL[product.approval]}
        </StatusBadge>
      )
    },
    {
      key: 'onSale',
      header: 'On sale',
      cell: (product) => {
        const live = canBeSold({
          approval: product.approval,
          listedBySeller: product.listedBySeller,
          stock: product.stock
        });
        return (
          <StatusBadge tone={live ? 'success' : 'neutral'}>
            {live ? 'Yes' : 'No'}
          </StatusBadge>
        );
      }
    },
    { key: 'sales', header: 'Sales', align: 'right', cell: (product) => count(product.sales) }
  ];

  const orderColumns: Column<AdminOrder>[] = [
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
    { key: 'customer', header: 'Customer', cell: (order) => order.customerName },
    {
      key: 'mode',
      header: 'Storefront',
      cell: (order) => (order.mode === 'RETAIL' ? 'Retail' : 'Wholesale')
    },
    {
      key: 'status',
      header: 'Status',
      cell: (order) => (
        <StatusBadge status={order.status}>
          {ORDER_STATUS_LABEL[order.status]}
        </StatusBadge>
      )
    },
    {
      key: 'freeze',
      header: 'Payout',
      cell: (order) => (
        <StatusBadge tone={order.freezeAmount ? 'warning' : 'success'}>
          {order.freezeAmount ? 'Frozen' : 'Released'}
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

  const action =
    'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-13 font-medium transition-colors';

  return (
    <>
      <DetailHeader
        title="Store Details"
        subtitle="Seller profile, performance and activity"
        backTo="/stores"
        actions={
          <>
            <button
              type="button"
              className={`${action} border border-secondary/15 bg-white text-secondary hover:border-secondary/40`}
            >
              <HiOutlineChat aria-hidden="true" className="text-16" />
              Message
            </button>
            <button
              type="button"
              className={`${action} bg-secondary text-white hover:bg-secondary/90`}
            >
              <HiOutlineExternalLink aria-hidden="true" className="text-16" />
              View Store
            </button>
            <button
              type="button"
              onClick={() =>
                setStatus((s) => (s === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'))
              }
              className={`${action} bg-primary text-white hover:bg-primary/90`}
            >
              {status === 'ACTIVE' ? 'Suspend Store' : 'Reactivate Store'}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Sales" value={moneyShort(store.sales)} />
        <StatCard label="Completed Orders" value={count(store.completedOrders)} />
        <StatCard label="Cancelled Orders" value={count(store.cancelledOrders)} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar src={store.logo} name={store.name} size={64} shape="square" />
              <div>
                <h2 className="flex items-center gap-2 text-18 font-semibold text-secondary">
                  {store.name}
                  {store.verified && (
                    <StatusBadge tone="success">Verified</StatusBadge>
                  )}
                </h2>
                <p className="mt-0.5 text-13 text-gray">Store ID: {store.id}</p>
              </div>
            </div>

            {owner && (
              <Link
                href={`/users/${owner.id}`}
                className="text-13 font-medium text-primary hover:underline"
              >
                Edit Store
              </Link>
            )}
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              { label: 'Owner', value: store.ownerName },
              { label: 'Contact', value: store.ownerEmail },
              { label: 'Phone', value: store.phone },
              { label: 'Joined', value: longDate(store.createdAt) },
              { label: 'Address', value: store.address }
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-12 text-gray">{row.label}</dt>
                <dd className="mt-0.5 break-words text-14 text-secondary">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-center justify-between border-t border-secondary/8 pt-4">
            <span id="store-status" className="text-14 text-secondary">
              Store Status
            </span>
            <span className="flex items-center gap-3">
              <span
                className={`text-13 font-medium ${
                  status === 'ACTIVE' ? 'text-primary' : 'text-gray'
                }`}
              >
                {status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </span>
              <Switch
                checked={status === 'ACTIVE'}
                onChange={(on) => setStatus(on ? 'ACTIVE' : 'INACTIVE')}
                label="Store status"
                labelledBy="store-status"
              />
            </span>
          </div>
        </Card>

        <Card>
          <CardTitle>Product Summary</CardTitle>

          <dl className="flex flex-col gap-3 px-1">
            <div className="flex items-center justify-between">
              <dt className="text-13 text-gray">Active Products</dt>
              <dd className="text-14 font-semibold text-secondary">
                {count(store.activeProducts)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-13 text-gray">Out of Stock</dt>
              <dd className="text-14 font-semibold text-primary">
                {count(store.outOfStock)}
              </dd>
            </div>
          </dl>

          <p className="mt-5 px-1 pb-2 text-14 font-medium text-secondary">
            Best-Selling products
          </p>

          {bestSelling.length === 0 ? (
            <p className="px-1 text-13 text-gray">No sales yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {bestSelling.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.id}`}
                    className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-background"
                  >
                    <Avatar
                      src={product.image}
                      name={product.name}
                      size={36}
                      shape="square"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-13 text-secondary">
                        {product.name}
                      </span>
                      <span className="block text-12 text-gray">
                        {count(product.sales)} sales
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Sales (Monthly)" value={moneyShort(store.monthlySales)} />
        <StatCard label="Total Revenue" value={moneyShort(store.sales)} />
        <StatCard label="Active Products" value={count(store.activeProducts)} />
        <StatCard label="Order Fulfilment" value={percent(store.fulfilment)} />
        <StatCard
          label="Customer Rating"
          value={
            <span className="flex items-center gap-2">
              {store.rating}
              <Stars rating={store.rating} />
            </span>
          }
        />
        <StatCard label="Return Rate" value={percent(store.returnRate)} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card flush>
            <div className="px-4 pt-4 sm:px-5 sm:pt-5">
              <CardTitle
                action={
                  <Link
                    href={`/products?store=${store.id}`}
                    className="text-13 font-medium text-primary hover:underline"
                  >
                    All products
                  </Link>
                }
              >
                Product Listings
              </CardTitle>
            </div>
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              <DataTable
                columns={productColumns}
                rows={products}
                rowKey={(product) => product.id}
                empty="This store has not listed anything yet."
              />
            </div>
          </Card>

          <Card flush>
            <div className="px-4 pt-4 sm:px-5 sm:pt-5">
              <CardTitle>Orders Overview</CardTitle>
            </div>
            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
              <DataTable
                columns={orderColumns}
                rows={orders}
                rowKey={(order) => order.id}
                empty="No orders for this store yet."
              />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle>Payment Information</CardTitle>
            <dl className="flex flex-col gap-3 px-1">
              <div>
                <dt className="text-12 text-gray">Linked Bank</dt>
                <dd className="mt-0.5 text-14 font-medium text-secondary">
                  {store.bank}
                </dd>
              </div>
              <div>
                <dt className="text-12 text-gray">Recent Payouts</dt>
                <dd className="mt-0.5 text-14 font-medium text-secondary">
                  {money(store.recentPayout, 0)}
                </dd>
              </div>
              <div>
                <dt className="text-12 text-gray">Pending Settlements</dt>
                <dd className="mt-0.5 text-14 font-medium text-primary">
                  {money(store.pendingSettlement, 0)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardTitle>Customer Reviews</CardTitle>
            {reviews.length === 0 ? (
              <p className="px-1 text-13 text-gray">No reviews yet.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <li key={`${review.author}-${review.date}`} className="flex gap-3">
                    <Avatar name={review.author} size={36} />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-x-2 text-13 font-medium text-secondary">
                        {review.author}
                        <span className="text-12 font-normal text-gray">
                          {review.date}
                        </span>
                      </p>
                      <Stars rating={review.rating} />
                      <p className="mt-1 text-12 leading-relaxed text-gray">
                        {review.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle>Activity &amp; Logs</CardTitle>
            {activity.length === 0 ? (
              <p className="px-1 text-13 text-gray">Nothing recorded yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {activity.map((entry) => (
                  <li key={entry.title + entry.detail} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-14 text-primary">
                      <HiOutlineTag aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-13 text-secondary">
                        {entry.title}
                      </span>
                      <span className="block text-12 text-gray">
                        {entry.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
