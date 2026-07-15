import { Calendar, Clock, MapPinned, User, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatTime } from '@/utils/format';
import { canCancelReservation } from '@/utils/availability';
import type { ReservationWithRelations } from '@/types/database';

interface ReservationCardProps {
  reservation: ReservationWithRelations;
  onCancel?: (reservation: ReservationWithRelations) => void;
  showCustomer?: boolean;
}

export function ReservationCard({ reservation, onCancel, showCustomer }: ReservationCardProps) {
  const { dining_area, table, customer, status, starts_at } = reservation;
  const cancellable =
    ['pending', 'confirmed'].includes(status) && Boolean(onCancel) && canCancelReservation(starts_at);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="heading-serif text-lg text-brand-900">
            {table?.name ?? 'Tavolo'} · {dining_area?.name ?? 'Ristorante'}
          </h3>
          {showCustomer && (reservation.customer_name || customer) && (
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-brand-500">
              <User className="h-3.5 w-3.5" />
              {reservation.customer_name || customer?.full_name || customer?.email}
            </p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-brand-600">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-brand-400" />
          {formatDate(starts_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-brand-400" />
          {formatTime(starts_at)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPinned className="h-4 w-4 text-brand-400" />
          {dining_area?.name ?? 'Area sala'}
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-brand-800">
          <Users className="h-4 w-4 text-brand-400" />
          {reservation.party_size} persone
        </span>
      </div>

      {cancellable && (
        <div className="mt-4 border-t border-brand-100 pt-4">
          <Button variant="outline" size="sm" onClick={() => onCancel?.(reservation)}>
            Disdici prenotazione
          </Button>
        </div>
      )}
      {['pending', 'confirmed'].includes(status) && onCancel && !cancellable && (
        <p className="mt-3 text-xs text-brand-400">
          Non disdicibile online a ridosso dell’orario. Contatta il ristorante.
        </p>
      )}
    </Card>
  );
}
