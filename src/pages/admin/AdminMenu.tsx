import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RESTAURANT_ID } from '@/lib/demoData';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPrice } from '@/utils/format';
import type { MenuItem } from '@/types/database';

type Draft = {
  name: string;
  category_id: string;
  description: string;
  price: number;
  image_url: string;
  ingredients: string;
  badge: string;
  active: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
  is_raw: boolean;
  is_new: boolean;
  is_best_seller: boolean;
};

const emptyDraft: Draft = {
  name: '',
  category_id: '',
  description: '',
  price: 0,
  image_url: '',
  ingredients: '',
  badge: '',
  active: true,
  is_vegetarian: false,
  is_vegan: false,
  is_spicy: false,
  is_raw: false,
  is_new: false,
  is_best_seller: false,
};

export function AdminMenu() {
  const { menuItems, loading, refetch } = useMenuItems(false);
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    menuItems.forEach((item) => {
      if (item.category) map.set(item.category.id, item.category.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [menuItems]);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<MenuItem | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDraft({ ...emptyDraft, category_id: categories[0]?.id ?? '' });
    setOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setDraft({
      name: item.name,
      category_id: item.category_id,
      description: item.description,
      price: Number(item.price),
      image_url: item.image_url ?? '',
      ingredients: item.ingredients ?? '',
      badge: item.badge ?? '',
      active: item.active,
      is_vegetarian: item.is_vegetarian,
      is_vegan: item.is_vegan,
      is_spicy: item.is_spicy,
      is_raw: item.is_raw,
      is_new: item.is_new,
      is_best_seller: item.is_best_seller,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.name.trim()) return toast.error('Nome piatto obbligatorio');
    if (!draft.category_id) return toast.error('Categoria obbligatoria');

    setSaving(true);
    const payload = {
      restaurant_id: RESTAURANT_ID,
      ...draft,
      image_url: draft.image_url || null,
      ingredients: draft.ingredients || null,
      badge: draft.badge || null,
      sort_order: editing?.sort_order ?? menuItems.length + 1,
    };
    const { error } = editing
      ? await supabase.from('menu_items').update(payload).eq('id', editing.id)
      : await supabase.from('menu_items').insert(payload);
    setSaving(false);

    if (error) return toast.error(error.message);
    toast.success(editing ? 'Piatto aggiornato' : 'Piatto creato');
    setOpen(false);
    await refetch();
  };

  const remove = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', toDelete.id);
    if (error) {
      toast.error('Voce collegata a dati storici: verra disattivata.');
      await supabase.from('menu_items').update({ active: false }).eq('id', toDelete.id);
    } else {
      toast.success('Piatto eliminato');
    }
    setToDelete(null);
    await refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="heading-serif text-3xl text-brand-900">CMS Menu</h1>
          <p className="mt-1 text-brand-500">Gestisci piatti, categorie, ingredienti, allergeni e visibilita.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nuovo piatto
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : menuItems.length === 0 ? (
        <EmptyState title="Nessun piatto presente" action={<Button onClick={openCreate}>Aggiungi il primo</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {menuItems.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase text-accent-600">
                    {item.category?.name ?? 'Menu'}
                  </span>
                  <h3 className="heading-serif text-lg text-brand-900">{item.name}</h3>
                </div>
                {!item.active && (
                  <Badge tone="neutral">
                    <EyeOff className="mr-1 h-3 w-3" /> Off
                  </Badge>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-brand-500">{item.description}</p>
              {item.ingredients && <p className="mt-3 text-xs text-brand-500">Ingredienti: {item.ingredients}</p>}
              {item.allergens && item.allergens.length > 0 && (
                <p className="mt-1 text-xs text-brand-500">
                  Allergeni: {item.allergens.map((allergen) => allergen.name).join(', ')}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {item.is_vegetarian && <Badge tone="neutral">Vegetariano</Badge>}
                {item.is_vegan && <Badge tone="neutral">Vegano</Badge>}
                {item.is_spicy && <Badge tone="accent">Piccante</Badge>}
                {item.is_raw && <Badge tone="accent">Crudo</Badge>}
                {/* Badge editoriale: mostrato solo se non duplica un flag già visibile. */}
                {item.badge &&
                  !['vegetariano', 'vegano', 'piccante', 'crudo'].includes(item.badge.trim().toLowerCase()) && (
                    <Badge tone="accent">{item.badge}</Badge>
                  )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-brand-100 pt-4 text-sm">
                <span className="font-bold text-brand-800">{formatPrice(item.price)}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                    <Pencil className="h-3.5 w-3.5" /> Modifica
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setToDelete(item)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Modifica piatto' : 'Nuovo piatto'} size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome piatto" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
            <label>
              <span className="label-base">Categoria</span>
              <select
                value={draft.category_id}
                onChange={(event) => setDraft({ ...draft, category_id: event.target.value })}
                className="input-base"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Input label="Descrizione" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Prezzo (€)" type="number" min={0} step={0.5} value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} />
            <Input label="URL immagine" placeholder="https://..." value={draft.image_url} onChange={(event) => setDraft({ ...draft, image_url: event.target.value })} />
          </div>
          <Input label="Ingredienti" placeholder="Salmone, avocado, sesamo" value={draft.ingredients} onChange={(event) => setDraft({ ...draft, ingredients: event.target.value })} />
          <Input label="Badge editoriale" placeholder="Best seller, Novita..." value={draft.badge} onChange={(event) => setDraft({ ...draft, badge: event.target.value })} />

          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle label="Attivo" checked={draft.active} onChange={(checked) => setDraft({ ...draft, active: checked })} />
            <Toggle label="Vegetariano" checked={draft.is_vegetarian} onChange={(checked) => setDraft({ ...draft, is_vegetarian: checked })} />
            <Toggle label="Vegano" checked={draft.is_vegan} onChange={(checked) => setDraft({ ...draft, is_vegan: checked })} />
            <Toggle label="Piccante" checked={draft.is_spicy} onChange={(checked) => setDraft({ ...draft, is_spicy: checked })} />
            <Toggle label="Crudo" checked={draft.is_raw} onChange={(checked) => setDraft({ ...draft, is_raw: checked })} />
            <Toggle label="Novita" checked={draft.is_new} onChange={(checked) => setDraft({ ...draft, is_new: checked })} />
            <Toggle label="Best seller" checked={draft.is_best_seller} onChange={(checked) => setDraft({ ...draft, is_best_seller: checked })} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button loading={saving} onClick={save}>
              {editing ? 'Salva modifiche' : 'Crea piatto'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Eliminare questo piatto?">
        <p className="text-sm text-brand-600">
          Se la voce fosse collegata a dati storici verra semplicemente disattivata.
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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-brand-300"
      />
      {label}
    </label>
  );
}
