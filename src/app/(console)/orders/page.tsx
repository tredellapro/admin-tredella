'use client';

import Link from 'next/link';
import { HiOutlineEye } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import SampleDataNote from 'components/console/SampleDataNote';
import { useConsole } from 'components/console/ConsoleContext';
import Card from 'components/ui/Card';
import DataTable, { type Column } from 'components/ui/DataTable';
import Toolbar from 'components/ui/Toolbar';
import Pagination from 'components/ui/Pagination';
import StatusBadge from 'components/ui/StatusBadge';
import Avatar from 'components/ui/Avatar';
import IconButton from 'components/ui/IconButton';
import { useTableState, type FilterDef } from 'hooks/useTableState';
import { ORDERS } from 'data/orders';
import { productById } from 'data/products';
import { storeName } from 'data/stores';
import { categoryName } from 'data/catalogue';
import type { AdminOrder } from 'types/console';
import { firstWords, money, monthKey, monthOptions, shortDate } from 'lib/format';
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from 'lib/orderStatus';
import { downloadCsv } from 'lib/csv';

const FILTERS: FilterDef<AdminOrder>[] = [
  {
    key: 'freeze',
    label: 'Freeze Amount',
    options: [
      { value: 'YES', label: 'Yes' },
      { value: 'NO', label: 'No' }
    ],
    match: (order, value) => (value === 'YES') === order.freezeAmount
  },
  {
    key: 'status',
    label: 'Status',
    options: ORDER_STATUSES.map((status) => ({
      value: status,
      label: ORDER_STATUS_LABEL[status]
    })),
    match: (order, value) => order.status === value
  },
  {
    key: 'created',
    label: 'Created',
    options: monthOptions(ORDERS.map((order) => order.createdAt)),
    match: (order, value) => monthKey(order.createdAt) === value
  }
];

export default function OrdersPage() {
  const { mode } = useConsole();
  const rows = ORDERS.filter((order) => order.mode === mode);

  const table = useTableState<AdminOrder>({
    rows,
    searchIn: (order) =>
      `${order.id} ${order.customerName} ${order.customerEmail} ${
        productById(order.productId)?.name ?? ''
      } ${storeName(order.storeId)}`,
    filters: FILTERS
  });

  const columns: Column<AdminOrder>[] = [
    {
      key: 'id',
      header: 'Order ID',
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
      key: 'product',
      header: 'Product',
      primary: true,
      className: 'w-[240px] max-w-[240px]',
      cell: (order) => {
        const product = productById(order.productId);
        return (
          <span className="flex items-center gap-3">
            <Avatar
              src={product?.image}
              name={product?.name ?? 'Product'}
              size={44}
              shape="square"
            />
            <span className="min-w-0">
              <span className="block truncate font-medium text-secondary">
                {product?.name ?? 'Removed product'}
              </span>
              <span className="block truncate text-12 text-gray">
                {firstWords(product?.description ?? '', 8)}
              </span>
            </span>
          </span>
        );
      }
    },
    {
      key: 'store',
      header: 'Store',
      cell: (order) => (
        <Link
          href={`/stores/${order.storeId}`}
          className="transition-colors hover:text-primary"
        >
          {storeName(order.storeId)}
        </Link>
      )
    },
    {
      key: 'category',
      header: 'Category',
      cell: (order) => {
        const product = productById(order.productId);
        return product ? categoryName(product.categoryId) : '—';
      }
    },
    {
      key: 'total',
      header: 'Total',
      cell: (order) => money(order.total)
    },
    {
      key: 'freeze',
      header: 'Freeze Amount',
      cell: (order) => (order.freezeAmount ? 'Yes' : 'No')
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
      key: 'created',
      header: 'Created',
      cell: (order) => shortDate(order.createdAt)
    },
    {
      key: 'actions',
      header: '',
      actions: true,
      cell: (order) => (
        <IconButton
          label={`Open order ${order.id}`}
          icon={<HiOutlineEye />}
          href={`/orders/${order.id}`}
        />
      )
    }
  ];

  const exportCsv = () =>
    downloadCsv(
      'tredella-orders.csv',
      [
        { header: 'Order ID', value: (o: AdminOrder) => o.id },
        { header: 'Store', value: (o: AdminOrder) => storeName(o.storeId) },
        { header: 'Product', value: (o: AdminOrder) => productById(o.productId)?.name ?? '' },
        { header: 'Customer', value: (o: AdminOrder) => o.customerName },
        { header: 'Items', value: (o: AdminOrder) => o.items },
        { header: 'Total (AED)', value: (o: AdminOrder) => o.total },
        { header: 'Freeze amount', value: (o: AdminOrder) => (o.freezeAmount ? 'Yes' : 'No') },
        { header: 'Status', value: (o: AdminOrder) => ORDER_STATUS_LABEL[o.status] },
        { header: 'Created', value: (o: AdminOrder) => o.createdAt }
      ],
      rows
    );

  return (
    <>
      <PageHeading
        title="Order History"
        trail={[{ label: 'Orders' }, { label: 'Order History' }]}
      />
      <SampleDataNote>
        Sample data. Every order query in the API is scoped to one buyer or one
        seller — there is no marketplace-wide order resolver yet.
      </SampleDataNote>

      <Card flush>
        <Toolbar
          term={table.term}
          onSearch={table.search}
          filters={FILTERS}
          draft={table.draft}
          onDraftChange={table.setDraftValue}
          onApply={table.apply}
          chips={table.chips}
          onRemoveChip={table.removeChip}
          onExport={exportCsv}
          searchPlaceholder="Search order, customer or store"
        />

        <div className="px-4 py-4 sm:px-5">
          <DataTable
            columns={columns}
            rows={table.visible}
            rowKey={(order) => order.id}
            empty={`No ${mode === 'RETAIL' ? 'retail' : 'wholesale'} orders match those filters.`}
          />
        </div>

        <Pagination
          page={table.page}
          pageCount={table.pageCount}
          onChange={table.setPage}
        />
      </Card>
    </>
  );
}
