CREATE TABLE IF NOT EXISTS quotes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id     UUID REFERENCES books(id) ON DELETE SET NULL,
  page_number INTEGER,
  quote_text  TEXT NOT NULL,
  notes       TEXT,
  tags        TEXT[] DEFAULT '{}' NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para optimizar las consultas y filtros
CREATE INDEX IF NOT EXISTS idx_quotes_user_created ON quotes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_book ON quotes(book_id);
CREATE INDEX IF NOT EXISTS idx_quotes_tags ON quotes USING GIN(tags);

-- Habilitar Row Level Security (RLS)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para que solo el dueño de la cita pueda interactuar con ella
CREATE POLICY "users_own_quotes_select" ON quotes FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_quotes_insert" ON quotes FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_quotes_update" ON quotes FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "users_own_quotes_delete" ON quotes FOR DELETE USING ((SELECT auth.uid()) = user_id);
