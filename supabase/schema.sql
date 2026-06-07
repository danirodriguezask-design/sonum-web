-- ============================================================
-- SONUM — Schema de base de datos
-- Pegar esto en Supabase > SQL Editor > New Query > Run
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── EVENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  artist      TEXT NOT NULL,
  date        TIMESTAMPTZ NOT NULL,
  venue       TEXT NOT NULL,
  description TEXT,
  cover_url   TEXT,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TICKET TYPES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_types (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,           -- 'General' | 'VIP' | 'Backstage' | 'Mesa'
  price           INTEGER NOT NULL DEFAULT 0, -- en pesos ARS (0 = consulta)
  quantity_total  INTEGER NOT NULL DEFAULT 100,
  quantity_sold   INTEGER NOT NULL DEFAULT 0,
  active          BOOLEAN DEFAULT TRUE
);

-- ─── RR.PP. ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rrpp (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  code            TEXT UNIQUE NOT NULL,    -- ej: "martin-g"
  event_id        UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  commission_pct  INTEGER NOT NULL DEFAULT 10,
  mp_account      TEXT,                   -- email MP (para futuro split)
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id          UUID REFERENCES events(id) NOT NULL,
  ticket_type_id    UUID REFERENCES ticket_types(id) NOT NULL,
  buyer_name        TEXT NOT NULL,
  buyer_email       TEXT NOT NULL,
  buyer_phone       TEXT NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1,
  total_amount      INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | cancelled
  rrpp_id           UUID REFERENCES rrpp(id),
  mp_payment_id     TEXT,
  mp_preference_id  TEXT,
  qr_code           TEXT,                -- data URL del QR
  ticket_code       TEXT UNIQUE,         -- código alfanumérico único
  checked_in        BOOLEAN DEFAULT FALSE,
  checked_in_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FUNCIÓN: incrementar cantidad vendida ───────────────────
CREATE OR REPLACE FUNCTION increment_sold(type_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE ticket_types
  SET quantity_sold = quantity_sold + qty
  WHERE id = type_id;
END;
$$ LANGUAGE plpgsql;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrpp        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;

-- Lectura pública: eventos y ticket_types (para mostrar en la web)
CREATE POLICY "Eventos públicos" ON events      FOR SELECT USING (active = TRUE);
CREATE POLICY "Tickets públicos"  ON ticket_types FOR SELECT USING (active = TRUE);
-- RRPP: lectura pública (para verificar código en checkout)
CREATE POLICY "RRPP públicos"    ON rrpp        FOR SELECT USING (active = TRUE);
-- Orders: solo el service_role puede leer/escribir (desde el servidor)
CREATE POLICY "Orders server only" ON orders FOR ALL USING (FALSE);

-- ─── DATOS INICIALES: Evento Louden 19/06 ───────────────────
INSERT INTO events (slug, name, artist, date, venue, description, active)
VALUES (
  'louden-19-junio-2026',
  'SONUM presenta: LOUDEN',
  'LOUDEN',
  '2026-06-19T23:00:00-03:00',
  'Club Paraguay — Av. Marcelo T. de Alvear 651, Córdoba',
  'LOUDEN vuelve a Córdoba para una noche que no vas a olvidar. Groove, baile y música electrónica al más alto nivel.',
  TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- Tickets para el evento (reemplazá el event_id con el que te devuelve Supabase)
-- Primero ejecutá el INSERT de arriba, copiá el ID del evento, y usalo acá:
-- INSERT INTO ticket_types (event_id, name, price, quantity_total) VALUES
--   ('<EVENT_ID>', 'General',   8000,  200),
--   ('<EVENT_ID>', 'VIP',       15000, 80),
--   ('<EVENT_ID>', 'Backstage', 25000, 20),
--   ('<EVENT_ID>', 'Mesa',      0,     10);

-- ─── ÍNDICES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_event        ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_rrpp         ON orders(rrpp_id);
CREATE INDEX IF NOT EXISTS idx_orders_ticket_code  ON orders(ticket_code);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event  ON ticket_types(event_id);
