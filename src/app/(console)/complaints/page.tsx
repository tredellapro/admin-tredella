'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import SampleDataNote from 'components/console/SampleDataNote';
import Card from 'components/ui/Card';
import Tabs from 'components/ui/Tabs';
import StatusBadge from 'components/ui/StatusBadge';
import Pagination from 'components/ui/Pagination';
import SearchInput from 'components/ui/SearchInput';
import { COMPLAINTS, TOPIC_LABEL, type ComplaintState } from 'data/support';
import { longDate } from 'lib/format';

const PAGE_SIZE = 7;

export default function ComplaintsPage() {
  const [state, setState] = useState<ComplaintState>('OPEN');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return COMPLAINTS.filter(
      (complaint) =>
        complaint.state === state &&
        (needle.length === 0 ||
          `${complaint.subject} ${complaint.raisedBy} ${TOPIC_LABEL[complaint.topic]}`
            .toLowerCase()
            .includes(needle))
    );
  }, [state, term]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const openCount = COMPLAINTS.filter((c) => c.state === 'OPEN').length;
  const solvedCount = COMPLAINTS.filter((c) => c.state === 'SOLVED').length;

  return (
    <>
      <PageHeading
        title="Manage Complaints"
        trail={[{ label: 'Complaints' }, { label: 'Manage Complaints' }]}
      />
      <SampleDataNote>
        Sample data. There is no Complaint model in the database — no subject,
        no priority, no open/solved — so this screen is ahead of the schema.
      </SampleDataNote>

      <Card flush>
        <div className="px-4 pt-3 sm:px-5">
          <Tabs
            label="Complaint state"
            value={state}
            onChange={(next) => {
              setState(next as ComplaintState);
              setPage(1);
            }}
            tabs={[
              { value: 'OPEN', label: 'Open', badge: openCount },
              { value: 'SOLVED', label: 'Solved', badge: solvedCount }
            ]}
          />
        </div>

        <div className="px-4 pt-4 sm:px-5">
          <SearchInput
            value={term}
            onChange={(value) => {
              setTerm(value);
              setPage(1);
            }}
            placeholder="Search subject or person"
          />
        </div>

        {visible.length === 0 ? (
          <p className="px-5 py-14 text-center text-14 text-gray">
            Nothing {state === 'OPEN' ? 'open' : 'solved'} matches that search.
          </p>
        ) : (
          <ul className="flex flex-col gap-3 px-4 py-4 sm:px-5">
            {visible.map((complaint) => (
              <li key={complaint.id}>
                <Link
                  href={`/complaints/${complaint.id}`}
                  className="flex items-center gap-4 rounded-xl border border-secondary/10 px-4 py-3.5 transition-colors hover:border-primary/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-14 font-medium text-secondary">
                      {complaint.subject}
                    </span>

                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <StatusBadge
                        tone={complaint.priority === 'URGENT' ? 'danger' : 'neutral'}
                      >
                        {complaint.priority === 'URGENT' ? 'Urgent' : 'Normal'}
                      </StatusBadge>
                      <StatusBadge
                        tone={complaint.state === 'OPEN' ? 'success' : 'info'}
                      >
                        {complaint.state === 'OPEN' ? 'Open' : 'Solved'}
                      </StatusBadge>
                      <span className="text-12 text-gray">
                        {longDate(complaint.raisedAt)}
                      </span>
                      <span className="text-12 text-gray">
                        {TOPIC_LABEL[complaint.topic]}
                      </span>
                      <span className="hidden text-12 text-gray sm:inline">
                        {complaint.raisedBy}
                      </span>
                    </span>
                  </span>

                  <HiArrowRight
                    aria-hidden="true"
                    className="shrink-0 text-18 text-gray"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Pagination page={current} pageCount={pageCount} onChange={setPage} />
      </Card>
    </>
  );
}
