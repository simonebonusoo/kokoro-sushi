/**
 * Tipi del database Kokoro Sushi Roma.
 * Le entita seguono il dominio ristorante: menu, sale, tavoli e prenotazioni.
 */

export type UserRole = 'client' | 'admin';
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'no_show';
export type NotificationType =
  | 'reservation_created'
  | 'reservation_cancelled'
  | 'reservation_reminder'
  | 'system';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantSetting {
  id: string;
  restaurant_id: string;
  default_reservation_duration_minutes: number;
  slot_interval_minutes: number;
  min_party_size: number;
  max_party_size: number;
  min_notice_hours: number;
  max_advance_days: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  menu_section: 'japanese' | 'chinese' | 'drinks' | 'desserts';
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  ingredients: string | null;
  badge: string | null;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
  is_raw: boolean;
  is_new: boolean;
  is_best_seller: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: MenuCategory | null;
  allergens?: Allergen[];
}

export interface Allergen {
  id: string;
  name: string;
  created_at: string;
}

export interface MenuItemAllergen {
  menu_item_id: string;
  allergen_id: string;
}

export interface DiningArea {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  dining_area_id: string;
  name: string;
  seats_min: number;
  seats_max: number;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  dining_area?: DiningArea | null;
}

export interface OpeningHour {
  id: string;
  restaurant_id: string;
  dining_area_id: string | null;
  weekday: number; // 0..6
  start_time: string; // "HH:MM:SS"
  end_time: string;
  created_at: string;
}

export interface RestaurantClosure {
  id: string;
  restaurant_id: string;
  dining_area_id: string | null;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;
  reason: string;
  created_at: string;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_id: string;
  dining_area_id: string;
  table_id: string;
  starts_at: string; // ISO
  ends_at: string;
  status: ReservationStatus;
  party_size: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationWithRelations extends Reservation {
  dining_area: DiningArea | null;
  table: RestaurantTable | null;
  customer: Profile | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  reservation_id: string | null;
  created_at: string;
}
