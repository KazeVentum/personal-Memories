"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { Book } from "@/types";

interface PageUpdateSheetProps {
  book: Book | null;
  onClose: () => void;
  onUpdate: (bookId: string, newPage: number, previousPage: number) => Promise<boolean>;
}

export function PageUpdateSheet({ book, onClose, onUpdate }: PageUpdateSheetProps) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [kbOffset, setKbOffset] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (book) setValue(book.current_page.toString());
  }, [book]);

  // Detecta teclado virtual con visualViewport (API correcta para mobile)
  useEffect(() => {
    if (!book) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKbOffset(Math.max(0, offset));
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      setKbOffset(0);
    };
  }, [book]);

  const maxPage = book?.total_pages ?? 9999;
  const parsed = parseInt(value, 10) || 0;
  const pct = book?.total_pages ? Math.min(100, Math.round((parsed / book.total_pages) * 100)) : null;

  const adjust = (delta: number) =>
    setValue(String(Math.min(maxPage, Math.max(0, parsed + delta))));

  const handleSave = async () => {
    if (!book) return;
    setSaving(true);
    await onUpdate(book.id, parsed, book.current_page);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {book && (
        <>
          {/* Overlay encima de todo (BottomNav es z-50) */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet — sube con el teclado via kbOffset */}
          <motion.div
            key="sheet"
            className="fixed left-0 right-0 z-[70] bg-[var(--bg)] rounded-t-3xl shadow-2xl"
            style={{
              bottom: kbOffset,
              maxHeight: "88dvh",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Contenido scrolleable */}
            <div className="overflow-y-auto max-h-[88dvh] px-6 pt-4 pb-10">
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-[var(--border)] mx-auto mb-6" />

              {/* Header */}
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
                Actualizando
              </p>
              <p className="font-[family-name:var(--font-fraunces)] text-xl text-[var(--fg)] truncate mb-0.5">
                {book.title}
              </p>
              {book.total_pages && (
                <p className="text-sm text-[var(--muted)] mb-8">
                  {book.total_pages} páginas en total
                </p>
              )}

              {/* Stepper — 3 columnas fijas para que el + no se corte */}
              <div className="grid grid-cols-[64px_1fr_64px] gap-3 mb-6">
                <button
                  onClick={() => adjust(-1)}
                  className="h-16 rounded-2xl border-2 border-[var(--border)] flex items-center justify-center text-[var(--fg)] active:bg-[var(--surface)] transition-colors"
                >
                  <Minus size={24} />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={value}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setValue(raw === "" ? "" : String(Math.min(maxPage, parseInt(raw, 10))));
                  }}
                  onFocus={(e) => e.target.select()}
                  className="h-16 text-center text-4xl font-[family-name:var(--font-fraunces)] border-2 border-[var(--border)] rounded-2xl bg-transparent text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] w-full"
                />

                <button
                  onClick={() => adjust(1)}
                  className="h-16 rounded-2xl border-2 border-[var(--border)] flex items-center justify-center text-[var(--fg)] active:bg-[var(--surface)] transition-colors"
                >
                  <Plus size={24} />
                </button>
              </div>

              {/* Progress preview */}
              {book.total_pages && pct !== null && (
                <div className="mb-8">
                  <div className="h-2 w-full rounded-full bg-[var(--surface)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-[var(--accent)]"
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 200, damping: 28 }}
                    />
                  </div>
                  <p className="text-xs text-[var(--muted)] text-center mt-2">
                    {pct}% completado
                  </p>
                </div>
              )}

              {/* Save */}
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-[var(--fg)] text-[var(--bg)] rounded-2xl text-base font-medium disabled:opacity-50 transition-opacity"
                whileTap={{ scale: 0.97 }}
              >
                {saving ? "Guardando..." : "Guardar"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
