'use client';

import { useState } from 'react';
import Link from 'next/link';
import DetailHeader from 'components/console/DetailHeader';
import Card, { CardTitle } from 'components/ui/Card';
import StatusBadge from 'components/ui/StatusBadge';
import Modal from 'components/ui/Modal';
import Button from 'components/ui/Button';
import ChatThread from './ChatThread';
import { TOPIC_LABEL, complaintById, type ThreadMessage } from 'data/support';
import { storeById } from 'data/stores';
import { longDate } from 'lib/format';

export default function ComplaintDetailView({ id }: { id: string }) {
  const complaint = complaintById(id);

  const [messages, setMessages] = useState<ThreadMessage[]>(
    () => complaint?.messages ?? []
  );
  const [solved, setSolved] = useState(complaint?.state === 'SOLVED');
  const [confirming, setConfirming] = useState(false);

  if (!complaint) return null;

  const store = complaint.storeId ? storeById(complaint.storeId) : undefined;

  const send = (text: string) =>
    setMessages((current) => [
      ...current,
      {
        /* Index-derived id, not a random one: this component renders on the
           server first and a random id would differ between the two passes. */
        id: `sent-${current.length}`,
        author: 'You (Admin)',
        fromAdmin: true,
        sentAt: 'Just now',
        body: text
      }
    ]);

  return (
    <>
      <DetailHeader
        title="Complaint Support"
        subtitle={`${complaint.id} · ${TOPIC_LABEL[complaint.topic]}`}
        backTo="/complaints"
        actions={
          solved ? (
            <button
              type="button"
              onClick={() => setSolved(false)}
              className="rounded-lg border border-secondary/20 bg-white px-4 py-2.5 text-13 font-medium text-secondary transition-colors hover:border-primary/40 hover:text-primary"
            >
              Reopen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-primary/40 bg-white px-4 py-2.5 text-13 font-medium text-primary transition-colors hover:bg-primary/8"
            >
              End Conversation
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="flex min-h-[520px] flex-col xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary/8 px-1 pb-3">
            <h2 className="text-15 font-semibold text-secondary">
              {complaint.subject}
            </h2>
            <div className="flex items-center gap-2">
              <StatusBadge
                tone={complaint.priority === 'URGENT' ? 'danger' : 'neutral'}
              >
                {complaint.priority === 'URGENT' ? 'Urgent' : 'Normal'}
              </StatusBadge>
              <StatusBadge tone={solved ? 'info' : 'success'}>
                {solved ? 'Solved' : 'Open'}
              </StatusBadge>
            </div>
          </div>

          <ChatThread
            messages={messages}
            onSend={send}
            variant="transcript"
            closed={solved}
            closedNote="This complaint is marked solved. Reopen it to reply again."
          />
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle>Raised by</CardTitle>
            <dl className="flex flex-col gap-3 px-1">
              <div>
                <dt className="text-12 text-gray">Name</dt>
                <dd className="mt-0.5 text-14 text-secondary">
                  {complaint.raisedBy}
                </dd>
              </div>
              <div>
                <dt className="text-12 text-gray">Email</dt>
                <dd className="mt-0.5 break-words text-14 text-secondary">
                  {complaint.raisedByEmail}
                </dd>
              </div>
              <div>
                <dt className="text-12 text-gray">Raised</dt>
                <dd className="mt-0.5 text-14 text-secondary">
                  {longDate(complaint.raisedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-12 text-gray">Topic</dt>
                <dd className="mt-0.5 text-14 text-secondary">
                  {TOPIC_LABEL[complaint.topic]}
                </dd>
              </div>
            </dl>
          </Card>

          {(store || complaint.orderId) && (
            <Card>
              <CardTitle>Related</CardTitle>
              <ul className="flex flex-col gap-2 px-1">
                {store && (
                  <li>
                    <Link
                      href={`/stores/${store.id}`}
                      className="text-13 font-medium text-primary hover:underline"
                    >
                      Open {store.name}
                    </Link>
                  </li>
                )}
                {complaint.orderId && (
                  <li>
                    <Link
                      href={`/orders/${complaint.orderId}`}
                      className="text-13 font-medium text-primary hover:underline"
                    >
                      Order #{complaint.orderId}
                    </Link>
                  </li>
                )}
              </ul>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="End conversation"
        width="sm"
      >
        <p className="text-13 leading-relaxed text-gray">
          This moves the complaint to Solved and closes the reply box. Nothing
          is deleted — the transcript stays, and you can reopen it if they come
          back about the same thing.
        </p>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={() => {
              setSolved(true);
              setConfirming(false);
            }}
          >
            Mark solved
          </Button>
        </div>
      </Modal>
    </>
  );
}
