"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBooks } from "@/lib/hooks/useBooks";
import { useReadingLogs } from "@/lib/hooks/useReadingLogs";
import { BottomNav } from "@/components/BottomNav";
import { BookProgressBar } from "@/components/BookProgressBar";
import { ReadingHeatmap } from "@/components/ReadingHeatmap";
import { PageUpdateSheet } from "@/components/PageUpdateSheet";
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
    <motion.div layout variants={itemVariants} initial="hidden" animate="visible" exit="exit">
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="editing"
            className="flex flex-col gap-2 py-4 border-b border-[var(--border)]"
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
            className="flex flex-col py-4 border-b border-[var(--border)] gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-[var(--fg)] font-[family-name:var(--font-fraunces)] truncate">{book.title}</span>
                {book.author && <span className="text-sm text-[var(--muted)] truncate">{book.author}</span>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-2 text-xs text-[var(--muted)] border border-[var(--border)] rounded-lg hover:text-[var(--fg)] hover:border-[var(--accent)] transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(book.id)}
                  className="px-3 py-2 text-xs text-[var(--muted)] border border-[var(--border)] rounded-lg hover:text-[var(--danger)] hover:border-[var(--danger)] transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <BookProgressBar current={book.current_page} total={book.total_pages} />
              </div>
              <button
                onClick={() => onOpenSheet(book)}
                className="flex-shrink-0 px-4 py-2 text-xs font-medium text-[var(--accent)] border border-[var(--accent)]/40 rounded-xl hover:bg-[var(--accent)]/10 transition-colors"
              >
                {book.current_page === 0 ? "Iniciar" : "Actualizar"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-36 max-w-md mx-auto w-full">
      <motion.h1
        className="font-[family-name:var(--font-fraunces)] text-2xl text-[var(--fg)] mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Mis libros
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 mb-8"
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

      <motion.div className="flex flex-col">
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

      <motion.div
        className="mt-10 p-4 rounded-2xl bg-[var(--surface)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <ReadingHeatmap logs={logs} />
      </motion.div>

      <PageUpdateSheet
        book={sheetBook}
        onClose={() => setSheetBook(null)}
        onUpdate={updateCurrentPage}
      />

      <BottomNav />
    </main>
  );
}
