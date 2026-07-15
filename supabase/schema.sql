-- Kokoro Sushi Roma - schema Supabase definitivo
-- Eseguire in SQL Editor su un progetto pulito.

create extension if not exists "uuid-ossp";
create extension if not exists btree_gist;

do $$ begin
  create type user_role as enum ('client', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reservation_status as enum ('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum ('reservation_created', 'reservation_cancelled', 'reservation_reminder', 'system');
exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  role user_role not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_settings (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  default_reservation_duration_minutes int not null default 90,
  slot_interval_minutes int not null default 30,
  min_party_size int not null default 1,
  max_party_size int not null default 8,
  min_notice_hours int not null default 2,
  max_advance_days int not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id)
);

create table if not exists public.menu_categories (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  menu_section text not null check (menu_section in ('japanese', 'chinese', 'drinks', 'desserts')),
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete restrict,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  image_url text,
  ingredients text,
  badge text,
  is_vegetarian boolean not null default false,
  is_vegan boolean not null default false,
  is_spicy boolean not null default false,
  is_raw boolean not null default false,
  is_new boolean not null default false,
  is_best_seller boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.allergens (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_item_allergens (
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  allergen_id uuid not null references public.allergens(id) on delete restrict,
  primary key (menu_item_id, allergen_id)
);

create table if not exists public.dining_areas (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  description text not null default '',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.restaurant_tables (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  dining_area_id uuid not null references public.dining_areas(id) on delete restrict,
  name text not null,
  seats_min int not null default 1,
  seats_max int not null default 2,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (seats_min >= 1),
  check (seats_max >= seats_min)
);

create table if not exists public.opening_hours (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  dining_area_id uuid references public.dining_areas(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table if not exists public.restaurant_closures (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  dining_area_id uuid references public.dining_areas(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null default 'Chiusura',
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.reservations (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  dining_area_id uuid not null references public.dining_areas(id) on delete restrict,
  table_id uuid not null references public.restaurant_tables(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status reservation_status not null default 'pending',
  party_size int not null default 2,
  customer_name text not null default '',
  customer_phone text not null default '',
  customer_email text not null default '',
  notes text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (party_size > 0)
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type notification_type not null default 'system',
  read boolean not null default false,
  reservation_id uuid references public.reservations(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_menu_items_category on public.menu_items(category_id);
create index if not exists idx_restaurant_tables_area on public.restaurant_tables(dining_area_id);
create index if not exists idx_opening_hours_area on public.opening_hours(dining_area_id);
create index if not exists idx_reservations_customer on public.reservations(customer_id);
create index if not exists idx_reservations_table on public.reservations(table_id);
create index if not exists idx_reservations_starts on public.reservations(starts_at);
create index if not exists idx_notifications_user_read on public.notifications(user_id, read);

alter table public.reservations drop constraint if exists reservations_no_overlap;
alter table public.reservations
  add constraint reservations_no_overlap
  exclude using gist (
    table_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_restaurants_updated on public.restaurants;
create trigger trg_restaurants_updated before update on public.restaurants
for each row execute function public.set_updated_at();

drop trigger if exists trg_restaurant_settings_updated on public.restaurant_settings;
create trigger trg_restaurant_settings_updated before update on public.restaurant_settings
for each row execute function public.set_updated_at();

drop trigger if exists trg_menu_categories_updated on public.menu_categories;
create trigger trg_menu_categories_updated before update on public.menu_categories
for each row execute function public.set_updated_at();

drop trigger if exists trg_menu_items_updated on public.menu_items;
create trigger trg_menu_items_updated before update on public.menu_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_dining_areas_updated on public.dining_areas;
create trigger trg_dining_areas_updated before update on public.dining_areas
for each row execute function public.set_updated_at();

drop trigger if exists trg_restaurant_tables_updated on public.restaurant_tables;
create trigger trg_restaurant_tables_updated before update on public.restaurant_tables
for each row execute function public.set_updated_at();

drop trigger if exists trg_reservations_updated on public.reservations;
create trigger trg_reservations_updated before update on public.reservations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'phone',
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.notify_reservation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_label text;
  table_label text;
  area_label text;
  when_label text;
  admin_profile record;
begin
  select coalesce(nullif(new.customer_name, ''), p.full_name, p.email)
    into customer_label
  from public.profiles p
  where p.id = new.customer_id;

  select t.name, a.name
    into table_label, area_label
  from public.restaurant_tables t
  join public.dining_areas a on a.id = t.dining_area_id
  where t.id = new.table_id;

  when_label := to_char(new.starts_at at time zone 'Europe/Rome', 'DD/MM/YYYY HH24:MI');

  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, title, message, type, reservation_id)
    values (
      new.customer_id,
      'Richiesta ricevuta',
      'Richiesta per ' || coalesce(table_label, 'tavolo') || ' (' || coalesce(area_label, 'sala') || ') ricevuta per il ' || when_label || '.',
      'reservation_created',
      new.id
    );

    for admin_profile in select id from public.profiles where role = 'admin' loop
      insert into public.notifications (user_id, title, message, type, reservation_id)
      values (
        admin_profile.id,
        'Nuova prenotazione',
        coalesce(customer_label, 'Cliente') || ' ha richiesto ' || coalesce(table_label, 'tavolo') || ' per ' || new.party_size || ' persone il ' || when_label || '.',
        'reservation_created',
        new.id
      );
    end loop;
  elsif tg_op = 'UPDATE' and new.status = 'cancelled' and old.status <> 'cancelled' then
    insert into public.notifications (user_id, title, message, type, reservation_id)
    values (
      new.customer_id,
      'Prenotazione cancellata',
      coalesce(table_label, 'Tavolo') || ' del ' || when_label || ' e stato annullato.',
      'reservation_cancelled',
      new.id
    );

    for admin_profile in select id from public.profiles where role = 'admin' loop
      insert into public.notifications (user_id, title, message, type, reservation_id)
      values (
        admin_profile.id,
        'Prenotazione cancellata',
        coalesce(customer_label, 'Cliente') || ' ha annullato la prenotazione del ' || when_label || '.',
        'reservation_cancelled',
        new.id
      );
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_reservation_insert on public.reservations;
create trigger trg_notify_reservation_insert
after insert on public.reservations
for each row execute function public.notify_reservation();

drop trigger if exists trg_notify_reservation_update on public.reservations;
create trigger trg_notify_reservation_update
after update on public.reservations
for each row execute function public.notify_reservation();

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.allergens enable row level security;
alter table public.menu_item_allergens enable row level security;
alter table public.dining_areas enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.opening_hours enable row level security;
alter table public.restaurant_closures enable row level security;
alter table public.reservations enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

drop policy if exists "restaurants_select_all" on public.restaurants;
create policy "restaurants_select_all" on public.restaurants for select using (true);
drop policy if exists "restaurants_write_admin" on public.restaurants;
create policy "restaurants_write_admin" on public.restaurants for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "restaurant_settings_select_all" on public.restaurant_settings;
create policy "restaurant_settings_select_all" on public.restaurant_settings for select using (true);
drop policy if exists "restaurant_settings_write_admin" on public.restaurant_settings;
create policy "restaurant_settings_write_admin" on public.restaurant_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "menu_categories_select_all" on public.menu_categories;
create policy "menu_categories_select_all" on public.menu_categories for select using (true);
drop policy if exists "menu_categories_write_admin" on public.menu_categories;
create policy "menu_categories_write_admin" on public.menu_categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "menu_items_select_all" on public.menu_items;
create policy "menu_items_select_all" on public.menu_items for select using (true);
drop policy if exists "menu_items_write_admin" on public.menu_items;
create policy "menu_items_write_admin" on public.menu_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "allergens_select_all" on public.allergens;
create policy "allergens_select_all" on public.allergens for select using (true);
drop policy if exists "allergens_write_admin" on public.allergens;
create policy "allergens_write_admin" on public.allergens for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "menu_item_allergens_select_all" on public.menu_item_allergens;
create policy "menu_item_allergens_select_all" on public.menu_item_allergens for select using (true);
drop policy if exists "menu_item_allergens_write_admin" on public.menu_item_allergens;
create policy "menu_item_allergens_write_admin" on public.menu_item_allergens for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "dining_areas_select_all" on public.dining_areas;
create policy "dining_areas_select_all" on public.dining_areas for select using (true);
drop policy if exists "dining_areas_write_admin" on public.dining_areas;
create policy "dining_areas_write_admin" on public.dining_areas for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "restaurant_tables_select_all" on public.restaurant_tables;
create policy "restaurant_tables_select_all" on public.restaurant_tables for select using (true);
drop policy if exists "restaurant_tables_write_admin" on public.restaurant_tables;
create policy "restaurant_tables_write_admin" on public.restaurant_tables for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "opening_hours_select_all" on public.opening_hours;
create policy "opening_hours_select_all" on public.opening_hours for select using (true);
drop policy if exists "opening_hours_write_admin" on public.opening_hours;
create policy "opening_hours_write_admin" on public.opening_hours for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "restaurant_closures_select_all" on public.restaurant_closures;
create policy "restaurant_closures_select_all" on public.restaurant_closures for select using (true);
drop policy if exists "restaurant_closures_write_admin" on public.restaurant_closures;
create policy "restaurant_closures_write_admin" on public.restaurant_closures for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reservations_select_own_or_admin" on public.reservations;
create policy "reservations_select_own_or_admin" on public.reservations
for select using (customer_id = auth.uid() or public.is_admin());
drop policy if exists "reservations_insert_self_or_admin" on public.reservations;
create policy "reservations_insert_self_or_admin" on public.reservations
for insert with check (customer_id = auth.uid() or public.is_admin());
drop policy if exists "reservations_update_own_or_admin" on public.reservations;
create policy "reservations_update_own_or_admin" on public.reservations
for update using (customer_id = auth.uid() or public.is_admin()) with check (customer_id = auth.uid() or public.is_admin());
drop policy if exists "reservations_delete_admin" on public.reservations;
create policy "reservations_delete_admin" on public.reservations
for delete using (public.is_admin());

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

insert into public.restaurants (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Kokoro Sushi Roma', 'kokoro-sushi-roma')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

insert into public.restaurant_settings (
  id, restaurant_id, default_reservation_duration_minutes, slot_interval_minutes,
  min_party_size, max_party_size, min_notice_hours, max_advance_days
) values (
  '90000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  90, 30, 1, 8, 2, 60
) on conflict (restaurant_id) do update set
  default_reservation_duration_minutes = excluded.default_reservation_duration_minutes,
  slot_interval_minutes = excluded.slot_interval_minutes,
  min_party_size = excluded.min_party_size,
  max_party_size = excluded.max_party_size,
  min_notice_hours = excluded.min_notice_hours,
  max_advance_days = excluded.max_advance_days;

insert into public.menu_categories (id, restaurant_id, name, menu_section, sort_order) values
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Antipasti','japanese',10),
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Nigiri','japanese',20),
('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Uramaki','japanese',30),
('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','Hosomaki','japanese',40),
('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','Sashimi','japanese',50),
('10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','Poke','japanese',60),
('10000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','Cucina Cinese','chinese',70),
('10000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','Tempura','japanese',80),
('10000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000001','Dolci','desserts',90),
('10000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','Bibite','drinks',100)
on conflict (id) do update set name = excluded.name, menu_section = excluded.menu_section, sort_order = excluded.sort_order;

insert into public.allergens (id, name) values
('50000000-0000-0000-0000-000000000001','glutine'),
('50000000-0000-0000-0000-000000000002','crostacei'),
('50000000-0000-0000-0000-000000000003','sesamo'),
('50000000-0000-0000-0000-000000000004','pesce'),
('50000000-0000-0000-0000-000000000005','latte'),
('50000000-0000-0000-0000-000000000006','soia')
on conflict (id) do update set name = excluded.name;

insert into public.menu_items (
  id, restaurant_id, category_id, name, description, price, ingredients, badge,
  is_vegetarian, is_vegan, is_spicy, is_raw, is_new, is_best_seller, sort_order
) values
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','1. Involtini Primavera','Classico antipasto vegetariano del menu pubblico.',2.50,'Verdure miste','Vegetariano',true,false,false,false,false,false,10),
('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','4. Nuvolette','Nuvolette croccanti servite come starter.',2.00,null,null,false,false,false,false,false,false,20),
('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','7. Goma Wakame','Insalata di alghe con sesamo.',4.00,'Alghe, sesamo','Vegetariano',true,false,false,false,false,false,30),
('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','18. Samosa','Samosa croccanti ispirati alla cucina fusion.',4.50,null,'Vegetariano',true,false,false,false,false,false,40),
('20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','150. Samurai Salmon Stick','Stick di salmone tra gli antipasti piu richiesti.',4.50,'Salmone','Best seller',false,false,false,false,false,true,50),
('20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Samurai Tonno e Tartufo Stick','Tartare di tonno con nota di tartufo.',5.50,'Tonno, tartufo',null,false,false,false,true,false,false,60),
('20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Sake Nigiri 2pz','Nigiri di salmone.',3.50,'Salmone, riso sushi',null,false,false,false,true,false,false,70),
('20000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002','Maguro Nigiri 2pz','Nigiri di tonno.',4.00,'Tonno, riso sushi',null,false,false,false,true,false,false,80),
('20000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000005','Salmon Tataki','Tataki di salmone leggermente scottato.',8.00,'Salmone','Crudo',false,false,false,true,false,false,90),
('20000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','Dragon Roll 4pz','Uramaki creativo con salmone e topping croccante.',8.00,'Riso sushi, salmone, avocado','Best seller',false,false,false,false,false,true,100),
('20000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000003','Philadelphia Roll 4pz','Uramaki con salmone e formaggio cremoso.',7.50,'Salmone, formaggio cremoso',null,false,false,false,false,false,false,110),
('20000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000004','Hosomaki Salmone 6pz','Hosomaki lineare e classico al salmone.',4.50,'Salmone, riso sushi',null,false,false,false,true,false,false,120),
('20000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000005','Tuna Gunkan 2pz','Gunkan con tartare di tonno.',5.00,'Tonno, alga nori',null,false,false,false,true,true,false,130),
('20000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000005','Sashimi Salmone 3pz','Fette di salmone selezionato.',5.50,'Salmone',null,false,false,false,true,false,false,140),
('20000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000006','Poke Salmone','Bowl con salmone, riso, avocado e verdure.',10.00,'Salmone, riso, avocado','Lunch',false,false,false,false,false,true,150),
('20000000-0000-0000-0000-000000000016','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000007','Yaki Udon con Pollo','Udon saltati con pollo e verdure.',8.50,'Udon, pollo, verdure',null,false,false,false,false,false,false,160),
('20000000-0000-0000-0000-000000000017','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000007','Pollo alle Mandorle','Classico piatto caldo con mandorle croccanti.',7.50,'Pollo, mandorle',null,false,false,false,false,false,false,170),
('20000000-0000-0000-0000-000000000018','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000007','Anatra Croccante','Anatra croccante in stile fusion.',10.00,null,'Best seller',false,false,false,false,false,true,180),
('20000000-0000-0000-0000-000000000019','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000008','Gamberi Tempura','Gamberi in tempura leggera.',9.00,'Gamberi, pastella',null,false,false,false,false,false,false,190),
('20000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000009','Mochi Mix 3pz','Mochi assortiti.',5.50,null,'Dolce',false,false,false,false,false,false,200),
('20000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000010','Acqua','Naturale o frizzante.',2.00,null,null,false,false,false,false,false,false,210),
('20000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000010','Birra Asahi','Birra giapponese.',4.50,null,null,false,false,false,false,false,false,220)
on conflict (id) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  ingredients = excluded.ingredients,
  badge = excluded.badge,
  is_vegetarian = excluded.is_vegetarian,
  is_vegan = excluded.is_vegan,
  is_spicy = excluded.is_spicy,
  is_raw = excluded.is_raw,
  is_new = excluded.is_new,
  is_best_seller = excluded.is_best_seller,
  sort_order = excluded.sort_order;

insert into public.menu_item_allergens (menu_item_id, allergen_id) values
('20000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002'),
('20000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000003'),
('20000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000007','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000008','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000009','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000010','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000011','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000011','50000000-0000-0000-0000-000000000005'),
('20000000-0000-0000-0000-000000000012','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000013','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000014','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000015','50000000-0000-0000-0000-000000000004'),
('20000000-0000-0000-0000-000000000016','50000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000016','50000000-0000-0000-0000-000000000006'),
('20000000-0000-0000-0000-000000000019','50000000-0000-0000-0000-000000000002'),
('20000000-0000-0000-0000-000000000019','50000000-0000-0000-0000-000000000001')
on conflict do nothing;

insert into public.dining_areas (id, restaurant_id, name, description, sort_order) values
('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Interno','Sala principale con atmosfera minimale.',1),
('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Esterno','Area esterna per le serate piu miti.',2)
on conflict (id) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.restaurant_tables (id, restaurant_id, dining_area_id, name, seats_min, seats_max, sort_order) values
('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Tavolo I-01',1,2,1),
('40000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Tavolo I-02',2,4,2),
('40000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Tavolo I-03',4,6,3),
('40000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','Tavolo E-01',1,2,4),
('40000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','Tavolo E-02',2,4,5)
on conflict (id) do update set dining_area_id = excluded.dining_area_id, name = excluded.name, seats_min = excluded.seats_min, seats_max = excluded.seats_max, sort_order = excluded.sort_order;

insert into public.opening_hours (restaurant_id, dining_area_id, weekday, start_time, end_time)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  area.id,
  day.weekday,
  window.start_time::time,
  window.end_time::time
from public.dining_areas area
cross join (values (0),(1),(2),(3),(4),(5),(6)) as day(weekday)
cross join (values ('12:00','15:00'), ('19:00','23:30')) as window(start_time,end_time)
where not exists (
  select 1 from public.opening_hours existing
  where existing.dining_area_id = area.id
    and existing.weekday = day.weekday
    and existing.start_time = window.start_time::time
    and existing.end_time = window.end_time::time
);
