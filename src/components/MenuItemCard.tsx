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
  const badges = [
    item.badge,
    item.is_best_seller ? 'Best seller' : null,
    item.is_new ? 'Novita' : null,
    item.is_raw ? 'Crudo' : null,
  ].filter(Boolean) as string[];

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
      <div className="mt-4 flex flex-wrap gap-2">
        {item.is_vegetarian && <Tag icon={Leaf} label="Vegetariano" />}
        {item.is_vegan && <Tag icon={Leaf} label="Vegano" />}
        {item.is_spicy && <Tag icon={Flame} label="Piccante" />}
        {badges.map((badge) => (
          <Tag key={badge} icon={Sparkles} label={badge} />
        ))}
      </div>
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
