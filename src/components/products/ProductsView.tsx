'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { HiOutlineEye, HiOutlinePencil } from 'react-icons/hi';
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
import ReviewModal from './ReviewModal';
import { useAccess } from 'components/console/AccessContext';
import { useTableState, type FilterDef } from 'hooks/useTableState';
import { PRODUCTS } from 'data/products';
import { STORES, storeName } from 'data/stores';
import { CATEGORIES, categoryName } from 'data/catalogue';
import type { AdminProduct } from 'types/console';
import {
  APPROVAL_LABEL,
  type ApprovalStatus,
  type ReviewDecision,
  applyReview,
  blockReason,
  canBeSold
} from 'lib/productApproval';
import { count, firstWords, money, monthKey, monthOptions } from 'lib/format';
import { downloadCsv } from 'lib/csv';

const FILTERS: FilterDef<AdminProduct>[] = [
  {
    key: 'status',
    label: 'Status',
    options: (['PENDING', 'APPROVED', 'REJECTED'] as ApprovalStatus[]).map(
      (status) => ({ value: status, label: APPROVAL_LABEL[status] })
    ),
    match: (product, value) => product.approval === value
  },
  {
    key: 'store',
    label: 'Store',
    options: STORES.map((store) => ({ value: store.id, label: store.name })),
    match: (product, value) => product.storeId === value
  },
  {
    key: 'category',
    label: 'Category',
    options: CATEGORIES.map((category) => ({
      value: category.id,
      label: category.name
    })),
    match: (product, value) => product.categoryId === value
  },
  {
    key: 'created',
    label: 'Listed',
    options: monthOptions(PRODUCTS.map((product) => product.createdAt)),
    match: (product, value) => monthKey(product.createdAt) === value
  }
];

export default function ProductsView() {
  const { mode } = useConsole();
  const { manage } = useAccess();
  const mayReview = manage('products');
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<AdminProduct[]>(PRODUCTS);
  const [reviewing, setReviewing] = useState<AdminProduct | null>(null);

  const rows = products.filter((product) => product.mode === mode);

  /* The Analytics card links straight to the review queue, so honour
     ?status=PENDING as an already-applied filter rather than dropping the
     admin on the full list and making them find it again. */
  const seeded = searchParams.get('status');
  const table = useTableState<AdminProduct>({
    rows,
    searchIn: (product) =>
      `${product.name} ${product.id} ${storeName(product.storeId)} ${product.brandName}`,
    filters: FILTERS,
    initial: seeded ? { status: seeded } : undefined
  });

  const saveReview = (decision: ReviewDecision) => {
    if (!reviewing) return;
    setProducts((current) =>
      current.map((product) =>
        product.id === reviewing.id
          ? {
              ...applyReview(product, decision),
              approvalNote:
                decision.next === 'REJECTED' ? decision.reason.trim() : null
            }
          : product
      )
    );
    setReviewing(null);
  };

  const columns: Column<AdminProduct>[] = [
    { key: 'storeId', header: 'Store ID', cell: (product) => product.storeId },
    {
      key: 'store',
      header: 'Store Name',
      cell: (product) => (
        <Link
          href={`/stores/${product.storeId}`}
          className="flex items-center gap-2 transition-colors hover:text-primary"
        >
          <Avatar
            src={STORES.find((s) => s.id === product.storeId)?.logo}
            name={storeName(product.storeId)}
            size={32}
            shape="square"
          />
          {storeName(product.storeId)}
        </Link>
      )
    },
    {
      key: 'product',
      header: 'Product',
      primary: true,
      className: 'w-[240px] max-w-[240px]',
      cell: (product) => (
        <Link
          href={`/products/${product.id}`}
          className="flex items-center gap-3 transition-colors hover:text-primary"
        >
          <Avatar src={product.image} name={product.name} size={44} shape="square" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-secondary">
              {product.name}
            </span>
            <span className="block truncate text-12 text-gray">
              {firstWords(product.description, 8)}
            </span>
          </span>
        </Link>
      )
    },
    {
      key: 'category',
      header: 'Category',
      cell: (product) => categoryName(product.categoryId)
    },
    { key: 'price', header: 'Price', cell: (product) => money(product.price) },
    {
      key: 'stock',
      header: 'Stock Quantity',
      cell: (product) => count(product.stock)
    },
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
        const listing = {
          approval: product.approval,
          listedBySeller: product.listedBySeller,
          stock: product.stock
        };
        return canBeSold(listing) ? (
          <StatusBadge tone="success">Yes</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">
            {blockReason(listing) === 'UNLISTED_BY_SELLER'
              ? 'Seller off'
              : blockReason(listing) === 'OUT_OF_STOCK'
                ? 'No stock'
                : 'No'}
          </StatusBadge>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      actions: true,
      cell: (product) => (
        <div className="flex items-center gap-2">
          {mayReview && (
            <IconButton
              label={`Review ${product.name}`}
              icon={<HiOutlinePencil />}
              onClick={() => setReviewing(product)}
            />
          )}
          <IconButton
            label={`Open ${product.name}`}
            icon={<HiOutlineEye />}
            tone="neutral"
            href={`/products/${product.id}`}
          />
        </div>
      )
    }
  ];

  const exportCsv = () =>
    downloadCsv(
      'tredella-products.csv',
      [
        { header: 'Product ID', value: (p: AdminProduct) => p.id },
        { header: 'Name', value: (p: AdminProduct) => p.name },
        { header: 'Store', value: (p: AdminProduct) => storeName(p.storeId) },
        { header: 'Category', value: (p: AdminProduct) => categoryName(p.categoryId) },
        { header: 'Price (AED)', value: (p: AdminProduct) => p.price },
        { header: 'Stock', value: (p: AdminProduct) => p.stock },
        { header: 'Approval', value: (p: AdminProduct) => APPROVAL_LABEL[p.approval] },
        {
          header: 'On sale',
          value: (p: AdminProduct) =>
            canBeSold({
              approval: p.approval,
              listedBySeller: p.listedBySeller,
              stock: p.stock
            })
              ? 'Yes'
              : 'No'
        }
      ],
      rows
    );

  const pending = rows.filter((product) => product.approval === 'PENDING').length;

  return (
    <>
      <PageHeading
        title="Product List"
        trail={[{ label: 'Products' }, { label: 'Product List' }]}
      />
      <SampleDataNote>
        Sample data. Products in the database have no approval field yet — that
        column is the one migration this screen cannot work without.
      </SampleDataNote>

      {pending > 0 && (
        <p className="mb-4 rounded-lg bg-[#fdf3dd] px-3 py-2.5 text-12 text-[#b07d17]">
          <span className="font-medium">{pending} listing{pending === 1 ? '' : 's'} awaiting review.</span>{' '}
          Nothing a seller lists goes on sale until it is approved here.
        </p>
      )}

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
          searchPlaceholder="Search product or store"
        />

        <div className="px-4 py-4 sm:px-5">
          <DataTable
            columns={columns}
            rows={table.visible}
            rowKey={(product) => product.id}
            empty={`No ${mode === 'RETAIL' ? 'retail' : 'wholesale'} products match those filters.`}
          />
        </div>

        <Pagination
          page={table.page}
          pageCount={table.pageCount}
          onChange={table.setPage}
        />
      </Card>

      <ReviewModal
        product={reviewing}
        onClose={() => setReviewing(null)}
        onSave={saveReview}
      />
    </>
  );
}
