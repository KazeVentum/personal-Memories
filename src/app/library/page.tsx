"use client";
import { useState, useMemo } from "react";
import { useReflections } from "@/lib/hooks/useReflections";
import { useBooks } from "@/lib/hooks/useBooks";
import { ReflectionCard } from "@/components/ReflectionCard";
import { BottomNav } from "@/components/BottomNav";

export default function LibraryPage() {
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();

  const { reflections, loading, deleteReflection, updateReflection } = useReflections({
    bookId: selectedBookId,
    tag: selectedTag,
  });
  const { books } = useBooks();

  const allTags = useMemo(() => {
    const set = new Set<string>();
    reflections.forEach((r) => r.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [reflections]);

  return (
    <main className="min-h-screen flex flex-col px-6 pt-10 pb-24 max-w-md mx-auto w-full">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-[var(--fg)] mb-6">
        Biblioteca
      </h1>

      <div className="flex flex-col gap-3 mb-6">
        <select
          value={selectedBookId ?? ""}
          onChange={(e) => setSelectedBookId(e.target.value || undefined)}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Todos los libros</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedTag === tag
                    ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-[var(--muted)] text-center py-8">Cargando...</p>}

      {!loading && reflections.length === 0 && (
        <p className="text-sm text-[var(--muted)] text-center py-8">
          Aún no hay reflexiones. Grabá tu primer pensamiento.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {reflections.map((r) => (
          <ReflectionCard key={r.id} reflection={r} onDelete={deleteReflection} onUpdate={updateReflection} />
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
