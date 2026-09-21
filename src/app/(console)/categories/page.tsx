'use client';

import { useState } from 'react';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import SampleDataNote from 'components/console/SampleDataNote';
import Card from 'components/ui/Card';
import DataTable, { type Column } from 'components/ui/DataTable';
import Toolbar from 'components/ui/Toolbar';
import Pagination from 'components/ui/Pagination';
import IconButton from 'components/ui/IconButton';
import Modal from 'components/ui/Modal';
import Button from 'components/ui/Button';
import { useTableState, type FilterDef } from 'hooks/useTableState';
import { CATEGORIES, CATEGORY_ROWS, type CategoryRow } from 'data/catalogue';
import { count } from 'lib/format';
import { downloadCsv } from 'lib/csv';

const FILTERS: FilterDef<CategoryRow>[] = [
  {
    key: 'category',
    label: 'Category',
    options: CATEGORIES.map((category) => ({
      value: category.id,
      label: category.name
    })),
    match: (row, value) => row.categoryId === value
  }
];

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>(CATEGORY_ROWS);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [removing, setRemoving] = useState<CategoryRow | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');

  const table = useTableState<CategoryRow>({
    rows,
    searchIn: (row) =>
      `${row.categoryName} ${row.subcategoryName} ${row.description}`,
    filters: FILTERS
  });

  const openEdit = (row: CategoryRow) => {
    setDraftName(row.subcategoryName);
    setDraftDescription(row.description);
    setEditing(row);
  };

  const saveEdit = () => {
    if (!editing) return;
    setRows((current) =>
      current.map((row) =>
        row.id === editing.id
          ? { ...row, subcategoryName: draftName, description: draftDescription }
          : row
      )
    );
    setEditing(null);
  };

  const columns: Column<CategoryRow>[] = [
    {
      key: 'category',
      header: 'Category Name',
      primary: true,
      cell: (row) => (
        <span className="font-medium text-secondary">{row.categoryName}</span>
      )
    },
    {
      key: 'subcategory',
      header: 'Subcategory',
      cell: (row) => row.subcategoryName
    },
    {
      key: 'description',
      header: 'Description',
      /* Fixed width with a clamp: a description column that takes its
         intrinsic width pushes everything after it off the table. */
      className: 'w-[320px] max-w-[320px]',
      cell: (row) => <span className="line-clamp-2">{row.description}</span>
    },
    {
      key: 'products',
      header: 'Product Count',
      cell: (row) => count(row.productCount)
    },
    {
      key: 'actions',
      header: 'Actions',
      actions: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            label={`Edit ${row.subcategoryName}`}
            icon={<HiOutlinePencil />}
            onClick={() => openEdit(row)}
          />
          <IconButton
            label={`Delete ${row.subcategoryName}`}
            icon={<HiOutlineTrash />}
            onClick={() => setRemoving(row)}
          />
        </div>
      )
    }
  ];

  const exportCsv = () =>
    downloadCsv(
      'tredella-categories.csv',
      [
        { header: 'Category', value: (r: CategoryRow) => r.categoryName },
        { header: 'Subcategory', value: (r: CategoryRow) => r.subcategoryName },
        { header: 'Description', value: (r: CategoryRow) => r.description },
        { header: 'Products', value: (r: CategoryRow) => r.productCount }
      ],
      rows
    );

  return (
    <>
      <PageHeading
        title="Categories"
        trail={[{ label: 'Categories' }, { label: 'Categories' }]}
      />
      <SampleDataNote>
        Sample data. Subcategory descriptions have no column in the database
        yet, so this screen is ahead of the schema.
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
          searchPlaceholder="Search category"
        />

        <div className="px-4 py-4 sm:px-5">
          <DataTable
            columns={columns}
            rows={table.visible}
            rowKey={(row) => row.id}
            empty="No categories match that search."
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
        title="Edit Subcategory"
        width="md"
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Subcategory name</span>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              className="rounded-lg border border-secondary/15 px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Description</span>
            <textarea
              rows={3}
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
              className="brand-scroll resize-none rounded-lg border border-secondary/15 px-3 py-2.5 text-14 text-secondary outline-none focus:border-primary"
            />
          </label>

          <div className="mt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
            <Button type="button" fullWidth onClick={saveEdit}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Delete subcategory"
        width="sm"
      >
        <p className="text-13 leading-relaxed text-gray">
          {removing?.subcategoryName} holds{' '}
          <span className="font-medium text-secondary">
            {count(removing?.productCount ?? 0)} products
          </span>
          . Deleting it would leave those listings without a subcategory, so
          they need moving first.
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
              setRows((current) =>
                current.filter((row) => row.id !== removing?.id)
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
