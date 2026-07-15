/**
 * Client locale che imita la parte di Supabase usata dall'app Kokoro.
 * In demo persiste un piccolo database ristorante in localStorage.
 */
import {
  buildDemoDb,
  demoUsers,
  type DemoUser,
  withDemoMenuRelations,
} from '@/lib/demoData';

const DB_KEY = 'kokoro_demo_database_v1';
const SESSION_KEY = 'kokoro_demo_session_v1';
const USERS_KEY = 'kokoro_demo_users_v1';

type Row = Record<string, any>;
type Db = Record<string, Row[]>;

function loadDb(): Db {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (isCurrentDemoDb(parsed)) return parsed;
    } catch {
      /* ignore */
    }
  }
  const seed = buildDemoDb() as unknown as Db;
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}

function isCurrentDemoDb(db: Db): boolean {
  return Boolean(
    db?.restaurants?.length &&
      db?.menu_items?.length &&
      db?.dining_areas?.length &&
      db?.restaurant_tables?.length &&
      db?.reservations
  );
}

function saveDb(db: Db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function loadUsers(): DemoUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  return [...demoUsers];
}

function saveUsers(users: DemoUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function uid() {
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const nowIso = () => new Date().toISOString();

type Sub = { table: string; userId: string | null; cb: (p: { new: Row }) => void };
const subs: Sub[] = [];

function emitInsert(table: string, row: Row) {
  subs.forEach((sub) => {
    if (sub.table === table && (!sub.userId || sub.userId === row.user_id)) sub.cb({ new: row });
  });
}

function pushNotification(db: Db, notification: Row) {
  const full = {
    id: uid(),
    read: false,
    reservation_id: null,
    type: 'system',
    message: '',
    created_at: nowIso(),
    ...notification,
  };
  db.notifications.push(full);
  emitInsert('notifications', full);
}

function notifyOnReservation(db: Db, reservation: Row, event: 'insert' | 'cancel') {
  const customer = db.profiles.find((profile) => profile.id === reservation.customer_id);
  const table = db.restaurant_tables.find((item) => item.id === reservation.table_id);
  const area = db.dining_areas.find((item) => item.id === reservation.dining_area_id);
  const when = new Date(reservation.starts_at).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const admins = db.profiles.filter((profile) => profile.role === 'admin');
  const tableLabel = `${table?.name ?? 'tavolo'} ${area ? `(${area.name})` : ''}`.trim();
  const customerName = reservation.customer_name || customer?.full_name || customer?.email || 'Cliente';
  const partySize = reservation.party_size ? `${reservation.party_size} persone` : 'coperti da definire';

  if (event === 'insert') {
    pushNotification(db, {
      user_id: reservation.customer_id,
      title: 'Richiesta ricevuta',
      message: `Richiesta per ${tableLabel} e ${partySize} ricevuta per il ${when}.`,
      type: 'reservation_created',
      reservation_id: reservation.id,
    });
    admins.forEach((admin) =>
      pushNotification(db, {
        user_id: admin.id,
        title: 'Nuova prenotazione',
        message: `${customerName} ha richiesto ${tableLabel} per ${partySize} il ${when}.`,
        type: 'reservation_created',
        reservation_id: reservation.id,
      })
    );
  } else {
    pushNotification(db, {
      user_id: reservation.customer_id,
      title: 'Prenotazione cancellata',
      message: `${tableLabel} del ${when} e stato annullato.`,
      type: 'reservation_cancelled',
      reservation_id: reservation.id,
    });
    admins.forEach((admin) =>
      pushNotification(db, {
        user_id: admin.id,
        title: 'Prenotazione cancellata',
        message: `${customerName} ha annullato ${tableLabel} del ${when}.`,
        type: 'reservation_cancelled',
        reservation_id: reservation.id,
      })
    );
  }
}

type Filter = { type: 'eq' | 'in' | 'gte' | 'lte'; col: string; val: any };

class LocalQuery implements PromiseLike<{ data: any; error: any }> {
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private filters: Filter[] = [];
  private payload: Row | Row[] | null = null;
  private selectStr = '*';
  private wantSelect = false;
  private singleRow = false;
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;

  constructor(private table: string) {}

  select(str = '*') {
    if (this.op === 'select') this.selectStr = str;
    else this.wantSelect = true;
    return this;
  }
  insert(payload: Row | Row[]) { this.op = 'insert'; this.payload = payload; return this; }
  update(payload: Row) { this.op = 'update'; this.payload = payload; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(col: string, val: any) { this.filters.push({ type: 'eq', col, val }); return this; }
  in(col: string, val: any[]) { this.filters.push({ type: 'in', col, val }); return this; }
  gte(col: string, val: any) { this.filters.push({ type: 'gte', col, val }); return this; }
  lte(col: string, val: any) { this.filters.push({ type: 'lte', col, val }); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orderCol = col; this.orderAsc = opts?.ascending !== false; return this; }
  limit(n: number) { this.limitN = n; return this; }
  single() { this.singleRow = true; return this; }
  maybeSingle() { this.singleRow = true; return this; }

  private match(row: Row) {
    return this.filters.every((filter) => {
      const value = row[filter.col];
      if (filter.type === 'eq') return value === filter.val;
      if (filter.type === 'in') return filter.val.includes(value);
      if (filter.type === 'gte') return value >= filter.val;
      if (filter.type === 'lte') return value <= filter.val;
      return true;
    });
  }

  private hydrate(db: Db, rows: Row[]) {
    if (this.table === 'reservations' && this.selectStr.includes('dining_area:dining_areas')) {
      return rows.map((reservation) => ({
        ...reservation,
        dining_area: db.dining_areas.find((area) => area.id === reservation.dining_area_id) ?? null,
        table: db.restaurant_tables.find((table) => table.id === reservation.table_id) ?? null,
        customer: db.profiles.find((profile) => profile.id === reservation.customer_id) ?? null,
      }));
    }

    if (this.table === 'menu_items' && this.selectStr.includes('category:menu_categories')) {
      return withDemoMenuRelations(rows as any, db as any);
    }

    if (this.table === 'restaurant_tables' && this.selectStr.includes('dining_area:dining_areas')) {
      return rows.map((table) => ({
        ...table,
        dining_area: db.dining_areas.find((area) => area.id === table.dining_area_id) ?? null,
      }));
    }

    return rows;
  }

  private run(): { data: any; error: any } {
    const db = loadDb();
    const list = db[this.table] ?? (db[this.table] = []);

    if (this.op === 'insert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload!];
      const inserted: Row[] = [];

      for (const item of items) {
        if (this.table === 'reservations' && !['cancelled', 'rejected'].includes(item.status ?? 'pending')) {
          const clash = list.some(
            (reservation) =>
              reservation.table_id === item.table_id &&
              !['cancelled', 'rejected'].includes(reservation.status) &&
              new Date(item.starts_at) < new Date(reservation.ends_at) &&
              new Date(item.ends_at) > new Date(reservation.starts_at)
          );
          if (clash) return { data: null, error: { code: '23P01', message: 'Slot gia occupato' } };
        }

        const row: Row = { id: item.id ?? uid(), created_at: nowIso(), updated_at: nowIso(), ...item };
        list.push(row);
        inserted.push(row);
        if (this.table === 'reservations') notifyOnReservation(db, row, 'insert');
      }

      saveDb(db);
      const data = this.singleRow ? inserted[0] : inserted;
      return { data: this.wantSelect || this.singleRow ? data : null, error: null };
    }

    if (this.op === 'update') {
      const updated: Row[] = [];
      list.forEach((row, index) => {
        if (this.match(row)) {
          const previousStatus = row.status;
          const next: Row = { ...row, ...(this.payload as Row), updated_at: nowIso() };
          list[index] = next;
          updated.push(next);
          if (this.table === 'reservations' && next.status === 'cancelled' && previousStatus !== 'cancelled') {
            notifyOnReservation(db, next, 'cancel');
          }
        }
      });
      saveDb(db);
      const data = this.singleRow ? updated[0] ?? null : updated;
      return { data: this.wantSelect || this.singleRow ? data : null, error: null };
    }

    if (this.op === 'delete') {
      const target = list.filter((row) => this.match(row));
      if (
        this.table === 'restaurant_tables' &&
        target.some((table) => db.reservations.some((reservation) => reservation.table_id === table.id))
      ) {
        return { data: null, error: { code: '23503', message: 'Tabella collegata a prenotazioni' } };
      }
      if (
        this.table === 'dining_areas' &&
        target.some((area) => db.reservations.some((reservation) => reservation.dining_area_id === area.id))
      ) {
        return { data: null, error: { code: '23503', message: 'Area collegata a prenotazioni' } };
      }
      db[this.table] = list.filter((row) => !this.match(row));
      saveDb(db);
      return { data: null, error: null };
    }

    let rows = list.filter((row) => this.match(row));
    if (this.orderCol) {
      const col = this.orderCol;
      rows = [...rows].sort((a, b) => {
        const av = a[col];
        const bv = b[col];
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (this.orderAsc ? 1 : -1);
      });
    }
    if (this.limitN != null) rows = rows.slice(0, this.limitN);
    rows = this.hydrate(db, rows);
    if (this.singleRow) {
      return rows.length ? { data: rows[0], error: null } : { data: null, error: { message: 'No rows' } };
    }
    return { data: rows, error: null };
  }

  then<R1 = { data: any; error: any }, R2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    try {
      return Promise.resolve(this.run()).then(onfulfilled, onrejected);
    } catch (error) {
      return Promise.resolve({ data: null, error }).then(onfulfilled, onrejected);
    }
  }
}

type AuthCb = (event: string, session: any) => void;
const authCbs: AuthCb[] = [];

function getStoredSession(): any {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setStoredSession(session: any) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  authCbs.forEach((cb) => cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
}

function sessionFor(userId: string, email: string) {
  return { access_token: 'demo', token_type: 'bearer', user: { id: userId, email } };
}

const localAuth = {
  async getSession() {
    return { data: { session: getStoredSession() }, error: null };
  },
  onAuthStateChange(cb: AuthCb) {
    authCbs.push(cb);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = authCbs.indexOf(cb);
            if (index >= 0) authCbs.splice(index, 1);
          },
        },
      },
    };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const users = loadUsers();
    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) return { data: { session: null }, error: { message: 'Credenziali non valide' } };
    const session = sessionFor(user.id, user.email);
    setStoredSession(session);
    return { data: { session }, error: null };
  },
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string; phone?: string } } }) {
    const users = loadUsers();
    if (users.some((user) => user.email === email)) {
      return { data: { session: null }, error: { message: 'Email gia registrata' } };
    }
    const id = uid();
    const nextUser = { id, email, password };
    users.push(nextUser);
    saveUsers(users);

    const db = loadDb();
    db.profiles.push({
      id,
      full_name: options?.data?.full_name || email,
      email,
      phone: options?.data?.phone || null,
      role: 'client',
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    saveDb(db);

    const session = sessionFor(id, email);
    setStoredSession(session);
    return { data: { session }, error: null };
  },
  async signOut() {
    setStoredSession(null);
    return { error: null };
  },
};

export const localClient = {
  from(table: string) {
    return new LocalQuery(table);
  },
  auth: localAuth,
  channel(_name: string) {
    let sub: Sub | null = null;
    return {
      on(_event: string, cfg: any, cb: (payload: { new: Row }) => void) {
        const match = String(cfg?.filter ?? '').match(/user_id=eq\.(.+)$/);
        sub = { table: cfg?.table ?? 'notifications', userId: match?.[1] ?? null, cb };
        return this;
      },
      subscribe() {
        if (sub) subs.push(sub);
        return { unsubscribe: () => this.unsubscribe() };
      },
      unsubscribe() {
        if (!sub) return;
        const index = subs.indexOf(sub);
        if (index >= 0) subs.splice(index, 1);
      },
    };
  },
  removeChannel(channel: { unsubscribe?: () => void }) {
    channel.unsubscribe?.();
  },
};
