/**
 * Calcolo disponibilita Kokoro.
 * Genera slot prenotabili per tavoli, area sala, orari di apertura e blocchi calendario.
 */
import { restaurantConfig } from '@/config/restaurantConfig';
import type {
  OpeningHour,
  Reservation,
  RestaurantClosure,
  RestaurantTable,
} from '@/types/database';

export interface TimeSlot {
  start: string;
  end: string;
  label: string;
  tableId: string;
  diningAreaId: string;
}

interface ComputeParams {
  date: Date;
  reservationDuration: number;
  tables: RestaurantTable[];
  openingHours: OpeningHour[];
  reservations: Reservation[];
  closures: RestaurantClosure[];
}

function timeToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

function ymd(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function isClosed(date: Date, diningAreaId: string, closures: RestaurantClosure[]): boolean {
  const day = ymd(date);
  return closures.some(
    (closure) =>
      (closure.dining_area_id === null || closure.dining_area_id === diningAreaId) &&
      day >= closure.start_date &&
      day <= closure.end_date
  );
}

function busyRanges(
  tableId: string,
  date: Date,
  reservations: Reservation[]
): Array<[number, number]> {
  const buffer = restaurantConfig.booking.bufferMinutes;
  return reservations
    .filter((reservation) => reservation.table_id === tableId && ['pending', 'confirmed'].includes(reservation.status))
    .map((reservation) => {
      const start = new Date(reservation.starts_at);
      const end = new Date(reservation.ends_at);
      if (ymd(start) !== ymd(date)) return null;
      const startMin = start.getHours() * 60 + start.getMinutes() - buffer;
      const endMin = end.getHours() * 60 + end.getMinutes() + buffer;
      return [startMin, endMin] as [number, number];
    })
    .filter((range): range is [number, number] => range !== null);
}

function overlaps(startMin: number, endMin: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([busyStart, busyEnd]) => startMin < busyEnd && endMin > busyStart);
}

export function computeAvailableSlots(params: ComputeParams): TimeSlot[] {
  const { date, reservationDuration, tables, openingHours, reservations, closures } = params;
  const step = restaurantConfig.booking.slotIntervalMinutes;
  const weekday = date.getDay();
  const now = new Date();
  const isToday = ymd(date) === ymd(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const minimumNoticeMinutes = restaurantConfig.booking.minNoticeHours * 60;
  const slotMap = new Map<string, TimeSlot>();

  for (const table of tables) {
    if (!table.active) continue;
    if (isClosed(date, table.dining_area_id, closures)) continue;

    const windows = openingHours.filter(
      (window) =>
        window.weekday === weekday &&
        (window.dining_area_id === null || window.dining_area_id === table.dining_area_id)
    );
    if (windows.length === 0) continue;

    const busy = busyRanges(table.id, date, reservations);

    for (const window of windows) {
      const windowStart = timeToMinutes(window.start_time);
      const windowEnd = timeToMinutes(window.end_time);

      for (let minute = windowStart; minute + reservationDuration <= windowEnd; minute += step) {
        if (isToday && minute < nowMinutes + minimumNoticeMinutes) continue;
        if (overlaps(minute, minute + reservationDuration, busy)) continue;

        const startDate = new Date(date);
        startDate.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
        const endDate = new Date(startDate.getTime() + reservationDuration * 60000);
        const label = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(
          minute % 60
        ).padStart(2, '0')}`;

        if (!slotMap.has(label)) {
          slotMap.set(label, {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            label,
            tableId: table.id,
            diningAreaId: table.dining_area_id,
          });
        }
      }
    }
  }

  return Array.from(slotMap.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function canCancelReservation(startsAtIso: string): boolean {
  const thresholdMs = restaurantConfig.booking.cancellationThresholdHours * 3600 * 1000;
  return new Date(startsAtIso).getTime() - Date.now() > thresholdMs;
}

export function bookingDateBounds(): { min: Date; max: Date } {
  const min = new Date();
  min.setHours(0, 0, 0, 0);
  const max = new Date(min);
  max.setDate(max.getDate() + restaurantConfig.booking.maxAdvanceDays);
  return { min, max };
}
