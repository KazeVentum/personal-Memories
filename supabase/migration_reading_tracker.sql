-- Reading Tracker: add progress columns to books + reading_logs table

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS total_pages  INTEGER,
  ADD COLUMN IF NOT EXISTS current_page INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS reading_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id     UUID        REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  pages_read  INTEGER     NOT NULL DEFAULT 0,
  logged_at   DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reading_logs_unique_day
  ON reading_logs(user_id, book_id, logged_at);

CREATE INDEX IF NOT EXISTS idx_reading_logs_user_date
  ON reading_logs(user_id, logged_at DESC);

ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_reading_logs_select"
  ON reading_logs FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reading_logs_insert"
  ON reading_logs FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reading_logs_update"
  ON reading_logs FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reading_logs_delete"
  ON reading_logs FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- RPC para upsert acumulativo (suma pages_read si ya existe el registro del dia)
CREATE OR REPLACE FUNCTION upsert_reading_log(
  p_user_id   UUID,
  p_book_id   UUID,
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
