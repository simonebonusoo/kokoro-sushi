import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchCustomerReservations } from '@/lib/reservations';
import type { ReservationWithRelations } from '@/types/database';

export function useCustomerReservations() {
  const { session } = useAuth();
  const [reservations, setReservations] = useState<ReservationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!session) {
      setReservations([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchCustomerReservations(session.user.id);
      setReservations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento prenotazioni');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const now = Date.now();
  const upcoming = reservations.filter(
    (reservation) =>
      ['pending', 'confirmed'].includes(reservation.status) &&
      new Date(reservation.starts_at).getTime() >= now
  );
  const past = reservations.filter((reservation) => !upcoming.includes(reservation));

  return { reservations, upcoming, past, loading, error, refetch };
}
