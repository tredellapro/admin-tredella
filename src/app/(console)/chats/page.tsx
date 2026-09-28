'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import PageHeading from 'components/console/PageHeading';
import SampleDataNote from 'components/console/SampleDataNote';
import Card from 'components/ui/Card';
import Avatar from 'components/ui/Avatar';
import SearchInput from 'components/ui/SearchInput';
import FilterDropdown from 'components/ui/FilterDropdown';
import ChatThread from 'components/support/ChatThread';
import { CONVERSATIONS, type ThreadMessage } from 'data/support';

const KINDS = [
  { value: 'SELLER_ADMIN', label: 'Sellers' },
  { value: 'BUYER_ADMIN', label: 'Buyers' }
];

export default function ChatsPage() {
  const [activeId, setActiveId] = useState(CONVERSATIONS[0]?.id ?? '');
  const [term, setTerm] = useState('');
  const [kind, setKind] = useState<string | null>(null);
  /* Sent messages live here, keyed by conversation, so switching threads and
     coming back does not lose what was typed into the other one. */
  const [sent, setSent] = useState<Record<string, ThreadMessage[]>>({});
  /* Below lg the list and the thread share the screen, so one of them is
     showing at a time. */
  const [showingThread, setShowingThread] = useState(false);

  const list = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return CONVERSATIONS.filter(
      (conversation) =>
        (!kind || conversation.kind === kind) &&
        (needle.length === 0 ||
          conversation.party.toLowerCase().includes(needle))
    );
  }, [term, kind]);

  const active = CONVERSATIONS.find((c) => c.id === activeId);
  const messages = active
    ? [...active.messages, ...(sent[active.id] ?? [])]
    : [];

  const send = (text: string) => {
    if (!active) return;
    setSent((current) => {
      const mine = current[active.id] ?? [];
      return {
        ...current,
        [active.id]: [
          ...mine,
          {
            // index-derived, not random: a random id would differ between the
            // server pass and hydration
            id: `sent-${active.id}-${mine.length}`,
            author: 'You (Admin)',
            fromAdmin: true,
            sentAt: 'Just now',
            body: text
          }
        ]
      };
    });
  };

  return (
    <>
      <PageHeading title="Chats" trail={[{ label: 'Chats' }, { label: 'Chats' }]} />
      <SampleDataNote>
        Sample data. The API scopes an admin&rsquo;s conversations to ones
        assigned to them personally, and assigns new threads to whichever admin
        row comes back first — support needs a shared queue before this screen
        can use it.
      </SampleDataNote>

      <Card flush className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
          {/* ---- conversation list ---- */}
          <div
            className={`border-secondary/10 lg:border-r ${
              showingThread ? 'hidden lg:block' : ''
            }`}
          >
            <div className="flex flex-col gap-3 border-b border-secondary/8 p-4">
              <h2 className="text-16 font-semibold text-secondary">Chats</h2>
              <SearchInput
                value={term}
                onChange={setTerm}
                placeholder="Search"
                label="Search conversations"
              />
              <FilterDropdown
                label="All"
                options={KINDS}
                value={kind}
                onChange={setKind}
              />
            </div>

            <ul className="brand-scroll max-h-[540px] overflow-y-auto">
              {list.length === 0 && (
                <li className="px-4 py-10 text-center text-13 text-gray">
                  No conversations match.
                </li>
              )}

              {list.map((conversation) => {
                const selected = conversation.id === activeId;
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(conversation.id);
                        setShowingThread(true);
                      }}
                      className={`flex w-full items-center gap-3 border-b border-secondary/8 px-4 py-3 text-left transition-colors ${
                        selected ? 'bg-primary text-white' : 'hover:bg-background'
                      }`}
                    >
                      <span className="relative shrink-0">
                        <Avatar name={conversation.party} size={40} />
                        {conversation.online && (
                          <span
                            aria-label="Online"
                            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#1f9254]"
                          />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-13 font-medium ${
                              selected ? 'text-white' : 'text-secondary'
                            }`}
                          >
                            {conversation.party}
                          </span>
                          <span
                            className={`shrink-0 text-11 ${
                              selected ? 'text-white/80' : 'text-gray'
                            }`}
                          >
                            {conversation.lastAt}
                          </span>
                        </span>
                        <span
                          className={`mt-0.5 block truncate text-12 ${
                            selected ? 'text-white/80' : 'text-gray'
                          }`}
                        >
                          {conversation.kind === 'SELLER_ADMIN' ? 'Seller' : 'Buyer'}
                          {conversation.unread > 0 &&
                            ` · ${conversation.unread} unread`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ---- thread ---- */}
          <div
            className={`flex min-h-[560px] flex-col p-4 ${
              showingThread ? '' : 'hidden lg:flex'
            }`}
          >
            {active ? (
              <>
                <div className="flex items-center gap-3 border-b border-secondary/8 pb-3">
                  <button
                    type="button"
                    onClick={() => setShowingThread(false)}
                    aria-label="Back to conversations"
                    className="rounded-lg p-1.5 text-18 text-secondary transition-colors hover:text-primary lg:hidden"
                  >
                    <HiArrowLeft />
                  </button>

                  <Avatar name={active.party} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-14 font-medium text-secondary">
                      {active.party}
                    </p>
                    <p className="text-12 text-gray">
                      {active.online ? 'Active Now' : 'Offline'}
                    </p>
                  </div>

                  {active.storeId && (
                    <Link
                      href={`/stores/${active.storeId}`}
                      className="shrink-0 text-13 font-medium text-primary hover:underline"
                    >
                      Open store
                    </Link>
                  )}
                </div>

                <ChatThread messages={messages} onSend={send} variant="bubbles" />
              </>
            ) : (
              <p className="m-auto text-13 text-gray">
                Pick a conversation to read it.
              </p>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
