"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRecorder } from "@/lib/hooks/useRecorder";
import { useReflections } from "@/lib/hooks/useReflections";
import { useQuotes } from "@/lib/hooks/useQuotes";
import { ReflectionForm } from "@/components/ReflectionForm";
import { BottomNav } from "@/components/BottomNav";
import { HoldRecordButton } from "@/components/HoldRecordButton";

const PROMPTS = [
  "¿Qué pensamiento no podés soltar después de hoy?",
  "¿Qué frase resonó más en vos esta noche?",
  "¿Qué cambiaría si aplicaras lo que leíste?",
  "¿Con qué personaje o idea te identificaste?",
  "¿Qué pregunta te dejó el libro de hoy?",
  "¿Qué querrías recordar de esta lectura en diez años?",
  "¿Qué emoción despertó en vos esta lectura?",
];

const QUOTES = [
  { text: "Un libro es un sueño que tenés en tus manos.", author: "Neil Gaiman" },
  { text: "El lector vive mil vidas antes de morir.", author: "George R.R. Martin" },
  { text: "No hay mejor almohada que un buen libro.", author: "Charles Kingsley" },
  { text: "Los libros son espejos: solo ves en ellos lo que ya tenés dentro.", author: "Carlos Ruiz Zafón" },
  { text: "Leer es retirarse a pensar.", author: "Voltaire" },
  { text: "El libro es el único lugar donde la mente se detiene.", author: "Anónimo" },
  { text: "La lectura es una conversación con los mejores pensadores de la historia.", author: "Descartes" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Buenas noches";
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function getDate(): string {
  const d = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long",
  });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

function getDayIndex(len: number): number {
  return new Date().getDate() % len;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function RecentReflection() {
  const { reflections, loading } = useReflections();
  const latest = reflections[0];

  if (loading || !latest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.12)" }}
    >
      <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">Última reflexión</p>
      <p className="text-sm font-[family-name:var(--font-fraunces)] text-[var(--fg)] truncate">
        {latest.books?.title ?? <span className="italic text-[var(--muted)]">Sin libro</span>}
      </p>
      <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--muted)]">
        <span>{new Date(latest.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
        {latest.duration_seconds && <span>· {formatDuration(latest.duration_seconds)}</span>}
        {latest.tags.slice(0, 2).map(t => (
          <span key={t} className="px-1.5 py-0.5 rounded-full bg-[var(--border)] text-[var(--muted)]">{t}</span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { state, audioBlob, duration, elapsed, start, stop, reset } = useRecorder();
  const router = useRouter();
  const { quotes } = useQuotes();

  const combinedQuotes = useMemo(() => {
    const userQuotes = quotes.map((q) => ({
      text: q.quote_text,
      author: q.books
        ? `${q.books.title}${q.books.author ? ` (${q.books.author})` : ""}${q.page_number ? `, p. ${q.page_number}` : ""}`
        : "Mi cita",
    }));
    return [...userQuotes, ...QUOTES];
  }, [quotes]);

  const quote = combinedQuotes[getDayIndex(combinedQuotes.length)];
  const prompt = PROMPTS[getDayIndex(PROMPTS.length)];

  const handleSaved = () => {
    reset();
    router.push("/library");
  };

  if (state === "done" && audioBlob) {
    return (
      <motion.main
        className="min-h-screen flex flex-col px-5 pt-16 pb-36 max-w-md mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ReflectionForm audioBlob={audioBlob} duration={duration} onSaved={handleSaved} onCancel={reset} />
        <BottomNav />
      </motion.main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-5 pt-14 pb-36 max-w-md mx-auto w-full">

      {/* Greeting */}
      <motion.div
        className="mb-7"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-0.5">{getDate()}</p>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl text-[var(--fg)]">
          {getGreeting()}
        </h1>
      </motion.div>

      {/* Quote card */}
      <motion.div
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 mb-4"
        style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.10)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p className="font-[family-name:var(--font-fraunces)] text-[var(--accent)] text-3xl leading-none mb-3 select-none">❝</p>
        <p className="font-[family-name:var(--font-fraunces)] text-[var(--fg)] text-base leading-relaxed italic mb-3">
          {quote.text}
        </p>
        <p className="text-xs text-[var(--muted)]">— {quote.author}</p>
      </motion.div>

      {/* Reflection prompt */}
      <motion.div
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 mb-8"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-[10px] uppercase tracking-widest text-[var(--accent)] mb-1.5">Reflexión de esta noche</p>
        <p className="text-sm text-[var(--fg)] leading-relaxed">{prompt}</p>
      </motion.div>

      {/* Hold-to-record */}
      <motion.div
        className="flex flex-col items-center gap-4 mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <HoldRecordButton state={state} elapsed={elapsed} onStart={start} onStop={stop} />
        <AnimatePresence mode="wait">
          <motion.p
            key={state}
            className="text-xs text-[var(--muted)] text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {state === "recording"
              ? `Grabando… ${elapsed}s — soltá para guardar`
              : "Mantené presionado para capturar un pensamiento"}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Recent reflection */}
      <RecentReflection />

      <BottomNav />
    </main>
  );
}
