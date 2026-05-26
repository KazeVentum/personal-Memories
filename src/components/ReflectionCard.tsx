"use client";
import { useState } from "react";
import type { Reflection } from "@/types";
import { AudioPlayer } from "@/components/AudioPlayer";
import { BookPicker } from "@/components/BookPicker";
import { TagInput } from "@/components/TagInput";

interface Props {
  reflection: Reflection;
  onDelete: (id: string, audioPath: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<Reflection, "book_id" | "page_number" | "tags" | "notes">>) => Promise<boolean>;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReflectionCard({ reflection, onDelete, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bookId, setBookId] = useState<string | null>(reflection.book_id);
  const [pageNumber, setPageNumber] = useState(reflection.page_number?.toString() ?? "");
  const [tags, setTags] = useState<string[]>(reflection.tags);
  const [notes, setNotes] = useState(reflection.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("¿Eliminar esta reflexión?")) {
      onDelete(reflection.id, reflection.audio_path);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(true);
    setEditing(true);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaving(true);
    const ok = await onUpdate(reflection.id, {
      book_id: bookId,
      page_number: pageNumber ? parseInt(pageNumber, 10) : null,
      tags,
      notes: notes.trim() || null,
    });
    if (ok) setEditing(false);
    setSaving(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookId(reflection.book_id);
    setPageNumber(reflection.page_number?.toString() ?? "");
    setTags(reflection.tags);
    setNotes(reflection.notes ?? "");
    setEditing(false);
  };

  const inputClass = "px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent text-sm text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]";

  return (
    <div
      onClick={() => !editing && setExpanded((v) => !v)}
      className="border border-[var(--border)] rounded-xl p-4 transition-colors hover:border-[var(--accent)] cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span>{formatDate(reflection.created_at)}</span>
            {reflection.duration_seconds && (
              <span className="text-xs">{formatDuration(reflection.duration_seconds)}</span>
            )}
          </div>
          <p className="text-[var(--fg)] font-[family-name:var(--font-fraunces)] truncate">
            {reflection.books?.title ?? <span className="text-[var(--muted)] italic">Sin libro</span>}
            {reflection.page_number && (
              <span className="text-[var(--muted)] text-sm ml-2">p. {reflection.page_number}</span>
            )}
          </p>
          {reflection.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {reflection.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-[var(--surface)] text-[var(--muted)] rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleEdit}
            className="text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="text-[var(--accent)] hover:text-[var(--danger)] text-lg leading-none transition-colors"
            aria-label="Eliminar"
          >
            ×
          </button>
        </div>
      </div>

      {expanded && !editing && (
        <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-2 mt-1">
          <AudioPlayer audioPath={reflection.audio_path} />
          {reflection.notes && (
            <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{reflection.notes}</p>
          )}
        </div>
      )}

      {editing && (
        <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-3 mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--muted)]">Libro</label>
            <BookPicker value={bookId} onChange={setBookId} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--muted)]">Página</label>
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              placeholder="opcional"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--muted)]">Tags</label>
            <TagInput value={tags} onChange={setTags} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--muted)]">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 text-sm bg-[var(--fg)] text-[var(--bg)] rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 text-sm border border-[var(--border)] text-[var(--muted)] rounded-lg hover:border-[var(--accent)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
