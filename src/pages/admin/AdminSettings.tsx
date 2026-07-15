import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarOff, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RESTAURANT_ID } from '@/lib/demoData';
import { useDiningAreas } from '@/hooks/useDiningAreas';
import { fetchAllClosures, fetchOpeningHours } from '@/lib/openingHours';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateShort } from '@/utils/format';
import type { OpeningHour, RestaurantClosure } from '@/types/database';

const WEEKDAYS = [
  { value: 1, label: 'Lunedì' },
  { value: 2, label: 'Martedì' },
  { value: 3, label: 'Mercoledì' },
  { value: 4, label: 'Giovedì' },
  { value: 5, label: 'Venerdì' },
  { value: 6, label: 'Sabato' },
  { value: 0, label: 'Domenica' },
];

export function AdminSettings() {
  const { diningAreas } = useDiningAreas(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [closures, setClosures] = useState<RestaurantClosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDay, setNewDay] = useState('2');
  const [newStart, setNewStart] = useState('12:00');
  const [newEnd, setNewEnd] = useState('15:00');
  const [closureArea, setClosureArea] = useState('');
  const [closureStart, setClosureStart] = useState('');
  const [closureEnd, setClosureEnd] = useState('');
  const [closureReason, setClosureReason] = useState('Chiusura');

  useEffect(() => {
    if (diningAreas.length && !selectedArea) setSelectedArea(diningAreas[0].id);
  }, [diningAreas, selectedArea]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [hours, calendarClosures] = await Promise.all([fetchOpeningHours(), fetchAllClosures()]);
    setOpeningHours(hours);
    setClosures(calendarClosures);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const areaHours = openingHours
    .filter((item) => item.dining_area_id === selectedArea)
    .sort((a, b) => {
      const order = [1, 2, 3, 4, 5, 6, 0];
      return order.indexOf(a.weekday) - order.indexOf(b.weekday) ||
        a.start_time.localeCompare(b.start_time);
    });

  const addWindow = async () => {
    if (!selectedArea) return toast.error('Seleziona un’area sala');
    if (newEnd <= newStart) return toast.error('L\'orario di fine deve essere dopo l\'inizio');
    const { error } = await supabase.from('opening_hours').insert({
      restaurant_id: RESTAURANT_ID,
      dining_area_id: selectedArea,
      weekday: Number(newDay),
      start_time: newStart,
      end_time: newEnd,
    });
    if (error) return toast.error(error.message);
    toast.success('Fascia oraria aggiunta');
    await loadData();
  };

  const removeWindow = async (id: string) => {
    const { error } = await supabase.from('opening_hours').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setOpeningHours((prev) => prev.filter((item) => item.id !== id));
  };

  const addClosure = async () => {
    if (!closureStart || !closureEnd) return toast.error('Inserisci le date');
    if (closureEnd < closureStart) return toast.error('Data fine non valida');
    const { error } = await supabase.from('restaurant_closures').insert({
      restaurant_id: RESTAURANT_ID,
      dining_area_id: closureArea || null,
      start_date: closureStart,
      end_date: closureEnd,
      reason: closureReason || 'Chiusura',
    });
    if (error) return toast.error(error.message);
    toast.success('Chiusura aggiunta');
    setClosureStart('');
    setClosureEnd('');
    await loadData();
  };

  const removeClosure = async (id: string) => {
    const { error } = await supabase.from('restaurant_closures').delete().eq('id', id);
    if (error) return toast.error(error.message);
    setClosures((prev) => prev.filter((item) => item.id !== id));
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-serif text-3xl text-brand-900">Disponibilita e Chiusure</h1>
        <p className="mt-1 text-brand-500">Definisci orari prenotabili per area e blocchi calendario.</p>
      </div>

      <Card>
        <h2 className="heading-serif text-xl text-brand-900">Fasce disponibili per area sala</h2>
        <div className="mt-4 max-w-xs">
          <Select
            label="Area sala"
            value={selectedArea}
            onChange={(event) => setSelectedArea(event.target.value)}
            options={diningAreas.map((area) => ({ value: area.id, label: area.name }))}
          />
        </div>

        <div className="mt-6 space-y-2">
          {areaHours.length === 0 ? (
            <p className="text-sm text-brand-400">Nessuna fascia oraria impostata per questa area.</p>
          ) : (
            areaHours.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-2.5"
              >
                <span className="text-sm font-medium text-brand-800">
                  {WEEKDAYS.find((weekday) => weekday.value === item.weekday)?.label}
                </span>
                <span className="text-sm text-brand-600">
                  {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                </span>
                <button
                  onClick={() => removeWindow(item.id)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                  aria-label="Rimuovi fascia"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 grid gap-3 border-t border-brand-100 pt-5 sm:grid-cols-4">
          <Select
            label="Giorno"
            value={newDay}
            onChange={(event) => setNewDay(event.target.value)}
            options={WEEKDAYS.map((weekday) => ({ value: String(weekday.value), label: weekday.label }))}
          />
          <Input label="Dalle" type="time" value={newStart} onChange={(event) => setNewStart(event.target.value)} />
          <Input label="Alle" type="time" value={newEnd} onChange={(event) => setNewEnd(event.target.value)} />
          <div className="flex items-end">
            <Button fullWidth onClick={addWindow}>
              <Plus className="h-4 w-4" /> Aggiungi
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="heading-serif text-xl text-brand-900">Chiusure e blocchi calendario</h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-5">
          <Select
            label="Ambito"
            value={closureArea}
            onChange={(event) => setClosureArea(event.target.value)}
            placeholder="Intero ristorante"
            options={diningAreas.map((area) => ({ value: area.id, label: area.name }))}
          />
          <Input label="Dal" type="date" value={closureStart} onChange={(event) => setClosureStart(event.target.value)} />
          <Input label="Al" type="date" value={closureEnd} onChange={(event) => setClosureEnd(event.target.value)} />
          <Input label="Motivo" value={closureReason} onChange={(event) => setClosureReason(event.target.value)} />
          <div className="flex items-end">
            <Button fullWidth onClick={addClosure}>
              <Plus className="h-4 w-4" /> Aggiungi
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {closures.length === 0 ? (
            <EmptyState
              title="Nessuna chiusura programmata"
              icon={<CalendarOff className="h-7 w-7" />}
            />
          ) : (
            <div className="space-y-2">
              {closures.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-800">{item.reason}</p>
                    <p className="text-xs text-brand-500">
                      {formatDateShort(item.start_date)} - {formatDateShort(item.end_date)} ·{' '}
                      {item.dining_area_id
                        ? diningAreas.find((area) => area.id === item.dining_area_id)?.name ?? 'Area sala'
                        : 'Intero ristorante'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeClosure(item.id)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    aria-label="Rimuovi chiusura"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
