'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DetailHeader from 'components/console/DetailHeader';
import ProductGallery from 'components/console/ProductGallery';
import Card, { CardTitle } from 'components/ui/Card';
import DetailRows from 'components/ui/DetailRows';
import StatusBadge from 'components/ui/StatusBadge';
import Button from 'components/ui/Button';
import ReviewModal from './ReviewModal';
import { productById } from 'data/products';
import { storeById } from 'data/stores';
import { categoryName } from 'data/catalogue';
import {
  APPROVAL_LABEL,
  adminExplanation,
  applyReview,
  canBeSold,
  type ReviewDecision
} from 'lib/productApproval';
import type { AdminProduct } from 'types/console';
import { count, longDate, money } from 'lib/format';

export default function ProductDetailView({ id }: { id: string }) {
  const [product, setProduct] = useState<AdminProduct | undefined>(() =>
    productById(id)
  );
  const [reviewing, setReviewing] = useState(false);

  if (!product) return null;

  const store = storeById(product.storeId);
  const listing = {
    approval: product.approval,
    listedBySeller: product.listedBySeller,
    stock: product.stock
  };
  const onSale = canBeSold(listing);

  const save = (decision: ReviewDecision) => {
    setProduct((current) =>
      current
        ? {
            ...applyReview(current, decision),
            approvalNote:
              decision.next === 'REJECTED' ? decision.reason.trim() : null
          }
        : current
    );
    setReviewing(false);
  };

  return (
    <>
      <DetailHeader
        title="Product Information"
        subtitle={`${product.id} · ${store?.name ?? product.storeId}`}
        backTo="/products"
        actions={
          <Button type="button" onClick={() => setReviewing(true)}>
            Review listing
          </Button>
        }
      />

      {/* The admin decision, first — it is the reason this screen exists. */}
      <Card className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={product.approval}>
                {APPROVAL_LABEL[product.approval]}
              </StatusBadge>
              <StatusBadge tone={onSale ? 'success' : 'neutral'}>
                {onSale ? 'On sale' : 'Not on sale'}
              </StatusBadge>
            </div>

            <p className="mt-2 text-13 text-gray">{adminExplanation(listing)}</p>

            {product.approvalNote && (
              <p className="mt-3 rounded-lg bg-primary/8 px-3 py-2.5 text-12 leading-relaxed text-primary">
                <span className="font-medium">Reason given to the seller:</span>{' '}
                {product.approvalNote}
              </p>
            )}
          </div>

          <dl className="flex gap-6 text-13">
            <div>
              <dt className="text-gray">Seller&rsquo;s switch</dt>
              <dd className="mt-0.5 font-medium text-secondary">
                {product.listedBySeller ? 'On' : 'Off'}
              </dd>
            </div>
            <div>
              <dt className="text-gray">Stock</dt>
              <dd className="mt-0.5 font-medium text-secondary">
                {count(product.stock)}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,340px)_1fr]">
          <ProductGallery images={product.gallery} alt={product.name} />

          <div className="min-w-0">
            <h2 className="text-16 font-semibold text-secondary sm:text-18">
              {product.name}
            </h2>
            <p className="mt-2 text-13 leading-relaxed text-gray">
              {product.description}
            </p>

            <h3 className="mb-2 mt-6 text-15 font-semibold text-secondary">
              Product Details
            </h3>

            <div className="grid grid-cols-1 gap-x-5 lg:grid-cols-2">
              <DetailRows
                rows={[
                  { label: 'Category', value: categoryName(product.categoryId) },
                  { label: 'Brand', value: product.brandName },
                  { label: 'Price', value: money(product.price) },
                  { label: 'Color', value: product.colour },
                  { label: 'Stock Quantity', value: count(product.stock) }
                ]}
              />
              <DetailRows
                rows={[
                  {
                    label: 'Status',
                    value: (
                      <StatusBadge status={product.approval}>
                        {APPROVAL_LABEL[product.approval]}
                      </StatusBadge>
                    )
                  },
                  {
                    label: 'Discount',
                    value:
                      product.discountPercent > 0
                        ? `${product.discountPercent}% OFF`
                        : 'None'
                  },
                  {
                    label: 'Variations',
                    value: product.variations.length > 0 ? 'Yes' : 'No'
                  },
                  { label: 'Create at', value: longDate(product.createdAt) },
                  {
                    label: 'Storefront',
                    value: product.mode === 'RETAIL' ? 'Retail' : 'Wholesale'
                  }
                ]}
              />
            </div>

            {store && (
              <Link
                href={`/stores/${store.id}`}
                className="mt-5 inline-flex text-13 font-medium text-primary hover:underline"
              >
                Open {store.name}
              </Link>
            )}
          </div>
        </div>
      </Card>

      {product.variations.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {product.variations.map((variation) => (
            <Card key={variation.name}>
              <CardTitle>
                <span className="text-primary">{variation.name}</span>
              </CardTitle>

              <p className="px-1 pb-2 text-13 text-secondary">Product Images</p>
              <ul className="flex flex-wrap gap-2 px-1 pb-4">
                {variation.images.map((src, index) => (
                  <li
                    key={`${src}-${index}`}
                    className="relative h-16 w-16 overflow-hidden rounded-lg bg-secondary/5"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>

              <p className="px-1 pb-2 text-13 text-secondary">Product Details</p>
              <DetailRows
                rows={[
                  { label: 'Size', value: variation.size },
                  { label: 'Color', value: variation.colour },
                  { label: 'Price', value: money(variation.price) },
                  { label: 'Create at', value: longDate(variation.createdAt) },
                  { label: 'Stock Quantity', value: count(variation.stock) }
                ]}
              />
            </Card>
          ))}
        </div>
      )}

      <ReviewModal
        product={reviewing ? product : null}
        onClose={() => setReviewing(false)}
        onSave={save}
      />
    </>
  );
}
