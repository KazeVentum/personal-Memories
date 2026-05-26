"use client";
import { useState } from "react";
import { useBooks } from "@/lib/hooks/useBooks";
import { BottomNav } from "@/components/BottomNav";
import type { Book } from "@/types";

function BookRow({
  book,
  onUpdate,
  onDelete,
}: {
  book: Book;
  onUpdate: (id: string, title: string, author?: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const ok = await onUpdate(book.id, title.trim(), author.trim() || undefined);
    if (ok) setEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setTitle(book.title);
    setAuthor(book.author ?? "");
    setEditing(false);
  };

  const inputClass = "px-2 py-1 border border-[var(--border)] rounded-lg bg-transparent text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]";

  if (editing) {
    return (
      <div className="flex flex-col gap-2 py-3 border-b border-[var(--border)]">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className={inputClass}
          autoFocus
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Autor (opcional)"
          className={inputClass}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-3 py-1 text-xs bg-[var(--fg)] text-[var(--bg)] rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {saving ? "..." : "Guardar"}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-xs border border-[var(--border)] text-[var(--muted)] rounded-lg hover:border-[var(--accent)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)] group">
      <div className="flex flex-col">
        <span className="text-[var(--fg)] font-[family-name:var(--font-lora)]">{book.title}</span>
        {book.author && <span className="text-sm text-[var(--muted)]">{book.author}</span>}
      </div>
      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(book.id)}
          className="text-xs text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default function BooksPage() {
  const { books, loading, addBook, updateBook, deleteBook } = useBooks();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);

  const inputClass = "flex-1 px-3 py-2 border border-[var(--border)] rounded-lg bg-transparent text-sm text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await addBook(title.trim(), author.trim() || undefined);
    setTitle("");
    setAuthor("");
    setSaving(false);
  };

  return (
    <main className="min-h-screen flex flex-col px-6 pt-10 pb-24 max-w-md mx-auto w-full">
      <h1 className="font-[family-name:var(--font-lora)] text-2xl text-[var(--fg)] mb-6">
        Mis libros
      </h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input type="text" placeholder="Título *" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
        <input type="text" placeholder="Autor" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="px-4 py-2 bg-[var(--fg)] text-[var(--bg)] text-sm rounded-lg hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          +
        </button>
      </form>

      {loading && <p className="text-sm text-[var(--muted)] text-center py-8">Cargando...</p>}
      {!loading && books.length === 0 && (
        <p className="text-sm text-[var(--muted)] text-center py-8">Aún no agregaste libros.</p>
      )}

      <div className="flex flex-col">
        {books.map((book) => (
          <BookRow key={book.id} book={book} onUpdate={updateBook} onDelete={deleteBook} />
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
