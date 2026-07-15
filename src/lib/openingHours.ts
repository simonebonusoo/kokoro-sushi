import { supabase } from '@/lib/supabase';
import { getFallbackDb } from '@/lib/demoData';
import type { OpeningHour, RestaurantClosure } from '@/types/database';

export async function fetchOpeningHours(diningAreaIds?: string[]) {
  let query = supabase.from('opening_hours').select('*');
  if (diningAreaIds && diningAreaIds.length > 0) query = query.in('dining_area_id', diningAreaIds);

  const { data, error } = await query;
  if (error || !data?.length) {
    if (error) console.warn('[opening-hours] Supabase query failed, using local Kokoro fallback:', error.message);
    const fallback = getFallbackDb().opening_hours as OpeningHour[];
    return diningAreaIds?.length
      ? fallback.filter((item) => item.dining_area_id && diningAreaIds.includes(item.dining_area_id))
      : fallback;
  }

  return (data ?? []) as OpeningHour[];
}

export async function fetchClosuresForDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const day = `${y}-${m}-${d}`;

  const { data, error } = await supabase
    .from('restaurant_closures')
    .select('*')
    .lte('start_date', day)
    .gte('end_date', day);

  if (error) {
    console.warn('[restaurant-closures] Supabase query failed, using empty local fallback:', error.message);
    return [];
  }

  return (data ?? []) as RestaurantClosure[];
}

export async function fetchAllClosures() {
  const { data, error } = await supabase
    .from('restaurant_closures')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.warn('[restaurant-closures] Supabase query failed, using empty local fallback:', error.message);
    return [];
  }

  return (data ?? []) as RestaurantClosure[];
}
