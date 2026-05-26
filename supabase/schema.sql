CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS books (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title      TEXT NOT NULL,
  author     TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS reflections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id          UUID REFERENCES books(id) ON DELETE SET NULL,
  page_number      INTEGER,
  audio_path       TEXT NOT NULL,
  duration_seconds INTEGER,
  tags             TEXT[] DEFAULT '{}' NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reflections_user_created ON reflections(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reflections_book ON reflections(book_id);
CREATE INDEX IF NOT EXISTS idx_reflections_tags ON reflections USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id, created_at DESC);

ALTER TABLE books       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_books_select"      ON books FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_books_insert"      ON books FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_books_update"      ON books FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_books_delete"      ON books FOR DELETE USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "users_own_reflections_select" ON reflections FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reflections_insert" ON reflections FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reflections_update" ON reflections FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_reflections_delete" ON reflections FOR DELETE USING ((SELECT auth.uid()) = user_id);
