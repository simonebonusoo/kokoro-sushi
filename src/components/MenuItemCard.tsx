import { Flame, Leaf, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { formatPrice } from '@/utils/format';
import type { MenuItem } from '@/types/database';

interface MenuItemCardProps {
  item: MenuItem;
  selected?: boolean;
  onSelect?: (item: MenuItem) => void;
}

export function MenuItemCard({ item, selected, onSelect }: MenuItemCardProps) {
  const interactive = Boolean(onSelect);
  // Costruisce l'elenco tag unendo flag e badge editoriale, evitando
  // duplicati (es. flag "vegetariano" + badge "Vegetariano" -> un solo tag).
  const tags: { label: string; icon: typeof Sparkles }[] = [];
  const seen = new Set<string>();
  const addTag = (label: string | null | undefined, icon: typeof Sparkles) => {
    const clean = label?.trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    tags.push({ label: clean, icon });
  };

  if (item.is_vegetarian) addTag('Vegetariano', Leaf);
  if (item.is_vegan) addTag('Vegano', Leaf);
  if (item.is_spicy) addTag('Piccante', Flame);
  if (item.is_best_seller) addTag('Best seller', Sparkles);
  if (item.is_new) addTag('Novita', Sparkles);
  if (item.is_raw) addTag('Crudo', Sparkles);
  addTag(item.badge, Sparkles);

  return (
    <Card
      hover={interactive}
      onClick={() => onSelect?.(item)}
      className={clsx(
        interactive && 'cursor-pointer',
        selected && 'ring-2 ring-brand-500 border-brand-300'
      )}
    >
      {item.image_url && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-brand-100">
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="h-48 w-full object-cover transition duration-500 hover:scale-105"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent-600">
            {item.category?.name ?? 'Menu'}
          </span>
          <h3 className="heading-serif mt-0.5 text-lg text-brand-900">{item.name}</h3>
        </div>
        <span className="whitespace-nowrap text-lg font-bold text-brand-800">
          {formatPrice(item.price)}
        </span>
      </div>
      {item.description && (
        <p className="mt-2 text-sm text-brand-500">{item.description}</p>
      )}
      {item.ingredients && (
        <p className="mt-3 text-xs uppercase tracking-wide text-brand-400">
          Ingredienti: {item.ingredients}
        </p>
      )}
      {item.allergens && item.allergens.length > 0 && (
        <p className="mt-2 text-xs text-brand-500">
          Allergeni: {item.allergens.map((allergen) => allergen.name).join(', ')}
        </p>
      )}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag.label} icon={tag.icon} label={tag.label} />
          ))}
        </div>
      )}
    </Card>
  );
}

function Tag({
  icon: Icon,
  label,
}: {
  icon: typeof Sparkles;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
