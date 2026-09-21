import type { ReactNode } from 'react';

export type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

const TONES: Record<Tone, string> = {
  success: 'bg-[#e7f7ee] text-[#1f9254]',
  danger: 'bg-primary/10 text-primary',
  warning: 'bg-[#fdf3dd] text-[#b07d17]',
  info: 'bg-[#e6f1fd] text-[#2563a8]',
  neutral: 'bg-secondary/8 text-gray'
};

/* Every status word in the console shares one vocabulary of tones, so a green
   pill means the same thing on Orders as it does on Stores. */
const KNOWN: Record<string, Tone> = {
  ACTIVE: 'success',
  APPROVED: 'success',
  DELIVERED: 'success',
  COMPLETED: 'success',
  PAID: 'success',
  INACTIVE: 'neutral',
  UNLISTED: 'neutral',
  DRAFT: 'neutral',
  PENDING: 'warning',
  AWAITING_REVIEW: 'warning',
  ON_HOLD: 'warning',
  SHIPPED: 'info',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  CANCELLED: 'danger',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
  REFUNDED: 'danger'
};

export const toneFor = (status: string): Tone =>
  KNOWN[status.toUpperCase().replace(/[\s-]/g, '_')] ?? 'neutral';

interface StatusBadgeProps {
  children: ReactNode;
  /** Overrides the tone looked up from the label. */
  tone?: Tone;
  /** The raw status when the visible label is worded differently. */
  status?: string;
}

export default function StatusBadge({ children, tone, status }: StatusBadgeProps) {
  const resolved =
    tone ?? toneFor(status ?? (typeof children === 'string' ? children : ''));

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-12 font-medium ${TONES[resolved]}`}
    >
      {children}
    </span>
  );
}
