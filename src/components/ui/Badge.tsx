import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import type { ReservationStatus } from '@/types/database';

const tones = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-brand-200 text-brand-800',
  no_show: 'bg-zinc-200 text-zinc-800',
  neutral: 'bg-brand-100 text-brand-700',
  accent: 'bg-accent-500/20 text-brand-800',
};

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

const statusLabels: Record<ReservationStatus, { label: string; tone: keyof typeof tones }> = {
  pending: { label: 'In attesa', tone: 'pending' },
  confirmed: { label: 'Confermato', tone: 'confirmed' },
  rejected: { label: 'Rifiutato', tone: 'rejected' },
  cancelled: { label: 'Cancellato', tone: 'cancelled' },
  completed: { label: 'Completato', tone: 'completed' },
  no_show: { label: 'No-show', tone: 'no_show' },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const { label, tone } = statusLabels[status];
  return <Badge tone={tone}>{label}</Badge>;
}
