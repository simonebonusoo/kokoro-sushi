import { supabase } from '@/lib/supabase';
import { localClient } from '@/lib/localClient';
import { RESTAURANT_ID } from '@/lib/demoData';
import type { ReservationStatus, ReservationWithRelations } from '@/types/database';

const SELECT_WITH_RELATIONS = `
  *,
  dining_area:dining_areas(*),
  table:restaurant_tables(*),
  customer:profiles!reservations_customer_id_fkey(*)
`;

export interface CreateReservationInput {
  customerId: string;
  diningAreaId: string;
  tableId: string;
  startsAt: string;
  endsAt: string;
  partySize: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  createdBy: string;
}

function toPayload(input: CreateReservationInput) {
  return {
    restaurant_id: RESTAURANT_ID,
    customer_id: input.customerId,
    dining_area_id: input.diningAreaId,
    table_id: input.tableId,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    party_size: input.partySize,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail,
    notes: input.notes ?? '',
    created_by: input.createdBy,
    status: 'pending',
  };
}

export async function createReservation(input: CreateReservationInput) {
  const { data, error } = await supabase
    .from('reservations')
    .insert(toPayload(input))
    .select()
    .single();

  if (error) {
    if (error.code === '23P01') {
      throw new Error('Questo orario e appena stato prenotato. Scegli un altro slot.');
    }
    console.warn('[reservations] Supabase insert failed, using local Kokoro fallback:', error.message);
    const fallback = await localClient
      .from('reservations')
      .insert(toPayload(input))
      .select()
      .single();
    if (fallback.error) throw new Error(fallback.error.message);
    return fallback.data;
  }

  return data;
}

export async function cancelReservation(id: string) {
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) {
    console.warn('[reservations] Supabase cancel failed, using local Kokoro fallback:', error.message);
    const fallback = await localClient.from('reservations').update({ status: 'cancelled' }).eq('id', id);
    if (fallback.error) throw new Error(fallback.error.message);
  }
}

export async function updateReservationStatus(id: string, status: ReservationStatus) {
  const { error } = await supabase.from('reservations').update({ status }).eq('id', id);

  if (error) {
    console.warn('[reservations] Supabase status update failed, using local Kokoro fallback:', error.message);
    const fallback = await localClient.from('reservations').update({ status }).eq('id', id);
    if (fallback.error) throw new Error(fallback.error.message);
  }
}

export async function fetchCustomerReservations(customerId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(SELECT_WITH_RELATIONS)
    .eq('customer_id', customerId)
    .order('starts_at', { ascending: false });

  if (error) {
    console.warn('[reservations] Supabase customer query failed, using local Kokoro fallback:', error.message);
    const fallback = await localClient
      .from('reservations')
      .select(SELECT_WITH_RELATIONS)
      .eq('customer_id', customerId)
      .order('starts_at', { ascending: false });
    if (fallback.error) throw new Error(fallback.error.message);
    return (fallback.data ?? []) as unknown as ReservationWithRelations[];
  }

  return (data ?? []) as unknown as ReservationWithRelations[];
}

export async function fetchReservationsInRange(fromIso: string, toIso: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(SELECT_WITH_RELATIONS)
    .gte('starts_at', fromIso)
    .lte('starts_at', toIso)
    .order('starts_at');

  if (error) {
    console.warn('[reservations] Supabase range query failed, using local Kokoro fallback:', error.message);
    const fallback = await localClient
      .from('reservations')
      .select(SELECT_WITH_RELATIONS)
      .gte('starts_at', fromIso)
      .lte('starts_at', toIso)
      .order('starts_at');
    if (fallback.error) throw new Error(fallback.error.message);
    return (fallback.data ?? []) as unknown as ReservationWithRelations[];
  }

  return (data ?? []) as unknown as ReservationWithRelations[];
}

export async function fetchDayActiveReservations(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .in('status', ['pending', 'confirmed'])
    .gte('starts_at', start.toISOString())
    .lte('starts_at', end.toISOString());

  if (error) {
    console.warn('[reservations] Supabase availability query failed, using local Kokoro fallback:', error.message);
    const fallback = await localClient
      .from('reservations')
      .select('*')
      .in('status', ['pending', 'confirmed'])
      .gte('starts_at', start.toISOString())
      .lte('starts_at', end.toISOString());
    if (fallback.error) throw new Error(fallback.error.message);
    return fallback.data ?? [];
  }

  return data ?? [];
}
