"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReflections } from "@/lib/hooks/useReflections";
import { useBooks } from "@/lib/hooks/useBooks";
import { useQuotes } from "@/lib/hooks/useQuotes";
import { ReflectionCard } from "@/components/ReflectionCard";
import { QuoteCard } from "@/components/QuoteCard";
import { QuoteForm } from "@/components/QuoteForm";
import { BottomNav } from "@/components/BottomNav";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<"reflections" | "quotes">("reflections");
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();

  const { reflections, loading: loadingReflections, deleteReflection, updateReflection } = useReflections({
    bookId: selectedBookId,
    tag: selectedTag,
  });

  const { quotes, loading: loadingQuotes, deleteQuote, updateQuote, addQuote } = useQuotes({
    bookId: selectedBookId,
    tag: selectedTag,
  });

  const { books } = useBooks();

  const loading = activeTab === "reflections" ? loadingReflections : loadingQuotes;
  const itemsCount = activeTab === "reflections" ? reflections.length : quotes.length;

  const allTags = useMemo(() => {
    const set = new Set<string>();
    if (activeTab === "reflections") {
      reflections.forEach((r) => r.tags.forEach((t) => set.add(t)));
    } else {
      quotes.forEach((q) => q.tags.forEach((t) => set.add(t)));
    }
    return Array.from(set).sort();
  }, [reflections, quotes, activeTab]);

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

      {/* Selector de Pestañas */}
      <motion.div
        className="flex bg-[var(--surface)] p-1 rounded-2xl mb-5 border border-[var(--border)]"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}
      >
        <button
          onClick={() => {
            setActiveTab("reflections");
            setSelectedTag(undefined);
          }}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "reflections"
              ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          Reflexiones
        </button>
        <button
          onClick={() => {
            setActiveTab("quotes");
            setSelectedTag(undefined);
          }}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "quotes"
              ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          Citas
        </button>
      </motion.div>

      {/* Controles de Filtros */}
      <motion.div
        className="flex flex-col gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <select
          value={selectedBookId ?? ""}
          onChange={(e) => setSelectedBookId(e.target.value || undefined)}
          className="w-full px-3.5 py-3.5 border border-[var(--border)] rounded-2xl bg-[var(--bg)] text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">Todos los libros</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <motion.button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
                whileTap={{ scale: 0.94 }}
                className={`px-3 py-2 text-[10px] uppercase tracking-wider font-semibold rounded-full border transition-colors cursor-pointer ${
                  selectedTag === tag
                    ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
                #{tag}
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Formulario para agregar citas (solo en la pestaña de citas) */}
      {activeTab === "quotes" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <QuoteForm onSave={addQuote} />
        </motion.div>
      )}

      {/* Contenedor principal de items */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.p
            key="loading"
            className="text-sm text-[var(--muted)] text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Cargando...
          </motion.p>
        )}

        {!loading && itemsCount === 0 && (
          <motion.p
            key="empty"
            className="text-sm text-[var(--muted)] text-center py-12 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {activeTab === "reflections"
              ? "Aún no hay reflexiones. Mantené presionado el grabador y compartí tu primer pensamiento."
              : "Aún no agregaste citas textuales. Desplegá el formulario superior e ingresá tu primera cita."}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div className="flex flex-col gap-3.5">
        <AnimatePresence initial={false}>
          {!loading && activeTab === "reflections"
            ? reflections.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.97 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                >
                  <ReflectionCard reflection={r} onDelete={deleteReflection} onUpdate={updateReflection} />
                </motion.div>
              ))
            : !loading && quotes.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.97 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                >
                  <QuoteCard quote={q} onDelete={deleteQuote} onUpdate={updateQuote} />
                </motion.div>
              ))}
        </AnimatePresence>
      </motion.div>

      <BottomNav />
    </main>
  );
}
