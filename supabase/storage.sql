INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reflections',
  'reflections',
  false,
  52428800,
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users_own_audio_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reflections' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

CREATE POLICY "users_own_audio_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reflections' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

CREATE POLICY "users_own_audio_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'reflections' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
