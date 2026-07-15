import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getFallbackRestaurantTables } from '@/lib/demoData';
import type { RestaurantTable } from '@/types/database';

export function useRestaurantTables(onlyActive = true) {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('restaurant_tables')
      .select('*, dining_area:dining_areas(*)')
      .order('sort_order');
    if (onlyActive) query = query.eq('active', true);
    const { data, error } = await query;

    if (error || !data?.length) {
      if (error) console.warn('[restaurant-tables] Supabase query failed, using local Kokoro fallback:', error.message);
      setTables(getFallbackRestaurantTables());
      setError(null);
    } else {
      setTables(data as RestaurantTable[]);
      setError(null);
    }
    setLoading(false);
  }, [onlyActive]);

  useEffect(() => {
    void fetchTables();
  }, [fetchTables]);

  return { tables, loading, error, refetch: fetchTables };
}
