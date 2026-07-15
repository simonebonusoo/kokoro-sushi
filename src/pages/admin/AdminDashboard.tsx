import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  MessageSquareText,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { fetchReservationsInRange } from '@/lib/reservations';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatTime } from '@/utils/format';
import type { ReservationWithRelations } from '@/types/database';

interface Stats {
  today: number;
  tomorrow: number;
  guestsToday: number;
  specialRequests: number;
  pending: number;
  confirmed: number;
  topArea: string;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayList, setTodayList] = useState<ReservationWithRelations[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const now = new Date();
      const from = startOfDay(now);
      const to = endOfDay(addDays(now, 1));
      const reservations = await fetchReservationsInRange(from.toISOString(), to.toISOString());

      const todayStart = startOfDay(now).getTime();
      const todayEnd = endOfDay(now).getTime();
      const tomorrowStart = startOfDay(addDays(now, 1)).getTime();
      const tomorrowEnd = endOfDay(addDays(now, 1)).getTime();
      const active = reservations.filter((reservation) => !['cancelled', 'rejected'].includes(reservation.status));
      const today = active.filter((reservation) => {
        const time = new Date(reservation.starts_at).getTime();
        return time >= todayStart && time <= todayEnd;
      });
      const tomorrow = active.filter((reservation) => {
        const time = new Date(reservation.starts_at).getTime();
        return time >= tomorrowStart && time <= tomorrowEnd;
      });

      const areaCounts = new Map<string, number>();
      active.forEach((reservation) => {
        const name = reservation.dining_area?.name ?? 'Interno';
        areaCounts.set(name, (areaCounts.get(name) ?? 0) + 1);
      });

      setStats({
        today: today.length,
        tomorrow: tomorrow.length,
        guestsToday: today.reduce((sum, reservation) => sum + (reservation.party_size ?? 0), 0),
        specialRequests: active.filter((reservation) => reservation.notes.trim().length > 0).length,
        pending: reservations.filter((reservation) => reservation.status === 'pending').length,
        confirmed: reservations.filter((reservation) => reservation.status === 'confirmed').length,
        topArea: [...areaCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—',
      });
      setTodayList(today.sort((a, b) => a.starts_at.localeCompare(b.starts_at)));
      setLoading(false);
    };
    void load();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-serif text-3xl text-brand-900">Dashboard ristorante</h1>
        <p className="mt-1 text-brand-500">Controlla prenotazioni, coperti e richieste speciali della sala.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Stat icon={CalendarDays} label="Prenotazioni oggi" value={stats?.today ?? 0} />
        <Stat icon={CalendarRange} label="Prenotazioni domani" value={stats?.tomorrow ?? 0} />
        <Stat icon={MessageSquareText} label="In attesa" value={stats?.pending ?? 0} />
        <Stat icon={CalendarDays} label="Confermate" value={stats?.confirmed ?? 0} />
        <Stat icon={Users} label="Coperti oggi" value={stats?.guestsToday ?? 0} />
        <Stat icon={MessageSquareText} label="Richieste speciali" value={stats?.specialRequests ?? 0} />
      </div>

      <Stat icon={UtensilsCrossed} label="Area piu richiesta" value={stats?.topArea ?? '—'} small />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading-serif text-xl text-brand-900">Prenotazioni di oggi</h2>
          <Link to="/admin/calendario">
            <Button variant="ghost" size="sm">
              Vedi calendario <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {todayList.length === 0 ? (
          <EmptyState title="Nessuna prenotazione oggi" />
        ) : (
          <Card padded={false} className="divide-y divide-brand-100">
            {todayList.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 text-center">
                    <p className="heading-serif text-lg text-brand-900">{formatTime(reservation.starts_at)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-brand-900">
                      {reservation.customer_name || reservation.customer?.full_name || reservation.customer?.email}
                    </p>
                    <p className="text-sm text-brand-500">
                      {reservation.dining_area?.name || 'Interno'} · {reservation.party_size} persone · {reservation.table?.name}
                    </p>
                  </div>
                </div>
                <StatusBadge status={reservation.status} />
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  small,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-brand-500">{label}</p>
        <p className={small ? 'truncate text-base font-semibold text-brand-900' : 'text-xl font-bold text-brand-900'}>
          {value}
        </p>
      </div>
    </Card>
  );
}
