CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- TABLA: books
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         TEXT        NOT NULL,
  author        TEXT,
  total_pages   INTEGER,
  current_page  INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id, created_at DESC);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_books_select" ON books FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_books_insert" ON books FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_books_update" ON books FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_books_delete" ON books FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ─────────────────────────────────────────
-- TABLA: reflections
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reflections (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id          UUID        REFERENCES books(id) ON DELETE SET NULL,
  page_number      INTEGER,
  title            TEXT,
  audio_path       TEXT        NOT NULL,
  duration_seconds INTEGER,
  tags             TEXT[]      NOT NULL DEFAULT '{}',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reflections_user_created ON reflections(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflections_book         ON reflections(book_id);
CREATE INDEX IF NOT EXISTS idx_reflections_tags         ON reflections USING GIN(tags);

ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_reflections_select" ON reflections FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reflections_insert" ON reflections FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reflections_update" ON reflections FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reflections_delete" ON reflections FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ─────────────────────────────────────────
-- TABLA: quotes
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id     UUID        REFERENCES books(id) ON DELETE SET NULL,
  page_number INTEGER,
  quote_text  TEXT        NOT NULL,
  notes       TEXT,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_user_created ON quotes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_book         ON quotes(book_id);
CREATE INDEX IF NOT EXISTS idx_quotes_tags         ON quotes USING GIN(tags);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_quotes_select" ON quotes FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_quotes_insert" ON quotes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_quotes_update" ON quotes FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_quotes_delete" ON quotes FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ─────────────────────────────────────────
-- TABLA: reading_logs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reading_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id     UUID        REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  pages_read  INTEGER     NOT NULL DEFAULT 0,
  logged_at   DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un solo registro por usuario+libro+día (upsert acumulativo)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reading_logs_unique_day  ON reading_logs(user_id, book_id, logged_at);
CREATE INDEX        IF NOT EXISTS idx_reading_logs_user_date   ON reading_logs(user_id, logged_at DESC);

ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_reading_logs_select" ON reading_logs FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reading_logs_insert" ON reading_logs FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reading_logs_update" ON reading_logs FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reading_logs_delete" ON reading_logs FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- ─────────────────────────────────────────
-- FUNCIÓN: upsert_reading_log
-- Acumula pages_read si ya existe un registro para ese día
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION upsert_reading_log(
  p_user_id    UUID,
  p_book_id    UUID,
  p_pages_read INTEGER,
  p_logged_at  DATE
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO reading_logs (user_id, book_id, pages_read, logged_at)
  VALUES (p_user_id, p_book_id, p_pages_read, p_logged_at)
  ON CONFLICT (user_id, book_id, logged_at)
  DO UPDATE SET pages_read = reading_logs.pages_read + EXCLUDED.pages_read;
END;
$$;
