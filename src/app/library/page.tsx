"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <main className="min-h-screen flex flex-col px-5 pt-10 pb-36 max-w-md mx-auto w-full">
      <motion.h1
        className="font-[family-name:var(--font-fraunces)] text-2xl text-[var(--fg)] mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Biblioteca
      </motion.h1>

      <motion.div
        className="flex flex-col gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <select
          value={selectedBookId ?? ""}
          onChange={(e) => setSelectedBookId(e.target.value || undefined)}
          className="w-full px-3 py-3 border border-[var(--border)] rounded-xl bg-[var(--bg)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Todos los libros</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>{b.title}</option>
          ))}
        </select>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <motion.button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
                whileTap={{ scale: 0.93 }}
                className={`px-3 py-2 text-xs rounded-full border transition-colors ${
                  selectedTag === tag
                    ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.p
            key="loading"
            className="text-sm text-[var(--muted)] text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Cargando...
          </motion.p>
        )}

        {!loading && reflections.length === 0 && (
          <motion.p
            key="empty"
            className="text-sm text-[var(--muted)] text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Aún no hay reflexiones. Grabá tu primer pensamiento.
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {reflections.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, scale: 0.97 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <ReflectionCard reflection={r} onDelete={deleteReflection} onUpdate={updateReflection} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <BottomNav />
    </main>
  );
}
