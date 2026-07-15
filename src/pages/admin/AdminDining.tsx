import { useState } from 'react';
import toast from 'react-hot-toast';
import { EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RESTAURANT_ID } from '@/lib/demoData';
import { useDiningAreas } from '@/hooks/useDiningAreas';
import { useRestaurantTables } from '@/hooks/useRestaurantTables';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { RestaurantTable } from '@/types/database';

type Draft = {
  name: string;
  dining_area_id: string;
  seats_min: number;
  seats_max: number;
  active: boolean;
};

const emptyDraft: Draft = {
  name: '',
  dining_area_id: '',
  seats_min: 1,
  seats_max: 2,
  active: true,
};

export function AdminDining() {
  const { diningAreas } = useDiningAreas(false);
  const { tables, loading, refetch } = useRestaurantTables(false);
  const [editing, setEditing] = useState<RestaurantTable | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<RestaurantTable | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDraft({ ...emptyDraft, dining_area_id: diningAreas[0]?.id ?? '' });
    setOpen(true);
  };

  const openEdit = (table: RestaurantTable) => {
    setEditing(table);
    setDraft({
      name: table.name,
      dining_area_id: table.dining_area_id,
      seats_min: table.seats_min,
      seats_max: table.seats_max,
      active: table.active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.name.trim()) return toast.error('Nome tavolo obbligatorio');
    if (!draft.dining_area_id) return toast.error('Area sala obbligatoria');
    if (draft.seats_max < draft.seats_min) return toast.error('Coperti massimi non validi');

    setSaving(true);
    const payload = {
      restaurant_id: RESTAURANT_ID,
      ...draft,
      sort_order: editing?.sort_order ?? tables.length + 1,
    };
    const { error } = editing
      ? await supabase.from('restaurant_tables').update(payload).eq('id', editing.id)
      : await supabase.from('restaurant_tables').insert(payload);
    setSaving(false);

    if (error) return toast.error(error.message);
    toast.success(editing ? 'Tavolo aggiornato' : 'Tavolo aggiunto');
    setOpen(false);
    await refetch();
  };

  const remove = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from('restaurant_tables').delete().eq('id', toDelete.id);
    if (error) {
      toast.error('Tavolo con prenotazioni collegate: disattivato invece di eliminato.');
      await supabase.from('restaurant_tables').update({ active: false }).eq('id', toDelete.id);
    } else {
      toast.success('Tavolo eliminato');
    }
    setToDelete(null);
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-serif text-3xl text-brand-900">Sale e Tavoli</h1>
          <p className="mt-1 text-brand-500">Gestisci aree sala, tavoli e capienza prenotabile.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuovo tavolo
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : tables.length === 0 ? (
        <EmptyState title="Nessun tavolo" action={<Button onClick={openCreate}>Aggiungi</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <Card key={table.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="heading-serif text-xl text-brand-900">{table.name}</h3>
                  <p className="text-sm text-accent-600">
                    {table.dining_area?.name ?? diningAreas.find((area) => area.id === table.dining_area_id)?.name ?? 'Area sala'}
                  </p>
                </div>
                {!table.active && (
                  <Badge tone="neutral">
                    <EyeOff className="mr-1 h-3 w-3" /> Off
                  </Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-brand-500">
                Da {table.seats_min} a {table.seats_max} persone
              </p>
              <div className="mt-4 flex gap-2 border-t border-brand-100 pt-4">
                <Button variant="outline" size="sm" onClick={() => openEdit(table)}>
                  <Pencil className="h-3.5 w-3.5" /> Modifica
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setToDelete(table)}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifica tavolo' : 'Nuovo tavolo'}>
        <div className="space-y-4">
          <Input
            label="Nome tavolo"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          />
          <label>
            <span className="label-base">Area sala</span>
            <select
              value={draft.dining_area_id}
              onChange={(event) => setDraft({ ...draft, dining_area_id: event.target.value })}
              className="input-base"
            >
              {diningAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Coperti minimi"
              type="number"
              min={1}
              value={draft.seats_min}
              onChange={(event) => setDraft({ ...draft, seats_min: Number(event.target.value) })}
            />
            <Input
              label="Coperti massimi"
              type="number"
              min={1}
              value={draft.seats_max}
              onChange={(event) => setDraft({ ...draft, seats_max: Number(event.target.value) })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-700">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(event) => setDraft({ ...draft, active: event.target.checked })}
              className="h-4 w-4 rounded border-brand-300"
            />
            Attivo e prenotabile online
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button loading={saving} onClick={save}>
              {editing ? 'Salva' : 'Aggiungi'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Eliminare il tavolo?">
        <p className="text-sm text-brand-600">
          Se ha prenotazioni collegate verra disattivato anziche eliminato.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setToDelete(null)}>
            Annulla
          </Button>
          <Button variant="danger" onClick={remove}>
            Elimina
          </Button>
        </div>
      </Modal>
    </div>
  );
}
