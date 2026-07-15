import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, ChevronLeft, Clock, MapPinned, Users } from 'lucide-react';
import { clsx } from 'clsx';

import { useAuth } from '@/context/AuthContext';
import { useDiningAreas } from '@/hooks/useDiningAreas';
import { useRestaurantTables } from '@/hooks/useRestaurantTables';
import { Calendar } from '@/components/Calendar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

import { computeAvailableSlots, bookingDateBounds, type TimeSlot } from '@/utils/availability';
import { fetchOpeningHours, fetchClosuresForDate } from '@/lib/openingHours';
import { fetchDayActiveReservations, createReservation } from '@/lib/reservations';
import { formatDate, formatTime } from '@/utils/format';
import { restaurantConfig } from '@/config/restaurantConfig';
import { analytics } from '@/lib/analytics';

const steps = ['Dati', 'Orario', 'Conferma'];

export function Booking() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const { diningAreas, loading: loadingAreas } = useDiningAreas();
  const { tables, loading: loadingTables } = useRestaurantTables();

  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date | null>(null);
  const [diningAreaId, setDiningAreaId] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    id: string;
    name: string;
    date: string;
    time: string;
    partySize: number;
    area: string;
    table: string;
  } | null>(null);

  const { min, max } = bookingDateBounds();

  useEffect(() => {
    const [firstName, ...rest] = (profile?.full_name ?? '').split(' ').filter(Boolean);
    setContactName(firstName ?? '');
    setContactLastName(rest.join(' '));
    setContactPhone(profile?.phone ?? '');
    setContactEmail(profile?.email ?? session?.user.email ?? '');
  }, [profile, session]);

  useEffect(() => {
    if (!diningAreaId && diningAreas.length > 0) setDiningAreaId(diningAreas[0].id);
  }, [diningAreaId, diningAreas]);

  const selectedArea = useMemo(
    () => diningAreas.find((area) => area.id === diningAreaId) ?? null,
    [diningAreaId, diningAreas]
  );

  const availableTables = useMemo(
    () =>
      tables.filter(
        (table) =>
          table.active &&
          table.dining_area_id === diningAreaId &&
          table.seats_min <= partySize &&
          table.seats_max >= partySize
      ),
    [tables, diningAreaId, partySize]
  );

  const loadSlots = useCallback(async () => {
    if (!date || availableTables.length === 0) return;
    setLoadingSlots(true);
    setSlot(null);
    try {
      const areaIds = Array.from(new Set(availableTables.map((table) => table.dining_area_id)));
      const [openingHours, closures, reservations] = await Promise.all([
        fetchOpeningHours(areaIds),
        fetchClosuresForDate(date),
        fetchDayActiveReservations(date),
      ]);
      const computed = computeAvailableSlots({
        date,
        reservationDuration: restaurantConfig.booking.defaultReservationDurationMinutes,
        tables: availableTables,
        openingHours,
        reservations,
        closures,
      });
      setSlots(computed);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Errore nel calcolo disponibilita');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [availableTables, date]);

  useEffect(() => {
    if (step === 1 && date) void loadSlots();
  }, [step, date, loadSlots]);

  const handleConfirm = async () => {
    if (!slot || !contactName.trim() || !contactLastName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      toast.error('Compila tutti i dati richiesti');
      return;
    }
    if (!privacyAccepted) {
      toast.error('Accetta la privacy per inviare la richiesta');
      return;
    }
    if (!session) {
      toast('Accedi per confermare la prenotazione del tavolo');
      navigate('/login', { state: { from: '/prenota' } });
      return;
    }
    setSubmitting(true);
    try {
      const created = await createReservation({
        customerId: session.user.id,
        diningAreaId: slot.diningAreaId,
        tableId: slot.tableId,
        startsAt: slot.start,
        endsAt: slot.end,
        partySize,
        customerName: `${contactName.trim()} ${contactLastName.trim()}`,
        customerPhone: contactPhone.trim(),
        customerEmail: contactEmail.trim(),
        notes,
        createdBy: session.user.id,
      });
      const confirmedTable = tables.find((table) => table.id === slot.tableId);
      const confirmedArea = diningAreas.find((area) => area.id === slot.diningAreaId);
      setConfirmation({
        id: created.id,
        name: `${contactName.trim()} ${contactLastName.trim()}`,
        date: formatDate(slot.start),
        time: formatTime(slot.start),
        partySize,
        area: confirmedArea?.name ?? 'Ristorante',
        table: confirmedTable?.name ?? 'Tavolo',
      });
      analytics.prenotazioneCompletata({
        area: confirmedArea?.name ?? 'Ristorante',
        persone: partySize,
      });
      toast.success('Richiesta di prenotazione ricevuta');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Errore durante la prenotazione');
      setStep(1);
      void loadSlots();
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTable = slot ? tables.find((table) => table.id === slot.tableId) : null;
  const canContinueDetails =
    Boolean(date) &&
    partySize >= restaurantConfig.booking.minPartySize &&
    partySize <= restaurantConfig.booking.maxPartySize &&
    Boolean(diningAreaId) &&
    availableTables.length > 0 &&
    contactName &&
    contactLastName &&
    contactPhone &&
    contactEmail &&
    privacyAccepted;

  if (confirmation) {
    return (
      <div className="container-page section">
        <Card className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="h-6 w-6" />
          </span>
          <h1 className="heading-serif mt-5 text-4xl text-brand-900">Richiesta ricevuta</h1>
          <p className="mt-3 text-brand-500">
            La tua richiesta di prenotazione e stata ricevuta. Riceverai conferma dal ristorante.
          </p>
          <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            <Summary label="Riferimento" value={confirmation.id.slice(0, 8).toUpperCase()} />
            <Summary label="Nome" value={confirmation.name} />
            <Summary label="Data" value={confirmation.date} />
            <Summary label="Orario" value={confirmation.time} />
            <Summary label="Persone" value={`${confirmation.partySize}`} />
            <Summary label="Area" value={confirmation.area} />
            <Summary label="Tavolo" value={confirmation.table} />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => navigate('/dashboard/prenotazioni')}>Vedi prenotazioni</Button>
            <Button variant="outline" onClick={() => setConfirmation(null)}>Nuova richiesta</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-page section">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-600">
            Prenotazione tavolo
          </span>
          <h1 className="heading-serif mt-3 text-5xl text-brand-900">Riserva il tuo tavolo da Kokoro</h1>
          <p className="mt-4 text-lg leading-8 text-brand-500">{restaurantConfig.bookingNotice}</p>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-between">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={clsx(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition',
                    i < step && 'bg-brand-900 text-white',
                    i === step && 'bg-accent-500 text-white ring-4 ring-accent-500/20',
                    i > step && 'bg-brand-100 text-brand-400'
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="mt-1.5 hidden text-xs font-medium text-brand-500 sm:block">
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={clsx('mx-2 h-0.5 flex-1', i < step ? 'bg-brand-900' : 'bg-brand-100')} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10">
          {step === 0 && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
              <Calendar value={date} onChange={setDate} minDate={min} maxDate={max} />
              <Card>
                <h2 className="heading-serif text-2xl text-brand-900">Dati prenotazione</h2>
                <p className="mt-2 text-sm text-brand-500">
                  Scegli il giorno, indica quante persone sarete e seleziona l’area del ristorante.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Numero persone"
                    type="number"
                    min={restaurantConfig.booking.minPartySize}
                    max={restaurantConfig.booking.maxPartySize}
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                  />
                  <div>
                    <label className="label-base">Area sala</label>
                    <div className="grid grid-cols-2 gap-2">
                      {diningAreas.map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => setDiningAreaId(area.id)}
                          className={clsx(
                            'rounded-xl border px-4 py-3 text-sm font-medium transition',
                            diningAreaId === area.id
                              ? 'border-brand-900 bg-brand-900 text-white'
                              : 'border-brand-200 bg-white text-brand-700 hover:border-brand-400'
                          )}
                        >
                          {area.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nome"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                  <Input
                    label="Cognome"
                    value={contactLastName}
                    onChange={(e) => setContactLastName(e.target.value)}
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Telefono"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label="Note"
                    value={notes}
                    placeholder="Allergie, seggiolone, ricorrenze o richieste di sala"
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {partySize > restaurantConfig.booking.maxPartySize && (
                  <p className="mt-4 rounded-xl bg-accent-500/10 px-4 py-3 text-sm text-brand-700">
                    Per gruppi superiori a {restaurantConfig.booking.maxPartySize} persone chiama il ristorante al {restaurantConfig.contact.phone}.
                  </p>
                )}

                <label className="mt-5 flex items-start gap-3 text-sm text-brand-600">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-brand-300"
                  />
                  <span>
                    Accetto l’uso dei dati per gestire la richiesta di prenotazione.
                  </span>
                </label>

                <div className="mt-6 flex justify-end">
                  <Button disabled={!canContinueDetails || loadingAreas || loadingTables} onClick={() => setStep(1)}>
                    Continua
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
              <Card className="h-fit">
                <button
                  type="button"
                  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-900"
                  onClick={() => setStep(0)}
                >
                  <ChevronLeft className="h-4 w-4" /> Modifica dati
                </button>
                <h2 className="heading-serif text-2xl text-brand-900">Riepilogo</h2>
                <div className="mt-5 space-y-3 text-sm text-brand-600">
                  <p className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-accent-600" />
                    {selectedArea?.name ?? 'Area sala'}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent-600" />
                    {partySize} persone
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent-600" />
                    {date ? formatDate(date.toISOString()) : 'Seleziona una data'}
                  </p>
                </div>
              </Card>

              <Card>
                <h3 className="heading-serif text-2xl text-brand-900">
                  {date ? `Orari disponibili - ${formatDate(date.toISOString())}` : 'Seleziona una data'}
                </h3>
                <p className="mt-2 text-sm text-brand-500">
                  Gli slot vengono calcolati in base ai tavoli disponibili per l’area {selectedArea?.name.toLowerCase() ?? 'selezionata'}.
                </p>
                {loadingAreas || loadingTables ? (
                  <LoadingState label="Preparazione disponibilita..." />
                ) : !date ? (
                  <EmptyState title="Scegli una data" description="Usa il calendario nel passaggio precedente." />
                ) : loadingSlots ? (
                  <LoadingState label="Calcolo disponibilita..." />
                ) : slots.length === 0 ? (
                  <EmptyState title="Nessuno slot disponibile" description="Prova un altro giorno o cambia area." />
                ) : (
                  <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((s) => (
                      <button
                        key={`${s.label}-${s.tableId}`}
                        onClick={() => setSlot(s)}
                        className={clsx(
                          'rounded-xl border py-3 text-sm font-medium transition',
                          slot?.label === s.label && slot?.tableId === s.tableId
                            ? 'border-brand-900 bg-brand-900 text-white'
                            : 'border-brand-200 bg-white text-brand-700 hover:border-brand-400'
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button disabled={!slot} onClick={() => setStep(2)}>
                    Conferma dati
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {step === 2 && slot && date && (
            <Card className="mx-auto max-w-2xl">
              <h2 className="heading-serif text-3xl text-brand-900">Controlla la prenotazione</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Summary label="Data" value={formatDate(slot.start)} />
                <Summary label="Orario" value={formatTime(slot.start)} />
                <Summary label="Area" value={selectedArea?.name ?? 'Ristorante'} />
                <Summary label="Persone" value={`${partySize}`} />
                <Summary label="Nome" value={contactName} />
                <Summary label="Telefono" value={contactPhone} />
                <Summary label="Email" value={contactEmail} />
                <Summary label="Tavolo assegnato" value={selectedTable?.name ?? 'Tavolo'} />
              </div>
              {notes && (
                <div className="mt-5 rounded-2xl bg-brand-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">Note</p>
                  <p className="mt-2 text-sm text-brand-700">{notes}</p>
                </div>
              )}
              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Torna indietro
                </Button>
                <Button loading={submitting} onClick={handleConfirm}>
                  Conferma prenotazione
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">{label}</p>
      <p className="mt-2 font-medium text-brand-900">{value}</p>
    </div>
  );
}
