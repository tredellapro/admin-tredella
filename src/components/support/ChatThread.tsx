'use client';

import { useEffect, useRef, useState } from 'react';
import {
  HiOutlineDocumentText,
  HiOutlinePaperClip,
  HiOutlinePhotograph,
  HiPaperAirplane
} from 'react-icons/hi';
import Avatar from 'components/ui/Avatar';
import type { ThreadMessage } from 'data/support';

interface ChatThreadProps {
  messages: ThreadMessage[];
  onSend: (_text: string) => void;
  /**
   * `transcript` is the complaint view: every message left-aligned under a
   * name and time, which reads as a record. `bubbles` is the live chat: the
   * admin's own messages on the right, which reads as a conversation.
   */
  variant?: 'transcript' | 'bubbles';
  /** Disables the composer, e.g. once a complaint is closed. */
  closed?: boolean;
  closedNote?: string;
}

const Attachment = ({
  attachment
}: {
  attachment: NonNullable<ThreadMessage['attachment']>;
}) => (
  <span className="mt-2 flex w-fit items-center gap-2 rounded-lg bg-primary px-3 py-2 text-white">
    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-16">
      {attachment.kind === 'PDF' ? (
        <HiOutlineDocumentText aria-hidden="true" />
      ) : (
        <HiOutlinePhotograph aria-hidden="true" />
      )}
    </span>
    <span className="min-w-0">
      <span className="block truncate text-12 font-medium">{attachment.name}</span>
      <span className="block text-11 text-white/80">{attachment.size}</span>
    </span>
  </span>
);

export default function ChatThread({
  messages,
  onSend,
  variant = 'bubbles',
  closed = false,
  closedNote
}: ChatThreadProps) {
  const [draft, setDraft] = useState('');
  const endOfList = useRef<HTMLDivElement>(null);

  /* Jump to the newest message when one arrives. `block: 'nearest'` so the
     surrounding page does not also scroll on first paint. */
  useEffect(() => {
    endOfList.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="brand-scroll flex-1 overflow-y-auto px-1 py-2">
        <ul className="flex flex-col gap-5">
          {messages.map((message) =>
            variant === 'transcript' ? (
              <li key={message.id} className="flex gap-3">
                <Avatar name={message.author} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-3 text-14 font-medium text-secondary">
                    {message.author}
                    <span className="text-11 font-normal text-gray">
                      {message.sentAt}
                    </span>
                  </p>
                  <div
                    className={`mt-1.5 rounded-lg px-4 py-3 text-13 leading-relaxed ${
                      message.fromAdmin
                        ? 'bg-secondary/[0.06] text-secondary'
                        : 'border border-secondary/10 bg-white text-gray'
                    }`}
                  >
                    {message.body}
                    {message.attachment && (
                      <Attachment attachment={message.attachment} />
                    )}
                  </div>
                </div>
              </li>
            ) : (
              <li
                key={message.id}
                className={`flex max-w-full gap-2.5 ${
                  message.fromAdmin ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar name={message.author} size={32} />
                <div
                  className={`flex min-w-0 max-w-[75%] flex-col ${
                    message.fromAdmin ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-13 leading-relaxed ${
                      message.fromAdmin
                        ? 'rounded-br-sm bg-primary text-white'
                        : 'rounded-bl-sm bg-secondary/[0.06] text-secondary'
                    }`}
                  >
                    {message.body}
                  </div>
                  {message.attachment && (
                    <Attachment attachment={message.attachment} />
                  )}
                  <span className="mt-1 text-11 text-gray">{message.sentAt}</span>
                </div>
              </li>
            )
          )}
        </ul>
        <div ref={endOfList} />
      </div>

      {closed ? (
        <p className="mt-4 rounded-xl bg-secondary/[0.04] px-4 py-3 text-center text-12 text-gray">
          {closedNote ?? 'This conversation is closed.'}
        </p>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-secondary/15 bg-white px-3 py-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Type message..."
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-14 text-secondary outline-none placeholder:text-gray/70"
          />

          <button
            type="button"
            aria-label="Attach a file"
            className="rounded-full p-2 text-18 text-gray transition-colors hover:bg-primary/8 hover:text-primary"
          >
            <HiOutlinePaperClip />
          </button>

          <button
            type="button"
            onClick={send}
            disabled={draft.trim().length === 0}
            aria-label="Send"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-16 text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HiPaperAirplane className="rotate-90" />
          </button>
        </div>
      )}
    </div>
  );
}
