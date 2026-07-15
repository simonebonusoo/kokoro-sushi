import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { addDays, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { clsx } from 'clsx';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useDiningAreas } from '@/hooks/useDiningAreas';
import { useRestaurantTables } from '@/hooks/useRestaurantTables';
import {
  cancelReservation,
  createReservation,
  fetchReservationsInRange,
  updateReservationStatus,
} from '@/lib/reservations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatTime } from '@/utils/format';
import { restaurantConfig } from '@/config/restaurantConfig';
import type { Profile, ReservationStatus, ReservationWithRelations, RestaurantTable } from '@/types/database';

export function AdminCalendar() {
  const { profile } = useAuth();
  const { diningAreas } = useDiningAreas(false);
  const { tables } = useRestaurantTables(false);
  const [day, setDay] = useState<Date>(new Date());
  const [reservations, setReservations] = useState<ReservationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detail, setDetail] = useState<ReservationWithRelations | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    try {
      const data = await fetchReservationsInRange(start.toISOString(), end.toISOString());
      setReservations(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore caricamento');
    } finally {
      setLoading(false);
    }
  }, [day]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () =>
      reservations.filter(
        (reservation) =>
          (areaFilter === 'all' || reservation.dining_area_id === areaFilter) &&
          (statusFilter === 'all' || reservation.status === statusFilter)
      ),
    [reservations, areaFilter, statusFilter]
  );

  const handleCancel = async (reservation: ReservationWithRelations) => {
    try {
      await cancelReservation(reservation.id);
      toast.success('Prenotazione cancellata');
      setDetail(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore');
    }
  };

  const handleStatus = async (reservation: ReservationWithRelations, status: ReservationStatus) => {
    try {
      await updateReservationStatus(reservation.id, status);
      toast.success('Stato aggiornato');
      setDetail(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="heading-serif text-3xl text-brand-900">Calendario prenotazioni</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Nuova prenotazione
        </Button>
      </div>

      <Card className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDay((current) => addDays(current, -1))}
            className="rounded-lg p-2 text-brand-600 hover:bg-brand-100"
            aria-label="Giorno precedente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 rounded-xl bg-brand-100 px-3 py-2">
            <CalendarDays className="h-4 w-4 text-brand-500" />
            <span className="text-sm font-medium capitalize text-brand-900">
              {format(day, 'EEEE d MMMM yyyy', { locale: it })}
            </span>
          </div>
          <button
            onClick={() => setDay((current) => addDays(current, 1))}
            className="rounded-lg p-2 text-brand-600 hover:bg-brand-100"
            aria-label="Giorno successivo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <Button variant="ghost" size="sm" onClick={() => setDay(new Date())}>
            Oggi
          </Button>
        </div>

        <div className="ml-auto flex flex-wrap gap-3">
          <Select
            aria-label="Filtra per area"
            value={areaFilter}
            onChange={(event) => setAreaFilter(event.target.value)}
            options={[
              { value: 'all', label: 'Tutte le aree' },
              ...diningAreas.map((area) => ({ value: area.id, label: area.name })),
            ]}
          />
          <Select
            aria-label="Filtra per stato"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: 'all', label: 'Tutti gli stati' },
              { value: 'pending', label: 'In attesa' },
              { value: 'confirmed', label: 'Confermati' },
              { value: 'rejected', label: 'Rifiutati' },
              { value: 'completed', label: 'Completati' },
              { value: 'no_show', label: 'No-show' },
              { value: 'cancelled', label: 'Cancellati' },
            ]}
          />
        </div>
      </Card>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nessuna prenotazione" description="Per questo giorno e filtri." />
      ) : (
        <div className="space-y-3">
          {filtered.map((reservation) => (
            <button
              key={reservation.id}
              onClick={() => setDetail(reservation)}
              className={clsx(
                'flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-card transition hover:border-brand-300',
                reservation.status === 'cancelled' ? 'border-red-100 opacity-70' : 'border-brand-100'
              )}
            >
              <div className="w-16 shrink-0 text-center">
                <p className="heading-serif text-lg text-brand-900">{formatTime(reservation.starts_at)}</p>
                <p className="text-xs text-brand-400">- {formatTime(reservation.ends_at)}</p>
              </div>
              <div className="flex-1 border-l border-brand-100 pl-4">
                <p className="font-semibold text-brand-900">
                  {reservation.customer_name || reservation.customer?.full_name || reservation.customer?.email}
                </p>
                <p className="text-sm text-brand-500">
                  {reservation.dining_area?.name || 'Area sala'} · {reservation.party_size} persone · {reservation.table?.name}
                </p>
              </div>
              <StatusBadge status={reservation.status} />
            </button>
          ))}
        </div>
      )}

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Scheda prenotazione">
        {detail && (
          <div className="space-y-4">
            <DetailRow label="Cliente" value={detail.customer_name || detail.customer?.full_name || detail.customer?.email || '-'} />
            <DetailRow label="Telefono" value={detail.customer_phone || detail.customer?.phone || '-'} />
            <DetailRow label="Email" value={detail.customer_email || detail.customer?.email || '-'} />
            <DetailRow label="Area" value={detail.dining_area?.name || '-'} />
            <DetailRow label="Tavolo" value={detail.table?.name ?? '-'} />
            <DetailRow label="Persone" value={`${detail.party_size}`} />
            <DetailRow label="Orario" value={`${formatTime(detail.starts_at)} - ${formatTime(detail.ends_at)}`} />
            <DetailRow label="Stato" value={<StatusBadge status={detail.status} />} />
            {detail.notes && <DetailRow label="Note" value={detail.notes} />}

            {detail.status !== 'cancelled' && detail.status !== 'rejected' && (
              <div className="flex flex-wrap justify-end gap-2 border-t border-brand-100 pt-4">
                {detail.status === 'pending' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleStatus(detail, 'confirmed')}>
                      Conferma
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleStatus(detail, 'rejected')}>
                      Rifiuta
                    </Button>
                  </>
                )}
                {detail.status === 'confirmed' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleStatus(detail, 'completed')}>
                      Completa
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleStatus(detail, 'no_show')}>
                      No-show
                    </Button>
                  </>
                )}
                <Button variant="danger" size="sm" onClick={() => handleCancel(detail)}>
                  Cancella
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <CreateReservationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        defaultDate={day}
        tables={tables.filter((table) => table.active)}
        adminId={profile?.id ?? ''}
        onCreated={async () => {
          setCreateOpen(false);
          await load();
        }}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-brand-500">{label}</span>
      <span className="text-sm font-medium text-brand-900">{value}</span>
    </div>
  );
}

