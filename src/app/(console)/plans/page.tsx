'use client';

import { useState } from 'react';
import { HiCheck, HiOutlineInformationCircle, HiOutlinePencil, HiX } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import SampleDataNote from 'components/console/SampleDataNote';
import Card from 'components/ui/Card';
import StatusBadge from 'components/ui/StatusBadge';
import PlanEditor from 'components/plans/PlanEditor';
import { PLANS, SUBSCRIBERS } from 'data/plans';
import { effectivePrice, savingPerMonth, type EditablePlan } from 'lib/plans';
import { count, money } from 'lib/format';

export default function PlansPage() {
  const [plans, setPlans] = useState<EditablePlan[]>(PLANS);
  const [editing, setEditing] = useState<string | null>(null);

  const save = (updated: EditablePlan) => {
    setPlans((current) =>
      current.map((plan) => (plan.code === updated.code ? updated : plan))
    );
    setEditing(null);
  };

  return (
    <>
      <PageHeading
        title="Manage Plans"
        trail={[{ label: 'Plans' }, { label: 'Manage Plans' }]}
      />
      <SampleDataNote>
        Sample data. Prices and features live in the Plan table, but there is no
        discount column and no admin mutation to write any of it back yet.
      </SampleDataNote>

      {/* The Figma has a Create New Plan button. There is deliberately no such
          button here — see the note below. */}
      <p className="mb-4 flex items-start gap-2 rounded-lg bg-white px-3 py-2.5 text-12 leading-relaxed text-gray shadow-[0_2px_12px_rgba(43,52,69,0.05)]">
        <HiOutlineInformationCircle
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-14 text-primary"
        />
        <span>
          There are exactly two plans, and what separates them is which
          storefronts a seller gets. A third tier is a product decision, so
          there is no &ldquo;create plan&rdquo; here — only price, discount and
          the points are editable. The plan codes stay{' '}
          <code className="text-secondary">BASIC</code> and{' '}
          <code className="text-secondary">STANDARD</code> because the seller
          app maps storefront access from the code and every subscription row
          references it.
        </span>
      </p>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {plans.map((plan) => {
          const final = effectivePrice(plan.monthlyPrice, plan.discountPercent);
          const saving = savingPerMonth(plan.monthlyPrice, plan.discountPercent);
          const isEditing = editing === plan.code;

          return (
            <Card key={plan.code}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-secondary/10 px-1 pb-4">
                <div className="min-w-0">
                  <h2 className="flex flex-wrap items-center gap-2 text-18 font-semibold text-secondary">
                    {plan.name}
                    <StatusBadge tone={plan.active ? 'success' : 'neutral'}>
                      {plan.active ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </h2>
                  <p className="mt-1 text-13 text-gray">{plan.tagline}</p>
                  <p className="mt-1 text-12 text-gray">
                    Code {plan.code} · {count(SUBSCRIBERS[plan.code] ?? 0)}{' '}
                    sellers subscribed
                  </p>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setEditing(plan.code)}
                    className="flex items-center gap-1.5 rounded-lg border border-secondary/20 px-3 py-2 text-13 font-medium text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <HiOutlinePencil aria-hidden="true" className="text-14" />
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="pt-4">
                  <PlanEditor
                    plan={plan}
                    onCancel={() => setEditing(null)}
                    onSave={save}
                  />
                </div>
              ) : (
                <div className="pt-4">
                  <p className="flex flex-wrap items-baseline gap-2 px-1">
                    <span className="text-28 font-semibold text-secondary">
                      {money(final)}
                    </span>
                    <span className="text-13 text-gray">/ month</span>
                    {plan.discountPercent > 0 && (
                      <>
                        <span className="text-14 text-gray line-through">
                          {money(plan.monthlyPrice)}
                        </span>
                        <StatusBadge tone="danger">
                          {plan.discountPercent}% OFF
                        </StatusBadge>
                      </>
                    )}
                  </p>

                  {plan.discountPercent > 0 && (
                    <p className="mt-1 px-1 text-12 text-primary">
                      Saving {money(saving)} a month.
                    </p>
                  )}

                  <ul className="mt-5 flex flex-col gap-2.5">
                    {plan.features
                      .filter((feature) => feature.kind === 'FEATURE')
                      .map((feature, index) => (
                        <li
                          key={`${feature.label}-${index}`}
                          className="flex items-start gap-2.5 px-1"
                        >
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-10 ${
                              feature.included === false
                                ? 'bg-secondary/10 text-gray'
                                : 'bg-[#e7f7ee] text-[#1f9254]'
                            }`}
                          >
                            {feature.included === false ? <HiX /> : <HiCheck />}
                          </span>
                          <span
                            className={`text-13 ${
                              feature.included === false
                                ? 'text-gray line-through'
                                : 'text-secondary'
                            }`}
                          >
                            {feature.label}
                          </span>
                        </li>
                      ))}
                  </ul>

                  {plan.features.some((feature) => feature.kind === 'NOTE') && (
                    <dl className="mt-5 flex flex-col gap-3 border-t border-secondary/10 px-1 pt-4">
                      {plan.features
                        .filter((feature) => feature.kind === 'NOTE')
                        .map((feature, index) => (
                          <div key={`${feature.title}-${index}`}>
                            <dt className="text-13 font-medium text-secondary">
                              {feature.title}
                            </dt>
                            <dd className="mt-0.5 text-12 leading-relaxed text-gray">
                              {feature.label}
                            </dd>
                          </div>
                        ))}
                    </dl>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
