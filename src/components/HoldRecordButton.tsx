"use client";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  state: "idle" | "recording" | "done";
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
}

export function HoldRecordButton({ state, elapsed, onStart, onStop }: Props) {
  const isRecording = state === "recording";
  const isTouchRef = useRef(false);

  const handleStart = () => {
    if (state === "idle") onStart();
  };

  const handleStop = () => {
    if (state === "recording") onStop();
  };

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Pulse rings while recording */}
      <AnimatePresence>
        {isRecording && [1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ backgroundColor: "var(--accent)" }}
            initial={{ width: 64, height: 64, opacity: 0.35 }}
            animate={{ width: 64 + i * 28, height: 64 + i * 28, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.45, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      <motion.button
        onMouseDown={() => { if (!isTouchRef.current) handleStart(); }}
        onMouseUp={() => { if (!isTouchRef.current) handleStop(); }}
        onMouseLeave={() => { if (!isTouchRef.current) handleStop(); }}
        onTouchStart={(e) => { e.preventDefault(); isTouchRef.current = true; handleStart(); }}
        onTouchEnd={() => { isTouchRef.current = false; handleStop(); }}
        onTouchCancel={() => { isTouchRef.current = false; handleStop(); }}
        animate={isRecording
          ? { scale: 1.12, backgroundColor: "var(--danger)" }
          : { scale: 1, backgroundColor: "var(--accent)" }
        }
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
        style={{ boxShadow: isRecording ? "0 0 32px rgba(201,149,108,0.35)" : "0 4px 20px rgba(0,0,0,0.2)" }}
        aria-label={isRecording ? "Soltá para guardar" : "Mantené presionado para grabar"}
      >
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-0.5"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2.5" />
              </svg>
            </motion.div>
          ) : (
            <motion.svg
              key="mic"
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm-1 15.93V21h2v-2.07A8.001 8.001 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
