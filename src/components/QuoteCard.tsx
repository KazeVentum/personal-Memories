"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Quote } from "@/types";
import { BookPicker } from "@/components/BookPicker";
import { TagInput } from "@/components/TagInput";

interface Props {
  quote: Quote;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    updates: Partial<Pick<Quote, "book_id" | "page_number" | "quote_text" | "notes" | "tags">>
  ) => Promise<boolean>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function QuoteCard({ quote, onDelete, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bookId, setBookId] = useState<string | null>(quote.book_id);
  const [pageNumber, setPageNumber] = useState(quote.page_number?.toString() ?? "");
  const [quoteText, setQuoteText] = useState(quote.quote_text);
  const [tags, setTags] = useState<string[]>(quote.tags);
  const [notes, setNotes] = useState(quote.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleDelete = () => {
    if (window.confirm("¿Eliminar esta cita de forma permanente?")) {
      onDelete(quote.id);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!quoteText.trim()) return;

    setSaving(true);
    const ok = await onUpdate(quote.id, {
      book_id: bookId,
      page_number: pageNumber ? parseInt(pageNumber, 10) : null,
      quote_text: quoteText.trim(),
      tags,
      notes: notes.trim() || null,
    });
    if (ok) setEditing(false);
    setSaving(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookId(quote.book_id);
    setPageNumber(quote.page_number?.toString() ?? "");
    setQuoteText(quote.quote_text);
    setTags(quote.tags);
    setNotes(quote.notes ?? "");
    setEditing(false);
  };

  const inputClass =
    "px-3 py-2.5 border border-[var(--border)] rounded-xl bg-transparent text-sm text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]";

  return (
    <div
      onClick={() => !editing && setExpanded((v) => !v)}
      className="border border-[var(--border)] rounded-2xl p-5 transition-all hover:border-[var(--accent)] cursor-pointer bg-[var(--bg)] flex flex-col gap-3.5 relative overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
    >
      {/* Header — siempre visible */}
      {!editing && (
        <div className="flex flex-col gap-2.5">
          {/* Metadata superior */}
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] tracking-wide uppercase">
            <span>{formatDate(quote.created_at)}</span>
            {quote.page_number && (
              <span className="font-semibold text-[var(--accent)]">Página {quote.page_number}</span>
            )}
          </div>

          {/* Bloque de cita destacada en serif */}
          <div className="relative pl-1">
            <span className="absolute -top-3.5 -left-2 text-[var(--accent)] font-[family-name:var(--font-fraunces)] text-4xl opacity-20 pointer-events-none select-none">
              “
            </span>
            <p className="font-[family-name:var(--font-fraunces)] text-base italic leading-relaxed text-[var(--fg)] pr-2 pl-2">
              {quote.quote_text}
            </p>
          </div>

          {/* Libro al que pertenece */}
          <div className="flex flex-col gap-1 border-t border-[var(--border)] pt-2 mt-1">
            <p className="text-xs font-semibold text-[var(--fg)] font-[family-name:var(--font-fraunces)] truncate">
              {quote.books?.title ?? <span className="text-[var(--muted)] italic font-sans font-normal">Sin libro asociado</span>}
            </p>
            {quote.books?.author && (
              <p className="text-[11px] text-[var(--muted)] truncate">— {quote.books.author}</p>
            )}
          </div>

          {/* Listado de tags */}
          {quote.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {quote.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] bg-[var(--surface)] text-[var(--muted)] rounded-full transition-colors hover:text-[var(--fg)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel expandido (comentarios y acciones) */}
      <AnimatePresence initial={false}>
        {expanded && !editing && (
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {quote.notes && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold">Tus Notas / Interpretación</span>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{quote.notes}</p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                className="flex-1 py-3 text-xs border border-[var(--border)] text-[var(--muted)] rounded-xl hover:border-[var(--accent)] hover:text-[var(--fg)] transition-colors"
              >
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex-1 py-3 text-xs border border-[var(--border)] text-[var(--muted)] rounded-xl hover:border-[var(--danger)] hover:text-[var(--danger)] transition-colors"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        )}

        {/* Panel de Edición en sitio */}
        {editing && (
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3.5 mt-1 pt-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Libro</label>
                <BookPicker value={bookId} onChange={setBookId} />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Cita Textual *</label>
                <textarea
                  required
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  rows={3}
                  className={`${inputClass} font-[family-name:var(--font-fraunces)] italic text-sm leading-relaxed resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Página</label>
                  <input
                    type="number"
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                    placeholder="opcional"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Tags</label>
                  <TagInput value={tags} onChange={setTags} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">Notas / Interpretación</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !quoteText.trim()}
                  className="flex-1 py-3 text-xs bg-[var(--fg)] text-[var(--bg)] font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? "..." : "Guardar"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 text-xs border border-[var(--border)] text-[var(--muted)] rounded-xl hover:border-[var(--accent)] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
