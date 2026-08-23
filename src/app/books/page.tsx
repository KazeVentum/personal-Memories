"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { useBooks } from "@/lib/hooks/useBooks";
import { useReadingLogs } from "@/lib/hooks/useReadingLogs";
import { BottomNav } from "@/components/BottomNav";
import { BookProgressBar } from "@/components/BookProgressBar";
import { ReadingHeatmap } from "@/components/ReadingHeatmap";
import { PageUpdateSheet } from "@/components/PageUpdateSheet";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Sidebar } from "@/components/Sidebar";
import type { Book } from "@/types";

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
  exit: { opacity: 0, x: -20, scale: 0.97, transition: { duration: 0.2 } },
};

function BookRow({
  book,
  onUpdate,
  onDelete,
  onOpenSheet,
}: {
  book: Book;
  onUpdate: (id: string, title: string, author?: string, totalPages?: number) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onOpenSheet: (book: Book) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? "");
  const [totalPages, setTotalPages] = useState(book.total_pages?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const tp = totalPages ? parseInt(totalPages, 10) : undefined;
    const ok = await onUpdate(book.id, title.trim(), author.trim() || undefined, tp);
    if (ok) setEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setTitle(book.title);
    setAuthor(book.author ?? "");
    setTotalPages(book.total_pages?.toString() ?? "");
    setEditing(false);
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-[var(--border)] rounded-xl bg-transparent text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]";

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible" exit="exit" className="md:border md:border-[var(--border)] md:rounded-2xl md:bg-[var(--surface)] md:overflow-hidden md:mb-4 md:break-inside-avoid">
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="editing"
            className="flex flex-col gap-2 py-4 border-b border-[var(--border)] md:border-b-0 md:p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className={inputClass} autoFocus />
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Autor (opcional)" className={inputClass} />
            <input
              type="number"
              min={1}
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
              placeholder="Total de páginas (opcional)"
              className={inputClass}
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="flex-1 py-3 text-sm bg-[var(--fg)] text-[var(--bg)] rounded-xl hover:opacity-80 disabled:opacity-50 transition-opacity"
              >
                {saving ? "..." : "Guardar"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 text-sm border border-[var(--border)] text-[var(--muted)] rounded-xl hover:border-[var(--accent)] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            className="flex flex-col py-4 border-b border-[var(--border)] gap-3 md:border-b-0 md:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[var(--fg)] font-[family-name:var(--font-fraunces)] truncate">{book.title}</span>
                {book.author && <span className="text-sm text-[var(--muted)] truncate">{book.author}</span>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  aria-label="Editar"
                  title="Editar"
                  className="p-2 text-[var(--muted)] border border-[var(--border)] rounded-lg hover:text-[var(--fg)] hover:border-[var(--accent)] transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmingDelete(true)}
                  aria-label="Eliminar"
                  title="Eliminar"
                  className="p-2 text-[var(--muted)] border border-[var(--border)] rounded-lg hover:text-[var(--danger)] hover:border-[var(--danger)] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <BookProgressBar current={book.current_page} total={book.total_pages} />
              <button
                onClick={() => onOpenSheet(book)}
                className="self-start px-4 py-2 text-xs font-medium text-[var(--accent)] border border-[var(--accent)]/40 rounded-xl hover:bg-[var(--accent)]/10 transition-colors"
              >
                {book.current_page === 0 ? "Iniciar" : "Actualizar"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmingDelete}
        title={`¿Eliminar "${book.title}"?`}
        description="Se eliminará el libro y su progreso de lectura de forma permanente."
        onConfirm={() => { onDelete(book.id); setConfirmingDelete(false); }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </motion.div>
  );
}

export default function BooksPage() {
  const { books, loading, addBook, updateBook, deleteBook, updateCurrentPage } = useBooks();
  const { logs } = useReadingLogs();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [saving, setSaving] = useState(false);
  const [sheetBook, setSheetBook] = useState<Book | null>(null);

  const inputClass =
    "w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-transparent text-sm text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const tp = totalPages ? parseInt(totalPages, 10) : undefined;
    await addBook(title.trim(), author.trim() || undefined, tp);
    setTitle("");
    setAuthor("");
    setTotalPages("");
    setSaving(false);
  };

  return (
    <>
    <Sidebar />
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-36 max-w-md md:max-w-3xl mx-auto w-full md:pl-64 md:pb-16 md:pt-16 xl:max-w-5xl 2xl:max-w-7xl">
      <motion.h1
        className="font-[family-name:var(--font-fraunces)] text-2xl md:text-3xl text-[var(--fg)] mb-6 md:mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Mis libros
      </motion.h1>

      <div className="flex flex-col gap-8 md:grid md:grid-cols-2 md:gap-6 md:items-stretch mb-8">
        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <input type="text" placeholder="Título *" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
          <input type="text" placeholder="Autor (opcional)" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
          <input
            type="number"
            min={1}
            placeholder="Total de páginas (opcional)"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            className={inputClass}
          />
          <motion.button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full py-3 mt-1 bg-[var(--fg)] text-[var(--bg)] text-sm font-medium rounded-xl disabled:opacity-50 transition-opacity"
            whileTap={{ scale: 0.97 }}
          >
            {saving ? "Guardando..." : "Agregar libro"}
          </motion.button>
        </motion.form>

        <motion.div
          className="p-4 rounded-2xl bg-[var(--surface)] flex flex-col justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ReadingHeatmap logs={logs} />
        </motion.div>
      </div>

      {loading && (
        <motion.p className="text-sm text-[var(--muted)] text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Cargando...
        </motion.p>
      )}

      {!loading && books.length === 0 && (
        <motion.p
          className="text-sm text-[var(--muted)] text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Aún no agregaste libros.
        </motion.p>
      )}

      <motion.div className="flex flex-col md:block md:columns-2 md:gap-4 xl:columns-3 2xl:columns-4">
        <AnimatePresence initial={false}>
          {books.map((book) => (
            <BookRow
              key={book.id}
              book={book}
              onUpdate={updateBook}
              onDelete={deleteBook}
              onOpenSheet={setSheetBook}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <PageUpdateSheet
        book={sheetBook}
        onClose={() => setSheetBook(null)}
        onUpdate={updateCurrentPage}
      />

      <BottomNav />
    </main>
    </>
  );
}
