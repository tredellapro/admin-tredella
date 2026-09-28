'use client';

import { useState } from 'react';
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlinePlus,
  HiOutlineTrash
} from 'react-icons/hi';
import Button from 'components/ui/Button';
import FormError from 'components/auth/FormError';
import {
  addFeature,
  discountProblem,
  effectivePrice,
  moveFeature,
  planProblem,
  priceProblem,
  removeFeature,
  savingPerMonth,
  updateFeature,
  type EditablePlan,
  type PlanFeature
} from 'lib/plans';
import { money } from 'lib/format';

const field =
  'w-full rounded-lg border border-secondary/15 bg-white px-3 py-2.5 text-14 text-secondary outline-none transition-colors placeholder:text-gray/60 focus:border-primary';

/**
 * Editing one plan in place rather than in a dialog: the feature list runs to
 * a dozen rows, and a modal that scrolls its own body while the page scrolls
 * behind it is miserable on a phone.
 */
export default function PlanEditor({
  plan,
  onCancel,
  onSave
}: {
  plan: EditablePlan;
  onCancel: () => void;
  onSave: (_plan: EditablePlan) => void;
}) {
  const [draft, setDraft] = useState<EditablePlan>(plan);
  const [showProblem, setShowProblem] = useState(false);

  const patch = (changes: Partial<EditablePlan>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setShowProblem(false);
  };

  const setFeatures = (features: PlanFeature[]) => patch({ features });

  const problem = planProblem(draft);
  const priceIssue = priceProblem(draft.monthlyPrice);
  const discountIssue = discountProblem(draft.discountPercent);
  const final = effectivePrice(draft.monthlyPrice, draft.discountPercent);
  const saving = savingPerMonth(draft.monthlyPrice, draft.discountPercent);

  return (
    <div className="flex flex-col gap-4">
      {showProblem && <FormError message={problem} />}

      <label className="flex flex-col gap-2">
        <span className="text-13 text-secondary">Plan name</span>
        <input
          value={draft.name}
          onChange={(event) => patch({ name: event.target.value })}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-13 text-secondary">Tagline</span>
        <input
          value={draft.tagline}
          onChange={(event) => patch({ tagline: event.target.value })}
          className={field}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-13 text-secondary">Price (AED / month)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={draft.monthlyPrice}
            onChange={(event) =>
              patch({ monthlyPrice: event.target.valueAsNumber })
            }
            className={field}
          />
          {priceIssue && <span className="text-12 text-primary">{priceIssue}</span>}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-13 text-secondary">Discount (%)</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={90}
            value={draft.discountPercent}
            onChange={(event) =>
              patch({ discountPercent: event.target.valueAsNumber })
            }
            className={field}
          />
          {discountIssue && (
            <span className="text-12 text-primary">{discountIssue}</span>
          )}
        </label>
      </div>

      {/* The number a seller will actually be charged, worked out as you type
          — so a discount is never applied blind. */}
      <div className="rounded-xl bg-background px-4 py-3">
        <p className="text-12 text-gray">Sellers will pay</p>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-2">
          <span className="text-20 font-semibold text-secondary">
            {Number.isFinite(final) ? money(final) : '—'}
          </span>
          <span className="text-12 text-gray">/ month</span>
          {draft.discountPercent > 0 && Number.isFinite(saving) && (
            <span className="text-12 text-primary">
              saving {money(saving)} a month
            </span>
          )}
        </p>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={draft.active}
          onChange={(event) => patch({ active: event.target.checked })}
          className="h-4 w-4 accent-[rgb(var(--primary-rgb))]"
        />
        <span className="text-13 text-secondary">
          Active — sellers can choose this plan
        </span>
      </label>

      {/* ---- the points ---- */}
      <div className="border-t border-secondary/10 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <p className="text-14 font-medium text-secondary">Points on the plan</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFeatures(addFeature(draft.features, 'FEATURE'))}
              className="flex items-center gap-1 rounded-lg border border-secondary/20 px-3 py-1.5 text-12 text-secondary transition-colors hover:border-primary/40 hover:text-primary"
            >
              <HiOutlinePlus aria-hidden="true" /> Point
            </button>
            <button
              type="button"
              onClick={() => setFeatures(addFeature(draft.features, 'NOTE'))}
              className="flex items-center gap-1 rounded-lg border border-secondary/20 px-3 py-1.5 text-12 text-secondary transition-colors hover:border-primary/40 hover:text-primary"
            >
              <HiOutlinePlus aria-hidden="true" /> Note
            </button>
          </div>
        </div>

        <ul className="flex flex-col gap-3">
          {draft.features.map((feature, index) => (
            <li
              key={index}
              className="rounded-xl border border-secondary/10 p-3"
            >
              <div className="flex items-center justify-between gap-2 pb-2">
                <span className="text-11 uppercase tracking-wide text-gray">
                  {feature.kind === 'NOTE' ? 'Note' : 'Point'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => setFeatures(moveFeature(draft.features, index, -1))}
                    className="rounded p-1 text-14 text-gray transition-colors hover:text-primary disabled:opacity-30"
                  >
                    <HiOutlineChevronUp />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === draft.features.length - 1}
                    onClick={() => setFeatures(moveFeature(draft.features, index, 1))}
                    className="rounded p-1 text-14 text-gray transition-colors hover:text-primary disabled:opacity-30"
                  >
                    <HiOutlineChevronDown />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove this point"
                    onClick={() => setFeatures(removeFeature(draft.features, index))}
                    className="rounded p-1 text-14 text-gray transition-colors hover:text-primary"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>

              {feature.kind === 'NOTE' && (
                <input
                  value={feature.title ?? ''}
                  placeholder="Heading"
                  onChange={(event) =>
                    setFeatures(
                      updateFeature(draft.features, index, {
                        title: event.target.value
                      })
                    )
                  }
                  className={`${field} mb-2`}
                />
              )}

              <input
                value={feature.label}
                placeholder={
                  feature.kind === 'NOTE' ? 'What it means' : 'e.g. Retail storefront'
                }
                onChange={(event) =>
                  setFeatures(
                    updateFeature(draft.features, index, {
                      label: event.target.value
                    })
                  )
                }
                className={field}
              />

              {feature.kind === 'FEATURE' && (
                <label className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={feature.included !== false}
                    onChange={(event) =>
                      setFeatures(
                        updateFeature(draft.features, index, {
                          included: event.target.checked
                        })
                      )
                    }
                    className="h-4 w-4 accent-[rgb(var(--primary-rgb))]"
                  />
                  <span className="text-12 text-gray">
                    Included — unticked shows it struck through, as a thing this
                    plan does not get
                  </span>
                </label>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3 border-t border-secondary/10 pt-4">
        <Button type="button" variant="outline" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          fullWidth
          onClick={() => {
            if (problem) {
              setShowProblem(true);
              return;
            }
            onSave(draft);
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