function CreateReservationModal({
  open,
  onClose,
  defaultDate,
  tables,
  adminId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: Date;
  tables: RestaurantTable[];
  adminId: string;
  onCreated: () => void;
}) {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [tableId, setTableId] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState(format(defaultDate, 'yyyy-MM-dd'));
  const [time, setTime] = useState('19:00');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(format(defaultDate, 'yyyy-MM-dd'));
    supabase
      .from('profiles')
      .select('*')
      .order('full_name')
      .then(({ data }) => setCustomers((data ?? []) as Profile[]));
  }, [open, defaultDate]);

  useEffect(() => {
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) return;
    setCustomerName(customer.full_name || '');
    setCustomerPhone(customer.phone || '');
    setCustomerEmail(customer.email || '');
  }, [customerId, customers]);

  const submit = async () => {
    const table = tables.find((item) => item.id === tableId);
    if (!customerId || !table || !customerName || !customerPhone || !customerEmail) {
      toast.error('Compila tutti i campi');
      return;
    }
    const starts = new Date(`${date}T${time}:00`);
    const ends = new Date(starts.getTime() + restaurantConfig.booking.defaultReservationDurationMinutes * 60000);
    setSubmitting(true);
    try {
      await createReservation({
        customerId,
        diningAreaId: table.dining_area_id,
        tableId,
        startsAt: starts.toISOString(),
        endsAt: ends.toISOString(),
        partySize,
        customerName,
        customerPhone,
        customerEmail,
        notes,
        createdBy: adminId,
      });
      toast.success('Prenotazione creata');
      onCreated();
      setCustomerId('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setTableId('');
      setPartySize(2);
      setNotes('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuova prenotazione" size="md">
      <div className="space-y-4">
        <Select
          label="Cliente registrato"
          placeholder="Seleziona cliente"
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          options={customers.map((customer) => ({ value: customer.id, label: customer.full_name || customer.email }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nome" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          <Input label="Telefono" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
        </div>
        <Input label="Email" type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
        <Select
          label="Tavolo"
          placeholder="Seleziona tavolo"
          value={tableId}
          onChange={(event) => setTableId(event.target.value)}
          options={tables.map((table) => ({ value: table.id, label: `${table.name} · ${table.dining_area?.name ?? 'Area sala'}` }))}
        />
        <div className="grid grid-cols-3 gap-4">
          <Input label="Data" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Input label="Ora" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          <Input label="Persone" type="number" min={1} max={12} value={partySize} onChange={(event) => setPartySize(Number(event.target.value))} />
        </div>
        <Input label="Note" value={notes} onChange={(event) => setNotes(event.target.value)} />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Annulla
          </Button>
          <Button loading={submitting} onClick={submit}>
            Crea prenotazione
          </Button>
        </div>
      </div>
    </Modal>
  );
}
