import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getFallbackMenuItems } from '@/lib/demoData';
import type { Allergen, MenuCategory, MenuItem } from '@/types/database';

type RemoteMenuItem = MenuItem & {
  menu_item_allergens?: Array<{ allergen?: Allergen | null }>;
};

function normalizeMenuItem(item: RemoteMenuItem): MenuItem {
  return {
    ...item,
    category: item.category ? (item.category as MenuCategory) : null,
    allergens:
      item.allergens ??
      ((item.menu_item_allergens?.map((row) => row.allergen).filter(Boolean) ?? []) as Allergen[]),
  };
}

export function useMenuItems(onlyActive = true) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('menu_items')
      .select('*, category:menu_categories(*), menu_item_allergens(allergen:allergens(*))')
      .order('sort_order');
    if (onlyActive) query = query.eq('active', true);
    const { data, error } = await query;

    if (error || !data?.length) {
      if (error) console.warn('[menu] Supabase query failed, using local Kokoro fallback:', error.message);
      setMenuItems(getFallbackMenuItems());
      setError(null);
    } else {
      setMenuItems((data as RemoteMenuItem[]).map(normalizeMenuItem));
      setError(null);
    }
    setLoading(false);
  }, [onlyActive]);

  useEffect(() => {
    void fetchMenuItems();
  }, [fetchMenuItems]);

  return { menuItems, loading, error, refetch: fetchMenuItems };
}
