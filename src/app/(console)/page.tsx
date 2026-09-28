'use client';

import Link from 'next/link';
import {
  HiOutlineClipboardCheck,
  HiOutlineCurrencyDollar,
  HiOutlineExclamation,
  HiOutlineOfficeBuilding,
  HiOutlineShoppingCart,
  HiOutlineUsers
} from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import Card, { CardTitle } from 'components/ui/Card';
import StatCard from 'components/ui/StatCard';
import StatusBadge from 'components/ui/StatusBadge';
import Avatar from 'components/ui/Avatar';
import RevenueChart, { ChartLegend } from 'components/charts/RevenueChart';
import DonutChart from 'components/charts/DonutChart';
import { REVENUE_SERIES, orderMix, topStores, totalsFor } from 'data/analytics';
import { PRODUCTS, REVIEW_QUEUE } from 'data/products';
import { storeName } from 'data/stores';
import { count, longDate, money, moneyShort, percent } from 'lib/format';

export default function AnalyticsPage() {
  const totals = totalsFor();
  const slices = orderMix();
  const rejected = PRODUCTS.filter(
    (product) => product.approval === 'REJECTED'
  ).length;

  return (
    <>
      <PageHeading title="Analytics" trail={[{ label: 'Analytics' }]} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Revenue"
          value={moneyShort(totals.revenue)}
          hint="Paid orders only"
          icon={<HiOutlineCurrencyDollar />}
        />
        <StatCard
          label="Orders"
          value={count(totals.orders)}
          hint={`${totals.cancelled} cancelled`}
          icon={<HiOutlineShoppingCart />}
        />
        <StatCard
          label="Held from payouts"
          value={moneyShort(totals.frozen)}
          hint="Frozen against undispatched orders"
          icon={<HiOutlineExclamation />}
        />
        <StatCard
          label="Live products"
          value={count(totals.liveProducts)}
          hint="Approved, listed and in stock"
          icon={<HiOutlineClipboardCheck />}
        />
        <StatCard
          label="Stores"
          value={count(totals.stores)}
          hint={`${totals.activeStores} active`}
          icon={<HiOutlineOfficeBuilding />}
        />
        <StatCard
          label="Customers"
          value={count(totals.customers)}
          hint="Buyer accounts"
          icon={<HiOutlineUsers />}
        />
      </div>

      {/* The one number that is a to-do list rather than a statistic. */}
      <Card className="mt-4">
        <CardTitle
          action={
            <Link
              href="/products?status=PENDING"
              className="text-13 font-medium text-primary hover:underline"
            >
              Open the queue
            </Link>
          }
        >
          Waiting on you
        </CardTitle>

        <p className="px-1 pb-4 text-13 text-gray">
          A seller&rsquo;s listing does not go on sale until it is approved here.{' '}
          <span className="font-medium text-secondary">
            {REVIEW_QUEUE.length} awaiting review
          </span>
          {rejected > 0 && `, ${rejected} rejected`}.
        </p>

        {REVIEW_QUEUE.length === 0 ? (
          <p className="px-1 pb-2 text-13 text-gray">Nothing to review.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {REVIEW_QUEUE.slice(0, 4).map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.id}`}
                  className="flex items-center gap-3 rounded-xl border border-secondary/10 p-3 transition-colors hover:border-primary/40"
                >
                  <Avatar src={product.image} name={product.name} size={40} shape="square" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-13 font-medium text-secondary">
                      {product.name}
                    </span>
                    <span className="block truncate text-12 text-gray">
                      {storeName(product.storeId)} · listed {longDate(product.createdAt)}
                    </span>
                  </span>
                  <StatusBadge status="PENDING">Pending</StatusBadge>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {REVIEW_QUEUE.length > 4 && (
          <p className="px-1 pt-3 text-12 text-gray">
            and {REVIEW_QUEUE.length - 4} more in the queue.
          </p>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle>Revenue by month</CardTitle>
          <RevenueChart data={REVENUE_SERIES} />
          <ChartLegend />
        </Card>

        <Card>
          <CardTitle>Order mix</CardTitle>
          <DonutChart
            slices={slices}
            centreLabel="orders"
            centreValue={String(totals.orders)}
          />
        </Card>
      </div>

      <Card className="mt-4">
        <CardTitle
          action={
            <Link
              href="/stores"
              className="text-13 font-medium text-primary hover:underline"
            >
              All stores
            </Link>
          }
        >
          Top stores
        </CardTitle>

        <ul className="flex flex-col gap-2">
          {topStores().map((store, index) => (
            <li key={store.id}>
              <Link
                href={`/stores/${store.id}`}
                className="flex items-center gap-3 rounded-xl border border-secondary/10 p-3 transition-colors hover:border-primary/40"
              >
                <span className="w-5 shrink-0 text-13 text-gray">{index + 1}</span>
                <Avatar src={store.logo} name={store.name} size={36} shape="square" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-13 font-medium text-secondary">
                    {store.name}
                  </span>
                  <span className="block text-12 text-gray">
                    {percent(store.fulfilment)} fulfilment · {store.rating} rating
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-13 font-medium text-secondary">
                    {money(store.sales, 0)}
                  </span>
                  <span className="block text-12 text-gray">
                    {count(store.totalOrders)} orders
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
