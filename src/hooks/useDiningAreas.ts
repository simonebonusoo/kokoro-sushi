import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getFallbackDiningAreas } from '@/lib/demoData';
import type { DiningArea } from '@/types/database';

export function useDiningAreas(onlyActive = true) {
  const [diningAreas, setDiningAreas] = useState<DiningArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiningAreas = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('dining_areas').select('*').order('sort_order');
    if (onlyActive) query = query.eq('active', true);
    const { data, error } = await query;

    if (error || !data?.length) {
      if (error) console.warn('[dining-areas] Supabase query failed, using local Kokoro fallback:', error.message);
      setDiningAreas(getFallbackDiningAreas());
      setError(null);
    } else {
      setDiningAreas(data as DiningArea[]);
      setError(null);
    }
    setLoading(false);
  }, [onlyActive]);

  useEffect(() => {
    void fetchDiningAreas();
  }, [fetchDiningAreas]);

  return { diningAreas, loading, error, refetch: fetchDiningAreas };
}
