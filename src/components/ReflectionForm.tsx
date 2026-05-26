"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookPicker } from "@/components/BookPicker";
import { TagInput } from "@/components/TagInput";

interface Props {
  audioBlob: Blob;
  duration: number;
  onSaved: () => void;
  onCancel: () => void;
}

export function ReflectionForm({ audioBlob, duration, onSaved, onCancel }: Props) {
  const [bookId, setBookId] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]";

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const reflectionId = crypto.randomUUID();
      const ext = audioBlob.type.includes("mp4") ? "mp4"
        : audioBlob.type.includes("ogg") ? "ogg"
        : "webm";
      const path = `${user.id}/${reflectionId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("reflections")
        .upload(path, audioBlob, { contentType: audioBlob.type || "audio/webm" });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("reflections").insert({
        id: reflectionId,
        user_id: user.id,
        book_id: bookId,
        page_number: pageNumber ? parseInt(pageNumber, 10) : null,
        audio_path: path,
        duration_seconds: duration,
        tags,
        notes: notes.trim() || null,
      });
      if (insertError) throw insertError;

      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-4 pb-20">
      <h2 className="font-[family-name:var(--font-fraunces)] text-lg text-[var(--fg)]">
        Guardar reflexión
      </h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-[var(--muted)]">Libro</label>
        <BookPicker value={bookId} onChange={setBookId} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-[var(--muted)]">Página</label>
        <input
          type="number"
          placeholder="opcional"
          value={pageNumber}
          onChange={(e) => setPageNumber(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-[var(--muted)]">Tags</label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-[var(--muted)]">Notas</label>
        <textarea
          placeholder="Escribí una nota sobre esta reflexión..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2 bg-[var(--fg)] text-[var(--bg)] rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 py-2 border border-[var(--border)] text-[var(--muted)] rounded-lg hover:border-[var(--accent)] disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
