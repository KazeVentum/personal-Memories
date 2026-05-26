"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRecorder } from "@/lib/hooks/useRecorder";
import { RecordButton } from "@/components/RecordButton";
import { ReflectionForm } from "@/components/ReflectionForm";
import { BottomNav } from "@/components/BottomNav";

export default function Home() {
  const { state, audioBlob, duration, elapsed, start, stop, reset } = useRecorder();

  if (state === "done" && audioBlob) {
    return (
      <motion.main
        className="min-h-screen flex flex-col px-5 pt-16 pb-36 max-w-md mx-auto w-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ReflectionForm audioBlob={audioBlob} duration={duration} onSaved={reset} onCancel={reset} />
        <BottomNav />
      </motion.main>
    );
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center px-6 pb-20">
      <div className="flex flex-col items-center gap-10 w-full max-w-sm">

        <motion.div
          className="text-center flex flex-col gap-3"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="font-[family-name:var(--font-fraunces)] text-4xl text-[var(--fg)]">
            Reflexiones
          </h1>
          <AnimatePresence mode="wait">
            <motion.p
              key={state}
              className="text-sm text-[var(--muted)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {state === "recording"
                ? `Grabando… ${elapsed}s`
                : "Grabá un pensamiento sobre lo que estás leyendo"}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        <RecordButton state={state} onStart={start} onStop={stop} />

        <AnimatePresence>
          {state === "idle" && (
            <motion.p
              className="text-xs text-[var(--accent)] tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              Tocá para grabar
            </motion.p>
          )}
        </AnimatePresence>

      </div>
      <BottomNav />
    </main>
  );
}
