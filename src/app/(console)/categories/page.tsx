'use client';

import { useMemo, useState } from 'react';
import { HiOutlinePencil, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import SampleDataNote from 'components/console/SampleDataNote';
import Card from 'components/ui/Card';
import DataTable, { type Column } from 'components/ui/DataTable';
import Toolbar from 'components/ui/Toolbar';
import Pagination from 'components/ui/Pagination';
import IconButton from 'components/ui/IconButton';
import Modal from 'components/ui/Modal';
import Button from 'components/ui/Button';
import FormError from 'components/auth/FormError';
import { useTableState, type FilterDef } from 'hooks/useTableState';
import { CATEGORIES, toRows, type CategoryRow } from 'data/catalogue';
import type { AdminCategory } from 'types/console';
import {
  categoryProblem,
  subcategoryProblem,
  takenSlugs,
  uniqueSlug
} from 'lib/categoryForm';
import { count } from 'lib/format';
import { downloadCsv } from 'lib/csv';

const field =
  'w-full rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary';

export default function CategoriesPage() {
  /* The nested shape is the source of truth and the table is derived from it.
     Keeping a flat list in state instead would make "add a category with no
     subcategories yet" impossible to represent. */
  const [categories, setCategories] = useState<AdminCategory[]>(CATEGORIES);

  const [addingCategory, setAddingCategory] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [removing, setRemoving] = useState<CategoryRow | null>(null);

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  const rows = useMemo(() => toRows(categories), [categories]);

  /* Built from state, not from the module constant — a category you add has
     to show up in its own filter straight away. */
  const filters: FilterDef<CategoryRow>[] = useMemo(
    () => [
      {
        key: 'category',
        label: 'Category',
        options: categories.map((category) => ({
          value: category.id,
          label: category.name
        })),
        match: (row, value) => row.categoryId === value
      }
    ],
    [categories]
  );

  const table = useTableState<CategoryRow>({
    rows,
    searchIn: (row) =>
      `${row.categoryName} ${row.subcategoryName} ${row.description}`,
    filters
  });

  const closeAll = () => {
    setAddingCategory(false);
    setAddingSub(false);
    setEditing(null);
    setRemoving(null);
    setProblem(null);
  };

  const openAddCategory = () => {
    setName('');
    setProblem(null);
    setAddingCategory(true);
  };

  const openAddSub = (presetParent?: string) => {
    setName('');
    setDescription('');
    setParentId(presetParent ?? categories[0]?.id ?? '');
    setProblem(null);
    setAddingSub(true);
  };

  const saveCategory = () => {
    const found = categoryProblem(name, categories);
    if (found) {
      setProblem(found);
      return;
    }
    const id = uniqueSlug(name, takenSlugs(categories));
    setCategories((current) => [
      ...current,
      { id, name: name.trim(), subcategories: [] }
    ]);
    closeAll();
  };

  const saveSubcategory = () => {
    const found = subcategoryProblem(name, parentId, categories);
    if (found) {
      setProblem(found);
      return;
    }
    const id = uniqueSlug(name, takenSlugs(categories));
    setCategories((current) =>
      current.map((category) =>
        category.id === parentId
          ? {
              ...category,
              subcategories: [
                ...category.subcategories,
                {
                  id,
                  name: name.trim(),
                  description: description.trim(),
                  productCount: 0
                }
              ]
            }
          : category
      )
    );
    closeAll();
  };

  const openEdit = (row: CategoryRow) => {
    setName(row.subcategoryId ? row.subcategoryName : row.categoryName);
    setDescription(row.description);
    setProblem(null);
    setEditing(row);
  };

  const saveEdit = () => {
    if (!editing) return;

    /* Editing the placeholder row renames the category itself; editing a real
       row renames the subcategory. Same button, two different things, so the
       duplicate check has to be the matching one. */
    if (!editing.subcategoryId) {
      const others = categories.filter((c) => c.id !== editing.categoryId);
      const found = categoryProblem(name, others);
      if (found) {
        setProblem(found);
        return;
      }
      setCategories((current) =>
        current.map((category) =>
          category.id === editing.categoryId
            ? { ...category, name: name.trim() }
            : category
        )
      );
      closeAll();
      return;
    }

    const trimmedTarget = editing.subcategoryId;
    const withoutThis = categories.map((category) =>
      category.id === editing.categoryId
        ? {
            ...category,
            subcategories: category.subcategories.filter(
              (sub) => sub.id !== trimmedTarget
            )
          }
        : category
    );
    const found = subcategoryProblem(name, editing.categoryId, withoutThis);
    if (found) {
      setProblem(found);
      return;
    }

    setCategories((current) =>
      current.map((category) =>
        category.id === editing.categoryId
          ? {
              ...category,
              subcategories: category.subcategories.map((sub) =>
                sub.id === trimmedTarget
                  ? { ...sub, name: name.trim(), description: description.trim() }
                  : sub
              )
            }
          : category
      )
    );
    closeAll();
  };

  const confirmRemove = () => {
    if (!removing) return;
    setCategories((current) =>
      removing.subcategoryId
        ? current.map((category) =>
            category.id === removing.categoryId
              ? {
                  ...category,
                  subcategories: category.subcategories.filter(
                    (sub) => sub.id !== removing.subcategoryId
                  )
                }
              : category
          )
        : current.filter((category) => category.id !== removing.categoryId)
    );
    closeAll();
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
      cell: (row) =>
        row.subcategoryId ? (
          row.subcategoryName
        ) : (
          <button
            type="button"
            onClick={() => openAddSub(row.categoryId)}
            className="flex items-center gap-1 text-13 font-medium text-primary hover:underline"
          >
            <HiOutlinePlus aria-hidden="true" className="text-13" />
            Add the first one
          </button>
        )
    },
    {
      key: 'description',
      header: 'Description',
      className: 'w-[320px] max-w-[320px]',
      cell: (row) =>
        row.description ? (
          <span className="line-clamp-2">{row.description}</span>
        ) : (
          <span className="text-gray/70">—</span>
        )
    },
    {
      key: 'products',
      header: 'Product Count',
      cell: (row) => (row.subcategoryId ? count(row.productCount) : '—')
    },
    {
      key: 'actions',
      header: 'Actions',
      actions: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <IconButton
            label={`Edit ${row.subcategoryName || row.categoryName}`}
            icon={<HiOutlinePencil />}
            onClick={() => openEdit(row)}
          />
          <IconButton
            label={`Delete ${row.subcategoryName || row.categoryName}`}
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
        {
          header: 'Products',
          value: (r: CategoryRow) => (r.subcategoryId ? r.productCount : '')
        }
      ],
      rows
    );

  const addButton =
    'flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-13 font-medium transition-colors';

  const parent = categories.find((category) => category.id === parentId);

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
          filters={filters}
          draft={table.draft}
          onDraftChange={table.setDraftValue}
          onApply={table.apply}
          chips={table.chips}
          onRemoveChip={table.removeChip}
          onExport={exportCsv}
          searchPlaceholder="Search category"
          actions={
            <>
              <button
                type="button"
                onClick={openAddCategory}
                className={`${addButton} border border-secondary/20 bg-white text-secondary hover:border-primary/40 hover:text-primary`}
              >
                <HiOutlinePlus aria-hidden="true" className="text-14" />
                Add Category
              </button>
              <button
                type="button"
                onClick={() => openAddSub()}
                className={`${addButton} bg-primary text-white hover:bg-primary/90`}
              >
                <HiOutlinePlus aria-hidden="true" className="text-14" />
                Add Subcategory
              </button>
            </>
          }
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

      {/* ---- add a category ---- */}
      <Modal
        open={addingCategory}
        onClose={closeAll}
        title="Add Category"
        width="md"
      >
        <div className="flex flex-col gap-4">
          <FormError message={problem} />

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Category name</span>
            <input
              value={name}
              autoFocus
              placeholder="e.g. Garden & Outdoor"
              onChange={(event) => {
                setName(event.target.value);
                setProblem(null);
              }}
              className={field}
            />
          </label>

          <p className="text-12 leading-relaxed text-gray">
            A new category starts empty. Add its first subcategory next —
            products are listed against a subcategory, not a category.
          </p>

          <div className="mt-1 flex gap-3">
            <Button type="button" variant="outline" fullWidth onClick={closeAll}>
              Cancel
            </Button>
            <Button type="button" fullWidth onClick={saveCategory}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---- add a subcategory ---- */}
      <Modal open={addingSub} onClose={closeAll} title="Add Subcategory" width="md">
        <div className="flex flex-col gap-4">
          <FormError message={problem} />

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Category</span>
            <select
              value={parentId}
              onChange={(event) => {
                setParentId(event.target.value);
                setProblem(null);
              }}
              className={field}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">Subcategory name</span>
            <input
              value={name}
              placeholder="e.g. Garden Furniture"
              onChange={(event) => {
                setName(event.target.value);
                setProblem(null);
              }}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">
              Description <span className="text-gray">(optional)</span>
            </span>
            <textarea
              rows={3}
              value={description}
              placeholder="What belongs in here"
              onChange={(event) => setDescription(event.target.value)}
              className={`brand-scroll resize-none ${field}`}
            />
          </label>

          {parent && (
            <p className="text-12 text-gray">
              Goes under{' '}
              <span className="font-medium text-secondary">{parent.name}</span>.
              Two categories may each have a subcategory of the same name.
            </p>
          )}

          <div className="mt-1 flex gap-3">
            <Button type="button" variant="outline" fullWidth onClick={closeAll}>
              Cancel
            </Button>
            <Button type="button" fullWidth onClick={saveSubcategory}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---- edit ---- */}
      <Modal
        open={editing !== null}
        onClose={closeAll}
        title={editing?.subcategoryId ? 'Edit Subcategory' : 'Edit Category'}
        width="md"
      >
        <div className="flex flex-col gap-4">
          <FormError message={problem} />

          <label className="flex flex-col gap-2">
            <span className="text-13 text-secondary">
              {editing?.subcategoryId ? 'Subcategory name' : 'Category name'}
            </span>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setProblem(null);
              }}
              className={field}
            />
          </label>

          {editing?.subcategoryId && (
            <label className="flex flex-col gap-2">
              <span className="text-13 text-secondary">Description</span>
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={`brand-scroll resize-none ${field}`}
              />
            </label>
          )}

          <div className="mt-1 flex gap-3">
            <Button type="button" variant="outline" fullWidth onClick={closeAll}>
              Cancel
            </Button>
            <Button type="button" fullWidth onClick={saveEdit}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---- delete ---- */}
      <Modal
        open={removing !== null}
        onClose={closeAll}
        title={removing?.subcategoryId ? 'Delete subcategory' : 'Delete category'}
        width="sm"
      >
        {removing?.subcategoryId ? (
          <p className="text-13 leading-relaxed text-gray">
            {removing.subcategoryName} holds{' '}
            <span className="font-medium text-secondary">
              {count(removing.productCount)} products
            </span>
            . Deleting it would leave those listings without a subcategory, so
            they need moving first.
          </p>
        ) : (
          <p className="text-13 leading-relaxed text-gray">
            {removing?.categoryName} has no subcategories and no products, so
            nothing is left behind by removing it.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" fullWidth onClick={closeAll}>
            Cancel
          </Button>
          <Button
            type="button"
            fullWidth
            disabled={(removing?.productCount ?? 0) > 0}
            onClick={confirmRemove}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
