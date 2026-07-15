import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ChevronDown, RotateCcw, Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useMenuItems } from '@/hooks/useMenuItems';
import { MenuItemCard } from '@/components/MenuItemCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type MenuSection = 'all' | 'japanese' | 'chinese';

interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

const ALL_CATEGORIES = 'Tutte';

const MENU_SECTION_OPTIONS: DropdownOption<MenuSection>[] = [
  { value: 'all', label: 'Tutto' },
  { value: 'japanese', label: 'Menu Giapponese' },
  { value: 'chinese', label: 'Menu Cinese' },
];

const CATEGORY_ORDER = [
  'Antipasti',
  'Zuppe',
  'Insalate',
  'Tartare',
  'Carpacci',
  'Sashimi',
  'Nigiri',
  'Gunkan',
  'Hosomaki',
  'Uramaki',
  'Futomaki',
  'Temaki',
  'Box',
  'Riso',
  'Pasta',
  'Ravioli',
  'Tempura',
  'Secondi',
  'Dolci',
  'Bevande',
];

export function Menu() {
  const { menuItems, loading, error } = useMenuItems();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('tavolo');
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [menuSection, setMenuSection] = useState<MenuSection>('all');

  const categoryOptions = useMemo(() => {
    const knownOrder = new Map(CATEGORY_ORDER.map((item, index) => [item.toLowerCase(), index]));
    const uniqueCategories = Array.from(
      new Set(menuItems.map((item) => item.category?.name ?? 'Menu'))
    ).sort((a, b) => {
      const orderA = knownOrder.get(a.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
      const orderB = knownOrder.get(b.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.localeCompare(b, 'it');
    });

    return [
      { value: ALL_CATEGORIES, label: ALL_CATEGORIES },
      ...uniqueCategories.map((item) => ({ value: item, label: item })),
    ];
  }, [menuItems]);

  const normalizedSearch = search.trim().toLowerCase();
  const hasActiveFilters =
    normalizedSearch !== '' || menuSection !== 'all' || category !== ALL_CATEGORIES;

  const filtered = menuItems.filter((item) => {
    const categoryName = item.category?.name ?? 'Menu';
    const section = item.category?.menu_section ?? 'japanese';
    const allergenNames = item.allergens?.map((entry) => entry.name.toLowerCase()) ?? [];
    const categoryOk = category === ALL_CATEGORIES || categoryName === category;
    const sectionOk =
      menuSection === 'all' ||
      (menuSection === 'japanese' && section === 'japanese') ||
      (menuSection === 'chinese' && section === 'chinese');
    const searchableText =
      `${item.name} ${item.description} ${item.ingredients ?? ''} ${allergenNames.join(' ')}`.toLowerCase();
    const searchOk = normalizedSearch === '' || searchableText.includes(normalizedSearch);

    return categoryOk && sectionOk && searchOk;
  });

  const resetFilters = () => {
    setCategory(ALL_CATEGORIES);
    setSearch('');
    setMenuSection('all');
  };

  const menuSectionLabel =
    MENU_SECTION_OPTIONS.find((item) => item.value === menuSection)?.label ?? 'Tutto';

  return (
    <div className="container-page section">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-600">
          Menu digitale
        </span>
        <h1 className="heading-serif mt-3 text-5xl text-brand-900">Consulta il menu di Kokoro</h1>
        <p className="mt-4 text-lg leading-8 text-brand-500">
          Ricerca rapida, filtri essenziali e schede piatto con ingredienti, allergeni e badge.
        </p>
        {tableNumber && (
          <p className="mt-4 inline-flex rounded-full bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700">
            Menu consultato dal tavolo {tableNumber}
          </p>
        )}
      </div>

      <div className="mx-auto mt-10 max-w-5xl">
        <div className="rounded-[1.5rem] border border-brand-100 bg-white/90 p-2 shadow-card backdrop-blur">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-brand-400" />
              <Input
                aria-label="Cerca piatti, ingredienti o allergeni"
                placeholder="Cerca piatti, ingredienti o allergeni"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 rounded-[1.1rem] border-brand-200 pl-10 pr-10 focus:border-accent-500 focus:ring-accent-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Cancella ricerca"
                  className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-brand-400 transition hover:bg-brand-100 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex lg:shrink-0">
              <ToolbarDropdown
                label="Menu"
                value={menuSection}
                valueLabel={menuSectionLabel}
                options={MENU_SECTION_OPTIONS}
                onChange={setMenuSection}
              />
              <ToolbarDropdown
                label="Portata"
                value={category}
                valueLabel={category}
                options={categoryOptions}
                onChange={setCategory}
              />
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-[1.1rem] border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-600 transition hover:border-brand-300 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 sm:col-span-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <EmptyState title="Errore di caricamento" description={error} />
      ) : menuItems.length === 0 ? (
        <EmptyState title="Menu non disponibile" description="Riprova piu tardi." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nessun piatto trovato"
          description="Prova a cambiare ricerca o filtri."
        />
      ) : (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/prenota">
              <Button size="lg">Prenota un tavolo</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function ToolbarDropdown<T extends string>({
  label,
  value,
  valueLabel,
  options,
  onChange,
}: {
  label: string;
  value: T;
  valueLabel: string;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-[1.1rem] border border-brand-200 bg-white px-4 text-left text-sm font-semibold text-brand-800 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 sm:w-56"
      >
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.18em] text-brand-400">
            {label}
          </span>
          <span className="block truncate">{valueLabel}</span>
        </span>
        <ChevronDown
          className={clsx('h-4 w-4 shrink-0 text-brand-400 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          id={id}
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-20 mt-2 max-h-80 w-72 max-w-[calc(100vw-2rem)] origin-top-right animate-[luxury-menu-in_220ms_cubic-bezier(0.22,1,0.36,1)_both] overflow-y-auto rounded-2xl border border-brand-100 bg-white p-2 shadow-soft"
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={clsx(
                  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
                  selected
                    ? 'bg-accent-500 text-white'
                    : 'text-brand-700 hover:bg-brand-50'
                )}
              >
                <span>{option.label}</span>
                {selected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
