"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[80] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
          />
          <div className="fixed inset-0 z-[90] flex items-center justify-center px-6 pointer-events-none">
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-2xl pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            >
              <p className="font-[family-name:var(--font-fraunces)] text-lg text-[var(--fg)] mb-2">{title}</p>
              {description && (
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">{description}</p>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 text-sm border border-[var(--border)] text-[var(--muted)] rounded-xl hover:border-[var(--accent)] hover:text-[var(--fg)] transition-colors"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 text-sm font-medium border border-[var(--danger)]/40 text-[var(--danger)] rounded-xl hover:bg-[var(--danger)]/10 hover:border-[var(--danger)] transition-colors"
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
