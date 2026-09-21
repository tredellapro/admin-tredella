'use client';

import { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import SampleDataNote from 'components/console/SampleDataNote';
import Card from 'components/ui/Card';
import DataTable, { type Column } from 'components/ui/DataTable';
import Toolbar from 'components/ui/Toolbar';
import Pagination from 'components/ui/Pagination';
import StatusBadge from 'components/ui/StatusBadge';
import Avatar from 'components/ui/Avatar';
import IconButton from 'components/ui/IconButton';
import Modal from 'components/ui/Modal';
import Button from 'components/ui/Button';
import { useTableState, type FilterDef } from 'hooks/useTableState';
import { BRANDS } from 'data/catalogue';
import type { ActiveStatus, AdminBrand } from 'types/console';
import { count, monthKey, monthOptions, shortDate } from 'lib/format';
import { downloadCsv } from 'lib/csv';

const FILTERS: FilterDef<AdminBrand>[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' }
    ],
    match: (brand, value) => brand.status === value
  },
  {
    key: 'joined',
    label: 'Joined',
    options: monthOptions(BRANDS.map((brand) => brand.joinedAt)),
    match: (brand, value) => monthKey(brand.joinedAt) === value
  }
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>(BRANDS);
  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [removing, setRemoving] = useState<AdminBrand | null>(null);
  const [draftStatus, setDraftStatus] = useState<ActiveStatus>('ACTIVE');

  const table = useTableState<AdminBrand>({
    rows: brands,
    searchIn: (brand) => `${brand.name} ${brand.description}`,
    filters: FILTERS
  });

  const columns: Column<AdminBrand>[] = [
    {
      key: 'brand',
      header: 'Brand Name',
      primary: true,
      cell: (brand) => (
        <span className="flex items-center gap-3">
          <Avatar src={brand.logo} name={brand.name} size={40} shape="square" />
          <span className="font-medium text-secondary">{brand.name}</span>
        </span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      className: 'w-[300px] max-w-[300px]',
      cell: (brand) => <span className="line-clamp-2">{brand.description}</span>
    },
    {
      key: 'products',
      header: 'Products',
      cell: (brand) => count(brand.productCount)
    },
    {
      key: 'status',
      header: 'Status',
      cell: (brand) => (
        <StatusBadge status={brand.status}>
          {brand.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </StatusBadge>
      )
    },
    {
      key: 'joined',
      header: 'Joined Date',
      cell: (brand) => shortDate(brand.joinedAt)
    },
    {
      key: 'actions',
      header: 'Actions',
      actions: true,
      cell: (brand) => (
        <div className="flex items-center gap-2">
          <IconButton
            label={`Edit ${brand.name}`}
            icon={<HiOutlinePencil />}
            onClick={() => {
              setDraftStatus(brand.status);
              setEditing(brand);
            }}
          />
          <IconButton
            label={`Delete ${brand.name}`}
            icon={<HiOutlineTrash />}
            onClick={() => setRemoving(brand)}
          />
        </div>
      )
    }
  ];

  const exportCsv = () =>
    downloadCsv(
      'tredella-brands.csv',
      [
        { header: 'Brand', value: (b: AdminBrand) => b.name },
        { header: 'Description', value: (b: AdminBrand) => b.description },
        { header: 'Products', value: (b: AdminBrand) => b.productCount },
        { header: 'Status', value: (b: AdminBrand) => b.status },
        { header: 'Joined', value: (b: AdminBrand) => b.joinedAt }
      ],
      brands
    );

  return (
    <>
      <PageHeading
        title="Brands"
        trail={[{ label: 'Brands' }, { label: 'Brands' }]}
      />
      <SampleDataNote>
        Sample data. There is no Brand model in the database yet — a product
        carries its brand as free text, so the same brand can be spelled three
        ways across three stores.
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
          searchPlaceholder="Search brand"
        />

        <div className="px-4 py-4 sm:px-5">
          <DataTable
            columns={columns}
            rows={table.visible}
            rowKey={(brand) => brand.id}
            empty="No brands match those filters."
          />
        </div>

        <Pagination
          page={table.page}
          pageCount={table.pageCount}
          onChange={table.setPage}
        />
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit Brand"
        width="sm"
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Change Status</span>
            <select
              value={draftStatus}
              onChange={(event) =>
                setDraftStatus(event.target.value as ActiveStatus)
              }
              className="rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          <p className="text-12 leading-relaxed text-gray">
            Setting a brand to Inactive hides it from the storefront filters.
            Listings already using it stay where they are.
          </p>

          <div className="mt-1 flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              fullWidth
              onClick={() => {
                if (!editing) return;
                setBrands((current) =>
                  current.map((brand) =>
                    brand.id === editing.id
                      ? { ...brand, status: draftStatus }
                      : brand
                  )
                );
                setEditing(null);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Delete brand"
        width="sm"
      >
        <p className="text-13 leading-relaxed text-gray">
          {removing?.name} is on{' '}
          <span className="font-medium text-secondary">
            {count(removing?.productCount ?? 0)} listings
          </span>
          . Deleting it would leave them unbranded — set it to Inactive instead
          unless you have moved those listings first.
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => setRemoving(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            fullWidth
            disabled={(removing?.productCount ?? 0) > 0}
            onClick={() => {
              setBrands((current) =>
                current.filter((brand) => brand.id !== removing?.id)
              );
              setRemoving(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
